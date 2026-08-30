# KALËTHON go-live handover

## Production source

- GitHub `main` is the source of truth.
- `https://kalethon.com` is the public production domain.
- Do not maintain a second production deployment with different environment variables.

## Required before accepting orders

1. Add `STRIPE_SECRET_KEY` through Lovable's secure **Add API Key** form (or configure the Lovable Stripe connector keys) and confirm `/api/checkout` no longer returns `not_configured`. Never paste a key into chat or commit it.
2. Register `https://kalethon.com/api/stripe/webhook` in Stripe for `checkout.session.completed` and `checkout.session.async_payment_succeeded`, then add its `STRIPE_WEBHOOK_SECRET`.
3. Verify `kalethon.com` in Resend and add `RESEND_API_KEY`, `ORDER_EMAIL_FROM=orders@kalethon.com` and `ORDER_EMAIL_TO=hello@kalethon.com`. The webhook sends idempotent owner and customer order emails.
4. Add durable order records, fulfilment status and refund handling before taking real payments. Stripe and email remain the payment/order audit sources until that store is added.
5. Configure real shipping prices, supported destinations, tax treatment and made-to-order lead times.
6. Replace the legal-page placeholders with the verified trading entity, geographic address, company/VAT details, returns address and consumer cancellation form.
7. Confirm FASHN processor retention terms and run one non-customer end-to-end generation test.
8. Add production rate limiting for FASHN requests before public promotion.

## Already implemented

- Finished standard-colour product catalogue and persistent browser bag.
- `/customise` is hidden and redirects to the shop.
- FASHN request and status routes fail closed when the key is absent.
- Stripe checkout validates every product, size, finish and price server-side; its signed webhook retrieves the paid session before sending order email.
- Cookie preferences, privacy/terms/returns pages, favicon, Open Graph, robots, sitemap and structured metadata.
- Local product images bypass the incompatible Vinext optimiser so thumbnails render consistently.
- Product, offer, collection, brand, organisation, website and article structured data plus canonical, Open Graph, X, sitemap, robots, favicon and web-app metadata.

## Release checks

Run:

```sh
npm test
npm run lint
```

Then verify the homepage catalogue, Virtual Viewing Room, search results and bag at desktop and mobile widths before publishing.
