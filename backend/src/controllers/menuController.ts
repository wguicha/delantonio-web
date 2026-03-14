import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';

export async function getCategories(req: Request, res: Response): Promise<void> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  res.json({ success: true, data: categories });
}

export async function getCategoryBySlug(req: Request, res: Response): Promise<void> {
  const slug = req.params['slug'] as string;
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }

  res.json({ success: true, data: category });
}

const menuItemSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive().optional().nullable(),
  priceHalf: z.number().positive().optional().nullable(),
  priceFull: z.number().positive().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function createMenuItem(req: Request, res: Response): Promise<void> {
  const parsed = menuItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid item data', errors: parsed.error.errors });
    return;
  }

  const item = await prisma.menuItem.create({ data: parsed.data });
  res.status(201).json({ success: true, data: item });
}

export async function updateMenuItem(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string;
  const parsed = menuItemSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid item data', errors: parsed.error.errors });
    return;
  }

  try {
    const item = await prisma.menuItem.update({ where: { id }, data: parsed.data });
    res.json({ success: true, data: item });
  } catch {
    res.status(404).json({ success: false, message: 'Menu item not found' });
  }
}

export async function toggleMenuItem(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string;
  try {
    const current = await prisma.menuItem.findUniqueOrThrow({ where: { id } });
    const item = await prisma.menuItem.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    res.json({ success: true, data: item });
  } catch {
    res.status(404).json({ success: false, message: 'Menu item not found' });
  }
}
