import type { APIRoute } from 'astro';
import { TAG_NAMES } from '../../lib/ui';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/auth');
  if (user.blocked) return new Response('Your account is suspended.', { status: 403 });

  const db = locals.runtime.env.DB;
  const form = await request.formData();
  const title = String(form.get('title') ?? '').trim().slice(0, 200);
  const body = String(form.get('body') ?? '').trim().slice(0, 10000);
  const rawTag = String(form.get('tag') ?? 'Discussion');
  const tag = (TAG_NAMES as readonly string[]).includes(rawTag) ? rawTag : 'Discussion';

  if (!title) return redirect('/?compose=1#composer');

  const result = await db
    .prepare('INSERT INTO posts (user_id, author_name, tag, title, body) VALUES (?1, ?2, ?3, ?4, ?5) RETURNING id')
    .bind(user.id, user.name, tag, title, body || title)
    .first<{ id: number }>();

  // The author's implicit upvote, mirroring the design's "starts at 1 vote".
  if (result) {
    await db.prepare('INSERT OR IGNORE INTO votes (post_id, user_id) VALUES (?1, ?2)').bind(result.id, user.id).run();
    return redirect(`/post/${result.id}`);
  }
  return redirect('/');
};
