import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const user = locals.user;
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) return redirect('/');

  const db = locals.runtime.env.DB;
  const form = await request.formData();
  const reportId = Number(form.get('report_id'));
  const action = String(form.get('action') ?? '');
  if (!Number.isInteger(reportId) || (action !== 'approve' && action !== 'hide')) return redirect('/admin');

  const report = await db
    .prepare("SELECT id, post_id FROM reports WHERE id = ?1 AND status = 'open'")
    .bind(reportId)
    .first<{ id: number; post_id: number }>();
  if (!report) return redirect('/admin');

  if (action === 'hide') {
    await db.batch([
      db.prepare('UPDATE posts SET hidden = 1 WHERE id = ?1').bind(report.post_id),
      db.prepare("UPDATE reports SET status = 'hidden' WHERE id = ?1").bind(reportId),
    ]);
  } else {
    await db.prepare("UPDATE reports SET status = 'approved' WHERE id = ?1").bind(reportId).run();
  }
  return redirect('/admin');
};
