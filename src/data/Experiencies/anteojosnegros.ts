import type { Experience } from "../../types/Experience";

export const ANTEOJOS_NEGROS: Experience = {
  index: 4,
    date: "experience.anteojos.date",
    title: "Full Stack Developer",
    company: {
      name: "Anteojos Negros",
      link: "https://www.anteojosnegros.com",
    },
    description: "experience.anteojos.description",
    current: false,
    stack: ["PHP", "MySQL", "JavaScript", "Bootstrap", "jQuery", "Sass"],
    content: [
        {
          title: "Desarrollo de E-Commerce’s (frontend - backend)",
          list: [
            "Slim 3",
            "Blade",
            "MySQL",
            "Eloquent",
            "PHP 7",
            "jQuery",
          ],
        },
        {
          title: "Otros proyectos",
          list: [
            "Chat en tiempo real (jQuery, Pusher, PHP)",
            "Mantencion de sitios pre-existentes",
            "Template de e-commerce Admin / Client",
          ],
        },
        {
          title: "En todo el proceso de los proyectos desespeñé",
          list: [
            "Refactorizacion y reutilizacion de codigo",
            "Soluciones de Bug’s",
            "Despligue a entrono de Produccion (AWS EC2)",
          ],
        },
      ],
  }