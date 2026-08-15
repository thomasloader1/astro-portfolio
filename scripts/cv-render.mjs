/**
 * Pure HTML rendering for the CV PDF.
 * No external network resources — fonts referenced via absolute file:// paths to
 * the locally installed @fontsource packages.
 *
 * @see scripts/build-cv.mjs
 */

/**
 * Escape user-controlled strings before inlining them into HTML.
 * Data values are trusted (we control them), but defense in depth.
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "\"")
    .replace(/'/g, "'");
}

/**
 * Format a YYYY-MM period to the locale's short month + year.
 */
function formatPeriod(locale, ym) {
  const dateFmt = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" });
  return dateFmt.format(new Date(`${ym}-01T00:00:00`));
}

/**
 * The fixed Chrome styles for the printable CV. Kept inline in the HTML so the
 * headless renderer doesn't need any external stylesheet (file:// scheme).
 */
const CV_STYLE = `
@page { size: A4; margin: 9mm; }
@media print {
  body { margin: 0; padding: 0; }
  a { color: inherit; text-decoration: none; }
  .page-break { page-break-after: always; }
}
html:lang(en) body { font-size: 8.5pt; line-height: 1.3; }
html:lang(en) header h1 { font-size: 16pt; }
html:lang(en) section h3 { font-size: 8pt; }
html:lang(en) section { margin-bottom: 7pt; }
html:lang(en) .experience .item { margin-bottom: 6pt; }
html:lang(en) .experience .item .core { font-size: 8.5pt; }
html:lang(en) .experience .item .context { font-size: 8.25pt; }
html:lang(en) .experience .item .techs { font-size: 7.75pt; }
html:lang(en) .contact li { font-size: 8.25pt; margin-right: 10pt; }
html:lang(en) .languages li { font-size: 8.25pt; margin-right: 10pt; }
html:lang(en) .education li .institution,
html:lang(en) .education li .period { font-size: 8.25pt; }
* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  color: #2d2a26;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 9.25pt;
  line-height: 1.35;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
header {
  display: flex;
  align-items: center;
  gap: 14pt;
  border-bottom: 1.25pt solid #cc3e00;
  padding-bottom: 7pt;
  margin-bottom: 9pt;
}
header img.photo {
  width: 50pt;
  height: 50pt;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
header h1 {
  margin: 0;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-weight: 600;
  font-size: 18pt;
  letter-spacing: -0.01em;
}
header h2 {
  margin: 1pt 0 0 0;
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 500;
  font-size: 9.5pt;
  color: #cc3e00;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
section {
  margin-bottom: 8pt;
}
section h3 {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 8.5pt;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7c6f64;
  margin: 0 0 4pt 0;
  border-bottom: 0.5pt solid #d8cfc5;
  padding-bottom: 2pt;
}
.contact ul,
.education ul,
.languages ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.contact li {
  display: inline-block;
  margin-right: 12pt;
  font-size: 8.75pt;
}
.contact li .label {
  font-weight: 700;
  color: #7c6f64;
  margin-right: 3pt;
}
.education li {
  margin-bottom: 3pt;
}
.education li .degree {
  font-weight: 600;
}
.education li .institution {
  color: #7c6f64;
  font-size: 8.75pt;
}
.education li .period {
  font-style: italic;
  color: #7c6f64;
  font-size: 8.75pt;
}
.languages li {
  display: inline-block;
  margin-right: 12pt;
  font-size: 8.75pt;
}
.languages li .name { font-weight: 600; }
.languages li .level { color: #7c6f64; }
.experience .item {
  margin-bottom: 7pt;
  page-break-inside: avoid;
}
.experience .item .head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1pt;
}
.experience .item h4 {
  margin: 0;
  font-size: 9.75pt;
  font-weight: 600;
  color: #2d2a26;
}
.experience .item .company {
  font-weight: 500;
  color: #2d2a26;
}
.experience .item .period {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 8.25pt;
  color: #7c6f64;
  white-space: nowrap;
  margin-left: 8pt;
}
.experience .item .context {
  margin: 1pt 0;
  font-style: italic;
  color: #7c6f64;
  font-size: 8.75pt;
}
.experience .item .core {
  margin: 1pt 0;
  font-size: 9pt;
}
.experience .item .techs {
  margin-top: 1pt;
  font-size: 8.25pt;
  color: #7c6f64;
}
.experience .item .techs span {
  display: inline-block;
  margin-right: 5pt;
}
`;

/**
 * Resolve absolute paths to the locally installed @fontsource font files.
 * When Edge renders the HTML with file:// URLs, it can fetch fonts from
 * the local filesystem via these absolute paths.
 */
function fontPreloadTags() {
  // node_modules paths are resolved at runtime via import.meta.resolve-like
  // semantics. Since we cannot use import.meta.resolve in a .mjs without
  // a build step, we hard-code the package layout (these files exist when
  // @fontsource is installed in node_modules).
  const fontsRoot = "C:/dev/astro-portfolio/node_modules/@fontsource";
  return [
    `<link rel="preload" href="file:///${fontsRoot}/inter/files/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>`,
    `<link rel="preload" href="file:///${fontsRoot}/inter/files/inter-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>`,
    `<link rel="preload" href="file:///${fontsRoot}/inter/files/inter-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>`,
    `<link rel="preload" href="file:///${fontsRoot}/cormorant-garamond/files/cormorant-garamond-latin-300-italic.woff2" as="font" type="font/woff2" crossorigin>`,
  ].join("\n    ");
}

