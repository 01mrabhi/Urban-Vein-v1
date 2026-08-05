# Razorpay Integration Walkthrough & Guide

Production-ready Razorpay payment integration has been implemented for Urban Vein.

## Features Implemented

1. **Live Environment Configuration (`.env.local`)**:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_TLfx2WZZnTOpac`
   - `RAZORPAY_KEY_SECRET=4RcoNJhPOeOU3dV9PTKvDmKo`
   - `RAZORPAY_WEBHOOK_SECRET=urbanvein_razorpay_webhook_secret_2026`

2. **Cryptographic Server-Side Verification (`app/api/razorpay/...`)**:
   - `POST /api/razorpay/create-order`: Server-side creation of Razorpay order with amount converted to paise.
   - `POST /api/razorpay/verify-payment`: Server-side HMAC-SHA256 signature verification preventing client-side payment forgery.
   - `POST /api/razorpay/webhook`: Asynchronous webhook handler for `payment.captured` & `payment.failed` event reconciliation.

3. **Frontend Checkout UX (`app/checkout/page.tsx`)**:
   - Selectable payment options between **Online Payment (Razorpay: UPI, Cards, NetBanking)** and **WhatsApp Checkout**.
   - Dynamic loading of Razorpay JS Checkout SDK.
   - Custom branding theme matching Urban Vein's red/dark aesthetic (`#dc2626`).

4. **Order Confirmation Page (`app/success/page.tsx`)**:
   - Displays real order reference and Razorpay Payment ID.

---

## 🛠️ Next Steps & Setup Instructions

### 1. Execute SQL Migration in Supabase
Copy and run the contents of [schema_razorpay.sql](file:///c:/Users/Lenovo/Desktop/Abhishek/projects/elegant-e-commerce/schema_razorpay.sql) in your [Supabase SQL Editor](https://supabase.com/dashboard/project/dufbjrvievmuqnuhvanx/sql):

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
```

---

### 2. How to Add Webhooks in Razorpay Dashboard

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings** -> **Webhooks** from the left navigation bar.
3. Click **+ Add New Webhook**.
4. Enter Webhook URL:
   - **Production**: `https://yourdomain.com/api/razorpay/webhook`
   - **Local Testing**: Use ngrok (`ngrok http 3000`), then enter `https://<ngrok-id>.ngrok-free.app/api/razorpay/webhook`.
5. Enter **Secret**: `urbanvein_razorpay_webhook_secret_2026` (must match `RAZORPAY_WEBHOOK_SECRET` in `.env.local`).
6. Select Active Events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
7. Click **Save / Create Webhook**.

---

### 3. How to Get Supabase Service Role Key

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project (`dufbjrvievmuqnuhvanx`).
3. Click on **Project Settings** (gear icon in left menu) -> **API**.
4. Under **Project API Keys**, locate `service_role` (Secret / Admin Key).
5. Copy the key and add it to your `.env.local` file:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=ey...your_service_role_key_here...
   ```
