#!/usr/bin/env node
/**
 * Entry point for the CV PDF generation (the `prebuild` hook of package.json).
 *
 * Resolution order:
 *   1. A Chromium-class browser on the host (Edge/Chrome/Chromium): render
 *      directly — fastest path, no container involved.
 *   2. No host browser: delegate to the containerized build
 *      (scripts/cv-pdf-docker.mjs), which ships its own Chromium. This is
 *      what removes the hard dependency on host binaries.
 *   3. CI/Vercel without a browser: scripts/build-cv.mjs reuses the committed
 *      public/Downloads PDFs on purpose (Vercel has no Docker and no
 *      browser).
 *
 * Exit codes:
 *   0  PDFs generated (or intentionally reused in a CI/Vercel build)
 *   2  no browser on the host and the containerized build is unavailable
 *   *  any other failure is propagated from the underlying script
 *
 * @see scripts/build-cv.mjs
 * @see scripts/cv-pdf-docker.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXIT_NO_BROWSER = 2;

/**
 * Run one of the scripts/ helpers with the repo root as cwd.
 */
function run(script) {
  return spawnSync(process.execPath, [path.join(ROOT, "scripts", script)], {
    cwd: ROOT,
    stdio: "inherit",
  });
}

const host = run("build-cv.mjs");

if (host.status === 0) {
  process.exit(0);
}

// build-cv.mjs exits with 2 when it cannot find a Chromium-class binary on
// the host; any other non-zero code is a real failure that must not be
// swallowed by the container fallback.
if (host.status === EXIT_NO_BROWSER) {
  console.error(
    "[cv-build] no Chromium-class browser found on the host; falling back to the containerized build",
  );
  const container = run("cv-pdf-docker.mjs");
  if (container.status === 0) {
    process.exit(0);
  }
  console.error(
    `[cv-build] the containerized build failed as well (exit ${container.status}). ` +
      "Install Docker, or install Chrome/Chromium/Edge on the host.",
  );
  process.exit(container.status ?? 1);
}

console.error(
  `[cv-build] CV PDF generation failed (exit ${host.status}). ` +
    "You can retry it inside Docker with `pnpm build:cv:docker`.",
);
process.exit(host.status ?? 1);
