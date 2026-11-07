import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI, productsAPI } from '../lib/api';
import { formatPrice, PLACEHOLDER_IMAGE as PLACEHOLDER, SHIPPING_POLICY, RETURNS_POLICY, WHATSAPP_DISPLAY, whatsappLink } from '../lib/utils';
import ProductCard from '../components/ProductCard';


const PAYMENT_LABELS = {
  COD: 'Cash on Delivery',
  JAZZCASH: 'JazzCash / Easypaisa — we will send wallet details',
  EASYPAISA: 'JazzCash / Easypaisa — we will send wallet details',
  BANK: 'Bank Transfer — we will send bank details',
};

// Pre-filled WhatsApp message so the owner gets the whole order in one tap.
const orderMessage = (o) => [
  `Hi LUOMU, I placed order #${o.order_number}:`,
  ...(o.order_items || []).map((i) => `• ${i.quantity} × ${i.product_name}${i.variant_label ? ` (${i.variant_label})` : ''}`),
  `Total: ${formatPrice(o.total_pkr)} (${PAYMENT_LABELS[o.payment_method]?.split(' —')[0] || o.payment_method})`,
  `Name: ${o.contact_name}, ${o.city}`,
].join('\n');

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED'];

function getStatusStep(status) {
  const map = {
    PENDING: 0, CONFIRMED: 1,
    DISPATCHED: 2, DELIVERED: 3,
  };
  return map[status] ?? 0;
}

