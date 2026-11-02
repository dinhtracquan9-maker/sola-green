"""Apply commercial priorities without assuming product authorisation."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRIEFS = [
 ('Philippines', 'Lemon Bottle', 'Product Identity and Supplier Evidence Before a Philippine Wholesale Enquiry', 'request product identity and intended-use documents; distinguish a brand name from verified composition, status or clinical use', 'pending'),
 ('Malaysia', 'NCTF', 'Confirming the Exact Presentation Before Requesting a Wholesale Quote', 'request exact manufacturer, presentation and product identity; NCTF is not yet matched to an exact catalogue SKU', 'pending'),
 ('Philippines', 'Aqualyx', 'A Buyer Worksheet for Quotation Exclusions and Receiving Records', 'separate quoted product units, excluded charges and receiving evidence without implying local eligibility', 'pending'),
 ('Malaysia', 'Rejuran Healer, S, I and HB', 'Building a Mixed-Variant RFQ Without Assuming Interchangeability', 'create separate order lines and a substitution approval process, with no ingredient or efficacy assumptions', 'pending'),
]
COUNTRIES = ['USA', 'Mexico', 'Colombia', 'UK', 'Poland', 'Italy', 'Germany', 'Spain']


def main():
    path = ROOT / 'data/blog_queue.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    existing = {t['keyword'] for t in data['topics']}
    added = []
    planned = BRIEFS + [(c, 'Filler and Toxin', 'Product-Specific Importer Questions Before Wholesale Sourcing', 'research local product-specific requirements, actual supply eligibility and distinct buyer needs before drafting', 'research_required') for c in COUNTRIES]
    planned += [(c, 'Mounjaro', 'Professional Procurement and Product Verification Research', 'verify exact presentation, manufacturer information and local professional supply requirements; no patient targeting, dosing, outcome promises or platform evasion', 'research_required') for c in ['Philippines', 'Malaysia', 'Indonesia']]
    for rank, (market, product, angle, decision, status) in enumerate(planned):
        keyword = f'{product.lower()} {market.lower()} {angle.lower()}'
        if keyword in existing:
            continue
        topic = dict(title=f'{product}: {angle} for {market} Buyers', keyword=keyword, category='Procurement', market=market, priority=rank + 1, buyer_role='professional buyer in ' + market, decision=decision, deliverable='a practical evidence checklist, unresolved questions and a clearly labelled hypothetical purchasing example', verified_facts=['Commercial priority supplied by Hanseong; demand and supply eligibility are not verified. No product composition or medical claims have been verified.'], sources=[], status=status, image='../assets/images/How to evaluate wholesale partners Image.jpg')
        if product == 'Lemon Bottle':
            topic['sources'] = [['Finnish authority warning; applies to its stated jurisdiction, not proof of Philippine status', 'https://tukes.fi/-/fimea-ja-tukes-varoittavat-rasvanpoistoon-kaytettavasta-lemon-bottle-valmisteesta?languageId=en_US']]
            topic['verified_facts'].append('Discuss the authority warning within its jurisdiction. Do not call this a proven fat-dissolving or skin-hydration treatment. Philippine status remains unverified.')
        added.append(topic)
    # New ready briefs precede the older generic queue; held research is never selected.
    data['topics'] = [t for t in added if t['status'] == 'pending'] + data['topics'] + [t for t in added if t['status'] != 'pending']
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    priorities = ROOT / 'data/market_priorities.json'
    config = json.loads(priorities.read_text(encoding='utf-8'))
    config['current_focus'] = {'Philippines': ['Lemon Bottle', 'Aqualyx'], 'Malaysia': ['NCTF', 'Rejuran Healer', 'Rejuran S', 'Rejuran I', 'Rejuran HB'], 'Southeast Asia research': ['Mounjaro'], 'Europe and Americas countries': COUNTRIES}
    priorities.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'added_ready': sum(t['status'] == 'pending' for t in added), 'added_research': sum(t['status'] == 'research_required' for t in added)}))


if __name__ == '__main__':
    main()
