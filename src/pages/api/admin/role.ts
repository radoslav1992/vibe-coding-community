import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  // Only full admins can change roles.
  if (!user || user.role !== 'admin') return redirect('/');

  const db = locals.runtime.env.DB;
  const form = await request.formData();
  const targetId = Number(form.get('user_id'));
  const role = String(form.get('role') ?? '');
  if (!Number.isInteger(targetId) || targetId === user.id) return redirect('/admin');
  if (role !== 'member' && role !== 'moderator') return redirect('/admin');

  const target = await db
    .prepare('SELECT id, role FROM users WHERE id = ?1')
    .bind(targetId)
    .first<{ id: number; role: string }>();
  // Admins cannot be demoted from this panel.
  if (!target || target.role === 'admin') return redirect('/admin');

  await db.prepare('UPDATE users SET role = ?1 WHERE id = ?2').bind(role, targetId).run();
  return redirect('/admin');
};
