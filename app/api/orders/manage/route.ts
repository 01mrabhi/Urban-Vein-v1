import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Fetch all orders or a single order by ID using secure admin service role
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    // 1. Fetch single order by ID if specified
    if (orderId) {
      let orderRes = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .maybeSingle();

      if (orderRes.error || !orderRes.data) {
        const singleOrder = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (singleOrder.data) {
          const itemsRes = await supabaseAdmin
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

          return NextResponse.json({
            order: {
              ...singleOrder.data,
              order_items: itemsRes.data || [],
            },
          });
        }
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ order: orderRes.data });
    }

    // 2. Fetch all orders (Admin CRM stream)
    let ordersData: any[] = [];

    // Attempt 1: Fetch with nested order_items via supabaseAdmin (Bypasses RLS)
    const { data: joinedOrders, error: joinError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!joinError && joinedOrders) {
      ordersData = joinedOrders;
    } else {
      console.warn('Nested join fetch failed, attempting separate queries fallback:', joinError?.message);

      // Attempt 2: Fetch orders and items separately in case of foreign key relationship caching issue
      const { data: baseOrders, error: baseOrdersError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (baseOrdersError) {
        // Attempt 3: Fallback to standard client if admin client had configuration issues
        const { data: fallbackOrders, error: fallbackError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          throw new Error(fallbackError.message || baseOrdersError.message);
        }
        ordersData = fallbackOrders || [];
      } else {
        ordersData = baseOrders || [];
      }

      // Fetch order_items for all retrieved orders
      if (ordersData.length > 0) {
        const orderIds = ordersData.map((o) => o.id);
        const { data: allItems } = await supabaseAdmin
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        const itemsByOrderId: Record<string, any[]> = {};
        (allItems || []).forEach((item: any) => {
          if (!itemsByOrderId[item.order_id]) {
            itemsByOrderId[item.order_id] = [];
          }
          itemsByOrderId[item.order_id].push(item);
        });

        ordersData = ordersData.map((order) => ({
          ...order,
          order_items: itemsByOrderId[order.id] || [],
        }));
      }
    }

    return NextResponse.json({
      success: true,
      orders: ordersData || [],
    });
  } catch (err: any) {
    console.error('Error fetching orders in /api/orders/manage:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve orders from database' },
      { status: 500 }
    );
  }
}
