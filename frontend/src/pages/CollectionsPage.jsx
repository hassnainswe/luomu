import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { whatsappLink, WA_CONSULT } from '../lib/utils';

// Must match products.concern_tags (stored uppercase).
const CONCERNS = ['Hair Fall', 'Hair Growth', 'Scalp Care', 'Dry Hair', 'Deep Hydration', 'Body Blemishes'];

const SORT_OPTIONS = [
  { value: 'featured',    label: 'Curated · Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Highest Rated' },
];

export default function CollectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get('category') || 'all';
  const activeConcern  = searchParams.get('concern') || '';
  const activeSort     = searchParams.get('sort') || 'featured';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sort: activeSort,
        limit: 12,
      };
      if (activeCategory !== 'all') params.category = activeCategory;
      if (activeConcern) params.concern = activeConcern;

      const res = await productsAPI.getAll(params);
      setProducts(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeConcern, activeSort]);

  useEffect(() => {
    document.title = 'Collections — LUOMU';
    categoriesAPI.getAll().then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name
    || 'The Botanical Dispensary';

  return (
    <main>
      {/* ── Page Header ──────────────────────────────────────── */}
      <section style={{ padding: '48px 0 32px', borderBottom: '1px solid var(--color-tertiary)' }}>
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb__sep">›</span>
            <span>Collections</span>
          </div>

          <div className="stack-md" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'end' }}>
            <div>
              <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 8 }}>
                · Handcrafted · 100% Natural &amp; Vegan
              </p>
              <h1 className="headline-lg">{activeCategoryName}</h1>
              <p className="body-md" style={{ color: 'var(--color-secondary)', marginTop: 10, maxWidth: 480 }}>
                Pure herbal hair oils and body care, free from sulfates, parabens and silicones.
                Filter by concern to find your ritual.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--color-secondary)' }}>
                <span>☑ No Additives or Silicones</span>
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--color-secondary)' }}>
                <span>🚚 Free Delivery &gt; PKR 4,000 or any Pack of 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Tabs ─────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--color-tertiary)', padding: '0' }}>
        <div className="wrap-md container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <div className="wrap-md" style={{ display: 'flex', gap: 4 }}>
            <button
              className={`filter-chip${activeCategory === 'all' ? ' active' : ''}`}
              onClick={() => setParam('category', '')}
            >
              All ({total})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                className={`filter-chip${activeCategory === cat.slug ? ' active' : ''}`}
                onClick={() => setParam('category', cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="wrap-md" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <label htmlFor="sort-select" className="label-caps" style={{ color: 'var(--color-secondary)' }}>Sort:</label>
            <select
              id="sort-select"
              className="field__select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }}
              value={activeSort}
              onChange={(e) => setParam('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Filters ───────────────────────────────────────────── */}
      <section style={{ padding: '16px 0', borderBottom: '1px solid var(--color-tertiary)', background: 'var(--color-canvas)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="label-caps" style={{ color: 'var(--color-secondary)', marginRight: 4 }}>Concern:</span>
              {CONCERNS.map((c) => (
                <button
                  key={c}
                  className={`filter-chip${activeConcern === c ? ' active' : ''}`}
                  style={{ fontSize: 10, padding: '4px 10px' }}
                  onClick={() => setParam('concern', activeConcern === c ? '' : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Products Grid ─────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
            <p className="label-caps" style={{ color: 'var(--color-secondary)' }}>
              Showing {products.length} Formulations
            </p>
            <p className="label-caps" style={{ color: 'var(--color-secondary)' }}>
              · Cold-Distilled Reserve
            </p>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ aspectRatio: '1', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-secondary)' }}>
              <p className="headline-sm">No formulations found.</p>
              <p style={{ marginTop: 8, fontSize: 13 }}>Try adjusting your filters.</p>
              <button
                className="btn btn--outline btn--sm"
                style={{ marginTop: 24 }}
                onClick={() => setSearchParams(new URLSearchParams())}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Trust Banner ──────────────────────────────────────── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--color-tertiary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="label-caps" style={{ color: 'var(--color-secondary)', marginBottom: 12 }}>Standard Nº 01</p>
          <h2 className="headline-md" style={{ marginBottom: 16 }}>Preservative-Free · 100% Unrefined Cold Pressed</h2>
          <p className="body-md" style={{ color: 'var(--color-secondary)', maxWidth: 600, margin: '0 auto 32px' }}>
            Every formulation undergoes spectroscopic batch testing in independent laboratories. Completely free
            of synthetic fragrance, sulfates, mineral oils, or adulterated carriers.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
            {['Cruelty-Free', 'Wild-Harvested', 'Infinitely Recyclable Glass'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WhatsApp Banner ───────────────────────────────────── */}
      <section style={{ background: 'var(--color-primary)', color: 'white', padding: '40px 0' }}>
        <div className="wrap-md container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div>
            <p className="label-caps" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Personal Advice</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400 }}>Not sure which product is right for you?</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
              Message us on WhatsApp and we'll help you choose.
            </p>
          </div>
          <a
            href={whatsappLink(WA_CONSULT)}
            target="_blank"
            rel="noreferrer"
            className="btn btn--lg"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', flexShrink: 0 }}
          >
            💬 WhatsApp Consultation
          </a>
        </div>
      </section>
    </main>
  );
}
