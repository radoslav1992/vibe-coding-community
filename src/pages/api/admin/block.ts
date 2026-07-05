import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) return redirect('/');

  const db = locals.runtime.env.DB;
  const form = await request.formData();
  const targetId = Number(form.get('user_id'));
  if (!Number.isInteger(targetId) || targetId === user.id) return redirect('/admin');

  const target = await db
    .prepare('SELECT id, role, blocked FROM users WHERE id = ?1')
    .bind(targetId)
    .first<{ id: number; role: string; blocked: number }>();
  if (!target || target.role === 'admin') return redirect('/admin');

  await db.batch([
    db.prepare('UPDATE users SET blocked = 1 - blocked WHERE id = ?1').bind(targetId),
    // Blocking also signs the member out everywhere.
    ...(target.blocked ? [] : [db.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(targetId)]),
  ]);
  return redirect('/admin');
};
