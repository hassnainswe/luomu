import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../lib/api';
import { formatPrice, deliveryFor, PLACEHOLDER_IMAGE as PLACEHOLDER, SHIPPING_POLICY, RETURNS_POLICY, whatsappLink } from '../lib/utils';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Gujranwala', 'Peshawar', 'Quetta', 'Sialkot',
  'Bahawalpur', 'Sargodha', 'Hyderabad', 'Abbottabad', 'Other',
];


function Step({ num, title, isActive }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: isActive ? 'var(--color-primary)' : 'var(--color-tertiary)',
        color: isActive ? 'white' : 'var(--color-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700,
      }}>
        {num}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: isActive ? 'var(--color-primary)' : 'var(--color-secondary)',
      }}>{title}</span>
    </div>
  );
}

function FormField({ label, id, error, children }) {
  return (
    <div className="field">
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      {children}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.unit_price_pkr * i.quantity, 0);

  const [form, setForm] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    whatsapp_updates: true,
    street_address: '',
    area: '',
    city: '',
    province: '',
    postal_code: '',
    rider_note: '',
    payment_method: 'COD',
  });
  const [errors, setErrors] = useState({});
  const [voucher, setVoucher] = useState('');
  const [voucherData, setVoucherData] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const delivery = deliveryFor(subtotal, items);
  const discount = voucherData?.discount_pkr || 0;
  const total = subtotal + delivery - discount;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.contact_name.trim()) e.contact_name = 'Name is required.';
    if (!form.contact_phone.trim()) e.contact_phone = 'Phone number is required.';
    if (!/^[\d\s\+\-]{10,15}$/.test(form.contact_phone.trim())) e.contact_phone = 'Enter a valid phone number.';
    if (!form.street_address.trim()) e.street_address = 'Street address is required.';
    if (!form.city) e.city = 'City is required.';
    return e;
  };

  const applyVoucher = async () => {
    if (!voucher.trim()) return;
    setVoucherLoading(true);
    try {
      const res = await ordersAPI.validateVoucher(voucher.trim(), subtotal);
      setVoucherData(res.data.data);
      toast.success(res.data.data.description);
    } catch (err) {
      toast.error(err.message || 'Invalid voucher code.');
      setVoucherData(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your bag is empty.');
      return;
    }

    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        subtotal_pkr: subtotal,
        delivery_pkr: delivery,
        discount_pkr: discount,
        total_pkr: total,
        voucher_code: voucherData?.code || null,
        voucher_discount: discount,
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id || null,
          product_name: i.product_name,
          variant_label: i.variant_label || null,
          unit_price_pkr: i.unit_price_pkr,
          quantity: i.quantity,
        })),
      };

      const res = await ordersAPI.create(payload);
      clearCart();
      navigate(`/order-confirmation/${res.data.data.order_number}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '120px var(--margin)' }}>
        <h2 className="headline-md" style={{ marginBottom: 16 }}>Your bag is empty</h2>
        <p style={{ color: 'var(--color-secondary)', marginBottom: 24 }}>
          Add some formulations before checking out.
        </p>
        <Link to="/collections" className="btn btn--primary btn--lg">
          Explore Formulations
        </Link>
      </div>
    );
  }

  return (
    <main>
      {/* ── Top Banner ──────────────────────────────────────── */}
      <div style={{
        background: 'var(--color-primary)', color: 'white', textAlign: 'center',
        padding: '10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        Free Delivery Across Pakistan on Orders above PKR 4,000 or any Pack of 2
      </div>

      {/* ── Logo + Steps ──────────────────────────────────── */}
      <div style={{ padding: '24px 0', borderBottom: '1px solid var(--color-tertiary)', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Luomu
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
            Botanical Apothecary
          </div>
        </Link>
        <div className="checkout-steps" style={{ display: 'flex', justifyContent: 'center', gap: 32, alignItems: 'center' }}>
          <Step num="1" title="Cart" isActive={false} />
          <div style={{ height: 1, width: 40, background: 'var(--color-tertiary)' }} />
          <Step num="2" title="Dispatch & Checkout" isActive={true} />
          <div style={{ height: 1, width: 40, background: 'var(--color-tertiary)' }} />
          <Step num="3" title="Confirmation" isActive={false} />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="stack-md" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 0, maxWidth: 1200, margin: '0 auto' }}>

          {/* Left — Form */}
          <div style={{ padding: '40px 48px 40px 24px', borderRight: '1px solid var(--color-tertiary)' }}>

            {/* Accelerated Express */}
            <div style={{ marginBottom: 32 }}>
              <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 12 }}>Pay by Mobile Wallet</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'JAZZCASH', sub: 'Details via WhatsApp' },
                  { label: 'EASYPAISA', sub: 'Details via WhatsApp' },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => set('payment_method', opt.label)}
                    style={{
                      padding: '12px', border: '1px solid var(--color-tertiary)',
                      background: form.payment_method === opt.label ? 'var(--color-canvas)' : 'white',
                      cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{opt.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-secondary)', marginTop: 2 }}>{opt.sub}</p>
                  </button>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-secondary)', margin: '12px 0' }}>
                OR STANDARD CHECKOUT
              </p>
            </div>

            {/* Step 01 — Consignee */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 }}>Consignee Contact</h2>
                <span className="label-caps" style={{ color: 'var(--color-secondary)' }}>Step 01</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormField label="Mobile Number or Email" id="contact_phone" error={errors.contact_phone}>
                  <input
                    id="contact_phone"
                    className="field__input"
                    type="tel"
                    placeholder="+92 3XX XXXXXXX or name@example.com"
                    value={form.contact_phone}
                    onChange={(e) => set('contact_phone', e.target.value)}
                  />
                </FormField>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.whatsapp_updates}
                    onChange={(e) => set('whatsapp_updates', e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  Receive order updates on WhatsApp.
                </label>
              </div>
            </div>

            {/* Step 02 — Delivery Address */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 }}>Delivery Address</h2>
                <span className="label-caps" style={{ color: 'var(--color-secondary)' }}>Step 02</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormField label="Full Recipient Name" id="contact_name" error={errors.contact_name}>
                  <input
                    id="contact_name"
                    className="field__input"
                    type="text"
                    placeholder="Full name as on ID"
                    value={form.contact_name}
                    onChange={(e) => set('contact_name', e.target.value)}
                  />
                </FormField>

                <FormField label="House / Street Address" id="street_address" error={errors.street_address}>
                  <input
                    id="street_address"
                    className="field__input"
                    type="text"
                    placeholder="House no., Street, Block"
                    value={form.street_address}
                    onChange={(e) => set('street_address', e.target.value)}
                  />
                </FormField>

                <FormField label="Sector, Phase or Area" id="area">
                  <input
                    id="area"
                    className="field__input"
                    type="text"
                    placeholder="DHA Phase 5, Block G (or Clifton Block 4 / F-8/2)"
                    value={form.area}
                    onChange={(e) => set('area', e.target.value)}
                  />
                </FormField>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormField label="City Hub" id="city" error={errors.city}>
                    <select
                      id="city"
                      className="field__select"
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                    >
                      <option value="">Select city</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormField>

                  <FormField label="Postal Code" id="postal_code">
                    <input
                      id="postal_code"
                      className="field__input"
                      type="text"
                      placeholder="54000"
                      value={form.postal_code}
                      onChange={(e) => set('postal_code', e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Rider Instructions & Landmark" id="rider_note">
                  <input
                    id="rider_note"
                    className="field__input"
                    type="text"
                    placeholder="e.g. Near Phase 5 Mosque, ring doorbell"
                    value={form.rider_note}
                    onChange={(e) => set('rider_note', e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            {/* Step 03 — Delivery Method */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 }}>Delivery Method</h2>
                <span className="label-caps" style={{ color: 'var(--color-secondary)' }}>Step 03</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                border: '1px solid var(--color-tertiary)', padding: '16px',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>🚚</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>Standard Courier Delivery</p>
                    <p style={{ fontSize: 11, color: 'var(--color-secondary)', marginTop: 2 }}>{SHIPPING_POLICY}</p>
                  </div>
                </div>
                <p style={{ fontWeight: 600, color: delivery === 0 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                  {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                </p>
              </div>
            </div>

            {/* Step 04 — Payment */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 }}>Payment Selection</h2>
                <span className="label-caps" style={{ color: 'var(--color-secondary)' }}>Step 04</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { value: 'COD', label: 'Cash on Delivery (COD)', sub: 'Pay the courier in cash when your parcel arrives.', badge: 'STANDARD' },
                  // shortcut: wallet payments are confirmed manually over WhatsApp; integrate a gateway API for automatic capture.
                  { value: 'JAZZCASH', label: 'JazzCash / Easypaisa', sub: 'We will WhatsApp you our wallet details; your order ships once payment is received.', badge: 'Wallet' },
                  { value: 'BANK', label: 'Bank Transfer', sub: 'We will confirm your order on WhatsApp and send our bank details; your order ships once payment is received.', badge: 'Bank' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      border: `1px solid ${form.payment_method === opt.value ? 'var(--color-primary)' : 'var(--color-tertiary)'}`,
                      padding: '16px', cursor: 'pointer',
                      background: form.payment_method === opt.value ? 'var(--color-canvas)' : 'white',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      <input
                        type="radio"
                        name="payment_method"
                        value={opt.value}
                        checked={form.payment_method === opt.value}
                        onChange={() => set('payment_method', opt.value)}
                        style={{ marginTop: 2 }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--color-secondary)', marginTop: 2 }}>{opt.sub}</p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '2px 8px', border: '1px solid var(--color-tertiary)',
                    }}>{opt.badge}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div style={{ padding: '40px 24px 40px 32px', background: 'var(--color-canvas)', borderLeft: '1px solid var(--color-tertiary)' }}>
            <div style={{ position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 }}>Order Summary</h2>
                <span style={{ fontSize: 12, color: 'var(--color-secondary)' }}>{items.length} items</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {items.map((item) => (
                  <div key={item._key} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-tertiary)' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={item.primary_image_url || PLACEHOLDER}
                        alt={item.product_name}
                        style={{ width: 56, height: 56, objectFit: 'cover' }}
                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                      />
                      <span style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'var(--color-primary)', color: 'white',
                        fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{item.product_name}</p>
                      {item.variant_label && (
                        <p style={{ fontSize: 11, color: 'var(--color-secondary)', marginTop: 2 }}>{item.variant_label}</p>
                      )}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                      {formatPrice(item.unit_price_pkr * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Voucher */}
              <div style={{ padding: '16px 0', borderBottom: '1px solid var(--color-tertiary)' }}>
                <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 8 }}>Discount Voucher</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="field__input"
                    type="text"
                    placeholder="FIRSTBOTANICAL"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value.toUpperCase())}
                    style={{ flex: 1, textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={applyVoucher}
                    disabled={voucherLoading}
                  >
                    {voucherData ? '✓ Applied' : 'Apply'}
                  </button>
                </div>
                {voucherData && (
                  <p style={{ fontSize: 11, color: 'var(--color-success)', marginTop: 6 }}>
                    ✓ {voucherData.description}.
                  </p>
                )}
              </div>

              {/* Totals */}
              <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Subtotal', value: formatPrice(subtotal) },
                  { label: delivery === 0 ? 'Nationwide TCS Courier' : 'Standard Delivery', value: delivery === 0 ? 'FREE' : formatPrice(delivery) },
                  ...(discount ? [{ label: `Voucher Discount (${voucherData?.code})`, value: `−${formatPrice(discount)}` }] : []),
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--color-secondary)' }}>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '2px solid var(--color-primary)', marginBottom: 20 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400 }}>Total Amount</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400 }}>{formatPrice(total)}</span>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full btn--lg"
                disabled={submitting}
              >
                {submitting ? 'Placing Order…' : 'Confirm Order →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-secondary)', marginTop: 10 }}>
                Zero advance charges required for Cash on Delivery
              </p>

              {/* Trust badges */}
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '💵', title: 'CASH ON DELIVERY', sub: 'Nothing to pay in advance.' },
                  { icon: '🚚', title: 'NATIONWIDE DELIVERY', sub: SHIPPING_POLICY },
                  { icon: '📦', title: 'RETURNS', sub: RETURNS_POLICY },
                ].map((b) => (
                  <div key={b.title} style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{b.icon}</span>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 1 }}>{b.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--color-secondary)' }}>{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </form>

      {/* ── Footer links ──────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--color-tertiary)', padding: '16px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
            WhatsApp Support
          </a>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-secondary)', marginTop: 10 }}>
          © {new Date().getFullYear()} LUOMU. Pakistan.
        </p>
      </div>
    </main>
  );
}
