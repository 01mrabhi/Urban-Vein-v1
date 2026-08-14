import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body as { code: string; subtotal: number };

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json(
        { error: 'Promo code and cart subtotal are required' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Fetch coupon details from Supabase DB
    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: `Promo code "${cleanCode}" is invalid or does not exist.` },
        { status: 404 }
      );
    }

    // 2. Validation Checks
    if (!coupon.is_active) {
      return NextResponse.json(
        { valid: false, error: `Promo code "${cleanCode}" is currently inactive.` },
        { status: 400 }
      );
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: `Promo code "${cleanCode}" has expired.` },
        { status: 400 }
      );
    }

    if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
      return NextResponse.json(
        { valid: false, error: `Promo code "${cleanCode}" has reached its maximum redemption limit.` },
        { status: 400 }
      );
    }

    const minSpend = coupon.min_order_amount || 0;
    if (subtotal < minSpend) {
      return NextResponse.json(
        { 
          valid: false, 
          error: `Add ₹${(minSpend - subtotal).toLocaleString()} more to your cart to use code "${cleanCode}" (Min spend: ₹${minSpend.toLocaleString()}).` 
        },
        { status: 400 }
      );
    }

    // 3. Discount Calculation
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round(subtotal * (coupon.discount_value / 100));
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = Number(coupon.max_discount_amount);
      }
    } else if (coupon.discount_type === 'flat') {
      discountAmount = Math.min(Number(coupon.discount_value), subtotal);
    }

    const newTotal = Math.max(0, subtotal - discountAmount);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      maxDiscountAmount: coupon.max_discount_amount,
      minOrderAmount: coupon.min_order_amount,
      discountAmount,
      newTotal,
      message: `Promo code ${coupon.code} applied successfully! You saved ₹${discountAmount.toLocaleString()}`,
    });
  } catch (err: any) {
    console.error('Error validating coupon:', err);
    return NextResponse.json(
      { valid: false, error: err.message || 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
