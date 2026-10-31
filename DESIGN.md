# KALËTHON design system

This file is the brand authority for UI and AI-assisted design work in this repository. External design-skill repositories can critique or suggest changes, but must not replace these rules without review.

## Product and tone
KALËTHON is a premium British sport-to-city apparel and accessories brand. The experience should feel composed, tactile, editorial, assured and intentionally quiet. Prioritise product photography, fabric detail, fit confidence and an effortless path to purchase.

Brand identity: Kinetic angular K + KALËTHON wordmark. In formal brand lockups centre the K above the wordmark; omit the slogan from the lockup. The established line `Poise in motion` may be used in campaign copy and selected leisurewear, not automatically under every logo. Protect the K geometry and do not invent new marks. Kinetic Weave is the signature leather concept, not a claimed feature of every garment.

## Existing colour tokens
Use the project's actual tokens in `app/globals.css` rather than lifting competitor palettes.

| Token | Hex | Intent |
| --- | --- | --- |
| `--ink` | `#10110f` | Primary text and dark surfaces |
| `--bone` | `#f2eee7` | Warm editorial sections |
| `--paper` | `#faf9f6` | Main surfaces |
| `--sage` | `#7b836f` | Restrained supporting accent |
| `--oxblood` | `#6e1f2d` | Signature accent and selective states |
| `--stone` | `#b9b1a6` | Secondary soft surfaces |

Use explicit colour roles and verify WCAG AA text contrast; decorative brand colours are not automatically suitable for small text or controls. Focus styles must remain clearly visible on both light and dark images.

## Typography, composition and photography
- Maintain the current editorial contrast of modern sans-serif navigation/utility text and restrained serif emphasis. Keep line lengths and letter spacing readable, especially on mobile.
- Use asymmetry, purposeful whitespace and well-edited photographic campaigns rather than endless repetitive cards.
- Give each important product a clear name, material, intended use, accurate price, size guidance, stock/lead-time status and one obvious add-to-bag path.
- Use original, approved garment photography. Never simulate a real colourway by recolouring a photograph of a person with CSS overlays. Confirm any image/logo/stock assets are licensed for commercial use.
- Mobile shopping, search, bag, product selection and checkout must remain usable at 320px width without horizontal overflow.

## Interaction contract
- Controls have semantic labels, an accessible name, visible keyboard focus and appropriately sized pointer targets (aim for at least 44 × 44 CSS px for primary mobile controls).
- Autoplaying campaigns provide a persistent pause control, stop when interacted with, respect reduced-motion preferences and must not expose visually hidden links to keyboard focus.
- Use motion sparingly to emphasise product movement and transitions. Respect `prefers-reduced-motion` and never make animation necessary to understand or complete a task.
- Loading, empty, success, error, out-of-stock and payment-unavailable states must all be designed, not left as incidental defaults.
- Never imply the Virtual Viewing Room gives exact fit or sizing measurements. Obtain meaningful consent for uploaded portraits, minimise retention and accurately describe third-party processing.
- Preserve existing routes, product IDs, Stripe request/response contracts and analytics names when polishing design.

## Separate product domains
This repository is the apparel storefront. KALËTHON Sport equipment (such as cricket, boxing and tennis gear) can share the brand system, but requires distinct product data, safety information and fulfilment workflows. KALËTHON PLAY (players/organisers) and KALËTHON VENUE (paid venue software) are separate booking products, not variants of clothing checkout.

## Design acceptance
Check desktop, tablet and narrow mobile, in both keyboard and pointer journeys. Review hierarchy, contrast, responsiveness, image fidelity, speed, motion, and all important commerce states. Do not ship a mockup as a working integration.
