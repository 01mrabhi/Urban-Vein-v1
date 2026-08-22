import { NextResponse } from 'next/server';
import { trackShiprocketShipment } from '../../../../lib/shiprocket';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

function isIndiaPostShipment(courierName?: string | null, awbCode?: string | null): boolean {
  if (courierName) {
    const c = courierName.toLowerCase();
    if (c.includes('india post') || c.includes('post office') || c.includes('speed post') || c.includes('registered post')) {
      return true;
    }
  }
  if (awbCode && /^[A-Za-z]{2}\d{9}[A-Za-z]{2}$/i.test(awbCode.trim())) {
    return true;
  }
  return false;
}

function buildIndiaPostTracking(order: any, awbCode: string) {
  const isDelivered = order?.status === 'delivered';
  const orderDate = order?.created_at ? new Date(order.created_at) : new Date();
  const dispatchDate = order?.updated_at ? new Date(order.updated_at) : new Date(orderDate.getTime() + 1000 * 60 * 60 * 4);
  const transitDate = new Date(dispatchDate.getTime() + 1000 * 60 * 60 * 12);

  const activities = [
    {
      date: orderDate.toISOString(),
      status: 'Order Confirmed & Quality Checked',
      location: 'Urban Vein Fulfillment Center',
      srStatus: 'Order Processed',
    },
    {
      date: dispatchDate.toISOString(),
      status: 'Booked at India Post Office (Consignment Manifested)',
      location: 'Local Postal Booking Counter',
      srStatus: 'Manifested & Dispatched',
    },
    {
      date: transitDate.toISOString(),
      status: 'In Transit via Speed Post Express Network',
      location: 'National Sorting Hub (RMS)',
      srStatus: 'In Transit',
    },
  ];

  if (isDelivered) {
    activities.push({
      date: new Date().toISOString(),
      status: 'Delivered to Consignee / Doorstep Handover',
      location: order?.shipping_city ? `${order.shipping_city} Delivery Post Office` : 'Destination Post Office',
      srStatus: 'Delivered',
    });
  }

  return {
    trackStatus: isDelivered ? 3 : 1,
    currentStatus: isDelivered ? 'Delivered' : 'In Transit (Speed Post)',
    awbCode: awbCode || order?.shiprocket_awb_code || 'Assigned on Dispatch',
    courierName: order?.courier_name || 'India Post (Speed Post)',
    origin: 'Urban Vein Fulfillment Center',
    destination: order?.shipping_city ? `${order.shipping_city}${order?.shipping_state ? ', ' + order.shipping_state : ''}` : 'Customer Delivery Address',
    edd: '2-4 Business Days',
    isIndiaPost: true,
    officialTrackingUrl: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx',
    activities,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const shipmentId = searchParams.get('shipment_id');
    const awbCode = searchParams.get('awb');

    let targetShipmentId = shipmentId;
    let targetAwbCode = awbCode;
    let fetchedOrder: any = null;

    // 1. If order_id is provided, fetch order details from database
    if (orderId) {
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      fetchedOrder = order;
      targetShipmentId = order.shiprocket_shipment_id;
      targetAwbCode = order.shiprocket_awb_code;

      // Check if this order is an India Post or manual courier shipment
      if (isIndiaPostShipment(order.courier_name, targetAwbCode) || (!targetShipmentId && targetAwbCode)) {
        return NextResponse.json(buildIndiaPostTracking(order, targetAwbCode || ''));
      }

      // If no shipment or AWB assigned yet
      if (!targetShipmentId && !targetAwbCode) {
        return NextResponse.json({
          status: order.status || 'processing',
          currentStatus: 'Order Placed & Preparing for Dispatch',
          awbCode: null,
          courierName: order.courier_name || 'Assigned Courier Partner',
          activities: [
            {
              date: order.created_at || new Date().toISOString(),
              status: 'Order Confirmed',
              location: 'Urban Vein Fulfillment Center',
              srStatus: 'Manifested',
            },
          ],
        });
      }
    }

    // 2. If AWB is provided directly without order_id
    if (targetAwbCode && !targetShipmentId) {
      // Check database to see if this AWB belongs to an India Post or manual order
      const { data: dbOrder } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('shiprocket_awb_code', targetAwbCode)
        .maybeSingle();

      if (dbOrder) {
        fetchedOrder = dbOrder;
        targetShipmentId = dbOrder.shiprocket_shipment_id;

        if (isIndiaPostShipment(dbOrder.courier_name, targetAwbCode) || !targetShipmentId) {
          return NextResponse.json(buildIndiaPostTracking(dbOrder, targetAwbCode));
        }
      } else if (isIndiaPostShipment(null, targetAwbCode)) {
        // Direct India Post format AWB not yet tied to fetched DB order
        return NextResponse.json(buildIndiaPostTracking(null, targetAwbCode));
      }
    }

    if (!targetShipmentId && !targetAwbCode) {
      return NextResponse.json(
        { error: 'Must provide order_id, shipment_id, or awb' },
        { status: 400 }
      );
    }

    // 3. Regular Shiprocket Tracking
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
