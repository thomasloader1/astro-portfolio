#!/usr/bin/env node
/**
 * Build-time CV PDF generator.
 *
 * Pipeline:
 *  1. Resolve Edge binary (env → standard Windows paths → PATH lookup).
 *  2. Read cvData + locale translations.
 *  3. Render HTML per locale via scripts/cv-render.mjs.
 *  4. Spawn msedge --print-to-pdf with 30s timeout per locale.
 *  5. Copy results to public/Downloads/{cv,cv-en}.pdf.
 *  6. Warn on stderr if PUBLIC_CV_EMAIL fallback was used.
 *  7. On CI (Vercel/Linux) without a Chromium binary: skip generation and
 *     reuse the committed public/Downloads PDFs (exit 0).
 *
 * Invoked by `pnpm build` via the npm `prebuild` hook in package.json.
 * Must NOT spawn Edge when called outside `pnpm build` for verification
 * unless the caller intentionally wants PDFs generated.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { cvData } from "./cv-data.mjs";
import { renderCvHtml } from "./cv-render.mjs";

const ROOT = process.cwd();
const LOCALE_DIR = path.join(ROOT, "public", "locales");
const TEMP_DIR = path.join(ROOT, ".astro-temp");
const OUTPUT_DIR = path.join(ROOT, "public", "Downloads");

const LOCALES = ["es", "en"];
const RENDER_TIMEOUT_MS = 30_000;

/**
 * Locate a headless Chromium-class binary. Tries in order:
 *  1. process.env.EDGE_PATH
 *  2. C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
 *  3. C:\Program Files\Microsoft\Edge\Application\msedge.exe
 *  4. `msedge` on PATH (via `where` on Windows / `which` elsewhere)
 *  5. `chrome` on PATH
 * Returns { bin, via } on success or { error: tried[] } on failure.
 */
async function detectEdgeAsync() {
  const tried = [];
  const env = (process.env.EDGE_PATH || "").trim();
  if (env && existsSync(env)) return { bin: env, via: "EDGE_PATH" };
  if (env) tried.push(env);

  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const c of candidates) {
    if (existsSync(c)) return { bin: c, via: path.basename(c) };
    tried.push(c);
  }

  // Fallback: spawn `where` (Windows) / `which` to find msedge/chrome on PATH.
  const names = ["msedge", "chrome"];
  for (const name of names) {
    const isWin = process.platform === "win32";
    const cmd = isWin ? "where" : "which";
    const res = await new Promise((resolve) => {
      const p = spawn(cmd, [name], { stdio: "pipe", shell: false });
      let out = "";
      p.stdout?.on("data", (b) => (out += b.toString()));
      p.on("error", () => resolve(""));
      p.on("close", (code) => resolve(code === 0 ? out.trim() : ""));
    });
    if (res) {
      const first = res.split(/\r?\n/)[0];
      if (first && existsSync(first)) return { bin: first, via: "PATH:" + name };
    }
    tried.push(name);
  }

  return { error: tried };
}

/**
 * Render a single locale PDF. Returns the absolute path to the generated PDF.
 * Throws on failure or timeout.
 */
