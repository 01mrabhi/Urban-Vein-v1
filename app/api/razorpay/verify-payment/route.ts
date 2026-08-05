import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '../../../../lib/razorpay';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    // Cryptographically verify HMAC-SHA256 signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error('Invalid Razorpay signature for order:', order_id);
      
      // Update DB to mark payment as failed
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'failed',
        })
        .eq('id', order_id);

      return NextResponse.json(
        { error: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    // Update order status in Supabase
    const { error: dbError } = await supabaseAdmin
      .from('orders')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'captured',
        status: 'processing',
      })
      .eq('id', order_id);

    if (dbError) {
      console.error('Error updating order status in database after payment:', dbError);
      return NextResponse.json(
        { error: 'Payment verified, but database update failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order updated successfully',
    });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
