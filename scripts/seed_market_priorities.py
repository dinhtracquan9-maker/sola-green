"""Seed distinct market briefs; hold product-market claims pending research."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIORITIES = {
 'Philippines': ['Lemon Bottle', 'Lipo Vela', 'Lipo Vela V', 'Botulax', 'Nabota', 'Rentox', 'ASCE Plus', 'Aqualyx', 'Mounjaro', 'Lipo Lab V-Line', 'Rejuran Healer', 'Rejuran S', 'Rejuran I', 'Rejuran HB', 'NCTF', 'Xeomin', 'Sculptra', 'Dysport'],
 'Malaysia': ['Lemon Bottle', 'Lipo Vela', 'Lipo Vela V', 'Botulax', 'Nabota', 'Rentox', 'ASCE Plus', 'Aqualyx', 'Mounjaro', 'Lipo Lab V-Line', 'Rejuran Healer', 'Rejuran S', 'Rejuran I', 'Rejuran HB', 'NCTF', 'Xeomin', 'Sculptra', 'Dysport'],
 'Europe and Americas': ['Innotox', 'Xeomin', 'Dysport', 'Sculptra', 'Radiesse', 'PDRN', 'Rejuran', 'Botulax', 'Nabota', 'Rentox', 'Juvederm', 'Elasty', 'Celosome'],
}


def seed():
    (ROOT / 'data/market_priorities.json').write_text(json.dumps({'basis': 'User commercial priorities, not verified market-demand data or supply eligibility.', 'priorities': PRIORITIES, 'research_required': ['Confirm exact SKU and manufacturer documentation', 'Verify product-specific local status using applicable authority', 'Confirm actual supply route with Hanseong', 'Keep PN/PDRN, toxin, filler, biostimulator and weight-management distinctions', 'Resolve NCTF catalogue match; PDRN is not a single SKU', 'Split Europe and Americas into named countries before publication']}, indent=2) + '\n', encoding='utf-8')
    path = ROOT / 'data/blog_queue.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    briefs = [
      ('Philippines', 'Rejuran Healer, S, I and HB: A Variant-Confirmation Worksheet for Philippine Buyers', 'rejuran variant RFQ philippines', 'separate four named presentations in a quotation request without asserting composition or interchangeability', 'a four-line variant confirmation worksheet and unresolved-document checklist', 'https://www.fda.gov.ph/fda-advisory-no-2023-2238-utilization-of-the-food-and-drug-administration-fda-verification-portal/'),
      ('Malaysia', 'Lipo Vela and Lipo Vela V: Avoiding Product-Name Errors in Malaysian Buyer RFQs', 'lipo vela v RFQ malaysia', 'prevent confusion between two catalogue names without claiming equivalent formulation or clinical use', 'a side-by-side identification request with manufacturer, presentation and documentation questions', 'https://www.npra.gov.my/index.php/en/consumers/reporting/quality-reporting-on-registered-product.html'),
      ('Philippines', 'Botulax, Nabota and Rentox: Keeping Supplier Quotations Separate by Product', 'toxin wholesale quote comparison philippines', 'compare commercial quote fields without implying equal potency, dosing or substitutability', 'a quotation comparison checklist that keeps strength, pack and eligibility unconfirmed until verified', 'https://www.fda.gov.ph/fda-advisory-no-2023-2238-utilization-of-the-food-and-drug-administration-fda-verification-portal/'),
    ]
    keys = {x['keyword'] for x in data['topics']}
    added = 0
    for market, title, keyword, decision, deliverable, url in briefs:
        if keyword in keys:
            continue
        data['topics'].append(dict(title=title, keyword=keyword, category='Procurement', market=market, buyer_role='professional purchasing coordinator in ' + market, decision=decision, deliverable=deliverable, verified_facts=['Market is reader location, not verified supply eligibility. No product-specific registration findings have been verified.'], sources=[['Official destination verification information; not proof of any named product approval', url]], status='pending', image='../assets/images/How to evaluate wholesale partners Image.jpg'))
        added += 1
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Added {added} distinct market briefs; saved full research priorities')


if __name__ == '__main__':
    seed()
