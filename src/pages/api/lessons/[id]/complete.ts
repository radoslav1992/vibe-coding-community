import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/auth');

  const db = locals.runtime.env.DB;
  const lessonId = Number(params.id);
  if (!Number.isInteger(lessonId) || lessonId < 1) return redirect('/learn');

  const lesson = await db.prepare('SELECT id FROM lessons WHERE id = ?1').bind(lessonId).first();
  if (!lesson) return redirect('/learn');

  const existing = await db
    .prepare('SELECT 1 AS x FROM lesson_completions WHERE lesson_id = ?1 AND user_id = ?2')
    .bind(lessonId, user.id)
    .first();

  if (existing) {
    await db.prepare('DELETE FROM lesson_completions WHERE lesson_id = ?1 AND user_id = ?2').bind(lessonId, user.id).run();
  } else {
    await db.prepare('INSERT INTO lesson_completions (lesson_id, user_id) VALUES (?1, ?2)').bind(lessonId, user.id).run();
  }
  return redirect(`/learn/lesson/${lessonId}`);
};
