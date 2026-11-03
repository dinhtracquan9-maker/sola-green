import unittest
from unittest.mock import patch
import publish_blog as publisher


class ValidationTests(unittest.TestCase):
    def test_links_unwrap_without_losing_text(self):
        parser = publisher.UnwrapGeneratedLinks()
        parser.feed('<p>Read <a href="https://example.com">source</a> &amp; compare.</p>')
        self.assertEqual(''.join(parser.parts), '<p>Read source &amp; compare.</p>')

    def test_retry_receives_error(self):
        good = dict(title='Test', meta_description='Description', excerpt='Summary', read_time='5 min', html_body='<h2>Identity</h2><h2>Quotation</h2><h2>Receiving</h2><ul><li>Name</li><li>Quantity</li><li>Destination</li></ul><p>' + 'word ' * 450 + '</p>')
        short = dict(good, html_body='<p>Too short</p>')
        with patch.object(publisher, 'generate', side_effect=[short, good]) as generate:
            article, fallback = publisher.generate_article({})
            self.assertFalse(fallback)
            self.assertIn('too short', generate.call_args_list[1].args[1])

    def test_scripts_still_rejected(self):
        article = dict(title='Test', meta_description='Description', excerpt='Summary', read_time='5 min', html_body='<script>alert(1)</script>')
        with self.assertRaisesRegex(RuntimeError, 'Forbidden'):
            publisher.validate(article)


if __name__ == '__main__':
    unittest.main()
