-- VibeShipyard · seed content
-- Seed members have an unusable password hash ('!') — they exist to make the
-- community feel alive. Register a real account to participate; the first
-- registered account becomes the admin.

INSERT INTO users (id, username, name, email, password_hash, bio, role, public_profile) VALUES
  (1, 'mira', 'Mira Chen', 'mira@example.com', '!', 'Building tiny tools for small businesses.', 'moderator', 1),
  (2, 'diego', 'Diego Alvarez', 'diego@example.com', '!', 'Shipping one micro-SaaS a month.', 'member', 1),
  (3, 'amara', 'Amara Okafor', 'amara@example.com', '!', 'Designer learning to ship with AI.', 'member', 1),
  (4, 'jonas', 'Jonas Berg', 'jonas@example.com', '!', 'Indie hacker from the north.', 'member', 1),
  (5, 'priya', 'Priya Nair', 'priya@example.com', '!', 'Payments, prompts and product.', 'member', 1),
  (6, 'kenji', 'Kenji Sato', 'kenji@example.com', '!', 'Weekend builder, weekday PM.', 'member', 1);

INSERT INTO posts (id, user_id, author_name, tag, title, body, created_at) VALUES
  (1, 2, 'Diego Alvarez', 'Guide',
   'How I wired up auth in my vibe-coded app in 10 minutes',
   'I kept putting off real authentication because it sounded hard. Turns out with the right prompt the agent wires it up almost by itself: 1) create the auth provider project, 2) describe exactly which sign-in methods you want, 3) test with a throwaway email. The only snag was the redirect URL — make sure you put your app''s exact address in the provider settings.',
   unixepoch() - 2*3600),
  (2, 3, 'Amara Okafor', 'Discussion',
   'Share your best prompts for beautiful UI',
   'The same request gives wildly different results depending on how you phrase it. Let''s collect prompts that reliably produce great design — drop yours in the comments and I''ll organize everything into a shared doc for the community.',
   unixepoch() - 5*3600),
  (3, 4, 'Jonas Berg', 'Help',
   'Deploy to a custom domain stuck on pending SSL',
   'I bought a domain and followed the custom-domain guide. The A record and CNAME are correct (verified with dig), but the SSL certificate has been stuck on "pending" for 6 hours. How long did it take for you? Is there anything special about newly registered domains?',
   unixepoch() - 8*3600),
  (4, 6, 'Kenji Sato', 'Show & Tell',
   'I built a family budget tracker in two evenings — feedback?',
   'My wife wanted a simple app for our family budget without a subscription. Two evenings of vibe coding later: expenses by category, a monthly chart and a shared view for both of us. The hardest part was convincing the AI to format currencies properly. What would you add?',
   unixepoch() - 26*3600),
  (5, 5, 'Priya Nair', 'Guide',
   'Vibe coding + Stripe: accepting payments that actually work',
   'After a few failed attempts I found a sequence that works: create your products in Stripe manually first, then give the agent the exact price IDs in the prompt. Stripe''s test cards work for every currency. Watch out for the checkout session currency — it defaults to USD.',
   unixepoch() - 30*3600),
  (6, 1, 'Mira Chen', 'Community',
   'Who is joining the July community call?',
   'Our next global community call is on July 15 at 17:00 UTC. Agenda: three project demos from members, a discussion on selling your first micro-SaaS, and open networking in breakout rooms. Reply if you''re coming!',
   unixepoch() - 2*86400);

INSERT INTO comments (post_id, user_id, author_name, body, created_at) VALUES
  (1, 3, 'Amara Okafor', 'The redirect URL is exactly what blocked me too. Thanks for calling it out!', unixepoch() - 3600),
  (1, 4, 'Jonas Berg', 'Does Google sign-in work for you on a custom domain, or only on the default preview URL?', unixepoch() - 2400),
  (2, 6, 'Kenji Sato', 'My favorite: "use real content, no lorem ipsum, write everything like a human would".', unixepoch() - 3*3600),
  (2, 5, 'Priya Nair', 'I always give a reference: "in the style of X, but with warm colors". Dramatic difference.', unixepoch() - 2*3600),
  (3, 2, 'Diego Alvarez', 'Mine took about 12 hours for a fresh domain. Wait until tomorrow before touching anything.', unixepoch() - 6*3600),
  (4, 1, 'Mira Chen', 'Looks really clean! I''d add CSV export for the yearly overview.', unixepoch() - 20*3600),
  (5, 4, 'Jonas Berg', 'This is exactly what I need next week. Noting the currency gotcha!', unixepoch() - 10*3600),
  (6, 5, 'Priya Nair', 'Count me in +1. I can demo my booking system.', unixepoch() - 86400);

INSERT INTO votes (post_id, user_id) VALUES
  (1, 1), (1, 3), (1, 4), (1, 5), (1, 6),
  (2, 1), (2, 2), (2, 5), (2, 6),
  (3, 1), (3, 2),
  (4, 1), (4, 2), (4, 3),
  (5, 1), (5, 2), (5, 4), (5, 6),
  (6, 2), (6, 3), (6, 5);

INSERT INTO events (id, title, starts_at, location, kind, description) VALUES
  (1, 'VibeShipyard Community Call · July', unixepoch('2026-07-15 17:00'), 'Zoom · 17:00 – 19:00 UTC', 'online',
   'Project demos from the community, networking, and a discussion: "How I sold my first SaaS built by vibe coding".'),
  (2, 'Workshop: From idea to MVP in one weekend', unixepoch('2026-07-22 18:00'), 'Zoom · 18:00 – 19:30 UTC', 'online',
   'Hands-on session: structuring prompts, connecting a database, and going live.'),
  (3, 'VibeShipyard Hackathon · Ship Weekend', unixepoch('2026-09-05 09:00'), 'Online + local hubs worldwide · all day', 'in_person',
   '24 hours of building in teams across time zones. The jury awards the most useful product shipped by a first-time builder.');

INSERT INTO news (title, body, featured, published_at) VALUES
  ('New team collaboration features in AI app builders',
   'We rounded up the latest improvements for shared projects across the major AI coding tools and how to use them with your team. Includes a short walkthrough video.',
   1, unixepoch('2026-06-30')),
  ('Three community projects in the global showcase',
   'Proud moment! Check out the projects by Mira, Jonas and the "Shop Local" team — and what we can all learn from how they built them.',
   0, unixepoch('2026-06-21')),
  ('Pricing changes across AI coding tools and what they mean for you',
   'A breakdown of the new plans, which plan fits which kind of project, and how to make your credits go further.',
   0, unixepoch('2026-06-12'));

INSERT INTO courses (level, title, description, meta, sort) VALUES
  ('BEGINNER', 'Vibe coding fundamentals', 'Your first project, the tools, how to "talk" to AI and how not to get lost.', '8 lessons · ~1 hour', 1),
  ('INTERMEDIATE', 'Prompt engineering for builders', 'How to describe functionality so you get exactly what you want, on the first try.', '6 lessons · ~45 min', 2),
  ('ADVANCED', 'Data, auth and payments', 'A real database, email and Google sign-in, and payments that work worldwide.', '10 lessons · ~2 hours', 3);

INSERT INTO articles (title, meta, sort) VALUES
  ('Checklist before you ship your project', 'Article · 5 min read', 1),
  ('How to connect a custom domain to your project', 'Guide · 8 min read', 2),
  ('10 beginner mistakes and how to avoid them', 'Article · 7 min read', 3),
  ('Glossary: AI and no-code terms explained', 'Reference · continuously updated', 4);
