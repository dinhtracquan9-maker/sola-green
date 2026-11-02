"""Inventory editorial risks; similarity flags are not plagiarism findings."""
import html
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def plain(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', value))).strip()


def audit():
    rows, paragraphs = [], Counter()
    for file in sorted((ROOT / 'blog').glob('*.html')):
        if file.name == 'index.html':
            continue
        source = file.read_text(encoding='utf-8-sig')
        body = re.search(r'<article\b[^>]*>(.*?)</article>', source, re.S)
        body = body.group(1) if body else source
        parts = [plain(p).lower() for p in re.findall(r'<p\b[^>]*>(.*?)</p>', body, re.S)]
        parts = [p for p in parts if len(p.split()) >= 40]
        paragraphs.update(set(parts))
        flags = []
        words = len(plain(body).split())
        if words < 600:
            flags.append('short_body')
        if re.search(r'collagen production|biochemical|clinically proven|guaranteed results', body, re.I):
            flags.append('product_claim_requires_source_review')
        if 'www.fda.gov' in body:
            flags.append('check_FDA_reference_applicability')
        if not re.search(r'rel=["\']canonical', source):
            flags.append('missing_canonical')
        rows.append(dict(url='https://www.hanseongbeauty.com/blog/' + file.name, words=words, flags=flags, paragraphs=parts))
    for row in rows:
        repeated = sum(paragraphs[p] > 1 for p in row.pop('paragraphs'))
        row['repeated_long_paragraphs'] = repeated
        if repeated:
            row['flags'].append('shared_paragraphs_review_context')
    report = ROOT / 'docs' / 'editorial-audit.json'
    report.write_text(json.dumps({'method': 'Static HTML heuristics, not fact checking or external plagiarism detection. CTA boilerplate may repeat legitimately.', 'articles': len(rows), 'results': rows}, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'articles': len(rows), 'flags': dict(Counter(f for row in rows for f in row['flags']))}))


if __name__ == '__main__':
    audit()
