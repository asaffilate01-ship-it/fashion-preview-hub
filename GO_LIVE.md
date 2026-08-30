# KALËTHON go-live handover

## Production source

- GitHub `main` is the source of truth.
- `https://kalethon.com` is the public production domain.
- Do not maintain a second production deployment with different environment variables.

## Required before accepting orders

1. Add the Stripe production connection and confirm `/api/checkout` no longer returns `not_configured`.
2. Add a signed Stripe webhook, durable order records, fulfilment status, refund handling and idempotency before taking real payments.
3. Connect transactional order email from `hello@kalethon.com`.
4. Configure real shipping prices, supported destinations, tax treatment and made-to-order lead times.
5. Replace the legal-page placeholders with the verified trading entity, geographic address, company/VAT details, returns address and consumer cancellation form.
6. Confirm FASHN processor retention terms and run one non-customer end-to-end generation test.
7. Add production rate limiting for FASHN requests before public promotion.

## Already implemented

- Finished standard-colour product catalogue and persistent browser bag.
- `/customise` is hidden and redirects to the shop.
- FASHN request and status routes fail closed when the key is absent.
- Stripe checkout route validates every product, size, finish and price server-side.
- Cookie preferences, privacy/terms/returns pages, favicon, Open Graph, robots, sitemap and structured metadata.
- Local product images bypass the incompatible Vinext optimiser so thumbnails render consistently.

## Release checks

Run:

```sh
npm test
npm run lint
```

Then verify the homepage catalogue, Virtual Viewing Room, search results and bag at desktop and mobile widths before publishing.
