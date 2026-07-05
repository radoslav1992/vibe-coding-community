import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '../../../lib/auth';

export const POST: APIRoute = async ({ locals, cookies, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/auth');

  const db = locals.runtime.env.DB;
  // Posts and comments stay but are anonymized (user_id becomes NULL via FK).
  await db.batch([
    db.prepare("UPDATE posts SET author_name = 'Former member' WHERE user_id = ?1").bind(user.id),
    db.prepare("UPDATE comments SET author_name = 'Former member' WHERE user_id = ?1").bind(user.id),
    db.prepare('DELETE FROM users WHERE id = ?1').bind(user.id),
  ]);
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return redirect('/');
};
