import { next } from '@vercel/functions';

// Only runs on product pages — everything else on the site is untouched.
export const config = {
  matcher: '/product/:path*',
};

// Known social/search crawler user agents. Keep this in sync with the
// nginx `$is_crawler` map on the VPS so both layers agree on what a "bot" is.
const BOT_UA_REGEX =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Discordbot|SkypeUriPreview|Pinterest|redditbot|Applebot|Googlebot|bingbot|YandexBot|DuckDuckBot/i;

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  // Real users: serve the normal React SPA, untouched.
  if (!BOT_UA_REGEX.test(ua)) {
    return next();
  }

  // Crawlers: reuse the existing SSR OG-tag endpoint on the apex domain
  // (same Express server, same MongoDB lookup, same logic already fixed).
  const url = new URL(request.url);
  const ogUrl = `https://printe.in${url.pathname}${url.search}`;

  try {
    const ogResponse = await fetch(ogUrl, {
      headers: { 'user-agent': ua },
    });
    const html = await ogResponse.text();

    return new Response(html, {
      status: ogResponse.status,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    // If the OG server is ever unreachable, don't break the page for the
    // crawler — just fall through to the normal SPA.
    return next();
  }
}
