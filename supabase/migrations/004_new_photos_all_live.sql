-- =============================================================
-- LUOMU — Migration 004: client photos (2026-11-16), all 6 products live
-- Face Mask and Bath Salt Scrub get their photos and go live; Almond & Tea Tree gets a sharper photo.
-- Run after 003 in the Supabase SQL Editor. Safe to run more than once.
-- (Image files ship with the site in frontend/public/images/products/.)
-- =============================================================
UPDATE products SET
  primary_image_url = '/images/products/face-mask.jpg',
  images = '["/images/products/face-mask.jpg"]'::JSONB,
  is_active = TRUE
WHERE slug = 'daily-grind-glow-face-mask';

UPDATE products SET
  primary_image_url = '/images/products/bath-salt-scrub.jpg',
  images = '["/images/products/bath-salt-scrub.jpg"]'::JSONB,
  is_active = TRUE
WHERE slug = 'pink-himalayan-coconut-bath-salt-scrub';

UPDATE products SET
  primary_image_url = '/images/products/almond-tea-tree-silk.jpg',
  images = '["/images/products/almond-tea-tree-silk.jpg","/images/products/almond-tea-tree.jpg","/images/products/oil-trio-linen.jpg"]'::JSONB
WHERE slug = 'almond-tea-tree-glow-oil';
