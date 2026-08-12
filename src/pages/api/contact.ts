import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { z } from "zod";

// Zod schema for validation
const ContactSchema = z.object({
  name: z.string().min(1, { message: "validation.nameRequired" }).max(100),
  email: z.string().email({ message: "validation.emailInvalid" }).max(254),
  contactType: z.enum(["hire", "work", "mentoring", "support"], { message: "validation.typeRequired" }),
  message: z.string().min(1, { message: "validation.messageRequired" }).max(5000),
});

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

// Helper to get contact type label from i18n key
function getContactTypeLabel(type: string, lang: "es" | "en"): string {
  const labels: Record<string, Record<"es" | "en", string>> = {
    hire: { es: "Contratar servicios", en: "Hire services" },
    work: { es: "Trabajar para mi empresa", en: "Work for my company" },
    mentoring: { es: "Mentoría / Análisis de plataforma", en: "Mentoring / Platform analysis" },
    support: { es: "Soporte de aplicaciones", en: "Application support" },
  };
  return labels[type]?.[lang] ?? type;
}

// i18n translations for emails (inline to avoid runtime dependency)
const emailTranslations = {
  es: {
    confirmationSubject: "Gracias por contactarme",
    confirmationBody: (name: string, contactTypeLabel: string) =>
      `Hola ${name},<br><br>Gracias por escribirme. He recibido tu mensaje sobre <strong>${contactTypeLabel}</strong> y te contactaré en menos de 24 horas.<br><br>Un saludo,<br>Tomás Gómez`,
    confirmationText: (name: string, contactTypeLabel: string) =>
      `Hola ${name},\n\nGracias por escribirme. He recibido tu mensaje sobre ${contactTypeLabel} y te contactaré en menos de 24 horas.\n\nUn saludo,\nTomás Gómez`,
    notificationSubject: (name: string, contactTypeLabel: string) =>
      `Nuevo contacto: ${contactTypeLabel} — ${name}`,
    notificationHtml: (data: ContactInput, contactTypeLabel: string) =>
      `<h2>Nuevo mensaje de contacto</h2>
       <p><strong>Nombre:</strong> ${data.name}</p>
       <p><strong>Email:</strong> ${data.email}</p>
       <p><strong>Tipo:</strong> ${contactTypeLabel}</p>
       <p><strong>Mensaje:</strong></p>
       <p>${data.message.replace(/\n/g, "<br>")}</p>
       <hr>
       <p style="font-size: 12px; color: #666;">Responde directamente a este email para contactar al usuario.</p>`,
    notificationText: (data: ContactInput, contactTypeLabel: string) =>
      `Nuevo mensaje de contacto\n\nNombre: ${data.name}\nEmail: ${data.email}\nTipo: ${contactTypeLabel}\n\nMensaje:\n${data.message}\n\n---\nResponde directamente a este email para contactar al usuario.`,
  },
  en: {
    confirmationSubject: "Thanks for reaching out",
    confirmationBody: (name: string, contactTypeLabel: string) =>
      `Hi ${name},<br><br>Thanks for writing. I received your message about <strong>${contactTypeLabel}</strong> and will get back to you within 24 hours.<br><br>Best,<br>Tomás Gómez`,
    confirmationText: (name: string, contactTypeLabel: string) =>
      `Hi ${name},\n\nThanks for writing. I received your message about ${contactTypeLabel} and will get back to you within 24 hours.\n\nBest,\nTomás Gómez`,
    notificationSubject: (name: string, contactTypeLabel: string) =>
      `New contact: ${contactTypeLabel} — ${name}`,
    notificationHtml: (data: ContactInput, contactTypeLabel: string) =>
      `<h2>New contact message</h2>
       <p><strong>Name:</strong> ${data.name}</p>
       <p><strong>Email:</strong> ${data.email}</p>
       <p><strong>Type:</strong> ${contactTypeLabel}</p>
       <p><strong>Message:</strong></p>
       <p>${data.message.replace(/\n/g, "<br>")}</p>
       <hr>
       <p style="font-size: 12px; color: #666;">Reply directly to this email to contact the user.</p>`,
    notificationText: (data: ContactInput, contactTypeLabel: string) =>
      `New contact message\n\nName: ${data.name}\nEmail: ${data.email}\nType: ${contactTypeLabel}\n\nMessage:\n${data.message}\n\n---\nReply directly to this email to contact the user.`,
  },
};

export const POST: APIRoute = async ({ request }) => {
  // Only allow POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

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
      const firstError = err.errors[0];
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

  // Determine language from Accept-Language header or default to Spanish
  const acceptLang = request.headers.get("accept-language") ?? "es";
  const lang = acceptLang.startsWith("en") ? "en" : "es";
  const t = emailTranslations[lang];
  const contactTypeLabel = getContactTypeLabel(body.contactType, lang);

  // Send both emails in parallel
  const [userEmailResult, ownerEmailResult] = await Promise.allSettled([
    // User confirmation email
    resend.emails.send({
      from: "Tomás Gómez <contact@tomasgomez.dev>",
      to: body.email,
      subject: t.confirmationSubject,
      html: t.confirmationBody(body.name, contactTypeLabel),
      text: t.confirmationText(body.name, contactTypeLabel),
      tags: [{ name: "category", value: "contact-confirmation" }],
    }),
    // Owner notification email
    resend.emails.send({
      from: "Contact Form <contact@tomasgomez.dev>",
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
    console.error("Email send failures:", { userEmailResult, ownerEmailResult });
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