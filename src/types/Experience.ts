export interface PreviousExperience{
    title: string;
    description: string;
    date: string;
    content: ContentExperience[];
}
export interface ContentExperience{
    title: string;
    list: string[]
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
    content?: ContentExperience[];
}