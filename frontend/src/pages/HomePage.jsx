import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../lib/api';
import { whatsappLink, WA_CONSULT } from '../lib/utils';
import ProductCard from '../components/ProductCard';

// Hero slideshow: one slide per live product. Card text comes from the client's product sheets.
const HERO_SLIDES = [
  { img: '/images/products/herbelle-lifestyle.jpg', label: 'Signature', name: 'Herbelle Hair Oil',
    line: 'Strengthens hair & scalp · 100 ML', slug: 'herbelle-hair-oil', alt: 'Herbelle Hair Oil on a wooden tray beside wooden combs' },
  { img: '/images/products/rosemary-fenugreek.jpg', label: 'Hair Growth', name: 'Rosemary Fenugreek Hair Oil',
    line: 'Wakes dormant follicles · 100 ML', slug: 'rosemary-fenugreek-hair-oil', alt: 'Rosemary Fenugreek oil with fresh rosemary and fenugreek seeds' },
  { img: '/images/products/almond-tea-tree.jpg', label: 'Body Glow', name: 'Almond & Tea Tree Glow Oil',
    line: 'Deep hydration, satin glow · 100 ML', slug: 'almond-tea-tree-glow-oil', alt: 'Almond & Tea Tree Glow Oil held in hand' },
  { img: '/images/products/shea-silk-scrub.jpg', label: 'Body Scrub', name: 'Shea & Silk Scrub',
    line: 'Polishes & deeply moisturises · 250 G', slug: 'shea-silk-scrub', alt: 'Shea & Silk Scrub jar on linen' },
];
const SLIDE_MS = 5000;

const PILLARS = [
  { title: '100% Pure', desc: 'No additives, silicones or synthetic fragrance — natural oils as they are.' },
  { title: 'Herbal Infusions', desc: 'Rosemary, fenugreek, hibiscus, black seed and curry leaf, infused for the scalp.' },
  { title: 'Handcrafted', desc: 'Made and sealed by hand in small batches, tried and tested by family first.' },
  { title: 'Plant-Based & Vegan', desc: 'Free from sulfates and parabens. Safe for all hair types and everyday use.' },
];

// Benefits and "found in" come from the client's ingredient lists.
const HERBELLE = { slug: 'herbelle-hair-oil', name: 'Herbelle' };
const ROSEMARY = { slug: 'rosemary-fenugreek-hair-oil', name: 'Rosemary Fenugreek' };
const ALMOND = { slug: 'almond-tea-tree-glow-oil', name: 'Almond & Tea Tree' };
const SHEA = { slug: 'shea-silk-scrub', name: 'Shea & Silk Scrub' };
const BOTANICALS = [
  { name: 'Rosemary', note: 'Improves scalp circulation and wakes dormant follicles.', products: [ROSEMARY, HERBELLE] },
  { name: 'Fenugreek', note: 'Strengthens roots so each strand sheds less.', products: [ROSEMARY, HERBELLE] },
  { name: 'Sweet Almond', note: 'Fatty acids and Vitamin E for deep, lasting hydration.', products: [ALMOND] },
  { name: 'Tea Tree', note: 'Purifies pores and helps prevent body blemishes.', products: [ALMOND] },
  { name: 'Shea Butter', note: 'Deeply nourishes dry skin and restores softness.', products: [SHEA] },
];

