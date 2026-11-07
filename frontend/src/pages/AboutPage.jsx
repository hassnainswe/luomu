import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { whatsappLink, WA_CONSULT } from '../lib/utils';

// Copy from the client's "website info.docx" (The LUOMU Story).
const REASONS = [
  { title: 'Zero Chemicals', desc: 'Absolutely no synthetic fragrances, parabens, sulfates, or artificial preservatives — ever.' },
  { title: 'Tried & Tested', desc: 'Every blend is carefully formulated and real-world tested by family and friends before it reaches your hands.' },
  { title: 'Small-Batch Quality', desc: 'Crafted in small batches to preserve freshness, potency, and love in every jar and bottle.' },
];

export default function AboutPage() {
  useEffect(() => {
    document.title = 'Our Story — LUOMU';
  }, []);

  return (
    <main>
      <section className="section section--lg">
        <div className="container container--narrow">
          <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 12 }}>The LUOMU Story</p>
          <h1 className="display-lg" style={{ marginBottom: 24 }}>
            Pure by Nature, <em>Crafted from the Heart</em>
          </h1>
          <p className="body-lg" style={{ marginBottom: 20 }}>
            Welcome to LUOMU — where pure, plant-powered skincare meets simple, home-based wellness.
          </p>
          <p className="body-md" style={{ color: 'var(--color-secondary)', lineHeight: 1.8, marginBottom: 40 }}>
            LUOMU was born out of a passion for natural remedies and a desire to return to basics. In a world
            full of skincare products loaded with harsh chemicals, synthetic additives, and hidden toxins, we set
            out to create something truly clean: 100% natural, chemical-free body oils and scrubs designed to
            nourish your skin the way nature intended.
          </p>

          <h2 className="headline-md" style={{ marginBottom: 16 }}>How It All Began</h2>
          <p className="body-md" style={{ color: 'var(--color-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
            What started as handcrafted experiments in my own kitchen quickly turned into a personal mission.
            I began formulating gentle, effective oils and exfoliating scrubs using only pure, organic ingredients.
          </p>
          <p className="body-md" style={{ color: 'var(--color-secondary)', lineHeight: 1.8, marginBottom: 48 }}>
            Before sharing LUOMU with the world, every single product was tried, tested, and loved by my closest
            friends and family. Their honest feedback and glowing skin gave me the confidence to launch LUOMU —
            bringing effective, home-tested remedies directly to your daily self-care routine.
          </p>

          <h2 className="headline-md" style={{ marginBottom: 24 }}>Why LUOMU?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 48 }}>
            {REASONS.map((r) => (
              <div key={r.title} style={{ borderTop: '1px solid var(--color-tertiary)', paddingTop: 16 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>{r.title}</p>
                <p style={{ fontSize: 13, color: 'var(--color-secondary)', lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/collections" className="btn btn--primary btn--lg">Shop the Collection</Link>
            <a href={whatsappLink(WA_CONSULT)} target="_blank" rel="noreferrer" className="btn btn--outline btn--lg">Talk to Us on WhatsApp</a>
          </div>
        </div>
      </section>
    </main>
  );
}
