/* Studio OVXS carousel kit — shared by every topics/<folder>/page.html.
 * Export mode (?export=<id>) applies:
 *   order=3,1,2…  slide numbers (as in page.html) in posting order; slides left out are dropped. Footer "n/total"
 *                 and step badges (01, 02…) are renumbered to match.
 *   style=<scheme> evergreen (the page as written) or one of four schemes from the Studio OVXS design system:
 *     notes  — Studio Notes: warm paper, sticky-note panels (sand, lilac, peach, mint), Romie headlines, cookie badges, taped photos.
 *     field  — Deep Field: navy dark mode from the tertiary blue, lilac highlights, full-bleed and split photos, flower badges.
 *     poster — Poster: star yellow, ink and sand, Elza Condensed set huge, photos cut into brand shapes, burst badges.
 *     coast  — Coastline: tertiary blue and mint grounds, content on 48px cards, wave motif, clover badges.
 *   photo=<https://images.unsplash.com/… | https://images.pexels.com/… | assets/file.jpg>  photo for this graphic.
 * PDF mode (?export=pdf&pages=li-graphic,slide-1,…) lays the chosen graphics out as 1080×1350 pages for printing to
 * PDF (Adobe Express import). Per-graphic photos come as ph.<id>=<url>.
 * Each slide gets a Material Symbols Rounded glyph: the slide's own `icon` field if set, otherwise one picked from its words.
 * New pages may give a slide `lay`: "type", "stat" (figure in s.stat), "quote" or "split". See page-spec.md.
 */
