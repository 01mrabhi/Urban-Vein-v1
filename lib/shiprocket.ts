const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

interface ShiprocketTokenCache {
  token: string | null;
  expiresAt: number | null;
}

const tokenCache: ShiprocketTokenCache = {
  token: null,
  expiresAt: null,
};

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: number | string;
}

export interface ShiprocketCreateOrderPayload {
  order_id: string;
  order_date: string; // "YYYY-MM-DD HH:MM"
  pickup_location: string;
  channel_id?: string;
  comment?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number; // cm
  breadth: number; // cm
  width?: number; // cm
  height: number; // cm
  weight: number; // kg
}

export interface ServiceabilityParams {
  pickupPincode?: string;
  deliveryPincode: string;
  weight?: number; // default 0.5kg
  cod?: boolean;
}

/**
 * Obtain authenticated Shiprocket JWT token with auto-caching
 */
export async function getShiprocketAuthToken(forceRefresh = false): Promise<string> {
  const now = Date.now();

  // Return cached token if valid (expires in 10 days, refresh if older than 8 days)
  if (!forceRefresh && tokenCache.token && tokenCache.expiresAt && now < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD environment variables are missing.');
  }

  try {
    const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      console.error('Shiprocket login error:', data);
      throw new Error(data.message || data.error || 'Failed to authenticate with Shiprocket API');
    }

    // Token valid for ~10 days. Cache for 8 days (in milliseconds)
    tokenCache.token = data.token;
    tokenCache.expiresAt = now + 8 * 24 * 60 * 60 * 1000;

    return data.token;
  } catch (err: any) {
    console.error('Error fetching Shiprocket Auth Token:', err);
    throw err;
  }
}

/**
 * Check courier serviceability & estimated delivery date for a pincode
 */
export async function checkShiprocketServiceability(params: ServiceabilityParams) {
  const token = await getShiprocketAuthToken();

  const pickupPostcode = params.pickupPincode || process.env.SHIPROCKET_PICKUP_PINCODE || '110001';
  const weight = params.weight || 0.5;
  const cod = params.cod ? 1 : 0;

  const url = new URL(`${SHIPROCKET_BASE_URL}/courier/serviceability/`);
  url.searchParams.append('pickup_postcode', pickupPostcode);
  url.searchParams.append('delivery_postcode', params.deliveryPincode);
  url.searchParams.append('weight', weight.toString());
  url.searchParams.append('cod', cod.toString());

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok || data.status === 404 || data.status === 400) {
    return {
      serviceable: false,
      message: data.message || 'Pincode not serviceable by Shiprocket couriers',
      couriers: [],
    };
  }

  const recommendedCourier = data.data?.recommended_courier_company_id;
  const availableCouriers = data.data?.available_courier_companies || [];

  const fastestCourier = availableCouriers.length > 0
    ? availableCouriers.reduce((prev: any, current: any) =>
        Number(prev.etd_hours || 999) < Number(current.etd_hours || 999) ? prev : current
      )
    : null;

  return {
    serviceable: availableCouriers.length > 0,
    recommendedCourier,
    fastestCourier: fastestCourier
      ? {
          courierName: fastestCourier.courier_name,
          etd: fastestCourier.etd,
          rate: fastestCourier.rate,
          codAvailable: fastestCourier.cod === 1,
        }
      : null,
    couriers: availableCouriers,
    city: data.data?.delivery_city || '',
    state: data.data?.delivery_state || '',
  };
}

/**
 * Push order to Shiprocket (Custom Order API)
 */
