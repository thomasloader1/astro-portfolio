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
| `pnpm build` | Type-check + build: `astro check && astro build` |
| `pnpm preview` | Preview the production build |
| `pnpm astro ...` | Run Astro CLI commands |

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
