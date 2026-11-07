// Runs after `vite build`: writes dist/products/<slug>.html carrying that product's title and
// link-preview tags. WhatsApp/Instagram/Facebook don't run JavaScript, so without this every shared
// product link previews as the generic site card. The page itself still boots the normal React app.
// shortcut: reads the catalog from backend/src/data/mockData.js (the seed source); a product added only
// in Supabase gets the generic card until it's added there too — move to a DB fetch with the admin panel.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { products } = require('../../backend/src/data/mockData.js');

const SITE = (process.env.SITE_URL || 'https://luomu.co').replace(/\/$/, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const base = readFileSync('dist/index.html', 'utf8');
mkdirSync('dist/products', { recursive: true });

const replace = (html, re, value) => {
  if (!re.test(html)) throw new Error(`prerender-meta: tag not found in index.html: ${re}`);
  return html.replace(re, () => value);
};

for (const p of products) {
  const title = `${p.name} — LUOMU`;
  const desc = `${p.short_description} PKR ${p.price_pkr.toLocaleString('en-PK')} · Cash on delivery across Pakistan.`;
  const url = `${SITE}/products/${p.slug}`;
  const image = p.primary_image_url ? `${SITE}${p.primary_image_url}` : `${SITE}/og-image.jpg`;

  let html = base;
  html = replace(html, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = replace(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(desc)}" />`);
  html = replace(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = replace(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(desc)}" />`);
  html = replace(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${esc(url)}" />`);
  html = replace(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${esc(image)}" />`);
  // Site card dimensions don't apply to portrait product photos; let the platform read them.
  html = html.replace(/\s*<meta property="og:image:(width|height)" content="\d+" \/>/g, '');
  html = replace(html, /<meta property="og:type" content="website" \/>/, '<meta property="og:type" content="product" />');

  // Served at /products/<slug> via "cleanUrls" in vercel.json.
  writeFileSync(`dist/products/${p.slug}.html`, html);
}

console.log(`prerender-meta: wrote previews for ${products.length} products (${SITE})`);
