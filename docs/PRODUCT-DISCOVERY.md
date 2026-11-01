# KALËTHON — Product discovery and shopping UX

## Changes in Phase 3
- Typed, pure `lib/catalog-search.ts` index connects currently displayed finished garment families to stable shop-card anchors.
- `/search` supports case/diacritic normalisation, common garment plurals, hoodies and zip-up terminology, and accessible popular-search shortcuts.
- Search results open `/#product-{sku}` rather than the general catalogue top; the card highlights its target and remains focusable.
- Search intentionally omits hard-coded prices that may diverge from the admin-managed D1 price.
- Sport collection product lists link directly to known finished garment cards; items not in the finished storefront are labelled as collection previews rather than given an unverified order button.
- Sport CollectionPage structured data no longer publishes fake `PreOrder` offers for the preview-only garments.

## Quality requirements before merge
- Run lint and build plus `tests/catalog-search.test.mjs`.
- Test on 320px, 390px, 768px and desktop; confirm links jump to exact products and stay readable below the sticky heading.
- Test keyboard navigation into the target product and back to search, and reduced-motion browser preference.
- Verify archived/inactive product handling against a staging D1 dataset. Current search-index links are to the curated static catalogue; dynamic D1 publication matching and dedicated PDPs remain next-phase work.

## Next iteration
- Convert static search records into managed canonical product pages with clean permalinks, variant-level availability, care/material specifications, model fit and real stock/lead times.
- Only then add wishlist, authenticated saved-size preferences and catalogue-grounded styling assistance. Require an explicit customer-consent process before collecting personal measurements.
