// MIRROR — keep both in sync.
// Plain-JS mirror of src/data/cv.ts (sans TypeScript types).
// Imported directly by scripts/build-cv.mjs to avoid a TS compile step.
// @see src/data/cv.ts

function resolveEmail() {
  const fromNode =
    typeof process !== "undefined" && process.env ? process.env.PUBLIC_CV_EMAIL : undefined;
  const raw = (fromNode ?? "").trim();
  if (raw.length > 0) return { email: raw, usedFallback: false };
  return { email: "talk.gtg@gmail.com", usedFallback: true };
}

const { email: resolvedEmail, usedFallback } = resolveEmail();

export const email = resolvedEmail;
export const emailUsedFallback = usedFallback;

export const cvData = {
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
