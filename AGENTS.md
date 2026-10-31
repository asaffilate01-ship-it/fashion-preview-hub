# Agent working agreement — KALËTHON

Read `DESIGN.md`, `docs/GO-LIVE-CHECKLIST.md`, and adjacent application files before changing the app. This storefront is linked to production-facing e-commerce flows; prefer narrowly scoped, reviewable PRs rather than sweeping redesigns.

## Design workflow and references
1. **Audit the current UI first.** Apply the evaluation approach in [Taste Skill](https://github.com/Leonxlnx/taste-skill) (`redesign-existing-projects`, `design-taste-frontend`) to hierarchy, spacing, typography and layouts.
2. **Critique the actual result.** Use [Impeccable](https://github.com/pbakaus/impeccable) for `critique`, `audit` and `polish` passes. Fix accessibility and interaction defects before aesthetic decoration.
3. **Codify brand decisions.** [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) is a *reference library*, not a template to copy over KALËTHON's owned design tokens. Keep `DESIGN.md` authoritative.
4. **Review the implementation.** Use [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills), [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines), and [axe-core](https://github.com/dequelabs/axe-core) alongside browser/manual review.

Do not install an entire unreviewed 'awesome' list or run third-party agent scripts blindly. Inspect licenses, dependencies, network access, permissions and source first. Pin dependencies; do not add paid or high-motion component libraries without a demonstrable benefit.

## Implementation rules
- Existing framework: React/Next.js on Vinext/Cloudflare, Tailwind and D1/Drizzle. Retain compatible conventions rather than introducing a second app framework or database.
- Keep brand imagery and K logo unchanged unless a specific approved design task requires alteration.
- Limit client-side JavaScript and video autoplay. Images need meaningful alt text and sensible sizes; animation requires reduced-motion support.
- All changes to checkout, payment webhooks, inventory, customer data and admin authentication require explicit tests, security review, and production configuration validation.
- Never commit secrets or ask users to paste Stripe, Resend or FASHN keys in chat. Do not send customer photographs, payment or personal records to an AI agent without consent and policy controls.
- Use read-only MCP tools by default. Financial changes, publishing, sending communications, refunds and fulfilment actions require human approval and audit logs.
- Do not confuse KALËTHON clothing commerce with the separate KALËTHON PLAY/VENUE booking applications.

## Verification
Run `npm test` and `npm run lint` in the supported checkout; add or update focused regression tests. Then test the mobile navigation, shopping, size/colour selectors, bag, checkout unavailable state, try-on consent and hero controls with keyboard and screen reader. For changes involving money, also verify signed Stripe callbacks and idempotent order/inventory updates in staging. Record which checks actually ran; never claim a live deployment or successful tests based only on reading files.

## Source of truth
GitHub `main` is described by the project handover as the production source, but this does not verify what is currently deployed. Propose feature changes on a branch, get review and confirm hosting/environment alignment before production merge.
