const WHATSAPP_NUMBER = '84921909928';
const WHATSAPP_KOREA = '821021892675';
const DEFAULT_WHATSAPP_MESSAGE = "Hi! I'm interested in your products and would like a wholesale quotation.";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const allProducts = window.SOLA_PRODUCTS || [];
const wa = (text = DEFAULT_WHATSAPP_MESSAGE, number = WHATSAPP_NUMBER) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function renderSiteChrome() {
  const inBlog = location.pathname.replace(/\\/g, '/').includes('/blog/');
  const base = inBlog ? '../' : '';
  const page = location.pathname.split(/[\\/]/).pop() || 'index.html';
  const section = inBlog ? 'journal' : page.replace('.html', '');
  const active = key => section === key ? ' class="active"' : '';
  const header = `<div class="topbar"><div class="wrap topbar-grid"><div class="top-socials" aria-label="HANSEONG social channels"><span>Follow</span><a href="https://www.instagram.com/hanseong_beauty_global/" target="_blank" rel="noopener">IG</a><a href="https://www.facebook.com/hanseongbeautyglobal/" target="_blank" rel="noopener">FB</a><a href="https://t.me/+3aZiyqL7GRQyMDBl" target="_blank" rel="noopener noreferrer">TG</a></div><span class="topbar-note">Professional B2B aesthetic supply · Korea & Vietnam</span><a class="top-wa" data-wa><i></i> WhatsApp +84 92 190 99 28 <b>↗</b></a></div></div>
    <nav class="nav nav-2026"><div class="wrap"><div class="nav-inner"><div class="links"><a${active('index')} href="${base}index.html">Home</a><a${active('products')} href="${base}products.html">Products</a><a${active('brands')} href="${base}brands.html">Brands</a><a${active('about')} href="${base}about.html">About</a><a${active('journal')} href="${base}blog/index.html">Journal</a><a class="nav-mobile-only" href="${base}shipping.html">Shipping</a><a class="nav-mobile-only" href="${base}faq.html">FAQ</a><a class="nav-mobile-only" href="${base}contact.html">Contact</a><a class="nav-mobile-only nav-mobile-community" href="https://t.me/+3aZiyqL7GRQyMDBl" target="_blank" rel="noopener noreferrer">Telegram community</a><a class="btn primary nav-mobile-quote" data-wa>Quote on WhatsApp</a></div><a class="brand brand-logo" href="${base}index.html" aria-label="HANSEONG BEAUTY GLOBAL home"><img src="${base}assets/icons/logoNgang.png" alt="HANSEONG BEAUTY GLOBAL"></a><div class="nav-actions"><details class="nav-more"><summary>More <span>⌄</span></summary><div><a${active('shipping')} href="${base}shipping.html">Shipping</a><a${active('faq')} href="${base}faq.html">FAQ</a><a${active('contact')} href="${base}contact.html">Contact</a></div></details><a class="nav-community" href="https://t.me/+3aZiyqL7GRQyMDBl" target="_blank" rel="noopener noreferrer"><i></i> Community</a><a class="nav-whatsapp" data-wa><span>WhatsApp quote</span><b>↗</b></a><button class="menu" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span><b>Menu</b></button></div></div></div></nav>`;
  document.querySelector('.topbar')?.remove();
  document.querySelector('.nav')?.remove();
  document.body.insertAdjacentHTML('afterbegin', header);

  const footer = `<footer class="footer new-footer"><div class="wrap"><div class="footer-top"><div class="footer-brand"><div class="footer-logo"><img src="${base}assets/icons/logoFooter.png" alt="HANSEONG BEAUTY GLOBAL"></div><p>Professional aesthetic wholesale supply for clinics, spas, resellers and distributors worldwide.</p><div class="footer-social"><a href="https://www.instagram.com/hanseong_beauty_global/" target="_blank" rel="noopener">@hanseong_beauty_global</a><a href="https://www.facebook.com/hanseongbeautyglobal/" target="_blank" rel="noopener">Facebook</a><a href="https://t.me/+3aZiyqL7GRQyMDBl" target="_blank" rel="noopener noreferrer">Telegram</a></div></div><div><b>Explore</b><a href="${base}products.html">Products</a><a href="${base}brands.html">Brands</a><a href="${base}shipping.html">Shipping</a><a href="${base}blog/index.html">Journal</a><a href="${base}about.html">About HANSEONG</a></div><div><b>Contact</b><a data-wa>WhatsApp Vietnam: +84 92 190 99 28</a><a class="wa-korea">WhatsApp Korea: +82 10-2189-2675</a><a href="mailto:hanseongbeauty@gmail.com">hanseongbeauty@gmail.com</a></div><div class="footer-addresses"><b>Our offices</b><address><strong>Korea Headquarters</strong>Seoul Finance Center, 36 Sejong-daero, Jung-gu, Seoul 04520, South Korea</address><address><strong>Vietnam Office</strong>Kim Hoan Building, 19 Duy Tan, Cau Giay District, Hanoi 113000, Vietnam</address></div></div><div class="footer-bottom"><span>© 2026 HANSEONG BEAUTY GLOBAL</span><span>Professional buyers only · Product availability varies by market</span></div></div></footer>`;
  document.querySelector('.footer')?.remove();
  document.body.insertAdjacentHTML('beforeend', footer);
}

renderSiteChrome();

$$('.wa-korea').forEach(a => a.href = wa(undefined, WHATSAPP_KOREA));

$('.menu')?.addEventListener('click', e => {
  $('.links')?.classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', $('.links')?.classList.contains('open') ? 'true' : 'false');
});
$$('[data-wa]').forEach(a => a.href = wa(a.dataset.wa || undefined));

