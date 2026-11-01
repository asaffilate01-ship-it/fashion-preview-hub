# KALËTHON go-live checklist

## Complete in the codebase

- Customer-facing `/customise` is hidden and redirects to the finished collection.
- Every visible catalogue colour swatch uses a saved product or campaign image.
- People photography never uses browser colour overlays.
- The Virtual Viewing Room has camera/upload, consent and FASHN request/status flows.
- Stripe Checkout, signed Stripe webhooks, paid-order records and order emails are implemented.
- Product, inventory, order, enquiry and KPI administration is implemented at `/admin`.
- SEO metadata, canonical URLs, structured data, robots, sitemap, favicons, Open Graph, journal pages and delivery landing pages are present.
- PWA manifest, icons, offline route and responsive mobile navigation are present.

## Checkout-integrity improvements (source only, pending review)

- Checkout now fails closed when commerce D1 is unavailable or a product cannot be verified. The old static-price fallback is removed.
- `CHECKOUT_ENABLED=true` must be configured explicitly **only after** the full launch checklist is complete; otherwise the API returns HTTP 503.
- Newly created demo inventory starts at **zero**, not fictitious quantities. Existing seeded stock is not automatically rewritten: manually reconcile every SKU and size/colour row.
- Checkout checks repeated cart quantities against the same inventory pool, and Stripe item metadata identifies the selected pool.
- Paid order webhook fetches every line and is idempotent by Checkout Session; it decrements one relevant inventory row rather than every row.
- Bag confirmation now requires a paid session recorded by the webhook, not simply `?checkout=success`.

**Outstanding:** these improvements do not yet reserve stock while multiple customers are in Stripe checkout. Simultaneous sessions can still contend for the last item. Resolve this with expiring inventory reservations or a controlled made-to-order capacity policy before enabling limited-stock sales. Durable email delivery tracking and production webhook replay testing remain required.

## Production connections required

1. Deploy the latest tested `main` commit to the production host used by `kalethon.com`.
2. Provision the `DB` D1 binding and apply `drizzle/0000_stormy_nekra.sql`.
3. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in the production host.
4. Add the Stripe webhook endpoint `https://kalethon.com/api/stripe/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
5. Set `RESEND_API_KEY`; verify `kalethon.com` in Resend so `orders@kalethon.com` can send to customers and `hello@kalethon.com`.
6. Set `FASHN_API_KEY` and complete one real mobile and desktop try-on.
7. Set `ADMIN_EMAILS=hello@kalethon.com` and verify the production identity headers/sign-in flow before entering stock.
8. Enter final products, SKUs, prices, size-level stock, reorder points and cost prices in `/admin`.
9. Configure real shipping prices/times, production lead times, tax treatment and the final returns address. Check shipping/tax rules in every enabled checkout destination.
10. Run a live £1 Stripe order through payment, webhook, order email, inventory reduction, admin fulfilment, refund and customer receipt.
11. Make the storefront public and attach `kalethon.com` to the same deployment that contains this source. Only after all payment, inventory and legal gates pass, set `CHECKOUT_ENABLED=true` using secure environment configuration.
12. Submit `https://kalethon.com/sitemap.xml` to Google Search Console and Bing Webmaster Tools after deployment.

## Launch gate

Do not announce the store as open until steps 1–11 have been exercised against production. A successful build proves the source compiles; it does not prove payments, email, database persistence, stock control or virtual try-on credentials.
