"""Read-only static HTML SEO and internal-link inventory."""
import json
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1 = 0
        self.title = ''
        self.in_title = False
        self.canonical = []
        self.description = []
        self.links = []
        self.redirect = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta' and a.get('http-equiv', '').lower() == 'refresh': self.redirect = True
        self.h1 += tag == 'h1'
        if tag == 'title': self.in_title = True
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
        if tag == 'meta' and a.get('name') == 'description': self.description.append(a.get('content', ''))
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
    def handle_data(self, data):
        if self.in_title: self.title += data


def audit():
    rows = []
    for path in sorted(ROOT.rglob('*.html')):
        if any(p.startswith('.') for p in path.relative_to(ROOT).parts): continue
        p = Page()
        p.feed(path.read_text(encoding='utf-8-sig'))
        flags, broken = [], []
        if not p.title.strip(): flags.append('missing_title')
        if p.h1 != 1 and not p.redirect: flags.append('h1_count_' + str(p.h1))
        if len(p.canonical) != 1: flags.append('canonical_count_' + str(len(p.canonical)))
        if (not p.description or not p.description[0].strip()) and not p.redirect: flags.append('missing_description')
        for link in p.links:
            u = urlsplit(link)
            if u.scheme or u.netloc or not u.path: continue
            target = ROOT / unquote(u.path).lstrip('/') if u.path.startswith('/') else path.parent / unquote(u.path)
            if not target.exists(): broken.append(link)
        rows.append(dict(path=path.relative_to(ROOT).as_posix(), title=p.title, flags=flags, broken_links=sorted(set(broken))))
    duplicate_titles = {t: [r['path'] for r in rows if r['title'] == t] for t, count in Counter(r['title'] for r in rows).items() if t and count > 1}
    tree = ET.parse(ROOT / 'sitemap.xml')
    missing = [u.text for u in tree.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc') if not (ROOT / unquote(urlsplit(u.text).path).lstrip('/')).exists()]
    result = dict(pages=len(rows), issues=rows, duplicate_titles=duplicate_titles, sitemap_missing_files=missing)
    (ROOT / 'docs/site-seo-audit.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(dict(pages=len(rows), flags=dict(Counter(f for r in rows for f in r['flags'])), broken_pages=sum(bool(r['broken_links']) for r in rows), duplicate_titles=len(duplicate_titles), sitemap_missing=len(missing))))


if __name__ == '__main__': audit()