(function () {
  const STYLES = ["evergreen", "notes", "field", "poster", "coast"];
  const PHOTO_RE = /^(https:\/\/images\.(unsplash|pexels)\.com\/[^"'()\s]+|assets\/[\w.-]+)$/;
  const ICON_RE = /^[a-z0-9_]{2,40}$/;
  const here = (document.currentScript && document.currentScript.src) || "";
  const base = here ? here.replace(/[^/]*$/, "") : "../../brand/";
  const shape = (d) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${d}'/></svg>`)}") center/contain no-repeat`;
  const wave = (c) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 12'><path d='M0 6 Q6 0.5 12 6 T24 6' fill='none' stroke='${c}' stroke-width='2.5' stroke-linecap='round'/></svg>`)}")`;
  const COOKIE = shape("M50.0 1.0L52.1 1.3L54.2 2.2L56.1 3.6L57.9 5.3L59.5 7.1L61.1 8.7L62.6 9.9L64.3 10.8L66.1 11.2L68.1 11.2L70.3 11.0L72.7 10.7L75.1 10.6L77.5 10.7L79.7 11.3L81.5 12.5L82.9 14.1L83.9 16.1L84.5 18.4L84.8 20.8L84.9 23.2L85.1 25.4L85.4 27.4L86.1 29.1L87.3 30.6L88.8 31.9L90.6 33.2L92.6 34.5L94.6 35.9L96.3 37.6L97.6 39.5L98.3 41.5L98.3 43.6L97.8 45.8L96.7 48.0L95.4 50.0L93.9 51.9L92.6 53.7L91.7 55.5L91.1 57.2L91.0 59.1L91.3 61.1L91.9 63.2L92.6 65.5L93.2 67.9L93.4 70.3L93.2 72.5L92.4 74.5L91.1 76.2L89.3 77.5L87.1 78.5L84.8 79.2L82.4 79.7L80.3 80.3L78.4 81.0L76.8 82.0L75.6 83.3L74.6 85.1L73.6 87.1L72.7 89.3L71.6 91.5L70.3 93.4L68.6 95.0L66.8 96.0L64.7 96.5L62.4 96.3L60.1 95.7L57.9 94.7L55.7 93.6L53.7 92.6L51.8 92.0L50.0 91.7L48.2 92.0L46.3 92.6L44.3 93.6L42.1 94.7L39.9 95.7L37.6 96.3L35.3 96.5L33.2 96.0L31.4 95.0L29.7 93.4L28.4 91.5L27.3 89.3L26.4 87.1L25.4 85.1L24.4 83.3L23.2 82.0L21.6 81.0L19.7 80.3L17.6 79.7L15.2 79.2L12.9 78.5L10.7 77.5L8.9 76.2L7.6 74.5L6.8 72.5L6.6 70.3L6.8 67.9L7.4 65.5L8.1 63.2L8.7 61.1L9.0 59.1L8.9 57.2L8.3 55.5L7.4 53.7L6.1 51.9L4.6 50.0L3.3 48.0L2.2 45.8L1.7 43.6L1.7 41.5L2.4 39.5L3.7 37.6L5.4 35.9L7.4 34.5L9.4 33.2L11.2 31.9L12.7 30.6L13.9 29.1L14.6 27.4L14.9 25.4L15.1 23.2L15.2 20.8L15.5 18.4L16.1 16.1L17.1 14.1L18.5 12.5L20.3 11.3L22.5 10.7L24.9 10.6L27.3 10.7L29.7 11.0L31.9 11.2L33.9 11.2L35.7 10.8L37.4 9.9L38.9 8.7L40.5 7.1L42.1 5.3L43.9 3.6L45.8 2.2L47.9 1.3Z"), FLOWER = shape("M50.0 1.0L52.1 1.2L54.2 1.9L56.2 3.0L58.0 4.6L59.6 6.5L60.9 9.2L62.0 11.9L63.1 14.0L64.2 15.7L65.3 17.2L66.5 18.4L67.7 19.3L69.2 19.9L70.8 20.3L72.6 20.6L74.7 20.6L77.0 20.5L79.9 20.1L82.8 19.9L85.3 20.4L87.6 21.2L89.5 22.3L91.2 23.8L92.4 25.5L93.3 27.5L93.7 29.6L93.8 31.9L93.3 34.2L92.5 36.6L90.8 39.1L89.0 41.4L87.8 43.3L86.8 45.2L86.1 46.8L85.6 48.4L85.5 50.0L85.6 51.6L86.1 53.2L86.8 54.8L87.8 56.7L89.0 58.6L90.8 60.9L92.5 63.4L93.3 65.8L93.8 68.1L93.7 70.4L93.3 72.5L92.4 74.5L91.2 76.2L89.5 77.7L87.6 78.8L85.3 79.6L82.8 80.1L79.9 79.9L77.0 79.5L74.7 79.4L72.6 79.4L70.8 79.7L69.2 80.1L67.7 80.7L66.5 81.6L65.3 82.8L64.2 84.3L63.1 86.0L62.0 88.1L60.9 90.8L59.6 93.5L58.0 95.4L56.2 97.0L54.2 98.1L52.1 98.8L50.0 99.0L47.9 98.8L45.8 98.1L43.8 97.0L42.0 95.4L40.4 93.5L39.1 90.8L38.0 88.1L36.9 86.0L35.8 84.3L34.7 82.8L33.5 81.6L32.3 80.7L30.8 80.1L29.2 79.7L27.4 79.4L25.3 79.4L23.0 79.5L20.1 79.9L17.2 80.1L14.7 79.6L12.4 78.8L10.5 77.7L8.8 76.2L7.6 74.5L6.7 72.5L6.3 70.4L6.2 68.1L6.7 65.8L7.5 63.4L9.2 60.9L11.0 58.6L12.2 56.7L13.2 54.8L13.9 53.2L14.4 51.6L14.5 50.0L14.4 48.4L13.9 46.8L13.2 45.2L12.2 43.3L11.0 41.4L9.2 39.1L7.5 36.6L6.7 34.2L6.2 31.9L6.3 29.6L6.7 27.5L7.6 25.5L8.8 23.8L10.5 22.3L12.4 21.2L14.7 20.4L17.2 19.9L20.1 20.1L23.0 20.5L25.3 20.6L27.4 20.6L29.2 20.3L30.8 19.9L32.3 19.3L33.5 18.4L34.7 17.2L35.8 15.7L36.9 14.0L38.0 11.9L39.1 9.2L40.4 6.5L42.0 4.6L43.8 3.0L45.8 1.9L47.9 1.2Z"), CLOVER = shape("M50.0 1.0L52.1 1.1L54.2 1.6L56.3 2.3L58.2 3.3L60.1 4.6L61.7 6.2L63.2 8.0L64.5 10.3L65.1 13.5L65.5 16.7L66.2 18.9L66.8 20.8L67.5 22.5L68.2 24.1L68.8 25.5L69.6 26.7L70.4 27.8L71.2 28.8L72.2 29.6L73.3 30.4L74.5 31.2L75.9 31.8L77.5 32.5L79.2 33.2L81.1 33.8L83.3 34.5L86.5 34.9L89.7 35.5L92.0 36.8L93.8 38.3L95.4 39.9L96.7 41.8L97.7 43.7L98.4 45.8L98.9 47.9L99.0 50.0L98.9 52.1L98.4 54.2L97.7 56.3L96.7 58.2L95.4 60.1L93.8 61.7L92.0 63.2L89.7 64.5L86.5 65.1L83.3 65.5L81.1 66.2L79.2 66.8L77.5 67.5L75.9 68.2L74.5 68.8L73.3 69.6L72.2 70.4L71.2 71.2L70.4 72.2L69.6 73.3L68.8 74.5L68.2 75.9L67.5 77.5L66.8 79.2L66.2 81.1L65.5 83.3L65.1 86.5L64.5 89.7L63.2 92.0L61.7 93.8L60.1 95.4L58.2 96.7L56.3 97.7L54.2 98.4L52.1 98.9L50.0 99.0L47.9 98.9L45.8 98.4L43.7 97.7L41.8 96.7L39.9 95.4L38.3 93.8L36.8 92.0L35.5 89.7L34.9 86.5L34.5 83.3L33.8 81.1L33.2 79.2L32.5 77.5L31.8 75.9L31.2 74.5L30.4 73.3L29.6 72.2L28.8 71.2L27.8 70.4L26.7 69.6L25.5 68.8L24.1 68.2L22.5 67.5L20.8 66.8L18.9 66.2L16.7 65.5L13.5 65.1L10.3 64.5L8.0 63.2L6.2 61.7L4.6 60.1L3.3 58.2L2.3 56.3L1.6 54.2L1.1 52.1L1.0 50.0L1.1 47.9L1.6 45.8L2.3 43.7L3.3 41.8L4.6 39.9L6.2 38.3L8.0 36.8L10.3 35.5L13.5 34.9L16.7 34.5L18.9 33.8L20.8 33.2L22.5 32.5L24.1 31.8L25.5 31.2L26.7 30.4L27.8 29.6L28.8 28.8L29.6 27.8L30.4 26.7L31.2 25.5L31.8 24.1L32.5 22.5L33.2 20.8L33.8 18.9L34.5 16.7L34.9 13.5L35.5 10.3L36.8 8.0L38.3 6.2L39.9 4.6L41.8 3.3L43.7 2.3L45.8 1.6L47.9 1.1Z"), BURST = shape("M50.0 1.0L52.1 1.4L54.1 2.6L56.0 4.2L57.8 5.8L59.5 7.2L61.2 8.0L63.2 8.2L65.3 7.9L67.7 7.3L70.1 6.8L72.5 6.9L74.5 7.6L76.1 9.0L77.3 11.0L78.1 13.3L78.8 15.7L79.6 17.7L80.7 19.3L82.3 20.4L84.3 21.2L86.7 21.9L89.0 22.7L91.0 23.9L92.4 25.5L93.1 27.5L93.2 29.9L92.7 32.3L92.1 34.7L91.8 36.8L92.0 38.8L92.8 40.5L94.2 42.2L95.8 44.0L97.4 45.9L98.6 47.9L99.0 50.0L98.6 52.1L97.4 54.1L95.8 56.0L94.2 57.8L92.8 59.5L92.0 61.2L91.8 63.2L92.1 65.3L92.7 67.7L93.2 70.1L93.1 72.5L92.4 74.5L91.0 76.1L89.0 77.3L86.7 78.1L84.3 78.8L82.3 79.6L80.7 80.7L79.6 82.3L78.8 84.3L78.1 86.7L77.3 89.0L76.1 91.0L74.5 92.4L72.5 93.1L70.1 93.2L67.7 92.7L65.3 92.1L63.2 91.8L61.2 92.0L59.5 92.8L57.8 94.2L56.0 95.8L54.1 97.4L52.1 98.6L50.0 99.0L47.9 98.6L45.9 97.4L44.0 95.8L42.2 94.2L40.5 92.8L38.8 92.0L36.8 91.8L34.7 92.1L32.3 92.7L29.9 93.2L27.5 93.1L25.5 92.4L23.9 91.0L22.7 89.0L21.9 86.7L21.2 84.3L20.4 82.3L19.3 80.7L17.7 79.6L15.7 78.8L13.3 78.1L11.0 77.3L9.0 76.1L7.6 74.5L6.9 72.5L6.8 70.1L7.3 67.7L7.9 65.3L8.2 63.2L8.0 61.2L7.2 59.5L5.8 57.8L4.2 56.0L2.6 54.1L1.4 52.1L1.0 50.0L1.4 47.9L2.6 45.9L4.2 44.0L5.8 42.2L7.2 40.5L8.0 38.8L8.2 36.8L7.9 34.7L7.3 32.3L6.8 29.9L6.9 27.5L7.6 25.5L9.0 23.9L11.0 22.7L13.3 21.9L15.7 21.2L17.7 20.4L19.3 19.3L20.4 17.7L21.2 15.7L21.9 13.3L22.7 11.0L23.9 9.0L25.5 7.6L27.5 6.9L29.9 6.8L32.3 7.3L34.7 7.9L36.8 8.2L38.8 8.0L40.5 7.2L42.2 5.8L44.0 4.2L45.9 2.6L47.9 1.4Z");

  // Words → Material Symbols Rounded glyph. First match wins; order matters.
  const ICONS = [
    [/\b(mobile|phone|thumb|tap)/i, "smartphone"], [/\b(checkout|cart|basket)/i, "shopping_cart_checkout"],
    [/\b(trust|review|guarantee|proof|secure)/i, "verified"], [/\b(navigation|menu|search|find|where)/i, "explore"],
    [/\b(product|information|size|material|spec)/i, "inventory_2"], [/\b(speed|fast|slow|load|second)/i, "bolt"],
    [/\b(app|apps|plugin)/i, "apps"], [/\b(price|cost|\$|pay|fee|budget|bill)/i, "payments"],
    [/\b(seo|rank|google|traffic|search engine)/i, "trending_up"], [/\b(design|brand|theme|look)/i, "palette"],
    [/\b(data|analytics|number|metric|percent|%)/i, "insights"], [/\b(shipping|delivery|parcel|return)/i, "local_shipping"],
    [/\b(email|newsletter|inbox)/i, "mail"], [/\b(time|minute|hour|week|day)/i, "schedule"],
    [/\b(video|audit|watch)/i, "play_circle"], [/\b(customer|shopper|people|buyer)/i, "group"],
    [/\b(store|shop|shopify)/i, "storefront"], [/\b(code|developer|custom|build)/i, "code"],
    [/\b(easy|friction|simple|step)/i, "touch_app"], [/\b(next|start|book|cta)/i, "arrow_forward"],
    [/\b(list|check|checklist)/i, "checklist"], [/\b(sale|sell|revenue|conversion)/i, "sell"],
    [/\?/, "help"]
  ];
  const pickIcon = (s, el) => {
    if (s && ICON_RE.test(s.icon || "")) return s.icon;
    const text = el ? (el.querySelector(".ey")?.textContent || "") + " " + (el.querySelector(".hd")?.textContent || "") : "";
    for (const [re, name] of ICONS) if (re.test(text)) return name;
    return "";
  };

  const css = `
@font-face{font-family:"Romie";src:url("${base}romie-regular.woff2") format("woff2");font-weight:400;font-display:block}
.k-glyph{font-family:"Material Symbols Rounded";font-weight:400;font-style:normal;line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;direction:ltr;-webkit-font-feature-settings:"liga";font-feature-settings:"liga";-webkit-font-smoothing:antialiased;position:absolute;pointer-events:none;font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 48}
.board[class*="sch-"] .badge{border-radius:0;-webkit-mask:var(--k-shape);mask:var(--k-shape);z-index:3}
.board[class*="sch-"] .pn,.board[class*="sch-"] .ft{z-index:2}
.board[class*="sch-"] .ft img{height:46px}
.k-deco{position:absolute;pointer-events:none;display:block}

/* ================= Evergreen (the brand's own teal, mint, paper and deep green) ================= */
.sch-ever.bg-surface{background:#F6FAF8 repeating-linear-gradient(0deg,rgba(22,29,28,.035) 0 1px,transparent 1px 4px)}
.sch-ever.bg-container{background:radial-gradient(rgba(27,106,99,.16) 2px,transparent 2.5px) 0 0/30px 30px,linear-gradient(165deg,#DDF1EC,#CDEBE5)}
.sch-ever.bg-primary{background:radial-gradient(circle at 88% 8%,rgba(205,235,229,.22),transparent 45%),#1B6A63}
.sch-ever.bg-dark{background:radial-gradient(circle at 12% 92%,rgba(127,200,188,.16),transparent 50%),#0F2F2C}
.board.sch-ever .badge{border-radius:50%;-webkit-mask:none;mask:none}
/* cover: photo inset in a rounded frame */
.sch-ever.ph-on.pos-cover .ph{margin:56px 56px 0;border-radius:28px;flex-basis:46%!important}
/* split: photo down the left half */
.sch-ever.ph-on.pos-b,.sch-ever.ph-on.pos-d{flex-direction:row}
.sch-ever.ph-on.pos-b .ph,.sch-ever.ph-on.pos-d .ph{flex:0 0 44%!important;height:100%}
.sch-ever.ph-on.pos-b .pn,.sch-ever.ph-on.pos-d .pn{padding:120px 64px 170px;justify-content:center}
.sch-ever.ph-on.pos-b .ft,.sch-ever.ph-on.pos-d .ft{left:calc(44% + 64px)}
.sch-ever.ph-on.pos-b .badge,.sch-ever.ph-on.pos-d .badge{top:72px!important;right:64px}
.sch-ever.ph-on.pos-b .hd,.sch-ever.ph-on.pos-d .hd{font-size:76px}
/* photo in a rounded window on the right, text below (pos-a/c) */
.sch-ever.ph-on.pos-a .ph,.sch-ever.ph-on.pos-c .ph{margin:56px 56px 0 auto;width:62%;flex:0 0 40%!important;border-radius:28px 28px 28px 120px}
.sch-ever .ey{display:flex;align-items:center;gap:14px}
.sch-ever.bg-surface .ey::after,.sch-ever.bg-container .ey::after{content:"";width:72px;height:12px;background:${wave("#1B6A63")} 0 50%/24px 12px repeat-x}
.sch-ever.bg-primary .ey::after,.sch-ever.bg-dark .ey::after{content:"";width:72px;height:12px;background:${wave("#7FC8BC")} 0 50%/24px 12px repeat-x}
.sch-ever .k-glyph{font-size:132px;right:80px;bottom:128px;font-variation-settings:"FILL" 0,"wght" 300,"GRAD" 0,"opsz" 48}
.sch-ever.bg-surface .k-glyph{color:#1B6A63}.sch-ever.bg-container .k-glyph{color:#14534D}.sch-ever.bg-primary .k-glyph{color:#CDEBE5}.sch-ever.bg-dark .k-glyph{color:#7FC8BC}
.sch-ever.ph-on.pos-a .k-glyph,.sch-ever.ph-on.pos-c .k-glyph,.sch-ever.ph-on.pos-cover .k-glyph{bottom:auto;top:96px;left:80px;right:auto;font-size:110px}
.sch-ever.ph-on.pos-cover .k-glyph{display:none}

/* ================= Studio Notes ================= */
.sch-notes{background:#F7F2E8 repeating-linear-gradient(0deg,rgba(23,29,28,.035) 0 1px,transparent 1px 4px);color:#171D1C;--k-shape:${COOKIE}}
.sch-notes .ph{margin:64px 64px 0;flex-basis:40%!important;border-radius:22px;border:14px solid #fff;box-shadow:0 2px 0 rgba(23,29,28,.08),0 18px 40px rgba(23,29,28,.12);transform:rotate(-1.2deg);position:relative;z-index:1}
.sch-notes .k-tape{width:180px;height:46px;background:rgba(246,231,168,.85);top:44px;left:50%;margin-left:-90px;transform:rotate(-3deg);z-index:2;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.sch-notes .pn{margin:44px 64px 150px;padding:60px 60px 56px;border-radius:28px;background:var(--note);transform:rotate(.7deg);flex:0 1 auto;justify-content:flex-start;position:relative}
.sch-notes.full .pn{margin-top:auto;margin-bottom:auto;padding:72px 64px 64px;transform:translateY(-40px) rotate(-.6deg)}
.sch-notes.pos-a{--note:#F6E7A8}.sch-notes.pos-b{--note:#E2DCF6}.sch-notes.pos-c{--note:#F8D5C3}.sch-notes.pos-d{--note:#D3E8E5}
.sch-notes.pos-cover{--note:#FFFFFF}.sch-notes.pos-last{--note:#007369}
/* polaroid placement: small tilted photo pinned over the note */
.sch-notes.ph-on.pos-b,.sch-notes.ph-on.pos-d{justify-content:center}
.sch-notes.ph-on.pos-b .ph,.sch-notes.ph-on.pos-d .ph{position:absolute;top:70px;right:70px;width:430px;height:520px;margin:0;flex:none;transform:rotate(4deg);border-width:16px 16px 70px}
.sch-notes.ph-on.pos-b .k-tape,.sch-notes.ph-on.pos-d .k-tape{left:auto;right:225px;top:52px;transform:rotate(6deg)}
.sch-notes.ph-on.pos-b .pn,.sch-notes.ph-on.pos-d .pn{margin:520px 64px 150px 64px}
.sch-notes .hd{font-family:"Romie",Georgia,serif;font-weight:400;letter-spacing:-.025em;line-height:1.02;font-size:88px;color:#171D1C}
.sch-notes.full .hd{font-size:104px}.sch-notes.ph-on .hd{font-size:76px}
.sch-notes .hd em{font-style:normal;text-decoration-color:#007369;text-decoration-thickness:4px}
.sch-notes .ey{font:900 30px/1 "Elza Condensed","Arial Narrow",sans-serif;letter-spacing:.07em;color:#007369}
.sch-notes .sb{font-size:31px;color:#3A4542;margin-top:28px}.sch-notes .src{color:#3A4542}
.sch-notes .badge{background:#007369;color:#fff;width:132px;height:132px;top:70px;right:84px}
.sch-notes.ph-on .badge{top:calc(40% + 30px);right:72px;transform:rotate(8deg)}
.sch-notes.ph-on.pos-b .badge,.sch-notes.ph-on.pos-d .badge{top:500px;left:84px;right:auto}
.sch-notes .cta{background:#171D1C;color:#F7F2E8}
.sch-notes .ft{color:#3A4542}
.sch-notes .k-glyph{font-size:64px;color:#007369;top:-34px;right:40px;width:96px;height:96px;display:grid;place-items:center;background:#fff;border-radius:50%;box-shadow:0 6px 16px rgba(23,29,28,.12);transform:rotate(-8deg)}
.sch-notes.pos-last .hd,.sch-notes.pos-last .sb,.sch-notes.pos-last .src{color:#fff}.sch-notes.pos-last .ey{color:#B1F2E9}
.sch-notes.pos-last .hd em{text-decoration-color:#F6E7A8}.sch-notes.pos-last .cta{background:#F6E7A8;color:#171D1C}

/* ================= Deep Field (navy) ================= */
.sch-field{background:#0C151C repeating-linear-gradient(0deg,rgba(255,255,255,.03) 0 1px,transparent 1px 4px);color:#E6EEF6;--k-shape:${FLOWER}}
.sch-field.pos-a{background-color:#0F1D29}.sch-field.pos-b{background-color:#132636}.sch-field.pos-c{background-color:#0F1D29}.sch-field.pos-d{background-color:#0C151C}
.sch-field.pos-last{background:#0B3351 radial-gradient(circle at 85% 12%,rgba(170,203,234,.28),transparent 55%)}
.sch-field .ph{background-color:#1D3A52;background-blend-mode:luminosity;flex-basis:50%!important;position:relative;-webkit-mask:linear-gradient(#000 70%,transparent);mask:linear-gradient(#000 70%,transparent)}
/* full-bleed cover: photo behind the type */
.sch-field.ph-on.pos-cover{justify-content:flex-end}
.sch-field.ph-on.pos-cover .ph{position:absolute;inset:0;flex:none;-webkit-mask:none;mask:none;background-blend-mode:normal;filter:saturate(.75)}
.sch-field.ph-on.pos-cover::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,21,28,.05) 20%,rgba(12,21,28,.78) 52%,#0C151C 78%);z-index:1}
.sch-field.ph-on.pos-cover .pn{flex:none;padding:0 84px 170px}
/* split: photo down the right half */
.sch-field.ph-on.pos-b,.sch-field.ph-on.pos-d{flex-direction:row-reverse}
.sch-field.ph-on.pos-b .ph,.sch-field.ph-on.pos-d .ph{flex:0 0 44%!important;height:100%;-webkit-mask:linear-gradient(270deg,#000 75%,transparent);mask:linear-gradient(270deg,#000 75%,transparent)}
.sch-field.ph-on.pos-b .pn,.sch-field.ph-on.pos-d .pn{padding:120px 40px 170px 84px;justify-content:center}
.sch-field.ph-on.pos-b .badge,.sch-field.ph-on.pos-d .badge{top:72px!important;left:84px;right:auto}
.sch-field .pn{padding:40px 84px 0}
.sch-field.full .pn{padding:0 84px 160px}
.sch-field .hd{font:700 104px/.98 "IvyPresto Display",Georgia,serif;letter-spacing:-.035em;color:#F4F8FC}
.sch-field.full .hd{font-size:128px}.sch-field.ph-on .hd{font-size:86px}
.sch-field .hd em{color:#E2DCF6;text-decoration-color:#AACBEA}
.sch-field .ey{font:700 24px/1 Inter,system-ui,sans-serif;letter-spacing:.24em;color:#AACBEA}
.sch-field .sb{color:#B8C7D6}.sch-field .src{color:#AACBEA}
.sch-field .badge{background:#E2DCF6;color:#0B3351;width:124px;height:124px}
.sch-field .cta{background:#E2DCF6;color:#0B3351}
.sch-field .ft{color:#AACBEA}
.sch-field .k-glyph{font-size:460px;color:rgba(170,203,234,.09);right:-60px;bottom:110px;font-variation-settings:"FILL" 1,"wght" 400,"GRAD" 0,"opsz" 48;z-index:0}
.sch-field.ph-on .k-glyph{bottom:auto;top:auto;font-size:140px;color:#AACBEA;right:84px;bottom:150px;font-variation-settings:"FILL" 0,"wght" 300,"GRAD" 0,"opsz" 48;z-index:2}
.sch-field.ph-on.pos-cover .k-glyph{display:none}
.sch-field.ph-on.pos-b .k-glyph,.sch-field.ph-on.pos-d .k-glyph{right:auto;left:84px;bottom:170px;font-size:110px}

/* ================= Poster (star yellow, ink, sand) ================= */
.sch-poster{color:#171D1C;--k-shape:${BURST};background:#F2B01E}
.sch-poster.pos-cover{background:#F2B01E}
.sch-poster.pos-a,.sch-poster.pos-c{background:#171D1C;color:#F7F2E8}
.sch-poster.pos-b,.sch-poster.pos-d{background:#F6E7A8}
.sch-poster.pos-last{background:#171D1C;color:#F7F2E8}
.sch-poster .k-blob{width:760px;height:760px;right:-260px;top:-220px;background:currentColor;opacity:.07;-webkit-mask:${COOKIE};mask:${COOKIE};transform:rotate(18deg)}
.sch-poster .ph{flex-basis:44%!important;border-bottom:18px solid #171D1C}
.sch-poster.pos-a .ph,.sch-poster.pos-c .ph{border-bottom-color:#F2B01E}
/* shape-cut photo: cookie/clover mask, top-right */
.sch-poster.ph-on.pos-cover .ph,.sch-poster.ph-on.pos-b .ph,.sch-poster.ph-on.pos-d .ph{position:absolute;flex:none;border:0;width:640px;height:640px;top:56px;right:56px;-webkit-mask:${CLOVER};mask:${CLOVER}}
.sch-poster.ph-on.pos-b .ph{-webkit-mask:${COOKIE};mask:${COOKIE}}
.sch-poster.ph-on.pos-cover .pn,.sch-poster.ph-on.pos-b .pn,.sch-poster.ph-on.pos-d .pn{padding:0 72px 170px;justify-content:flex-end;flex:1}
.sch-poster.ph-on.pos-cover .badge,.sch-poster.ph-on.pos-b .badge,.sch-poster.ph-on.pos-d .badge{top:72px!important;left:72px;right:auto}
.sch-poster .pn{padding:56px 72px 0}
.sch-poster.full .pn{padding:0 72px 170px;justify-content:flex-end}
.sch-poster .hd{font:900 140px/.88 "Elza Condensed","Arial Narrow",sans-serif;letter-spacing:.005em;text-transform:uppercase;max-width:940px}
.sch-poster.full .hd{font-size:176px}.sch-poster.ph-on .hd{font-size:112px}
.sch-poster .hd em{font-style:normal;text-decoration:underline wavy #171D1C;text-decoration-thickness:6px;text-underline-offset:.12em}
.sch-poster.pos-a .hd em,.sch-poster.pos-c .hd em,.sch-poster.pos-last .hd em{text-decoration-color:#F2B01E}
.sch-poster .ey{font:700 italic 46px/1 "IvyPresto Display",Georgia,serif;letter-spacing:-.01em;text-transform:none;margin-bottom:22px;color:inherit;opacity:.9}
.sch-poster .sb{font-weight:600;font-size:32px;max-width:860px}
.sch-poster .badge{background:#171D1C;color:#F2B01E;width:168px;height:168px;font-size:58px;top:48px;right:56px}
.sch-poster.pos-a .badge,.sch-poster.pos-c .badge,.sch-poster.pos-last .badge{background:#F2B01E;color:#171D1C}
.sch-poster.ph-on .badge{top:calc(44% - 70px)}
.sch-poster .cta{background:#171D1C;color:#F2B01E}
.sch-poster.pos-a .cta,.sch-poster.pos-c .cta,.sch-poster.pos-last .cta{background:#F2B01E;color:#171D1C}
.sch-poster .ft{border-top:4px solid currentColor;padding-top:22px;left:72px;right:72px;bottom:48px}
.sch-poster .k-glyph{font-size:120px;right:72px;top:72px;font-variation-settings:"FILL" 1,"wght" 600,"GRAD" 0,"opsz" 48;z-index:2}
.sch-poster.ph-on .k-glyph{display:none}
.sch-poster .badge ~ .k-glyph{top:250px}

/* ================= Coastline ================= */
.sch-coast{background:#CFE6FB;color:#171D1C;--k-shape:${CLOVER};padding:48px}
.sch-coast.pos-a,.sch-coast.pos-c{background:#B1F2E9}.sch-coast.pos-b{background:#CFE6FB}.sch-coast.pos-d{background:#D3E8E5}
.sch-coast.pos-last{background:#244A6A}
.sch-coast .ph{flex-basis:40%!important;border-radius:36px 36px 0 0}
.sch-coast .pn{background:#F4FBFA;border-radius:48px;padding:56px 64px 150px;flex:1;position:relative}
.sch-coast.ph-on .pn{border-radius:0 0 48px 48px}
/* photo at the bottom of the card */
.sch-coast.ph-on.pos-b,.sch-coast.ph-on.pos-d{flex-direction:column-reverse}
.sch-coast.ph-on.pos-b .ph,.sch-coast.ph-on.pos-d .ph{border-radius:0 0 36px 36px;flex-basis:38%!important}
.sch-coast.ph-on.pos-b .pn,.sch-coast.ph-on.pos-d .pn{border-radius:48px 48px 0 0;padding:72px 64px 40px}
.sch-coast.ph-on.pos-b .ft,.sch-coast.ph-on.pos-d .ft{bottom:72px;color:#fff;left:96px;right:96px}
.sch-coast.ph-on.pos-b .badge,.sch-coast.ph-on.pos-d .badge{top:96px!important}
.sch-coast.full .pn{justify-content:center;padding:64px 64px 170px}
.sch-coast .hd{font:700 90px/1.02 "IvyPresto Display",Georgia,serif;letter-spacing:-.025em;color:#171D1C}
.sch-coast.full .hd{font-size:108px}.sch-coast.ph-on .hd{font-size:76px}
.sch-coast .hd em{text-decoration-color:#007369}
.sch-coast .ey{color:#3C6284;font:700 24px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;padding-bottom:26px;background:${wave("#3C6284")} left bottom/96px 14px no-repeat;display:flex;align-items:center;gap:14px}
.sch-coast .sb{color:#3A4542}
.sch-coast .badge{background:#3C6284;color:#fff;width:128px;height:128px;top:96px;right:112px}
.sch-coast.ph-on .badge{top:calc(40% + 10px)}
.sch-coast .cta{background:#3C6284;color:#fff}
.sch-coast .ft{left:112px;right:112px;bottom:100px;color:#3C6284}
.sch-coast .k-wave{left:0;right:0;bottom:0;height:40px;background:${wave("rgba(60,98,132,.35)")} 0 50%/80px 40px repeat-x}
.sch-coast.pos-last .k-wave{background-image:${wave("rgba(207,230,251,.5)")}}
.sch-coast .k-glyph{position:static;font-size:40px;color:#3C6284;order:-1}

/* ================= Layouts for new pages ================= */
.board.lay-type .hd{font-size:132px;max-width:920px}
.board.lay-stat .stat{font:700 300px/.86 "IvyPresto Display",Georgia,serif;letter-spacing:-.05em;margin:0 0 24px}
.board.lay-stat .hd{font-size:72px}
.board.lay-quote .hd{font-style:italic;font-size:86px}.board.lay-quote .hd::before{content:"\\201C";display:block;font-size:240px;line-height:.62;margin-bottom:6px}
.board.lay-split{flex-direction:row}.board.lay-split .ph{flex:0 0 46%;height:100%}.board.lay-split .pn{padding:96px 64px 160px;justify-content:center}
.board.lay-split .ft{left:calc(46% + 64px)}.board.lay-split .badge{top:56px!important;right:56px}.board.lay-split .hd{font-size:80px}

/* ================= PDF pages ================= */
@page{size:1080px 1350px;margin:0}
body.k-pdf{margin:0;background:#fff}
body.k-pdf .board,body.k-pdf .board *{box-shadow:none!important;filter:none!important}
.k-page{width:1080px;height:1350px;overflow:hidden;position:relative;break-after:page;page-break-after:always}
.k-page:last-child{break-after:auto;page-break-after:auto}
.k-page>.board{transform:none!important;position:relative}
`;
  const DARK_LOGO = { notes: () => false, field: () => true, poster: (pos) => pos === "pos-a" || pos === "pos-c" || pos === "pos-last", coast: (pos) => pos === "pos-last" && false };

  function injectCss() {
    if (document.getElementById("ovxs-kit-css")) return;
    const st = document.createElement("style");
    st.id = "ovxs-kit-css";
    st.textContent = css;
    document.head.appendChild(st);
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&display=block";
    document.head.appendChild(l);
  }

  // style=evergreen given on purpose → the Evergreen scheme; no style at all → the page exactly as written.
  const explicitStyle = () => new URLSearchParams(location.search).get("style") === "evergreen";
  // Designs a slide can wear, independent of its content: cover, a, b, c, d, last.
  const LOOKS = ["cover", "a", "b", "c", "d", "last"];
  const EVER_BG = { cover: "bg-primary", a: "bg-container", b: "bg-surface", c: "bg-dark", d: "bg-primary", last: "bg-dark" };
  function params() {
    const P = new URLSearchParams(location.search);
    const order = (P.get("order") || "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0);
    const style = STYLES.includes(P.get("style")) ? P.get("style") : "evergreen";
    const photo = P.get("photo") || "";
    const look = LOOKS.includes(P.get("look")) ? P.get("look") : "";
    return { P, order, style, look, photo: PHOTO_RE.test(photo) ? photo : "" };
  }

  // el: the exported board; id: "li-graphic" or "slide-N"; slides: the page's slides array (optional).
  function apply(el, id, slides, photoOverride, lookOverride) {
    if (!el) return;
    injectCss();
    const { order, style, photo: urlPhoto, look: urlLook } = params();
    const look = lookOverride !== undefined ? (LOOKS.includes(lookOverride) ? lookOverride : "") : urlLook;
    const photo = photoOverride !== undefined ? photoOverride : urlPhoto;
    if (photo) el.querySelectorAll(".ph").forEach((p) => { p.style.backgroundImage = `url("${photo}")`; });
    const m = /^slide-(\d+)$/.exec(id);
    const total = slides ? slides.length : 8;
    const seq = order.length ? order : Array.from({ length: total }, (_, i) => i + 1);
    let pos = 1, slide = null;
    if (m) {
      const n = Number(m[1]);
      slide = slides ? slides[n - 1] : null;
      pos = Math.max(1, seq.indexOf(n) + 1);
      const ft = el.querySelector(".ft span");
      if (ft) ft.textContent = ft.textContent.replace(/\d+\s*\/\s*\d+\s*$/, `${pos}/${seq.length}`);
      const badge = el.querySelector(".badge");
      if (badge && slides) {
        const numbered = seq.filter((k) => slides[k - 1] && slides[k - 1].n);
        const idx = numbered.indexOf(n);
        if (idx >= 0) badge.textContent = String(idx + 1).padStart(2, "0");
      }
    }
    if (style === "evergreen" && !explicitStyle()) return;
    const posClass = look ? "pos-" + (look === "last" ? "last" : look) : !m || pos === 1 ? "pos-cover" : pos === seq.length ? "pos-last" : ["pos-a", "pos-b", "pos-c", "pos-d"][(pos - 2) % 4];
    if (style === "evergreen") {
      if (look) { for (const c of [...el.classList]) if (c.startsWith("bg-")) el.classList.remove(c); el.classList.add(EVER_BG[look]); }
      if (look) { const lg = el.querySelector(".ft img"), dark = /primary|dark/.test(EVER_BG[look]); if (lg) lg.src = lg.getAttribute("src").replace(/ovxs-logo(-white)?\.svg/, dark ? "ovxs-logo-white.svg" : "ovxs-logo.svg"); }
      el.classList.add("sch-ever", posClass);
      decorate(el, style, slide);
      fit(el);
      return;
    }
    for (const c of [...el.classList]) if (c.startsWith("bg-")) el.classList.remove(c);
    el.classList.add("sch-" + style, posClass);
    if (!el.classList.contains("ph-on") && !el.querySelector(".ph")) el.classList.add("full");
    decorate(el, style, slide);
    const logo = el.querySelector(".ft img");
    if (logo) logo.src = logo.getAttribute("src").replace(/ovxs-logo(-white)?\.svg/, DARK_LOGO[style](posClass) ? "ovxs-logo-white.svg" : "ovxs-logo.svg");
    fit(el);
  }

  function decorate(el, style, slide) {
    const add = (cls, parent) => { const i = document.createElement("i"); i.className = "k-deco " + cls; (parent || el).appendChild(i); return i; };
    if (style === "notes" && el.querySelector(".ph")) add("k-tape");
    if (style === "poster") el.insertBefore(Object.assign(document.createElement("i"), { className: "k-deco k-blob" }), el.firstChild);
    if (style === "coast") add("k-wave");
    const icon = pickIcon(slide, el);
    if (!icon || el.querySelector(".cta")) return;
    const g = document.createElement("span");
    g.className = "k-glyph";
    g.textContent = icon;
    g.setAttribute("aria-hidden", "true");
    if (style === "coast") el.querySelector(".ey")?.prepend(g);
    else if (style === "notes") el.querySelector(".pn")?.appendChild(g);
    else el.appendChild(g);
  }

  // Shrink the headline until the panel's content clears the footer (long headlines in big schemes).
  function fit(el) {
    const hd = el.querySelector(".hd"), pn = el.querySelector(".pn"), ft = el.querySelector(".ft");
    if (!hd || !pn) return;
    const limit = () => (ft ? ft.getBoundingClientRect().top - 28 : el.getBoundingClientRect().bottom - 40);
    const bottom = () => Math.max(...[...pn.children].filter((c) => !c.classList.contains("k-glyph")).map((c) => c.getBoundingClientRect().bottom), pn.scrollHeight > pn.clientHeight + 2 ? 99999 : 0);
    let size = parseFloat(getComputedStyle(hd).fontSize);
    for (let i = 0; i < 16 && bottom() > limit(); i++) { size *= 0.93; hd.style.fontSize = size + "px"; }
  }

  // PDF mode: switch the page to its normal render, then lay the chosen graphics out as pages.
  (function pdfMode() {
    const P = new URLSearchParams(location.search);
    if (P.get("export") !== "pdf") return;
    const pages = (P.get("pages") || "").split(",").filter((p) => /^(li-graphic|slide-\d{1,2})$/.test(p));
    P.delete("export");
    history.replaceState(null, "", "?" + P.toString());
    document.addEventListener("DOMContentLoaded", () => {
      const slides = typeof window.__ovxsSlides !== "undefined" ? window.__ovxsSlides : (function () { try { return eval("slides"); } catch (e) { return null; } })();
      const els = pages.map((id) => [id, document.getElementById(id)]).filter(([, el]) => el);
      document.body.className = "k-pdf";
      document.body.replaceChildren(...els.map(([id, el]) => {
        const page = document.createElement("div");
        page.className = "k-page";
        el.style.transform = "none";
        page.appendChild(el);
        return page;
      }));
      for (const [id, el] of els) {
        const ph = P.get("ph." + id) || "";
        apply(el, id, slides, PHOTO_RE.test(ph) ? ph : "", P.get("lk." + id) || "");
        flattenMasks(el);
      }
    });
  })();

  // PDF printing drops CSS masks, so turn them into vector clip paths and gradient overlays.
  let clipN = 0;
  function flattenMasks(root) {
    const NS = "http://www.w3.org/2000/svg";
    for (const node of [root, ...root.querySelectorAll("*")]) {
      const cs = getComputedStyle(node);
      const mask = cs.webkitMaskImage || cs.maskImage || "none";
      if (!mask || mask === "none") continue;
      const r = node.getBoundingClientRect(), w = node.offsetWidth || r.width, h = node.offsetHeight || r.height;
      if (mask.includes("linear-gradient")) {
        const bg = getComputedStyle(node.closest(".board")).backgroundColor;
        const overlay = mask.replace(/rgba\(0, 0, 0, 0\)|transparent/g, "__BG__").replace(/rgb\(0, 0, 0\)/g, "transparent").replace(/__BG__/g, bg);
        node.style.webkitMask = node.style.mask = "none";
        const o = document.createElement("i");
        o.style.cssText = `position:absolute;inset:0;background:${overlay};pointer-events:none`;
        if (getComputedStyle(node).position === "static") node.style.position = "relative";
        node.appendChild(o);
        continue;
      }
      const dm = /d=(?:'|%27)([^'%]+?)(?:'|%27)/.exec(decodeURIComponent(mask));
      if (!dm) continue;
      const d = dm[1], id = "kclip" + (++clipN);
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("width", w); svg.setAttribute("height", h); svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.cssText = "position:absolute;left:0;top:0;overflow:visible;pointer-events:none";
      const g = `transform="scale(${w / 100} ${h / 100})"`;
      const img = /url\("?([^")]+)"?\)/.exec(cs.backgroundImage || "");
      if (img && !cs.backgroundImage.includes("gradient")) {
        svg.innerHTML = `<defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${d}" ${g}/></clipPath></defs><image href="${img[1]}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
      } else {
        svg.innerHTML = `<path d="${d}" ${g} fill="${cs.backgroundColor}"/>`;
      }
      node.style.webkitMask = node.style.mask = "none";
      node.style.background = "transparent";
      if (cs.position === "static") node.style.position = "relative";
      node.insertBefore(svg, node.firstChild);
      for (const c of [...node.childNodes]) {
        if (c === svg) continue;
        if (c.nodeType === 3 && c.textContent.trim()) { const sp = document.createElement("span"); sp.style.position = "relative"; sp.textContent = c.textContent; node.replaceChild(sp, c); }
        else if (c.nodeType === 1 && getComputedStyle(c).position === "static") c.style.position = "relative";
      }
    }
  }

  window.OVXSKit = { apply, STYLES };
})();
