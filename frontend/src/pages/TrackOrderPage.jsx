import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../lib/api';
import { formatPrice, whatsappLink } from '../lib/utils';

const STEPS = [
  { key: 'PENDING', label: 'Placed', note: 'We have your order and will confirm it with you on WhatsApp.' },
  { key: 'CONFIRMED', label: 'Confirmed', note: 'Confirmed and being packed by hand.' },
  { key: 'DISPATCHED', label: 'Dispatched', note: 'With the courier. Delivery in 4–8 working days.' },
  { key: 'DELIVERED', label: 'Delivered', note: 'Delivered. We hope you love it!' },
];

export default function TrackOrderPage() {
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Track Your Order — LUOMU';
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await ordersAPI.track(orderNumber, phone);
      setOrder(res.data.data);
    } catch (err) {
      setError(err.message || 'Could not find that order.');
    } finally {
      setLoading(false);
    }
  };

  const cancelled = order?.status === 'CANCELLED';
  const stepIndex = Math.max(0, STEPS.findIndex((s) => s.key === order?.status));

  return (
    <main>
      <section className="section section--lg">
        <div className="container container--narrow">
          <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 12 }}>Customer Care</p>
          <h1 className="headline-lg" style={{ marginBottom: 12 }}>Track Your Order</h1>
          <p className="body-md" style={{ color: 'var(--color-secondary)', marginBottom: 32 }}>
            Enter your order number (e.g. LM-4F2A9C1B7D) and the phone number you ordered with.
          </p>

          <form onSubmit={submit} className="stack-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end', marginBottom: 40 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field__label" htmlFor="track-order">Order number</label>
              <input id="track-order" className="field__input" value={orderNumber} required
                onChange={(e) => setOrderNumber(e.target.value)} placeholder="LM-…" autoComplete="off" />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field__label" htmlFor="track-phone">Phone number</label>
              <input id="track-phone" className="field__input" value={phone} required type="tel" inputMode="tel"
                onChange={(e) => setPhone(e.target.value)} placeholder="03XX XXXXXXX" autoComplete="tel" />
            </div>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Checking…' : 'Track'}
            </button>
          </form>

          {error && (
            <p role="alert" style={{ color: 'var(--color-error, #b00020)', fontSize: 13, marginBottom: 24 }}>
              {error} Need help? <a href={whatsappLink(`Hi LUOMU! I need help tracking my order${orderNumber ? ` #${orderNumber.trim()}` : ''}.`)} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Message us on WhatsApp</a>.
            </p>
          )}

          {order && (
            <div aria-live="polite" style={{ border: '1px solid var(--color-tertiary)', padding: 24 }}>
              <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 4 }}>
                Order #{order.order_number} · {order.city}
              </p>

              {cancelled ? (
                <p style={{ fontSize: 15, margin: '12px 0 20px' }}>
                  This order was cancelled. Questions? <a href={whatsappLink(`Hi LUOMU, about order #${order.order_number}`)} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Message us</a>.
                </p>
              ) : (
                <>
                  <ol style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, margin: '20px 0' }}>
                    {STEPS.map((s, i) => (
                      <li key={s.key} style={{ textAlign: 'center' }} aria-current={i === stepIndex ? 'step' : undefined}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', margin: '0 auto 8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                          background: i <= stepIndex ? 'var(--color-primary)' : 'var(--color-tertiary)',
                          color: i <= stepIndex ? 'white' : 'var(--color-secondary)',
                        }}>{i < stepIndex ? '✓' : i + 1}</div>
                        <span style={{ fontSize: 11, fontWeight: i === stepIndex ? 700 : 500 }}>{s.label}</span>
                      </li>
                    ))}
                  </ol>
                  <p style={{ fontSize: 14, marginBottom: 16 }}>{STEPS[stepIndex].note}</p>
                  {order.waybill_number && (
                    <p style={{ fontSize: 13, marginBottom: 16 }}>
                      Courier: <strong>{order.courier || '—'}</strong> · Tracking no: <strong>{order.waybill_number}</strong>
                    </p>
                  )}
                </>
              )}

              <div style={{ borderTop: '1px solid var(--color-tertiary)', paddingTop: 16 }}>
                {order.order_items.map((i) => (
                  <div key={`${i.product_name}-${i.variant_label}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                    <span>{i.quantity} × {i.product_name}{i.variant_label ? ` (${i.variant_label})` : ''}</span>
                    <span>{formatPrice(i.line_total_pkr)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, marginTop: 8 }}>
                  <span>Total</span>
                  <span>{formatPrice(order.total_pkr)}</span>
                </div>
              </div>
            </div>
          )}

          <p style={{ fontSize: 13, color: 'var(--color-secondary)', marginTop: 32 }}>
            Can't find your order number? It's on your order confirmation page, or <a href={whatsappLink(`Hi LUOMU! I need help tracking my order${orderNumber ? ` #${orderNumber.trim()}` : ''}.`)} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>ask us on WhatsApp</a>.{' '}
            <Link to="/faq" style={{ textDecoration: 'underline' }}>Read the FAQ</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
