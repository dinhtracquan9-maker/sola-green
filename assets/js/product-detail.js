(() => {
  const form = document.querySelector('#product-quote');
  if (!form) return;
  const update = () => {
    const values = new FormData(form);
    const text = `Hello HANSEONG, please send a wholesale quotation.\nProduct: ${form.dataset.product}\nQuantity: ${values.get('quantity')} (please confirm pack unit)\nDestination: ${values.get('country')}`;
    document.querySelectorAll('[data-sales]').forEach(link => {
      link.href = `https://wa.me/${link.dataset.sales}?text=${encodeURIComponent(text)}`;
    });
  };
  form.addEventListener('input', update);
  document.querySelectorAll('[data-quantity]').forEach(button => button.addEventListener('click', () => {
    const input = form.elements.quantity;
    const current = Number(input.value) || 1;
    input.value = Math.max(1, Math.min(100000, current + Number(button.dataset.quantity)));
    update();
  }));
  const tabs = [...document.querySelectorAll('[data-product-tab]')];
  if (tabs.length) {
    tabs[0].parentElement.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.id = `product-tab-${index}`;
      tab.setAttribute('aria-controls', tab.dataset.productTab);
      const panel = document.getElementById(tab.dataset.productTab);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      const select = () => tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        document.getElementById(item.dataset.productTab).hidden = !selected;
      });
      tab.addEventListener('click', event => { event.preventDefault(); select(); });
      tab.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
          next.focus(); next.click();
        }
      });
      if (index === 0) select();
    });
  }
  const sticky = document.querySelector('.sticky-product');
  if (sticky && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      sticky.classList.toggle('is-visible', !entries[0].isIntersecting && form.getBoundingClientRect().bottom < 0);
    }).observe(form);
  }
  document.querySelector('#copy-product-link')?.addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try { await navigator.clipboard.writeText(window.location.href); status.textContent = 'Link copied'; }
    catch { status.textContent = 'Copy the address from your browser'; }
  });
  update();
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    update();
    window.location.assign(document.querySelector('[data-sales]').href);
  });
})();
