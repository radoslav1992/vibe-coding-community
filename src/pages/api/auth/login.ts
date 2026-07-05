import type { APIRoute } from 'astro';
import { verifyPassword, createSession, SESSION_COOKIE } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
  const db = locals.runtime.env.DB;
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');

  const user = await db
    .prepare('SELECT id, password_hash, blocked FROM users WHERE email = ?1')
    .bind(email)
    .first<{ id: number; password_hash: string; blocked: number }>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return redirect('/auth?error=invalid');
  }
  if (user.blocked) return redirect('/auth?error=blocked');

  const { token, maxAge } = await createSession(db, user.id);
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return redirect('/');
};
