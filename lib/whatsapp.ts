export type WhatsAppEventType = 'order_confirmed' | 'order_shipped' | 'order_delivered';

export interface WhatsAppOrderData {
  orderId: string;
  customerName?: string;
  phone: string;
  totalAmount?: number;
  courierName?: string;
  awbCode?: string;
  trackingUrl?: string;
  itemsCount?: number;
}

/**
 * Sanitize and format Indian phone numbers into 91XXXXXXXXXX standard
 */
export function sanitizePhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

/**
 * Format luxury branded WhatsApp text message
 */
export function generateWhatsAppMessage(eventType: WhatsAppEventType, data: WhatsAppOrderData): string {
  const shortId = data.orderId.slice(0, 8).toUpperCase();
  const name = data.customerName || 'Urban Explorer';
  const amount = data.totalAmount ? `₹${data.totalAmount.toLocaleString()}` : '';

  switch (eventType) {
    case 'order_confirmed':
      return (
        `🔥 *URBAN VEIN - ORDER CONFIRMED*\n\n` +
        `Hi ${name}, thank you for choosing Urban Vein!\n\n` +
        `📦 *Order Reference:* ORD-${shortId}\n` +
        (amount ? `💰 *Total Paid:* ${amount}\n` : '') +
        `STATUS: Payment Verified & Preparing for Dispatch\n\n` +
        `We are carefully quality-checking and packing your order. You will receive live tracking updates right here on WhatsApp as soon as courier pickup is completed!\n\n` +
        `_Urban Vein Industries • Built for the modern nomad._`
      );

    case 'order_shipped': {
      const courier = data.courierName || 'Delhivery / BlueDart Express';
      const awb = data.awbCode || 'Pending';
      const trackLink = data.trackingUrl || (data.awbCode ? `https://shiprocket.co/tracking/${data.awbCode}` : 'https://www.urbanvein.in/profile');

      return (
        `🚀 *URBAN VEIN - PACKAGE DISPATCHED*\n\n` +
        `Hi ${name}, great news! Your order *ORD-${shortId}* is officially on its way to your doorstep!\n\n` +
        `🚚 *Courier Partner:* ${courier}\n` +
        `📌 *AWB Tracking Code:* ${awb}\n` +
        `🔗 *Live Track Here:* ${trackLink}\n\n` +
        `Estimated Delivery: 3-5 Business Days. Keep your phone handy for courier delivery updates!`
      );
    }

    case 'order_delivered':
      return (
        `✨ *URBAN VEIN - ORDER DELIVERED*\n\n` +
        `Hi ${name}, your order *ORD-${shortId}* has been successfully delivered!\n\n` +
        `We hope you love your new piece. Tag us on Instagram *@urbanvein* to get featured on our official HQ feed! 🔥\n\n` +
        `Need help or exchange? Support Hotline: +91 82649 66094`
      );

    default:
      return `Urban Vein Notification for Order #ORD-${shortId}`;
  }
}

/**
 * Generate direct WhatsApp web deep-link URL for manual 1-click admin dispatch
 */
export function generateWhatsAppDeepLink(phone: string, text: string): string {
  const cleanPhone = sanitizePhone(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Send programmatic WhatsApp notification via Meta Cloud API or log deep-link
 */
export async function sendWhatsAppNotification(eventType: WhatsAppEventType, data: WhatsAppOrderData) {
  const formattedPhone = sanitizePhone(data.phone);
  const messageText = generateWhatsAppMessage(eventType, data);
  const deepLink = generateWhatsAppDeepLink(data.phone, messageText);

  const metaToken = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.META_WHATSAPP_PHONE_ID;

  let apiSent = false;
  let apiError = null;

  // If Meta WhatsApp Cloud API credentials are provided in env
  if (metaToken && phoneId) {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${metaToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: messageText },
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.messages) {
        apiSent = true;
      } else {
        apiError = resData.error?.message || 'Meta API error';
        console.warn('Meta WhatsApp Cloud API response error:', resData);
      }
    } catch (err: any) {
      apiError = err.message;
      console.error('Error invoking Meta WhatsApp API:', err);
    }
  }

  return {
    success: true,
    apiSent,
    apiError,
    phone: formattedPhone,
    messageText,
    deepLink,
  };
}
