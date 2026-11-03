"""Verify the latest generated article, its internal links and discovery paths."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Inspect(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals, self.h1s, self.links = [], 0, []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'h1':
            self.h1s += 1
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs.get('href'))
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])


def check():
    queue = json.loads((ROOT / 'data/blog_queue.json').read_text(encoding='utf-8'))
    latest = queue['published'][-1]
    slug = latest['slug']
    path = ROOT / 'blog' / (slug + '.html')
    source = path.read_text(encoding='utf-8')
    parser = Inspect()
    parser.feed(source)
    url = 'https://www.hanseongbeauty.com/blog/' + path.name
    assert parser.h1s == 1, 'Expected exactly one H1'
    assert parser.canonicals == [url], 'Canonical does not match published URL'
    assert path.name in (ROOT / 'blog/index.html').read_text(encoding='utf-8'), 'Article missing from journal'
    sitemap = ET.parse(ROOT / 'sitemap.xml')
    urls = [n.text for n in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    assert url in urls, 'Article missing from sitemap'
    for link in parser.links:
        parsed = urlsplit(link)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        target = ROOT / unquote(parsed.path).lstrip('/') if parsed.path.startswith('/') else path.parent / unquote(parsed.path)
        assert target.resolve().is_relative_to(ROOT.resolve()), 'Internal link escapes site'
        assert target.exists(), f'Broken internal link: {link}'
    print('Latest article passes H1, canonical, sitemap, journal and internal-link checks:', path.name)


if __name__ == '__main__':
    check()
