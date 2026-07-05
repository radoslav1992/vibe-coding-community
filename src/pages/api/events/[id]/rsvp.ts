import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/auth');
  if (user.blocked) return new Response('Your account is suspended.', { status: 403 });

  const db = locals.runtime.env.DB;
  const eventId = Number(params.id);
  if (!Number.isInteger(eventId) || eventId < 1) return redirect('/events');

  const event = await db.prepare('SELECT id FROM events WHERE id = ?1').bind(eventId).first();
  if (!event) return redirect('/events');

  const existing = await db
    .prepare('SELECT 1 AS x FROM rsvps WHERE event_id = ?1 AND user_id = ?2')
    .bind(eventId, user.id)
    .first();

  if (existing) {
    await db.prepare('DELETE FROM rsvps WHERE event_id = ?1 AND user_id = ?2').bind(eventId, user.id).run();
  } else {
    await db.prepare('INSERT INTO rsvps (event_id, user_id) VALUES (?1, ?2)').bind(eventId, user.id).run();
  }
  return redirect('/events');
};
