import bcrypt from 'bcryptjs';
import prisma from '../../../lib/db';
import { signToken, setSessionCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);
  setSessionCookie(res, token);

  return res.status(200).json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
