import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

// GET: Fetch all coupons
export async function GET() {
  try {
    const { data: coupons, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coupons: coupons || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new promo code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      code,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      usage_limit,
      expires_at,
    } = body;

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json(
        { error: 'Code, discount_type, and discount_value are required' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const newCoupon = {
      code: cleanCode,
      discount_type, // 'percentage' | 'flat'
      discount_value: Number(discount_value),
      min_order_amount: min_order_amount ? Number(min_order_amount) : 0,
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      expires_at: expires_at || null,
      is_active: true,
    };

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert(newCoupon)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `Promo code "${cleanCode}" already exists!` },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Promo code "${cleanCode}" created successfully!`,
      coupon: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Toggle active status or update coupon fields
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_active, increment_usage } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    if (typeof is_active === 'boolean') {
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .update({ is_active })
        .eq('id', id)
        .select('*')
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({
        success: true,
        message: `Promo code ${data.code} status updated to ${is_active ? 'Active' : 'Inactive'}`,
        coupon: data,
      });
    }

    if (increment_usage) {
      // Increment times_used counter
      const { data: currentCoupon } = await supabaseAdmin
        .from('coupons')
        .select('times_used')
        .eq('id', id)
        .single();

      const newUsage = (currentCoupon?.times_used || 0) + 1;

      await supabaseAdmin
        .from('coupons')
        .update({ times_used: newUsage })
        .eq('id', id);

      return NextResponse.json({ success: true, times_used: newUsage });
    }

    return NextResponse.json({ error: 'No update action specified' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove coupon
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Promo code deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
