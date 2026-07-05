import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/auth');
  if (user.blocked) return new Response('Your account is suspended.', { status: 403 });

  const db = locals.runtime.env.DB;
  const postId = Number(params.id);
  if (!Number.isInteger(postId) || postId < 1) return redirect('/');

  const post = await db.prepare('SELECT id FROM posts WHERE id = ?1 AND hidden = 0').bind(postId).first();
  if (!post) return redirect('/');

  const form = await request.formData();
  const body = String(form.get('body') ?? '').trim().slice(0, 5000);
  if (body) {
    await db
      .prepare('INSERT INTO comments (post_id, user_id, author_name, body) VALUES (?1, ?2, ?3, ?4)')
      .bind(postId, user.id, user.name, body)
      .run();
  }
  return redirect(`/post/${postId}`);
};
