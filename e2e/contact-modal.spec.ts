import { test, expect } from "@playwright/test";

// Expected modal copy per locale (mirrors public/locales/{es,en}/translation.json)
const EXPECTED: Record<string, { title: string; subtitle: string; name: string; submit: string; typePlaceholder: string }> = {
  es: {
    title: "Hablemos",
    subtitle: "Cuéntame qué necesitás y te respondo en menos de 24h",
    name: "Nombre",
    submit: "Enviar mensaje",
    typePlaceholder: "Seleccioná una opción",
  },
  en: {
    title: "Let's talk",
    subtitle: "Tell me what you need and I'll get back to you within 24h",
    name: "Name",
    submit: "Send message",
    typePlaceholder: "Select an option",
  },
};

const CASES: Array<{ path: string; lang: keyof typeof EXPECTED }> = [
  { path: "/", lang: "es" },
  { path: "/en/", lang: "en" },
];

test.describe("contact modal i18n", () => {
  for (const { path, lang } of CASES) {
    test(`${path} renders translated strings instead of raw keys`, async ({ page }) => {
      const expected = EXPECTED[lang];

      await page.goto(path);

      // The build-time i18n bundle must be injected by Layout.astro (define:vars).
      // Structure is nested: { contact: { modal: { title } } } — the same
      // lookup the client-side t() in site.ts performs.
      const injectedTitle = await page.evaluate(() => (window as any).__i18n?.contact?.modal?.title);
      expect(injectedTitle).toBe(expected.title);

      await page.click('[data-modal="contact"]');
      await expect(page.locator("#contact-modal")).toBeVisible();

      await expect(page.locator("#contact-modal-title")).toHaveText(expected.title);
      await expect(page.locator(".contact-modal__subtitle")).toHaveText(expected.subtitle);
      await expect(page.locator("#contact-name")).toHaveAttribute("placeholder", expected.name);
      await expect(page.locator(".contact-modal__submit-text")).toHaveText(expected.submit);

      // Regression guard: after opening, NO element inside the modal may still
      // show a raw i18n key (e.g. "contact.modal.title").
      const rawKeys = await page.locator("#contact-modal [data-i18n]").allTextContents();
      for (const text of rawKeys) {
        expect(text).not.toMatch(/^contact\./);
      }
    });
  }
});
