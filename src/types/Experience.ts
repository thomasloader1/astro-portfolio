export interface PreviousExperience{
    title: string;
    description: string;
    date: string;
}

export interface Company{
    name: string;
    link: string;
}

export interface Project{
    name: string;
      tech: string[];
}

export interface Experience {
    title: string;
    company: string;
    period: string;
    description: string[];
    technologies: string[];
    tasks:{
      name: string,
      detail: string[]
    }[]
    projects?: {
      name: string;
      tech: string[];
    }[];
    prev?: PreviousExperience
  }