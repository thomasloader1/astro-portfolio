import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { z } from "zod";
import esTranslation from "../../../public/locales/es/translation.json";
import enTranslation from "../../../public/locales/en/translation.json";

// This route must run as a serverless function (Vercel). Without this,
// hybrid output would try to prerender it as static HTML — POST never works.
export const prerender = false;

// Error messages are full i18n keys; the client translates them with the same
// t() it uses for its own validation (src/scripts/site.ts).
const V = "contact.modal.form.validation";
const ContactSchema = z.object({
  name: z.string().trim().min(1, { message: `${V}.nameRequired` }).max(100),
  email: z.email({ message: `${V}.emailInvalid` }).max(254),
  contactType: z.enum(["hire", "work", "mentoring", "support"], { message: `${V}.typeRequired` }),
  message: z.string().trim().min(1, { message: `${V}.messageRequired` }).max(5000),
});

// User input is interpolated into HTML emails — always escape it.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ContactInput = z.infer<typeof ContactSchema>;

// In-memory rate limiter: Map<IP, { count: number, resetAt: number }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  // Fallback for local dev
  return "127.0.0.1";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    // First request or window expired
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfter: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}

// Contact type labels come from the same translation files the form uses.
const contactTypeLabels = {
  es: esTranslation.contact.modal.form.types,
  en: enTranslation.contact.modal.form.types,
};

function getContactTypeLabel(type: ContactInput["contactType"], lang: "es" | "en"): string {
  return contactTypeLabels[lang][type] ?? type;
}

// Email templates. Every interpolated user value MUST go through escapeHtml()
// in the HTML variants (the plain-text variants are not rendered as HTML).
const emailTranslations = {
  es: {
    confirmationSubject: "Gracias por contactarme",
    confirmationBody: (name: string, contactTypeLabel: string) =>
      `Hola ${escapeHtml(name)},<br><br>Gracias por escribirme. He recibido tu mensaje sobre <strong>${escapeHtml(contactTypeLabel)}</strong> y te contactaré en menos de 24 horas.<br><br>Un saludo,<br>Tomás Gómez`,
    confirmationText: (name: string, contactTypeLabel: string) =>
      `Hola ${name},\n\nGracias por escribirme. He recibido tu mensaje sobre ${contactTypeLabel} y te contactaré en menos de 24 horas.\n\nUn saludo,\nTomás Gómez`,
    notificationSubject: (name: string, contactTypeLabel: string) =>
      `Nuevo contacto: ${contactTypeLabel} — ${name}`,
    notificationHtml: (data: ContactInput, contactTypeLabel: string) =>
      `<h2>Nuevo mensaje de contacto</h2>
       <p><strong>Nombre:</strong> ${escapeHtml(data.name)}</p>
       <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
       <p><strong>Tipo:</strong> ${escapeHtml(contactTypeLabel)}</p>
       <p><strong>Mensaje:</strong></p>
       <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
       <hr>
       <p style="font-size: 12px; color: #666;">Responde directamente a este email para contactar al usuario.</p>`,
    notificationText: (data: ContactInput, contactTypeLabel: string) =>
      `Nuevo mensaje de contacto\n\nNombre: ${data.name}\nEmail: ${data.email}\nTipo: ${contactTypeLabel}\n\nMensaje:\n${data.message}\n\n---\nResponde directamente a este email para contactar al usuario.`,
  },
  en: {
    confirmationSubject: "Thanks for reaching out",
    confirmationBody: (name: string, contactTypeLabel: string) =>
      `Hi ${escapeHtml(name)},<br><br>Thanks for writing. I received your message about <strong>${escapeHtml(contactTypeLabel)}</strong> and will get back to you within 24 hours.<br><br>Best,<br>Tomás Gómez`,
    confirmationText: (name: string, contactTypeLabel: string) =>
      `Hi ${name},\n\nThanks for writing. I received your message about ${contactTypeLabel} and will get back to you within 24 hours.\n\nBest,\nTomás Gómez`,
    notificationSubject: (name: string, contactTypeLabel: string) =>
      `New contact: ${contactTypeLabel} — ${name}`,
    notificationHtml: (data: ContactInput, contactTypeLabel: string) =>
      `<h2>New contact message</h2>
       <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
       <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
       <p><strong>Type:</strong> ${escapeHtml(contactTypeLabel)}</p>
       <p><strong>Message:</strong></p>
       <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
       <hr>
       <p style="font-size: 12px; color: #666;">Reply directly to this email to contact the user.</p>`,
    notificationText: (data: ContactInput, contactTypeLabel: string) =>
      `New contact message\n\nName: ${data.name}\nEmail: ${data.email}\nType: ${contactTypeLabel}\n\nMessage:\n${data.message}\n\n---\nReply directly to this email to contact the user.`,
  },
};

