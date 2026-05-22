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
),
(
  '6',
  'GOAT Tee',
  '₹500.00',
  'More than a number. It’s a legacy of grit, passion, and chasing down the impossible. Rep the king with the Forever 18 tee.',
  '/products/vk_forever_front.jpg',
  '/products/vk_forever_back.jpg',
  'Graphic Series',
  null,
  null
),
(
  '7',
  'Thala Tshirt',
  '₹500.00',
  '"Thala for a reason." The man. The myth. The jersey. Level up your match-day fit or your everyday streetwear with our exclusive MS Dhoni tribute tee. Click the link to secure yours before they sell out!',
  '/products/dhoni_front.jpg',
  '/products/dhoni_back.jpg',
  'Graphic Series',
  null,
  null
),
(
  '8',
  'Thala Last Ride',
  '₹500.00',
  'Defending the Legacy. Built for the fans who know that some legends never fade. This premium heavy-print tee is designed for the true CSK and Dhoni loyalists. Sleek, sharp, and unmistakably Thala. Drop a if you’re rocking the 7 this season. Available now!',
  '/products/dhoni_white_front.jpg',
  '/products/dhoni_white_back.jpg',
  'Oversized Collection',
  null,
  null
),
(
  '9',
  'Play Bold Tee',
  '₹500.00',
  'Form is temporary, but the love for the Challengers is permanent. Rep the red and gold in style this season.',
  '/products/rcb_design.jpg',
  null,
  'Limited Drops',
  null,
  null
);
