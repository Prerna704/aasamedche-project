import prisma from '../../../lib/db';
import { getSession } from '../../../lib/auth';

function requireAdmin(session, res) {
  if (!session || session.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  const session = getSession(req);
  if (!requireAdmin(session, res)) return;

  if (req.method === 'GET') {
    const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    const { name, sku, category, description, dimension, baseUnit, pricePerBase, inventoryBase } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        description,
        dimension,
        baseUnit,
        pricePerBase: pricePerBase.toString(),
        inventoryBase: inventoryBase.toString(),
      },
    });
    return res.status(201).json(product);
  }

  if (req.method === 'PUT') {
    const { id, name, sku, category, description, dimension, baseUnit, pricePerBase, inventoryBase } = req.body;
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        sku,
        category,
        description,
        dimension,
        baseUnit,
        pricePerBase: pricePerBase?.toString(),
        inventoryBase: inventoryBase?.toString(),
      },
    });
    return res.status(200).json(product);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    await prisma.product.delete({ where: { id: Number(id) } });
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
