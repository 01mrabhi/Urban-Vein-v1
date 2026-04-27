-- 1. Add image_back column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_back text;

-- 2. Clear existing products
DELETE FROM products;

-- 3. Insert new products
INSERT INTO products (original_id, name, price, description, image, image_back, category, badge, action_type) VALUES
(
  '1', 
  'Zoro Katana Tee', 
  '₹599.00', 
  '“Green Aura” — Inspired by the signature green energy and presence of Roronoa Zoro, the name represents calm intensity, inner strength, and silent dominance.', 
  '/products/zoro_front.jpg', 
  '/products/zoro_back.jpg', 
  'Graphic Series', 
  null, 
  null
),
(
  '2', 
  'Panther Strike Tee', 
  '₹549.00', 
  'Vein Beast: Short, bold, and brand-connected—suggests power running through you.', 
  '/products/panther_front.jpg', 
  '/products/panther_back.jpg', 
  'Limited Drops', 
  null, 
  null
),
(
  '3', 
  'Anime White Variant', 
  '₹549.00', 
  'Vow of Chaos: Feels ritualistic — like the character has embraced destruction as a path or purpose', 
  '/products/white_anime_front.jpg', 
  '/products/white_anime_back.jpg', 
  'Graphic Series', 
  null, 
  null
),
(
  '4', 
  'Batman Series Tee', 
  '₹599.00', 
  'The Knight Variant: Using "Variant" implies a unique design—it hints that this isn''t just a generic shirt, but a curated art piece.', 
  '/products/batman_front.jpg', 
  '/products/batman_back.jpg', 
  'Oversized Collection', 
  null, 
  null
),
(
  '5', 
  'CSK Edition Tee', 
  '₹499.00', 
  '“Roar of Champions” Captures the lion’s aggression and the winning legacy feel.', 
  '/products/csk_front.jpg', 
  '/products/csk_back.jpg', 
  'Essential Solids', 
  null, 
  null
);