export const POST: APIRoute = async ({ request }) => {
  // Rate limiting
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.ceil((rateLimit.retryAfter ?? 60000) / 1000).toString(),
        },
      }
    );
  }

  // Parse and validate body
  let body: ContactInput;
  try {
    const json = await request.json();
    body = ContactSchema.parse(json);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0];
      const field = firstError.path[0] as keyof ContactInput;
      return new Response(
        JSON.stringify({ error: firstError.message, field }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Initialize Supabase client
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase env vars not configured");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Insert into Supabase
  const { error: supabaseError } = await supabase.from("contact_submissions").insert({
    name: body.name,
    email: body.email,
    contact_type: body.contactType,
    message: body.message,
  });

  if (supabaseError) {
    console.error("Supabase insert error:", supabaseError);
    return new Response(
      JSON.stringify({ error: "Failed to save submission" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Initialize Resend
  const resendApiKey = import.meta.env.RESEND_API_KEY;
  const contactEmailTo = import.meta.env.CONTACT_EMAIL_TO;

  if (!resendApiKey || !contactEmailTo) {
    console.error("Resend env vars not configured");
    // Supabase insert succeeded, but email config missing
    // Return 500 but row exists (idempotent retry possible)
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const resend = new Resend(resendApiKey);

  // Configurable sender. Defaults to Resend's sandbox so the form works in
  // dev without domain verification; once the domain's MX record is added
  // and verified, set EMAIL_FROM="Tomás Gómez <contact@gomeztomasgonzalo.com.ar>".
  const emailFrom = import.meta.env.EMAIL_FROM ?? "Tomás Gómez <on@resend.dev>";

  // Determine language from Accept-Language header or default to Spanish
  const acceptLang = request.headers.get("accept-language") ?? "es";
  const lang = acceptLang.startsWith("en") ? "en" : "es";
  const t = emailTranslations[lang];
  const contactTypeLabel = getContactTypeLabel(body.contactType, lang);

  // Send both emails in parallel
  const [userEmailResult, ownerEmailResult] = await Promise.allSettled([
    // User confirmation email
    resend.emails.send({
      from: emailFrom,
      to: body.email,
      subject: t.confirmationSubject,
      html: t.confirmationBody(body.name, contactTypeLabel),
      text: t.confirmationText(body.name, contactTypeLabel),
      tags: [{ name: "category", value: "contact-confirmation" }],
    }),
    // Owner notification email
    resend.emails.send({
      from: emailFrom,
      to: contactEmailTo,
      subject: t.notificationSubject(body.name, contactTypeLabel),
      html: t.notificationHtml(body, contactTypeLabel),
      text: t.notificationText(body, contactTypeLabel),
      replyTo: body.email,
      tags: [{ name: "category", value: "contact-notification" }],
    }),
  ]);

  // Check email results
  const userEmailFailed = userEmailResult.status === "rejected" || (userEmailResult.status === "fulfilled" && userEmailResult.value.error);
  const ownerEmailFailed = ownerEmailResult.status === "rejected" || (ownerEmailResult.status === "fulfilled" && ownerEmailResult.value.error);

  if (userEmailFailed || ownerEmailFailed) {
    // Log the REAL error messages (name/message), not the opaque result objects
    console.error("Email send failures:", {
      userEmail: userEmailResult.status === "fulfilled" ? userEmailResult.value.error?.message : (userEmailResult.reason as Error)?.message,
      ownerEmail: ownerEmailResult.status === "fulfilled" ? ownerEmailResult.value.error?.message : (ownerEmailResult.reason as Error)?.message,
    });
    // Supabase row exists, but email failed
    return new Response(
      JSON.stringify({ error: "Submission saved but email delivery failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};