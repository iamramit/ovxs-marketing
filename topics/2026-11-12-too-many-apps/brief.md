# Your store doesn’t need another app
Pillar: Honest advice · Audience: Growing stores · Make: LinkedIn post, IG carousel, Article · CTA: Book a $99 video audit · Status: review

## Raw input
No request from Ramit. Picked by the weekly run on 2026-11-12: no new Desk requests and no real Ovi chats since 2026-11-02, so topics came from pillars. Honest advice was last used on 2026-10-14 (more than two weeks ago). “Too many apps” is listed as an example topic in pillars.md. Make taken from the pillar’s best formats.

## Research (2026-11-12)
### Our evidence
- Speed, SEO & Conversion service: faster pages, technical SEO, tested conversion changes. /pages/service/speed-seo-conversion (../STUDIO/worker/src/knowledge.js)
- Custom section from $250. That’s the honest alternative when an app only does one small thing on the storefront (voice.md, knowledge.js).
- Shopify subscription and paid apps are billed to the client directly by Shopify and app makers (knowledge.js), so every app is a monthly cost as well as a speed cost.
- Ovi logs: no real visitor chats since 2026-11-02. Nothing to quote.

### Audience language
- “Balancing speed, apps and custom code”: store owners describe the trade-off as removing apps breaks things they rely on. https://community.shopify.com/t/anyone-else-struggling-with-balancing-speed-apps-and-custom-code/578816
- “Store slower after uninstalling apps?”: leftover app code is still loading in the theme. https://community.shopify.com/t/672753
- “How can I remove unused code after uninstalling apps?”: a long-running thread, with merchants saying they aren’t technical enough to do it themselves. https://community.shopify.com/t/how-can-i-remove-unused-code-after-uninstalling-apps/5013/232
- “Managing Shopify app stack cost without slowing down the site”: cost and speed come up together. https://community.shopify.com/t/managing-shopify-app-stack-cost-without-slowing-down-the-site/672692

### What's already out there
- Most top results are speed-app vendors and agency blogs with “how many apps is too many” lists, usually ending in “install our app”.
- The common take is a number (“keep it under X apps”). The gap: no number is right. Each app should do one job that earns a sale, and overlaps or leftovers should go before anyone pays for a redesign.

### Facts
| Claim | Source | Year |
|---|---|---|
| To qualify as Built for Shopify, an app must not reduce the storefront Lighthouse performance score by more than 10 points (criterion 2.2.1) | https://shopify.dev/docs/apps/launch/built-for-shopify/achievement-criteria | 2026 (current docs) |
| Shopify measures an app’s impact as the Lighthouse score after install minus before, as a weighted average across home, product and collection pages | https://shopify.dev/docs/apps/build/performance/storefront | 2026 (current docs) |
| A scrape of 10,000+ Shopify stores found 4.84 detectable apps on average, and only 2.05% with none. Secondary source (community post); use as “roughly five” if at all. | https://community.shopify.com/t/i-scraped-10-000-shopify-stores-here-are-the-most-used-themes-apps-and-average-speed-scores/591484 | 2026 |
| Not used: Deloitte/Google “Milliseconds make millions” (0.1s faster = 8.4% more retail conversions). It’s from 2020, older than the 3-year rule. | https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html | 2020 |

### So what
- Even an app Shopify approves as “Built for Shopify” can cost up to 10 points on the storefront speed score. Every app has to earn its place.
- Uninstalling an app doesn’t always remove it. Store owners keep finding old app code still loading in their theme.
- The honest advice isn’t “no apps”. It’s one job per app, and cutting overlaps and leftovers before paying for a redesign.

## Angles
### A — Every app has to earn its place
- Hook: Every app you install is a small promise to load something on every page.
- Argument: List every app, write down the sale it helps make, and cut the ones that can’t answer.
- Proof used: Built for Shopify 10-point ceiling; roughly five apps on the average store (secondary); apps billed monthly to the client.
- Fits: Honest advice · Growing stores
- Risk: Lighthouse points aren’t sales. Don’t claim a direct link to revenue without a current source.

### B — Uninstalling isn’t removing
- Hook: Deleting an app doesn’t always delete its code.
- Argument: Leftover theme code keeps loading after an uninstall, so check theme.liquid and snippets on a duplicated theme before blaming the design.
- Proof used: Shopify Community leftover-code threads; Speed, SEO & Conversion service.
- Fits: Honest advice · Growing stores (leans Shopify know-how)
- Risk: Readers may edit their live theme. Copy must say to duplicate the theme first.

### C — When an app is the honest answer
- Hook: We tell clients to install an app more often than you’d think.
- Argument: Apps aren’t the problem. Overlapping apps, and apps doing what the theme already does, are. One job, one app, and a custom section when the job is small.
- Proof used: Custom section from $250; Built for Shopify criteria as a filter for choosing apps.
- Fits: Honest advice · Growing stores
- Risk: The nuanced message is harder to hook than “cut your apps”.

## Decisions
- Angle: A — Every app has to earn its place (picked on the Desk 2026-11-13, no notes; Publish now tapped 2026-11-14)
- Must include: the four-step test; Built for Shopify 10-point ceiling as the only hard stat on social
- Must avoid: claiming speed points equal sales; editing the live theme (copy says duplicate first)
- CTA: Book a $99 video audit
- Make (final): LinkedIn post, IG carousel (8 slides), Article
- Decided on: 2026-11-13
- Drafted 2026-11-14 in an interactive session (the scheduled daily run was cancelled). Preview: https://claude.ai/artifact/Dbh5KEYGtPEojQiZRKnK64
- 2026-11-14: Ramit asked for fresh photos. Brief 1 photos replaced with three new Unsplash picks (see Photos); only the four photo images were re-rendered and re-uploaded.
- 2026-11-18: LinkedIn graphic photo: Andrew Neel (QLqNalPe0RA), swapped on the Desk. Downloaded with credit; all nine graphics re-rendered as PNGs in the Studio Notes scheme with the Desk's designs.

## Photos
| File | Source | Photographer | Page |
|---|---|---|---|
| assets/li-cover.jpg | Unsplash QLqNalPe0RA | Andrew Neel | LinkedIn graphic (Desk pick 2026-11-18) |
| assets/cover.jpg | Unsplash ag5H7Nqbf9U | Filipp Romanovski | slide 1 |
| assets/notes.jpg | Unsplash 1rm4_SojyNM | Jakub Żerdzicki | slide 4 |
| assets/code.jpg | Unsplash _4HiCxdOBLU | Tracy Adams | slide 6 |

## SEO (articles only)
- Target keyword: too many Shopify apps
- Meta description: Too many Shopify apps slowing your store? Use one simple test to decide which apps earn their place, which to cut, and when a custom section is better.
- Slug: /blogs/journal/too-many-shopify-apps
