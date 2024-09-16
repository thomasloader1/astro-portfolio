import type { Experience } from "../types/Experience";
import { ANTEOJOS_NEGROS } from "./Experiencies/anteojosnegros";
import { AUFIERO } from "./Experiencies/aufiero";
import { FRAVEGA } from "./Experiencies/fravega";
import { MSK } from "./Experiencies/msk";
import { OCEANO } from "./Experiencies/oceano";

export const EXPERIENCES: Experience[] = [
  {
    date: "experience.solutica.date",
    title: "Full Stack Developer",
    company: { name: "Solutica", link: "https://www.msklatam.com" },
    description: "experience.solutica.description",
    current: true,
    stack: [],
  },
  { ...MSK },
  { ...OCEANO },
  { ...ANTEOJOS_NEGROS },
  { ...FRAVEGA },
  { ...AUFIERO },
];
