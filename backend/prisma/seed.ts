import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  console.log('Admin user created: admin / admin123');

  // Create categories and items
  const categories = [
    {
      slug: 'ensaladas',
      name: 'Ensaladas',
      sortOrder: 1,
      items: [
        { name: 'Primavera', description: 'lechuga, tomate, york, atún y mozzarella', price: 7.00, sortOrder: 1 },
        { name: 'Caprichosa', description: 'lechuga, tomate, atún, piña, champiñón y mozzarella', price: 7.00, sortOrder: 2 },
      ],
    },
    {
      slug: 'bocatas',
      name: 'Bocatas',
      sortOrder: 2,
      items: [
        { name: 'Extremeño', description: 'tomate, aceite y jamón serrano', price: null, sortOrder: 1 },
        { name: 'Malagueño', description: 'tomate, atún y anchoas', price: null, sortOrder: 2 },
        { name: 'Árabe', description: 'tomate, carne kebab, salsa yogurt y lechuga', price: null, sortOrder: 3 },
        { name: 'Serrano', description: 'tomate, aceite, jamón, lomo fresco, queso y pimiento', price: 4.50, sortOrder: 4 },
        { name: 'Crujiente', description: 'pechuga de pollo empanado, tomate y lechuga', price: 4.50, sortOrder: 5 },
      ],
    },
    {
      slug: 'camperos-familiares',
      name: 'Camperos Familiares',
      sortOrder: 3,
      items: [
        { name: 'Serrano Familiar', description: 'jamón serrano, queso, bacon, lomo fresco, tortilla y mahonesa', price: 5.00, sortOrder: 1 },
        { name: 'Kebab Familiar', description: 'jamón serrano, queso, carne kebab y salsa yogurt', price: 12.00, sortOrder: 2 },
      ],
    },
    {
      slug: 'camperos',
      name: 'Camperos',
      description: 'Todos los camperos llevan lechuga, tomate y mahonesa',
      sortOrder: 4,
      items: [
        { name: 'Campero nº4', description: 'carne de kebab, jamón serrano, jamón york y queso', price: 6.00, sortOrder: 1 },
        { name: 'Campero nº5', description: 'lomo fresco, jamón serrano, jamón york, queso y salsa', price: 6.00, sortOrder: 2 },
        { name: 'Campero nº6', description: 'jamón serrano, queso, bacon, lomo, tortilla y mahonesa', price: 6.00, sortOrder: 3 },
        { name: 'Campero nº7', description: 'lomo fresco, jamón serrano, jamón york, tortilla, queso y salsa', price: 6.00, sortOrder: 4 },
        { name: 'Campero nº8', description: 'jamón york, queso, tortilla y hamburguesa rebozada', price: 6.00, sortOrder: 5 },
      ],
    },
    {
      slug: 'raciones',
      name: 'Raciones',
      sortOrder: 5,
      items: [
        { name: 'Cachopo de ternera', description: null, price: null, priceHalf: null, priceFull: 14.00, sortOrder: 1 },
        { name: 'Carrillada al horno', description: null, price: null, priceHalf: 8.00, priceFull: 14.00, sortOrder: 2 },
        { name: 'Lagarto al ajillo', description: null, price: null, priceHalf: 8.00, priceFull: 14.00, sortOrder: 3 },
        { name: 'Carne monte', description: null, price: null, priceHalf: 8.00, priceFull: 14.00, sortOrder: 4 },
        { name: 'Flamenquín casero', description: null, price: null, priceHalf: null, priceFull: 9.00, sortOrder: 5 },
        { name: 'Croquetas Caseras', description: null, price: null, priceHalf: 7.00, priceFull: 12.00, sortOrder: 6 },
        { name: 'Rollitos', description: null, price: null, priceHalf: 7.00, priceFull: 12.00, sortOrder: 7 },
        { name: 'Alitas barbacoa', description: null, price: null, priceHalf: 7.00, priceFull: 12.00, sortOrder: 8 },
        { name: 'Finger de pollo', description: null, price: null, priceHalf: 7.00, priceFull: 12.00, sortOrder: 9 },
        { name: 'Cazón en adobo', description: null, price: null, priceHalf: 7.00, priceFull: 12.00, sortOrder: 10 },
        { name: 'Rabas de calamar', description: null, price: null, priceHalf: 7.00, priceFull: null, sortOrder: 11 },
        { name: 'Patatas bravas', description: null, price: null, priceHalf: null, priceFull: 8.00, sortOrder: 12 },
        { name: 'Patatas cheddar', description: 'patatas fritas, bacon y salsa cheddar', price: null, priceHalf: null, priceFull: 8.50, sortOrder: 13 },
      ],
    },
    {
      slug: 'pizzas',
      name: 'Pizzas',
      description: 'Todas las pizzas llevan tomate, mozzarella y orégano salvo las que llevan otras salsas como ingrediente base. Cada ingrediente extra: +0.50€ (Gambas: 1€)',
      sortOrder: 6,
      items: [
        { name: 'Atún', description: 'atún', price: 8.00, sortOrder: 1 },
        { name: 'Bambini', description: 'jamón york', price: 8.00, sortOrder: 2 },
        { name: 'Hawai', description: 'jamón york y piña', price: 9.00, sortOrder: 3 },
        { name: 'Bolonesa', description: 'carne picada', price: 9.00, sortOrder: 4 },
        { name: 'Bacon', description: 'bacon', price: 9.00, sortOrder: 5 },
        { name: 'Topi', description: 'carne de pollo', price: 9.00, sortOrder: 6 },
        { name: 'Caprichosa', description: 'jamón york y champiñón', price: 10.00, sortOrder: 7 },
        { name: 'Cowboy', description: 'bacon, salchichas y huevo', price: 10.00, sortOrder: 8 },
        { name: 'Chicago', description: 'bacon, jamón york y salchichas', price: 10.00, sortOrder: 9 },
        { name: 'Bambi kebab', description: 'jamón york y carne kebap', price: 10.00, sortOrder: 10 },
        { name: 'Marinera', description: 'gambas, pimiento rojo y pique', price: 10.00, sortOrder: 11 },
        { name: 'Alegrias', description: 'carne picada, champiñón y huevo', price: 10.00, sortOrder: 12 },
        { name: '4 Quesos', description: 'cuatro quesos diferentes', price: 10.00, sortOrder: 13 },
        { name: 'Tres Sabores', description: 'bacon, jamón serrano y salchichas', price: 10.00, sortOrder: 14 },
        { name: 'Roquefort', description: 'bacon y roquefort', price: 10.00, sortOrder: 15 },
        { name: 'Carbonara', description: 'nata, champiñón, bacon y cebolla', price: 10.00, sortOrder: 16 },
        { name: 'Gallega', description: 'atún, pimiento, cebolla y huevo', price: 10.00, sortOrder: 17 },
        { name: 'Suprema de la casa', description: 'salsa barbacoa, nata, carne de pollo, champiñón y cebolla', price: 10.00, sortOrder: 18 },
        { name: 'Barbacoa', description: 'salsa barbacoa, carne picada, bacon y cebolla', price: 10.00, sortOrder: 19 },
        { name: 'Kebab', description: 'salsa yogurt, champiñón y carne de kebab', price: 10.00, sortOrder: 20 },
        { name: 'Pata Negra', description: 'jamón serrano, mozzarella, aceite de oliva y tomate natural', price: 10.00, sortOrder: 21 },
        { name: 'Romana', description: 'champiñón, jamón serrano, alcachofa, pimiento y cebolla', price: 11.00, sortOrder: 22 },
        { name: '4 Estaciones', description: 'champiñón, jamón york, atún, anchoas, cebolla y huevo', price: 11.00, sortOrder: 23 },
        { name: 'La del Antonio', description: '4 quesos, bacon y cebolla', price: 11.00, sortOrder: 24 },
        { name: 'Especial de la casa', description: 'salmón, gambas y palmito', price: 11.00, sortOrder: 25 },
        { name: 'Italiana', description: 'nata, tomate, pique, bacon, 4 quesos y huevo', price: 11.00, sortOrder: 26 },
        { name: 'Calzone', description: 'champiñón, jamón serrano, huevo, cebolla y mozzarella', price: 11.00, sortOrder: 27 },
        { name: 'Suprema de kebab', description: 'salsa yogurt, barbacoa, carne de kebab y cebolla', price: 11.00, sortOrder: 28 },
        { name: 'Rockera', description: 'bacon, tres quesos y carne de kebab', price: 11.00, sortOrder: 29 },
        { name: 'RollingStone', description: 'queso philadelphia, bacon, pollo, cebolla caramelizada y salsa barbacoa', price: 11.00, sortOrder: 30 },
        { name: 'Metallica', description: 'queso philadelphia, cheddar, parmesano, emmental y gouda', price: 11.00, sortOrder: 31 },
        { name: 'Ramones', description: 'salsa gaucha, bacon, kebab, maíz y tomate natural', price: 11.00, sortOrder: 32 },
        { name: 'Iron Maiden', description: 'queso philadelphia, cebolla caramelizada y rulo de cabra', price: 11.00, sortOrder: 33 },
        { name: 'AC/DC', description: 'queso philadelphia, champiñón, bacon y pollo', price: 11.00, sortOrder: 34 },
        { name: 'Barricada', description: 'bacon, peperoni, jamón york y carne picada', price: 11.00, sortOrder: 35 },
        { name: 'Extremoduro', description: 'queso philadelphia, bacon, kebab, 3 quesos y salsa cheddar', price: 11.00, sortOrder: 36 },
        { name: 'Marea', description: 'queso philadelphia, salmón, gambas', price: 11.00, sortOrder: 37 },
        { name: 'Cabronazo', description: 'queso philadelphia, rulo de cabra, cebolla caramelizada, jamón serrano y tomate natural', price: 12.00, sortOrder: 38 },
      ],
    },
  ];

  for (const cat of categories) {
    const { items, ...categoryData } = cat;

    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: { ...categoryData },
      create: { ...categoryData },
    });

    for (const item of items) {
      const existing = await prisma.menuItem.findFirst({
        where: { categoryId: category.id, name: item.name },
      });

      if (!existing) {
        await prisma.menuItem.create({
          data: {
            ...item,
            categoryId: category.id,
          },
        });
      }
    }
    console.log(`Category seeded: ${category.name} (${items.length} items)`);
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
