// Usage: npm run gen:seed  —  generates supabase/migrations/002_real_catalog.sql from backend/src/data/mockData.js
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '../..');
const { categories, allProducts, vouchers } = require(path.join(root, 'backend/src/data/mockData.js'));

const q = (v) => {
  if (v == null) return 'NULL';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  const s = String(v);
  if (s.includes('\n')) {
    const escaped = s.replace(/'/g, "''").replace(/\\/g, '\\\\').replace(/\r/g, '').replace(/\n/g, '\\n');
    return `E'${escaped}'`;
  }
  return `'${s.replace(/'/g, "''")}'`;
};
const arr = (a) => (a && a.length ? `ARRAY[${a.map(q).join(', ')}]` : `'{}'::TEXT[]`);
const json = (v) => `${q(JSON.stringify(v ?? []))}::JSONB`;

const OLD_SLUGS = [
  'night-skin-repair-cream', 'wild-rosemary-black-seed-scalp-oil', 'wild-walnut-peptide-bakuchiol-elixir',
  'sweet-almond-pink-salt-smoothing-oil', 'alpine-thyme-niacinamide-clarifying-drops', 'skardu-green-nephrite-gua-sha',
  'hunza-apricot-glacier-dew-mist', 'pine-resin-squalane-recovery-butter', 'wild-sea-buckthorn-rosa-nectar',
];

let sql = `-- =============================================================
-- LUOMU — Migration 002: client's real catalog, vouchers table, RLS fixes
-- Generated from backend/src/data/mockData.js (keep the two in sync).
-- Run after 001_initial_schema.sql in the Supabase SQL Editor.
-- =============================================================

-- Product content fields from the client's product sheets
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS benefits    JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS how_to_use  TEXT,
  ADD COLUMN IF NOT EXISTS ingredients TEXT,
  ADD COLUMN IF NOT EXISTS cautions    TEXT,
  ADD COLUMN IF NOT EXISTS storage     TEXT,
  ADD COLUMN IF NOT EXISTS disclaimer  TEXT;

-- product_variants had RLS disabled, so anyone holding the public anon key could edit prices.
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS free_delivery BOOLEAN DEFAULT FALSE;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view variants" ON product_variants;
CREATE POLICY "Public can view variants" ON product_variants FOR SELECT USING (TRUE);

-- Vouchers (the API already queries this table). No public policy: service role only.
CREATE TABLE IF NOT EXISTS vouchers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         VARCHAR(50) NOT NULL UNIQUE,
  type         VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value        INTEGER NOT NULL CHECK (value > 0),
  min_subtotal INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

INSERT INTO vouchers (code, type, value, min_subtotal) VALUES
${vouchers.map((v) => `  (${q(v.code)}, ${q(v.type)}, ${v.value}, ${v.min_subtotal})`).join(',\n')}
ON CONFLICT (code) DO NOTHING;

-- Remove the placeholder catalog seeded by 001 (reviews/variants cascade).
DELETE FROM products WHERE slug IN (${OLD_SLUGS.map(q).join(', ')});
DELETE FROM categories WHERE slug = 'ritual-tools';

INSERT INTO categories (id, name, slug, description, sort_order) VALUES
${categories.map((c) => `  (${q(c.id)}, ${q(c.name)}, ${q(c.slug)}, ${q(c.description)}, ${c.sort_order})`).join(',\n')}
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id, name = EXCLUDED.name, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Products (inactive rows are waiting for a photo: set primary_image_url/images, then is_active = TRUE)
INSERT INTO products (
  id, category_id, name, slug, tagline, short_description, description,
  price_pkr, compare_price_pkr, sku, unit_label, tags, concern_tags, origin, standard,
  primary_image_url, images, benefits, how_to_use, ingredients, cautions, storage, disclaimer,
  is_bestseller, is_featured, is_active, rating_avg, rating_count
) VALUES
${allProducts.map((p) => `(
  ${q(p.id)}, ${q(p.category_id)},
  ${q(p.name)}, ${q(p.slug)}, ${q(p.tagline)},
  ${q(p.short_description)},
  ${q(p.description)},
  ${p.price_pkr}, ${q(p.compare_price_pkr)}, ${q(p.sku)}, ${q(p.unit_label)},
  ${arr(p.tags)}, ${arr(p.concern_tags)}, ${q(p.origin)}, ${q(p.standard)},
  ${q(p.primary_image_url)}, ${json(p.images)}, ${json(p.benefits)},
  ${q(p.how_to_use)},
  ${q(p.ingredients)},
  ${q(p.cautions)},
  ${q(p.storage)},
  ${q(p.disclaimer)},
  ${p.is_bestseller}, ${p.is_featured}, ${p.is_active}, ${p.rating_avg}, ${p.rating_count}
)`).join(',\n')}
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (id, product_id, label, price_pkr, compare_price, free_delivery, is_default, sort_order) VALUES
${allProducts.flatMap((p) => p.product_variants.map((v) =>
  `  (${q(v.id)}, ${q(p.id)}, ${q(v.label)}, ${v.price_pkr}, ${q(v.compare_price)}, ${v.free_delivery}, ${v.is_default}, ${v.sort_order})`)).join(',\n')}
ON CONFLICT (id) DO NOTHING;
`;

fs.writeFileSync(path.join(root, 'supabase/migrations/002_real_catalog.sql'), sql);
console.log('wrote', sql.length, 'bytes');
