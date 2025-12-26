'use server';

import { cookies } from 'next/headers';
import type { User } from './definitions';
import db from './db';
import { redirect } from 'next/navigation';

const SESSION_COOKIE_NAME = 'openmark_session';

export async function createSession(userId: number) {
  cookies().set(SESSION_COOKIE_NAME, String(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function getUser(): Promise<User | null> {
  const userId = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  try {
    const stmt = db.prepare('SELECT id, name, email, role, avatar_url as avatarUrl FROM users WHERE id = ?');
    const user = stmt.get(Number(userId)) as User | undefined;
    return user || null;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/');
}