/**
 * Render the localized CV HTML for headless rendering.
 *
 * @param {string} locale  "es" | "en"
 * @param {object} data    cvData from src/data/cv.ts
 * @param {object} t       translations for the locale (parsed translation.json)
 * @returns {string} Full HTML5 document
 */
export function renderCvHtml(locale, data, t) {
  const lang = escapeHtml(locale);
  const title = `CV — ${escapeHtml(data.name)}`;

  // Hero
  const photoUrl = escapeHtml(data.photoUrl);
  const name = escapeHtml(data.name);
  const role = escapeHtml(t.hero?.role ?? data.role);

  // Contact block — labels are hardcoded per locale (same pattern as section
  // labels below) so the CV renderer is self-contained and does not depend on
  // site translation keys.
  const isEn = locale === "en";
  const contactLabels = {
    email: "Email",
    phone: isEn ? "Phone" : "Teléfono",
    web: "Web",
    linkedin: "LinkedIn",
    github: "GitHub",
  };
  const contactItems = [
    `<li><span class="label">${contactLabels.email}:</span><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></li>`,
    `<li><span class="label">${contactLabels.phone}:</span><a href="tel:${escapeHtml(data.phone.replace(/[\s-]/g, ""))}">${escapeHtml(data.phone)}</a></li>`,
    `<li><span class="label">${contactLabels.web}:</span><a href="${escapeHtml(data.website)}">${escapeHtml(data.website)}</a></li>`,
    `<li><span class="label">${contactLabels.linkedin}:</span><a href="${escapeHtml(data.linkedin)}">${escapeHtml(data.linkedin.replace(/^https?:\/\//, ""))}</a></li>`,
    `<li><span class="label">${contactLabels.github}:</span><a href="${escapeHtml(data.github)}">${escapeHtml(data.github.replace(/^https?:\/\//, ""))}</a></li>`,
  ].join("\n          ");

  // Education — degree is localized (degreeEn used for the EN CV).
  const educationItems = data.education
    .map((e) => {
      const degree = locale === "en" && e.degreeEn ? e.degreeEn : e.degree;
      return `<li><span class="degree">${escapeHtml(degree)}</span> · <span class="institution">${escapeHtml(e.institution)}</span><span class="period"> (${escapeHtml(e.period)})</span></li>`;
    })
    .join("\n          ");

  // Languages — name/level localized (nameEn/levelEn used for the EN CV).
  const languageItems = data.languages
    .map((l) => {
      const name = locale === "en" && l.nameEn ? l.nameEn : l.name;
      const level = locale === "en" && l.levelEn ? l.levelEn : l.level;
      return `<li><span class="name">${escapeHtml(name)}</span> <span class="level">(${escapeHtml(level)})</span></li>`;
    })
    .join("\n          ");

  // Experience — uses translation keys exp.{id}Title / Context / Core.
  const presentLabel = escapeHtml(t.exp?.present ?? "Present");
  const experienceItems = data.experienceMeta
    .map((exp) => {
      const titleKey = `exp.${exp.id}Title`;
      const contextKey = `exp.${exp.id}Context`;
      // Explicit coreKey wins (used when roles share one lead paragraph);
      // otherwise derive `exp.{id}Core` from the id.
      const coreKey = exp.coreKey ?? `exp.${exp.id}Core`;
      const titleStr = escapeHtml(t.exp?.[exp.id + "Title"] ?? titleKey);
      const contextStr = escapeHtml(t.exp?.[exp.id + "Context"] ?? contextKey);
      const coreStr = escapeHtml(t.exp?.[coreKey.slice(4)] ?? coreKey);
      const startLabel = formatPeriod(locale, exp.start);
      const endLabel = exp.end ? formatPeriod(locale, exp.end) : presentLabel;
      const techsHtml = exp.techs
        .map((tech) => `<span>${escapeHtml(tech)}</span>`)
        .join(" ");
      return `        <div class="item">
          <div class="head">
            <h4>${titleStr} <span class="company">— ${escapeHtml(exp.company)}</span></h4>
            <span class="period">${escapeHtml(startLabel)} — ${escapeHtml(endLabel)}</span>
          </div>
          <p class="context">${contextStr}</p>
          <p class="core">${coreStr}</p>
          <div class="techs">${techsHtml}</div>
        </div>`;
    })
    .join("\n");

  // Section labels (hardcoded per locale to keep CV wording tight)
  const lblContact = isEn ? "Contact" : "Contacto";
  const lblEducation = isEn ? "Education" : "Educación";
  const lblLanguages = isEn ? "Languages" : "Idiomas";
  const lblExperience = isEn ? "Experience" : "Experiencia";

  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    ${fontPreloadTags()}
    <style>${CV_STYLE}</style>
  </head>
  <body>
    <header>
      <img class="photo" src="${photoUrl}" alt="${name}">
      <div>
        <h1>${name}</h1>
        <h2>${role}</h2>
      </div>
    </header>

    <section class="contact">
      <h3>${lblContact}</h3>
      <ul>
          ${contactItems}
      </ul>
    </section>

    <section class="education">
      <h3>${lblEducation}</h3>
      <ul>
          ${educationItems}
      </ul>
    </section>

    <section class="languages">
      <h3>${lblLanguages}</h3>
      <ul>
          ${languageItems}
      </ul>
    </section>

    <section class="experience">
      <h3>${lblExperience}</h3>
${experienceItems}
    </section>
  </body>
</html>
`;
}
