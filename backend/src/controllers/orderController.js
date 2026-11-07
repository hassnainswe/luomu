const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { supabase, isConfigured, writesUnavailable } = require('../config/supabase');
const mockData = require('../data/mockData');
const { notifyOwner } = require('../notify');

const FREE_DELIVERY_THRESHOLD = 4000; // also free whenever the cart has a Pack of 2 (variant.free_delivery)
const DELIVERY_FEE = 250;
const MAX_QTY_PER_LINE = 20;
const PAYMENT_METHODS = ['COD', 'JAZZCASH', 'EASYPAISA', 'BANK'];

// 40 random bits: order numbers double as the lookup key for the confirmation page, so they must not be guessable.
const generateOrderNumber = () => `LM-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

const httpError = (status, message) => Object.assign(new Error(message), { status });

/**
 * Price every line from the catalog — never trust client-sent prices.
 */
const priceItems = async (items) => {
  let catalog;
  if (isConfigured && supabase) {
    const ids = [...new Set(items.map((i) => i.product_id))];
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price_pkr, is_active, product_variants ( id, label, price_pkr, free_delivery )')
      .in('id', ids);
    if (error) throw httpError(503, 'Catalog unavailable, please try again.');
    catalog = data;
  } else {
    catalog = mockData.products;
  }

  let freeDelivery = false;
  const lines = items.map((i) => {
    const product = catalog.find((p) => p.id === i.product_id && p.is_active !== false);
    if (!product) throw httpError(400, `${i.product_name || 'An item'} is no longer available.`);

    const variant = i.variant_id ? product.product_variants?.find((v) => v.id === i.variant_id) : null;
    if (i.variant_id && !variant) throw httpError(400, `Selected size of ${product.name} is no longer available.`);

    const qty = Number(i.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      throw httpError(400, `Invalid quantity for ${product.name}.`);
    }

    if (variant?.free_delivery) freeDelivery = true;
    const unit = variant ? variant.price_pkr : product.price_pkr;
    if (!(unit > 0)) throw httpError(400, `${product.name} is not available for purchase yet.`);

    return {
      id: uuidv4(),
      product_id: product.id,
      variant_id: variant?.id || null,
      product_name: product.name,
      variant_label: variant?.label || null,
      unit_price_pkr: unit,
      quantity: qty,
      line_total_pkr: unit * qty,
    };
  });
  return { lines, freeDelivery };
};

const findVoucher = async (code) => {
  const upper = String(code || '').toUpperCase().trim();
  if (!upper) return null;
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', upper)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw httpError(503, 'Voucher service unavailable, please try again.');
    return data;
  }
  return mockData.vouchers.find((v) => v.code === upper) || null;
};

const voucherDiscount = (voucher, subtotal) => {
  const raw = voucher.type === 'percentage' ? Math.round((subtotal * voucher.value) / 100) : voucher.value;
  return Math.min(raw, subtotal);
};

/**
 * POST /api/orders
 * Create a new order (guest checkout). All money is computed server-side.
 */
const createOrder = async (req, res) => {
  if (writesUnavailable) {
    return res.status(503).json({ success: false, message: 'Store is temporarily unavailable. Please order on WhatsApp.' });
  }
  try {
    const {
      contact_name,
      contact_phone,
      contact_email,
      whatsapp_updates = true,
      street_address,
      area,
      city,
      province,
      postal_code,
      rider_note,
      voucher_code,
      payment_method = 'COD',
      items,
    } = req.body;

    if (!contact_name || !contact_phone || !street_address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: contact_name, contact_phone, street_address, city.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    if (!PAYMENT_METHODS.includes(payment_method)) {
      return res.status(400).json({ success: false, message: 'Unsupported payment method.' });
    }

    const { lines: enrichedItems, freeDelivery } = await priceItems(items);
    const subtotal = enrichedItems.reduce((sum, i) => sum + i.line_total_pkr, 0);
    const delivery = freeDelivery || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

    let discount = 0;
    let appliedVoucher = null;
    if (voucher_code) {
      const v = await findVoucher(voucher_code);
      if (!v || (v.min_subtotal && subtotal < v.min_subtotal)) {
        return res.status(400).json({ success: false, message: 'Voucher is not valid for this order.' });
      }
      discount = voucherDiscount(v, subtotal);
      appliedVoucher = v.code;
    }

    const orderRow = {
      order_number: generateOrderNumber(),
      status: 'PENDING',
      contact_name,
      contact_phone,
      contact_email: contact_email || null,
      whatsapp_updates,
      street_address,
      area: area || null,
      city,
      province: province || null,
      postal_code: postal_code || null,
      rider_note: rider_note || null,
      subtotal_pkr: subtotal,
      delivery_pkr: delivery,
      discount_pkr: discount,
      total_pkr: subtotal + delivery - discount,
      voucher_code: appliedVoucher,
      voucher_discount: discount,
      payment_method,
      payment_status: 'PENDING',
    };

    if (isConfigured && supabase) {
      // No in-memory fallback: a customer must never get a confirmation for an order we didn't store.
      const { data: order, error: orderErr } = await supabase.from('orders').insert(orderRow).select().single();
      if (orderErr) throw orderErr;

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(enrichedItems.map((i) => ({ ...i, order_id: order.id })));
      if (itemsErr) {
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsErr;
      }

      const saved = { ...order, order_items: enrichedItems };
      await notifyOwner(saved); // awaited: serverless may freeze after the response
      return res.status(201).json({ success: true, data: saved });
    }

    // Local mode (no Supabase): in-memory store, lost on restart.
    const mockOrder = { id: uuidv4(), ...orderRow, created_at: new Date().toISOString(), order_items: enrichedItems };
    mockData.orders.unshift(mockOrder);
    await notifyOwner(mockOrder);
    return res.status(201).json({ success: true, data: mockOrder });
  } catch (err) {
    if (err.status && err.status < 500) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error('[createOrder]', err);
    return res.status(err.status || 500).json({ success: false, message: 'Failed to place order. Please try again.' });
  }
};

/**
 * GET /api/orders/:orderNumber
 */
const getOrderByNumber = async (req, res) => {
  const { orderNumber } = req.params;

  if (isConfigured && supabase) {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id, product_id, variant_id, product_name,
          variant_label, unit_price_pkr, quantity, line_total_pkr
        )
      `)
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error) {
      console.error('[getOrderByNumber]', error);
      return res.status(500).json({ success: false, message: 'Could not load order.' });
    }
    if (order) return res.json({ success: true, data: order });
  } else {
    const order = mockData.orders.find((o) => o.order_number === orderNumber);
    if (order) return res.json({ success: true, data: order });
  }

  return res.status(404).json({ success: false, message: 'Order not found.' });
};

