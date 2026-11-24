#!/usr/bin/env node
/**
 * Containerized CV PDF generation.
 *
 * Builds Dockerfile.cv (Node 24 + Debian Chromium + the CV webfonts, no host
 * browser needed) and runs scripts/build-cv.mjs inside it with the repo
 * bind-mounted at /work. Generated PDFs land in public/Downloads/ of the host
 * checkout.
 *
 * Works locally on any OS with Docker and in CI (GitHub Actions) — see
 * .github/workflows/cv-pdf.yml. On Linux the container runs as the current
 * uid:gid so output files are not left root-owned; on Windows/macOS Docker
 * Desktop handles the mapping itself.
 *
 * The container never inherits the "skip generation" behaviour of CI builds:
 * CV_PDF_FORCE is always set, so a broken container fails loudly instead of
 * silently reusing the committed PDFs.
 *
 * Env overrides:
 *   CV_PDF_IMAGE       image tag (default astro-cv-pdf:latest)
 *   CV_PDF_DOCKERFILE  Dockerfile path relative to repo root (default Dockerfile.cv)
 *   CV_PDF_EDGE_PATH   browser binary inside the container (image default: /usr/bin/chromium)
 *   EDGE_EXTRA_ARGS    extra Chromium flags (image default: --no-sandbox --disable-dev-shm-usage)
 */
import { spawnSync } from "node:child_process";
import { accessSync, constants, existsSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE = process.env.CV_PDF_IMAGE ?? "astro-cv-pdf:latest";
const DOCKERFILE = process.env.CV_PDF_DOCKERFILE ?? "Dockerfile.cv";
// docker resolves -f relative to the CLI's cwd, not the context root, so
// absolutize it against ROOT to work from any directory (and in CI).
const DOCKERFILE_PATH = path.isAbsolute(DOCKERFILE) ? DOCKERFILE : path.join(ROOT, DOCKERFILE);
const OUTPUT_DIR = path.join(ROOT, "public", "Downloads");
const TARGETS = ["cv.pdf", "cv-en.pdf"];

function runDocker(args) {
  console.error(`[cv-pdf-docker] docker ${args.join(" ")}`);
  const started = Date.now();
  const res = spawnSync("docker", args, { stdio: "inherit" });
  if (res.error && res.error.code === "ENOENT") {
    console.error("[cv-pdf-docker] docker CLI not found. Install Docker and retry.");
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error(`[cv-pdf-docker] docker exited with code ${res.status}`);
    process.exit(res.status ?? 1);
  }
  console.error(`[cv-pdf-docker] step took ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

/**
 * True when the current user can write into the given directory. Falls back
 * to the closest existing ancestor when the directory does not exist yet.
 */
function isWritable(dir) {
  let current = dir;
  while (!existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) return false;
    current = parent;
  }
  try {
    accessSync(current, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

console.error(`[cv-pdf-docker] building image ${IMAGE} from ${DOCKERFILE_PATH}`);
runDocker(["build", "-f", DOCKERFILE_PATH, "-t", IMAGE, ROOT]);

// Run as the invoking user on POSIX so generated files match the checkout
// owner. HOME is redirected to /tmp because the mounted repo may not be
// writable by that uid outside public/Downloads and .astro-temp.
//
// If the checkout is owned by another uid (some CI runners mount the
// workspace with a different owner), the container would not be able to write
// the PDFs. In that case fall back to root inside the container and fix the
// ownership of the generated files afterwards.
const isPosix = process.platform !== "win32" && typeof process.getuid === "function";
const uid = isPosix ? process.getuid() : null;
const gid = isPosix ? process.getgid() : null;
const runAsRoot = isPosix && !isWritable(OUTPUT_DIR);

if (runAsRoot) {
  console.error(
    `[cv-pdf-docker] ${OUTPUT_DIR} is not writable by uid ${uid}; running the container as root and restoring ownership afterwards.`,
  );
}

const uidArgs = !isPosix || runAsRoot ? [] : ["-u", `${uid}:${gid}`];

// Forward env vars only when actually set — `-e NAME` with NAME unset on the
// host would set it to the empty string inside the container and clobber the
// image's defaults (e.g. EDGE_EXTRA_ARGS="--no-sandbox ...").
//
// The host's EDGE_PATH is deliberately NOT forwarded: it points to a binary
// that does not exist inside the container. Use CV_PDF_EDGE_PATH to pick a
// different browser *within* the container.
const envArgs = ["EDGE_EXTRA_ARGS", "PUBLIC_CV_EMAIL", "VERCEL"]
  .filter((name) => process.env[name] !== undefined)
  .flatMap((name) => ["-e", name]);

if (process.env.CV_PDF_EDGE_PATH) {
  envArgs.push("-e", `EDGE_PATH=${process.env.CV_PDF_EDGE_PATH}`);
}

console.error("[cv-pdf-docker] generating CV PDFs inside the container");

// Remember when the PDFs were last written so we can prove afterwards that
// the container really regenerated them (and did not silently reuse the
// committed ones).
const before = TARGETS.map((name) => {
  const file = path.join(OUTPUT_DIR, name);
  return existsSync(file) ? statSync(file).mtimeMs : 0;
});
const startedAt = Date.now();

runDocker([
  "run",
  "--rm",
  "--init",
  "-w",
  "/work",
  "-v",
  `${ROOT}:/work`,
  "-e",
  "HOME=/tmp",
  // Force a real generation inside the container: without it build-cv.mjs
  // would reuse the committed PDFs on CI and the job would look green
  // without producing anything.
  "-e",
  "CV_PDF_FORCE=1",
  ...envArgs,
  ...uidArgs,
  "--shm-size=1g",
  IMAGE,
]);

// Restore the checkout ownership when we had to run as root.
if (runAsRoot) {
  console.error("[cv-pdf-docker] restoring file ownership");
  runDocker([
    "run",
    "--rm",
    "--entrypoint",
    "chown",
    "-v",
    `${ROOT}:/work`,
    "-w",
    "/work",
    IMAGE,
    "-R",
    `${uid}:${gid}`,
    "/work/public/Downloads",
    "/work/.astro-temp",
  ]);
}

// Fail loudly if the container did not actually rewrite the PDFs: without this
// check a container that silently skips the render would pass the validation
// below (the committed PDFs are still valid) and the CI job would go green
// without generating anything.
TARGETS.forEach((name, i) => {
  const file = path.join(OUTPUT_DIR, name);
  if (!existsSync(file)) {
    console.error(`[cv-pdf-docker] ${name} was not generated`);
    process.exit(1);
  }
  const mtime = statSync(file).mtimeMs;
  if (mtime < startedAt - 1000 || mtime <= before[i]) {
    console.error(
      `[cv-pdf-docker] ${name} was not regenerated (mtime unchanged): the container skipped the render.`,
    );
    process.exit(1);
  }
});

// Fail loudly if the render produced something broken (missing file,
// truncated PDF, wrong page size) instead of shipping it.
const verify = spawnSync(process.execPath, [path.join(ROOT, "scripts", "verify-cv-pdf.mjs")], {
  stdio: "inherit",
});
if (verify.status !== 0) {
  console.error("[cv-pdf-docker] verification of the generated PDFs failed");
  process.exit(verify.status ?? 1);
}

console.error("[cv-pdf-docker] done: public/Downloads/cv.pdf and cv-en.pdf are up to date");