export async function createShiprocketOrder(payload: ShiprocketCreateOrderPayload) {
  const token = await getShiprocketAuthToken();

  const res = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.status_code === 400 || data.status_code === 404 || data.message === 'Invalid Data') {
    console.error('Shiprocket order creation error response:', data);
    let detailMsg = data.message || 'Failed to create order on Shiprocket';
    if (data.errors) {
      if (typeof data.errors === 'object') {
        const errList = Object.entries(data.errors).map(([field, msgs]: any) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`);
        if (errList.length > 0) detailMsg += ` [Details: ${errList.join('; ')}]`;
      } else {
        detailMsg += ` [Details: ${JSON.stringify(data.errors)}]`;
      }
    }
    throw new Error(detailMsg);
  }

  return {
    orderId: data.order_id,
    shipmentId: data.shipment_id,
    status: data.status,
    statusCode: data.status_code,
    awbCode: data.awb_code || null,
    courierName: data.courier_name || null,
  };
}

/**
 * Assign AWB & Courier to a shipment
 */
export async function assignShiprocketAWB(shipmentId: string, courierId?: number) {
  const token = await getShiprocketAuthToken();

  const body: any = { shipment_id: shipmentId };
  if (courierId) body.courier_id = courierId;

  const res = await fetch(`${SHIPROCKET_BASE_URL}/courier/assign/awb`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || !data.awb_assign_status) {
    const errorMsg = data.message || data.response?.data?.awb_assign_error || '';
    
    // Check if Shiprocket reports that AWB is already assigned
    // e.g. "AWB is already assigned with awb - 371892747336 and status - PICKUP GENERATED"
    const awbMatch = errorMsg.match(/awb\s*[-:]?\s*([0-9a-zA-Z]+)/i) || 
                     errorMsg.match(/(\d{8,20})/);
    const awbCodeFromMsg = awbMatch ? awbMatch[1] : null;
    const awbCode = data.response?.data?.awb_code || data.awb_code || awbCodeFromMsg;
    const courierName = data.response?.data?.courier_name || data.courier_name;

    if (awbCode) {
      return {
        awbCode: String(awbCode),
        courierName: courierName || 'Shiprocket Courier',
        courierCompanyId: data.response?.data?.courier_company_id || null,
        appliedWeight: data.response?.data?.applied_weight || null,
        alreadyAssigned: true,
      };
    }

    throw new Error(errorMsg || 'Failed to assign AWB via Shiprocket');
  }

  return {
    awbCode: data.response?.data?.awb_code,
    courierName: data.response?.data?.courier_name,
    courierCompanyId: data.response?.data?.courier_company_id,
    appliedWeight: data.response?.data?.applied_weight,
    alreadyAssigned: false,
  };
}

/**
 * Generate Shipping Label PDF link
 */
export async function generateShiprocketLabel(shipmentId: string) {
  const token = await getShiprocketAuthToken();

  const res = await fetch(`${SHIPROCKET_BASE_URL}/courier/generate/label`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [shipmentId] }),
  });

  const data = await res.json();

  if (!res.ok || !data.label_created) {
    throw new Error(data.message || 'Failed to generate shipping label');
  }

  return {
    labelUrl: data.label_url,
  };
}

/**
 * Print Invoice PDF link
 */
export async function generateShiprocketInvoice(orderId: string) {
  const token = await getShiprocketAuthToken();

  const res = await fetch(`${SHIPROCKET_BASE_URL}/orders/print/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids: [orderId] }),
  });

  const data = await res.json();

  if (!res.ok || !data.invoice_url) {
    throw new Error(data.message || 'Failed to generate invoice PDF');
  }

  return {
    invoiceUrl: data.invoice_url,
  };
}

/**
 * Request Pickup for a shipment
 */
export async function requestShiprocketPickup(shipmentId: string) {
  const token = await getShiprocketAuthToken();

  const res = await fetch(`${SHIPROCKET_BASE_URL}/courier/generate/pickup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [shipmentId] }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to request courier pickup');
  }

  return data;
}

/**
 * Cancel order on Shiprocket
 */
export async function cancelShiprocketOrder(shiprocketOrderIds: string[]) {
  const token = await getShiprocketAuthToken();

  const res = await fetch(`${SHIPROCKET_BASE_URL}/orders/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids: shiprocketOrderIds }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to cancel order on Shiprocket');
  }

  return data;
}

