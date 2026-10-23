# Preview page spec

One self-contained `page.html` per brief, modelled on the "Brief 1 Content" page from Claude Design: a title, a row of tab pills, and one panel per Make item.

## Layout
- Header: eyebrow "Brief N · <pillar>" (Inter 700, 12px, .14em, uppercase, primary), then the title in IvyPresto with an `<em>` payoff.
- Tab pills, one per Make item. Active = filled primary with white text. Inactive = outlined. Elza Condensed uppercase label.
- The active tab is kept in `location.hash`, so a link like `page.html#carousel` opens that tab.
- Max width 1200px, 16px side gutter on phones, no horizontal scroll.

## Tokens
Use the Studio OVXS Design System (artifact `https://claude.ai/artifact/B8eCw13jxkA8d4drcwn8v6`, README at `project/README.md`). Values to use directly:
- Primary `#1B6A63`, on-primary `#FFFFFF`, primary-container a light tint of the primary such as `#CDEBE5`, surface near-white with a faint green tint such as `#F6FAF8`, on-surface `#161D1C`, dark panel `#0F2F2C`, outline-variant `#BFC9C6`.
- Fonts: IvyPresto Display 700 for headings (`brand/ivy-presto-display.woff2`), Elza Condensed Black for buttons and labels (`brand/elza-condensed-black.woff2`), Inter from Google Fonts for body text. Load both with `@font-face` from `../../brand/` locally, and publish them as `fonts/*` with the Artifact.
- Headings use tight tracking (-0.02em) and a line-height around 1. The `<em>` payoff is italic with a wavy underline in primary (`text-decoration: underline wavy #1B6A63; text-underline-offset: .18em`).
- Shapes: pill buttons, 28px cards, 16px small containers. CTA button: Elza uppercase label plus a trailing →.
- Logo: `brand/ovxs-logo.svg` on light, `brand/ovxs-logo-white.svg` on dark.
- No emoji, no gradients beyond a soft primary-container wash, no blue-purple.

## Panels

**LinkedIn post.** Two columns, stacked on phones.
- Left: a LinkedIn-style card with the OV avatar, "Studio OVXS", "@ovxs.studio · 1d", the post text with line breaks kept, and the hashtags in primary.
- Right: the 4:5 graphic, 1080×1350 scaled to fit, with `id="li-graphic"`. Photo on top about 55%. Below it a primary panel with the eyebrow, the headline with its `<em>` payoff, a one-line subline and the CTA pill.
- Below both: "First comment" with the link.

**IG carousel.**
- A grid of 8 slides, 4 per row on desktop and 2 on phones. Each slide is a 1080×1350 artboard scaled down, with `id="slide-1"` … `id="slide-8"`.
- Rotate slide backgrounds across primary, surface, dark panel and primary-container.
- Big IvyPresto headlines with the `<em>` payoff, a numbered index badge on slides 3–7, and the logo plus "ovxs.studio" in small type on every slide.
- Photos go on the cover and the problem slides.
- Caption below the grid.

**Newsletter.** An email-width card (600px) with subject and preview at the top, then the body and one CTA button.

**Article.** A readable column (680px): title, italic dek, then the body in Inter 17px/1.6 with IvyPresto H2s. Meta description and keyword sit in a small box at the end.

**Facebook post.** A Facebook-style card with the text and the same 4:5 graphic, shown smaller.

**LinkedIn video.** Two columns: the script with a timestamp per line, and the shot list.

## Export mode
When the URL has `?export=<id>` (`li-graphic`, `slide-1` … `slide-8`):
- Render only that element at exactly 1080×1350.
- No scaling and no page chrome, body margin 0.
- Wait for fonts with `document.fonts.ready`.

Headless Chrome screenshots it at `--window-size=1080,1350`.

## Photography
Calm, daylight, real-work moments in muted naturals and greens, with headline space top-left. No glossy corporate stock. Stock people never pose as clients or team. Use Pexels or Unsplash only, downloaded with `scripts/stock.mjs` into `assets/`. Reference the local file (`assets/cover.jpg`), never a hotlinked URL, and publish `assets/*` with the Artifact.

## Quality bar before publishing
- Every tab renders, no broken images, no console errors.
- Text contrast is at least 4.5:1, or 3:1 for 24px and larger.
- Slide headlines are 12 words or fewer and fit without clipping.
