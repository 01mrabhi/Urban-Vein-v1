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

    let fetchedOrder: any = null;

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

      fetchedOrder = order;
      targetShipmentId = order.shiprocket_shipment_id;
      targetAwbCode = order.shiprocket_awb_code;

      if (!targetShipmentId && !targetAwbCode) {
        return NextResponse.json({
          status: order.status || 'processing',
          currentStatus: 'Order Placed & Preparing for Dispatch',
          awbCode: null,
          courierName: order.courier_name || 'Assigned Courier Partner',
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

    // If tracking API didn't return a courier name, fallback to database courier_name
    if (!trackingData.courierName && fetchedOrder?.courier_name) {
      trackingData.courierName = fetchedOrder.courier_name;
    }

    // Auto-update database record if AWB or courier is resolved
    if (orderId && (trackingData.awbCode || trackingData.courierName)) {
      try {
        const updatePayload: any = {
          status: 'shipped',
          shipment_status: trackingData.currentStatus || 'in_transit',
        };
        if (trackingData.awbCode) updatePayload.shiprocket_awb_code = trackingData.awbCode;
        if (trackingData.courierName) updatePayload.courier_name = trackingData.courierName;

        await supabaseAdmin
          .from('orders')
          .update(updatePayload)
          .eq('id', orderId);
      } catch (dbErr) {
        console.warn('Auto-save tracking info to DB failed:', dbErr);
      }
    }

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
