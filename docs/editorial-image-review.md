# Editorial image review - 2026-11-17

Scanned 237 blog HTML files. Nine articles match five visually reviewed product
identities: Rentox 100, Rentox 200, Restylane Kysse, Refyne and Skinbooster.
Their covers, index thumbnails and queue image references are synchronized.
Product files were copied unchanged from the owner's supplied materials.
Restylane images are branded product illustrations, not raw stock photographs.

227 other articles remain unreviewed; this is not a claim that all are incorrect.
Fabi and Restylane Defyne need suitable original images. Do not substitute Luhilo
or competitor-branded artwork. Existing unreviewed images are not silently deleted.

The publisher now requires an explicit reviewed identity in
`data/editorial_images.json`, an existing file and a matching generated headline.
Unapproved topics are skipped before API spending. If no approved pending topic
exists, publishing stops with an image-review error instead of using a fallback.
At audit time there were zero pending topics in the editorial queue.

Downloads is not continuously synchronized with GitHub Actions. New local files
must be reviewed, copied into the repository and registered before cloud jobs can
use them. Filename similarity alone is not approval, especially across variants.

Recheck existing approved pages without API calls:

```sh
python scripts/repair_editorial_images.py
python scripts/repair_editorial_images.py --apply
python -m unittest discover -s scripts -p 'test_editorial_images.py'
```
