const WHATSAPP_NUMBER = '84921909928';
const WHATSAPP_KOREA = '821021892675';
const DEFAULT_WHATSAPP_MESSAGE = "Hi! I'm interested in your products and would like a wholesale quotation.";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const allProducts = window.SOLA_PRODUCTS || [];
const wa = (text = DEFAULT_WHATSAPP_MESSAGE, number = WHATSAPP_NUMBER) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const instagramIcon = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="5" width="22" height="22" rx="7" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="16" cy="16" r="5" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="23" cy="9" r="1.6"/></svg>`;
const facebookIcon = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18.5 28V17.3h3.6l.5-4.2h-4.1v-2.7c0-1.2.3-2 2.1-2h2.2V4.7c-.4-.1-1.7-.2-3.2-.2-3.2 0-5.4 1.9-5.4 5.5v3.1h-3.6v4.2h3.6V28h4.3Z"/></svg>`;
const telegramIcon = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M52.4 11.7 7.8 28.9c-3 1.2-3 2.8-.6 3.5l11.4 3.6 4.4 13.4c.5 1.5.3 2.1 1.8 2.1 1.2 0 1.7-.5 2.4-1.1l5.5-5.3 11.5 8.5c2.1 1.2 3.7.6 4.2-2l7.6-35.8c.8-3.1-1.2-4.6-3.6-3.1ZM22.6 35.2l22.3-14.1c1.1-.7 2.1-.3 1.3.4L27.8 38.1l-.7 7.3-4.5-10.2Z"/></svg>`;
const whatsappIcon = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3A13 13 0 0 0 5 23l-2 6 6-2a13 13 0 1 0 7-24Zm0 23a10 10 0 0 1-5-1.3l-.7-.4-3.4 1 1.1-3.2-.4-.7A10 10 0 1 1 16 26Zm5.5-7.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-1.9-.9-3.2-2.2-4.1-4-.2-.3 0-.5.1-.7l.7-.8c.2-.2.2-.4.3-.6.1-.2 0-.5 0-.7l-1-2.3c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.9 5.1.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4Z"/></svg>`;
const searchIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m16.5 16.5 3.5 3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const closeIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

