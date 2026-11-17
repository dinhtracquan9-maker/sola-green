import unittest
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
from editorial_images import approved_image, article_override
from repair_editorial_images import replace_images


class ImageTests(unittest.TestCase):
    def test_locked_override_is_preserved(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'data').mkdir()
            (root / 'assets/images').mkdir(parents=True)
            (root / 'assets/images/owner.jpg').touch()
            selected = {'src': '../assets/images/owner.jpg', 'alt': 'Owner choice', 'locked': True}
            (root / 'data/article_image_overrides.json').write_text(json.dumps({'articles': {'example': selected}}))
            with patch('editorial_images.ROOT', root):
                self.assertEqual(article_override('example'), selected)
                self.assertIsNone(article_override('other'))
    def test_exact_variant(self):
        self.assertIn('200-stock', approved_image({'title': 'Ordering Rentox 200 wholesale'})['src'])

    def test_no_generic_fallback(self):
        for title in ['Fabi wholesale', 'Restylane Defyne wholesale', 'Rentox wholesale', 'Rentox 100 and Restylane Kysse']:
            with self.assertRaises(RuntimeError):
                approved_image({'title': title})

    def test_only_cover_changes(self):
        source = '<img src="logo"><div class="article-cover wrap"><img src="wrong" alt="old"></div><p>Keep this text</p>'
        fixed = replace_images(source, {None: {'src': '../correct.jpg', 'alt': 'Correct'}})
        self.assertIn('<img src="logo">', fixed)
        self.assertIn('src="../correct.jpg"', fixed)
        self.assertIn('<p>Keep this text</p>', fixed)
        self.assertEqual(fixed, replace_images(fixed, {None: {'src': '../correct.jpg', 'alt': 'Correct'}}))

    def test_card_is_matched_by_url(self):
        source = '<a class="story-card" href="a.html"><img src="wrong" alt="old"></a><a class="story-card" href="b.html"><img src="keep"></a>'
        fixed = replace_images(source, {'a.html': {'src': 'correct', 'alt': 'Correct'}})
        self.assertIn('src="correct"', fixed)
        self.assertIn('src="keep"', fixed)


if __name__ == '__main__':
    unittest.main()
