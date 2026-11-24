import { t } from "i18next";

/**
 * The main action, word for word everywhere it appears (nav, hero, close).
 * The translation carries a typed "→"; the design draws its own arrow (svg.m-arrow),
 * so the glyph is dropped at render time — the copy itself is unchanged.
 */
export const mainAction = (): string => t("hero.ctaContact").replace(/\s*→\s*$/, "");

/** The kit's drawn arrow for the primary button (motion.md). */
export const ARROW_SVG =
  '<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';
