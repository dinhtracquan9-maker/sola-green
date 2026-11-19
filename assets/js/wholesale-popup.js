(() => {
  'use strict';
  if (document.querySelector('#hs-wholesale-popup') || /\/(admin|api)(\/|$)/.test(location.pathname) || /contact\.html$/.test(location.pathname)) return;
  const key = 'hanseong-wholesale-popup-v1';
  const preview = new URLSearchParams(location.search).get('popup') === 'preview';
  let dismissed = false;
  try { dismissed = Date.now() - Number(localStorage.getItem(key) || 0) < 7 * 86400000 || sessionStorage.getItem(key) === 'seen'; } catch {}
  if (dismissed && !preview) return;
  let engaged = false, shown = false, previousFocus;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet'; stylesheet.href = '/assets/css/wholesale-popup.css?v=buyer-offer';
  document.head.append(stylesheet);
  const dialog = document.createElement('dialog');
  dialog.id = 'hs-wholesale-popup';
  dialog.setAttribute('aria-labelledby', 'hs-popup-title');
  dialog.setAttribute('aria-describedby', 'hs-popup-description');
  dialog.innerHTML = `
    <button class="hs-popup-close" type="button" aria-label="Close wholesale enquiry" autofocus>&times;</button>
    <div class="hs-popup-photo"><img src="/assets/images/inside-prepared.jpg" width="1485" height="1485" alt="Assorted product cartons grouped for a Hanseong wholesale order" loading="lazy"><span>HANSEONG<br><small>BEAUTY GLOBAL</small></span></div>
    <div class="hs-popup-copy">
      <p class="hs-popup-eyebrow">FOR PROFESSIONAL BUYERS</p>
      <h2 id="hs-popup-title">Your product list.<br><em>One tailored wholesale quote.</em></h2>
      <p id="hs-popup-description">Share your products, quantities and destination. Discuss current availability and shipping options with our Korea team before you order.</p>
      <ul class="hs-popup-benefits"><li>Exact products &amp; variants</li><li>Quantities &amp; destination</li><li>One clear quotation request</li></ul>
      <a class="hs-popup-primary" href="https://wa.me/821021892675?text=Hi%20Hanseong%20Korea%20team%2C%20I%20would%20like%20a%20wholesale%20quotation.%0APlease%20check%20whether%20my%20order%20qualifies%20for%20an%20offer.%0AProducts%20and%20variants%3A%0AQuantities%3A%0ADestination%20country%3A" target="_blank" rel="noopener noreferrer">Get my wholesale quote <span aria-hidden="true">&#8599;</span></a>
      <a class="hs-popup-secondary" href="/products.html">Browse products first <span aria-hidden="true">&#8594;</span></a>
      <aside class="hs-popup-offer" aria-label="Order-specific offer enquiries"><strong>Could your order qualify for an offer?</strong><small>Ask our Korea team to check. Any discount or code depends on the selected products, quantity and destination, and must be confirmed in your quotation before payment. No discount is guaranteed.</small></aside>
      <p class="hs-popup-note">For clinics, resellers &amp; distributors. Availability and shipment options are confirmed individually.</p>
    </div>`;
  document.body.append(dialog);
  function remember() {
    try { localStorage.setItem(key, String(Date.now())); sessionStorage.setItem(key, 'seen'); } catch {}
  }
  function close() { remember(); dialog.close(); }
  function show() {
    if (shown || document.hidden || document.querySelector('dialog[open], [aria-modal="true"]') || typeof dialog.showModal !== 'function') return;
    shown = true; previousFocus = document.activeElement;
    try { sessionStorage.setItem(key, 'seen'); } catch {}
    dialog.showModal();
  }
  dialog.querySelector('.hs-popup-close').addEventListener('click', close);
  dialog.addEventListener('cancel', remember);
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) close(); } });
  dialog.addEventListener('close', () => { if(previousFocus?.isConnected) previousFocus.focus({preventScroll:true}); });
  dialog.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  // Require both reading time and meaningful scrolling, rather than interrupting entry.
  function checkScroll() {
    const range = document.documentElement.scrollHeight - innerHeight;
    if (engaged && range > 0 && scrollY / range >= 0.35) { show(); if(shown) removeEventListener('scroll', checkScroll); }
  }
  if (preview) { stylesheet.addEventListener('load', show, {once:true}); }
  else {
    setTimeout(() => { engaged = true; checkScroll(); }, 20000);
    addEventListener('scroll', checkScroll, {passive:true});
    document.addEventListener('mouseleave', event => { if(engaged && event.clientY <= 0 && matchMedia('(hover: hover) and (pointer: fine)').matches) show(); });
  }
})();
