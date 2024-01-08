export interface PreviousExperience{
    title: string;
    description: string;
    date: string;
}

export interface Experience{
    title: string;
    description: string;
    date: string;
    current: boolean;
    stack: string[];
    link?: string;
    prev?: PreviousExperience;
}