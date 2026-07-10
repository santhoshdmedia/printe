import { next } from '@vercel/functions';

// ─── Config ───────────────────────────────────────────────────────────────────
export const config = {
  matcher: '/product/:path*',
};

// ─── Constants ────────────────────────────────────────────────────────────────
const DOMAIN         = 'https://printe.in';
const S3_BUCKET      = 'https://printe.s3.ap-south-1.amazonaws.com';
const SITE_NAME      = 'Printe';
const TWITTER_HANDLE = '@printe_in';
const DEFAULT_OG_IMAGE =
  'https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg';
const DEFAULT_DESCRIPTION = 'Check out this amazing product on Printe.';

// API base — set OG_API_ORIGIN in Vercel env vars (e.g. https://printe.in/api)
const API_BASE =
  process.env.OG_API_ORIGIN ||
  process.env.VITE_BASE_API_URL ||
  'https://printe.in/api';

// ─── Crawler detection ────────────────────────────────────────────────────────
const BOT_UA_REGEX =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Discordbot|SkypeUriPreview|Pinterest|redditbot|Applebot|Googlebot|bingbot|YandexBot|DuckDuckBot/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const clamp = (str = '', max = 155) => {
  const s = str.trim();
  return s.length > max ? `${s.substring(0, max - 3)}...` : s;
};

const toAbsImage = (src) => {
  if (!src) return DEFAULT_OG_IMAGE;
  const raw = (typeof src === 'string' ? src : src?.url || src?.path || '').trim().split('?')[0];
  if (!raw) return DEFAULT_OG_IMAGE;
  if (raw.startsWith('https://')) return raw;
  if (raw.startsWith('http://'))  return raw.replace('http://', 'https://');
  return `${S3_BUCKET}/${raw.replace(/^\//, '')}`;
};

const getBestImage = (p) => {
  const candidates = [p.seo_img, p?.images?.[0]?.url, p?.images?.[0]?.path];
  for (const c of candidates) {
    const url = toAbsImage(c);
    if (url !== DEFAULT_OG_IMAGE) return url;
  }
  return DEFAULT_OG_IMAGE;
};

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// ─── Build OG HTML for crawlers ───────────────────────────────────────────────
function buildOgHtml(product, canonicalUrl) {
  const rawTitle = (product.seo_title || product.name || '').trim();
  const title = rawTitle
    ? rawTitle.toLowerCase().includes('printe') ? rawTitle : `${rawTitle} | ${SITE_NAME}`
    : `${SITE_NAME} | Product`;

  const descCandidates = [
    product.seo_description,
    product.product_description_tittle,
    stripHtml(product.description_tabs?.[0]?.description || ''),
    [product.Point_one, product.Point_two, product.Point_three, product.Point_four]
      .filter(Boolean).join('. '),
  ];
  let description = DEFAULT_DESCRIPTION;
  for (const c of descCandidates) {
    const s = (c || '').trim();
    if (s.length >= 20) { description = clamp(s, 155); break; }
  }

  const kw = product.seo_keywords;
  const keywords = kw
    ? (Array.isArray(kw) ? kw.join(', ') : String(kw)).trim() || 'Printe, products, online shopping'
    : 'Printe, products, online shopping';

  const ogImage      = getBestImage(product);
  const price        = String(product.customer_product_price || product.price || product.MRP_price || '0');
  const inStock      = (product.stock_count ?? 0) > 0;
  const availability = inStock ? 'in stock' : 'out of stock';

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: (product.name || '').trim() || title,
    description,
    image: ogImage,
    sku: product.product_code || undefined,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'INR',
      price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME, url: DOMAIN },
    },
  };
  if (product.rating && parseFloat(product.rating) > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating),
      reviewCount: String(product.reviews_count || 1),
      bestRating: '5',
      worstRating: '1',
    };
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="keywords" content="${esc(keywords)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${esc(canonicalUrl)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="${esc(SITE_NAME)}" />
  <meta property="og:locale" content="en_IN" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(canonicalUrl)}" />
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta property="og:image:secure_url" content="${esc(ogImage)}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(title)}" />
  <meta property="product:price:amount" content="${esc(price)}" />
  <meta property="product:price:currency" content="INR" />
  <meta property="product:availability" content="${esc(availability)}" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="${esc(TWITTER_HANDLE)}" />
  <meta name="twitter:creator" content="${esc(TWITTER_HANDLE)}" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(ogImage)}" />
  <meta name="twitter:url" content="${esc(canonicalUrl)}" />

  <!-- Structured Data: Product -->
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <h1>${esc(title)}</h1>
  <p>${esc(description)}</p>
  <a href="${esc(canonicalUrl)}">View product on ${esc(SITE_NAME)}</a>
</body>
</html>`;
}

// ─── Edge Middleware ───────────────────────────────────────────────────────────
export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  // Real browsers: serve the SPA as-is — no proxy, no delay
  if (!BOT_UA_REGEX.test(ua)) return next();

  // Extract slug from /product/<slug>
  const url  = new URL(request.url);
  const slug = url.pathname.replace(/^\/product\//, '').replace(/\/$/, '');
  if (!slug) return next();

  const canonical  = `${DOMAIN}/product/${slug}`;
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 4000);

  try {
    // Fetch product data directly from your backend — no VPS SSR dependency
    const apiRes = await fetch(
      `${API_BASE}/product/get_product/${encodeURIComponent(slug)}`,
      {
        headers: { 'user-agent': ua, accept: 'application/json' },
        signal: controller.signal,
      },
    );

    if (!apiRes.ok) {
      console.error(`[og-middleware] API ${apiRes.status} for: ${slug}`);
      return next();
    }

    const json    = await apiRes.json();
    // API returns { data: [product] } or { data: product }
    const product = Array.isArray(json?.data) ? json.data[0] : json?.data;
    if (!product) { return next(); }

    return new Response(buildOgHtml(product, canonical), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        // Cache at edge for 5 min, serve stale for 10 min while revalidating
        'cache-control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[og-middleware] failed for slug:', slug, err?.message);
    return next(); // Always fail open to the SPA
  } finally {
    clearTimeout(timeout);
  }
}