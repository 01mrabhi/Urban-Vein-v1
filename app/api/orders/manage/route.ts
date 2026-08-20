import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { supabase } from '../../../../lib/supabase';
import { PRODUCTS } from '../../../../lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to fetch all catalog products and build lookup dictionaries
async function getProductCatalog() {
  const catalogMap = new Map<string, { name: string; image: string; category: string }>();

  // 1. Load static fallback products
  PRODUCTS.forEach((p) => {
    const info = { name: p.name, image: p.image, category: p.category || 'Oversized Collection' };
    if (p.id) catalogMap.set(p.id.toLowerCase(), info);
    if (p.original_id) catalogMap.set(p.original_id.toLowerCase(), info);
    if (p.name) {
      catalogMap.set(p.name.toLowerCase(), info);
      catalogMap.set(p.name.toLowerCase().replace(/\s+/g, '-'), info);
    }
  });

  // 2. Load live DB products from Supabase
  try {
    const { data: dbProducts } = await supabaseAdmin.from('products').select('*');
    (dbProducts || []).forEach((p: any) => {
      const info = {
        name: p.name,
        image: p.image,
        category: p.category || 'Oversized Collection',
      };
      if (p.id) catalogMap.set(p.id.toLowerCase(), info);
      if (p.original_id) catalogMap.set(p.original_id.toLowerCase(), info);
      if (p.name) {
        catalogMap.set(p.name.toLowerCase(), info);
        catalogMap.set(p.name.toLowerCase().replace(/\s+/g, '-'), info);
      }
    });
  } catch (err) {
    console.warn('Failed to load DB products for enrichment:', err);
  }

  return catalogMap;
}

function resolveProductInfo(productId: string | undefined, catalogMap: Map<string, any>) {
  if (!productId) return null;
  const raw = productId.trim().toLowerCase();

  // 1. Direct exact match
  if (catalogMap.has(raw)) return catalogMap.get(raw);

  // 2. Strip size suffix (e.g., -m, -l, -xl, -xxl, -s, -xs)
  const stripped = raw.replace(/-(s|m|l|xl|xxl|xs|2xl|3xl)$/i, '');
  if (catalogMap.has(stripped)) return catalogMap.get(stripped);

  // 3. Partial / slug search
  const cleanAlphaNum = raw.replace(/[^a-z0-9]/g, '');
  for (const [key, val] of catalogMap.entries()) {
    const keyAlphaNum = key.replace(/[^a-z0-9]/g, '');
    if (keyAlphaNum === cleanAlphaNum || (keyAlphaNum.length > 5 && cleanAlphaNum.includes(keyAlphaNum))) {
      return val;
    }
  }

  return null;
}

// GET: Fetch all orders or a single order by ID with enriched product details
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    // Build catalog map for enrichment
    const catalogMap = await getProductCatalog();

    // 1. Fetch single order by ID if specified
    if (orderId) {
      let orderRes = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .maybeSingle();

      let orderData = orderRes.data;

      if (orderRes.error || !orderData) {
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

          orderData = {
            ...singleOrder.data,
            order_items: itemsRes.data || [],
          };
        } else {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
      }

      // Enrich single order items
      if (orderData && orderData.order_items) {
        orderData.order_items = orderData.order_items.map((item: any) => {
          const info = resolveProductInfo(item.product_id, catalogMap);
          return {
            ...item,
            product_name: item.product_name || info?.name || `Product #${item.product_id}`,
            product_image: item.product_image || info?.image || '/icon.png',
            product_category: item.product_category || info?.category || 'Urban Vein Apparel',
          };
        });
      }

      return NextResponse.json({ order: orderData });
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

    // Enrich all order items with product titles, images, and categories
    const enrichedOrders = ordersData.map((order) => ({
      ...order,
      order_items: (order.order_items || []).map((item: any) => {
        const info = resolveProductInfo(item.product_id, catalogMap);
        return {
          ...item,
          product_name: item.product_name || info?.name || `Product #${item.product_id}`,
          product_image: item.product_image || info?.image || '/icon.png',
          product_category: item.product_category || info?.category || 'Urban Vein Apparel',
        };
      }),
    }));

    return NextResponse.json({
      success: true,
      orders: enrichedOrders || [],
    });
  } catch (err: any) {
    console.error('Error fetching orders in /api/orders/manage:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve orders from database' },
      { status: 500 }
    );
  }
}
