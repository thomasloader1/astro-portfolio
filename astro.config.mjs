import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import astroI18next from "astro-i18next";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Astro 7: static is the default; the `/api/contact` route opts into
  // server rendering via `export const prerender = false`, which the Vercel
  // adapter turns into a serverless function.
  adapter: vercel(),
  site: process.env.PUBLIC_SITE_URL ?? "https://gomeztomasgonzalo.com.ar",
  integrations: [
    tailwind(),
    astroI18next(),
    sitemap({
      i18n: {
        defaultLocale: "es",
        locales: {
          es: "es-ES",
          en: "en-US",
        },
      },
    }),
  ],
  includes: ['./src/**/*.{astro,js,ts}']
});