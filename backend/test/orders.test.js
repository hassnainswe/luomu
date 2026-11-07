// Runs against the local (no-Supabase) catalog.
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

const test = require('node:test');
const assert = require('node:assert/strict');
const { createOrder, trackOrder } = require('../src/controllers/orderController');
const { products, allProducts } = require('../src/data/mockData');

const herbelle = products.find((p) => p.slug === 'herbelle-hair-oil');
const pack2 = herbelle.product_variants.find((v) => v.free_delivery);
const hidden = allProducts.find((p) => !p.is_active);

const call = async (body) => {
  const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
  await createOrder({ body: { contact_name: 'A', contact_phone: '03001234567', street_address: 'X', city: 'Lahore', ...body } }, res);
  return res;
};

test('ignores client-sent prices and charges PKR 250 delivery under the threshold', async () => {
  const res = await call({ items: [{ product_id: herbelle.id, unit_price_pkr: 1, quantity: 1 }], total_pkr: 1, delivery_pkr: 0 });
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.data.subtotal_pkr, 2250);
  assert.equal(res.body.data.delivery_pkr, 250);
  assert.equal(res.body.data.total_pkr, 2500);
  assert.match(res.body.data.order_number, /^LM-[0-9A-F]{10}$/);
});

test('pack of 2 ships free and applies voucher server-side', async () => {
  const res = await call({ items: [{ product_id: herbelle.id, variant_id: pack2.id, quantity: 1 }], voucher_code: 'welcome10', voucher_discount: 99999 });
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.data.delivery_pkr, 0);
  assert.equal(res.body.data.subtotal_pkr, 4400);
  assert.equal(res.body.data.discount_pkr, 440);
  assert.equal(res.body.data.total_pkr, 3960);
});

test('free delivery at PKR 4,000+ even without a pack', async () => {
  const res = await call({ items: [{ product_id: herbelle.id, quantity: 2 }] });
  assert.equal(res.body.data.subtotal_pkr, 4500);
  assert.equal(res.body.data.delivery_pkr, 0);
});

test('rejects unpriced/inactive products, bad quantities and bad vouchers', async () => {
  assert.equal((await call({ items: [{ product_id: hidden.id, quantity: 1 }] })).statusCode, 400);
  assert.equal((await call({ items: [{ product_id: herbelle.id, quantity: -3 }] })).statusCode, 400);
  assert.equal((await call({ items: [{ product_id: herbelle.id, quantity: 1 }], voucher_code: 'FAKE' })).statusCode, 400);
  assert.equal((await call({ items: [{ product_id: herbelle.id, quantity: 1 }], payment_method: 'CARD' })).statusCode, 400);
});

test('pack of 2 ships free even below PKR 4,000', async () => {
  const mask = allProducts.find((p) => p.slug === 'daily-grind-glow-face-mask');
  products.push({ ...mask, is_active: true }); // simulate it going live
  try {
    const pack = mask.product_variants.find((v) => v.free_delivery);
    const res = await call({ items: [{ product_id: mask.id, variant_id: pack.id, quantity: 1 }] });
    assert.equal(res.body.data.subtotal_pkr, 2600);
    assert.equal(res.body.data.delivery_pkr, 0);
    const single = await call({ items: [{ product_id: mask.id, quantity: 1 }] });
    assert.equal(single.body.data.delivery_pkr, 250);
  } finally {
    products.pop();
  }
});

test('emails the owner a summary with a WhatsApp link to the customer', async () => {
  const sent = [];
  const realFetch = global.fetch;
  global.fetch = async (url, opts) => { sent.push({ url, body: JSON.parse(opts.body) }); return { ok: true }; };
  process.env.RESEND_API_KEY = 'test';
  process.env.ORDER_NOTIFY_EMAIL = 'owner@example.com';
  try {
    const res = await call({ items: [{ product_id: herbelle.id, quantity: 1 }], contact_phone: '0300 1234567' });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].body.to, 'owner@example.com');
    assert.match(sent[0].body.subject, new RegExp(res.body.data.order_number));
    assert.match(sent[0].body.text, /TOTAL: PKR 2,500/);
    assert.match(sent[0].body.text, /wa\.me\/923001234567/);
  } finally {
    global.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.ORDER_NOTIFY_EMAIL;
  }
});

test('tracking needs the matching phone and hides the address', async () => {
  const placed = await call({ items: [{ product_id: herbelle.id, quantity: 1 }], contact_phone: '0300 1234567' });
  const num = placed.body.data.order_number;
  const track = async (body) => {
    const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
    await trackOrder({ body }, res);
    return res;
  };
  const ok = await track({ order_number: `#${num.toLowerCase()}`, phone: '+92 300 1234567' });
  assert.equal(ok.statusCode, 200);
  assert.equal(ok.body.data.status, 'PENDING');
  assert.equal(ok.body.data.order_items.length, 1);
  assert.equal(ok.body.data.street_address, undefined);
  assert.equal(ok.body.data.contact_phone, undefined);
  assert.equal((await track({ order_number: num, phone: '03009999999' })).statusCode, 404);
  assert.equal((await track({ order_number: 'LM-0000000000', phone: '03001234567' })).statusCode, 404);
});
