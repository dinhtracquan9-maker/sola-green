"""Add a finite, idempotent set of decision-led procurement briefs."""
import json
from pathlib import Path

BRIEFS = [
    ('Clinic Wholesale RFQ: How to Specify Products, Quantities and Acceptance Criteria', 'clinic wholesale RFQ checklist', 'clinic procurement manager', 'prepare a quote request', 'a copyable RFQ checklist with required and optional fields'),
    ('Comparing Aesthetic Wholesale Quotes: Unit Cost, Freight and Unconfirmed Charges', 'compare aesthetic wholesale quotations', 'reseller purchasing manager', 'compare two supplier quotations', 'a hypothetical two-quote comparison with unknown costs marked explicitly'),
    ('Batch and Expiry Records: A Receiving Checklist for Aesthetic Clinic Buyers', 'aesthetic product batch expiry receiving checklist', 'clinic inventory manager', 'accept or hold an incoming delivery', 'a receiving checklist separating document checks from physical inspection'),
    ('Mixed Product Wholesale Orders: Building a Clear Packing and Reconciliation List', 'mixed product wholesale packing reconciliation', 'multi-brand reseller', 'reconcile a mixed order', 'a line-item reconciliation workflow and discrepancy report template'),
    ('Clinic Reordering: Planning Stock Coverage Without Overbuying Short-Dated Items', 'clinic inventory reorder planning', 'clinic operations manager', 'choose reorder quantities', 'a hypothetical stock-coverage calculation with stated assumptions'),
    ('First Wholesale Order: A Pilot Purchase Scorecard for Professional Buyers', 'first wholesale order supplier scorecard', 'new distributor', 'evaluate a pilot order', 'a weighted scorecard covering communication, documents and order accuracy'),
    ('Product Variant Verification: Preventing Name and Pack-Size Errors in Wholesale Orders', 'wholesale product variant verification', 'procurement coordinator', 'confirm the exact SKU before payment', 'a product-identity confirmation form without invented specifications'),
    ('Shipment Handover Records: Questions to Resolve Before Wholesale Dispatch', 'wholesale shipment handover checklist', 'importer purchasing coordinator', 'clarify responsibilities before dispatch', 'a checklist of responsibilities, tracking and exception handling without delivery promises'),
    ('Wholesale Delivery Discrepancies: Recording Missing, Damaged or Incorrect Items', 'wholesale delivery discrepancy documentation', 'reseller operations manager', 'document an order discrepancy', 'a discrepancy report and evidence checklist without promising remedies'),
]


def seed():
    path = Path(__file__).resolve().parents[1] / 'data' / 'blog_queue.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    existing = {t['keyword'] for t in data['topics']}
    added = 0
    for title, keyword, role, decision, deliverable in BRIEFS:
        if keyword not in existing:
            data['topics'].append(dict(title=title, keyword=keyword, category='Procurement', buyer_role=role, decision=decision, deliverable=deliverable, verified_facts=[], status='pending', image='../assets/images/How to evaluate wholesale partners Image.jpg'))
            added += 1
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Added {added} briefs')


if __name__ == '__main__':
    seed()
