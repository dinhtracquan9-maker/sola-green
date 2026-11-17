"""Deterministic, fail-closed editorial image selection; no category fallback."""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def normalize(value):
    value = unicodedata.normalize('NFKD', str(value or '')).lower()
    value = ''.join(c for c in value if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', value).strip()


def contains(text, phrase):
    return ' ' + normalize(phrase) + ' ' in ' ' + normalize(text) + ' '


def approved_image(topic):
    registry = json.loads((ROOT / 'data/editorial_images.json').read_text(encoding='utf-8'))
    # Identity must agree with the headline, not just an old queue keyword.
    title = topic.get('title', '')
    matches = [p for p in registry['products'] if any(contains(title, a) for a in p['aliases'])]
    if len(matches) != 1:
        raise RuntimeError('Image review required: missing or multiple approved product identities')
    selected = matches[0]
    if selected['id'].startswith('rentox-'):
        units = set(re.findall(r'\b(100|200)\s*(?:u|units)?\b', normalize(title)))
        if units != {selected['id'].split('-')[-1]}:
            raise RuntimeError('Image review required: conflicting Rentox variants')
    path = (ROOT / selected['src']).resolve()
    if not path.is_relative_to((ROOT / 'assets/images').resolve()) or not path.is_file():
        raise RuntimeError('Approved product image is missing or outside the image library')
    return {'src': '../' + selected['src'], 'alt': selected['alt'], 'product_id': selected['id']}
