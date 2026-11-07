// Emails the owner about each new order via Resend (resend.com, free tier).
// No-op until RESEND_API_KEY and ORDER_NOTIFY_EMAIL are set. Never throws: a failed email must not fail the order.

// 03001234567 / +92 300 1234567 → 923001234567 for a wa.me link.
const toWhatsApp = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  return d.startsWith('0') ? `92${d.slice(1)}` : d;
};

const PAYMENT = { COD: 'Cash on Delivery', JAZZCASH: 'JazzCash / Easypaisa', EASYPAISA: 'JazzCash / Easypaisa', BANK: 'Bank Transfer' };

const notifyOwner = async (order) => {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!key || !to) return;

  const items = order.order_items
    .map((i) => `• ${i.quantity} × ${i.product_name}${i.variant_label ? ` (${i.variant_label})` : ''}: PKR ${i.line_total_pkr.toLocaleString()}`)
    .join('\n');
  const address = [order.street_address, order.area, order.city, order.province, order.postal_code].filter(Boolean).join(', ');
  const greeting = `Salaam ${order.contact_name}, this is LUOMU about your order #${order.order_number}.`;

  const text = [
    `New order ${order.order_number}`,
    '',
    items,
    '',
    `Subtotal: PKR ${order.subtotal_pkr.toLocaleString()}`,
    `Delivery: ${order.delivery_pkr ? `PKR ${order.delivery_pkr}` : 'FREE'}`,
    order.discount_pkr ? `Discount (${order.voucher_code}): -PKR ${order.discount_pkr.toLocaleString()}` : null,
    `TOTAL: PKR ${order.total_pkr.toLocaleString()}`,
    `Payment: ${PAYMENT[order.payment_method] || order.payment_method}`,
    '',
    `Customer: ${order.contact_name}`,
    `Phone: ${order.contact_phone}`,
    order.contact_email ? `Email: ${order.contact_email}` : null,
    `Address: ${address}`,
    order.rider_note ? `Note: ${order.rider_note}` : null,
    '',
    `Confirm on WhatsApp: https://wa.me/${toWhatsApp(order.contact_phone)}?text=${encodeURIComponent(greeting)}`,
  ].filter((l) => l !== null).join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.ORDER_NOTIFY_FROM || 'LUOMU Orders <onboarding@resend.dev>',
        to,
        subject: `🛍 New order ${order.order_number}: PKR ${order.total_pkr.toLocaleString()} (${order.city})`,
        text,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error('[notifyOwner]', res.status, await res.text());
  } catch (err) {
    console.error('[notifyOwner]', err.message);
  }
};

module.exports = { notifyOwner, toWhatsApp };
