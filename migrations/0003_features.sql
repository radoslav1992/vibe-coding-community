-- VibeShipyard · course lessons with progress, article bodies

CREATE TABLE lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  sort INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_lessons_course ON lessons(course_id, sort);

CREATE TABLE lesson_completions (
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (lesson_id, user_id)
);

ALTER TABLE articles ADD COLUMN body TEXT NOT NULL DEFAULT '';

-- Course 1: Vibe coding fundamentals
INSERT INTO lessons (course_id, sort, title, content) VALUES
  (1, 1, 'What is vibe coding?',
'Vibe coding means building software by describing what you want in natural language and letting an AI agent write the code. You stay in charge of the product — the vision, the decisions, the taste — while the agent handles syntax, boilerplate and plumbing.

It is not "no thinking required". The builders who ship real products treat the AI like a very fast junior developer: they give clear direction, review what comes back, and correct course early. This course teaches you that working rhythm.

By the end you will have shipped a small but real project: deployed, on its own URL, usable by someone who is not you.'),
  (1, 2, 'Choosing your tool and setting up',
'All major AI coding tools share the same core loop — you describe, the agent builds, you review a live preview. They differ in where the code lives and how much control you get: browser-based builders manage everything for you, while CLI agents work directly in your own repository.

For your first project, pick whichever gets you to a live preview fastest. You can always graduate to a repo-based workflow later; the prompting skills transfer completely.

Set up the essentials before you start building: an account with your chosen tool, a place for the project to live, and ten distraction-free minutes. That is genuinely all you need for lesson three.'),
  (1, 3, 'Your first prompt: describe, don''t dictate',
'The most common beginner mistake is writing prompts like code: "add a div with a flexbox row of three buttons". You are hiring the agent for its implementation skill — describe the outcome instead: "a pricing section with three plans, the middle one highlighted".

A strong first prompt covers three things: who the app is for, what they need to do in it, and how it should feel. One paragraph each. Concrete beats clever: "a booking page for a hair salon where clients pick a service, a stylist and a time slot" gives the agent everything it needs.

Write your real first prompt now, for a small tool you actually want. Resist the urge to list twenty features — version one needs exactly one job done well.'),
  (1, 4, 'Reading and steering AI output',
'You do not need to understand every line the agent writes, but you should always test what it built like a user would: click through the flow, try wrong inputs, resize the window. Behavior is your review surface.

When something is off, describe the symptom precisely instead of guessing at the cause. "The save button does nothing after I edit the second field" gets a better fix than "the form is broken". Paste exact error messages verbatim — they are the agent''s best debugging input.

Steer with small corrections, one thing at a time. Five focused follow-ups beat one giant do-over prompt, because each fix stays reviewable and reversible.'),
  (1, 5, 'Shipping your first project',
'Shipped beats perfect. Deploy as soon as the single core flow works — a live URL changes how seriously you (and everyone else) treat the project, and real usage tells you what to build next better than any plan.

Before sharing the link, run the launch basics: test on a phone, check what happens with empty data, make sure a stranger can figure out the first step without you explaining it.

Then actually share it — with a friend, a colleague, or the VibeShipyard feed under the Show & Tell tag. Feedback from one real user is worth ten hours of solo polishing. Welcome to the fleet.');

-- Course 2: Prompt engineering for builders
INSERT INTO lessons (course_id, sort, title, content) VALUES
  (2, 1, 'Anatomy of a great feature prompt',
'A feature prompt that works on the first try has four parts: context (what the app is and who uses it), the job (what this feature must accomplish), constraints (what must not change), and acceptance criteria (how you will know it works).

Most failed prompts are missing the constraints. "Add dark mode" without "keep the current layout and colors in light mode untouched" invites the agent to redesign things you liked.

Steal this template: "In [app], users need to [job]. Build [feature] so that [acceptance criteria]. Do not change [constraints]." Boring, reliable, effective.'),
  (2, 2, 'Context is everything',
'The agent only knows what is in front of it. The difference between a generic result and an exact one is usually the context you provided: real example data, the actual error message, a screenshot of the current state, the specific user complaint.

Use real content, never placeholders. "Products like ''Organic olive oil 500ml, €12.90''" produces a better product card than "some products". Lorem ipsum in, lorem ipsum out.

References are legal and powerful: "a checkout flow like a typical food delivery app, but single-vendor" communicates fifty decisions in one sentence.'),
  (2, 3, 'Iterating without breaking what works',
'Once part of your app works, protect it. Scope every follow-up prompt to the area you are changing — name the page, the component, the flow — and explicitly say what must stay untouched.

Review changes after each iteration, not after ten. When the agent shows you what it modified, skim the list: if it touched files unrelated to your request, ask why before piling on the next feature.

Keep a working checkpoint you can return to. Whether that is a git commit or your tool''s version history, "roll back and re-prompt" is often faster than untangling a bad change with more prompts.'),
  (2, 4, 'Debugging with prompts',
'Debugging by prompt is a skill of description, not diagnosis. Report exactly three things: what you did, what happened, what you expected instead. Let the agent form the hypothesis — that is what it is good at.

Paste errors whole. The stack trace line you consider noise is often the line that matters. If the bug is visual, describe the wrong state concretely: "the modal opens behind the page content" beats "z-index issue?" even when you suspect the cause.

If two fix attempts fail, change strategy: ask the agent to explain how the broken flow currently works, step by step. Reading its explanation usually reveals the wrong assumption — yours or its — and the third fix lands.');

-- Course 3: Data, auth and payments
INSERT INTO lessons (course_id, sort, title, content) VALUES
  (3, 1, 'Adding a real database',
'The jump from prototype to product is persistence: your app has to remember things after the tab closes. Every serious AI coding stack can wire up a hosted database — you just have to ask for it explicitly.

Prompt for the shape of the data, not the technology: "store bookings with a service, a stylist, a start time and a customer email" lets the agent pick sensible columns and types. Mention the database product only if you already know your stack.

After the agent sets it up, verify like a skeptic: create a record, refresh the page, restart the app. If the data survives all three, you have a real database.'),
  (3, 2, 'Modeling your data',
'Good data models make every later feature cheaper. Before prompting, write down your nouns (user, booking, service) and the relationships between them (a booking belongs to one user and one service). That sentence-level model is exactly what the agent needs.

Prefer boring, explicit structures: separate tables per noun, real foreign keys, timestamps on everything. Clever denormalization is a problem you are lucky to have later.

When requirements change, migrate — do not mutate blindly. Ask the agent for a migration that preserves existing data, and test it against a copy before running it on production. Your future self sends thanks.'),
  (3, 3, 'Authentication that users trust',
'Auth is the feature where "mostly works" is not acceptable, so lean on standards: email plus password with proper hashing, or sign-in with Google/GitHub via OAuth. Tell the agent which methods you want and it will wire the flow.

The classic snag is the redirect URL. OAuth providers only send users back to addresses you have whitelisted — when sign-in mysteriously fails, the exact redirect URL in your provider settings is the first thing to check.

Test auth like an attacker, gently: wrong password, expired session, one user trying to open another user''s data by changing the URL. Five minutes of hostile clicking catches what demos never do.'),
  (3, 4, 'Taking payments',
'Payments reward preparation. Create your products and prices in the payment provider''s dashboard first, by hand — then give the agent the exact price IDs in your prompt. Generated checkout code with real IDs works on the first run far more often.

Stay in test mode until the whole flow works end to end: checkout, success page, failure page, and the webhook that records the purchase. Providers publish test card numbers for every scenario, including declines — use them all.

Watch the details that bite later: currency defaults (many stacks silently assume USD), taxes, and what happens if a user pays twice. Each is one prompt to handle — if you remember to ask.'),
  (3, 5, 'Going to production',
'Production readiness is a checklist, not a feeling. Secrets out of the code and into environment variables. Test data wiped. Error pages that do not leak stack traces. A custom domain with SSL. Backups turned on for the database.

Then add the two things you cannot retrofit after an incident: error monitoring, so you hear about crashes before users tweet them, and at least a weekly database backup you have actually restored once.

Launch small on purpose: share with ten users, watch the logs for a day, fix what surfaces, then widen. A quiet first week in production is the best growth hack there is.');

-- Article bodies
UPDATE articles SET body =
'You built the thing — before the link goes public, spend thirty minutes on this checklist. It catches the problems that make first-time visitors bounce.

One: walk the core flow as a brand-new user, on your phone, in a private browser window. No cached session, no desktop-sized screen, no founder knowledge. If you hesitate anywhere, a stranger quits there.

Two: try to break the forms. Submit empty fields, paste a novel into the name box, use an email like "test@test". Every input should fail politely instead of crashing or accepting garbage.

Three: check the empty states. A new account with no data should see a friendly nudge toward the first action — not a blank screen that looks broken.

Four: secrets and test data. No API keys in client code, no "asdf" posts on the public feed, no admin password of "admin". Rotate anything you even suspect leaked during development.

Five: set up the minimum observability — error tracking and a simple uptime check. You want to know it broke before your users tell you.

None of this takes engineering heroics. It takes deciding that the first impression matters — because for most visitors, it is the only one you get.'
WHERE sort = 1;

UPDATE articles SET body =
'A custom domain is what separates "cool demo" from "real product" in a visitor''s mind. The good news: connecting one to a vibe-coded project is a fifteen-minute job once you know the moving parts.

Step one: buy the domain at any registrar. Prices for common TLDs are similar everywhere; what matters more is an easy DNS dashboard.

Step two: find your hosting platform''s custom-domain instructions. Every platform gives you either an A record (an IP address) or a CNAME (a hostname) to add in DNS — plus sometimes a verification TXT record. Add exactly what they specify, nothing more.

Step three: wait out the SSL certificate. After DNS propagates, the platform issues a certificate automatically. This usually takes minutes but can take hours for freshly registered domains — resist the urge to change settings while it is pending, which restarts the process.

Step four: set your canonical URL. Pick www or bare domain, redirect the other, and update the site URL in your app config so links and social previews point at the new address.

The classic mistakes: a typo in the DNS record value, adding the record at the wrong level (the root instead of a subdomain or vice versa), and old records from a previous setup conflicting with the new ones. When stuck, delete everything related to the hostname and re-add only the current instructions.'
WHERE sort = 2;

UPDATE articles SET body =
'Everyone''s first ten AI-built projects hit the same walls. Here are the mistakes we see most in the community, and the cheap way around each one.

Mistake one: prompting features instead of outcomes. "Add a dashboard" produces a generic dashboard. "Show me which of my products sold best this week" produces your dashboard.

Mistake two: the mega-prompt. Twenty requirements in one message means the agent satisfies twelve, and you cannot tell which. One feature per prompt, review, repeat.

Mistake three: never reading the plan. Most tools explain what they are about to change. The thirty seconds it takes to skim is the cheapest bug prevention available.

Mistake four: building for a week without deploying. Deploy on day one; a live URL surfaces environment problems while they are still small and keeps motivation honest.

Mistake five: treating errors as failure. Errors are the agent''s food. Paste them verbatim and the fix is usually one round-trip away.

Mistake six: skipping version checkpoints. When (not if) an iteration goes sideways, "restore and re-prompt" beats "fix the fix of the fix".

Mistake seven: polishing before anyone has used it. One real user''s confusion is worth more than another evening of pixel-pushing. Ship, watch, then polish what actually needs it.

The pattern behind all seven: keep the loop small. Small prompts, frequent deploys, early feedback. Vibe coding rewards rhythm over heroics.'
WHERE sort = 3;

UPDATE articles SET body =
'The AI-builder world is thick with jargon. Bookmark this glossary — it is updated as the vocabulary evolves.

Vibe coding: building software by describing intent in natural language and reviewing what an AI agent produces, rather than writing code by hand.

Agent: an AI system that does not just answer but acts — editing files, running commands, deploying — in a loop toward your goal.

Prompt: any instruction you give an AI. In building contexts, usually a feature request or a bug report.

Context window: the amount of conversation and code the AI can "see" at once. Long projects exceed it, which is why agents summarize or re-read files.

MCP (Model Context Protocol): a standard that lets AI tools plug into external services — databases, browsers, APIs — as capabilities the agent can use.

Deploy: publishing your app to a server so it is reachable at a URL. Modern platforms make this one command or one prompt.

Environment variable: configuration stored outside your code — API keys, database addresses. The standard way to keep secrets out of the codebase.

Webhook: a URL your app exposes so other services can notify it of events, like "payment succeeded".

Migration: a scripted, versioned change to a database''s structure, designed to run without losing existing data.

OAuth: the standard behind "Sign in with Google/GitHub" — your app receives proof of identity without ever seeing the user''s password.

Missing a term? Post it in the feed under Help and we will add it here.'
WHERE sort = 4;

-- Align course metadata with the seeded lessons
UPDATE courses SET meta = '5 lessons · ~40 min' WHERE id = 1;
UPDATE courses SET meta = '4 lessons · ~30 min' WHERE id = 2;
UPDATE courses SET meta = '5 lessons · ~45 min' WHERE id = 3;