function renderSiteChrome() {
  const path = location.pathname.replace(/\\/g, '/');
  const inBlog = path.includes('/blog/');
  const inProducts = path.includes('/products/');
  const base = (inBlog || inProducts) ? '../' : '';
  const page = path.split('/').pop() || 'index.html';
  const section = inBlog ? 'journal' : page.replace('.html', '') || 'index';
  const active = key => section === key ? ' class="active"' : '';

  const productMenu = `
    <div class="product-mega" role="menu" aria-label="Browse product categories">
      <div class="mega-head">
        <span>Browse products</span>
        <a href="${base}products.html">View all products</a>
      </div>
      <div class="mega-grid">
        <a href="${base}products.html?category=Dermal%20Fillers"><b>Dermal fillers</b><small>HA fillers and clinic favourites</small></a>
        <a href="${base}products.html?category=Skin%20Boosters%20%2F%20PN"><b>Skin boosters / PN</b><small>PDRN, PN and hydration boosters</small></a>
        <a href="${base}products.html?category=Exosome%20%2F%20Meso"><b>Exosome / Meso</b><small>Meso cocktails and exosome lines</small></a>
        <a href="${base}products.html?category=Toxin"><b>Botulinum toxin</b><small>Korean and global toxin brands</small></a>
        <a href="${base}products.html?category=Wellness%20%2F%20IV"><b>Wellness / IV</b><small>Laennec, Melsmon and NAD+</small></a>
        <a href="${base}products.html?category=Body%20%26%20Weight%20Care"><b>Body & weight care</b><small>Lipolysis and slimming support</small></a>
      </div>
      <div class="mega-actions">
        <a data-wa>Request quote</a>
        <a href="${base}shipping.html">Shipping support</a>
      </div>
    </div>`;

  const header = `
    <div class="topbar">
      <div class="wrap topbar-grid">
        <div class="top-socials" aria-label="HANSEONG social channels">
          <span>Follow</span>
          <a href="https://www.instagram.com/hanseong_beauty_global/" target="_blank" rel="noopener" aria-label="Instagram">${instagramIcon}</a>
          <a href="https://www.facebook.com/hanseongbeautyglobal/" target="_blank" rel="noopener" aria-label="Facebook">${facebookIcon}</a>
          <a href="https://t.me/+3aZiyqL7GRQyMDBl" target="_blank" rel="noopener noreferrer" aria-label="Telegram">${telegramIcon}</a>
        </div>
        <span class="topbar-note">Professional B2B aesthetic supply · Korea & Vietnam</span>
        <a class="top-wa" data-wa><i></i><span>WhatsApp +84 92 190 99 28</span></a>
      </div>
    </div>
    <nav class="nav nav-2026">
      <div class="wrap">
        <div class="nav-inner">
          <div class="links">
            <div class="mobile-menu-head"><span>Explore</span><b>HANSEONG BEAUTY</b></div>
            <button class="mobile-menu-search" type="button" data-mobile-search>${searchIcon}<span>Search catalogue</span></button>
            <a${active('index')} href="${base}index.html">Home</a>
            <div class="product-nav-wrap"><a${active('products')} href="${base}products.html">Products</a>${productMenu}</div>
            <a${active('brands')} href="${base}brands.html">Brands</a>
            <a${active('about')} href="${base}about.html">About</a>
            <a${active('journal')} href="${base}blog/index.html">Journal</a>
            <a class="nav-mobile-only" href="${base}shipping.html">Shipping</a>
            <a class="nav-mobile-only" href="${base}faq.html">FAQ</a>
            <a class="nav-mobile-only" href="${base}contact.html">Contact</a>
            <a class="nav-mobile-only nav-mobile-community" href="https://t.me/+3aZiyqL7GRQyMDBl" target="_blank" rel="noopener noreferrer">Telegram community</a>
            <a class="btn primary nav-mobile-quote" data-wa>Get a wholesale quote on WhatsApp</a>
          </div>
          <a class="brand brand-logo" href="${base}index.html" aria-label="HANSEONG BEAUTY GLOBAL home"><img src="${base}assets/icons/logoHeader.png" alt="HANSEONG BEAUTY GLOBAL"></a>
          <div class="nav-actions">
            <details class="nav-more"><summary>More <span>⌄</span></summary><div><a${active('shipping')} href="${base}shipping.html">Shipping</a><a${active('faq')} href="${base}faq.html">FAQ</a><a${active('contact')} href="${base}contact.html">Contact</a></div></details>
            <a class="nav-community" href="https://t.me/+3aZiyqL7GRQyMDBl" target="_blank" rel="noopener noreferrer"><i></i> Community</a>
            <button class="nav-search" type="button" aria-label="Search products" aria-expanded="false" aria-controls="site-search-drawer">${searchIcon}<span>Search products</span></button>
            <a class="nav-whatsapp" data-wa aria-label="Get a wholesale quote on WhatsApp">${whatsappIcon}<span>WhatsApp quote</span></a>
            <button class="menu" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span><b>Menu</b></button>
          </div>
        </div>
        <form class="site-search-drawer" id="site-search-drawer" action="${base}products.html" method="get" role="search" aria-label="Search the catalogue" hidden>
          <label for="site-search-input">Search the catalogue</label>
          <div class="site-search-box">
            ${searchIcon}
            <input id="site-search-input" name="q" type="search" placeholder="Search products or brands..." autocomplete="off">
            <button class="site-search-submit" type="submit">Search</button>
            <button class="site-search-close" type="button" aria-label="Close search">${closeIcon}</button>
          </div>
        </form>
      </div>
    </nav>`;

  document.querySelector('.topbar')?.remove();
  document.querySelector('.nav')?.remove();
  document.body.insertAdjacentHTML('afterbegin', header);

  const footer = `
    <footer class="footer new-footer">
      <div class="wrap">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="footer-logo"><img src="${base}assets/icons/logoFooter.png" alt="HANSEONG BEAUTY GLOBAL"></div>
            <p>Professional aesthetic wholesale supply for clinics, spas, resellers and distributors worldwide.</p>
            <div class="footer-social" aria-label="HANSEONG social channels">
              <a href="https://www.instagram.com/hanseong_beauty_global/" target="_blank" rel="noopener" aria-label="Instagram">${instagramIcon}</a>
              <a href="https://www.facebook.com/hanseongbeautyglobal/" target="_blank" rel="noopener" aria-label="Facebook">${facebookIcon}</a>
              <a href="https://t.me/+3aZiyqL7GRQyMDBl" target="_blank" rel="noopener noreferrer" aria-label="Telegram">${telegramIcon}</a>
            </div>
          </div>
          <div><b>Explore</b><a href="${base}products.html">Products</a><a href="${base}brands.html">Brands</a><a href="${base}shipping.html">Shipping</a><a href="${base}blog/index.html">Journal</a><a href="${base}about.html">About HANSEONG</a></div>
          <div><b>Contact</b><a data-wa>WhatsApp Vietnam: +84 92 190 99 28</a><a class="wa-korea">WhatsApp Korea: +82 10-2189-2675</a><a href="mailto:hanseongbeauty@gmail.com">hanseongbeauty@gmail.com</a></div>
          <div class="footer-addresses"><b>Our offices</b><address><strong>Korea Headquarters</strong>Seoul Finance Center, 36 Sejong-daero, Jung-gu, Seoul 04520, South Korea</address><address><strong>Vietnam Office</strong>Kim Hoan Building, 19 Duy Tan, Cau Giay District, Hanoi 113000, Vietnam</address></div>
        </div>
        <div class="footer-bottom"><span>© 2026 HANSEONG BEAUTY GLOBAL</span><span>Professional buyers only · Product availability varies by market</span></div>
      </div>
    </footer>`;
  document.querySelector('.footer')?.remove();
  document.body.insertAdjacentHTML('beforeend', footer);
}

