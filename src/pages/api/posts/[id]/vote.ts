import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return new Response(JSON.stringify({ error: 'auth' }), { status: 401 });
  if (user.blocked) return new Response(JSON.stringify({ error: 'blocked' }), { status: 403 });

  const db = locals.runtime.env.DB;
  const postId = Number(params.id);
  if (!Number.isInteger(postId) || postId < 1) return new Response(null, { status: 400 });

  const post = await db.prepare('SELECT id FROM posts WHERE id = ?1 AND hidden = 0').bind(postId).first();
  if (!post) return new Response(null, { status: 404 });

  const existing = await db
    .prepare('SELECT 1 AS x FROM votes WHERE post_id = ?1 AND user_id = ?2')
    .bind(postId, user.id)
    .first();

  if (existing) {
    await db.prepare('DELETE FROM votes WHERE post_id = ?1 AND user_id = ?2').bind(postId, user.id).run();
  } else {
    await db.prepare('INSERT INTO votes (post_id, user_id) VALUES (?1, ?2)').bind(postId, user.id).run();
  }

  const count = await db
    .prepare('SELECT COUNT(*) AS n FROM votes WHERE post_id = ?1')
    .bind(postId)
    .first<{ n: number }>();

  return new Response(JSON.stringify({ votes: count?.n ?? 0, voted: !existing }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
