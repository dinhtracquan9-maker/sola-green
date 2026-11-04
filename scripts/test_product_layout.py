import unittest
from html.parser import HTMLParser
from pathlib import Path
from build_product_pages import ROOT, parse_products, page


class Inspect(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1 = 0
        self.images = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'h1': self.h1 += 1
        if tag == 'img': self.images.append(attrs)


class ProductLayoutTests(unittest.TestCase):
    def test_all_products_keep_seo_and_images(self):
        count = 0
        for product in parse_products():
            path = ROOT / 'products' / (product['slug'] + '.html')
            if not path.exists(): continue
            source = path.read_text(encoding='utf-8')
            p = Inspect()
            p.feed(source)
            self.assertEqual(p.h1, 1, path.name)
            self.assertIn('class="product-detail"', source)
            self.assertIn('application/ld+json', source)
            self.assertIn('rel="canonical"', source)
            self.assertNotIn('fonts.googleapis.com', source)
            self.assertNotIn('/assets/js/main.js', source)
            self.assertTrue(all((ROOT / img['src'].lstrip('/')).exists() for img in p.images))
            hero = next(i for i in p.images if i.get('fetchpriority') == 'high')
            self.assertNotEqual(hero.get('loading'), 'lazy')
            count += 1
        self.assertEqual(count, 179)

    def test_future_generator_uses_same_layout(self):
        p = parse_products()[0]
        result = page(p, dict(meta_description='Product quotation details', intro='Product information', body_html='<h2>Details</h2><p>Verified purchasing details.</p>'))
        self.assertIn('class="product-detail"', result)
        self.assertIn('id="product-quote"', result)
        self.assertNotIn('class="article-cover', result)


if __name__ == '__main__': unittest.main()
