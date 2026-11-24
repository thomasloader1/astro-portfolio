import type { APIRoute } from "astro";

export const prerender = true;

// Generated so the Sitemap line always matches `site` (PUBLIC_SITE_URL).
// AI crawlers are allowed on purpose: being findable by LLMs is the point of
// a freelance portfolio — see /llms.txt.
export const GET: APIRoute = ({ site }) => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Sitemap: ${new URL("/sitemap-index.xml", site).href}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
