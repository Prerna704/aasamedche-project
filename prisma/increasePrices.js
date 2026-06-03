require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const Decimal = require('decimal.js');

const prisma = new PrismaClient();

async function increasePrices(factor = 1.2) {
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products`);
  for (const p of products) {
    const oldPrice = new Decimal(p.pricePerBase);
    const newPrice = oldPrice.mul(new Decimal(factor)).toFixed(6);
    await prisma.product.update({ where: { id: p.id }, data: { pricePerBase: newPrice } });
    console.log(`Updated ${p.sku}: ${oldPrice.toString()} -> ${newPrice}`);
  }
}

increasePrices()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
