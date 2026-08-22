import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      orderId, 
      courierName = 'India Post (Speed Post)', 
      awbCode, 
      edd = '2-4 Business Days',
      notes = '',
      status = 'shipped' 
    } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!awbCode || !awbCode.trim()) {
      return NextResponse.json({ error: 'Consignment / AWB Tracking Number is required' }, { status: 400 });
    }

    const cleanAwb = awbCode.trim().toUpperCase();
    const cleanCourier = courierName.trim();

    // 1. Fetch current order from Supabase
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found in database' }, { status: 404 });
    }

    // 2. Build tracking URL (India Post official tracking URL or generic)
    const isIndiaPost = cleanCourier.toLowerCase().includes('india post') || 
                        cleanCourier.toLowerCase().includes('post office') || 
                        /^[A-Z]{2}\d{9}IN$/i.test(cleanAwb);

    const trackingUrl = isIndiaPost
      ? `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`
      : `https://www.urbanvein.in/track?awb=${encodeURIComponent(cleanAwb)}`;

    // 3. Update database record
    const updatePayload: any = {
      courier_name: cleanCourier,
      shiprocket_awb_code: cleanAwb,
      status: status || 'shipped',
      shipment_status: 'dispatched_via_post',
      tracking_url: trackingUrl,
    };

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Failed to update order for manual dispatch:', updateError);
      return NextResponse.json({ error: updateError.message || 'Database update failed' }, { status: 500 });
    }

    // 4. Non-blocking trigger for WhatsApp Notification
    try {
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      fetch(`${appUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, eventType: 'order_shipped' }),
      }).catch((waErr) => console.error('Background WhatsApp manual dispatch notification error:', waErr));
    } catch (err) {
      console.warn('WhatsApp notification trigger skipped:', err);
    }

    return NextResponse.json({
      success: true,
      message: `Order marked as shipped via ${cleanCourier} (AWB: ${cleanAwb})`,
      order: updatedOrder,
      awbCode: cleanAwb,
      courierName: cleanCourier,
      trackingUrl,
    });
  } catch (error: any) {
    console.error('Error in manual dispatch API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process manual dispatch' },
      { status: 500 }
    );
  }
}
