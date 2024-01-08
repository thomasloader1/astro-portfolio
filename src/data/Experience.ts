import type { Experience } from "../types/Experience";

export const EXPERIENCES: Experience[] = [
    {
        date: "Noviembre 2023",
        title: "Team Developer @ Medical & Scientific Knowledge ",
        description:
            "Desarrollo y monitoreo de aplicaciones, servicios, plataforma de pagos y automatizaciones en CRM’s y comunicacion entre otras areas teniendo equipo a cargo internos y externos",
        link: "",
        current: true,
        stack: ['PHP', 'Wordpress', 'MySQL', 'SQLite' , 'Laravel', 'Docker', 'Linux', 'ReactJS', 'TypeScript', 'JavaScript', 'Tailwind', 'Bulma', 'Bootstrap', 'jQuery','Sass', 'Python']
    },
    {
        date: "Octubre 2022 hasta Noviembre 2023",
        title: "Team Lead @ Oceano Medicina",
        description:
            "Desarrollo y monitoreo de aplicaciones, servicios, plataforma de pagos y automatizaciones en CRM’s y comunicacion entre otras areas teniendo equipo a cargo internos y externos",
        link: "",
        prev: {
            date: "Octubre 2022 hasta Noviembre 2023",
            title: "Full Stack Developer",
            description:
                "Desarrollo y mantenimiento de aplicaciones, Api's Rest, cómo tambien integraciones de CRM de la empresa.",
        },
        current: false,
        stack: ['PHP', 'Wordpress', 'MySQL', 'SQLite' , 'Laravel', 'Docker', 'Linux', 'ReactJS', 'TypeScript', 'JavaScript', 'Bulma', 'Bootstrap', 'jQuery', 'Sass']
    },
    {
        date: "Marzo 2021 hasta Enero 2022",
        title: "Full Stack Developer @ Anteojos Negros",
        description:
            "Desarrollo integro de e-commerce’s, Landing Pages y Single Page Applications",
        link: "",
        current: false,
        stack: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap', 'jQuery','Sass']
    },
    {
        date: "Marzo 2020 hasta Septiembre 2021",
        title: "Analista de Aplicaciones N2  @ Fravega",
        description:
            "Elaboracion de tareas automatizadas, monitoreo de aplicativos y despliegues programados",
        link: "",
        current: false,
        stack: ['PHP', 'Bash', 'JavaScript', 'Bootstrap', 'jQuery', 'MySQL']
    },
    {
        date: "Septiembre 2019 hasta Marzo 2020",
        title: "Web Developer @ Aufiero Informatica",
        description:
            "Desarrollo de paginas estaticas y dinamicas",
        link: "",
        current: false,
        stack: ['JavaScript', 'Bootstrap', 'jQuery', 'Wordpress','Sass']
    },
];