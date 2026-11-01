"""Build crawlable category directories from the existing product catalogue."""
import html
import json
from pathlib import Path
from build_product_pages import ROOT, SITE, parse_products, slugify


def build_categories():
    groups = {}
    for product in parse_products():
        if (ROOT / 'products' / (product['slug'] + '.html')).exists():
            groups.setdefault(product['category'], []).append(product)
    output = ROOT / 'categories'
    output.mkdir(exist_ok=True)
    for category, products in groups.items():
        title = html.escape(category + ' Wholesale')
        slug = slugify(category)
        url = f'{SITE}/categories/{slug}.html'
        description = html.escape(f'Browse {category} in the HANSEONG professional catalogue. Compare product names and brands, then request availability and a destination-specific quote.', quote=True)
        links = ''.join(f'<li><a href="../products/{p["slug"]}.html">{html.escape(p["name"])}</a> <span>{html.escape(p["brand"])}</span></li>' for p in products)
        related = ' '.join(f'<a href="{slugify(c)}.html">{html.escape(c)}</a>' for c in groups if c != category)
        schema = json.dumps({'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': category + ' Wholesale', 'url': url, 'mainEntity': {'@type': 'ItemList', 'itemListElement': [{'@type': 'ListItem', 'position': i, 'url': f'{SITE}/products/{p["slug"]}.html', 'name': p['name']} for i, p in enumerate(products, 1)]}}).replace('<', '\\u003c')
        page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} | HANSEONG BEAUTY GLOBAL</title><meta name="description" content="{description}"><link rel="canonical" href="{url}"><link rel="stylesheet" href="../assets/css/style.css"><script type="application/ld+json">{schema}</script></head><body class="article-page"><nav class="nav"><div class="wrap nav-inner"><a href="../index.html">HANSEONG BEAUTY GLOBAL</a><a href="../products.html">Product catalogue</a></div></nav><main><header class="article-hero"><div class="wrap article-wrap"><p><a href="../index.html">Home</a> / <a href="../products.html">Products</a> / {html.escape(category)}</p><h1>{title}</h1><p>{description}</p></div></header><article class="article-body article-wrap"><h2>Products in this category</h2><p>Open a product page to review its catalogue details. A catalogue listing does not confirm current stock or availability in every market.</p><ul>{links}</ul><h2>Prepare a wholesale request</h2><p>Include the exact product name and presentation, quantity and destination country. Ask for current packaging information, batch and expiry details, available documentation and handling requirements before confirming an order.</p><h2>Destination and shipping checks</h2><p>Product eligibility and documentation depend on the item and destination. Confirm the available supply route with our team and applicable requirements with your local importer before purchase.</p><p><a href="../shipping.html">Review shipping support</a> &bull; <a href="../contact.html">Request a product-specific quotation</a> &bull; <a href="../blog/index.html">Read the buyer journal</a></p><h2>Explore other categories</h2><p>{related}</p></article></main></body></html>'''
        (output / f'{slug}.html').write_text(page, encoding='utf-8')
    catalogue = ROOT / 'products.html'
    source = catalogue.read_text(encoding='utf-8')
    start, end = '<!-- SEO_CATEGORIES_START -->', '<!-- SEO_CATEGORIES_END -->'
    directory = start + '<section class="wrap"><h2>Browse product categories</h2><ul>' + ''.join(f'<li><a href="categories/{slugify(c)}.html">{html.escape(c)}</a></li>' for c in groups) + '</ul></section>' + end
    if start in source and end in source:
        before, rest = source.split(start, 1)
        source = before + directory + rest.split(end, 1)[1]
    else:
        source = source.replace('</main>', directory + '</main>', 1)
    catalogue.write_text(source, encoding='utf-8')
    return len(groups)


if __name__ == '__main__':
    print(f'Built {build_categories()} category pages')
