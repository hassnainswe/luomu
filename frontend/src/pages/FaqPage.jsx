import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, FREE_DELIVERY_THRESHOLD, DELIVERY_FEE, whatsappLink } from '../lib/utils';

// DRAFT for client approval — every answer is taken from the client's product sheets
// (website.docx, website Scrub.docx, website info.docx). Nothing here is a new claim.
const GROUPS = [
  {
    title: 'Using our products',
    items: [
      {
        q: 'How do I use the hair oils?',
        a: 'Shake well. Massage into scalp and lengths (Herbelle: 8–10 drops; Rosemary Fenugreek: 10–12 drops). Leave on for at least 60 minutes, then wash.',
      },
      {
        q: 'Why does the oil need a second wash?',
        a: 'Our oils are 100% pure with no additives or silicone, so they can feel thick and stubborn to wash out. Apply shampoo to dry hair first, massage, then add water and rinse. A second wash is normal with natural oils.',
      },
      {
        q: 'How long until I see results from the Rosemary Fenugreek oil?',
        a: 'It strengthens roots from the first application and supports visibly denser hair with consistent use over 3 to 6 months. Results vary with scalp condition, age and consistency of use.',
      },
      {
        q: 'Are the hair oils suitable for all hair types?',
        a: 'Yes. They are free from harsh chemicals, sulfates, parabens and synthetic additives, and safe for all hair types and everyday use.',
      },
      {
        q: 'How do I use the Almond & Tea Tree Glow Oil?',
        a: 'After a warm shower or bath, warm 3–5 drops between your palms and massage into damp skin from neck to toe. It contains essential oils, so do a patch test on a small area 24 hours before first use.',
      },
      {
        q: 'How should I store the scrubs and face mask?',
        a: 'Use within 3 months of purchase. Keep the lid tightly closed in a cool, dry place at room temperature, and always use a clean, dry spoon — never wet hands. If you have ants at home, keep the jar in a plastic bag.',
      },
      {
        q: 'My scrub jar has a little oil around the seal. Is that okay?',
        a: 'Yes. Seals are applied by hand and, in heat, some of the natural oils can seep out in transit. It does not affect quality, and the scrub settles back at room temperature.',
      },
      {
        q: 'Are your products natural and vegan?',
        a: 'Yes. Every product is handcrafted and 100% natural, with no synthetic fragrances, parabens, sulfates, silicones or artificial preservatives. Our oils are vegan.',
      },
    ],
  },
  {
    title: 'Orders & delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Delivery takes 4–8 working days anywhere in Pakistan. We confirm every order with you on WhatsApp before dispatch.',
      },
      {
        q: 'How much is delivery?',
        a: `Free on orders of ${formatPrice(FREE_DELIVERY_THRESHOLD)} or more, and on any Pack of 2. Otherwise it is a flat ${formatPrice(DELIVERY_FEE)}.`,
      },
      {
        q: 'How can I pay?',
        a: 'Cash on Delivery, JazzCash/Easypaisa, or bank transfer. For JazzCash, Easypaisa and bank transfer, we send payment details on WhatsApp after confirming your order — please don’t pay before that.',
      },
      {
        q: 'How do I track my order?',
        a: 'Use the Track Order page with your order number and phone number, or message us on WhatsApp.',
        link: { to: '/track', label: 'Track your order' },
      },
      {
        q: 'Can I return or exchange a product?',
        a: 'We don’t accept returns or exchanges unless you receive a wrong or damaged item. If that happens, message us on WhatsApp with a photo and your order number.',
      },
    ],
  },
];

export default function FaqPage() {
  useEffect(() => {
    document.title = 'FAQ — LUOMU';
  }, []);

  return (
    <main>
      <section className="section section--lg">
        <div className="container container--narrow">
          <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 12 }}>Customer Care</p>
          <h1 className="headline-lg" style={{ marginBottom: 32 }}>Frequently Asked Questions</h1>

          {GROUPS.map((g) => (
            <div key={g.title} style={{ marginBottom: 40 }}>
              <h2 className="headline-md" style={{ marginBottom: 12 }}>{g.title}</h2>
              {g.items.map((item) => (
                <details key={item.q} style={{ borderTop: '1px solid var(--color-tertiary)', padding: '16px 0' }}>
                  <summary style={{ cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>{item.q}</summary>
                  <p className="body-md" style={{ color: 'var(--color-secondary)', lineHeight: 1.8, marginTop: 10 }}>
                    {item.a}{' '}
                    {item.link && <Link to={item.link.to} style={{ textDecoration: 'underline' }}>{item.link.label}</Link>}
                  </p>
                </details>
              ))}
            </div>
          ))}

          <p className="body-md" style={{ color: 'var(--color-secondary)' }}>
            Still have a question?{' '}
            <a href={whatsappLink()} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Message us on WhatsApp</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
