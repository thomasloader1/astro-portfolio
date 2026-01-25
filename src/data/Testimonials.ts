export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  project: string;
  metrics?: {
    label: string;
    value: string;
  }[];
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "María González",
    position: "CTO",
    company: "FinTech Startup",
    avatar: "/avatars/maria-gonzalez.jpg",
    content: "Tomás transformó nuestra arquitectura monolítica en un sistema microservicios escalable. Redujimos costos de infraestructura 45% y mejoramos el tiempo de respuesta 60%. Su expertise en startups fue clave para nuestro éxito.",
    rating: 5,
    project: "Arquitectura Escalable",
    metrics: [
      { label: "Reducción costos", value: "-45%" },
      { label: "Performance mejorada", value: "+60%" },
      { label: "Time-to-market", value: "-3 meses" }
    ]
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    position: "CEO",
    company: "E-commerce Platform",
    avatar: "/avatars/carlos-rodriguez.jpg",
    content: "La optimización de performance que Tomás implementó duplicó nuestra tasa de conversión. Su enfoque metodológico y comunicación constante mantuvieron al equipo alineado durante todo el proceso.",
    rating: 5,
    project: "Optimización Performance",
    metrics: [
      { label: "Tasa conversión", value: "+100%" },
      { label: "Core Web Vitals", value: "Verde" },
      { label: "Bounce rate", value: "-35%" }
    ]
  },
  {
    id: "3",
    name: "Ana Martínez",
    position: "Product Manager",
    company: "SaaS Scale-up",
    avatar: "/avatars/ana-martinez.jpg",
    content: "Como consultor estratégico, Tomás nos ayudó a definir nuestro roadmap tecnológico para los próximos 18 meses. Su visión balanceada entre innovación y estabilidad fue exactamente lo que necesitábamos.",
    rating: 5,
    project: "Estrategia Tecnológica",
    metrics: [
      { label: "Team alignment", value: "95%" },
      { label: "Technical debt", value: "-70%" },
      { label: "Development velocity", value: "+40%" }
    ]
  }
];

export interface ClientLogo {
  id: string;
  name: string;
  logo: string;
  url?: string;
}

export const CLIENT_LOGOS: ClientLogo[] = [
  { id: "1", name: "FinTech Corp", logo: "/logos/fintech-corp.svg" },
  { id: "2", name: "E-commerce Plus", logo: "/logos/ecommerce-plus.svg" },
  { id: "3", name: "SaaS Solutions", logo: "/logos/saas-solutions.svg" },
  { id: "4", name: "HealthTech Innovations", logo: "/logos/healthtech-innovations.svg" },
  { id: "5", name: "EdTech Platform", logo: "/logos/edtech-platform.svg" }
];