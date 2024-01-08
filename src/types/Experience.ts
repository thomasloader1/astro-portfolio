export interface PreviousExperience{
    title: string;
    description: string;
    date: string;
}

export interface Company{
    name: string;
    link: string;
}

export interface Experience{
    title: string;
    company: Company;
    description: string;
    date: string;
    current: boolean;
    stack: string[];
    prev?: PreviousExperience;
}