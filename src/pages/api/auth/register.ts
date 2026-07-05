import type { APIRoute } from 'astro';
import { hashPassword, createSession, SESSION_COOKIE } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
  const db = locals.runtime.env.DB;
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const username = String(form.get('username') ?? '').trim().toLowerCase();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');

  if (!name || !email.includes('@') || password.length < 8 || !/^[a-z0-9_-]{2,30}$/.test(username)) {
    return redirect('/auth?tab=register&error=fields');
  }

  const existing = await db
    .prepare('SELECT id FROM users WHERE email = ?1 OR username = ?2')
    .bind(email, username)
    .first();
  if (existing) return redirect('/auth?tab=register&error=exists');

  // The first real (non-seed) account becomes the admin of the community.
  const realUsers = await db
    .prepare("SELECT COUNT(*) AS n FROM users WHERE password_hash != '!'")
    .first<{ n: number }>();
  const role = (realUsers?.n ?? 0) === 0 ? 'admin' : 'member';

  const passwordHash = await hashPassword(password);
  const result = await db
    .prepare('INSERT INTO users (username, name, email, password_hash, role) VALUES (?1, ?2, ?3, ?4, ?5) RETURNING id')
    .bind(username, name, email, passwordHash, role)
    .first<{ id: number }>();
  if (!result) return redirect('/auth?tab=register&error=fields');

  const { token, maxAge } = await createSession(db, result.id);
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return redirect('/');
};