/**
 * Track shipment live via Shipment ID or AWB code
 */
export async function trackShiprocketShipment(identifier: { shipmentId?: string; awbCode?: string }) {
  const token = await getShiprocketAuthToken();

  let endpoint = '';
  if (identifier.shipmentId) {
    endpoint = `${SHIPROCKET_BASE_URL}/courier/track/shipment/${identifier.shipmentId}`;
  } else if (identifier.awbCode) {
    endpoint = `${SHIPROCKET_BASE_URL}/courier/track/awb/${identifier.awbCode}`;
  } else {
    throw new Error('Must provide either shipmentId or awbCode to track.');
  }

  const res = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch tracking data');
  }

  const trackingData = data.tracking_data || {};
  const tracks = trackingData.shipment_track_activities || [];
  const shipmentTrack = Array.isArray(trackingData.shipment_track) && trackingData.shipment_track.length > 0
    ? trackingData.shipment_track[0]
    : (trackingData.shipment_track && typeof trackingData.shipment_track === 'object' ? trackingData.shipment_track : {});

  const courierName = trackingData.courier_name || 
                      shipmentTrack.courier_name || 
                      shipmentTrack.courier_partner || 
                      shipmentTrack.courier || 
                      data.courier_name || 
                      '';

  const awbCode = trackingData.awb_code || 
                  shipmentTrack.awb_code || 
                  shipmentTrack.awb || 
                  identifier.awbCode || 
                  '';

  const currentStatus = trackingData.current_status || 
                        shipmentTrack.current_status || 
                        shipmentTrack.status || 
                        'In Transit';

  const edd = trackingData.edd || shipmentTrack.edd || '';
  const origin = trackingData.origin || shipmentTrack.origin || '';
  const destination = trackingData.destination || shipmentTrack.destination || '';

  return {
    trackStatus: trackingData.track_status || 0,
    currentStatus,
    awbCode,
    courierName,
    origin,
    destination,
    edd,
    activities: tracks.map((act: any) => ({
      date: act.date,
      status: act.activity,
      location: act.location,
      srStatus: act['sr-status-label'],
    })),
  };
}

/**
 * Fetch full order details from Shiprocket by Shiprocket Order ID
 */
export async function getShiprocketOrderDetails(shiprocketOrderId: string) {
  const token = await getShiprocketAuthToken();

  const res = await fetch(`${SHIPROCKET_BASE_URL}/orders/show/${shiprocketOrderId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok || !data.data) {
    throw new Error(data.message || 'Failed to fetch order details from Shiprocket');
  }

  const orderData = data.data;
  let firstShipment: any = null;
  if (Array.isArray(orderData.shipments) && orderData.shipments.length > 0) {
    firstShipment = orderData.shipments[0];
  } else if (orderData.shipments && typeof orderData.shipments === 'object') {
    const values = Object.values(orderData.shipments);
    firstShipment = values.length > 0 && typeof values[0] === 'object' ? values[0] : orderData.shipments;
  }

  const awbCode = orderData.awb_code || 
                  firstShipment?.awb || 
                  firstShipment?.awb_code || 
                  orderData.awb || 
                  null;

  const courierName = orderData.courier_name || 
                      firstShipment?.courier_name || 
                      firstShipment?.courier || 
                      null;

  const shipmentId = orderData.shipment_id || 
                     firstShipment?.id?.toString() || 
                     firstShipment?.shipment_id?.toString() || 
                     null;

  const status = orderData.status || 
                 firstShipment?.current_status || 
                 firstShipment?.status || 
                 'created';

  return {
    orderId: orderData.id?.toString(),
    shipmentId: shipmentId?.toString(),
    status,
    statusCode: orderData.status_code,
    awbCode: awbCode ? String(awbCode) : null,
    courierName: courierName ? String(courierName) : null,
    etd: firstShipment?.etd || orderData.etd || null,
  };
}