renderSiteChrome();

$$('.wa-korea').forEach(a => a.href = wa(undefined, WHATSAPP_KOREA));

$('.menu').addEventListener('click', e => {
  $('.links').classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', $('.links').classList.contains('open') ? 'true' : 'false');
});

(function setupSiteSearch() {
  const trigger = $('.nav-search');
  const mobileTrigger = $('[data-mobile-search]');
  const drawer = $('#site-search-drawer');
  const input = $('#site-search-input');
  const close = $('.site-search-close');
  if (!trigger || !drawer || !input || !close) return;

  const setOpen = open => {
    drawer.hidden = !open;
    drawer.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) window.setTimeout(() => input.focus(), 80);
  };

  trigger.addEventListener('click', () => setOpen(drawer.hidden));
  mobileTrigger?.addEventListener('click', () => {
    $('.links')?.classList.remove('open');
    $('.menu')?.setAttribute('aria-expanded', 'false');
    setOpen(true);
  });
  close.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !drawer.hidden) setOpen(false);
  });
})();

$$('.links a').forEach(link => link.addEventListener('click', () => {
  $('.links').classList.remove('open');
  $('.menu').setAttribute('aria-expanded', 'false');
}));

$$('[data-wa]').forEach(a => {
  a.href = wa(a.dataset.wa || undefined);
  if (!a.target) a.target = '_blank';
  a.rel = 'noopener';
});

const quoteList = new Map();
let visibleCount = 24;
let filteredProducts = allProducts;

