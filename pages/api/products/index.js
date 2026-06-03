import prisma from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { search = '', category = '' } = req.query;
  const where = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      category ? { category: { equals: category } } : undefined,
    ].filter(Boolean),
  };

  const products = await prisma.product.findMany({ where, orderBy: { name: 'asc' } });
  res.status(200).json(products);
}
