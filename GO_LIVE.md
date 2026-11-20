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

## KALËTHON Team & Pro — invoice-preparation controls

The admin-only `/admin/handovers/{id}/preview` page is an **internal preparation worksheet**, not an issued invoice, deposit request, payment notification or factory order. It will not render the private financial document until the related handover is ready for invoice review, the customer-accepted quote is still current, any required latest artwork proof has been approved, and all four internal buyer/tax/terms/specification checks have been recorded.

Configure the following in the hosting platform's **server-side secrets / environment configuration**, only after verifying the real trading entity. Never put business registration secrets, API keys or unverified legal identity into source code:

| Server-side variable | Requirement |
| --- | --- |
| `KALETHON_SELLER_DETAILS_VERIFIED` | Set to `true` only after independently verifying the legal seller and address |
| `KALETHON_SELLER_LEGAL_NAME` | Actual legal seller name |
| `KALETHON_SELLER_ADDRESS` | Complete geographic trading or registered address |
| `KALETHON_SELLER_COUNTRY` | Country of the supplying legal entity |
| `KALETHON_SELLER_COMPANY_NUMBER` | Company registration reference, where applicable |
| `KALETHON_SELLER_VAT_NUMBER` | Verified VAT identifier; mandatory for a worksheet containing an estimated VAT charge |

Do not invent details to make the preview render. The worksheet is restricted to authenticated administrators, retrieves all financial fields through a no-store API, and shows a clear **NOT A VAT INVOICE / NOT A PAYMENT REQUEST** warning in both screen and print views.

**Separate production work still required before issuing real commercial invoices:**
- A legally reviewed invoice numbering sequence and appropriate tax and seller requirements.
- A verified customer invoice-issuance and cancellation/correction process.
- An authenticated payment provider flow and independent webhook-based paid-status reconciliation.
- Explicit customer and supplier confirmations, shipping rules and final production approval.
- Live-environment tests of permissions, identity configuration, taxes and customer order scenarios.

