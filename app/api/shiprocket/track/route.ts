import { NextResponse } from 'next/server';
import { trackShiprocketShipment } from '../../../../lib/shiprocket';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const shipmentId = searchParams.get('shipment_id');
    const awbCode = searchParams.get('awb');

    let targetShipmentId = shipmentId;
    let targetAwbCode = awbCode;

    // If order_id is provided, fetch shipment details from database
    if (orderId && !targetShipmentId && !targetAwbCode) {
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('shiprocket_shipment_id, shiprocket_awb_code, status, courier_name, tracking_url')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      targetShipmentId = order.shiprocket_shipment_id;
      targetAwbCode = order.shiprocket_awb_code;

      if (!targetShipmentId && !targetAwbCode) {
        return NextResponse.json({
          status: order.status || 'processing',
          currentStatus: 'Order Placed & Preparing for Dispatch',
          awbCode: null,
          courierName: 'Delhivery / BlueDart Express',
          activities: [
            {
              date: new Date().toISOString(),
              status: 'Order Confirmed',
              location: 'Urban Vein Fulfillment Center',
              srStatus: 'Manifested',
            },
          ],
        });
      }
    }

    if (!targetShipmentId && !targetAwbCode) {
      return NextResponse.json(
        { error: 'Must provide order_id, shipment_id, or awb' },
        { status: 400 }
      );
    }

    // Call Shiprocket Tracking API
    const trackingData = await trackShiprocketShipment({
      shipmentId: targetShipmentId || undefined,
      awbCode: targetAwbCode || undefined,
    });

    return NextResponse.json(trackingData);
  } catch (error: any) {
    console.error('Error tracking shipment:', error);
    return NextResponse.json(
      {
        currentStatus: 'In Transit',
        message: error.message || 'Tracking system temporary offline',
        activities: [],
      },
      { status: 500 }
    );
  }
}
