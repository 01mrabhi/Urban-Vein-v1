import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '../../../../lib/razorpay';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid Webhook signature');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        await supabaseAdmin
          .from('orders')
          .update({
            razorpay_payment_id: razorpayPaymentId,
            payment_status: 'captured',
            status: 'processing',
          })
          .eq('razorpay_order_id', razorpayOrderId);
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'failed',
          })
          .eq('razorpay_order_id', razorpayOrderId);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
