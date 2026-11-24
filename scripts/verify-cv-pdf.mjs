#!/usr/bin/env node
/**
 * Sanity-check the generated CV PDFs.
 *
 * Runs after the containerized generation (scripts/cv-pdf-docker.mjs) both
 * locally and in CI, so a broken render (missing file, truncated PDF, wrong
 * page size) fails loudly instead of shipping a broken download.
 *
 * Checks per file:
 *   - exists and is not empty
 *   - starts with the %PDF- header and ends with the %%EOF trailer
 *   - is big enough to contain the full CV (sanity floor, not a layout check)
 *   - declares an A4 MediaBox (595 x 842 pt)
 *
 * Exits 0 when every PDF is valid, 1 otherwise.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = path.join(ROOT, "public", "Downloads");
const TARGETS = ["cv.pdf", "cv-en.pdf"];

// A complete CV renders to ~75-80 KB; anything under 20 KB means the page
// came out empty or half-rendered.
const MIN_BYTES = 20_000;
const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const A4_TOLERANCE = 2;

let failed = false;

for (const name of TARGETS) {
  const file = path.join(OUTPUT_DIR, name);
  if (!existsSync(file)) {
    console.error(`[verify-cv] MISSING: ${file}`);
    failed = true;
    continue;
  }

  const problems = [];
  const size = statSync(file).size;
  const buffer = readFileSync(file);
  const head = buffer.subarray(0, 5).toString("latin1");
  const tail = buffer.subarray(-2048).toString("latin1");

  if (head !== "%PDF-") problems.push(`invalid header "${head}"`);
  if (!tail.includes("%%EOF")) problems.push("missing %%EOF trailer");
  if (size < MIN_BYTES) problems.push(`too small (${size} bytes, expected >= ${MIN_BYTES})`);

  const mediaBox = /MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(
    buffer.toString("latin1"),
  );
  if (!mediaBox) {
    problems.push("no MediaBox found");
  } else {
    const width = Number(mediaBox[1]);
    const height = Number(mediaBox[2]);
    if (
      Math.abs(width - A4_WIDTH) > A4_TOLERANCE ||
      Math.abs(height - A4_HEIGHT) > A4_TOLERANCE
    ) {
      problems.push(`unexpected page size ${width}x${height} (expected A4)`);
    }
  }

  if (problems.length > 0) {
    console.error(`[verify-cv] ${name}: FAILED — ${problems.join("; ")}`);
    failed = true;
  } else {
    console.error(`[verify-cv] ${name}: OK (${Math.round(size / 1024)} KB, A4)`);
  }
}

if (failed) {
  console.error("[verify-cv] FAILED: the generated CV PDFs are not valid");
  process.exit(1);
}

console.error("[verify-cv] all CV PDFs are valid");
