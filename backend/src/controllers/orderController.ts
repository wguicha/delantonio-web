import { EventEmitter } from 'events';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { whatsappService } from '../services/whatsappService';
import { normalizePhone, isValidPhone } from '../services/phoneValidationService';
import { getScheduleData } from './scheduleController';
import { OrderStatus } from '@prisma/client';

// Shared emitter for real-time SSE — one event per order change
export const orderEmitter = new EventEmitter();
orderEmitter.setMaxListeners(100);

const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().min(9),
  }),
  pickupTime: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
  notes: z.string().max(500).optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().min(1).max(20),
    size: z.enum(['half', 'full']).optional(),
    notes: z.string().max(200).optional(),
  })).min(1),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos' }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar la política de privacidad' }) }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const MINIMUM_ADVANCE_MINUTES = 30;

function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid order data', errors: parsed.error.errors });
    return;
  }

  const { customer, pickupTime, notes, items, latitude, longitude } = parsed.data;

  // Validate phone
  if (!isValidPhone(customer.phone)) {
    res.status(400).json({ success: false, message: 'Número de teléfono no válido.' });
    return;
  }

  const normalizedPhone = normalizePhone(customer.phone)!;

  // Validate pickup time (minimum advance)
  const pickup = new Date(pickupTime);
  const now = new Date();
  const diffMinutes = (pickup.getTime() - now.getTime()) / 60000;
  if (diffMinutes < MINIMUM_ADVANCE_MINUTES) {
    res.status(400).json({
      success: false,
      message: `El pedido debe realizarse con al menos ${MINIMUM_ADVANCE_MINUTES} minutos de antelación.`,
    });
    return;
  }

  // Validate pickup time within opening hours (from DB schedule)
  // Parse date/time directly from the string (frontend sends YYYY-MM-DDTHH:MM in local time)
  const schedule = await getScheduleData();
  const dateMatch = pickupTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!dateMatch) {
    res.status(400).json({ success: false, message: 'Formato de hora inválido.' });
    return;
  }
  const [, year, month, day, hourStr, minuteStr] = dateMatch;
  const pickupDay = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getDay();
  const pickupHour = parseInt(hourStr);
  const pickupMinute = parseInt(minuteStr);
  const pickupTotalMinutes = pickupHour * 60 + pickupMinute;
  const daySchedule = schedule.days.find((d) => d.day === pickupDay);

  if (!daySchedule || !daySchedule.isOpen) {
    res.status(400).json({ success: false, message: 'Lo sentimos, ese día estamos cerrados.' });
    return;
  }

  const [openH, openM] = daySchedule.openTime.split(':').map(Number);
  const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const lastOrderMinutes = closeMinutes - schedule.lastOrderMinutesBefore;

  if (pickupTotalMinutes < openMinutes || pickupTotalMinutes > lastOrderMinutes) {
    res.status(400).json({
      success: false,
      message: `La hora de recogida debe estar entre las ${daySchedule.openTime} y las ${Math.floor(lastOrderMinutes / 60).toString().padStart(2, '0')}:${(lastOrderMinutes % 60).toString().padStart(2, '0')} (último pedido).`,
    });
    return;
  }

  // Geolocation check (optional - if coords provided)
  if (latitude !== undefined && longitude !== undefined) {
    const pizzeriaLat = parseFloat(process.env.PIZZERIA_LAT ?? '36.7213');
    const pizzeriaLng = parseFloat(process.env.PIZZERIA_LNG ?? '-4.4213');
    const maxRadiusKm = parseFloat(process.env.MAX_ORDER_RADIUS_KM ?? '50');
    const distance = haversineDistanceKm(latitude, longitude, pizzeriaLat, pizzeriaLng);
    if (distance > maxRadiusKm) {
      res.status(400).json({
        success: false,
        message: `Lo sentimos, solo aceptamos pedidos desde un radio de ${maxRadiusKm}km del local.`,
      });
      return;
    }
  }

  // Check order limit per phone (max 3 pending/preparing orders per phone)
  const activeOrders = await prisma.order.count({
    where: {
      customer: { phone: normalizedPhone },
      status: { in: ['PENDING', 'PREPARING'] },
    },
  });
  if (activeOrders >= 1) {
    res.status(400).json({
      success: false,
      message: 'Ya tienes un pedido activo. Por favor espera a que se complete antes de hacer otro.',
    });
    return;
  }

  // Validate max order amount
  const maxOrderAmount = parseFloat(process.env.MAX_ORDER_AMOUNT ?? '50');

  // Get menu items and calculate total
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) }, isActive: true },
  });

  if (menuItems.length !== new Set(items.map((i) => i.menuItemId)).size) {
    res.status(400).json({ success: false, message: 'One or more menu items are unavailable.' });
    return;
  }

  let totalAmount = 0;
  const orderItemsData = items.map((item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
    const unitPrice =
      item.size === 'half' ? (menuItem.priceHalf ?? 0) :
      item.size === 'full' ? (menuItem.priceFull ?? 0) :
      (menuItem.price ?? 0);
    totalAmount += unitPrice * item.quantity;
    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice,
      size: item.size ?? null,
      notes: item.notes ?? null,
    };
  });

  // Check if customer is new (no previous orders)
  const existingCustomer = await prisma.customer.findUnique({
    where: { phone: normalizedPhone },
    include: { _count: { select: { orders: true } } },
  });
  const isNewCustomer = !existingCustomer || existingCustomer._count.orders === 0;
  const requiresReview = isNewCustomer && totalAmount > maxOrderAmount;

  // Upsert customer
  const dbCustomer = await prisma.customer.upsert({
    where: { phone: normalizedPhone },
    update: {
      name: customer.name,
      lastOrderDate: new Date(),
    },
    create: {
      name: customer.name,
      phone: normalizedPhone,
      consentGiven: true,
      consentDate: new Date(),
    },
  });

  // Create order
  const order = await prisma.order.create({
    data: {
      customerId: dbCustomer.id,
      pickupTime: new Date(pickupTime),
      totalAmount,
      notes: notes ?? null,
      items: {
        create: orderItemsData,
      },
    },
    include: {
      customer: true,
      items: { include: { menuItem: true } },
    },
  });

  // Send WhatsApp notifications (non-blocking)
  const itemsSummary = order.items
    .map((i) => `  • ${i.quantity}x ${i.menuItem.name}${i.size ? ` (${i.size === 'half' ? 'media' : 'entera'})` : ''} — ${(i.unitPrice * i.quantity).toFixed(2)}€`)
    .join('\n');

  const pickupFormatted = new Date(pickupTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  whatsappService.notifyAdmin(
    order.id,
    customer.name,
    normalizedPhone,
    itemsSummary,
    totalAmount,
    pickupFormatted,
    requiresReview
  ).catch(console.error);

  whatsappService.confirmOrderToCustomer(
    normalizedPhone,
    customer.name,
    order.id,
    pickupFormatted,
    totalAmount
  ).catch(console.error);

  orderEmitter.emit('order:change', order);
  res.status(201).json({ success: true, data: order });
}

