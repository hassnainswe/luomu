-- =============================================================
-- LUOMU BOTANICAL APOTHECARY — Supabase Database Schema
-- Migration: 001_initial_schema
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- CATEGORIES TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- PRODUCTS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  name              VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) NOT NULL UNIQUE,
  tagline           VARCHAR(255),
  description       TEXT,
  short_description VARCHAR(500),

  -- Pricing (stored in PKR as integers)
  price_pkr         INTEGER NOT NULL,
  compare_price_pkr INTEGER,

  -- Inventory
  sku               VARCHAR(100) UNIQUE,
  stock_quantity    INTEGER DEFAULT 0,

  -- Product attributes
  unit_label        VARCHAR(50),

  -- Tags for filtering
  tags              TEXT[],
  concern_tags      TEXT[],
  origin            VARCHAR(100),

  -- Media
  primary_image_url VARCHAR(500),
  images            JSONB DEFAULT '[]'::JSONB,

  -- Botanical details
  key_ingredients   JSONB DEFAULT '[]'::JSONB,
  extraction_method VARCHAR(100),
  intensity         VARCHAR(100),
  standard          VARCHAR(100),

  -- Product flags
  is_bestseller     BOOLEAN DEFAULT FALSE,
  is_featured       BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,

  -- Ratings (aggregated)
  rating_avg        DECIMAL(3,1) DEFAULT 0.0,
  rating_count      INTEGER DEFAULT 0,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- PRODUCT VARIANTS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label         VARCHAR(100) NOT NULL,
  price_pkr     INTEGER NOT NULL,
  compare_price INTEGER,
  sku           VARCHAR(100) UNIQUE,
  is_default    BOOLEAN DEFAULT FALSE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- REVIEWS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name VARCHAR(100) NOT NULL,
  reviewer_city VARCHAR(100),
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body          TEXT NOT NULL,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_approved   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- ORDERS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     VARCHAR(20) NOT NULL UNIQUE,

  -- Customer contact
  contact_name     VARCHAR(200) NOT NULL,
  contact_phone    VARCHAR(30) NOT NULL,
  contact_email    VARCHAR(200),
  whatsapp_updates BOOLEAN DEFAULT TRUE,

  -- Delivery address
  street_address   VARCHAR(300) NOT NULL,
  area             VARCHAR(200),
  city             VARCHAR(100) NOT NULL,
  province         VARCHAR(100),
  postal_code      VARCHAR(20),
  rider_note       TEXT,

  -- Pricing
  subtotal_pkr     INTEGER NOT NULL,
  delivery_pkr     INTEGER DEFAULT 200,
  discount_pkr     INTEGER DEFAULT 0,
  total_pkr        INTEGER NOT NULL,

  -- Voucher
  voucher_code     VARCHAR(50),
  voucher_discount INTEGER DEFAULT 0,

  -- Payment
  payment_method   VARCHAR(50) DEFAULT 'COD',

  -- Status: PENDING > CONFIRMED > COMPOUNDING > DISPATCHED > DELIVERED | CANCELLED
  status           VARCHAR(50) DEFAULT 'PENDING',

  -- Courier
  courier          VARCHAR(100),
  waybill_number   VARCHAR(100),
  dispatched_at    TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- ORDER ITEMS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id),
  variant_id      UUID REFERENCES product_variants(id),
  product_name    VARCHAR(255) NOT NULL,
  variant_label   VARCHAR(100),
  unit_price_pkr  INTEGER NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,
  line_total_pkr  INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active     ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_number       ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone        ON orders(contact_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product     ON reviews(product_id);

-- =============================================================
-- UPDATED_AT TRIGGER
-- =============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_categories
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products"
  ON products FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view categories"
  ON categories FOR SELECT USING (TRUE);

CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT USING (is_approved = TRUE);

-- Orders managed only via service_role (Node.js backend)
CREATE POLICY "Service role manages orders"
  ON orders USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages order_items"
  ON order_items USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

-- =============================================================
-- SEED DATA — Categories
-- =============================================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Skin Care',    'skin-care',   'Cold-pressed botanical formulations for face and skin', 1),
  ('Hair & Scalp', 'hair-scalp',  'Micro-batch botanical hair therapies', 2),
  ('Body Care',    'body-care',   'Whole-body botanical care', 3),
  ('Ritual Tools', 'ritual-tools','Hand-crafted apothecary tools', 4)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- SEED DATA — Products
-- =============================================================
INSERT INTO products (
  category_id, name, slug, tagline, short_description, description,
  price_pkr, compare_price_pkr, sku, stock_quantity,
  unit_label, tags, concern_tags, origin,
  primary_image_url, is_bestseller, is_featured, is_active,
  rating_avg, rating_count, extraction_method, intensity, standard
) VALUES
(
  (SELECT id FROM categories WHERE slug = 'skin-care'),
  'Night Skin Repair Cream', 'night-skin-repair-cream',
  'Cellular Botanical Complex',
  'A dense restorative cellular balm that repairs compromised barriers and recharges skin density overnight.',
  'Formulated with cold-pressed botanicals from Swat and Hunza. Plant Exosomes, Signal Peptides, and Bakuchiol rebuild the cellular matrix overnight.',
  2850, 3200, 'LSR-NC-50G', 45, '50G',
  ARRAY['ALPINE ACTIVES','BESTSELLER'], ARRAY['BARRIER REPAIR','FINE LINES & ELASTICITY'],
  'Swat Alpine', '/images/products/night-skin-repair-cream.jpg',
  TRUE, TRUE, TRUE, 4.9, 1241, 'Cold-Pressed', 'Restorative 3%', 'Zero Synthetics'
),
(
  (SELECT id FROM categories WHERE slug = 'skin-care'),
  'Wild Sea Buckthorn & Rosa Nectar', 'wild-sea-buckthorn-rosa-nectar',
  'Face Elixir · 30 ML',
  'Infused with high-elevation Swat wild rose hip oil and cold-extracted northern botanicals.',
  'A potent liquid antioxidant elixir harvested from Swat valley wild-growing sea buckthorn berries.',
  2850, NULL, 'LSE-FE-30ML', 32, '30 ML',
  ARRAY['SWAT HARVEST'], ARRAY['BARRIER REPAIR','DEEP HYDRATION'],
  'Swat Valley (1,800m)', '/images/products/sea-buckthorn-rosa-nectar.jpg',
  FALSE, TRUE, TRUE, 4.8, 88, 'Cold-Pressed', NULL, NULL
),
(
  (SELECT id FROM categories WHERE slug = 'skin-care'),
  'Hunza Apricot & Glacier Dew Mist', 'hunza-apricot-glacier-dew-mist',
  'Alpine Toner · 100 ML',
  'Steam-distilled Hunza valley apricot blossom hydrosol with purified meltwater.',
  'Distilled from hand-harvested apricot blossoms at Hunza altitude. Mineral-rich meltwater added post-distillation.',
  1890, NULL, 'LAT-100ML', 60, '100 ML',
  ARRAY['GLACIAL HYDROSOL'], ARRAY['DEEP HYDRATION','SUN DAMAGE RECOVERY'],
  'Hunza (2,400m)', '/images/products/hunza-apricot-glacier-mist.jpg',
  FALSE, TRUE, TRUE, 5.0, 44, 'Steam-Distilled', NULL, NULL
),
(
  (SELECT id FROM categories WHERE slug = 'skin-care'),
  'Pine Resin & Squalane Recovery Butter', 'pine-resin-squalane-recovery-butter',
  'Overnight Salve · 50G',
  'Foraged Gilgit cedar pine resin suspended in organic olive squalane.',
  'Wild-foraged pine resin from Gilgit cedar forests in single-origin squalane.',
  2450, NULL, 'LPR-OS-50G', 28, '50G',
  ARRAY['WILD CONIFER'], ARRAY['BARRIER REPAIR','DEEP HYDRATION'],
  'Gilgit Conifer', '/images/products/pine-resin-squalane-butter.jpg',
  FALSE, FALSE, TRUE, 4.8, 36, 'Cold-Pressed', NULL, NULL
),
(
  (SELECT id FROM categories WHERE slug = 'hair-scalp'),
  'Wild Rosemary & Black Seed Scalp Oil', 'wild-rosemary-black-seed-scalp-oil',
  'Scalp Therapy · 50 ML',
  'High-carnosic acid alpine rosemary distilled with virgin Nigella Sativa oil.',
  'Small-batch distilled from high-altitude Swat rosemary combined with Nigella Sativa.',
  2150, NULL, 'LRS-ST-50ML', 55, '50 ML',
  ARRAY['FOLLICLE ACTIVE'], ARRAY['SCALP VITALITY'],
  'Swat Alpine', '/images/products/rosemary-black-seed-oil.jpg',
  FALSE, TRUE, TRUE, 4.9, 127, 'Cold-Pressed', NULL, NULL
),
(
  (SELECT id FROM categories WHERE slug = 'skin-care'),
  'Wild Walnut Peptide & Bakuchiol Elixir', 'wild-walnut-peptide-bakuchiol-elixir',
  'Face Serum · 30 ML',
  'Gentle phyto-retinol botanical formulation with cold-extracted northern botanicals.',
  'North Pakistan wild walnut extract with 1% bakuchiol — a clinically validated retinol alternative.',
  3200, NULL, 'LWB-FS-30ML', 22, '30 ML',
  ARRAY['COLD PRESSED'], ARRAY['FINE LINES & ELASTICITY'],
  'Northern Highlands', '/images/products/walnut-bakuchiol-elixir.jpg',
  FALSE, FALSE, TRUE, 4.9, 65, 'Cold-Pressed', NULL, NULL
),
(
  (SELECT id FROM categories WHERE slug = 'body-care'),
  'Sweet Almond & Pink Salt Smoothing Oil', 'sweet-almond-pink-salt-smoothing-oil',
  'Body Oil · 150 ML',
  'Micro-dissolved Himalayan brine electrolytes with virgin Swat almond oil.',
  'First-press sweet almond oil from Swat orchards with micro-crystalline Himalayan pink salt.',
  2650, NULL, 'LSA-BO-150ML', 40, '150 ML',
  ARRAY['BODY CARE'], ARRAY['DEEP HYDRATION'],
  'Swat Orchards', '/images/products/sweet-almond-pink-salt-oil.jpg',
  FALSE, FALSE, TRUE, 4.8, 52, 'Cold-Pressed', NULL, NULL
),
(
  (SELECT id FROM categories WHERE slug = 'skin-care'),
  'Alpine Thyme & Niacinamide Clarifying Drops', 'alpine-thyme-niacinamide-clarifying-drops',
  'Clarifying Nectar · 30 ML',
  'Distilled wild mountain thyme with clinical-grade 5% niacinamide.',
  'Steam-distilled wild thyme from above 2,500m in Gilgit-Baltistan with 5% niacinamide.',
  2300, NULL, 'LAT-CN-30ML', 18, '30 ML',
  ARRAY['CLARIFYING'], ARRAY['BARRIER REPAIR','SUN DAMAGE RECOVERY'],
  'Gilgit (2,500m)', '/images/products/alpine-thyme-clarifying-drops.jpg',
  FALSE, FALSE, TRUE, 5.0, 91, 'Steam-Distilled', NULL, NULL
),
(
  (SELECT id FROM categories WHERE slug = 'ritual-tools'),
  'Skardu Green Nephrite Gua Sha', 'skardu-green-nephrite-gua-sha',
  'Sculpting Tool · 1 PC',
  'Sustainably carved raw nephrite stone from northern mountain deposits.',
  'Hand-carved from single-origin nephrite jade sourced from Skardu district, Baltistan.',
  1950, NULL, 'LNG-RT-1PC', 15, '1 PC',
  ARRAY['RITUAL TOOL'], ARRAY[]::TEXT[],
  'Skardu, Baltistan', '/images/products/skardu-nephrite-gua-sha.jpg',
  FALSE, FALSE, TRUE, 4.9, 43, NULL, NULL, NULL
);

-- =============================================================
-- SEED DATA — Product Variants
-- =============================================================
INSERT INTO product_variants (product_id, label, price_pkr, compare_price, sku, is_default, sort_order)
SELECT p.id, v.label, v.price_pkr, v.compare_price, v.sku, v.is_default, v.sort_order
FROM products p
CROSS JOIN (VALUES
  ('50g Jar',         2850, 3200, 'LSR-NC-50G-V1',    TRUE,  0),
  ('100g Double',     4850, 6400, 'LSR-NC-100G-V2',   FALSE, 1),
  ('50ml Night Ritual', 6900, NULL, 'LSR-NC-SET-V3',  FALSE, 2)
) AS v(label, price_pkr, compare_price, sku, is_default, sort_order)
WHERE p.slug = 'night-skin-repair-cream'
ON CONFLICT (sku) DO NOTHING;

-- =============================================================
-- SEED DATA — Reviews
-- =============================================================
INSERT INTO reviews (product_id, reviewer_name, reviewer_city, rating, body, is_verified, is_approved)
SELECT p.id, r.name, r.city, r.rating, r.body, TRUE, TRUE
FROM products p
CROSS JOIN (VALUES
  ('Zainab K.', 'Lahore', 5, 'Using it during winter avoids eczema spells on my chin. The night recovery formula is exceptional.'),
  ('Dr. Ayla Mansoor', 'Islamabad', 5, 'Skeptical about local products but was pleasantly surprised. Skin feels firmer and more hydrated.'),
  ('Mukhtar Tariq', 'Karachi', 5, 'Super fast delivery. Packaging is plastic-free and smells like freshly cold-pressed botanicals.')
) AS r(name, city, rating, body)
WHERE p.slug = 'night-skin-repair-cream';
