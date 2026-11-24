// llms.txt / llms-full.txt (https://llmstxt.org) — built at prerender time from
// the same sources as the site (translations, CV data, project list), so the
// files can't drift from what the page says. Written in English; the site
// itself is bilingual (es at `/`, en at `/en/`).
import en from "../../public/locales/en/translation.json";
import { cvData } from "../../scripts/cv-data.mjs";
import { projects } from "./projects";

type Dict = Record<string, unknown>;

/** Resolve a dotted key ("exp.r1Title") against the English bundle. */
function tr(key: string): string {
  const value = key.split(".").reduce<unknown>((node, part) => (node as Dict | undefined)?.[part], en);
  if (typeof value !== "string") throw new Error(`llms.txt: missing translation "${key}"`);
  return value;
}

function period(start: string, end: string | null): string {
  return `${start} – ${end ?? tr("exp.present")}`;
}

export function buildLlms(site: URL, full: boolean): string {
  const url = (path: string) => new URL(path, site).href;
  const out: string[] = [];

  out.push(`# ${tr("hero.name")} — ${tr("hero.role")}`, "");
  out.push(`> ${tr("site.description")}`, "");
  out.push(
    tr("about.desc"),
    "",
    `- ${tr("about.kExperience")}: ${tr("about.vExperience")}`,
    `- ${tr("about.kLocation")}: ${tr("about.vLocation")}`,
    `- ${tr("about.kModality")}: ${tr("about.vModality")}`,
    `- ${tr("about.kAvailability")}: ${tr("about.vAvailability")}`,
    `- Languages: ${cvData.languages.map((l) => `${l.nameEn} (${l.levelEn})`).join(", ")}`,
    "",
  );

  out.push("## Site", "");
  out.push(
    `- [Portfolio (English)](${url("/en/")}): services, experience, projects and contact form`,
    `- [Portfolio (Spanish)](${url("/")}): same content in Spanish (default locale)`,
    `- [CV PDF (English)](${url("/Downloads/cv-en.pdf")}): one-page résumé`,
    `- [CV PDF (Spanish)](${url("/Downloads/cv.pdf")}): one-page résumé`,
  );
  if (!full) out.push(`- [Full details](${url("/llms-full.txt")}): every role, service and project in one file`);
  out.push("");

  out.push("## Services", "");
  for (const n of [1, 2, 3, 4]) {
    out.push(`- **${tr(`srv.s${n}Title`)}**: ${tr(`srv.s${n}Desc`)}`);
    if (full) for (const d of [1, 2, 3]) out.push(`  - ${tr(`srv.s${n}d${d}`)}`);
  }
  out.push("");

  out.push("## Experience", "");
  for (const job of cvData.experienceMeta) {
    out.push(`- **${tr(`exp.${job.id}Title`)}** at ${job.company} (${period(job.start, job.end)}) — ${tr(`exp.${job.id}Context`)}`);
    if (full) {
      out.push(`  ${tr(job.coreKey ?? `exp.${job.id}Core`)}`);
      out.push(`  Stack: ${job.techs.join(", ")}`);
    }
  }
  out.push("");

  out.push("## Projects", "");
  for (const p of projects) {
    const link = p.url ?? p.repo;
    const name = link ? `[${p.title}](${link})` : p.title;
    out.push(`- ${name}: ${tr(p.roleKey)}. ${full ? tr(p.descKey) + " " : ""}Stack: ${p.techs.join(", ")}`);
    if (full && p.url && p.repo) out.push(`  Repository: ${p.repo}`);
  }
  out.push("");

  if (full) {
    out.push("## Process", "");
    for (const n of [1, 2, 3, 4]) out.push(`${n}. **${tr(`proc.p${n}Title`)}**: ${tr(`proc.p${n}Desc`)}`);
    out.push("");

    out.push("## Education", "");
    for (const e of cvData.education) out.push(`- ${e.degreeEn}, ${e.institution} (${e.period})`);
    out.push("");
  }

  out.push("## Contact", "");
  out.push(
    `- Email: ${cvData.email}`,
    `- [Contact form](${url("/en/#contact")}): replies within 24 hours`,
    `- [LinkedIn](${cvData.linkedin})`,
    `- [GitHub](${cvData.github})`,
    "",
  );

  return out.join("\n");
}