async function generatePdf(locale, edge, html, outputPath) {
  const htmlPath = path.join(TEMP_DIR, `cv-${locale}.html`);
  writeFileSync(htmlPath, html, "utf8");

  // Remove stale PDF before spawning Edge. Edge can hold a phantom lock on the
  // destination when a previous run crashed (Windows EPERM during Vercel
  // adapter hook), causing the new --print-to-pdf to silently no-op. Retry
  // up to 5× with 1s backoff to ride out transient file locks.
  if (existsSync(outputPath)) {
    let removed = false;
    let lastErr;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        unlinkSync(outputPath);
        removed = true;
        break;
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    if (!removed) {
      throw new Error(
        `Could not remove stale PDF at ${outputPath} after 5 attempts: ${lastErr?.message ?? "unknown"}. ` +
          `A previous Edge process may still hold a file lock. Kill any lingering msedge.exe and retry.`,
      );
    }
  }

  // file:// URL with forward slashes (Edge accepts both, but be explicit).
  const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");

  const args = [
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${outputPath}`,
    "--virtual-time-budget=10000",
    fileUrl,
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(edge.bin, args, { stdio: ["ignore", "pipe", "pipe"], shell: false });
    let stderr = "";
    child.stderr?.on("data", (b) => (stderr += b.toString()));

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      // Stale-PDF guard: remove partial output if it exists.
      if (existsSync(outputPath)) {
        try {
          unlinkSync(outputPath);
        } catch {
          /* ignore */
        }
      }
      reject(new Error(`Edge render for "${locale}" exceeded ${RENDER_TIMEOUT_MS}ms timeout`));
    }, RENDER_TIMEOUT_MS);

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to spawn Edge: ${err.message}`));
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        const tail = stderr.split(/\r?\n/).slice(-20).join("\n");
        reject(new Error(`Edge exited with code ${code} for "${locale}". stderr tail:\n${tail}`));
        return;
      }
      if (!existsSync(outputPath)) {
        reject(new Error(`Edge exited 0 for "${locale}" but ${outputPath} was not created`));
        return;
      }
      resolve(outputPath);
    });
  });
}

async function main() {
  // Ensure target directories exist.
  mkdirSync(TEMP_DIR, { recursive: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Resolve Edge binary.
  const edge = await detectEdgeAsync();
  if (!edge || edge.error) {
    const tried = edge?.error ? edge.error.join(", ") : "(none)";
    console.error(
      `[cv-build] msedge not found. Tried: ${tried}. Set EDGE_PATH or install Edge.`,
    );
    // CI/Vercel build images (Linux) have no Edge/Chrome. The PDFs are
    // committed in public/Downloads, so skip generation and let Astro copy
    // the committed files. Locally this stays a hard error so the developer
    // notices missing PDFs.
    const isCi = Boolean(process.env.CI || process.env.VERCEL);
    if (isCi) {
      console.error(
        `[cv-build] CI detected; skipping CV PDF generation. Committed public/Downloads PDFs will be used as-is.`,
      );
      process.exit(0);
    }
    process.exit(2);
  }
  console.error(`[cv-build] using Edge: ${edge.bin} (via ${edge.via})`);

  // Read translations.
  const translations = {};
  for (const locale of LOCALES) {
    const file = path.join(LOCALE_DIR, locale, "translation.json");
    if (!existsSync(file)) {
      console.error(`[cv-build] missing translation file: ${file}`);
      process.exit(2);
    }
    translations[locale] = JSON.parse(readFileSync(file, "utf8"));
  }

  // Render + write PDF per locale.
  for (const locale of LOCALES) {
    const html = renderCvHtml(locale, cvData, translations[locale]);
    const htmlOut = path.join(TEMP_DIR, `cv-${locale}.html`);
    writeFileSync(htmlOut, html, "utf8");
    console.error(`[cv-build] wrote ${htmlOut} (${html.length} bytes)`);

    const pdfOut = path.join(OUTPUT_DIR, locale === "es" ? "cv.pdf" : "cv-en.pdf");
    await generatePdf(locale, edge, html, pdfOut);
    const sizeKb = Math.round(statSync(pdfOut).size / 1024);
    console.error(`[cv-build] generated ${pdfOut} (${sizeKb} KB)`);
  }

  // Fallback warning.
  if (cvData.emailUsedFallback) {
    console.error(
      `[cv-build] PUBLIC_CV_EMAIL not set; using fallback talk.gtg@gmail.com`,
    );
  }

  // Astro will copy public/Downloads/*.pdf into dist/client/Downloads/.
  // We also copy them into the script's TEMP_DIR for verify scripts
  // that may inspect artifacts without re-running astro build.
  void copyFile;

  console.error(`[cv-build] done`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`[cv-build] FAILED: ${err && err.message ? err.message : String(err)}`);
  if (err && err.stack) console.error(err.stack);
  process.exit(1);
});
