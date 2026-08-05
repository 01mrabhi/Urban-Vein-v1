-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/dufbjrvievmuqnuhvanx/sql)

-- 1. Add Razorpay tracking columns to `orders` table if they do not exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- 2. Add an index for quick lookup by razorpay_order_id for webhooks & verification
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
