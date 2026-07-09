import { next } from '@vercel/functions';

// Only runs on product pages — everything else on the site is untouched.
export const config = {
  matcher: '/product/:path*',
};

// Known social/search crawler user agents. Keep this in sync with the
// nginx `$is_crawler` map on the VPS so both layers agree on what a "bot" is.
const BOT_UA_REGEX =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Discordbot|SkypeUriPreview|Pinterest|redditbot|Applebot|Googlebot|bingbot|YandexBot|DuckDuckBot/i;

// The upstream that renders OG tags for crawlers — your Express server on
// the VPS (see server/index.js, the "/product/:id" SSR route). This must
// point somewhere this Vercel deployment does NOT also answer for.
// Overridable via a Vercel env var so it never has to be guessed again.
const OG_UPSTREAM_ORIGIN = process.env.OG_UPSTREAM_ORIGIN || 'https://printe.in';

// Defence-in-depth loop guard. Even with the bot check below, if DNS/domain
// aliasing ever changes so that OG_UPSTREAM_ORIGIN resolves back to this
// same middleware, this header stops the recursion after one hop instead
// of looping until Vercel's platform kills it (the INFINITE_LOOP_DETECTED
// page you saw).
const LOOP_GUARD_HEADER = 'x-og-proxy-depth';
const MAX_PROXY_DEPTH = 1;

const FETCH_TIMEOUT_MS = 4000;

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  // Real browsers: never proxy. Let the SPA load normally — this is what
  // was disabled before and caused every page load (not just bots) to
  // self-fetch forever.
  if (!BOT_UA_REGEX.test(ua)) {
    return next();
  }

  // If this request already passed through this proxy once, don't do it
  // again — fall through to the SPA shell instead of recursing.
  const depth = Number(request.headers.get(LOOP_GUARD_HEADER) || 0);
  if (depth >= MAX_PROXY_DEPTH) {
    return next();
  }

  const url = new URL(request.url);
  const ogUrl = `${OG_UPSTREAM_ORIGIN}${url.pathname}${url.search}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const ogResponse = await fetch(ogUrl, {
      headers: {
        'user-agent': ua,
        [LOOP_GUARD_HEADER]: String(depth + 1),
      },
      signal: controller.signal,
    });

    if (!ogResponse.ok) {
      // Upstream had a problem (product not found, 5xx, etc.) — fail open
      // to the SPA shell rather than showing the crawler an error page.
      return next();
    }

    const html = await ogResponse.text();

    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    // Upstream unreachable or timed out — fail open instead of breaking
    // the page.
    console.error('OG proxy fetch failed:', ogUrl, err && err.message);
    return next();
  } finally {
    clearTimeout(timeout);
  }
}