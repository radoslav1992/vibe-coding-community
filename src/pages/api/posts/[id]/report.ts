import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/auth');

  const db = locals.runtime.env.DB;
  const postId = Number(params.id);
  if (!Number.isInteger(postId) || postId < 1) return redirect('/');

  const post = await db.prepare('SELECT id FROM posts WHERE id = ?1 AND hidden = 0').bind(postId).first();
  if (!post) return redirect('/');

  const open = await db
    .prepare("SELECT id FROM reports WHERE post_id = ?1 AND reporter_id = ?2 AND status = 'open'")
    .bind(postId, user.id)
    .first();
  if (!open) {
    await db
      .prepare('INSERT INTO reports (post_id, reporter_id, reporter_name, reason) VALUES (?1, ?2, ?3, ?4)')
      .bind(postId, user.id, user.name, 'Flagged by a member')
      .run();
  }
  return redirect(`/post/${postId}`);
};
