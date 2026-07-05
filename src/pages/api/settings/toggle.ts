import type { APIRoute } from 'astro';

const TOGGLE_COLUMNS = ['notify_replies', 'notify_digest', 'public_profile'] as const;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/auth');

  const form = await request.formData();
  const key = String(form.get('key') ?? '');
  if ((TOGGLE_COLUMNS as readonly string[]).includes(key)) {
    // Column name is validated against the allow-list above.
    await locals.runtime.env.DB
      .prepare(`UPDATE users SET ${key} = 1 - ${key} WHERE id = ?1`)
      .bind(user.id)
      .run();
  }
  return redirect('/settings');
};
