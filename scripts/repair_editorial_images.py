"""Repair approved covers without rewriting article content. Dry-run by default."""
import argparse
import html
import json
import re
from html.parser import HTMLParser
from editorial_images import ROOT, approved_image


class Images(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.offsets = [0]
        for line in source.splitlines(keepends=True):
            self.offsets.append(self.offsets[-1] + len(line))
        self.stack = []
        self.edits = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img':
            line, col = self.getpos()
            start = self.offsets[line - 1] + col
            cover = any('article-cover' in a.get('class', '').split() for _, a in self.stack)
            card = next((a.get('href') for t, a in reversed(self.stack)
                         if t == 'a' and 'story-card' in a.get('class', '').split()), None)
            if cover or card:
                self.edits.append((start, start + len(self.get_starttag_text()), card))
        if tag not in {'img', 'meta', 'link', 'br', 'hr', 'input', 'source', 'wbr'}:
            self.stack.append((tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break


def replace_images(source, mapping):
    parser = Images(source)
    parser.feed(source)
    for start, end, card in reversed(parser.edits):
        selected = mapping.get(card)
        if not selected:
            continue
        old = source[start:end]
        new = re.sub(r'\b(src|alt)\s*=\s*([\"\']).*?\2',
                     lambda m: m[1] + '="' + html.escape(selected[m[1]], quote=True) + '"',
                     old, flags=re.I | re.S)
        source = source[:start] + new + source[end:]
    return source


def run(apply=False):
    mapping, changed, unresolved = {}, [], []
    pages = list((ROOT / 'blog').glob('*.html'))
    for path in pages:
        if path.name == 'index.html':
            continue
        source = path.read_text(encoding='utf-8')
        match = re.search(r'<h1\b[^>]*>(.*?)</h1>', source, re.S | re.I)
        if not match:
            continue
        title = html.unescape(re.sub('<[^>]+>', '', match[1]))
        try:
            selected = approved_image({'title': title})
        except RuntimeError:
            unresolved.append(path.name)
            continue
        mapping[path.name] = selected
        updated = replace_images(source, {None: selected})
        if updated != source:
            changed.append(path.name)
            if apply:
                path.write_text(updated, encoding='utf-8')
    index = ROOT / 'blog/index.html'
    source = index.read_text(encoding='utf-8')
    updated = replace_images(source, mapping)
    if apply and updated != source:
        index.write_text(updated, encoding='utf-8')
    queue = ROOT / 'data/blog_queue.json'
    data = json.loads(queue.read_text(encoding='utf-8'))
    for topic in data['topics']:
        selected = mapping.get(topic.get('slug', '') + '.html')
        if selected:
            topic['image'] = selected['src']
            topic['image_alt'] = selected['alt']
    if apply:
        queue.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'apply': apply, 'pages_scanned': len(pages),
                      'approved_pages': len(mapping), 'changed': changed,
                      'unreviewed_count': len(unresolved)}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    run(parser.parse_args().apply)
