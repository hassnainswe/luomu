-- =============================================================
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
  ('WELCOME10', 'percentage', 10, 1000),
  ('LUOMU15', 'percentage', 15, 3000),
  ('PURE500', 'fixed', 500, 2500)
ON CONFLICT (code) DO NOTHING;

-- Remove the placeholder catalog seeded by 001 (reviews/variants cascade).
DELETE FROM products WHERE slug IN ('night-skin-repair-cream', 'wild-rosemary-black-seed-scalp-oil', 'wild-walnut-peptide-bakuchiol-elixir', 'sweet-almond-pink-salt-smoothing-oil', 'alpine-thyme-niacinamide-clarifying-drops', 'skardu-green-nephrite-gua-sha', 'hunza-apricot-glacier-dew-mist', 'pine-resin-squalane-recovery-butter', 'wild-sea-buckthorn-rosa-nectar');
DELETE FROM categories WHERE slug = 'ritual-tools';

INSERT INTO categories (id, name, slug, description, sort_order) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'Hair & Scalp', 'hair-scalp', 'Pure herbal hair oils that nourish the scalp, strengthen roots and restore natural shine.', 1),
  ('c0000000-0000-4000-8000-000000000002', 'Body Care', 'body-care', 'Glow oils and hand-sealed scrubs for soft, deeply hydrated skin.', 2),
  ('c0000000-0000-4000-8000-000000000003', 'Face Care', 'skin-care', 'Natural masks that brighten, gently exfoliate and even out skin tone.', 3)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id, name = EXCLUDED.name, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- Products (inactive rows are waiting for a photo: set primary_image_url/images, then is_active = TRUE)
