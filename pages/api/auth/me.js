import { getSession } from '../../../lib/auth';

export default function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  return res.status(200).json({ user: session });
}
