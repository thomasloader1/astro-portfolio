import type { Experience } from "../../types/Experience";

export const AUFIERO: Experience = {
    date: "experience.aufi.date",
    title: "Web Developer",
    company: {
      name: "Aufiero Informática",
      link: "https://www.aufieroinformatica.com",
    },
    description: "experience.aufi.description",
    current: false,
    stack: ["JavaScript", "Bootstrap", "jQuery", "Wordpress", "Sass"],
    content: [
        {
          title: "Mapaprop (frontend - backend)",
          list: [
            "Angular 2",
            "Java 8",
          ],
        },
        {
          title: "Desarrollo y mantencion de paginas estaticas",
          list: [
            "Wordpress (DIVI / Elementor)",
            "HTML 5",
            "Sass",
            "JavaScript",
          ],
        }
      ],
  }