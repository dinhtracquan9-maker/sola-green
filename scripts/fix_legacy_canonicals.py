"""Add canonical URLs to the three verified legacy articles missing them."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for name in ('building-a-wholesale-product-list', 'shipping-aesthetic-products-internationally', 'wholesale-dermal-filler-malaysia-b2b-buyers-guide'):
    path = ROOT / 'blog' / (name + '.html')
    source = path.read_text(encoding='utf-8')
    if 'rel="canonical"' not in source:
        source = source.replace('</head>', f'<link rel="canonical" href="https://www.hanseongbeauty.com/blog/{name}.html"></head>', 1)
        path.write_text(source, encoding='utf-8')