function HeroSlides() {
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    // Respect "reduce motion": no auto-advance, dots still work.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (!paused.current && !document.hidden) setActive((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[active];
  const pause = (v) => () => { paused.current = v; };

  return (
    <div
      className="hero-slides"
      onPointerEnter={pause(true)} onPointerLeave={pause(false)}
      onFocus={pause(true)} onBlur={pause(false)}
      aria-roledescription="carousel" aria-label="Featured products"
    >
      <div className="hero-slides__frame">
        {HERO_SLIDES.map((s, i) => (
          <img
            key={s.slug}
            src={s.img}
            alt={i === active ? s.alt : ''}
            aria-hidden={i !== active}
            className={`hero-slides__img${i === active ? ' is-active' : ''}`}
            fetchPriority={i === 0 ? 'high' : 'low'}
            decoding="async"
          />
        ))}

        <div className="hero-slides__dots">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              className="hero-slides__dot"
              aria-label={`Show ${s.name}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>

      <Link to={`/products/${slide.slug}`} className="hero-slides__card" aria-live="polite">
        <div key={slide.slug} className="hero-slides__card-text">
          <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 8 }}>{slide.label}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>{slide.name}</p>
          <p style={{ fontSize: 11, color: 'var(--color-secondary)', marginTop: 4 }}>{slide.line}</p>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 10 }}>Shop now →</p>
        </div>
      </Link>
    </div>
  );
}

const CATEGORY_IMAGES = [
  {
    label: 'HAIR & SCALP',
    title: 'Herbal Hair Oils',
    desc: 'Nourish the scalp, strengthen roots and reduce hair fall with pure herbal blends.',
    href: '/collections?category=hair-scalp',
    img: '/images/products/rosemary-fenugreek.jpg',
  },
  {
    label: 'BODY CARE',
    title: 'Body Glow Oil',
    desc: 'Sweet almond and tea tree for deep hydration and a clear, satin glow.',
    href: '/collections?category=body-care',
    img: '/images/products/almond-tea-tree.jpg',
  },
  {
    label: 'THE COLLECTION',
    title: 'Shop All',
    desc: 'Handcrafted, 100% natural and vegan — free from sulfates, parabens and silicones.',
    href: '/collections',
    img: '/images/products/oil-trio-linen.jpg',
  },
];

// Brand promises for the ticker; all from the client's sheets and delivery terms.
const PROMISES = [
  'Handcrafted in small batches',
  '100% natural & vegan',
  'No sulfates, parabens or silicones',
  'Cash on delivery nationwide',
  'Free delivery on any Pack of 2',
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'LUOMU — Natural Science · Pure Harvest';
    // Top 4 live products, featured first, so the row stays full as products go live.
    productsAPI.getAll({ sort: 'featured', limit: 4 })
      .then((res) => setFeatured(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container stack-md hero__grid">
          <div>
            <h1 className="hero__title">
              <span className="hero__mask"><span className="hero__line">Pure herbal oils.</span></span>
              <span className="hero__mask"><em className="hero__line">Formulated for</em></span>
              <span className="hero__mask"><em className="hero__line">your daily ritual.</em></span>
            </h1>
            <p className="hero__lede hero__rise" style={{ '--d': '520ms' }}>
              Handcrafted hair and body care made with 100% natural, plant-based ingredients —
              free from harsh chemicals, sulfates, parabens and silicones.
            </p>
            <div className="wrap-md hero__rise" style={{ display: 'flex', gap: 12, '--d': '600ms' }}>
              <Link to="/collections" className="btn btn--primary btn--lg">
                Shop the Collection
              </Link>
              <a href="#philosophy" className="btn btn--outline btn--lg">
                Our Philosophy
              </a>
            </div>
            <ul className="hero__facts hero__rise" style={{ '--d': '680ms' }}>
              <li>100% natural &amp; vegan</li>
              <li>Cash on delivery</li>
              <li>Delivered in 4–8 working days</li>
            </ul>
          </div>

          <HeroSlides />
        </div>
      </section>

      {/* ── Promise ticker ───────────────────────────────────── */}
      <section className="ticker" aria-label="Why LUOMU">
        <ul className="ticker__track">
          {[...PROMISES, ...PROMISES].map((t, i) => (
            <li key={i} aria-hidden={i >= PROMISES.length || undefined}>{t}</li>
          ))}
        </ul>
      </section>

      {/* ── Flagship Products ────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <h2 className="section__title">Flagship Formulations</h2>
              <p className="section__subtitle">
                Pure herbal oils for hair, scalp and body.
              </p>
            </div>
            <Link to="/collections" className="btn btn--ghost">
              View All Products →
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ aspectRatio: '1', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '80%' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {featured.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Category Sanctuary ───────────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-canvas)', borderTop: '1px solid var(--color-tertiary)', borderBottom: '1px solid var(--color-tertiary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="headline-lg">Hair, Scalp &amp; Body</h2>
          </div>

          <div className="stack-md" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gutter)' }}>
            {CATEGORY_IMAGES.map((cat) => (
              <Link key={cat.title} to={cat.href} className="cat-card">
                <img src={cat.img} alt="" className="cat-card__img" loading="lazy" />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                  padding: '24px 20px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  color: 'white',
                }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>
                    {cat.title}
                  </h3>
                  <p style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.6, marginBottom: 12 }}>{cat.desc}</p>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.6)', paddingBottom: 2, width: 'fit-content' }}>
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Philosophy / Science ────────────────────────────── */}
      <section className="section section--lg" id="philosophy">
        <div className="container">
          <div className="stack-md" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '5rem', alignItems: 'start' }}>
            <div>
              <h2 className="headline-lg" style={{ marginBottom: 20 }}>
                The Science Behind <em>Natural Wellness</em>
              </h2>
              <p className="body-md" style={{ color: 'var(--color-secondary)', lineHeight: 1.8, marginBottom: 32 }}>
                Every LUOMU product is made from pure plant oils and herbs, with nothing added that your
                hair or skin doesn&apos;t need. Because our oils are 100% pure, they can feel richer than
                commercial formulas — a second wash is normal, and a sign there&apos;s no silicone inside.
              </p>

              <div className="feature-grid">
                {PILLARS.map((f, i) => (
                  <div key={f.title} className="feature-card">
                    <span className="feature-card__num">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="feature-card__title">{f.title}</h3>
                    <p className="feature-card__desc">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="headline-md" style={{ marginBottom: 6 }}>Key Botanicals</h3>
              <p style={{ fontSize: 13, color: 'var(--color-secondary)', marginBottom: 16 }}>
                The plants doing the work, and where you&apos;ll find them.
              </p>
              <ul className="botanicals">
                {BOTANICALS.map((b) => (
                  <li key={b.name} className="botanicals__row">
                    <h3 className="botanicals__name">{b.name}</h3>
                    <p className="botanicals__note">{b.note}</p>
                    <div className="botanicals__products">
                      <span className="botanicals__in">Found in</span>
                      {b.products.map((p) => (
                        <Link key={p.slug} to={`/products/${p.slug}`} className="chip-link">{p.name} →</Link>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA (light, so it separates the dark philosophy band from the dark footer) ── */}
      <section className="consult">
        <div className="wrap-md container consult__inner">
          <div className="consult__lead">
            <span className="consult__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-4-1L3 20l1.1-5.2A8.5 8.5 0 1 1 21 11.5z" />
              </svg>
            </span>
            <div>
              <h2 className="consult__title">Not sure which oil is right for you?</h2>
              <p className="consult__text">
                Tell us about your hair or skin on WhatsApp and we&apos;ll help you choose — or place your
                order directly in the chat.
              </p>
            </div>
          </div>
          <div className="wrap-md" style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <a href={whatsappLink(WA_CONSULT)} target="_blank" rel="noreferrer" className="btn btn--primary btn--lg">
              Chat on WhatsApp
            </a>
            <Link to="/collections" className="btn btn--outline btn--lg">
              Shop All →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