const categoryGroups = [
  { value: 'All', label: 'All product categories', aliases: null },
  { value: 'Dermal Fillers', label: 'Dermal Fillers', aliases: ['Dermal Fillers', 'Body Filler'] },
  { value: 'Skin Booster / Meso', label: 'Skin Booster / Meso', aliases: ['Skin Boosters / PN', 'Exosome / Meso', 'Meso / Needles'] },
  { value: 'Botulinum Toxin', label: 'Botulinum Toxin', aliases: ['Toxin'] },
  { value: 'Fat Dissolving / Weight Loss', label: 'Fat Dissolving / Weight Loss', aliases: ['Body & Weight Care', 'Weight Management', 'Lipolysis / Body', 'Dissolving / Hyaluronidase'] },
  { value: 'Wellness / Injection', label: 'Wellness / Injection', aliases: ['Wellness / IV', 'Injection / Medicine'] },
  { value: 'Supplies / Anesthetic', label: 'Supplies / Anesthetic', aliases: ['Injection Supplies', 'Dental / Anesthetic', 'Numbing / Anesthetic', 'Numbing Cream'] },
  { value: 'Biostimulator', label: 'Biostimulator', aliases: ['Biostimulator'] }
];

function displayCategory(p) {
  const hit = categoryGroups.find(group => group.aliases?.includes(p.category) || group.aliases?.includes(p.tag));
  return hit?.label || p.category;
}

function categoryMatches(p, selected) {
  if (selected === 'All') return true;
  const group = categoryGroups.find(item => item.value === selected);
  return group ? group.aliases.includes(p.category) || group.aliases.includes(p.tag) : p.category === selected;
}

function productCard(p) {
  const selected = quoteList.has(p.name);
  const inProductsDir = location.pathname.replace(/\\/g, '/').includes('/products/');
  const detailBase = inProductsDir ? './' : 'products/';
  const assetBase = inProductsDir ? '../' : '';
  const imageUrl = /^https:|^\//.test(p.image || '') ? p.image : `${assetBase}${p.image}`;
  const action = $('[data-quote-drawer]')
    ? `<button class="add-quote ${selected ? 'selected' : ''}" data-add-quote="${p.name.replace(/"/g, '&quot;')}">${selected ? 'Added ✓' : '+ Add to quote'}</button>`
    : `<a class="add-quote" href="${wa(`${DEFAULT_WHATSAPP_MESSAGE}\nProduct: ${p.name}`)}" target="_blank" rel="noopener">Request quotation</a>`;
  const url = `${detailBase}${slugify(p.name)}.html`;
  return `<article class="product">
    <figure><a href="${url}"><img src="${imageUrl}" alt="${p.name}" loading="lazy" decoding="async"></a></figure>
    <div class="product-body">
      <h3><a href="${url}">${p.name}</a></h3>
      <div class="meta"><span class="badge">${displayCategory(p)}</span><span class="badge">${p.brand}</span></div>
      <p>${p.origin || 'International'} supply • ${p.tag || 'Available on request'}</p>
      ${action}
    </div>
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
  if (drawer) drawer.classList.toggle('open', quoteList.size > 0);
  if (send) send.disabled = quoteList.size === 0;
}

document.addEventListener('click', e => {
  const add = e.target.closest('[data-add-quote]');
  if (!add) return;
  const name = add.dataset.addQuote;
  quoteList.has(name) ? quoteList.delete(name) : quoteList.set(name, true);
  add.classList.toggle('selected', quoteList.has(name));
  add.textContent = quoteList.has(name) ? 'Added ✓' : '+ Add to quote';
  updateQuoteBar();
});

const sendQuoteButton = $('[data-send-quote]');
if (sendQuoteButton) {
  sendQuoteButton.addEventListener('click', () => {
    const items = [...quoteList.keys()].map((name, i) => `${i + 1}. ${name} ? Qty:`).join('\n');
    window.open(wa(`Hi! I'm interested in the following products and would like a wholesale quotation:\n\n${items}\n\nDestination country:`), '_blank');
  });
}