export async function getOrders(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string ?? '1', 10);
  const limit = parseInt(req.query.limit as string ?? '20', 10);
  const status = req.query.status as OrderStatus | undefined;

  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ data: orders, total, page, limit });
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string;
  const { status } = req.body;

  const validStatuses: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid status' });
    return;
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { customer: true, items: { include: { menuItem: true } } },
    });

    orderEmitter.emit('order:change', order);

    if (status === 'READY') {
      const pickupFormatted = new Date(order.pickupTime).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
      whatsappService
        .notifyOrderReady(order.customer.phone, order.customer.name, pickupFormatted)
        .catch(console.error);
    }

    if (status === 'COMPLETED') {
      whatsappService
        .thankCustomer(order.customer.phone, order.customer.name)
        .catch(console.error);
    }

    res.json({ success: true, data: order });
  } catch {
    res.status(404).json({ success: false, message: 'Order not found' });
  }
}

export async function streamOrders(req: Request, res: Response): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send current active orders immediately on connect
  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } },
      include: { customer: true, items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.write(`data: ${JSON.stringify({ type: 'initial', orders })}\n\n`);
  } catch {
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to load orders' })}\n\n`);
  }

  // Push any subsequent order changes
  const handler = (order: unknown) => {
    res.write(`data: ${JSON.stringify({ type: 'update', order })}\n\n`);
  };
  orderEmitter.on('order:change', handler);

  // Keep-alive ping every 25s to prevent proxy timeouts
  const keepAlive = setInterval(() => res.write(': keepalive\n\n'), 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    orderEmitter.off('order:change', handler);
  });
}
