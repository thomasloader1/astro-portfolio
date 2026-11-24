// Project cards — shared by the Projects section and the llms.txt endpoints.

export interface Project {
  catKey: string;
  title: string;
  roleKey: string;
  descKey: string;
  techs: string[];
  url?: string;
  repo?: string;
}

export const projects: Project[] = [
  {
    catKey: "proj.p2Cat",
    title: "Bday",
    roleKey: "proj.p2Role",
    descKey: "proj.p2Desc",
    techs: ["Next.js", "React", "TypeScript", "Firebase", "Tailwind"],
    url: "https://gtg-bday.vercel.app",
    repo: "https://github.com/thomasloader1/bday",
  },
  {
    catKey: "proj.p3Cat",
    title: "WIRIN",
    roleKey: "proj.p3Role",
    descKey: "proj.p3Desc",
    techs: ["Angular", ".NET Core", "TypeScript", "Azure", "Docker"],
    url: "https://wirinadaptalanding.vercel.app"
  },
   {
    catKey: "proj.p4Cat",
    title: "Calculadora Financiera",
    roleKey: "proj.p4Role",
    descKey: "proj.p4Desc",
    techs: ["Next.js", "Firebase", "TypeScript"],
    url: "https://calculadora.gomeztomasgonzalo.com.ar"
  },
  {
    catKey: "proj.p5Cat",
    title: "AWS SSO",
    roleKey: "proj.p5Role",
    descKey: "proj.p5Desc",
    techs: ["Powershell", "AWS CLI", "Session Manager"],
    repo: "https://github.com/thomasloader1/aws-sso-automation"
  },
  {
    catKey: "proj.p6Cat",
    title: "Migrate CLI",
    roleKey: "proj.p6Role",
    descKey: "proj.p6Desc",
    techs: ["JavaScript", "SQL Server", "PostgreSQL", "Node.js"],
    repo: "https://github.com/thomasloader1/migrate-cli"
  },
];
