// Typed query helpers over the D1 binding.

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  bio: string;
  role: 'admin' | 'moderator' | 'member';
  blocked: number;
  notify_replies: number;
  notify_digest: number;
  public_profile: number;
  created_at: number;
}

export interface Post {
  id: number;
  user_id: number | null;
  author_name: string;
  author_username: string | null;
  tag: string;
  title: string;
  body: string;
  created_at: number;
  votes: number;
  comment_count: number;
  voted: number;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number | null;
  author_name: string;
  author_username: string | null;
  body: string;
  created_at: number;
}

export interface EventRow {
  id: number;
  title: string;
  starts_at: number;
  location: string;
  kind: 'in_person' | 'online';
  description: string;
  going: number;
}

const POST_SELECT = `
  SELECT p.id, p.user_id, p.author_name, p.tag, p.title, p.body, p.created_at,
    au.username AS author_username,
    (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id) AS votes,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
    EXISTS(SELECT 1 FROM votes v2 WHERE v2.post_id = p.id AND v2.user_id = ?1) AS voted
  FROM posts p
  LEFT JOIN users au ON au.id = p.user_id
  WHERE p.hidden = 0
`;

export async function getUserById(db: D1Database, id: number): Promise<User | null> {
  return await db.prepare('SELECT * FROM users WHERE id = ?1').bind(id).first<User>();
}

export async function listPosts(
  db: D1Database,
  opts: { viewerId?: number | null; tag?: string | null; q?: string | null } = {}
): Promise<Post[]> {
  let sql = POST_SELECT;
  const binds: unknown[] = [opts.viewerId ?? 0];
  if (opts.tag) {
    binds.push(opts.tag);
    sql += ` AND p.tag = ?${binds.length}`;
  }
  if (opts.q) {
    binds.push(`%${opts.q}%`);
    sql += ` AND (p.title LIKE ?${binds.length} OR p.body LIKE ?${binds.length})`;
  }
  sql += ' ORDER BY p.created_at DESC LIMIT 50';
  const { results } = await db.prepare(sql).bind(...binds).all<Post>();
  return results;
}

export async function getPost(db: D1Database, id: number, viewerId?: number | null): Promise<Post | null> {
  return await db
    .prepare(POST_SELECT + ' AND p.id = ?2')
    .bind(viewerId ?? 0, id)
    .first<Post>();
}

export async function listComments(db: D1Database, postId: number): Promise<Comment[]> {
  const { results } = await db
    .prepare(
      `SELECT c.*, au.username AS author_username
       FROM comments c LEFT JOIN users au ON au.id = c.user_id
       WHERE c.post_id = ?1 ORDER BY c.created_at ASC`
    )
    .bind(postId)
    .all<Comment>();
  return results;
}

export async function listEvents(db: D1Database, viewerId?: number | null): Promise<EventRow[]> {
  const { results } = await db
    .prepare(
      `SELECT e.*, EXISTS(SELECT 1 FROM rsvps r WHERE r.event_id = e.id AND r.user_id = ?1) AS going
       FROM events e ORDER BY e.starts_at ASC`
    )
    .bind(viewerId ?? 0)
    .all<EventRow>();
  return results;
}

export async function communityStats(db: D1Database): Promise<{ members: number; topics: number; comments: number }> {
  const row = await db
    .prepare(
      `SELECT (SELECT COUNT(*) FROM users WHERE blocked = 0) AS members,
              (SELECT COUNT(*) FROM posts WHERE hidden = 0) AS topics,
              (SELECT COUNT(*) FROM comments) AS comments`
    )
    .first<{ members: number; topics: number; comments: number }>();
  return row ?? { members: 0, topics: 0, comments: 0 };
}

export interface ActivityItem {
  kind: 'post' | 'comment';
  ref_id: number;
  title: string;
  created_at: number;
}

export interface UserStats {
  posts: number;
  comments: number;
  votes_received: number;
}

export async function userStats(db: D1Database, userId: number): Promise<UserStats> {
  const row = await db
    .prepare(
      `SELECT (SELECT COUNT(*) FROM posts WHERE user_id = ?1 AND hidden = 0) AS posts,
              (SELECT COUNT(*) FROM comments WHERE user_id = ?1) AS comments,
              (SELECT COUNT(*) FROM votes v JOIN posts p ON p.id = v.post_id WHERE p.user_id = ?1) AS votes_received`
    )
    .bind(userId)
    .first<UserStats>();
  return row ?? { posts: 0, comments: 0, votes_received: 0 };
}

export async function userActivity(db: D1Database, userId: number, limit = 8): Promise<ActivityItem[]> {
  const { results } = await db
    .prepare(
      `SELECT 'post' AS kind, id AS ref_id, title, created_at
       FROM posts WHERE user_id = ?1 AND hidden = 0
       UNION ALL
       SELECT 'comment' AS kind, post_id AS ref_id, body AS title, created_at
       FROM comments WHERE user_id = ?1
       ORDER BY created_at DESC LIMIT ?2`
    )
    .bind(userId, limit)
    .all<ActivityItem>();
  return results;
}

export function karmaPoints(stats: UserStats): number {
  return stats.votes_received * 5 + stats.posts * 10 + stats.comments * 2;
}

export async function nextEvent(db: D1Database): Promise<EventRow | null> {
  return await db
    .prepare('SELECT e.*, 0 AS going FROM events e WHERE e.starts_at > unixepoch() ORDER BY e.starts_at ASC LIMIT 1')
    .first<EventRow>();
}
