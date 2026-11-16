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
const SLOT_RE = /^(li-graphic|slide-[1-8])$/;

const TOOL = {
  name: "generate_photo",
  description: "Find a new Unsplash photo for one graphic of an OVXS topic and render that graphic with it. Returns the rendered 1080x1350 JPEG and the photo's credit. Changes no files in the repo.",
  inputSchema: {
    type: "object",
    properties: {
      topic: { type: "string", description: "Topic folder name, e.g. 2026-11-12-too-many-apps" },
      slot: { type: "string", description: "li-graphic or slide-1 … slide-8" },
      keyword: { type: "string", description: "What the photo should show. Empty: a different photo of the slot's current scene." },
      exclude: { type: "array", items: { type: "string" }, description: "Photo ids not to use (already shown for this slot)" }
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

async function generate({ topic, slot, keyword = "", exclude = [] }) {
  if (!TOPIC_RE.test(String(topic)) || !existsSync(join(root, "topics", topic, "page.html"))) throw new Error("Unknown topic");
  if (!SLOT_RE.test(String(slot))) throw new Error("Unknown slot");
  const kw = String(keyword).replace(/[^\p{L}\p{N} ,'-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  const query = kw || sceneFor(topic, slot);
  if (!query) throw new Error("This graphic has no photo");
  const { stdout } = await run("node", [join(root, "scripts/stock.mjs"), "search", query, "--n", "15", "--orientation", "portrait", "--source", "unsplash"], { cwd: root, timeout: 30000 });
  const skip = new Set([...usedIds(), ...exclude.map(String)]);
  const pick = JSON.parse(stdout).find((r) => !skip.has(r.id));
  if (!pick) throw new Error(`No new Unsplash photo found for "${query}". Try another keyword.`);
  const dir = mkdtempSync(join(tmpdir(), "ovxs-photo-"));
  try {
    const png = join(dir, "shot.png"), jpg = join(dir, "shot.jpg");
    const url = `file://${join(root, "topics", topic, "page.html")}?export=${slot}&photo=${encodeURIComponent(pick.image)}`;
    await run(CHROME, ["--headless=new", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1080,1350", "--virtual-time-budget=8000", `--user-data-dir=${join(dir, "chrome")}`, `--screenshot=${png}`, url], { timeout: 60000 });
    await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "88", png, "--out", jpg], { timeout: 20000 });
    const photo = { source: "unsplash", id: pick.id, photographer: pick.photographer, alt: pick.alt, image: pick.image };
    return {
      content: [{ type: "image", data: readFileSync(jpg).toString("base64"), mimeType: "image/jpeg" }, { type: "text", text: JSON.stringify({ photo, query }) }],
      structuredContent: { photo, query }
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
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
    else if (method === "tools/list") send({ id, result: { tools: [TOOL] } });
    else if (method === "tools/call") {
      if (params?.name !== TOOL.name) throw Object.assign(new Error("Unknown tool"), { rpc: -32602 });
      try { send({ id, result: await generate(params.arguments || {}) }); }
      catch (e) { send({ id, result: { isError: true, content: [{ type: "text", text: e.message }] } }); }
    } else send({ id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (e) {
    send({ id, error: { code: e.rpc || -32603, message: e.message } });
  }
});
