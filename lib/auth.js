import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';

const TOKEN_NAME = 'inventory_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SECRET = process.env.JWT_SECRET || 'change-this-secret';

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, SECRET, {
    expiresIn: `${MAX_AGE}s`,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
    sameSite: 'lax',
    path: '/',
  }));
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', serialize(TOKEN_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    sameSite: 'lax',
    path: '/',
  }));
}

export function getSession(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[TOKEN_NAME];
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}
