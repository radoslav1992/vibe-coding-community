import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/auth');

  const db = locals.runtime.env.DB;
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim().slice(0, 80);
  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 200);
  const bio = String(form.get('bio') ?? '').trim().slice(0, 300);

  if (!name || !email.includes('@')) return redirect('/settings');

  const taken = await db
    .prepare('SELECT id FROM users WHERE email = ?1 AND id != ?2')
    .bind(email, user.id)
    .first();
  if (taken) return redirect('/settings');

  await db
    .prepare('UPDATE users SET name = ?1, email = ?2, bio = ?3 WHERE id = ?4')
    .bind(name, email, bio, user.id)
    .run();
  return redirect('/settings?saved=1');
};
