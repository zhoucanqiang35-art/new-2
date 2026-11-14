# Local product title batches

The preview switches from bundled translations and does not request an online translation service. Catalog strings can be truncated; do not infer unverified details. Preserve brands, model numbers, and source meaning.

Run from the repository root:

- `node scripts/title-batches.mjs status` counts distinct source titles, product records, and missing entries per language.
- `node scripts/title-batches.mjs export /tmp/joyagoo-batches 200` exports incomplete titles as numbered JSON files, including source catalogue IDs. Choose a fresh output directory; existing batches are not overwritten.
- Populate each item's `translations` object with actual translations for every language listed in `missing`. Languages are `de`, `fr`, `es`, `it`, `pt`, `nl`, `pl`, `sv`, and `zh`.
- `node scripts/title-batches.mjs merge /path/to/batch.json` validates title membership, duplicate keys, completeness, and obvious service error text; it adds only missing entries and refuses incomplete input. Review translations before merging. Back up batch work in a durable location if needed.
- Re-run status and `node --check dist/product-title-translation.js`. Entries are counted as present, not linguistically verified.

This tool prepares and validates batches; it does not generate translations or run unattended. Formatting can be checked automatically, but translation quality and whether a truncated source title is sufficiently clear require human review.
