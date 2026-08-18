-- Run this SQL script in your Supabase SQL Editor (https://supabase.com/dashboard/project/dufbjrvievmuqnuhvanx/sql)

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id TEXT,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  image_back TEXT,
  category TEXT DEFAULT 'Oversized Collection',
  badge TEXT,
  is_upcoming BOOLEAN DEFAULT FALSE,
  launch_date TIMESTAMPTZ,
  is_out_of_stock BOOLEAN DEFAULT FALSE,
  stock_quantity INTEGER DEFAULT 50,
  display_order INTEGER DEFAULT 0,
  sizes JSONB DEFAULT '["S","M","L","XL","XXL"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration statement if products table already exists:
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '["S","M","L","XL","XXL"]'::jsonb;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

-- Allow service_role full access for Admin API
CREATE POLICY "Admin full access products" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Insert starter items matching initial database catalog
INSERT INTO products (original_id, name, price, description, image, image_back, category, is_out_of_stock)
VALUES
  ('1', 'Zoro Katana Tee', '₹599.00', '“Green Aura” — Inspired by Roronoa Zoro. Deep obsidian wash featuring triple katana aesthetic.', '/products/zoro_front.jpg', '/products/zoro_back.jpg', 'Graphic Series', false),
  ('2', 'Panther Strike Tee', '₹549.00', 'Vein Beast: Short, bold, and brand-connected—suggests power running through you.', '/products/panther_front.jpg', '/products/panther_back.jpg', 'Essential Solids', false),
  ('3', 'Anime White Variant', '₹549.00', 'Vow of Chaos: Feels ritualistic — like the character has embraced destruction as a path or purpose.', '/products/white_anime_front.jpg', '/products/white_anime_back.jpg', 'Graphic Series', false),
  ('4', 'Batman Series Tee', '₹599.00', 'The Knight Variant: Using "Variant" implies a unique design—it hints that this isn''t just a generic shirt, but a curated art piece.', '/products/batman_front.jpg', '/products/batman_back.jpg', 'Oversized Collection', false),
  ('5', 'CSK Edition Tee', '₹499.00', '“Roar of Champions” Captures the lion’s aggression and the winning legacy feel.', '/products/csk_front.jpg', '/products/csk_back.jpg', 'Limited Drops', false)
ON CONFLICT (id) DO NOTHING;
