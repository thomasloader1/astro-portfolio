import type { Experience } from "../../types/Experience";

export const MSK: Experience = {
    date: "experience.msk.date",
    title: "Team Lead",
    company: {
      name: "Medical & Scientific Knowledge",
      link: "https://www.msklatam.com",
    },
    description: "experience.msk.description",
    current: false,
    stack: [
      "PHP",
      "Wordpress",
      "MySQL",
      "SQLite",
      "Laravel",
      "Docker",
      "Linux",
      "ReactJS",
      "TypeScript",
      "JavaScript",
      "Tailwind",
      "Bulma",
      "Bootstrap",
      "jQuery",
      "Sass",
      "Python",
    ],
    content: [
      {
        title: "Sitio Web (frontend - backend)",
        list: [
          "Next.js 14",
          "Laravel 10",
          "Automatizacion de procesos y eventos",
        ],
      },
      {
        title: "Migracion, mantencion y re-configuracion de aplicativos",
        list: [
          "API Pagos (Laravel 8 => 9)",
          "Pasarela de pagos (React.js 17 => 18)",
          "Venta Presencial (React.js 17 => 18)",
          "API CMS (Wordpress 5 => 6)",
          "Reglas de flujo y Funciones (Zoho CRM / Flow)",
          "Herramientas internas de Cobranzas y Marketing",
        ],
      },
      {
        title: "Otros proyectos",
        list: [
          "API Scoring (Flask, Docker)",
          "API CRM (Laravel 11, Docker)",
          "API Suscripciones (Laravel 11, Docker)",
        ],
      },
      {
        title: "En todo el proceso de los proyectos desespeñé",
        list: [
          "Analisis e implementacion de los requerimientos",
          "Supervicion de personal interno y externo",
          "Despligue a Produccion y Desarrollo (Vercel, VPS, AWS)",
        ],
      },
    ],
  }