/**
 * Rasterize the social/app images from their SVG sources (run by hand, output
 * is committed):
 *   public/og-image.svg  -> public/og-image.png         (1200x630, Open Graph / X)
 *   public/favicon.svg   -> public/apple-touch-icon.png (180x180)
 *                        -> public/icon-192.png, public/icon-512.png (web manifest)
 *
 * Uses Playwright's bundled Chromium (`pnpm exec playwright install chromium`)
 * and the locally installed @fontsource webfonts, so the text in the OG image
 * renders with the site's real fonts, not system fallbacks.
 *
 * Usage: pnpm build:icons
 *        ICONS_CHROMIUM_PATH=/path/to/chrome pnpm build:icons
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = (file) => path.join(root, "public", file);
// Inlined as data: URIs — a setContent() page is about:blank, which can't load
// file:// fonts.
const font = async (pkg, file) =>
  `data:font/woff2;base64,${(await readFile(path.join(root, "node_modules/@fontsource", pkg, "files", file))).toString("base64")}`;

const FONT_FACES = (
  await Promise.all(
    [
      ["Inter", "inter", "inter-latin-400-normal.woff2", 400],
      ["Inter", "inter", "inter-latin-500-normal.woff2", 500],
      ["Space Grotesk", "space-grotesk", "space-grotesk-latin-600-normal.woff2", 600],
    ].map(async ([family, pkg, file, weight]) =>
      `@font-face { font-family: "${family}"; font-weight: ${weight}; src: url("${await font(pkg, file)}") format("woff2"); }`),
  )
).join("\n");

function page(svg, { icon = false } = {}) {
  // Icons: square corners (iOS / Android apply their own mask) and the glyph
  // shrunk into the maskable safe zone (a centred circle of ~80% diameter).
  const body = icon
    ? svg
        .replace(/(<rect id="bg"[^>]*?)\s+rx="[^"]*"/, "$1")
        .replace('<g id="glyph"', '<g id="glyph" transform="translate(64 64) scale(0.78) translate(-64 -64)"')
    : svg;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${FONT_FACES}
    html,body{margin:0;padding:0}
    svg{display:block;width:100%;height:100%}
  </style></head><body>${body}</body></html>`;
}

const jobs = [
  { src: "og-image.svg", out: "og-image.png", w: 1200, h: 630 },
  { src: "favicon.svg", out: "apple-touch-icon.png", w: 180, h: 180, icon: true },
  { src: "favicon.svg", out: "icon-192.png", w: 192, h: 192, icon: true },
  { src: "favicon.svg", out: "icon-512.png", w: 512, h: 512, icon: true },
];

// ICONS_CHROMIUM_PATH: use an already-installed Chromium when Playwright's
// pinned build isn't downloaded (e.g. right after a Playwright upgrade).
const browser = await chromium.launch({ executablePath: process.env.ICONS_CHROMIUM_PATH || undefined });
try {
  for (const job of jobs) {
    const svg = await readFile(pub(job.src), "utf8");
    const tab = await browser.newPage({ viewport: { width: job.w, height: job.h } });
    await tab.setContent(page(svg, { icon: job.icon }), { waitUntil: "load" });
    await tab.evaluate(() => document.fonts.ready);
    if (!job.icon) {
      const missing = await tab.evaluate(() =>
        ["600 10px 'Space Grotesk'", "500 10px Inter", "400 10px Inter"].filter((f) => !document.fonts.check(f)));
      if (missing.length) throw new Error(`fonts not loaded: ${missing.join(", ")}`);
    }
    await tab.screenshot({ path: pub(job.out), clip: { x: 0, y: 0, width: job.w, height: job.h } });
    await tab.close();
    console.log(`wrote public/${job.out} (${job.w}x${job.h})`);
  }
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