INSERT INTO products (
  id, category_id, name, slug, tagline, short_description, description,
  price_pkr, compare_price_pkr, sku, unit_label, tags, concern_tags, origin, standard,
  primary_image_url, images, benefits, how_to_use, ingredients, cautions, storage, disclaimer,
  is_bestseller, is_featured, is_active, rating_avg, rating_count
) VALUES
(
  '10000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
  'Herbelle Hair Oil', 'herbelle-hair-oil', 'Hair Oil · 100 ML',
  'A 100% pure herbal blend that nourishes the scalp, strengthens roots and restores natural shine.',
  'A 100% pure organic and herbal blend, free from harsh chemicals, sulfates and parabens. It stimulates microcirculation to wake up dormant follicles, reduces breakage, repairs split ends and enhances natural shine — in a lightweight formula that absorbs into scalp and hair without feeling greasy.',
  2250, NULL, 'LM-HERB-100', '100 ML',
  ARRAY['HANDCRAFTED'], ARRAY['HAIR FALL', 'SCALP CARE', 'DRY HAIR'], NULL, '100% Natural & Vegan',
  '/images/products/herbelle-studio.jpg', '["/images/products/herbelle-studio.jpg","/images/products/herbelle-lifestyle.jpg","/images/products/herbelle-linen.jpg"]'::JSONB, '[{"title":"Nourishes & Revitalizes the Scalp","desc":"Delivers essential nutrients from pure organic oils and herbs directly to the scalp, creating the optimal environment for healthy hair growth."},{"title":"Strengthens Roots to Reduce Breakage","desc":"Fortifies weak strands right from the root, minimizing hair fall and preventing split ends."},{"title":"Restores Natural Shine & Softness","desc":"Deeply hydrates coarse or dry hair without a heavy, greasy residue, restoring smooth texture and natural luster."},{"title":"100% Pure & Plant-Based","desc":"Free from harsh chemicals, sulfates, parabens and synthetic additives — safe for all hair types and everyday use."}]'::JSONB,
  E'Shake well before use. Massage 8–10 drops into scalp and lengths. Massaging helps spread the oil and relaxes the scalp. Leave for minimum 60 minutes, then wash.\n\nWashing tip: Made with natural oils, so it may feel thick. Apply shampoo to dry hair first. Massage, add water, and rinse. Repeat if needed.',
  'Yellow Mustard Seed Oil, Alkanet Root Extract, Fenugreek Seed Extract, Black Seed Extract, Hibiscus Flower Extract, Flex Seed Extract, Clove, Aloe Vera, Curry Leaf Extract, Rosemary Leaf Extract, Jasmine Flower.',
  'For external use only. Our oil is 100% pure, with no additives or silicone. This is great for your hair, but natural oil can feel stubborn to wash out. A second wash is normal with natural oils.',
  NULL,
  'Results vary based on individual scalp condition, age, and consistency of use. The brand is not responsible for side effects if used against the provided cautions.',
  false, true, true, 0, 0
),
(
  '10000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001',
  'Rosemary Fenugreek Infused Hair Oil', 'rosemary-fenugreek-hair-oil', 'Hair Growth Oil · 100 ML',
  'High-concentration rosemary and fresh fenugreek sprouts to wake dormant follicles for thicker, stronger hair.',
  'Thicker, stronger hair starts at the scalp — and this rosemary hair growth oil is formulated to get you there. Blended with high-concentration rosemary oil and fenugreek sprouts extracted fresh, it improves blood circulation to the scalp, reduces inflammation, and wakes up dormant hair follicles that have stopped producing. Lightweight enough for regular use, it strengthens roots from the first application and supports visibly denser hair with consistent use over 3 to 6 months.',
  2350, NULL, 'LM-ROSE-100', '100 ML',
  ARRAY['HAIR GROWTH'], ARRAY['HAIR GROWTH', 'HAIR FALL', 'SCALP CARE'], NULL, '100% Natural & Vegan',
  '/images/products/rosemary-fenugreek.jpg', '["/images/products/rosemary-fenugreek.jpg","/images/products/oil-trio-marble.jpg"]'::JSONB, '[{"title":"Faster Hair Growth","desc":"Rosemary and fenugreek work together to stimulate follicle activity, promoting new growth in thinning and sparse areas."},{"title":"Reduced Hair Fall","desc":"Strengthens hair from the root up, so each strand anchors better and sheds less with every wash."},{"title":"Less Scalp Inflammation","desc":"Anti-inflammatory botanicals soothe an irritated scalp, removing one of the most common hidden causes of excessive hair fall."},{"title":"Stronger, Thicker Strands","desc":"Regular use coats and conditions each strand along the shaft, reducing breakage and building visible volume over time."},{"title":"Dormant Follicle Activation","desc":"The concentrated formula targets follicles that have slowed or stopped, gradually reactivating them for new growth cycles."}]'::JSONB,
  E'Shake well before use. Massage 10–12 drops into scalp and lengths. Massaging helps spread the oil and relaxes the scalp. Leave for minimum 60 minutes, then wash.\n\nWashing tip: Made with natural oils, so it may feel thick. Apply shampoo to dry hair first. Massage, add water, and rinse. Repeat if needed.',
  'Yellow Mustard Seed Oil, Coconut Oil, Rosemary Leaf Extract, Fenugreek Sprouts, Rosemary Oil, Cloves, and Flower Oil.',
  'For external use only. Our oil is 100% pure, with no additives or silicone. This is great for your hair, but natural oil can feel stubborn to wash out. A second wash is normal with natural oils.',
  NULL,
  'Results vary based on individual scalp condition, age, and consistency of use. The brand is not responsible for side effects if used against the provided cautions.',
  false, true, true, 0, 0
),
(
  '10000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002',
  'Almond & Tea Tree Glow Oil', 'almond-tea-tree-glow-oil', 'Body Oil · 100 ML',
  'Sweet almond and tea tree in a lightweight body oil that hydrates, clarifies and leaves a satin glow.',
  'Nourish, protect, and restore your skin with our Almond & Tea Tree Body Oil — a balanced blend designed to deliver deep hydration while clarifying and soothing the skin. The anti-inflammatory and anti-bacterial properties of tea tree oil meet naturally glossy almond oil and pure essential extracts in a lightweight formula that restores elasticity and leaves a radiant, satin finish without any greasy feel.',
  2450, NULL, 'LM-ALMT-100', '100 ML',
  ARRAY['BODY GLOW'], ARRAY['DEEP HYDRATION', 'BODY BLEMISHES'], NULL, '100% Natural & Vegan',
  '/images/products/almond-tea-tree.jpg', '["/images/products/almond-tea-tree.jpg","/images/products/oil-trio-linen.jpg"]'::JSONB, '[{"title":"Deep & Long-Lasting Hydration","desc":"Rich in fatty acids and Vitamin E, sweet almond oil penetrates the skin barrier to lock in moisture and soften dry, rough areas."},{"title":"Clears & Prevents Body Blemishes","desc":"The purifying qualities of tea tree oil help keep pores clear, helping prevent body acne on the chest, back and shoulders."},{"title":"Improves Skin Tone & Texture","desc":"Regular application helps smooth uneven texture, fade minor scars or dark spots, and improve overall elasticity."},{"title":"Fast-Absorbing & Non-Greasy","desc":"A lightweight body treatment that absorbs quickly into damp skin, leaving a silky, healthy glow rather than an oily residue."},{"title":"All-Natural & Refreshing","desc":"Free from synthetic fragrances, harsh chemicals and parabens, with a clean, herbal-nutty aroma."}]'::JSONB,
  E'Step 1 — Cleanse: shower or bathe with warm water, or use our bath salt scrub.\nStep 2 — Drop & warm: dispense 3–5 drops onto palms and warm between hands.\nStep 3 — Massage: gently massage into damp skin from neck to toe until smooth and radiant.',
  'Sweet Almond Oil, Coconut Oil, Jojoba Oil, Argan Kernel Oil, Tea Tree Leaf Oil, Jasmine Oil, Vitamin E.',
  'For external use only. Contains essential oils; do a patch test on a small area of skin 24 hours before full application. Avoid direct contact with eyes. If irritation occurs, discontinue use immediately.',
  NULL,
  'Results vary based on individual skin condition, age, and consistency of use. The brand is not responsible for side effects if used against the provided cautions.',
  false, true, true, 0, 0
),
(
  '10000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000003',
  'Daily Grind & Glow Face Mask', 'daily-grind-glow-face-mask', 'Face Mask · 150 G',
  'Finely ground coffee, roasted turmeric and rice flour to buff away dullness and lift tan.',
  'Unveil a radiant, refreshed complexion with our invigorating blend of finely ground coffee, gently roasted turmeric, and coarse rice flour — designed to buff away dullness and remove skin tan.',
  1450, NULL, 'LM-MASK-DGG', '150 G',
  ARRAY['FACE MASK'], ARRAY['TAN & DULLNESS', 'EXFOLIATION'], NULL, '100% Natural',
  NULL, '[]'::JSONB, '[{"title":"Brightens & Evens Tone","desc":"Roasted turmeric is rich in antioxidants that fade dark spots, soothe inflammation, and restore a natural, healthy glow."},{"title":"Exfoliates & Smooths","desc":"Fine rice flour gently removes dead skin cells and absorbs excess oil, leaving skin soft, smooth and refined."},{"title":"Firms & Revitalizes","desc":"Coffee boosts circulation, tightens pores, and energizes dull skin to help reduce puffiness and reveal a fresher complexion."}]'::JSONB,
  'In a small bowl, mix 2–3 teaspoons of mask powder with water, milk or rosewater to form a smooth paste. Apply evenly to a clean, damp face and neck, avoiding the eye and lip areas. Leave on for 10–15 minutes until almost dry. Wet your hands with warm water and scrub gently in circular motions before rinsing thoroughly. Pat dry and follow with your moisturizer. Use 2–3 times a week for best results.',
  'Coffee Powder, Roasted Turmeric Root Powder, Rice Flour.',
  NULL,
  'Use within 3 months of purchase. Store at room temperature in a cool, dry place with the lid tightly closed. Always use a clean, dry spoon to scoop out the product and avoid wet hands. If you have ants at home, keep the jar away from them — storing it in a plastic bag helps.',
  'Due to shipping and transit, fine powder may occasionally sift around the inner seal. Seals are applied by hand, and with zero synthetic anti-caking agents slight settling is normal. It does not affect performance, safety or quality — simply break up any clumps with a clean, dry spoon before mixing.',
  false, false, false, 0, 0
),
(
  '10000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000002',
  'Pink Himalayan Coconut Bath Salt Scrub', 'pink-himalayan-coconut-bath-salt-scrub', 'Body Scrub · 300 G',
  'Pink Himalayan salt and coconut to exfoliate, unclog pores and leave skin velvety smooth.',
  'Expertly crafted to gently remove dead skin cells, unclog pores, and stimulate surface circulation, this rejuvenating body scrub leaves your skin feeling velvety smooth and visibly glowing.',
  1750, NULL, 'LM-SCRB-PHC', '300 G',
  ARRAY['BODY SCRUB'], ARRAY['EXFOLIATION', 'DEEP HYDRATION'], NULL, '100% Natural',
  NULL, '[]'::JSONB, '[{"title":"Deeply Hydrates & Softens","desc":"Rich coconut intensely moisturizes dry skin, leaving it silky-smooth without stripping natural oils."},{"title":"Detoxifies & Mineralizes","desc":"Packed with over 84 trace minerals, pink Himalayan salt helps draw out impurities while restoring mineral balance."},{"title":"Soothes Muscle Tension","desc":"A warm soak helps relax tired, aching muscles and eases joint stiffness after long days or workouts."},{"title":"Nourishes Skin Barrier","desc":"Natural fatty acids in coconut work with bath salts to calm redness, irritation and dryness."}]'::JSONB,
  'In the shower or bath, apply a generous scoop to damp skin. Gently massage in circular motions, focusing on rough areas. Rinse thoroughly with warm water and body wash. Clean the tub of oil residue.',
  'Organic Himalayan Pink Salt, Glycerin, Coconut Oil, Rose Flower Petals, Essential Rose Flower Oil, Vitamin E.',
  'For external body use only. Do not apply to freshly shaved skin, open wounds, or broken or irritated skin. Avoid contact with eyes.',
  'Use within 3 months of purchase. Store at room temperature in a cool, dry place with the lid tightly closed. Always use a clean, dry spoon to scoop out the product and avoid wet hands. If you have ants at home, keep the jar away from them — storing it in a plastic bag helps.',
  'Due to heat and transit time, excess oils in the scrub may occasionally leak from the jar, even with a seal. Seals are applied by hand. Any slight leakage does not affect performance, and the scrub settles back at room temperature — a sign of real oils and butters.',
  false, false, false, 0, 0
),
(
  '10000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000002',
  'Shea & Silk Scrub', 'shea-silk-scrub', 'Face & Body Scrub · 250 G',
  'Raw shea butter and silk proteins polish away dead skin while drenching it in lasting moisture.',
  'Indulge your skin in the ultimate velvet-touch treatment. Our Shea & Silk Scrub blends deeply moisturizing raw shea butter with luxurious silk proteins to polish away dead skin cells while drenching your body in rich, lasting moisture.',
  2150, NULL, 'LM-SCRB-SHS', '250 G',
  ARRAY['BODY SCRUB'], ARRAY['EXFOLIATION', 'DEEP HYDRATION'], NULL, '100% Natural',
  '/images/products/shea-silk-scrub.jpg', '["/images/products/shea-silk-scrub.jpg"]'::JSONB, '[{"title":"Deep Hydration & Moisture","desc":"Rich shea butter deeply nourishes dry skin, creating a long-lasting barrier that restores softness and elasticity."},{"title":"Silky Smooth Finish","desc":"Pure silk proteins enhance skin texture, leaving your body touchably soft, smooth and velvety."},{"title":"Gently Exfoliates","desc":"Buffs away dead skin cells and dullness to reveal a fresh, healthy, radiant complexion."},{"title":"Protects & Replenishes","desc":"Packed with natural vitamins and essential fatty acids to calm irritation and support skin repair."}]'::JSONB,
  'Apply a generous scoop to damp skin on your face or body. Gently massage in circular motions, focusing on rough areas. Rinse thoroughly with warm water and body wash. Clean the tub of oil residue.',
  'Whipped Shea Butter, Organic Himalayan Pink Salt, Rice Flour, Glycerin, Coconut Oil, Vitamin E.',
  'For external body use only. Do not apply to freshly shaved skin, open wounds, or broken or irritated skin. Avoid contact with eyes.',
  'Use within 3 months of purchase. Store at room temperature in a cool, dry place with the lid tightly closed. Always use a clean, dry spoon to scoop out the product and avoid wet hands. If you have ants at home, keep the jar away from them — storing it in a plastic bag helps.',
  'Due to heat and transit time, excess oils in the scrub may occasionally leak from the jar, even with a seal. Seals are applied by hand. Any slight leakage does not affect performance, and the scrub settles back at room temperature — a sign of real oils and butters.',
  false, false, true, 0, 0
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (id, product_id, label, price_pkr, compare_price, free_delivery, is_default, sort_order) VALUES
  ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', 'Single · 100 ML', 2250, NULL, false, true, 0),
  ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000001', 'Pack of 2 · Free Delivery', 4400, 4500, true, false, 1),
  ('20000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000002', 'Single · 100 ML', 2350, NULL, false, true, 0),
  ('20000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000002', 'Pack of 2 · Free Delivery', 4600, 4700, true, false, 1),
  ('20000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000003', 'Single · 100 ML', 2450, NULL, false, true, 0),
  ('20000000-0000-4000-8000-000000000032', '10000000-0000-4000-8000-000000000003', 'Pack of 2 · Free Delivery', 4700, 4900, true, false, 1),
  ('20000000-0000-4000-8000-000000000041', '10000000-0000-4000-8000-000000000004', 'Single · 150 G', 1450, NULL, false, true, 0),
  ('20000000-0000-4000-8000-000000000042', '10000000-0000-4000-8000-000000000004', 'Pack of 2 · Free Delivery', 2600, 2900, true, false, 1),
  ('20000000-0000-4000-8000-000000000051', '10000000-0000-4000-8000-000000000005', 'Single · 300 G', 1750, NULL, false, true, 0),
  ('20000000-0000-4000-8000-000000000052', '10000000-0000-4000-8000-000000000005', 'Pack of 2 · Free Delivery', 3500, NULL, true, false, 1),
  ('20000000-0000-4000-8000-000000000061', '10000000-0000-4000-8000-000000000006', 'Single · 250 G', 2150, NULL, false, true, 0),
  ('20000000-0000-4000-8000-000000000062', '10000000-0000-4000-8000-000000000006', 'Pack of 2 · Free Delivery', 4300, NULL, true, false, 1)
ON CONFLICT (id) DO NOTHING;
