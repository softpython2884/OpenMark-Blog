'use server';

import { cookies } from 'next/headers';
import type { User } from './definitions';
import db from './db';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

const SESSION_COOKIE_NAME = 'openmark_session';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';

if (JWT_SECRET === 'your-super-secret-key-that-is-long-enough') {
  console.warn('Warning: JWT_SECRET is not set in .env. Using a default, insecure key.');
}

export async function createSession(payload: { userId: number, role: Role, name: string }) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
    sameSite: 'lax',
  });
}

export async function getUser(): Promise<(User & { userId: number }) | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, iat: number, exp: number };
    
    const stmt = db.prepare('SELECT id, name, email, role, avatar_url as avatarUrl FROM users WHERE id = ?');
    const user = stmt.get(decoded.userId) as User | undefined;

    if (!user) {
      return null;
    }
    
    return { ...user, userId: user.id };

  } catch (error) {
    // This will happen if the token is expired or invalid
    console.error('Invalid token:', error);
    return null;
  }
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/');
}
