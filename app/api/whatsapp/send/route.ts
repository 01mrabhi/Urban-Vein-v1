import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { sendWhatsAppNotification, WhatsAppEventType } from '../../../../lib/whatsapp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, eventType } = body as { orderId: string; eventType: WhatsAppEventType };

    if (!orderId || !eventType) {
      return NextResponse.json(
        { error: 'Order ID and eventType are required' },
        { status: 400 }
      );
    }

    // 1. Fetch order details from database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.phone) {
      return NextResponse.json(
        { error: 'Order has no customer phone number associated' },
        { status: 400 }
      );
    }

    // 2. Dispatch WhatsApp Notification
    const result = await sendWhatsAppNotification(eventType, {
      orderId: order.id,
      phone: order.phone,
      totalAmount: order.total_amount,
      courierName: order.courier_name,
      awbCode: order.shiprocket_awb_code,
      trackingUrl: order.tracking_url,
      itemsCount: order.order_items?.length || 1,
    });

    // 3. Save log in `whatsapp_logs` table in Supabase
    const { error: logError } = await supabaseAdmin.from('whatsapp_logs').insert({
      order_id: order.id,
      phone: result.phone,
      event_type: eventType,
      message_text: result.messageText,
      status: result.apiSent ? 'sent' : 'manual_ready',
    });

    if (logError) {
      console.warn('Could not record whatsapp_log entry in database:', logError);
    }

    return NextResponse.json({
      success: true,
      message: `WhatsApp notification for ${eventType} processed`,
      apiSent: result.apiSent,
      deepLink: result.deepLink,
      messageText: result.messageText,
    });
  } catch (error: any) {
    console.error('Error processing WhatsApp notification route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process WhatsApp notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const { data: logs, error } = await supabaseAdmin
      .from('whatsapp_logs')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (err: any) {
    return NextResponse.json({ logs: [] });
  }
}
