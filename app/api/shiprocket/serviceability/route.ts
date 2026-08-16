import { NextResponse } from 'next/server';
import { checkShiprocketServiceability } from '../../../../lib/shiprocket';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const weightParam = searchParams.get('weight');
    const weight = weightParam ? parseFloat(weightParam) : 0.5;

    if (!pincode || pincode.replace(/\D/g, '').length !== 6) {
      return NextResponse.json(
        { error: 'Valid 6-digit PIN code is required' },
        { status: 400 }
      );
    }

    // Check if Shiprocket credentials exist
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      return NextResponse.json({
        serviceable: true,
        message: 'Standard Express Shipping Available',
        fastestCourier: {
          courierName: 'Delhivery / BlueDart Express',
          etd: '3-5 Days',
          rate: 89,
          codAvailable: true,
        },
        couriers: [],
        note: 'Fallback mode active (Shiprocket API credentials pending)',
      });
    }

    const result = await checkShiprocketServiceability({
      deliveryPincode: pincode,
      weight,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Shiprocket serviceability error:', error);
    // Graceful fallback for seamless user experience
    return NextResponse.json({
      serviceable: true,
      message: 'Express Delivery Available',
      fastestCourier: {
        courierName: 'Standard Express Courier',
        etd: '3-5 Days',
        rate: 89,
        codAvailable: true,
      },
      couriers: [],
      error: error.message,
    });
  }
}
