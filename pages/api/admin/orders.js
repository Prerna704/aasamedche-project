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
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(orders);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
