import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { whatsappService } from '../services/whatsappService';
import { normalizeSpanishPhone, isValidSpanishPhone } from '../services/phoneValidationService';
import { OrderStatus } from '@prisma/client';

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
  if (!isValidSpanishPhone(customer.phone)) {
    res.status(400).json({ success: false, message: 'Número de teléfono no válido. Debe ser un número español.' });
    return;
  }

  const normalizedPhone = normalizeSpanishPhone(customer.phone)!;

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
  if (activeOrders >= 3) {
    res.status(400).json({
      success: false,
      message: 'Ya tienes demasiados pedidos activos. Por favor espera a que se completen.',
    });
    return;
  }

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
    pickupFormatted
  ).catch(console.error);

  whatsappService.confirmOrderToCustomer(
    normalizedPhone,
    customer.name,
    order.id,
    pickupFormatted,
    totalAmount
  ).catch(console.error);

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
    res.json({ success: true, data: order });
  } catch {
    res.status(404).json({ success: false, message: 'Order not found' });
  }
}
