import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../lib/api';
import { formatPrice, MAX_QTY_PER_LINE, PLACEHOLDER_IMAGE as PLACEHOLDER, SHIPPING_POLICY, RETURNS_POLICY, whatsappLink } from '../lib/utils';
import ProductCard from '../components/ProductCard';
import useCartStore from '../store/cartStore';


const StarFill = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--color-tertiary)' }}>
      <button
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '16px 0', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
          <ChevronDown />
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: 16, fontSize: 13, color: 'var(--color-secondary)', lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [addedMsg, setAddedMsg] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQuantity(1);
    setAddedMsg(false);

    Promise.all([
      productsAPI.getBySlug(slug),
      productsAPI.getRelated(slug),
    ])
      .then(([prodRes, relRes]) => {
        const p = prodRes.data.data;
        setProduct(p);
        document.title = `${p.name} — LUOMU`;
        const def = p.product_variants?.find((v) => v.is_default) || p.product_variants?.[0];
        setSelectedVariant(def || null);
        setRelated(relRes.data.data || []);
      })
      .catch(() => navigate('/collections', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToBag = () => {
    if (!product) return;
    addItem(product, selectedVariant, quantity);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  const activePrice = selectedVariant?.price_pkr || product?.price_pkr;
  const comparePrice = selectedVariant?.compare_price || product?.compare_price_pkr;
  const savings = comparePrice ? comparePrice - activePrice : null;
  const savingsPct = savings ? Math.round((savings / comparePrice) * 100) : null;

  const allImages = product
    ? [...new Set([product.primary_image_url, ...(product.images || [])].filter(Boolean))]
    : [];

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px var(--margin)' }}>
        <div className="stack-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          <div className="skeleton" style={{ aspectRatio: '1' }} />
          <div>
            <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 36, width: '80%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <main>
      {/* ── Fulfillment Banner ─────────────────────────────── */}
      <div style={{
        background: 'var(--color-canvas)', borderBottom: '1px solid var(--color-tertiary)',
        padding: '8px 0', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', textAlign: 'center', color: 'var(--color-secondary)',
      }}>
        {SHIPPING_POLICY} Cash on Delivery available.
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <div className="container" style={{ padding: '20px var(--margin)' }}>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb__sep">›</span>
          <Link to="/collections">Collections</Link>
          <span className="breadcrumb__sep">›</span>
          {product.categories && (
            <>
              <Link to={`/collections?category=${product.categories.slug}`}>
                {product.categories.name}
              </Link>
              <span className="breadcrumb__sep">›</span>
            </>
          )}
          <span>{product.name}</span>
        </div>
      </div>

      {/* ── Product Section ────────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="stack-md container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

          {/* Left — Images */}
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Thumbnails */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allImages.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: 60, height: 60, border: `1px solid ${i === activeImg ? 'var(--color-primary)' : 'var(--color-tertiary)'}`,
                    overflow: 'hidden', cursor: 'pointer', background: 'none', padding: 0,
                  }}
                >
                  <img
                    src={img || PLACEHOLDER}
                    alt={`View ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div style={{ flex: 1, position: 'relative' }}>
              {product.is_bestseller && (
                <span style={{
                  position: 'absolute', top: 16, left: 16, zIndex: 1,
                  background: 'var(--color-primary)', color: 'white',
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '3px 10px',
                }}>Bestseller</span>
              )}
              {product.tags?.[0] && !product.is_bestseller && (
                <span style={{
                  position: 'absolute', top: 16, left: 16, zIndex: 1,
                  border: '1px solid white', color: 'white', background: 'rgba(0,0,0,0.4)',
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '3px 10px',
                }}>{product.tags[0]}</span>
              )}
              <img
                src={allImages[activeImg] || PLACEHOLDER}
                alt={product.name}
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
            </div>
          </div>

          {/* Right — Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Rating */}
            {product.rating_avg > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ color: i < Math.round(product.rating_avg) ? 'var(--color-primary)' : '#ddd' }}>
                      <StarFill />
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{product.rating_avg}</span>
                <a href="#reviews" style={{ fontSize: 12, color: 'var(--color-secondary)', textDecoration: 'underline' }}>
                  ({product.rating_count?.toLocaleString()} Reviews)
                </a>
              </div>
            )}

            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>
                {product.name}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--color-secondary)' }}>{product.short_description}</p>
            </div>

            {/* Tags */}
            {product.concern_tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {product.concern_tags.map((t) => (
                  <span key={t} style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', border: '1px solid var(--color-tertiary)',
                    padding: '3px 10px', color: 'var(--color-secondary)',
                  }}>{t}</span>
                ))}
              </div>
            )}

            {/* Price */}
            <div style={{ borderTop: '1px solid var(--color-tertiary)', paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400 }}>
                  {formatPrice(activePrice)}
                </span>
                {comparePrice && (
                  <>
                    <span style={{ fontSize: 16, color: 'var(--color-secondary)', textDecoration: 'line-through' }}>
                      {formatPrice(comparePrice)}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--color-primary)', color: 'white', padding: '2px 8px' }}>
                      SAVE {savingsPct}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.product_variants?.length > 0 && (
              <div>
                <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 10 }}>
                  Select Option:
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.product_variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '10px 16px',
                        border: `1px solid ${selectedVariant?.id === v.id ? 'var(--color-primary)' : 'var(--color-tertiary)'}`,
                        background: selectedVariant?.id === v.id ? 'var(--color-primary)' : 'white',
                        color: selectedVariant?.id === v.id ? 'white' : 'var(--color-primary)',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{v.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Rs. {v.price_pkr?.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to bag */}
            <div className="wrap-md" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', border: '1px solid var(--color-tertiary)' }}>
                <button
                  style={{ width: 40, height: 48, fontSize: 18, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >−</button>
                <span style={{ width: 40, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500 }}>
                  {quantity}
                </span>
                <button
                  style={{ width: 40, height: 48, fontSize: 18, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setQuantity(Math.min(MAX_QTY_PER_LINE, quantity + 1))}
                  aria-label="Increase quantity"
                >+</button>
              </div>

              <button
                className="btn btn--primary btn--lg"
                style={{ flex: 1 }}
                onClick={handleAddToBag}
              >
                {addedMsg ? '✓ Added to Bag' : `Add to Bag — ${formatPrice(activePrice * quantity)}`}
              </button>
            </div>

            <div className="wrap-md" style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn--outline btn--sm"
                style={{ flex: 1 }}
                onClick={() => { handleAddToBag(); navigate('/checkout'); }}
              >
                ⚡ Fast COD Checkout
              </button>
              <a
                href={whatsappLink(`Hi LUOMU, I'd like to order ${product.name}${selectedVariant ? ` (${selectedVariant.label})` : ''}.`)}
                target="_blank"
                rel="noreferrer"
                className="btn btn--outline btn--sm"
                style={{ flex: 1 }}
              >
                💬 WhatsApp Order
              </a>
            </div>

            {/* Delivery info */}
            <div style={{ borderTop: '1px solid var(--color-tertiary)', paddingTop: 16 }}>
              <div className="stack-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: '🚚', title: 'Nationwide Delivery', desc: `${SHIPPING_POLICY} Free on orders above PKR 4,000 or any Pack of 2.` },
                  { icon: '✅', title: 'Cash on Delivery', desc: 'Pay the courier when your parcel arrives.' },
                  { icon: '📦', title: 'Returns', desc: RETURNS_POLICY },
                ].map((i) => (
                  <div key={i.title} style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{i.icon}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{i.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--color-secondary)', lineHeight: 1.5 }}>{i.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product specs */}
            {(product.extraction_method || product.intensity || product.standard || product.origin) && (
              <div style={{ borderTop: '1px solid var(--color-tertiary)', paddingTop: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { label: 'Origin', value: product.origin },
                  { label: 'Extraction', value: product.extraction_method },
                  { label: 'Intensity', value: product.intensity },
                  { label: 'Standard', value: product.standard },
                ].filter((s) => s.value).map((s) => (
                  <div key={s.label}>
                    <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 4 }}>{s.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Payment methods */}
            <div className="wrap-md" style={{ display: 'flex', gap: 12, alignItems: 'center', borderTop: '1px solid var(--color-tertiary)', paddingTop: 16 }}>
              <p className="label-caps" style={{ color: 'var(--color-secondary)' }}>Accepted:</p>
              {['COD', 'JazzCash', 'Easypaisa', 'Bank Transfer'].map((m) => (
                <span key={m} style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px',
                  border: '1px solid var(--color-tertiary)', letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Detail Accordions ──────────────────────── */}
      <section style={{ borderTop: '1px solid var(--color-tertiary)', padding: '60px 0' }}>
        <div className="container container--narrow">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 8 }}>Product Details</p>
            <h2 className="headline-md">Benefits, Ritual &amp; Ingredients</h2>
            <p style={{ fontSize: 13, color: 'var(--color-secondary)', marginTop: 8 }}>
              {product.description}
            </p>
          </div>

          {product.benefits?.length > 0 && (
            <AccordionItem title="Benefits">
              {product.benefits.map((b) => (
                <p key={b.title} style={{ marginBottom: 8 }}><strong>{b.title}:</strong> {b.desc}</p>
              ))}
            </AccordionItem>
          )}
          {product.how_to_use && (
            <AccordionItem title="How to Use">
              <p style={{ whiteSpace: 'pre-line' }}>{product.how_to_use}</p>
            </AccordionItem>
          )}
          {product.ingredients && (
            <AccordionItem title="Ingredients">
              <p>{product.ingredients}</p>
            </AccordionItem>
          )}
          {(product.cautions || product.storage) && (
            <AccordionItem title="Cautions & Storage">
              {product.cautions && <p>{product.cautions}</p>}
              {product.storage && <p style={{ marginTop: 8 }}>{product.storage}</p>}
            </AccordionItem>
          )}
          <AccordionItem title="Shipping & Returns">
            <p>{SHIPPING_POLICY} {RETURNS_POLICY}</p>
            {product.disclaimer && <p style={{ marginTop: 8 }}><strong>Disclaimer:</strong> {product.disclaimer}</p>}
          </AccordionItem>
        </div>
      </section>

      {/* ── Related Products ───────────────────────────────── */}
      {related.length > 0 && (
        <section className="section" style={{ background: 'var(--color-canvas)', borderTop: '1px solid var(--color-tertiary)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
              <h2 className="headline-md">Synergistic Pairings</h2>
              <Link to="/collections" className="btn btn--ghost">
                Explore All Formulations →
              </Link>
            </div>
            <div className="product-grid">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews ───────────────────────────────────────── */}
      {product.reviews?.length > 0 && (
        <section className="section" id="reviews" style={{ borderTop: '1px solid var(--color-tertiary)' }}>
          <div className="container">
            <div className="stack-md" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', alignItems: 'start' }}>
              <div>
                <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 12 }}>Customer Testimonials</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 400 }}>
                    {product.rating_avg}
                  </span>
                  <div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ color: i < Math.round(product.rating_avg) ? 'var(--color-primary)' : '#ddd' }}>
                          <StarFill />
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-secondary)', marginTop: 4 }}>
                      {product.rating_count?.toLocaleString()} Reviews
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {product.reviews.slice(0, 3).map((r) => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--color-tertiary)', paddingBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ color: i < r.rating ? 'var(--color-primary)' : '#ddd' }}>
                          <StarFill />
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>"{r.body}"</p>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>{r.reviewer_name}</p>
                    {r.reviewer_city && (
                      <p style={{ fontSize: 11, color: 'var(--color-secondary)' }}>
                        Verified Buyer · {r.reviewer_city}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
