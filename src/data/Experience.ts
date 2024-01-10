import type { Experience } from "../types/Experience";

export const EXPERIENCES: Experience[] = [
    {
        date: "experience.msk.date",
        title: "Team Lead Developer /",
        company: { name:"Medical & Scientific Knowledge", link:"https://www.msklatam.com"},
        description:"experience.msk.description",
        current: true,
        stack: ['PHP', 'Wordpress', 'MySQL', 'SQLite' , 'Laravel', 'Docker', 'Linux', 'ReactJS', 'TypeScript', 'JavaScript', 'Tailwind', 'Bulma', 'Bootstrap', 'jQuery','Sass', 'Python']
    },
    {
        date: "experience.oceano.date",
        title: "Team Lead /",
        company: { name:"Océano Medicina", link:"https://www.oceanomedicina.com.ar"},
        description: "experience.oceano.description",
        prev: {
            date: "experience.oceano.prev.date",
            title: "Full Stack Developer",
            description:"experience.oceano.prev.description",
        },
        current: false,
        stack: ['PHP', 'Wordpress', 'MySQL', 'SQLite' , 'Laravel', 'Docker', 'Linux', 'ReactJS', 'TypeScript', 'JavaScript', 'Bulma', 'Bootstrap', 'jQuery', 'Sass']
    },
    {
        date: "experience.anteojos.date",
        title: "Full Stack Developer /",
        company: { name:"Anteojos Negros", link:"https://www.anteojosnegros.com"},
        description:"experience.anteojos.description",
        current: false,
        stack: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap', 'jQuery','Sass']
    },
    {
        date: "experience.fravega.date",
        title: "Analista de Aplicaciones N2 /",
        company: { name:"Frávega", link:"https://www.fravega.com"},
        description:"experience.fravega.description",
        current: false,
        stack: ['PHP', 'Bash', 'JavaScript', 'Bootstrap', 'jQuery', 'MySQL']
    },
    {
        date: "experience.aufi.date",
        title: "Web Developer /",
        company: { name:"Aufiero Informática", link:"https://www.aufieroinformatica.com"},
        description: "experience.aufi.description",
        current: false,
        stack: ['JavaScript', 'Bootstrap', 'jQuery', 'Wordpress','Sass']
    },
];