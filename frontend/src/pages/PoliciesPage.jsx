import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  formatPrice, FREE_DELIVERY_THRESHOLD, DELIVERY_FEE, SHIPPING_POLICY, RETURNS_POLICY,
  WHATSAPP_DISPLAY, whatsappLink, CONTACT_EMAIL,
} from '../lib/utils';

// Terms from the client's product sheets and "website info.docx".
const SECTIONS = [
  {
    id: 'shipping',
    title: 'Shipping',
    body: [
      SHIPPING_POLICY,
      `Delivery is free on orders of ${formatPrice(FREE_DELIVERY_THRESHOLD)} or more, and on any Pack of 2. Otherwise a flat ${formatPrice(DELIVERY_FEE)} delivery charge applies.`,
      'We confirm every order with you on WhatsApp before dispatch.',
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Exchanges',
    body: [
      RETURNS_POLICY,
      'If your parcel arrives with the wrong item or damaged, message us on WhatsApp with a photo and your order number and we will make it right.',
      'Our products are handmade with natural oils and butters and sealed by hand. In heat, a little oil may seep past the seal, or fine powder may settle around it. This does not affect quality.',
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    body: [
      'Cash on Delivery: pay the courier when your parcel arrives.',
      'JazzCash, Easypaisa or bank transfer: we send payment details on WhatsApp after confirming your order. Please do not pay before we confirm.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    body: [
      'When you order, we collect your name, phone number, delivery address and (optionally) email address. We use them only to confirm, deliver and support your order, and share your name, phone and address with our courier for delivery.',
      'If you join our newsletter, we use your email address only to send LUOMU updates. We never sell your information.',
      'To have your details removed, contact us on WhatsApp or by email.',
    ],
  },
];

export default function PoliciesPage() {
  const { hash } = useLocation();

  useEffect(() => {
    document.title = 'Shipping, Returns & Privacy — LUOMU';
    if (hash) document.querySelector(hash)?.scrollIntoView();
  }, [hash]);

  return (
    <main>
      <section className="section section--lg">
        <div className="container container--narrow">
          <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 12 }}>Customer Care</p>
          <h1 className="headline-lg" style={{ marginBottom: 40 }}>Shipping, Returns, Payment &amp; Privacy</h1>

          {SECTIONS.map((s) => (
            <div key={s.id} id={s.id} style={{ borderTop: '1px solid var(--color-tertiary)', padding: '28px 0', scrollMarginTop: 90 }}>
              <h2 className="headline-md" style={{ marginBottom: 12 }}>{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} className="body-md" style={{ color: 'var(--color-secondary)', lineHeight: 1.8, marginBottom: 8 }}>{p}</p>
              ))}
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--color-tertiary)', paddingTop: 28 }}>
            <h2 className="headline-md" style={{ marginBottom: 12 }}>Contact</h2>
            <p className="body-md" style={{ color: 'var(--color-secondary)', lineHeight: 1.8 }}>
              WhatsApp: <a href={whatsappLink()} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{WHATSAPP_DISPLAY}</a>
              <br />
              Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
