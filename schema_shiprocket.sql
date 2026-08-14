-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/dufbjrvievmuqnuhvanx/sql)

-- 1. Add Shiprocket logistics tracking columns to `orders` table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_awb_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_status TEXT DEFAULT 'unfulfilled';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date TEXT;

-- 2. Add performance indexes for quick lookups by Shiprocket IDs & AWB codes for webhooks
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id ON orders(shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_shipment_id ON orders(shiprocket_shipment_id);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_awb_code ON orders(shiprocket_awb_code);
