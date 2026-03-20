import { env } from '../config/env';

interface WhatsAppMessage {
  to: string;
  message: string;
}

async function sendWhatsAppMessage({ to, message }: WhatsAppMessage): Promise<boolean> {
  if (!env.whatsapp.phoneNumberId || !env.whatsapp.accessToken) {
    console.log('[WhatsApp] Not configured, skipping message to:', to);
    console.log('[WhatsApp] Message:', message);
    return false;
  }

  const url = `https://graph.facebook.com/v21.0/${env.whatsapp.phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.whatsapp.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { body: message },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp] API error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[WhatsApp] Network error:', err);
    return false;
  }
}

export const whatsappService = {
  notifyAdmin: async (orderId: string, customerName: string, phone: string, items: string, total: number, pickupTime: string, requiresReview = false): Promise<void> => {
    const reviewAlert = requiresReview
      ? `\n⚠️ *CLIENTE NUEVO CON PEDIDO ALTO — CONFIRMAR POR TELÉFONO*\n`
      : '';

    const message = `🍕 *NUEVO PEDIDO - Del Antonio*\n\n` +
      `📋 Pedido: #${orderId.slice(-6).toUpperCase()}\n` +
      `👤 Cliente: ${customerName}\n` +
      `📱 Teléfono: ${phone}\n` +
      `🕐 Recogida: ${pickupTime}\n\n` +
      `*Artículos:*\n${items}\n\n` +
      `💰 *Total: ${total.toFixed(2)}€*` +
      reviewAlert + `\n` +
      `Panel: https://pizzeriadelantonio.es/admin`;

    await sendWhatsAppMessage({
      to: env.whatsapp.adminPhone,
      message,
    });
  },

  confirmOrderToCustomer: async (phone: string, customerName: string, orderId: string, pickupTime: string, total: number): Promise<void> => {
    const message = `🤘 *¡Pedido confirmado, ${customerName}!*\n\n` +
      `🍕 *Pizzería Del Antonio*\n\n` +
      `📋 Tu pedido #${orderId.slice(-6).toUpperCase()} está en preparación.\n` +
      `🕐 Podrás recogerlo a las *${pickupTime}*.\n` +
      `💰 Total: *${total.toFixed(2)}€*\n\n` +
      `¡Gracias por tu pedido! 🎸`;

    await sendWhatsAppMessage({ to: phone, message });
  },

  thankCustomer: async (phone: string, customerName: string): Promise<void> => {
    const mapsUrl = process.env.GOOGLE_MAPS_REVIEW_URL ?? '';
    const message = `🤘 *¡Gracias por tu pedido, ${customerName}!*\n\n` +
      `🍕 *Pizzería Del Antonio*\n\n` +
      `Esperamos que lo hayas disfrutado al máximo.\n` +
      `Si te ha gustado, ¡nos ayudaría muchísimo que nos dejaras una reseña!\n\n` +
      `⭐ ${mapsUrl}\n\n` +
      `¡Hasta la próxima! 🎸`;

    await sendWhatsAppMessage({ to: phone, message });
  },

  notifyOrderReady: async (phone: string, customerName: string, pickupTime: string): Promise<void> => {
    const message = `✅ *¡Tu pedido está listo, ${customerName}!*\n\n` +
      `🍕 *Pizzería Del Antonio*\n\n` +
      `Tu pedido ya está preparado y listo para recoger.\n` +
      `🕐 Hora de recogida: *${pickupTime}*\n\n` +
      `¡Te esperamos! 🤘`;

    await sendWhatsAppMessage({ to: phone, message });
  },
};
