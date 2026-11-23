#!/usr/bin/env node
// OVXS photo helper: a tiny local MCP server (stdio) the Content Desk calls for instant "Generate".
// generate_photo: search Unsplash for a keyword, render that one slide with the top unused
// photo, and return the image. render_slide, render_layers (parts for motion
// video) and export_pdf make the other graphics. The Unsplash key stays on this Mac (.env); nothing in the repo changes.
//
// Setup, once per Mac: Claude app → Settings → Developer → Edit Config, add inside the outer { }:
//   "mcpServers": {
//     "ovxs-photos": {
//       "command": "/bin/zsh",
//       "args": ["-lc", "exec node \"$HOME/WORK/STUDIO/ovxs-marketing/scripts/photo-helper.mjs\""]
//     }
//   }
// then quit (Cmd+Q) and reopen the app. $HOME and a login shell keep it working on any Mac.
import { readFileSync, existsSync, readdirSync, mkdtempSync, rmSync } from "node:fs";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TOPIC_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]{1,80}$/;
const SLOT_RE = /^(li-graphic|slide-(10|[1-9]))$/;
const STYLES = ["evergreen", "notes", "field", "poster", "coast"];
const LOOKS = ["cover", "a", "b", "c", "d", "last"];
const ACCENTS = ["teal", "mint", "magenta", "green", "blue", "red"];
const PHOTO_RE = /^(https:\/\/images\.(unsplash|pexels)\.com\/[^"'()\s]+|assets\/[\w.-]+)$/;

function lookQuery({ order, style, accent, look } = {}) {
  const q = [];
  const o = (Array.isArray(order) ? order : []).map(Number).filter((n) => Number.isInteger(n) && n > 0 && n <= 20).slice(0, 20);
  if (o.length) q.push(`order=${o.join(",")}`);
  if (STYLES.includes(style)) q.push(`style=${style}`);
  if (ACCENTS.includes(accent)) q.push(`accent=${accent}`);
  if (LOOKS.includes(look)) q.push(`look=${look}`);
  return q.length ? "&" + q.join("&") : "";
}

const urlCache = new Map();
async function resolvePhoto(photo, topic) {
  const p = String(photo || "").trim();
  if (!p) return "";
  if (PHOTO_RE.test(p)) return p;
  const m = /^(unsplash|pexels):([\w-]{1,40})$/.exec(p);
  if (!m) throw new Error("Unknown photo");
  // Already downloaded for this topic? Use the local file (no API call).
  if (topic && TOPIC_RE.test(topic)) {
    const cf = join(root, "topics", topic, "assets", "credits.json");
    if (existsSync(cf)) { try { const c = JSON.parse(readFileSync(cf, "utf8")).find((x) => x.id === m[2] && /^[\w.-]+$/.test(x.file || "")); if (c) return `assets/${c.file}`; } catch {} }
  }
  if (!urlCache.has(p)) {
    const { stdout } = await run("node", [join(root, "scripts/stock.mjs"), "url", m[1], m[2]], { cwd: root, timeout: 20000 });
    urlCache.set(p, JSON.parse(stdout).image);
  }
  return urlCache.get(p);
}

async function shoot(topic, slot, extra) {
  const dir = mkdtempSync(join(tmpdir(), "ovxs-photo-"));
  try {
    const png = join(dir, "shot.png"), jpg = join(dir, "shot.jpg");
    const url = `file://${join(root, "topics", topic, "page.html")}?export=${slot}${extra}`;
    await run(CHROME, ["--headless=new", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1080,1350", "--virtual-time-budget=8000", `--user-data-dir=${join(dir, "chrome")}`, `--screenshot=${png}`, url], { timeout: 60000 });
    await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "88", png, "--out", jpg], { timeout: 20000 });
    return readFileSync(jpg).toString("base64");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function checkTarget(topic, slot) {
  if (!TOPIC_RE.test(String(topic)) || !existsSync(join(root, "topics", topic, "page.html"))) throw new Error("Unknown topic");
  if (!SLOT_RE.test(String(slot))) throw new Error("Unknown slot");
}

async function exportPdf(args) {
  const topic = String(args.topic || "");
  if (!TOPIC_RE.test(topic) || !existsSync(join(root, "topics", topic, "page.html"))) throw new Error("Unknown topic");
  const pages = (Array.isArray(args.pages) ? args.pages : []).map(String).filter((p) => SLOT_RE.test(p)).slice(0, 12);
  if (!pages.length) throw new Error("No pages");
  let extra = `&pages=${pages.join(",")}` + lookQuery({ order: args.order, style: args.style });
  const photos = args.photos && typeof args.photos === "object" ? args.photos : {};
  for (const id of pages) { const u = await resolvePhoto(photos[id], topic); if (u) extra += `&ph.${id}=${encodeURIComponent(u)}`; }
  const looks = args.looks && typeof args.looks === "object" ? args.looks : {};
  for (const id of pages) if (LOOKS.includes(looks[id])) extra += `&lk.${id}=${looks[id]}`;
  const dir = mkdtempSync(join(tmpdir(), "ovxs-pdf-"));
  try {
    const pdf = join(dir, "slides.pdf");
    await run(CHROME, ["--headless=new", "--no-pdf-header-footer", "--virtual-time-budget=12000", `--user-data-dir=${join(dir, "chrome")}`, `--print-to-pdf=${pdf}`, `file://${join(root, "topics", topic, "page.html")}?export=pdf${extra}`], { timeout: 90000 });
    const data = readFileSync(pdf).toString("base64");
    return { content: [{ type: "text", text: JSON.stringify({ pages: pages.length, bytes: Math.round(data.length * 0.75) }) }], structuredContent: { pdf: data, pages: pages.length } };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function renderSlide(args) {
  checkTarget(args.topic, args.slot);
  const photo = await resolvePhoto(args.photo, args.topic);
  const data = await shoot(args.topic, args.slot, lookQuery(args) + (photo ? `&photo=${encodeURIComponent(photo)}` : ""));
  return { content: [{ type: "image", data, mimeType: "image/jpeg" }, { type: "text", text: JSON.stringify({ rendered: args.slot }) }], structuredContent: { rendered: args.slot } };
}

// ---- Layers for motion video. One warm headless Chrome over its debugging pipe, closed after a minute idle.
let chrome = null, idle = null;
function startChrome() {
  if (chrome) return chrome;
  const dir = mkdtempSync(join(tmpdir(), "ovxs-motion-"));
  const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-pipe", "--hide-scrollbars", "--force-device-scale-factor=1", "--no-first-run", `--user-data-dir=${dir}`], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
  const c = { n: 0, wait: new Map(), dead: false };
  let buf = "";
  proc.stdio[4].setEncoding("utf8");
  proc.stdio[4].on("data", (d) => {
    buf += d;
    let z;
    while ((z = buf.indexOf("\0")) >= 0) {
      let m; try { m = JSON.parse(buf.slice(0, z)); } catch { m = {}; }
      buf = buf.slice(z + 1);
      const w = c.wait.get(m.id);
      if (w) { c.wait.delete(m.id); m.error ? w.no(new Error(m.error.message)) : w.ok(m.result); }
    }
  });
  const end = () => { c.dead = true; if (chrome === c) chrome = null; for (const w of c.wait.values()) w.no(new Error("Chrome closed")); c.wait.clear(); setTimeout(() => rmSync(dir, { recursive: true, force: true, maxRetries: 3 }), 500); };
  proc.on("exit", end); proc.on("error", end); proc.stdio[3].on("error", () => {});
  c.send = (method, params = {}, sessionId) => new Promise((ok, no) => {
    if (c.dead) return no(new Error("Chrome closed"));
    const id = ++c.n;
    const t = setTimeout(() => { c.wait.delete(id); no(new Error("Chrome took too long")); }, 30000);
    c.wait.set(id, { ok: (v) => { clearTimeout(t); ok(v); }, no: (e) => { clearTimeout(t); no(e); } });
    proc.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + "\0");
  });
  c.stop = () => proc.kill();
  return (chrome = c);
}
process.on("exit", () => chrome && chrome.stop());

let lane = Promise.resolve(); // one render at a time
const renderLayers = (args) => (lane = lane.catch(() => {}).then(() => layersOf(args)));
async function layersOf(args) {
  checkTarget(args.topic, args.slot);
  if (!readFileSync(join(root, "topics", args.topic, "page.html"), "utf8").includes("carousel-kit.js")) throw new Error("This page doesn't use the carousel kit");
  const photo = await resolvePhoto(args.photo, args.topic);
  const H = args.tall === true ? 1920 : 1350;
  const url = `file://${join(root, "topics", args.topic, "page.html")}?export=${args.slot}${lookQuery(args)}${photo ? `&photo=${encodeURIComponent(photo)}` : ""}`;
  clearTimeout(idle);
  const c = startChrome();
  let targetId;
  try {
    ({ targetId } = await c.send("Target.createTarget", { url: "about:blank" }));
    const { sessionId } = await c.send("Target.attachToTarget", { targetId, flatten: true });
    const cdp = (m, p) => c.send(m, p, sessionId);
    const ev = async (expression) => { const r = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description?.split("\n")[0] || "Page error"); return r.result.value; };
    await cdp("Emulation.setDeviceMetricsOverride", { width: 1080, height: H, deviceScaleFactor: 1, mobile: false });
    await cdp("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
    await cdp("Page.navigate", { url });
    for (let i = 0; i < 100; i++) { if (await ev(`location.protocol==="file:"&&document.readyState==="complete"&&!!window.OVXSKit`).catch(() => false)) break; await new Promise((r) => setTimeout(r, 100)); }
    await ev(`(async()=>{await document.fonts.ready;const t=(p)=>Promise.race([p,new Promise(r=>setTimeout(r,8000))]);
      const urls=[...document.querySelectorAll(".ph")].map(e=>(/url\\("?([^")]+)"?\\)/.exec(getComputedStyle(e).backgroundImage)||[])[1]).filter(Boolean);
      await t(Promise.all(urls.map(u=>{const i=new Image();i.src=u;return i.decode().catch(()=>{})})));await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
    const plan = await ev(`OVXSKit.layerPlan(${H})`);
    const out = [];
    for (let i = 0; i < plan.length; i++) {
      await ev(`OVXSKit.layerShow(${i});new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);
      const { x, y, w, h } = plan[i].clip;
      const { data } = await cdp("Page.captureScreenshot", { format: "webp", quality: plan[i].kind === "photo" ? 86 : 92, clip: { x, y, width: w, height: h, scale: 1 } });
      out.push({ ...plan[i], img: data });
    }
    return { content: [{ type: "text", text: JSON.stringify({ layers: out.length }) }], structuredContent: { slot: args.slot, w: 1080, h: H, layers: out } };
  } finally {
    if (targetId) c.send("Target.closeTarget", { targetId }).catch(() => {});
    idle = setTimeout(() => chrome && chrome.stop(), 60000);
  }
}

const LOOK = {
  order: { type: "array", items: { type: "integer" }, description: "Slide numbers (as in page.html) in display order; slides left out are dropped" },
  style: { type: "string", description: "evergreen, notes, field, poster or coast" },
  look: { type: "string", description: "Design this graphic wears, independent of its content: cover, a, b, c, d or last" },
  accent: { type: "string", description: "teal, mint, magenta, green, blue or red" }
};
const RENDER_TOOL = {
  name: "render_slide",
  description: "Render one graphic of an OVXS topic with a given slide order, style, accent and photo. Returns a 1080x1350 JPEG. Changes no files in the repo.",
  inputSchema: {
    type: "object",
    properties: {
      topic: { type: "string" }, slot: { type: "string", description: "li-graphic or slide-1 … slide-10" },
      photo: { type: "string", description: "Photo for this graphic: an images.unsplash.com / images.pexels.com URL, an assets/ file, or unsplash:<id> / pexels:<id>. Empty: the page's own photo." },
      ...LOOK
    },
    required: ["topic", "slot"]
  },
  annotations: { readOnlyHint: true }
};
const LAYERS_TOOL = {
  name: "render_layers",
  description: "Split one graphic of an OVXS topic into transparent WebP parts (background, photo, headline lines, underlines, icon…) with their positions, so the Content Desk can animate it. Changes no files in the repo.",
  inputSchema: {
    type: "object",
    properties: { ...RENDER_TOOL.inputSchema.properties, tall: { type: "boolean", description: "true: 1080x1920 for a Reel. Otherwise 1080x1350." } },
    required: ["topic", "slot"]
  },
  annotations: { readOnlyHint: true }
};
const PDF_TOOL = {
  name: "export_pdf",
  description: "Export graphics of an OVXS topic as a multi-page PDF (1080x1350 pages, live text and vector shapes) for editing in Adobe Express. Returns the PDF as base64. Changes no files in the repo.",
  inputSchema: {
    type: "object",
    properties: {
      topic: { type: "string" },
      pages: { type: "array", items: { type: "string" }, description: "Graphics in page order: li-graphic, slide-1 …" },
      photos: { type: "object", additionalProperties: { type: "string" }, description: "Photo per graphic id, same forms as render_slide's photo" },
      looks: { type: "object", additionalProperties: { type: "string" }, description: "Design per graphic id: cover, a, b, c, d or last" },
      order: LOOK.order, style: LOOK.style
    },
    required: ["topic", "pages"]
  },
  annotations: { readOnlyHint: true }
};
const TOOL = {
  name: "generate_photo",
  description: "Find a new Unsplash photo for one graphic of an OVXS topic and render that graphic with it. Returns the rendered 1080x1350 JPEG and the photo's credit. Changes no files in the repo.",
  inputSchema: {
    type: "object",
    properties: {
      topic: { type: "string", description: "Topic folder name, e.g. 2026-11-12-too-many-apps" },
      slot: { type: "string", description: "li-graphic or slide-1 … slide-8" },
      keyword: { type: "string", description: "What the photo should show. Empty: a different photo of the slot's current scene." },
      queries: { type: "array", items: { type: "string" }, description: "Up to 3 concrete scene searches to try in order (e.g. from Claude turning the keyword into what to photograph). Overrides keyword for searching." },
      avoid: { type: "array", items: { type: "string" }, description: "Words that must not appear in the photo's description (e.g. sale, discount)" },
      exclude: { type: "array", items: { type: "string" }, description: "Photo ids not to use (already shown for this slot)" },
      ...LOOK
    },
    required: ["topic", "slot"]
  },
  annotations: { readOnlyHint: true }
};

function usedIds() {
  const ids = new Set();
  for (const t of readdirSync(join(root, "topics"))) {
    const f = join(root, "topics", t, "assets", "credits.json");
    if (existsSync(f)) { try { for (const c of JSON.parse(readFileSync(f, "utf8"))) ids.add(c.id); } catch {} }
  }
  return ids;
}

// The slot's current scene, from page.html and credits.json, for a keyword-less swap.
function sceneFor(topic, slot) {
  const page = readFileSync(join(root, "topics", topic, "page.html"), "utf8");
  let ph;
  if (slot === "li-graphic") ph = (page.match(/class="ph" style="background-image:url\(assets\/([\w-]+)\.jpg\)"/) || [])[1];
  else ph = [...page.matchAll(/\{bg:"[a-z]+"(?:,ph:"([\w-]+)")?/g)].map((m) => m[1])[Number(slot.split("-")[1]) - 1];
  if (!ph) return "";
  const cf = join(root, "topics", topic, "assets", "credits.json");
  const c = existsSync(cf) ? JSON.parse(readFileSync(cf, "utf8")).find((x) => x.file === `${ph}.jpg`) : null;
  return c && c.alt ? c.alt.split(/\s+/).slice(0, 6).join(" ") : ph.replace(/-/g, " ");
}

const clean = (v, n) => String(v || "").replace(/[^\p{L}\p{N} ,'-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, n);

async function generate({ topic, slot, keyword = "", queries = [], avoid = [], exclude = [], order, style, accent, look }) {
  checkTarget(topic, slot);
  const kw = clean(keyword, 80);
  const tries = (Array.isArray(queries) ? queries : []).map((q) => clean(q, 80)).filter(Boolean).slice(0, 3);
  if (!tries.length) tries.push(kw || sceneFor(topic, slot));
  if (!tries[0]) throw new Error("This graphic has no photo");
  const bad = (Array.isArray(avoid) ? avoid : []).map((w) => clean(w, 30).toLowerCase()).filter((w) => w.length > 1).slice(0, 15);
  const badRe = bad.length ? new RegExp(`\\b(${bad.map((w) => w.replace(/[-]/g, "\\-")).join("|")})`, "i") : null;
  const skip = new Set([...usedIds(), ...exclude.map(String)]);
  let pick = null, query = tries[0];
  for (const q of tries) {
    const { stdout } = await run("node", [join(root, "scripts/stock.mjs"), "search", q, "--n", "15", "--orientation", "portrait", "--source", "unsplash"], { cwd: root, timeout: 30000 });
    pick = JSON.parse(stdout).find((r) => !skip.has(r.id) && !(badRe && badRe.test(r.alt || "")));
    if (pick) { query = q; break; }
  }
  if (!pick) throw new Error(`No new Unsplash photo found for "${tries.join('", "')}". Try another keyword.`);
  const data = await shoot(topic, slot, lookQuery({ order, style, accent, look }) + `&photo=${encodeURIComponent(pick.image)}`);
  const photo = { source: "unsplash", id: pick.id, photographer: pick.photographer, alt: pick.alt, image: pick.image };
  return {
    content: [{ type: "image", data, mimeType: "image/jpeg" }, { type: "text", text: JSON.stringify({ photo, query }) }],
    structuredContent: { photo, query }
  };
}

// Minimal MCP over stdio (JSON-RPC 2.0, one message per line).
const send = (msg) => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", ...msg }) + "\n");
createInterface({ input: process.stdin }).on("line", async (line) => {
  let req;
  try { req = JSON.parse(line); } catch { return; }
  const { id, method, params } = req;
  if (id === undefined) return; // notifications
  try {
    if (method === "initialize") send({ id, result: { protocolVersion: params?.protocolVersion || "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "ovxs-photos", version: "1.0.0" } } });
    else if (method === "ping") send({ id, result: {} });
    else if (method === "tools/list") send({ id, result: { tools: [TOOL, RENDER_TOOL, LAYERS_TOOL, PDF_TOOL] } });
    else if (method === "tools/call") {
      const fn = { [TOOL.name]: generate, [RENDER_TOOL.name]: renderSlide, [LAYERS_TOOL.name]: renderLayers, [PDF_TOOL.name]: exportPdf }[params?.name];
      if (!fn) throw Object.assign(new Error("Unknown tool"), { rpc: -32602 });
      try { send({ id, result: await fn(params.arguments || {}) }); }
      catch (e) { send({ id, result: { isError: true, content: [{ type: "text", text: e.message }] } }); }
    } else send({ id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (e) {
    send({ id, error: { code: e.rpc || -32603, message: e.message } });
  }
});
