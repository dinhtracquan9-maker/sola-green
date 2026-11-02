"""Remove known generated reference boilerplate and reviewed unsourced paragraphs.

This does not certify the accuracy of remaining article content.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLAIM = re.compile(r'collagen production|biochemical|clinically proven|guaranteed results', re.I)


def clean():
    audit = json.loads((ROOT / 'docs/editorial-audit.json').read_text())
    reviewed = {r['url'].rsplit('/', 1)[1] for r in audit['results'] if 'product_claim_requires_source_review' in r['flags']}
    changes = []
    for file in sorted((ROOT / 'blog').glob('*.html')):
        source = file.read_text(encoding='utf-8')
        original = source
        # Exact legacy boilerplate labels, not arbitrary external citations.
        source, refs = re.subn(r'<li><a\b[^>]*href="https://www\.fda\.gov/[^"\s]+"[^>]*>(?:FDA guidance on dermal fillers and botulinum toxin products|FDA overview of what the agency regulates and approves)</a></li>', '', source)
        removed = 0
        if file.name in reviewed:
            def paragraph(match):
                nonlocal removed
                if CLAIM.search(match.group()):
                    removed += 1
                    return ''
                return match.group()
            source = re.sub(r'<p\b[^>]*>.*?</p>', paragraph, source, flags=re.S)
        if source != original:
            file.write_text(source, encoding='utf-8')
            changes.append({'file': 'blog/' + file.name, 'template_references_removed': refs, 'reviewed_claim_paragraphs_removed': removed})
    (ROOT / 'docs/legacy-cleanup-log.json').write_text(json.dumps({'scope': 'Known reference boilerplate and 14 manually inspected claim-containing articles. Remaining copy still requires source review.', 'changes': changes}, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'changed_articles': len(changes), 'references_removed': sum(x['template_references_removed'] for x in changes), 'claim_paragraphs_removed': sum(x['reviewed_claim_paragraphs_removed'] for x in changes)}))


if __name__ == '__main__':
    clean()
