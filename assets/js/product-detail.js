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
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    update();
    window.location.assign(document.querySelector('[data-sales]').href);
  });
})();
