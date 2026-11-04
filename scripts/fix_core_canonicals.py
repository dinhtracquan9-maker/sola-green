"""Set canonical URLs for verified core pages lacking a canonical."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for name in ['index.html', 'about.html', 'brands.html', 'catalogue.html', 'contact.html', 'faq.html', 'products.html', 'shipping.html', 'blog/index.html']:
    path = ROOT / name
    source = path.read_text(encoding='utf-8')
    target = 'https://www.hanseongbeauty.com/' + ('' if name == 'index.html' else name)
    if 'rel="canonical"' not in source:
        assert '</head>' in source
        source = source.replace('</head>', f'<link rel="canonical" href="{target}"></head>', 1)
        path.write_text(source, encoding='utf-8')
print('Core canonicals checked')