// Compare phones by their last 10 digits so 03001234567, +92 300 1234567 and 923001234567 all match.
const samePhone = (a, b) => {
  const d = (x) => String(x || '').replace(/\D/g, '').slice(-10);
  return d(a).length === 10 && d(a) === d(b);
};

/**
 * POST /api/orders/track  { order_number, phone }
 * Customer-facing status lookup. Needs the phone used at checkout; returns no address or contact details.
 */
const trackOrder = async (req, res) => {
  const orderNumber = String(req.body.order_number || '').trim().toUpperCase().replace(/^#/, '');
  const { phone } = req.body;
  if (!orderNumber || !phone) {
    return res.status(400).json({ success: false, message: 'Enter your order number and phone number.' });
  }

  let order = null;
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('order_number, status, contact_phone, city, payment_method, subtotal_pkr, delivery_pkr, discount_pkr, total_pkr, courier, waybill_number, created_at, dispatched_at, delivered_at, order_items ( product_name, variant_label, quantity, line_total_pkr )')
      .eq('order_number', orderNumber)
      .maybeSingle();
    if (error) {
      console.error('[trackOrder]', error);
      return res.status(500).json({ success: false, message: 'Could not look up your order. Please try again.' });
    }
    order = data;
  } else {
    order = mockData.orders.find((o) => o.order_number === orderNumber) || null;
  }

  // Same message for "no such order" and "wrong phone", so the endpoint can't confirm order numbers.
  if (!order || !samePhone(order.contact_phone, phone)) {
    return res.status(404).json({ success: false, message: 'No order found with that number and phone.' });
  }

  return res.json({
    success: true,
    data: {
      order_number: order.order_number,
      status: order.status,
      city: order.city,
      payment_method: order.payment_method,
      subtotal_pkr: order.subtotal_pkr,
      delivery_pkr: order.delivery_pkr,
      discount_pkr: order.discount_pkr,
      total_pkr: order.total_pkr,
      courier: order.courier || null,
      waybill_number: order.waybill_number || null,
      created_at: order.created_at,
      dispatched_at: order.dispatched_at || null,
      delivered_at: order.delivered_at || null,
      order_items: (order.order_items || []).map(({ product_name, variant_label, quantity, line_total_pkr }) => ({
        product_name, variant_label, quantity, line_total_pkr,
      })),
    },
  });
};

/**
 * POST /api/orders/validate-voucher
 */
const validateVoucher = async (req, res) => {
  const { code } = req.body;
  const subtotal = Number(req.body.subtotal) || 0;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Voucher code is required.' });
  }

  try {
    const v = await findVoucher(code);
    if (!v) {
      return res.status(400).json({ success: false, message: 'Invalid or expired voucher code.' });
    }
    if (v.min_subtotal && subtotal < v.min_subtotal) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of PKR ${v.min_subtotal.toLocaleString()} required for this voucher.`,
      });
    }
    return res.json({
      success: true,
      data: {
        code: v.code,
        discount_pkr: voucherDiscount(v, subtotal),
        description: `${v.value}${v.type === 'percentage' ? '%' : ' PKR'} discount applied`,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createOrder,
  getOrderByNumber,
  trackOrder,
  validateVoucher,
  // exported for tests
  priceItems,
  voucherDiscount,
};
