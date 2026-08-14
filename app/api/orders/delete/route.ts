import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

// DELETE: Remove order and its items from database
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // 1. Delete associated order items first
    await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    // 2. Delete associated whatsapp logs if any
    await supabaseAdmin
      .from('whatsapp_logs')
      .delete()
      .eq('order_id', orderId);

    // 3. Delete order record from database
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Order #ORD-${orderId.slice(0, 8).toUpperCase()} deleted permanently`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
