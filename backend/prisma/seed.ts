import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MenuPlato {
  orden: number;
  nombre: string;
  ingredientes?: string | null;
  precio?: number | null;
  precio_media?: number | null;
  precio_entera?: number | null;
  precio_mediano?: number | null;
  precio_grande?: number | null;
}

interface MenuGrupo {
  grupo: string;
  nota?: string;
  platos: MenuPlato[];
}

interface MenuJSON {
  restaurante: string;
  telefono: string;
  nota_pizzas?: string;
  menu: MenuGrupo[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log('Seeding database...');

  // Create admin user — password from ADMIN_PASSWORD env var, fallback 'admin123' for local dev
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  console.log(`Admin user ready: admin / ${adminPassword === 'admin123' ? 'admin123 (default)' : '***'}`);

  // Load menu from public/menu.json or use fallback data
  let menuData: MenuJSON | null = null;
  const menuJsonPath = path.join(__dirname, '../../public/menu.json');

  if (fs.existsSync(menuJsonPath)) {
    try {
      const fileContent = fs.readFileSync(menuJsonPath, 'utf-8');
      menuData = JSON.parse(fileContent);
      console.log('Loaded menu from public/menu.json');
    } catch (error) {
      console.warn('Failed to parse menu.json, using fallback data:', error);
    }
  } else {
    console.warn(`menu.json not found at ${menuJsonPath}, using fallback data`);
  }

  // Fallback to hardcoded data if menu.json is not available
  if (!menuData) {
    menuData = {
      restaurante: 'La Pizzería del Antonio',
      telefono: '675 03 02 01',
      menu: [
        {
          grupo: 'ENSALADAS',
          platos: [
            { orden: 1, nombre: 'Primavera', ingredientes: 'lechuga, tomate, york, atún y mozzarella', precio: 7.00 },
            { orden: 2, nombre: 'Caprichosa', ingredientes: 'lechuga, tomate, atún, piña, champiñón y mozzarella', precio: 7.00 },
          ],
        },
      ],
    };
  }

  // Seed categories and items from menu data
  for (let catIndex = 0; catIndex < menuData.menu.length; catIndex++) {
    const grupo = menuData.menu[catIndex];
    const slug = slugify(grupo.grupo);
    const description = grupo.nota || undefined;

    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name: grupo.grupo,
        description,
        sortOrder: catIndex + 1,
      },
      create: {
        slug,
        name: grupo.grupo,
        description,
        sortOrder: catIndex + 1,
      },
    });

    // Clear existing items for this category to resync
    await prisma.menuItem.deleteMany({
      where: { categoryId: category.id },
    });

    // Add items
    for (const plato of grupo.platos) {
      const price = plato.precio ?? null;
      const priceHalf = plato.precio_media ?? plato.precio_mediano ?? null;
      const priceFull = plato.precio_entera ?? plato.precio_grande ?? null;

      await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          name: plato.nombre,
          description: plato.ingredientes || null,
          price,
          priceHalf,
          priceFull,
          sortOrder: plato.orden,
        },
      });
    }

    console.log(`Category seeded: ${category.name} (${grupo.platos.length} items)`);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
