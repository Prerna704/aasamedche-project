require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const sellerPassword = await bcrypt.hash('Seller@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      name: 'Seller User',
      password: sellerPassword,
      role: 'SELLER',
    },
  });

  const products = [
    {
      name: 'Premium Basmati Rice',
      sku: 'RICE-001',
      category: 'Grains',
      description: 'Fragrant basmati rice sold by kilogram.',
      dimension: 'WEIGHT',
      baseUnit: 'g',
      pricePerBase: '0.150000',
      inventoryBase: '2500000',
    },
    {
      name: 'Olive Oil',
      sku: 'OIL-001',
      category: 'Oils',
      description: 'Extra virgin olive oil sold by liter.',
      dimension: 'VOLUME',
      baseUnit: 'mL',
      pricePerBase: '0.450000',
      inventoryBase: '1200000',
    },
    {
      name: 'Coffee Mug',
      sku: 'MUG-001',
      category: 'Home',
      description: 'Ceramic mug sold in unit quantity.',
      dimension: 'COUNT',
      baseUnit: 'unit',
      pricePerBase: '599.000000',
      inventoryBase: '500',
    },
    {
      name: 'Premium Sugar',
      sku: 'SUG-001',
      category: 'Groceries',
      description: 'Crystal sugar available by kilogram.',
      dimension: 'WEIGHT',
      baseUnit: 'g',
      pricePerBase: '0.090000',
      inventoryBase: '1800000',
    },
    {
      name: 'Mineral Water Bottle',
      sku: 'WTR-001',
      category: 'Beverages',
      description: 'Packaged drinking water sold by liter.',
      dimension: 'VOLUME',
      baseUnit: 'mL',
      pricePerBase: '0.080000',
      inventoryBase: '3000000',
    },
    {
      name: 'Notebook',
      sku: 'NTB-001',
      category: 'Stationery',
      description: 'A4 ruled notebook sold per item.',
      dimension: 'COUNT',
      baseUnit: 'unit',
      pricePerBase: '99.000000',
      inventoryBase: '150',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        pricePerBase: product.pricePerBase,
        name: product.name,
        description: product.description,
        inventoryBase: product.inventoryBase,
        category: product.category,
      },
      create: product,
    });
  }

  console.log('Seed completed');
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
