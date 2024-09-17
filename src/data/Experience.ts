import type { Experience } from "../types/Experience";
import { ANTEOJOS_NEGROS } from "./Experiencies/anteojosnegros";
import { AUFIERO } from "./Experiencies/aufiero";
import { FRAVEGA } from "./Experiencies/fravega";
import { MSK } from "./Experiencies/msk";
import { OCEANO } from "./Experiencies/oceano";
import { SOLUTICA } from "./Experiencies/solutica";

export const EXPERIENCES: Experience[] = [
  { ...SOLUTICA },
  { ...MSK },
  { ...OCEANO },
  { ...ANTEOJOS_NEGROS },
  { ...FRAVEGA },
  { ...AUFIERO },
];
