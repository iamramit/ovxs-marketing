#!/usr/bin/env node
// OVXS photo helper: a tiny local MCP server (stdio) the Content Desk calls for instant "Generate".
// One tool, generate_photo: search Unsplash for a keyword, render that one slide with the top unused
// photo, and return the image. The Unsplash key stays on this Mac (.env); nothing in the repo changes.
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
import { execFile } from "node:child_process";
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
const STYLES = ["evergreen", "night", "editorial", "neon", "grid"];
const ACCENTS = ["teal", "mint", "magenta", "green", "blue", "red"];
const PHOTO_RE = /^(https:\/\/images\.(unsplash|pexels)\.com\/[^"'()\s]+|assets\/[\w.-]+)$/;

function lookQuery({ order, style, accent } = {}) {
  const q = [];
  const o = (Array.isArray(order) ? order : []).map(Number).filter((n) => Number.isInteger(n) && n > 0 && n <= 20).slice(0, 20);
  if (o.length) q.push(`order=${o.join(",")}`);
  if (STYLES.includes(style)) q.push(`style=${style}`);
  if (ACCENTS.includes(accent)) q.push(`accent=${accent}`);
  return q.length ? "&" + q.join("&") : "";
}

const urlCache = new Map();
async function resolvePhoto(photo) {
  const p = String(photo || "").trim();
  if (!p) return "";
  if (PHOTO_RE.test(p)) return p;
  const m = /^(unsplash|pexels):([\w-]{1,40})$/.exec(p);
  if (!m) throw new Error("Unknown photo");
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

async function renderSlide(args) {
  checkTarget(args.topic, args.slot);
  const photo = await resolvePhoto(args.photo);
  const data = await shoot(args.topic, args.slot, lookQuery(args) + (photo ? `&photo=${encodeURIComponent(photo)}` : ""));
  return { content: [{ type: "image", data, mimeType: "image/jpeg" }, { type: "text", text: JSON.stringify({ rendered: args.slot }) }], structuredContent: { rendered: args.slot } };
}

const LOOK = {
  order: { type: "array", items: { type: "integer" }, description: "Slide numbers (as in page.html) in display order; slides left out are dropped" },
  style: { type: "string", description: "evergreen, night, editorial, neon or grid" },
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

async function generate({ topic, slot, keyword = "", queries = [], avoid = [], exclude = [], order, style, accent }) {
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
  const data = await shoot(topic, slot, lookQuery({ order, style, accent }) + `&photo=${encodeURIComponent(pick.image)}`);
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
    else if (method === "tools/list") send({ id, result: { tools: [TOOL, RENDER_TOOL] } });
    else if (method === "tools/call") {
      const fn = { [TOOL.name]: generate, [RENDER_TOOL.name]: renderSlide }[params?.name];
      if (!fn) throw Object.assign(new Error("Unknown tool"), { rpc: -32602 });
      try { send({ id, result: await fn(params.arguments || {}) }); }
      catch (e) { send({ id, result: { isError: true, content: [{ type: "text", text: e.message }] } }); }
    } else send({ id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (e) {
    send({ id, error: { code: e.rpc || -32603, message: e.message } });
  }
});
