# VibeShipyard ⛵

**The global vibe coding community.** Share projects, ask questions, learn and ship together.

VibeShipyard is a community platform — a feed with upvotes and tags, discussion threads, events with RSVPs, news, learning resources, member profiles and a moderation panel — built to run entirely on Cloudflare.

## Stack

- **UI**: [Astro](https://astro.build) (server-rendered, minimal client JS)
- **Backend**: the same Astro app, deployed as a [Cloudflare Worker](https://developers.cloudflare.com/workers/) via `@astrojs/cloudflare`
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite), schema + seed in `migrations/`
- **Auth**: email + password (PBKDF2 via Web Crypto), cookie sessions stored in D1

## Features

| Screen | What it does |
| --- | --- |
| Home `/` | Post feed with tag filters, full-text search, upvotes and a composer |
| Thread `/post/:id` | Full post, comments, reply box, report-to-moderators |
| Events `/events` | Meetups/workshops/hackathons with one-click RSVP |
| News `/news` | Curated news with a featured hero article |
| Learn `/learn` | Courses by level + articles list |
| Auth `/auth` | Sign in / register (first registered account becomes **admin**) |
| Profile `/profile` | Stats (posts, comments, points) and recent activity |
| Settings `/settings` | Profile editing, notification toggles, account deletion (posts stay, anonymized) |
| Admin `/admin` | Member management (block/unblock) and reported-content queue — admins & moderators only |

## Local development

```bash
npm install
npm run db:migrate:local   # create + seed the local D1 database
npm run preview            # build and serve with wrangler (real Workers runtime)
# or: npm run dev          # Astro dev server with hot reload (uses the same local D1)
```

Then open http://localhost:8787 (wrangler) or http://localhost:4321 (astro dev).

Register an account — the first real account automatically gets the admin role.

## Deploy to Cloudflare

1. **Create the D1 database** (once):

   ```bash
   npx wrangler d1 create vibeship-db
   ```

   Copy the printed `database_id` into `wrangler.jsonc`.

2. **Apply migrations to the remote database**:

   ```bash
   npm run db:migrate:remote
   ```

3. **Deploy the Worker**:

   ```bash
   npm run deploy
   ```

That's it — the Worker serves the Astro pages, the API routes and the static assets, all backed by D1.

## Notes

- **Seed content**: `migrations/0002_seed.sql` ships demo members, posts, events, news and courses so the community doesn't launch empty. Seed accounts can't be logged into (their password hash is unusable). Feel free to trim the seed before deploying.
- **Password hashing** uses PBKDF2 with an iteration count tuned to stay within the Workers free-plan CPU budget. Each stored hash embeds its iteration count, so you can raise `PBKDF2_ITERATIONS` in `src/lib/auth.ts` anytime (e.g. on the paid plan) without breaking existing accounts.
- **OAuth** (Google/GitHub) buttons are placeholders — wire them up with an OAuth provider when ready.

## Design

The UI recreates a design handoff originally prototyped for a national builder community, rebranded for a global audience: cream canvas, ink text, pink accent, orange→pink→blue gradients, pill buttons and softly rounded cards. Design tokens live in `src/styles/global.css`.
