#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");

const sourceDir = path.join(os.homedir(), "Downloads", "trademephotos");
const outputFile = path.resolve(__dirname, "..", "trademe-reference-import.json");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const once = process.argv.includes("--once");

const roomAliases = [
  { id: "dining", aliases: ["dining", "dining room"] },
  { id: "hallway", aliases: ["hallway", "hall", "corridor", "entry", "entrance"] },
  { id: "lounge", aliases: ["lounge", "living", "living room", "sitting"] },
  { id: "kitchen", aliases: ["kitchen"] },
  { id: "master", aliases: ["master", "main bedroom", "primary bedroom"] },
  { id: "single-1", aliases: ["single 1", "single-1", "bedroom 1", "bed 1", "single bedroom 1"] },
  { id: "single-2", aliases: ["single 2", "single-2", "bedroom 2", "bed 2", "single bedroom 2"] },
  { id: "bathroom", aliases: ["bathroom", "bath", "shower"] },
  { id: "toilet", aliases: ["toilet", "wc", "loo"] },
  { id: "laundry", aliases: ["laundry", "washhouse"] },
  { id: "outside", aliases: ["outside", "exterior", "front", "back", "garden", "yard", "deck", "patio", "driveway", "street"] },
];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  await fsp.mkdir(sourceDir, { recursive: true });
  await buildImport();

  if (once) return;

  console.log(`Watching ${sourceDir}`);
  console.log(`Writing ${outputFile}`);
  let timer;
  fs.watch(sourceDir, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      buildImport().catch((error) => console.error(error));
    }, 350);
  });
}

async function buildImport() {
  const entries = await fsp.readdir(sourceDir, { withFileTypes: true });
  const photos = [];
  const unmatched = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const filePath = path.join(sourceDir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    if (!imageExtensions.has(ext)) continue;

    const roomId = matchRoom(entry.name);
    if (!roomId) {
      unmatched.push(entry.name);
      continue;
    }

    const stat = await fsp.stat(filePath);
    const buffer = await fsp.readFile(filePath);
    const hash = crypto.createHash("sha1").update(filePath).update(String(stat.mtimeMs)).update(String(stat.size)).digest("hex").slice(0, 16);
    const mime = mimeForExtension(ext);

    photos.push({
      id: `trademe-ref-${roomId}-${hash}`,
      roomId,
      kind: "reference",
      name: entry.name,
      type: mime,
      size: stat.size,
      createdAt: Math.round(stat.mtimeMs),
      version: path.basename(entry.name, ext),
      isFinal: false,
      dataUrl: `data:${mime};base64,${buffer.toString("base64")}`,
    });
  }

  const payload = {
    importMode: "merge",
    source: sourceDir,
    generatedAt: new Date().toISOString(),
    photos,
    unmatched,
  };

  await fsp.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Matched ${photos.length} reference photo(s). Unmatched ${unmatched.length}.`);
}

function matchRoom(filename) {
  const normalized = path.basename(filename, path.extname(filename)).toLowerCase().replace(/[_-]+/g, " ");
  return roomAliases.find((room) => room.aliases.some((alias) => normalized.includes(alias)))?.id || null;
}

function mimeForExtension(ext) {
  return {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".avif": "image/avif",
  }[ext] || "application/octet-stream";
}