export default function ConfirmationPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    document.title = `Order ${orderNumber} Confirmed — LUOMU`;

    Promise.all([
      ordersAPI.getByNumber(orderNumber),
      productsAPI.getFeatured(),
    ])
      .then(([orderRes, featRes]) => {
        setOrder(orderRes.data.data);
        setFeatured(featRes.data.data?.slice(0, 4) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px var(--margin)' }}>
        <div className="skeleton" style={{ height: 40, width: '40%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '80%' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '120px var(--margin)' }}>
        <h2 className="headline-md" style={{ marginBottom: 16 }}>Order not found</h2>
        <Link to="/collections" className="btn btn--primary btn--lg">Browse Collections</Link>
      </div>
    );
  }

  const statusStep = getStatusStep(order.status);

  return (
    <main>
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--color-primary)', color: 'white', textAlign: 'center',
        padding: '10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        Free Delivery Across Pakistan on Orders Over PKR 4,000 or any Pack of 2 · Cash on Delivery · WhatsApp Ordering Available
      </div>

      {/* ── Header ──────────────────────────────────────────── */}
      <section style={{ padding: '48px 0', borderBottom: '1px solid var(--color-tertiary)' }}>
        <div className="container">
          <div className="wrap-md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 8 }}>
                · Order Confirmed · #{order.order_number}
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400 }}>
                Shukriya, {order.contact_name.split(' ')[0]}.
              </h1>
              <p className="body-md" style={{ color: 'var(--color-secondary)', marginTop: 12, maxWidth: 560 }}>
                Your order has been received. We will confirm it with you on WhatsApp, then pack it by hand
                and hand it to the courier.
              </p>
            </div>
            <div className="wrap-md" style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
              <button className="btn btn--outline btn--sm" onClick={() => window.print()}>
                📄 Print Receipt
              </button>
              <Link to={`/track?order=${order.order_number}`} className="btn btn--outline btn--sm">
                Track This Order
              </Link>
              <Link to="/collections" className="btn btn--primary btn--sm">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dispatch Pipeline + Invoice ─────────────────────── */}
      <section style={{ padding: '48px 0' }}>
        <div className="stack-md container" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem', alignItems: 'start' }}>

          {/* Left — Dispatch tracking */}
          <div>
            <div style={{ border: '1px solid var(--color-tertiary)', padding: '24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 6 }}>Order Status</p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400 }}>Where Your Order Is</h2>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-secondary)' }}>
                  WAYBILL SHARED ON DISPATCH
                </span>
              </div>

              {/* Status steps */}
              <div style={{ display: 'flex', gap: 0, alignItems: 'center', marginBottom: 24 }}>
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i <= statusStep ? 'var(--color-primary)' : 'var(--color-tertiary)',
                        color: i <= statusStep ? 'white' : 'var(--color-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {i <= statusStep ? '✓' : i + 1}
                      </div>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', color: i <= statusStep ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
                        {step}
                      </p>
                      {i === 0 && <p style={{ fontSize: 9, color: 'var(--color-secondary)' }}>Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 1, background: i < statusStep ? 'var(--color-primary)' : 'var(--color-tertiary)', margin: '0 8px', marginBottom: 24 }} />
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* Customer-initiated WhatsApp confirmation (no automated messaging is wired up) */}
            <div style={{ border: '1px solid var(--color-tertiary)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 4 }}>Faster Confirmation</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 400 }}>Message us your order on WhatsApp</p>
                </div>
              </div>

              <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', padding: '16px', borderRadius: 0 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, background: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>L</div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>LUOMU</p>
                    <p style={{ fontSize: 10, color: '#666' }}>{WHATSAPP_DISPLAY}</p>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '12px', fontSize: 12, lineHeight: 1.7 }}>
                  <p><strong>LUOMU</strong> — Order Received</p>
                  <p style={{ marginTop: 6 }}>Salaam <strong>{order.contact_name.split(' ')[0]}</strong>, your order <strong>#{order.order_number}</strong> has been received. Our team will confirm it with you before dispatch.</p>
                  <div style={{ marginTop: 8, borderTop: '1px solid #e0e0e0', paddingTop: 8 }}>
                    <p>Payable Amount: <strong>{formatPrice(order.total_pkr)} ({PAYMENT_LABELS[order.payment_method] || order.payment_method})</strong></p>
                    <p>Destination: <strong>{order.city}</strong></p>
                    <p>Estimated Delivery: <strong>4 – 8 Working Days</strong></p>
                  </div>
                </div>
              </div>

              <a
                href={whatsappLink(orderMessage(order))}
                target="_blank"
                rel="noreferrer"
                className="btn btn--primary btn--sm"
                style={{ marginTop: 12 }}
              >
                📱 Open in WhatsApp
              </a>
            </div>

            {/* Delivery dossier */}
            <div style={{ border: '1px solid var(--color-tertiary)', padding: '20px', marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400 }}>Delivery Details</h3>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
                  {order.province || 'Pakistan'}
                </span>
              </div>
              <div className="stack-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                <div>
                  <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 6 }}>Delivery Destination</p>
                  <p style={{ fontWeight: 600 }}>{order.contact_name}</p>
                  <p>{order.street_address}</p>
                  {order.area && <p>{order.area}</p>}
                  <p>{order.city}{order.postal_code ? `, ${order.postal_code}` : ''}</p>
                  <p style={{ marginTop: 4 }}>{order.contact_phone}</p>
                </div>
                {order.rider_note && (
                  <div>
                    <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 6 }}>Rider Special Handling</p>
                    <p style={{ fontStyle: 'italic', fontSize: 12 }}>"{order.rider_note}"</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', border: '1px solid var(--color-tertiary)' }}>Safe Drop Off</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', border: '1px solid var(--color-tertiary)' }}>COD Available</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — Invoice */}
          <div style={{ border: '1px solid var(--color-tertiary)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Luomu</p>
                <p style={{ fontSize: 10, color: 'var(--color-secondary)' }}>THE SCIENCE BEHIND NATURAL WELLNESS</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, color: 'var(--color-secondary)' }}>INVOICE #</p>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{order.order_number}</p>
                <p style={{ fontSize: 11, color: 'var(--color-secondary)', marginTop: 2 }}>
                  {new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 10 }}>Items Ordered</p>

            {order.order_items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-tertiary)' }}>
                <img
                  src={item.products?.primary_image_url || PLACEHOLDER}
                  alt={item.product_name}
                  style={{ width: 48, height: 48, objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{item.product_name}</p>
                  {item.variant_label && <p style={{ fontSize: 11, color: 'var(--color-secondary)', marginTop: 2 }}>{item.variant_label}</p>}
                  <p style={{ fontSize: 11, color: 'var(--color-secondary)', marginTop: 2 }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                  {formatPrice(item.line_total_pkr)}
                </p>
              </div>
            ))}

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--color-secondary)' }}>Subtotal</span>
                <span>{formatPrice(order.subtotal_pkr)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--color-secondary)' }}>Standard Courier Delivery</span>
                <span style={{ color: order.delivery_pkr === 0 ? 'var(--color-success)' : 'inherit' }}>
                  {order.delivery_pkr === 0 ? 'WAIVED/FREE' : formatPrice(order.delivery_pkr)}
                </span>
              </div>
              {order.discount_pkr > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--color-secondary)' }}>Voucher Discount</span>
                  <span>−{formatPrice(order.discount_pkr)}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, borderTop: '1px solid var(--color-tertiary)', paddingTop: 12 }}>
              <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 6 }}>Amount Payable at Doorstep</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400 }}>
                {formatPrice(order.total_pkr)}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-secondary)', marginTop: 4 }}>
                Cash on Delivery (direct change appreciated)
              </p>
            </div>

            <div style={{ marginTop: 16, padding: '12px', background: 'var(--color-canvas)', border: '1px solid var(--color-tertiary)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Selected Settlement Method</p>
              <p style={{ fontSize: 13 }}>
                ◉ {PAYMENT_LABELS[order.payment_method] || order.payment_method}
              </p>
              {order.payment_method !== 'COD' && (
                <p style={{ fontSize: 12, marginTop: 8, color: 'var(--color-secondary)', lineHeight: 1.6 }}>
                  Please don't pay yet. We will confirm your order on WhatsApp first and then send you the payment details.
                </p>
              )}
            </div>

            <button
              className="btn btn--primary btn--full btn--sm"
              style={{ marginTop: 16 }}
              onClick={() => window.print()}
            >
              ↓ Download Digital Receipt (PDF)
            </button>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-tertiary)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🌿 Shipping &amp; Returns</p>
              <p style={{ fontSize: 12, color: 'var(--color-secondary)', lineHeight: 1.6 }}>
                {SHIPPING_POLICY} {RETURNS_POLICY}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ritual Steps ─────────────────────────────────────── */}
      <section style={{ padding: '48px 0', background: 'var(--color-canvas)', borderTop: '1px solid var(--color-tertiary)' }}>
        <div className="container">
          <div className="stack-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { num: '01', title: 'Check Your Parcel', desc: 'Check your order when it arrives. If an item is wrong or damaged, send us a photo on WhatsApp so we can replace it.' },
              { num: '02', title: 'Follow the Ritual', desc: 'Each product page lists how to use it. Natural oils have no silicones, so a second shampoo is normal.' },
              { num: '03', title: 'We Are Here to Help', desc: `Questions about your order or which product suits you? Message us on WhatsApp at ${WHATSAPP_DISPLAY}.` },
            ].map((s) => (
              <div key={s.num}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 14,
                }}>
                  {s.num}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recommended Companions ───────────────────────────── */}
      {featured.length > 0 && (
        <section className="section" style={{ borderTop: '1px solid var(--color-tertiary)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
              <div>
                <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 6 }}>Synergistic Formulations</p>
                <h2 className="headline-md">You May Also Like</h2>
              </div>
              <Link to="/collections" className="btn btn--ghost">Explore All Formulations →</Link>
            </div>
            <div className="product-grid">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
