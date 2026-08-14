-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/dufbjrvievmuqnuhvanx/sql)

-- 1. Create `coupons` table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC DEFAULT NULL, -- Max cap for percentage discounts
  usage_limit INTEGER DEFAULT NULL,         -- Total max redemptions (NULL for unlimited)
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for fast uppercase code lookup
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (UPPER(code));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Public read access for active coupons validation, full service role access for admin management
CREATE POLICY "Allow public read active coupons" ON coupons
  FOR SELECT
  USING (true);

CREATE POLICY "Allow server service role full access" ON coupons
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Insert starter sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
VALUES 
  ('URBAN20', 'percentage', 20, 999, 500, true),
  ('WELCOME100', 'flat', 100, 499, NULL, true)
ON CONFLICT (code) DO NOTHING;