const quoteList = new Map();
let visibleCount = 24;
let filteredProducts = allProducts;

function productCard(p) {
  const selected = quoteList.has(p.name);
  const action = $('[data-quote-drawer]')
    ? `<button class="add-quote ${selected ? 'selected' : ''}" data-add-quote="${p.name.replace(/"/g, '&quot;')}">${selected ? 'Added ✓' : '+ Add to quote'}</button>`
    : `<a class="add-quote" href="${wa(`${DEFAULT_WHATSAPP_MESSAGE}\nProduct: ${p.name}`)}" target="_blank">Request quotation →</a>`;
  const url = `products/${slugify(p.name)}.html`;
  return `<article class="product">
    <figure><a href="${url}"><img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async"></a></figure>
    <div class="product-body"><h3><a href="${url}">${p.name}</a></h3><div class="meta"><span class="badge">${p.category}</span><span class="badge">${p.brand}</span></div>
    <p>${p.origin || 'International'} supply • ${p.tag || 'Available on request'}</p>
    ${action}</div>
  </article>`;
}

function renderGrid(grid, list) {
  const isFull = grid.dataset.mode === 'all';
  const shown = isFull ? list.slice(0, visibleCount) : list;
  grid.innerHTML = shown.map(productCard).join('') || '<p>No products found. Try another search.</p>';
  const count = $('[data-results-count]');
  if (count && isFull) count.textContent = `${list.length} products found`;
  const more = $('[data-load-more]');
  if (more) more.hidden = visibleCount >= list.length;
}

function updateQuoteBar() {
  const drawer = $('[data-quote-drawer]');
  const count = $('[data-quote-count]');
  const send = $('[data-send-quote]');
  if (count) count.textContent = quoteList.size;
  drawer?.classList.toggle('open', quoteList.size > 0);
  if (send) send.disabled = quoteList.size === 0;
}

document.addEventListener('click', e => {
  const add = e.target.closest('[data-add-quote]');
  if (add) {
    const name = add.dataset.addQuote;
    quoteList.has(name) ? quoteList.delete(name) : quoteList.set(name, true);
    add.classList.toggle('selected', quoteList.has(name));
    add.textContent = quoteList.has(name) ? 'Added ✓' : '+ Add to quote';
    updateQuoteBar();
  }
});

$('[data-send-quote]')?.addEventListener('click', () => {
  const items = [...quoteList.keys()].map((name, i) => `${i + 1}. ${name} — Qty:`).join('\n');
  window.open(wa(`Hi! I'm interested in the following products and would like a wholesale quotation:\n\n${items}\n\nDestination country:`), '_blank');
});

function setupProductSections() {
  $$('[data-products-grid]').forEach(grid => renderGrid(grid, grid.dataset.mode === 'featured' ? allProducts.filter(p => p.featured) : allProducts));
}

function setupFilters() {
  const cat = $('[data-category-filter]'), brand = $('[data-brand-filter]'), search = $('[data-search]');
  const grid = $('[data-products-grid][data-mode="all"]');
  if (!grid) return;
  const options = list => ['All', ...[...new Set(list)].sort((a, b) => a.localeCompare(b))].map(v => `<option value="${v}">${v}</option>`).join('');
  cat.innerHTML = options(allProducts.map(p => p.category));
  brand.innerHTML = options(allProducts.map(p => p.brand));
  cat.value = 'All';
  brand.value = 'All';
  const apply = () => {
    const q = search.value.toLowerCase().trim(); visibleCount = 24;
    filteredProducts = allProducts.filter(p => (cat.value === 'All' || p.category === cat.value) && (brand.value === 'All' || p.brand === brand.value) && (!q || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q)));
    renderGrid(grid, filteredProducts);
  };
  [cat, brand, search].forEach(el => el.addEventListener('input', apply));
  $('[data-clear-filters]')?.addEventListener('click', () => { search.value = ''; cat.value = 'All'; brand.value = 'All'; apply(); });
  $('[data-load-more]')?.addEventListener('click', () => { visibleCount += 24; renderGrid(grid, filteredProducts); });
  apply();
}

function renderBrands() {
  const el = $('[data-brands-grid]'); if (!el) return;
  const brands = [...new Set(allProducts.map(p => p.brand))].sort();
  el.innerHTML = brands.map(b => `<div class="brand-card">${b}<br><small>${allProducts.filter(p => p.brand === b).length} items</small></div>`).join('');
}

function setupForm() {
  const f = $('[data-quote-form]'); if (!f) return;
  f.addEventListener('submit', e => { e.preventDefault(); const d = new FormData(f); window.open(wa(`Hi! I'm interested in your products and would like a wholesale quotation.\nName: ${d.get('name') || ''}\nCountry: ${d.get('country') || ''}\nProducts: ${d.get('products') || ''}\nQuantity: ${d.get('quantity') || ''}\nMessage: ${d.get('message') || ''}`), '_blank'); });
}

setupProductSections(); setupFilters(); renderBrands(); setupForm();


// About-page count-up
(function initCountUp() {
  var counters = Array.from(document.querySelectorAll('[data-count]'));
  if (!counters.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function finishCounter(el) {
    el.textContent = (el.dataset.count || '0') + (el.dataset.suffix || '');
  }

  function animateCounter(el) {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';
    var target = Number(el.dataset.count || 0);
    if (reduceMotion || !Number.isFinite(target)) {
      finishCounter(el);
      return;
    }
    var start = performance.now();
    var duration = 1250;
    function frame(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  counters.forEach(function(el) {
    if (!reduceMotion) el.textContent = '0' + (el.dataset.suffix || '');
    observer.observe(el);
  });
})();
