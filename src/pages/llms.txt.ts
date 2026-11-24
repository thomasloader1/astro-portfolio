import type { APIRoute } from "astro";
import { buildLlms } from "../lib/llms";

export const prerender = true;

export const GET: APIRoute = ({ site }) =>
  new Response(buildLlms(site!, false), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
