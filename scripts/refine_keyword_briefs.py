"""Refine pending briefs only; published URLs and metadata remain stable."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def refine():
    path = ROOT / 'data/blog_queue.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    changed = 0
    for topic in data['topics']:
        if topic['status'] != 'pending':
            continue
        title = topic['title']
        product = title.split(':', 1)[0] if ':' in title else ''
        market = topic.get('market', '')
        if product and market:
            topic['primary_keyword'] = f'{product} wholesale {market}'
            topic['secondary_keywords'] = [f'{product} supplier documentation {market}', f'{product} wholesale quotation checklist', f'{product} product verification before ordering']
            angle = topic.get('decision', '')
            if product.startswith('Rejuran') and market == 'Philippines':
                topic['title'] = 'Rejuran Wholesale Philippines: A Variant Confirmation Worksheet'
            elif product == 'Aqualyx':
                topic['title'] = 'Aqualyx Wholesale Philippines: Quote and Receiving Checklist'
            elif product.startswith('Rejuran') and market == 'Malaysia':
                topic['title'] = 'Rejuran Wholesale Malaysia: Confirming Variants in a Mixed Order'
            elif product == 'NCTF':
                topic['title'] = 'NCTF Wholesale Malaysia: Product Identity and Quote Checklist'
            topic['search_intent'] = 'commercial investigation by a professional buyer; eligibility and specifications require verification'
        elif product:
            topic['primary_keyword'] = product + ' wholesale'
            topic['secondary_keywords'] = [product + ' quotation requirements', product + ' receiving checklist']
            topic['search_intent'] = topic.get('decision', 'professional purchase planning')
        else:
            topic['primary_keyword'] = topic['keyword']
            topic['secondary_keywords'] = []
            topic['search_intent'] = topic.get('decision', 'professional procurement research')
        changed += 1
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Refined {changed} pending keyword briefs')


if __name__ == '__main__':
    refine()
