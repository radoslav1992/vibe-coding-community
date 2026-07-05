import { defineMiddleware } from 'astro:middleware';
import { getSessionUserId, SESSION_COOKIE } from './lib/auth';
import { getUserById } from './lib/db';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;

  // Same-origin check for mutating requests (forms + fetch calls).
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    const origin = context.request.headers.get('origin');
    if (origin && origin !== context.url.origin) {
      return new Response('Cross-origin request rejected', { status: 403 });
    }
  }

  const db = context.locals.runtime?.env?.DB;
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  if (db && token) {
    const userId = await getSessionUserId(db, token);
    if (userId) {
      context.locals.user = await getUserById(db, userId);
    }
  }

  return next();
});
