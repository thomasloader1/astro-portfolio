import type { Experience } from "../../types/Experience";

export const FRAVEGA: Experience = {
    date: "experience.fravega.date",
    title: "Analista de Aplicaciones N2",
    company: { name: "Frávega", link: "https://www.fravega.com" },
    description: "experience.fravega.description",
    current: false,
    stack: ["PHP", "Bash", "JavaScript", "Bootstrap", "jQuery", "MySQL"],
    content: [
        {
          title: "Panel de alertas (frontend)",
          list: [
            "PHP",
            "jQuery",
            "Automatizacion de procesos y eventos",
          ],
        },
        {
          title: "Tareas del area",
          list: [
            "Automatizaciones (Bash, Rundeck)",
            "Ordenes de envio (ASAP)",
            "Soporte general de aplicativos",
            "Actualizacion del software a sucursales",
          ],
        },
        {
          title: "En todo el proceso de los proyectos desespeñé",
          list: [
            "Acceso SSH a servidores Linux y Windows",
          ],
        },
      ],
  }