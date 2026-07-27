import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import astroI18next from "astro-i18next";

export default defineConfig({
  integrations: [tailwind(), astroI18next()],
  includes: ['./src/**/*.{astro,js,ts}']
});