// Ranks and badges, computed live from community activity — no awarding
// pipeline to maintain. Points formula lives in karmaPoints (db.ts).

export interface Rank {
  name: string;
  icon: string;
  min: number;
}

export const RANKS: Rank[] = [
  { name: 'Deckhand', icon: '⚓', min: 0 },
  { name: 'Sailor', icon: '⛵', min: 50 },
  { name: 'Navigator', icon: '🧭', min: 150 },
  { name: 'Captain', icon: '🚢', min: 400 },
  { name: 'Admiral', icon: '🏆', min: 1000 },
];

export function rankFor(points: number): { current: Rank; next: Rank | null; progress: number } {
  let current = RANKS[0]!;
  for (const r of RANKS) if (points >= r.min) current = r;
  const idx = RANKS.indexOf(current);
  const next = idx < RANKS.length - 1 ? RANKS[idx + 1]! : null;
  const progress = next ? Math.min(1, (points - current.min) / (next.min - current.min)) : 1;
  return { current, next, progress };
}

export interface GamStats {
  posts: number;
  comments: number;
  votes_received: number;
  best_post_votes: number;
  lessons_done: number;
  courses_done: number;
  total_courses: number;
  rsvps: number;
  member_number: number;
}

export interface Badge {
  key: string;
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
}

export function computeBadges(s: GamStats): Badge[] {
  const defs: Array<Omit<Badge, 'earned'> & { test: (s: GamStats) => boolean }> = [
    { key: 'first-launch', icon: '🚀', name: 'First Launch', desc: 'Publish your first post', test: (x) => x.posts >= 1 },
    { key: 'shipwright', icon: '🛠️', name: 'Shipwright', desc: 'Publish 5 posts', test: (x) => x.posts >= 5 },
    { key: 'fleet-builder', icon: '🚢', name: 'Fleet Builder', desc: 'Publish 15 posts', test: (x) => x.posts >= 15 },
    { key: 'helping-hand', icon: '🤝', name: 'Helping Hand', desc: 'Write 10 comments', test: (x) => x.comments >= 10 },
    { key: 'harbor-guide', icon: '🗺️', name: 'Harbor Guide', desc: 'Write 25 comments', test: (x) => x.comments >= 25 },
    { key: 'crowd-favorite', icon: '⭐', name: 'Crowd Favorite', desc: 'Get 10 upvotes on one post', test: (x) => x.best_post_votes >= 10 },
    { key: 'harbor-legend', icon: '🔥', name: 'Harbor Legend', desc: 'Get 25 upvotes on one post', test: (x) => x.best_post_votes >= 25 },
    { key: 'scholar', icon: '🎓', name: 'Scholar', desc: 'Complete your first course', test: (x) => x.courses_done >= 1 },
    { key: 'master-of-the-yard', icon: '🏛️', name: 'Master of the Yard', desc: 'Complete every course', test: (x) => x.total_courses > 0 && x.courses_done >= x.total_courses },
    { key: 'crew-muster', icon: '📅', name: 'Crew Muster', desc: 'RSVP to a community event', test: (x) => x.rsvps >= 1 },
    { key: 'early-crew', icon: '🌊', name: 'Early Crew', desc: 'Be among the first 50 members', test: (x) => x.member_number <= 50 },
  ];
  return defs.map(({ test, ...d }) => ({ ...d, earned: test(s) }));
}

export async function gamStats(db: D1Database, userId: number): Promise<GamStats> {
  const row = await db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM posts WHERE user_id = ?1 AND hidden = 0) AS posts,
        (SELECT COUNT(*) FROM comments WHERE user_id = ?1) AS comments,
        (SELECT COUNT(*) FROM votes v JOIN posts p ON p.id = v.post_id WHERE p.user_id = ?1) AS votes_received,
        COALESCE((SELECT MAX(cnt) FROM (
          SELECT COUNT(*) AS cnt FROM votes v JOIN posts p ON p.id = v.post_id
          WHERE p.user_id = ?1 AND p.hidden = 0 GROUP BY v.post_id
        )), 0) AS best_post_votes,
        (SELECT COUNT(*) FROM lesson_completions WHERE user_id = ?1) AS lessons_done,
        (SELECT COUNT(*) FROM (
          SELECT l.course_id FROM lessons l
          LEFT JOIN lesson_completions lc ON lc.lesson_id = l.id AND lc.user_id = ?1
          GROUP BY l.course_id HAVING COUNT(*) = COUNT(lc.user_id)
        )) AS courses_done,
        (SELECT COUNT(DISTINCT course_id) FROM lessons) AS total_courses,
        (SELECT COUNT(*) FROM rsvps WHERE user_id = ?1) AS rsvps,
        (SELECT COUNT(*) FROM users u2 WHERE u2.id <= ?1) AS member_number`
    )
    .bind(userId)
    .first<GamStats>();
  return (
    row ?? {
      posts: 0, comments: 0, votes_received: 0, best_post_votes: 0,
      lessons_done: 0, courses_done: 0, total_courses: 0, rsvps: 0, member_number: 9999,
    }
  );
}

export interface LeaderboardRow {
  id: number;
  username: string;
  name: string;
  posts: number;
  comments: number;
  votes_received: number;
  lessons_done: number;
  points: number;
}

// since = unix timestamp to count activity from (0 = all time).
export async function leaderboard(db: D1Database, since = 0, limit = 20): Promise<LeaderboardRow[]> {
  const { results } = await db
    .prepare(
      `SELECT u.id, u.username, u.name,
        (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id AND p.hidden = 0 AND p.created_at >= ?1) AS posts,
        (SELECT COUNT(*) FROM comments c WHERE c.user_id = u.id AND c.created_at >= ?1) AS comments,
        (SELECT COUNT(*) FROM votes v JOIN posts p2 ON p2.id = v.post_id
         WHERE p2.user_id = u.id AND p2.hidden = 0 AND v.created_at >= ?1) AS votes_received,
        (SELECT COUNT(*) FROM lesson_completions lc WHERE lc.user_id = u.id AND lc.completed_at >= ?1) AS lessons_done
       FROM users u WHERE u.blocked = 0`
    )
    .bind(since)
    .all<Omit<LeaderboardRow, 'points'>>();

  return results
    .map((r) => ({
      ...r,
      points: r.votes_received * 5 + r.posts * 10 + r.comments * 2 + r.lessons_done * 3,
    }))
    .filter((r) => r.points > 0)
    .sort((a, b) => b.points - a.points || a.id - b.id)
    .slice(0, limit);
}
