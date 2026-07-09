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

  // Only crawlers take the OG-tag proxy branch below. Real visitors get
  // next() immediately and never touch the fetch() that was looping.
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

    // TEMP DEBUG: prove the middleware ran and show us exactly what the
    // upstream returned, even on a non-2xx status. Remove the debug
    // headers once this is confirmed working.
    return new Response(html, {
      status: ogResponse.status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-debug-middleware': 'reached-fetch',
        'x-debug-og-url': ogUrl,
        'x-debug-upstream-status': String(ogResponse.status),
      },
    });
  } catch (err) {
    // TEMP DEBUG: return the actual error instead of silently falling
    // back, so we can see exactly why the proxy to printe.in failed.
    return new Response(
      `MIDDLEWARE FETCH FAILED\nog_url: ${ogUrl}\nerror: ${err && err.message}\nstack: ${err && err.stack}`,
      {
        status: 502,
        headers: { 'content-type': 'text/plain', 'x-debug-middleware': 'fetch-threw' },
      },
    );
  }
}