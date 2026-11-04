"""Lightweight product layout shared by rebuilds and existing-page migration."""
import html
import re
from pathlib import Path
from urllib.parse import quote


def render(source, product, related):
    head = re.search(r'<head>(.*?)</head>', source, re.S).group(1)
    head = re.sub(r'<link\b[^>]*(?:fonts\.googleapis|stylesheet)[^>]*>', '', head)
    name = html.escape(product['name'])
    image = '/' + product['image'].lstrip('/')
    body = re.search(r'<article\b[^>]*>(.*?)</article>', source, re.S)
    content = body.group(1) if body else '<p>Contact our team to confirm the exact product presentation and current quotation.</p>'
    content = re.split(r'<div class="article-(?:callout|end)"', content, maxsplit=1)[0]
    from build_product_pages import slugify
    category = html.escape(product['category'])
    category_url = '/categories/' + slugify(product['category']) + '.html'
    details = ''.join('<div><dt>' + label + '</dt><dd>' + html.escape(product[key] or 'Confirm with our team') + '</dd></div>' for label, key in [('Brand', 'brand'), ('Catalogue origin', 'origin'), ('Category', 'category')])
    cards = ''.join(f'<a class="related-item" href="/products/{p["slug"]}.html"><img src="/{html.escape(p["image"], quote=True)}" alt="{html.escape(p["name"], quote=True)}" width="240" height="240" loading="lazy" decoding="async"><span>{html.escape(p["brand"])}</span><h3>{html.escape(p["name"])}</h3><b>View product &rarr;</b></a>' for p in related)
    message = quote('Hello HANSEONG, please quote ' + product['name'] + '. Quantity: 1. Destination: ')
    return f'''<!doctype html><html lang="en"><head>{head}<link rel="stylesheet" href="/assets/css/product-detail.css?v=1"><script defer src="/assets/js/product-detail.js?v=1"></script></head><body class="product-detail"><header class="product-nav"><a href="/index.html"><img src="/assets/icons/logoNgang.png" width="160" height="48" alt="HANSEONG BEAUTY GLOBAL"></a><nav aria-label="Main"><a href="/products.html">Products</a><a href="/brands.html">Brands</a><a href="/blog/index.html">Journal</a><a href="/contact.html">Contact</a></nav></header><main><nav class="crumbs" aria-label="Breadcrumb"><a href="/index.html">Home</a><span>/</span><a href="{category_url}">{category}</a><span>/</span><span>{name}</span></nav><section class="product-hero"><div class="product-media"><img src="{html.escape(image, quote=True)}" alt="{name}" width="720" height="720" fetchpriority="high" decoding="async"><a href="{html.escape(image, quote=True)}" target="_blank" rel="noopener" class="image-open">View full image &#8599;</a></div><div class="product-summary"><p class="eyebrow">{category} / Professional supply</p><h1>{name}</h1><p class="summary">Request current wholesale availability, product documentation and a quotation for your destination.</p><dl>{details}</dl><p class="availability">Availability and presentation confirmed with your quotation.</p><form id="product-quote" data-product="{name}"><div class="quote-inputs"><label>Quantity<input name="quantity" type="number" min="1" max="100000" step="1" value="1" required></label><label>Destination country<input name="country" autocomplete="country-name" placeholder="Country" maxlength="80" required></label></div><button type="submit">Request wholesale quote &rarr;</button><p id="quote-status" role="status" aria-live="polite"></p></form><div class="sales-links"><a data-sales="84921909928" href="https://wa.me/84921909928?text={message}">WhatsApp Vietnam</a><a data-sales="821021892675" href="https://wa.me/821021892675?text={message}">WhatsApp Korea</a></div><p class="fine">Professional buyers only. Confirm product identity, local eligibility and handling requirements before purchase.</p></div></section><nav class="section-nav" aria-label="Product sections"><a href="#details">Product details</a><a href="#ordering">Ordering</a><a href="#related">Related products</a></nav><section id="details" class="product-content"><h2>About {name}</h2>{content}</section><section id="ordering" class="ordering"><h2>Before you confirm your order</h2><div class="order-columns"><div><h3>01 / Identify</h3><p>Confirm the exact presentation, pack contents and quoted unit. Approve substitutions separately.</p></div><div><h3>02 / Verify</h3><p>Request applicable manufacturer documents, batch and expiry information, and destination checks.</p></div><div><h3>03 / Coordinate</h3><p>Agree quantities, quotation exclusions and the proposed shipment arrangements.</p></div></div><a href="/shipping.html">Shipping support &rarr;</a></section><section id="related" class="related"><h2>Explore {category}</h2><div class="related-grid">{cards}</div><a href="{category_url}">Browse this category &rarr;</a></section></main><footer><a href="/contact.html">Contact HANSEONG BEAUTY GLOBAL</a><a href="/products.html">Full catalogue</a></footer></body></html>'''


def migrate():
    from build_product_pages import ROOT, parse_products
    products = parse_products()
    count = 0
    for product in products:
        path = ROOT / 'products' / (product['slug'] + '.html')
        if not path.exists():
            continue
        source = path.read_text(encoding='utf-8')
        if 'class="product-detail"' in source:
            continue
        related = [p for p in products if p['category'] == product['category'] and p['slug'] != product['slug'] and (ROOT / 'products' / (p['slug'] + '.html')).exists()][:4]
        path.write_text(render(source, product, related), encoding='utf-8')
        count += 1
    print(f'Migrated {count} product pages')


if __name__ == '__main__':
    migrate()
