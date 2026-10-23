#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const file = join(root, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function usage() {
  console.log(`Usage:
  node scripts/stock.mjs search "<query>" [--source pexels|unsplash|both] [--n 6] [--orientation portrait|landscape|square]
  node scripts/stock.mjs get <pexels|unsplash> <id> --out topics/<folder>/assets [--name cover]`);
  process.exit(1);
}

function args(list) {
  const out = { _: [] };
  for (let i = 0; i < list.length; i++) {
    if (list[i].startsWith("--")) out[list[i].slice(2)] = list[++i];
    else out._.push(list[i]);
  }
  return out;
}

async function json(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${new URL(url).host}`);
  return res.json();
}

function keyFor(source) {
  const name = source === "pexels" ? "PEXELS_API_KEY" : "UNSPLASH_ACCESS_KEY";
  const key = process.env[name];
  if (!key) throw new Error(`${name} is missing. Add it to ${join(root, ".env")} (see .env.example).`);
  return key;
}

const pexels = {
  async search(query, n, orientation) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${n}&orientation=${orientation}`;
    const data = await json(url, { Authorization: keyFor("pexels") });
    return data.photos.map((p) => ({
      source: "pexels", id: String(p.id), alt: p.alt || "", width: p.width, height: p.height,
      photographer: p.photographer, photographer_url: p.photographer_url, page: p.url, preview: p.src.medium
    }));
  },
  async get(id) {
    const p = await json(`https://api.pexels.com/v1/photos/${id}`, { Authorization: keyFor("pexels") });
    return {
      download: p.src.large2x || p.src.original, ext: "jpg",
      credit: { source: "Pexels", id: String(p.id), photographer: p.photographer, photographer_url: p.photographer_url, page: p.url, alt: p.alt || "", license: "https://www.pexels.com/license/" }
    };
  }
};

const unsplash = {
  async search(query, n, orientation) {
    const o = orientation === "square" ? "squarish" : orientation;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${n}&orientation=${o}`;
    const data = await json(url, { Authorization: `Client-ID ${keyFor("unsplash")}`, "Accept-Version": "v1" });
    return data.results.map((p) => ({
      source: "unsplash", id: p.id, alt: p.alt_description || "", width: p.width, height: p.height,
      photographer: p.user.name, photographer_url: `${p.user.links.html}?utm_source=ovxs_studio&utm_medium=referral`, page: p.links.html, preview: p.urls.small
    }));
  },
  async get(id) {
    const headers = { Authorization: `Client-ID ${keyFor("unsplash")}`, "Accept-Version": "v1" };
    const p = await json(`https://api.unsplash.com/photos/${id}`, headers);
    await json(p.links.download_location, headers);
    return {
      download: `${p.urls.raw}&w=2160&fm=jpg&q=85`, ext: "jpg",
      credit: { source: "Unsplash", id: p.id, photographer: p.user.name, photographer_url: `${p.user.links.html}?utm_source=ovxs_studio&utm_medium=referral`, page: p.links.html, alt: p.alt_description || "", license: "https://unsplash.com/license" }
    };
  }
};

const sources = { pexels, unsplash };

async function main() {
  loadEnv();
  const [cmd, ...rest] = process.argv.slice(2);
  const a = args(rest);
  if (cmd === "search") {
    const query = a._[0];
    if (!query) usage();
    const n = Math.min(Number(a.n || 6), 30);
    const orientation = a.orientation || "portrait";
    const pick = a.source || (process.env.PEXELS_API_KEY ? "pexels" : "unsplash");
    const list = pick === "both" ? ["pexels", "unsplash"] : [pick];
    const results = [];
    for (const s of list) {
      try { results.push(...(await sources[s].search(query, n, orientation))); }
      catch (e) { console.error(`${s}: ${e.message}`); }
    }
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  if (cmd === "get") {
    const [source, id] = a._;
    if (!sources[source] || !id || !a.out) usage();
    const info = await sources[source].get(id);
    mkdirSync(a.out, { recursive: true });
    const name = `${a.name || `${source}-${id}`}.${info.ext}`;
    const res = await fetch(info.download);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    writeFileSync(join(a.out, name), Buffer.from(await res.arrayBuffer()));
    const creditsFile = join(a.out, "credits.json");
    const credits = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, "utf8")) : [];
    credits.push({ file: name, ...info.credit, downloaded_at: new Date().toISOString() });
    writeFileSync(creditsFile, JSON.stringify(credits, null, 2) + "\n");
    console.log(JSON.stringify({ file: join(a.out, name), credit: `Photo by ${info.credit.photographer} on ${info.credit.source}` }));
    return;
  }
  usage();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
