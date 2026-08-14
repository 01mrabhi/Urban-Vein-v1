import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { 
  assignShiprocketAWB, 
  generateShiprocketLabel, 
  generateShiprocketInvoice, 
  requestShiprocketPickup,
  cancelShiprocketOrder 
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
