import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { normalizeSpanishPhone } from '../services/phoneValidationService';

export async function lookupCustomerByPhone(req: Request, res: Response): Promise<void> {
  const phone = req.query.phone as string;
  if (!phone) {
    res.status(400).json({ success: false, message: 'Phone required' });
    return;
  }

  const normalized = normalizeSpanishPhone(phone);
  if (!normalized) {
    res.status(400).json({ success: false, message: 'Invalid phone format' });
    return;
  }

  const customer = await prisma.customer.findUnique({
    where: { phone: normalized },
    select: { name: true },
  });

  if (!customer) {
    res.status(404).json({ success: false, message: 'Customer not found' });
    return;
  }

  res.json({ success: true, data: { name: customer.name } });
}

export async function getCustomers(req: Request, res: Response): Promise<void> {
  const page = parseInt((req.query.page as string) ?? '1', 10);
  const limit = parseInt((req.query.limit as string) ?? '20', 10);

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where: { deletionRequested: false },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { items: { include: { menuItem: true } } },
        },
      },
      orderBy: { lastOrderDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count({ where: { deletionRequested: false } }),
  ]);

  res.json({ data: customers, total, page, limit });
}

export async function requestDataDeletion(req: Request, res: Response): Promise<void> {
  const schema = z.object({ phone: z.string().min(9) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Phone required' });
    return;
  }

  const normalized = normalizeSpanishPhone(parsed.data.phone);
  if (!normalized) {
    res.status(400).json({ success: false, message: 'Invalid phone format' });
    return;
  }

  await prisma.customer.updateMany({
    where: { phone: normalized },
    data: { deletionRequested: true },
  });

  res.json({
    success: true,
    message: 'Tu solicitud de eliminación de datos ha sido registrada. La procesaremos en un plazo máximo de 30 días.',
  });
}
