-- =============================================================
-- LUOMU — Migration 003: flat Rs 250 delivery on every order
-- Client decision 2026-11-16: no free delivery (not over PKR 4,000, not for Pack of 2).
-- Delivery is now calculated in code; this only updates the pack labels customers see.
-- Run after 002 in the Supabase SQL Editor. Safe to run more than once.
-- =============================================================
UPDATE product_variants
SET label = 'Pack of 2', free_delivery = FALSE
WHERE label = 'Pack of 2 · Free Delivery' OR free_delivery = TRUE;
