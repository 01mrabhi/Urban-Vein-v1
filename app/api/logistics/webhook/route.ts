import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

// GET route for simple browser/health check validation
export async function GET() {
  return NextResponse.json({
    status: true,
    success: true,
    code: 200,
    message: 'Shiprocket Logistics Webhook Endpoint Active',
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = 
      request.headers.get('x-api-key') || 
      request.headers.get('x-shiprocket-token') || 
      request.headers.get('authorization');
    const secretToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;

    // Optional token validation if secret is set and provided header doesn't match
    if (secretToken && authHeader && authHeader !== secretToken && authHeader !== `Bearer ${secretToken}`) {
      console.warn('Unauthorized tracking webhook invocation attempt.');
      return NextResponse.json({ status: false, error: 'Unauthorized webhook request' }, { status: 401 });
    }

    let payload: any = {};
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    console.log('Received Tracking Webhook Event Payload:', JSON.stringify(payload));

    const shiprocketOrderId = payload.order_id?.toString();
    const shipmentId = payload.shipment_id?.toString();
    const awbCode = payload.awb || payload.awb_code;
    const currentStatus = payload.current_status || payload.status;
    const courierName = payload.courier_name;
    const etd = payload.etd;

    // If it's a test ping or ping without order references, return success 200 for Shiprocket validation
    if (!shiprocketOrderId && !shipmentId && !awbCode) {
      return NextResponse.json({
        status: true,
        success: true,
        code: 200,
        message: 'Shiprocket test webhook ping received successfully',
      });
    }

    // Map Status label to local Order Status
    let dbStatus = 'processing';
    const statusLower = (currentStatus || '').toLowerCase();

    if (statusLower.includes('delivered')) {
      dbStatus = 'delivered';
    } else if (statusLower.includes('shipped') || statusLower.includes('in transit') || statusLower.includes('out for delivery') || statusLower.includes('dispatched')) {
      dbStatus = 'shipped';
    } else if (statusLower.includes('canceled') || statusLower.includes('cancelled')) {
      dbStatus = 'cancelled';
    } else if (statusLower.includes('rto') || statusLower.includes('return')) {
      dbStatus = 'rto';
    }

    // Build update object
    const updateData: any = {
      shipment_status: currentStatus,
      status: dbStatus,
    };

    if (awbCode) updateData.shiprocket_awb_code = awbCode;
    if (courierName) updateData.courier_name = courierName;
    if (etd) updateData.estimated_delivery_date = etd;
    if (awbCode) updateData.tracking_url = `https://shiprocket.co/tracking/${awbCode}`;

    // Find & update matching order in Supabase
    let query = supabaseAdmin.from('orders').update(updateData);

    if (shiprocketOrderId) {
      query = query.eq('shiprocket_order_id', shiprocketOrderId);
    } else if (shipmentId) {
      query = query.eq('shiprocket_shipment_id', shipmentId);
    } else if (awbCode) {
      query = query.eq('shiprocket_awb_code', awbCode);
    }

    const { error: dbError } = await query;

    if (dbError) {
      console.error('Failed to update order status via tracking webhook:', dbError);
      return NextResponse.json({ status: false, error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({
      status: true,
      success: true,
      code: 200,
      message: 'Shipment tracking status updated successfully',
    });
  } catch (error: any) {
    console.error('Error in tracking webhook handler:', error);
    return NextResponse.json({
      status: true,
      success: true,
      code: 200,
      message: 'Webhook handler active',
      details: error.message,
    });
  }
}
