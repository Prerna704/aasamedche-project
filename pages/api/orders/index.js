import Decimal from 'decimal.js';
import prisma from '../../../lib/db';
import { getSession } from '../../../lib/auth';
import { toBase } from '../../../lib/units';

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const orders = await prisma.order.findMany({
      where: { userId: session.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(orders);
  }

  if (req.method === 'POST') {
    const { items, isQuotation } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items required' });
    }

    const createdItems = [];
    let totalAmount = new Decimal(0);

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: Number(item.productId) } });
      if (!product) return res.status(400).json({ error: 'Invalid product' });

      const quantityBase = toBase(item.quantity, item.unit);
      const lineTotal = quantityBase.mul(new Decimal(product.pricePerBase));
      totalAmount = totalAmount.plus(lineTotal);

      createdItems.push({
        productId: product.id,
        unit: item.unit,
        quantity: new Decimal(item.quantity).toString(),
        quantityBase: quantityBase.toString(),
        pricePerBase: new Decimal(product.pricePerBase).toString(),
        lineTotal: lineTotal.toString(),
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: session.id,
        isQuotation: Boolean(isQuotation),
        totalAmount: totalAmount.toString(),
        items: { create: createdItems },
      },
      include: { items: { include: { product: true } } },
    });

    return res.status(201).json(order);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
