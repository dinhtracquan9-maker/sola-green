const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.hanseongbeauty.com';
const WA = 'https://wa.me/84921909928';
const DATA_FILE = path.join(ROOT, 'assets', 'data', 'products.js');
const PRODUCTS_DIR = path.join(ROOT, 'products');

const oldSplitPages = [
  'allergan-50u.html',
  'allergan-100u.html',
  'dysport-chai-to.html',
  'wondertox-100u.html',
  'wondertox-200u.html',
  'neuronox-100u.html',
  'hutox-100u.html',
  'kaimax-100.html',
  'kaimax-200u.html',
  'botulax-100.html',
  'botulax-100-unit.html',
  'botulax-200u.html',
  'botulax-300u.html',
  'rentox-100.html',
  'rentox-200.html',
  'meditoxin-100.html',
  'meditoxin-200.html',
  'bienox-100u.html',
  'liztox-100.html',
  'onetox-100.html',
  'onetox-200.html',
  'innotox-50.html',
  'innotox-100.html',
  'nabota-100.html',
  'nabota-200.html',
  'daxxify.html',
  'coretox-100u.html',
  'dehantox.html',
  'extox-100u.html',
  'toxta-100.html',
  'rubytoxin-100u.html',
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadProducts() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(DATA_FILE, 'utf8'), sandbox, { filename: DATA_FILE });
  return sandbox.window.SOLA_PRODUCTS || [];
}

function productPage(product) {
  const name = esc(product.name);
  const category = esc(product.category);
  const brand = esc(product.brand || product.name);
  const origin = esc(product.origin || 'International');
  const slug = slugify(product.name);
  const image = `/${product.image}`;
  const url = `${SITE}/products/${slug}.html`;
  const desc = esc(`Wholesale ${product.name} sourcing for clinics, spas, resellers and distributors with HANSEONG BEAUTY GLOBAL.`);
  const waLink = `${WA}?text=${encodeURIComponent(`Hi! I'm interested in your products and would like a wholesale quotation.\nProduct: ${product.name}\nDestination country: `)}`;
  const ld = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        image: `${SITE}/${product.image}`,
        category: product.category,
        brand: { '@type': 'Brand', name: product.brand || product.name },
        description: `Wholesale ${product.name} sourcing information for professional buyers.`,
        url,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/index.html` },
          { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE}/products.html` },
          { '@type': 'ListItem', position: 3, name: product.name, item: url },
        ],
      },
    ],
  });

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} Wholesale | HANSEONG BEAUTY GLOBAL</title><meta name="description" content="${desc}"><link rel="canonical" href="${url}"><meta property="og:type" content="product"><meta property="og:title" content="${name} Wholesale | HANSEONG BEAUTY GLOBAL"><meta property="og:description" content="${desc}"><meta property="og:image" content="${SITE}/${product.image}"><link rel="icon" href="/assets/icons/logo.png"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/css/style.css?v=20260727"><script type="application/ld+json">${ld}</script></head><body class="article-page"><nav class="nav"><div class="wrap nav-inner"><a class="brand brand-logo" href="/index.html"><img src="/assets/icons/logoNgang.png" alt="HANSEONG BEAUTY GLOBAL"></a><div class="article-nav"><a href="/products.html">← All products</a><a class="btn primary" href="/products.html">Build a quote list</a></div></div></nav><main><header class="article-hero"><div class="wrap article-wrap"><span>${category.toUpperCase()} · WHOLESALE</span><h1>${name}</h1><p>${desc}</p><div class="article-meta"><a href="/index.html">Home</a> › <a href="/products.html">Products</a> › ${name}</div></div></header><div class="article-cover wrap"><img src="${image}" alt="${name}" loading="lazy"></div><article class="article-body article-wrap"><p class="article-intro">HANSEONG BEAUTY GLOBAL supports professional buyers with wholesale sourcing, product availability checks, documentation support and international shipping coordination for ${name}.</p><h2>About ${name}</h2><p>${name} is listed in our professional ${category.toLowerCase()} catalogue for clinics, spas, resellers and distribution partners. Product availability may vary by destination market, quantity and current supply schedule.</p><h2>Wholesale sourcing notes</h2><p>Before placing an order, buyers normally confirm product image, quantity, destination country, shipping preference and any import documentation required by their local process.</p><ul><li><strong>Brand:</strong> ${brand}</li><li><strong>Origin:</strong> ${origin}</li><li><strong>Category:</strong> ${category}</li><li><strong>Support:</strong> WhatsApp quotation, stock check and shipment coordination.</li></ul><h2>Request quotation</h2><p>Send your product list and destination country through WhatsApp. Our team will help check current availability and quote options for wholesale buyers.</p><div class="article-end"><h2>Request a wholesale quote for ${name}</h2><p>Send your destination country and quantity. Our team will help you check current availability and shipping options.</p><a class="btn primary" href="${waLink}">Request quotation on WhatsApp →</a></div><p class="disclaimer">General procurement information for professional buyers. Not medical, legal, regulatory or import advice. Product availability varies by market.</p></article></main><footer class="footer new-footer"><div class="wrap"><div class="footer-top"><div><img src="/assets/icons/logoNgang.png" alt="HANSEONG BEAUTY GLOBAL"><p>Professional aesthetic wholesale supply for clinics, spas, resellers and distributors worldwide.</p></div><div><b>Explore</b><a href="/products.html">Products</a><a href="/brands.html">Brands</a><a href="/blog/index.html">Journal</a></div><div><b>Company</b><a href="/about.html">About HANSEONG</a><a href="/faq.html">FAQ</a><a href="/contact.html">Contact</a></div><div><b>Connect</b><a href="https://wa.me/84921909928">WhatsApp</a><a href="mailto:hanseongbeauty@gmail.com">Email sales</a></div></div><div class="footer-bottom"><span>© 2026 HANSEONG BEAUTY GLOBAL</span><span>Professional buyers only · Availability varies by market</span></div></div></footer><script src="/assets/js/main.js?v=20260727"></script></body></html>`;
}

function rebuildSitemap() {
  const fixed = ['index.html', 'products.html', 'brands.html', 'catalogue.html', 'shipping.html', 'about.html', 'faq.html', 'contact.html']
    .filter((file) => fs.existsSync(path.join(ROOT, file)))
    .map((file) => `${SITE}/${file}`);
  const dynamic = ['blog', 'products'].flatMap((dir) => {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) return [];
    return fs.readdirSync(full)
      .filter((file) => file.endsWith('.html'))
      .sort()
      .map((file) => `${SITE}/${dir}/${file}`);
  });
  const today = new Date().toISOString().slice(0, 10);
  const urls = [...fixed, ...dynamic].map((loc) => `<url><loc>${loc}</loc><lastmod>${today}</lastmod></url>`).join('');
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`, 'utf8');
}

fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

for (const file of oldSplitPages) {
  const target = path.join(PRODUCTS_DIR, file);
  if (fs.existsSync(target)) fs.unlinkSync(target);
}

const products = loadProducts().filter((product) => product.category === 'Toxin');
for (const product of products) {
  fs.writeFileSync(path.join(PRODUCTS_DIR, `${slugify(product.name)}.html`), productPage(product), 'utf8');
}

rebuildSitemap();

console.log(`Refreshed ${products.length} toxin page(s); removed ${oldSplitPages.length} old split page name(s).`);
