import type { Proyect } from "../types/Proyect";

export const PROYECTS: Proyect[] = [
    {
        title: "Calculadora Financiera",
        description: "Aplicacion para calcular (50/30/20)",
        link: "https://next-calculadora-financiera.vercel.app",
        repo: "https://github.com/thomasloader1/next-calculadora-financiera",
        image: "public/calculadora_finiciera.webp",
        stack: ['NextJS', 'ReactJS','Tailwind', 'TypeScript']

    },
    {
        title: "Bday",
        description: "Aplicacion festejar eventos",
        link: "gtg-bday.vercel.app",
        repo: "https://github.com/thomasloader1/bday",
        image: "public/bday.webp",
        stack: ['NextJS', 'ReactJS','Tailwind','Firebase', 'TypeScript']

    }
];