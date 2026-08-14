-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/dufbjrvievmuqnuhvanx/sql)

-- 1. Create `whatsapp_logs` table for tracking notification history & audit trail
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'order_confirmed', 'order_shipped', 'order_delivered'
  message_text TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'queued'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for quick lookup by order_id
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_order_id ON whatsapp_logs(order_id);
