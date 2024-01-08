import type { Experience } from "../types/Experience";

export const EXPERIENCES: Experience[] = [
    {
        date: "Noviembre 2023",
        title: "Team Lead Developer",
        company: { name:"Medical & Scientific Knowledge", link:"https://www.msklatam.com"},
        description:
            "Desarrollo y monitoreo de aplicaciones, servicios, plataforma de pagos y automatizaciones en CRM’s y comunicacion entre otras areas teniendo equipo a cargo internos y externos",
        current: true,
        stack: ['PHP', 'Wordpress', 'MySQL', 'SQLite' , 'Laravel', 'Docker', 'Linux', 'ReactJS', 'TypeScript', 'JavaScript', 'Tailwind', 'Bulma', 'Bootstrap', 'jQuery','Sass', 'Python']
    },
    {
        date: "Octubre 2022 hasta Noviembre 2023",
        title: "Team Lead",
        company: { name:"Océano Medicina", link:"https://www.oceanomedicina.com.ar"},
        description:
            "Desarrollo y monitoreo de aplicaciones, servicios, plataforma de pagos y automatizaciones en CRM’s y comunicacion entre otras areas teniendo equipo a cargo internos y externos",
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
        title: "Full Stack Developer",
        company: { name:"Anteojos Negros", link:"https://www.anteojosnegros.com"},
        description:
            "Desarrollo integro de e-commerce’s, Landing Pages y Single Page Applications",
        current: false,
        stack: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap', 'jQuery','Sass']
    },
    {
        date: "Marzo 2020 hasta Septiembre 2021",
        title: "Analista de Aplicaciones N2",
        company: { name:"Frávega", link:"https://www.fravega.com"},
        description:
            "Elaboracion de tareas automatizadas, monitoreo de aplicativos y despliegues programados",
        current: false,
        stack: ['PHP', 'Bash', 'JavaScript', 'Bootstrap', 'jQuery', 'MySQL']
    },
    {
        date: "Septiembre 2019 hasta Marzo 2020",
        title: "Web Developer",
        company: { name:"Aufiero Informática", link:"https://www.aufieroinformatica.com"},
        description:
            "Desarrollo de paginas estaticas y dinamicas",
        current: false,
        stack: ['JavaScript', 'Bootstrap', 'jQuery', 'Wordpress','Sass']
    },
];