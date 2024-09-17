import {atom, type WritableAtom} from 'nanostores'
import type { Experience } from '../types/Experience';
import { EXPERIENCES } from '../data/Experience';

export const currentViewExperience: WritableAtom<Experience> = atom(EXPERIENCES[0]);

export function setCurrentViewExperience(experience: Experience){
    currentViewExperience.set(experience)
} 