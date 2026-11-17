/* Studio OVXS carousel kit — shared by every topics/<folder>/page.html.
 * In export mode (?export=<id>) it applies:
 *   order=3,1,2…   slide numbers (1-based, as written in page.html) in the order to show; slides left out are dropped.
 *                  Footer "n/total" and step badges (01, 02…) are renumbered to match.
 *   style=evergreen|night|editorial|neon|grid   a look built only from the Studio OVXS design system.
 *   accent=teal|mint|magenta|green|blue|red     accent for underlines, eyebrows, badges and CTA (neon defaults to green).
 *   photo=<https://images.unsplash.com/… | https://images.pexels.com/… | assets/file.jpg>  photo for this graphic.
 * New pages may also give a slide `lay`: "type" (no photo, huge headline), "stat" (giant figure in s.stat),
 * "quote" (big pull quote) or "split" (photo left half). See .claude/skills/content/page-spec.md.
 */
(function () {
  const STYLES = ["evergreen", "night", "editorial", "neon", "grid"];
  const ACCENTS = {
    teal:    { main: "#1B6A63", dark: "#7FC8BC", light: "#1B6A63", on: "#FFFFFF" },
    mint:    { main: "#7FC8BC", dark: "#7FC8BC", light: "#14534D", on: "#0F2F2C" },
    magenta: { main: "#E03CF0", dark: "#F08AF8", light: "#A21CAF", on: "#FFFFFF" },
    green:   { main: "#2BFF2B", dark: "#2BFF2B", light: "#15803D", on: "#06210A" },
    blue:    { main: "#1F3BFF", dark: "#9AA8FF", light: "#1F3BFF", on: "#FFFFFF" },
    red:     { main: "#FF3B30", dark: "#FF8A80", light: "#C62828", on: "#FFFFFF" }
  };
  // Role per style: [cover, body slides cycle…, last slide]. Each role is dark or light.
  const ROLES = {
    night:     { cover: "k-night-deep", cycle: ["k-night", "k-night-teal"], last: "k-night-deep" },
    editorial: { cover: "k-ink", cycle: ["k-paper"], last: "k-ink" },
    neon:      { cover: "k-neon", cycle: ["k-neon-2", "k-neon"], last: "k-neon" },
    grid:      { cover: "k-grid-teal", cycle: ["k-grid-paper", "k-grid-mint"], last: "k-grid-teal" }
  };
  const DARK = new Set(["bg-primary", "bg-dark", "k-night-deep", "k-night", "k-night-teal", "k-ink", "k-neon", "k-neon-2", "k-grid-teal"]);
  const PHOTO_RE = /^(https:\/\/images\.(unsplash|pexels)\.com\/[^"'()\s]+|assets\/[\w.-]+)$/;

  const css = `
.k-night-deep{background:#0B1F1D;color:#E6F2EF}.k-night{background:#0F2F2C;color:#E6F2EF}.k-night-teal{background:#123E3A;color:#E6F2EF}
.k-night-deep .ey,.k-night .ey,.k-night-teal .ey{color:#7FC8BC}.k-night-deep .hd em,.k-night .hd em,.k-night-teal .hd em{text-decoration-color:#7FC8BC}
.k-night-deep .badge,.k-night .badge,.k-night-teal .badge{background:#7FC8BC;color:#0F2F2C}.k-night-deep .cta,.k-night .cta,.k-night-teal .cta{background:#7FC8BC;color:#0F2F2C}
.k-ink{background:#161D1C;color:#F4F1EA}.k-ink .ey{color:#B9C9C5}.k-ink .hd em{text-decoration-color:#7FC8BC}.k-ink .badge{background:#F4F1EA;color:#161D1C}.k-ink .cta{background:#F4F1EA;color:#161D1C}
.k-paper{background:#FBFAF7;color:#161D1C}.k-paper .ey{color:#1B6A63}.k-paper .hd em{text-decoration-color:#1B6A63}.k-paper .badge{background:#161D1C;color:#FBFAF7}.k-paper .cta{background:#161D1C;color:#FBFAF7}
.k-style-editorial .hd{letter-spacing:-.035em}.k-style-editorial .ey{letter-spacing:.22em}
.k-neon{background:#0A0F0E;color:#F2F5F4}.k-neon-2{background:#111A18;color:#F2F5F4}
.k-grid-paper{background:#F6FAF8 repeating-linear-gradient(0deg,rgba(22,29,28,.035) 0 1px,transparent 1px 4px);color:#161D1C}
.k-grid-mint{background:radial-gradient(rgba(27,106,99,.22) 2px,transparent 2.5px) 0 0/28px 28px,linear-gradient(160deg,#DDF1EC,#CDEBE5);color:#161D1C}
.k-grid-teal{background:radial-gradient(rgba(255,255,255,.14) 2px,transparent 2.5px) 0 0/28px 28px,#1B6A63;color:#FFFFFF}
.k-grid-paper .ey,.k-grid-mint .ey{color:#14534D}.k-grid-paper .hd em,.k-grid-mint .hd em{text-decoration-color:#1B6A63}.k-grid-teal .ey{color:#CDEBE5}.k-grid-teal .hd em{text-decoration-color:#7FC8BC}
.k-grid-paper .badge,.k-grid-mint .badge{background:#1B6A63;color:#fff}.k-grid-teal .badge{background:#fff;color:#1B6A63}.k-grid-teal .cta{background:#fff;color:#1B6A63}.k-grid-paper .cta,.k-grid-mint .cta{background:#1B6A63;color:#fff}
.k-style-grid .badge{border-radius:0;clip-path:polygon(50% 0,61% 12%,75% 6%,78% 21%,93% 25%,88% 39%,100% 50%,88% 61%,93% 75%,78% 79%,75% 94%,61% 88%,50% 100%,39% 88%,25% 94%,22% 79%,7% 75%,12% 61%,0 50%,12% 39%,7% 25%,22% 21%,25% 6%,39% 12%)}
.k-acc.k-is-dark .ey{color:var(--a-dark)}.k-acc.k-is-dark .hd em{text-decoration-color:var(--a-dark)}
.k-acc.k-is-light .ey{color:var(--a-light)}.k-acc.k-is-light .hd em{text-decoration-color:var(--a-light)}
.k-acc .badge,.k-acc .cta{background:var(--a-main);color:var(--a-on)}
.board.lay-type .hd{font-size:132px;max-width:920px}
.board.lay-stat .stat{font:700 300px/.86 var(--serif);letter-spacing:-.05em;margin:0 0 24px}
.board.lay-stat .hd{font-size:72px}
.board.lay-quote .hd{font-style:italic;font-size:86px}.board.lay-quote .hd::before{content:"\\201C";display:block;font-size:240px;line-height:.62;margin-bottom:6px}
.board.lay-split{flex-direction:row}.board.lay-split .ph{flex:0 0 46%;height:100%}.board.lay-split .pn{padding:96px 64px 160px;justify-content:center}
.board.lay-split .ft{left:calc(46% + 64px)}.board.lay-split .badge{top:56px!important;right:56px}.board.lay-split .hd{font-size:80px}
`;
  function injectCss() {
    if (document.getElementById("ovxs-kit-css")) return;
    const st = document.createElement("style");
    st.id = "ovxs-kit-css";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function params() {
    const P = new URLSearchParams(location.search);
    const order = (P.get("order") || "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0);
    const style = STYLES.includes(P.get("style")) ? P.get("style") : "evergreen";
    let accent = ACCENTS[P.get("accent")] ? P.get("accent") : "";
    if (style === "neon" && !accent) accent = "green";
    const photo = P.get("photo") || "";
    return { order, style, accent, photo: PHOTO_RE.test(photo) ? photo : "" };
  }

  function restyle(board, role, style, accent) {
    if (role) {
      for (const c of [...board.classList]) if (c.startsWith("bg-")) board.classList.remove(c);
      board.classList.add(role);
    }
    const bgClass = [...board.classList].find((c) => c.startsWith("bg-") || c.startsWith("k-night") || c === "k-ink" || c === "k-paper" || c.startsWith("k-neon") || c.startsWith("k-grid"));
    const dark = DARK.has(bgClass);
    board.classList.add(dark ? "k-is-dark" : "k-is-light", "k-style-" + style);
    if (accent) {
      const a = ACCENTS[accent];
      board.classList.add("k-acc");
      board.style.setProperty("--a-main", a.main); board.style.setProperty("--a-dark", a.dark);
      board.style.setProperty("--a-light", a.light); board.style.setProperty("--a-on", a.on);
    }
    const logo = board.querySelector(".ft img");
    if (logo) logo.src = logo.getAttribute("src").replace(/ovxs-logo(-white)?\.svg/, dark ? "ovxs-logo-white.svg" : "ovxs-logo.svg");
  }

  // el: the exported board; id: "li-graphic" or "slide-N"; slides: the page's slides array (optional).
  function apply(el, id, slides) {
    if (!el) return;
    injectCss();
    const { order, style, accent, photo } = params();
    if (photo) el.querySelectorAll(".ph").forEach((p) => { p.style.backgroundImage = `url("${photo}")`; });
    const m = /^slide-(\d+)$/.exec(id);
    const total = slides ? slides.length : 8;
    const seq = order.length ? order : Array.from({ length: total }, (_, i) => i + 1);
    let role = null;
    if (m) {
      const n = Number(m[1]);
      const pos = Math.max(1, seq.indexOf(n) + 1);
      const ft = el.querySelector(".ft span");
      if (ft) ft.textContent = ft.textContent.replace(/\d+\s*\/\s*\d+\s*$/, `${pos}/${seq.length}`);
      const badge = el.querySelector(".badge");
      if (badge && slides) {
        const numbered = seq.filter((k) => slides[k - 1] && slides[k - 1].n);
        const idx = numbered.indexOf(n);
        if (idx >= 0) badge.textContent = String(idx + 1).padStart(2, "0");
      }
      const R = ROLES[style];
      if (R) role = pos === 1 ? R.cover : pos === seq.length ? R.last : R.cycle[(pos - 2) % R.cycle.length];
    } else if (ROLES[style]) {
      role = ROLES[style].cover;
    }
    restyle(el, role, style, accent);
  }

  window.OVXSKit = { apply, STYLES, ACCENTS: Object.keys(ACCENTS) };
})();
