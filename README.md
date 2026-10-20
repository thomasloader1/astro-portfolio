# Astro Portfolio — Tomás Gómez

Single-page freelance portfolio built with **Astro 7**, **Tailwind CSS 3**, **astro-i18next** and TypeScript (strict). Hand-written CSS design system in `public/landing.css` with a few Tailwind utilities sprinkled in.

## Stack

| Layer | Tool |
|---|---|
| Framework | Astro 7 (static) |
| Styling | Hand-written CSS system (`public/landing.css`) + Tailwind utilities |
| i18n | astro-i18next (`i18next` + `i18next-fs-backend`), translations in `public/locales/{es,en}/translation.json` |
| Language | TypeScript strict |
| Package manager | pnpm (workspace) |

## Structure

```text
/
├── public/
│   ├── landing.css        # design tokens + all component styles
│   ├── favicon.svg
│   └── locales/
│       ├── es/translation.json
│       └── en/translation.json
└── src/
    ├── components/
    │   ├── Nav.astro, Footer.astro
    │   └── sections/      # Hero, Services, Projects, Experience, About, Process, Contact
    ├── layouts/Layout.astro   # head, FOUC theme script, shared site.ts bundle, skip link
    ├── pages/
    │   ├── index.astro    # es (default)
    │   ├── en/index.astro
    │   ├── 404.astro
    │   └── en/404.astro
    └── scripts/site.ts    # shared browser scripts (skip-link, nav/theme/lang toggles, scroll observer)
```

## Scripts

All commands run from the root with pnpm:

| Command | Action |
|---|---|
| `pnpm dev` | Start dev server at `localhost:4321` |
| `pnpm build` | Type-check + build: `astro check && astro build` (the `prebuild` hook regenerates the CV PDFs) |
| `pnpm build:cv:docker` | Regenerate the CV PDFs inside Docker (no browser needed on the host) |
| `pnpm build:cv:verify` | Check the generated CV PDFs (valid PDF, A4, non-empty) |
| `pnpm preview` | Preview the production build |
| `pnpm astro ...` | Run Astro CLI commands |

## CV PDF generation

`pnpm build` regenerates `public/Downloads/cv.pdf` / `cv-en.pdf` via the `prebuild`
hook (`scripts/cv-build.mjs`), which resolves the browser like this:

1. **Host browser** — Edge/Chrome/Chromium found on the host: the PDF is
   rendered directly (`scripts/build-cv.mjs`).
2. **No host browser** — the build falls back to the containerized render
   (`scripts/cv-pdf-docker.mjs`), so no browser has to be installed on the
   machine. This is the normal path on CI and on any host without a browser.
3. **CI/Vercel without a browser** — generation is skipped and the committed
   `public/Downloads/*.pdf` are used as-is (Vercel has neither Docker nor a
   browser).

To force the containerized render:

```bash
pnpm build:cv:docker   # = node scripts/cv-pdf-docker.mjs
```

- Builds `Dockerfile.cv` (Node 24 + Debian Chromium + the CV webfonts) and
  runs `scripts/build-cv.mjs` inside it with the repo bind-mounted at `/work`;
  the PDFs land in `public/Downloads/` of the host checkout.
- Works on any host OS with Docker and in CI — `.github/workflows/cv-pdf.yml`
  runs the same containerized build on push to CV sources and uploads the PDFs
  as artifacts. That job needs **no dependency install**: the image ships
  Chromium and the fonts.
- Browser resolution inside the container: `EDGE_PATH` (set by the image to
  `/usr/bin/chromium`, override with `CV_PDF_EDGE_PATH`) → `msedge`/`chrome`/
  `chromium`/`chromium-browser`/`google-chrome` on `PATH`. Extra Chromium flags
  can be passed via `EDGE_EXTRA_ARGS` (the image sets `--no-sandbox
  --disable-dev-shm-usage` by default).
- The CV fonts (`Inter`, `Cormorant Garamond`) are embedded via `@font-face`
  with `file://` URLs resolved at runtime: from `CV_FONT_ROOT` (the fonts baked
  into the image) or from the local `@fontsource` packages. If they cannot be
  found the generation aborts instead of silently falling back to system
  fonts, so the output is identical across hosts.
- The generated files are validated right after the run (`scripts/verify-cv-pdf.mjs`):
  a missing, truncated or wrong-page-size PDF fails the command and the CI job
  instead of being shipped as a download. The wrapper also checks that the
  container really rewrote the files, so a broken container can never pass by
  reusing the committed PDFs.

## i18n model

- Default locale is **es** (`changeLanguage("es")` on `src/pages/index.astro`), English lives under `/en/`.
- Every visible string lives in `public/locales/{es,en}/translation.json` and is rendered via `t("key")` — no hardcoded strings in components.
- `es` and `en` key sets are kept identical (dead/asymmetric keys are removed).
- Dates render through `Intl.DateTimeFormat(i18next.language, …)` so months are locale-correct.

## Fonts

| Role | Font | Weights |
|---|---|---|
| Display (headings, nav brand, stats, step numbers) | Space Grotesk | 600 |
| Body (text, buttons, nav links) | Inter | 400/500/600 |
| Mono (dates, card numbers, tech tags) | Roboto Mono | 400/500/600 |
| Editorial accent (Contact headline) | Cormorant Garamond | 300 italic |

Imported weight-specific via `@fontsource/*/latin-*-*.css` in `Layout.astro`.

## Quality gate

`astro check && astro build` (wired to `pnpm build`). No test runner. Manual 3-breakpoint visual pass (mobile/tablet/desktop) after styling changes.

## UX/UI audit

A reusable `ux-auditor` subagent lives at `~/.config/opencode/agent/ux-auditor.md` (global, outside this repo). It audits this codebase against ui-ux-pro-max + web-design-guidelines and reports in caveman-ultra format:

```
opencode run ux-auditor "Audit C:\dev\astro-portfolio"
```
