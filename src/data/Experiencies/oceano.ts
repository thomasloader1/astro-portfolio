import type { Experience } from "../../types/Experience";

export const OCEANO: Experience = {
    date: "experience.oceano.date",
    title: "Team Lead",
    company: {
      name: "Océano Medicina",
      link: "https://www.oceanomedicina.com.ar",
    },
    description: "experience.oceano.description",
    prev: {
      date: "experience.oceano.prev.date",
      title: "Full Stack Developer",
      description: "experience.oceano.prev.description",
      content: [
        {
          title: "Pasarela de Pagos (frontend - backend)",
          list: [
            "React.js 17",
            "Laravel 8",
            "MySQL",
            "Stripe / Mercado Pago / Rebill / Place To Pay",
          ],
        },
        {
            title: "Venta Presencial (frontend - backend)",
            list: [
                "React.js 17",
                "Laravel 8",
                "MySQL",
                "Transacciones con Zoho CRM",
            ],
          },
          {
            title: "Otros proyectos",
            list: [
                "Herramienta de generacion / UTM’s / Whatsapp / Comentarios (Laravel 8)",
                "Implementacion propia para la notificacion de eventos en sitio web (Wordpress 5, JavaScript)",
            ],
          },
          {
            title: "En todo el proceso de los proyectos desespeñé",
            list: [
                "Analisis e implementacion de los requerimientos",
                "Soluciones de Bug’s",
                "Despligue a entronos de Produccion y Desarrollo"
            ],
          },
      ],
    },
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
      "Bulma",
      "Bootstrap",
      "jQuery",
      "Sass",
    ],
    content: [
        {
          title: "Responsable del area, analisis, planificacion de nuevos y mantencion de proyectos / servicios",
          list: [
            "Manejo de servidores Linux",
            "Docker",
            "Automatizacion de procesos",
          ],
        }
      ],
  }