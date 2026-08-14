import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { createShiprocketOrder, ShiprocketOrderItem } from '../../../../lib/shiprocket';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // 1. Fetch order from Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Database fetch error for order:', orderError);
      return NextResponse.json(
        { error: 'Order not found in database' },
        { status: 404 }
      );
    }

    // Check if order was already pushed to Shiprocket
    if (order.shiprocket_order_id) {
      return NextResponse.json({
        success: true,
        message: 'Order already synchronized with Shiprocket',
        shiprocketOrderId: order.shiprocket_order_id,
        shiprocketShipmentId: order.shiprocket_shipment_id,
      });
    }

    // Check credentials
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      return NextResponse.json(
        { error: 'Shiprocket API credentials missing in server environment variables' },
        { status: 500 }
      );
    }

    // 2. Parse Shipping Address & Contact
    // Address format: "Name: John Doe, House No, Street Name, Near Landmark, PIN: 110001"
    const fullAddress = order.shipping_address || 'Address Not Provided';
    
    let customerName = 'Urban Vein Customer';
    const nameMatch = fullAddress.match(/Name:\s*([^,]+)/i);
    if (nameMatch && nameMatch[1]) {
      customerName = nameMatch[1].trim();
    }

    const cleanAddress = fullAddress.replace(/^Name:\s*[^,]+,\s*/i, '');
    const addressParts = cleanAddress.split(', ');

    let houseNo = addressParts[0] || 'Flat/House';
    let streetName = addressParts.slice(1, 3).join(', ') || 'Street';
    let pincode = '110001';

    // Extract PIN code if present
    const pinMatch = fullAddress.match(/PIN:\s*(\d{6})/i) || fullAddress.match(/(\d{6})/);
    if (pinMatch && pinMatch[1]) {
      pincode = pinMatch[1];
    }

    // Clean phone number (Ensure 10 digits)
    const cleanPhone = (order.phone || '9999999999').replace(/\D/g, '').slice(-10);

    // Format Order Items
    const shiprocketItems: ShiprocketOrderItem[] = (order.order_items || []).map((item: any) => ({
      name: `Urban Vein Item #${item.product_id}`,
      sku: `UV-PROD-${item.product_id}-${item.size || 'STD'}`.toUpperCase(),
      units: item.quantity || 1,
      selling_price: item.price || 0,
      discount: 0,
      tax: 0,
    }));

    if (shiprocketItems.length === 0) {
      shiprocketItems.push({
        name: `Urban Vein Fashion Apparel Order #${order.id.slice(0, 8)}`,
        sku: `UV-ORDER-${order.id.slice(0, 8)}`,
        units: 1,
        selling_price: order.total_amount || 999,
      });
    }

    const orderDate = new Date(order.created_at || Date.now())
      .toISOString()
      .replace('T', ' ')
      .slice(0, 16);

    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Home';

    // Split Customer Name into First & Last Name for Shiprocket validation
    const nameParts = customerName.split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '.';

    // Ensure billing_address is at least 10 characters long
    let fullBillingAddress = cleanAddress.replace(/,\s*PIN:\s*\d{6}/i, '').trim();
    if (fullBillingAddress.length < 10) {
      fullBillingAddress = `${fullBillingAddress}, Urban Vein Order`;
    }

    // 3. Build Payload
    const payload = {
      order_id: `UV-${order.id.slice(0, 8).toUpperCase()}`,
      order_date: orderDate,
      pickup_location: pickupLocation,
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: fullBillingAddress,
      billing_address_2: '',
      billing_city: 'Panchkula',
      billing_pincode: pincode,
      billing_state: 'Haryana',
      billing_country: 'India',
      billing_email: 'customer@urbanvein.in',
      billing_phone: cleanPhone,
      shipping_is_billing: true,
      order_items: shiprocketItems,
      payment_method: (order.payment_method === 'cod' ? 'COD' : 'Prepaid') as 'Prepaid' | 'COD',
      sub_total: order.total_amount || 0,
      length: 25, // Package dimensions default (cm)
      breadth: 20,
      width: 20,
      height: 5,
      weight: 0.5, // Package weight default (kg)
    };

    // 4. Send to Shiprocket API
    const srResponse = await createShiprocketOrder(payload);

    // 5. Update Supabase Order record with Shiprocket IDs
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        shiprocket_order_id: srResponse.orderId.toString(),
        shiprocket_shipment_id: srResponse.shipmentId.toString(),
        shipment_status: 'created',
        courier_name: srResponse.courierName || null,
        shiprocket_awb_code: srResponse.awbCode || null,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to save Shiprocket reference to database:', updateError);
      return NextResponse.json(
        { error: `Shiprocket created order #${srResponse.orderId}, but database save failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order pushed to Shiprocket successfully',
      shiprocketOrderId: srResponse.orderId,
      shiprocketShipmentId: srResponse.shipmentId,
      status: srResponse.status,
    });
  } catch (error: any) {
    console.error('Error creating order in Shiprocket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order on Shiprocket' },
      { status: 500 }
    );
  }
}
