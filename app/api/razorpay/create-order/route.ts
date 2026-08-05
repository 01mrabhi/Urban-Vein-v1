import { NextResponse } from 'next/server';
import { razorpay } from '../../../../lib/razorpay';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    // Create order on Razorpay servers
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${orderId.slice(0, 20)}`,
      notes: {
        supabase_order_id: orderId,
      },
    });

    // Update Supabase order record with razorpay_order_id
    const { error: dbError } = await supabaseAdmin
      .from('orders')
      .update({
        razorpay_order_id: razorpayOrder.id,
        payment_status: 'pending',
      })
      .eq('id', orderId);

    if (dbError) {
      console.error('Failed to link Razorpay Order ID to Supabase Order:', dbError);
    }

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