function setupProductSections() {
  $$('[data-products-grid]').forEach(grid => renderGrid(grid, grid.dataset.mode === 'featured' ? allProducts.filter(p => p.featured) : allProducts));
}

function setupFilters() {
  const cat = $('[data-category-filter]');
  const brand = $('[data-brand-filter]');
  const search = $('[data-search]');
  const grid = $('[data-products-grid][data-mode="all"]');
  if (!grid || !cat || !brand || !search) return;

  const options = list => ['All', ...[...new Set(list)].sort((a, b) => a.localeCompare(b))].map(v => `<option value="${v}">${v}</option>`).join('');
  cat.innerHTML = categoryGroups.map(group => `<option value="${group.value}">${group.label}</option>`).join('');
  brand.innerHTML = options(allProducts.map(p => p.brand));
  cat.value = 'All';
  brand.value = 'All';

  const params = new URLSearchParams(location.search);
  const requestedCategory = params.get('category');
  if (requestedCategory) {
    const matchedGroup = categoryGroups.find(group => group.value === requestedCategory || group.aliases?.includes(requestedCategory));
    if (matchedGroup) cat.value = matchedGroup.value;
  }
  const initialSearch = params.get('q') || params.get('search') || '';
  if (initialSearch) search.value = initialSearch;

  const apply = () => {
    const q = search.value.toLowerCase().trim();
    visibleCount = 24;
    filteredProducts = allProducts.filter(p =>
      categoryMatches(p, cat.value) &&
      (brand.value === 'All' || p.brand === brand.value) &&
      (!q || `${p.name} ${p.brand} ${p.category} ${p.origin || ''}`.toLowerCase().includes(q))
    );
    $$('[data-filter-pill]').forEach(pill => pill.classList.toggle('is-active', pill.dataset.category === cat.value));
    renderGrid(grid, filteredProducts);
  };

  [cat, brand, search].forEach(el => el.addEventListener('input', apply));
  $$('[data-filter-pill]').forEach(pill => pill.addEventListener('click', () => {
    cat.value = pill.dataset.category || 'All';
    apply();
  }));
  $('[data-clear-filters]').addEventListener('click', () => {
    search.value = '';
    cat.value = 'All';
    brand.value = 'All';
    apply();
  });
  $('[data-load-more]').addEventListener('click', () => {
    visibleCount += 24;
    renderGrid(grid, filteredProducts);
  });
  apply();
  if (params.get('focus') === 'search' || initialSearch) {
    window.setTimeout(() => {
      $('.product-filter-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      search.focus({ preventScroll: true });
    }, 180);
  }
}

function renderBrands() {
  const el = $('[data-brands-grid]');
  if (!el) return;
  const brands = [...new Set(allProducts.map(p => p.brand))].sort();
  el.innerHTML = brands.map(b => `<div class="brand-card">${b}<br><small>${allProducts.filter(p => p.brand === b).length} items</small></div>`).join('');
}

function setupForm() {
  const f = $('[data-quote-form]');
  if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(f);
    window.open(wa(`Hi! I'm interested in your products and would like a wholesale quotation.\nName: ${d.get('name') || ''}\nCountry: ${d.get('country') || ''}\nProducts: ${d.get('products') || ''}\nQuantity: ${d.get('quantity') || ''}\nMessage: ${d.get('message') || ''}`), '_blank');
  });
}

setupProductSections();
setupFilters();
renderBrands();
setupForm();

(function initCountUp() {
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  if (!counters.length) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finishCounter = el => { el.textContent = (el.dataset.count || '0') + (el.dataset.suffix || ''); };

  function animateCounter(el) {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';
    const target = Number(el.dataset.count || 0);
    if (reduceMotion || !Number.isFinite(target)) {
      finishCounter(el);
      return;
    }
    const start = performance.now();
    const duration = 1250;
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  counters.forEach(el => {
    if (!reduceMotion) el.textContent = '0' + (el.dataset.suffix || '');
    observer.observe(el);
  });
})();
