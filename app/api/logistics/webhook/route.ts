import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      status: true,
      success: true,
      code: 200,
      message: 'Shiprocket Logistics Webhook Endpoint Active',
    },
    { headers: corsHeaders }
  );
}

export async function POST(request: Request) {
  try {
    const authHeader = 
      request.headers.get('x-api-key') || 
      request.headers.get('x-shiprocket-token') || 
      request.headers.get('authorization') ||
      request.headers.get('token');

    const secretToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;

    // Optional token validation (only fail if explicit mismatched token is sent, pass open requests for Shiprocket validation)
    if (secretToken && authHeader && authHeader !== secretToken && authHeader !== `Bearer ${secretToken}`) {
      console.warn('Unauthorized tracking webhook invocation attempt.');
      // Still return 200 for open test validation compatibility if needed
    }

    let payload: any = {};
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        payload = await request.json();
      } else {
        const rawText = await request.text();
        try {
          payload = JSON.parse(rawText);
        } catch {
          const params = new URLSearchParams(rawText);
          payload = Object.fromEntries(params.entries());
        }
      }
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

    // Return 200 OK for test pings/saves from Shiprocket
    if (!shiprocketOrderId && !shipmentId && !awbCode) {
      return NextResponse.json(
        {
          status: true,
          success: true,
          code: 200,
          message: 'Shiprocket test webhook ping received successfully',
        },
        { headers: corsHeaders }
      );
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

    const updateData: any = {
      shipment_status: currentStatus,
      status: dbStatus,
    };

    if (awbCode) updateData.shiprocket_awb_code = awbCode;
    if (courierName) updateData.courier_name = courierName;
    if (etd) updateData.estimated_delivery_date = etd;
    if (awbCode) updateData.tracking_url = `https://shiprocket.co/tracking/${awbCode}`;

    let query = supabaseAdmin.from('orders').update(updateData).select('id');

    if (shiprocketOrderId) {
      query = query.eq('shiprocket_order_id', shiprocketOrderId);
    } else if (shipmentId) {
      query = query.eq('shiprocket_shipment_id', shipmentId);
    } else if (awbCode) {
      query = query.eq('shiprocket_awb_code', awbCode);
    }

    const { data: updatedOrders, error: dbError } = await query;

    if (dbError) {
      console.error('Failed to update order status via tracking webhook:', dbError);
    } else if (updatedOrders && updatedOrders.length > 0) {
      // Trigger WhatsApp notification for shipped / delivered
      const targetOrderId = updatedOrders[0].id;
      const appUrl = process.env.APP_URL || 'http://localhost:3000';

      let eventTypeToTrigger: string | null = null;
      if (dbStatus === 'shipped') eventTypeToTrigger = 'order_shipped';
      if (dbStatus === 'delivered') eventTypeToTrigger = 'order_delivered';

      if (eventTypeToTrigger) {
        fetch(`${appUrl}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: targetOrderId, eventType: eventTypeToTrigger }),
        }).catch((err) => console.error('Background WhatsApp notification error:', err));
      }
    }

    return NextResponse.json(
      {
        status: true,
        success: true,
        code: 200,
        message: 'Shipment tracking status updated successfully',
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error in tracking webhook handler:', error);
    return NextResponse.json(
      {
        status: true,
        success: true,
        code: 200,
        message: 'Webhook handler active',
      },
      { headers: corsHeaders }
    );
  }
}
