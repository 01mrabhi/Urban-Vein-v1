import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { 
  assignShiprocketAWB, 
  generateShiprocketLabel, 
  generateShiprocketInvoice, 
  requestShiprocketPickup,
  cancelShiprocketOrder,
  getShiprocketOrderDetails,
  trackShiprocketShipment
} from '../../../../lib/shiprocket';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, orderId, shipmentId, courierId, shiprocketOrderId } = body;

    if (!action || !orderId) {
      return NextResponse.json(
        { error: 'Action and Order ID are required' },
        { status: 400 }
      );
    }

    // 1. Fetch current order details
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentShipmentId = shipmentId || order.shiprocket_shipment_id;
    const currentSrOrderId = shiprocketOrderId || order.shiprocket_order_id;

    // 2. Perform requested Admin Action
    switch (action) {
      case 'assign_awb': {
        if (!currentShipmentId) {
          return NextResponse.json(
            { error: 'Shipment ID not found. Push order to Shiprocket first.' },
            { status: 400 }
          );
        }

        const awbResult = await assignShiprocketAWB(currentShipmentId, courierId);

        // Update DB with AWB info
        await supabaseAdmin
          .from('orders')
          .update({
            shiprocket_awb_code: awbResult.awbCode,
            courier_name: awbResult.courierName,
            status: 'shipped',
            shipment_status: 'awb_assigned',
          })
          .eq('id', orderId);

        // Non-blocking trigger for WhatsApp Shipment Notification
        try {
          const appUrl = process.env.APP_URL || 'http://localhost:3000';
          fetch(`${appUrl}/api/whatsapp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, eventType: 'order_shipped' }),
          }).catch((waErr) => console.error('Background WhatsApp tracking notification error:', waErr));
        } catch (err) {
          console.warn('WhatsApp tracking trigger skipped:', err);
        }

        return NextResponse.json({
          success: true,
          message: `AWB ${awbResult.awbCode} assigned via ${awbResult.courierName}`,
          awbCode: awbResult.awbCode,
          courierName: awbResult.courierName,
        });
      }

      case 'generate_label': {
        if (!currentShipmentId) {
          return NextResponse.json(
            { error: 'Shipment ID required for generating label.' },
            { status: 400 }
          );
        }

        const labelResult = await generateShiprocketLabel(currentShipmentId);

        return NextResponse.json({
          success: true,
          labelUrl: labelResult.labelUrl,
        });
      }

      case 'generate_invoice': {
        if (!currentSrOrderId) {
          return NextResponse.json(
            { error: 'Shiprocket Order ID required for generating invoice.' },
            { status: 400 }
          );
        }

        const invoiceResult = await generateShiprocketInvoice(currentSrOrderId);

        return NextResponse.json({
          success: true,
          invoiceUrl: invoiceResult.invoiceUrl,
        });
      }

      case 'request_pickup': {
        if (!currentShipmentId) {
          return NextResponse.json(
            { error: 'Shipment ID required to request pickup.' },
            { status: 400 }
          );
        }

        await requestShiprocketPickup(currentShipmentId);

        await supabaseAdmin
          .from('orders')
          .update({ shipment_status: 'pickup_scheduled' })
          .eq('id', orderId);

        return NextResponse.json({
          success: true,
          message: 'Courier pickup scheduled successfully',
        });
      }

      case 'cancel_order': {
        if (!currentSrOrderId) {
          return NextResponse.json(
            { error: 'Shiprocket Order ID missing for cancellation.' },
            { status: 400 }
          );
        }

        await cancelShiprocketOrder([currentSrOrderId]);

        await supabaseAdmin
          .from('orders')
          .update({
            status: 'cancelled',
            shipment_status: 'cancelled',
          })
          .eq('id', orderId);

        return NextResponse.json({
          success: true,
          message: 'Order cancelled on Shiprocket and local database',
        });
      }

      case 'sync_order': {
        if (!currentSrOrderId && !currentShipmentId) {
          return NextResponse.json(
            { error: 'Shiprocket Order ID or Shipment ID required to sync.' },
            { status: 400 }
          );
        }

        const syncedData: any = {};

        // 1. Try fetching order details via Shiprocket Order ID
        if (currentSrOrderId) {
          try {
            const details = await getShiprocketOrderDetails(currentSrOrderId);
            if (details.awbCode) syncedData.shiprocket_awb_code = details.awbCode;
            if (details.courierName) syncedData.courier_name = details.courierName;
            if (details.shipmentId) syncedData.shiprocket_shipment_id = details.shipmentId;
            if (details.status) syncedData.shipment_status = details.status;
            if (details.awbCode) syncedData.status = 'shipped';
          } catch (err) {
            console.warn('Sync via Order ID failed, attempting shipment tracking:', err);
          }
        }

        // 2. If AWB not yet found, try tracking via Shipment ID
        if (!syncedData.shiprocket_awb_code && currentShipmentId) {
          try {
            const trackRes = await trackShiprocketShipment({ shipmentId: currentShipmentId });
            if (trackRes.awbCode) syncedData.shiprocket_awb_code = trackRes.awbCode;
            if (trackRes.courierName) syncedData.courier_name = trackRes.courierName;
            if (trackRes.currentStatus) syncedData.shipment_status = trackRes.currentStatus;
            if (trackRes.awbCode) syncedData.status = 'shipped';
          } catch (err) {
            console.warn('Tracking by shipment ID fallback failed:', err);
          }
        }

        if (Object.keys(syncedData).length > 0) {
          await supabaseAdmin
            .from('orders')
            .update(syncedData)
            .eq('id', orderId);

          return NextResponse.json({
            success: true,
            message: `Synced with Shiprocket: AWB ${syncedData.shiprocket_awb_code || 'Pending'} (${syncedData.courier_name || 'Assigned'})`,
            awbCode: syncedData.shiprocket_awb_code,
            courierName: syncedData.courier_name,
            shipmentStatus: syncedData.shipment_status,
          });
        }

        return NextResponse.json({
          success: true,
          message: 'Order checked with Shiprocket (No AWB assigned yet)',
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error handling admin shiprocket action:', error);
    return NextResponse.json(
      { error: error.message || 'Admin action failed' },
      { status: 500 }
    );
  }
}
