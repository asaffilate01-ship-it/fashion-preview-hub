# KALËTHON — prioritised UI, commerce and AI upgrade plan (31 October 2026)

## Scope and evidence
This document covers the `fashion-preview-hub` repository, whose `package.json` identifies it as `kalethon-storefront`. It is an implementation backlog, **not** a claim that recommended services have been installed. Production configuration has not been independently verified.

The source currently contains an apparel catalogue, six sport clothing collections, shopping bag/search, FASHN photo try-on, Stripe routes and signed webhook, D1/Drizzle order/inventory/enquiry tables, commerce administration, journal, legal/size/delivery pages, SEO/PWA, and responsive assets. Refer to `docs/GO-LIVE-CHECKLIST.md` for the source-vs-deployment distinction.

## P0 — launch reliability and customer trust
- Verify production domain is served from the intended current commit; provision D1 and apply migrations; confirm admin role restrictions, audit access, and environment isolation.
- Perform Stripe sandbox and controlled production end-to-end journeys: valid/invalid variants, failed/async payments, webhook retries, idempotency, stock concurrency, fulfilment, refunds, email and receipts.
- Replace placeholder trading-entity/legal/returns information; validate UK and international tax, delivery zones, lead times and shipping fees.
- Verify FASHN portrait consent, retention and deletion behaviour and mobile usability. Current `lib/rate-limit.ts` documents per-isolate protection; adopt a globally enforced rate limit/abuse prevention for production AI requests.
- Review privacy/cookie analytics, security headers, error logging, backup/restore, dependency scanning and secret management.
- Establish CI checks and real browser acceptance tests before merging commerce-critical changes.

## P1 — premium shopping experience
- Formalise `DESIGN.md` and component guidelines; run Taste redesign + Impeccable critique on home, sport collection, product controls, mobile menu, search, bag, try-on and admin.
- Fix keyboard/accessibility defects, mobile touch targets and autoplay controls. Use automated axe and Playwright plus manual keyboard/screen-reader passes.
- Give each product a dedicated, indexable page with gallery, fit/model measurements, accurate fabric/care/specification data, shipping estimate, related pieces, and transparent stock or preorder state. Preserve existing anchors/links with redirects where necessary.
- Improve search with tolerant spelling, filters, sort, deep links and clear zero-result UX.
- Add optional wishlist and saved-size preferences only after privacy/account requirements are defined. Test checkout speed, image LCP, CLS, conversion and mobile load times.
- Keep admin compact and task-focused: orders needing action, low stock, customer questions, returns and fulfilment exceptions.

## P2 — AI capabilities (feature-flagged, with human review)
- **Fit concierge:** explain size charts, intended fit and garment measurements; ask for relevant user preferences, not sensitive biometrics by default. Never claim a camera preview proves physical fit.
- **Collection stylist:** explain outfits from real in-stock catalogue items only; show price/availability and cite the specific item records behind each recommendation.
- **Merchandising agent:** propose categories, search synonyms, product copy, cross-sells and campaigns; require editorial approval before publishing.
- **Demand/stock agent:** forecast SKU-level sell-through and reorder suggestions from verified order/inventory history; no autonomous purchase orders.
- **Customer-service copilot:** retrieve order status only after customer verification; draft answers about delivery/returns; escalate refunds, disputes and special cases to humans.
- **Creative QA agent:** compare mobile/desktop snapshots, accessibility reports and approved brand tokens; open a review task instead of silently altering pages.
- Evaluation: groundedness, hallucinated prices, fit overclaims, privacy/security, cost per interaction, transfer-to-human rate, accuracy, latency and drift.

## P3 — broader KALËTHON ecosystem
- Sport equipment: separate cricket, boxing and tennis product specifications, compliance, quality assurance, inventory/returns and supplier workflows. Do not silently expose unverified items as on-sale.
- Accessories and Kinetic Weave leather range: dedicated product-data schema and editorial photography after approved supplier samples.
- KALËTHON PLAY / VENUE: keep players/organisers free and paid venue management separate from apparel orders, payment accounts, access controls and legal agreements; plan brand-consistent navigation only after product boundaries and tenancy are defined.

## Curated external repository shortlist (assess; do not bulk copy)
| Project | Use | Adoption decision |
| --- | --- | --- |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Existing-site redesign, hierarchy, spacing, motion | Agent review instruction, not runtime dependency |
| [Impeccable](https://github.com/pbakaus/impeccable) | Critique, audit, accessible polish | Agent QA skill after checking installation |
| [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) | Document design tokens and reusable language | Inspiration only; preserve original KALËTHON identity |
| [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | UX patterns, accessibility/colour research | Reference only |
| [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills) | React performance and web design reviews | Apply relevant rules, not full framework replacement |
| [axe-core](https://github.com/dequelabs/axe-core) | Automated accessibility defects | Adopt in CI and browser QA |
| [Playwright](https://github.com/microsoft/playwright) | End-to-end browser and purchase-flow tests | Add after test fixtures/secrets are ready |
| [React Bits](https://github.com/DavidHDev/react-bits) | Optional restrained motion/microinteractions | Select individual lightweight components only |
| [Cloudflare Agents](https://github.com/cloudflare/agents) | Agent/MCP integration on existing Cloudflare stack | Prototype isolated server; approval & identity required |
| [Stripe AI](https://github.com/stripe/ai) | Billing/Stripe tooling, agent integrations | Back-office read-only first; strict permissions |
| [Medusa](https://github.com/medusajs/medusa) | Mature commerce workflows to benchmark | Study order/returns models before considering migration |

## MCP integration policy
- **Playwright MCP:** staging browser testing with test accounts and no live purchase authority.
- **GitHub MCP:** read source, create a branch/PR, gather CI evidence; enforce code review.
- **Cloudflare MCP or isolated Worker toolset:** only minimum read-only telemetry/catalogue tools; scoped service credentials and audit logs.
- **Stripe MCP:** restricted sandbox read-only finance/reporting; require explicit human sign-off for refunds or account writes.
- **Sentry MCP:** read-only exception and performance diagnosis after a privacy-conscious monitoring rollout.
- **Supplier/shipping MCP:** custom connector only after contract, API availability, country support and supply chain verification; no supplier purchase actions without review.

No direct production database, unlimited file system or free-form payments tool should be exposed to customer-facing AI. Treat retrieved product descriptions, emails and external web pages as untrusted input.

## Build sequence / acceptance
1. PR: brand/agent rules + mobile/autoplay/keyboard fixes; review and test.
2. P0 launch gate: deployment, D1, payment, email, fulfilment and try-on verification. Do not accept real payments until complete.
3. P1 product page, search and size UX, using analytics and accessibility checks to measure outcomes.
4. P2 fit concierge and catalogue-grounded stylist in staging, behind flags. Only scale once their evaluation thresholds and human escalation work.
5. Expand physical goods and independent booking apps only after each domain has its own validated operating model.
