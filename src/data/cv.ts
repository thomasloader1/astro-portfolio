/**
 * CV data — single source of truth for fields not exposed by app components.
 * Mirrored as plain JS in scripts/cv-data.mjs for the build script.
 * @see scripts/cv-data.mjs
 *
 * NOTE: `experienceMeta` MUST stay in sync with the inline `roles[]` array in
 * `src/components/sections/Experience.astro`. Drift between the two is a known
 * trade-off — the build script reads this file, the site reads the .astro file.
 */
export interface Education {
  degree: string;
  /** English translation of `degree` for the EN CV PDF. */
  degreeEn?: string;
  institution: string;
  period: string;
}

export interface Language {
  name: string;
  level: string;
  /** English translation of `name` for the EN CV PDF. */
  nameEn?: string;
  /** English translation of `level` for the EN CV PDF. */
  levelEn?: string;
}

export interface ExperienceMeta {
  /** Matches translation key suffix (r1..r5) in public/locales/{es,en}/translation.json under `exp.*`. */
  id: string;
  /** Explicit translation key for the role's core paragraph. Defaults to `exp.{id}Core` when omitted. Mirrors `coreKey` from Experience.astro Role[]. */
  coreKey?: string;
  /** Mirrors `company` from Experience.astro Role[] — keep in sync. */
  company: string;
  /** YYYY-MM, mirrors `start` from Experience.astro Role[]. */
  start: string;
  /** YYYY-MM or null = present, mirrors `end` from Experience.astro Role[]. */
  end: string | null;
  /** Mirrors `techs` from Experience.astro Role[]. */
  techs: string[];
}

export interface CvData {
  name: string;
  role: string;
  photoUrl: string;
  email: string;
  emailUsedFallback: boolean;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  education: Education[];
  languages: Language[];
  experienceMeta: ExperienceMeta[];
}

/**
 * Resolve the contact email. Priority:
 *  1. PUBLIC_CV_EMAIL env var (works in Astro via `import.meta.env` and in Node via `process.env`).
 *  2. Hardcoded fallback `talk.gtg@gmail.com` (emits a stderr warning at build time).
 */
function resolveEmail(): { email: string; usedFallback: boolean } {
  const fromNode =
    typeof process !== "undefined" && process.env ? process.env.PUBLIC_CV_EMAIL : undefined;
  const fromAstro =
    typeof import.meta !== "undefined" && (import.meta as any).env
      ? (import.meta as any).env.PUBLIC_CV_EMAIL
      : undefined;
  const raw = (fromNode ?? fromAstro ?? "").trim();
  if (raw.length > 0) return { email: raw, usedFallback: false };
  return { email: "talk.gtg@gmail.com", usedFallback: true };
}

const { email: resolvedEmail, usedFallback } = resolveEmail();

export const email = resolvedEmail;
export const emailUsedFallback = usedFallback;

export const cvData: CvData = {
  name: "Tomás Gonzalo Gomez",
  role: "Web Developer",
  photoUrl: "https://avatars.githubusercontent.com/u/42984450",
  email: resolvedEmail,
  emailUsedFallback: usedFallback,
  phone: "+54 11 5501-1250",
  website: "https://gomeztomasgonzalo.com.ar",
  linkedin: "https://www.linkedin.com/in/gtg-dev",
  github: "https://github.com/thomasloader1",
  education: [
    {
      degree: "Técnico en Desarrollo de Aplicaciones Web",
      degreeEn: "Web Application Development Technician",
      institution: "Universidad Nacional de La Matanza",
      period: "2017–2025",
    },
  ],
  languages: [
    { name: "Español", level: "Nativo", nameEn: "Spanish", levelEn: "Native" },
    { name: "Inglés", level: "B2", nameEn: "English", levelEn: "B2" },
  ],
  experienceMeta: [
    {
      id: "r1",
      company: "Solutica",
      start: "2024-09",
      end: null,
      techs: [".NET Core 8", "C#", "React", "TypeScript", "SQL Server"],
    },
    {
      id: "r2",
      coreKey: "exp.leadCore",
      company: "Medical & Scientific Knowledge",
      start: "2023-10",
      end: "2024-09",
      techs: ["Laravel", "PHP", "Next.js", "React", "TypeScript", "Python", "MySQL", "Linux"],
    },
    {
      id: "r3",
      coreKey: "exp.leadCore",
      company: "Océano Medicina",
      start: "2022-01",
      end: "2023-10",
      techs: ["Laravel", "PHP", "CakePHP", "React", "WordPress", "MySQL", "Linux"],
    },
    {
      id: "r4",
      company: "Anteojos Negros",
      start: "2021-03",
      end: "2022-01",
      techs: ["PHP", "Slim Framework", "JavaScript", "jQuery", "AWS", "MySQL"],
    },
    {
      id: "r5",
      company: "Frávega",
      start: "2020-03",
      end: "2021-08",
      techs: ["Bash", "Rundeck", "Linux", "Windows"],
    },
  ],
};
