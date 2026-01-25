export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  pricing: string;
  cta: string;
  deliverables: string[];
  timeline: string;
}

export const SERVICES: Service[] = [
  {
    id: "architecture",
    icon: "cpu",
    title: "Arquitectura de Sistemas Escalables",
    description: "Diseño y optimización de arquitecturas tecnológicas que crecen con tu startup",
    benefits: [
      "Reduce costos de infraestructura 30-50%",
      "Mejora performance 40-60%",
      "Prepara tu sistema para scale",
      "Elimina deuda técnica acumulada"
    ],
    pricing: "USD 2,500 - 5,000",
    cta: "Evaluar mi arquitectura",
    deliverables: [
      "Análisis de arquitectura actual",
      "Plan de migración escalable",
      "Documentación técnica completa",
      "Mentoring al equipo"
    ],
    timeline: "2-4 semanas"
  },
  {
    id: "performance",
    icon: "zap",
    title: "Optimización de Performance",
    description: "Aceleración de aplicaciones web y móviles para mejor experiencia de usuario",
    benefits: [
      "Tiempo de carga -60%",
      "Core Web Vitals óptimos",
      "Conversión +25%",
      "SEO score +30 puntos"
    ],
    pricing: "USD 1,500 - 3,000",
    cta: "Optimizar mi aplicación",
    deliverables: [
      "Audit completo de performance",
      "Implementación de mejoras",
      "Setup de monitoreo continuo",
      "Guía de best practices"
    ],
    timeline: "1-3 semanas"
  },
  {
    id: "strategy",
    icon: "compass",
    title: "Estrategia Tecnológica",
    description: "Definición de roadmap tecnológico alineado con objetivos de negocio",
    benefits: [
      "Toma de decisiones basada en datos",
      "Risk mitigation",
      "Team alignment",
      "ROI tecnológico medible"
    ],
    pricing: "USD 2,000 - 4,000",
    cta: "Planear mi estrategia",
    deliverables: [
      "Technology assessment",
      "Roadmap 12-18 meses",
      "KPIs y métricas",
      "Presentación para stakeholders"
    ],
    timeline: "2-3 semanas"
  },
  {
    id: "mentoring",
    icon: "graduation-cap",
    title: "Mentoring Técnico",
    description: "Acompañamiento a equipos de desarrollo para acelerar crecimiento",
    benefits: [
      "Productividad del equipo +40%",
      "Best practices adoptadas",
      "Code reviews sistemáticos",
      "Knowledge transfer"
    ],
    pricing: "USD 150 - 300 / hora",
    cta: "Mentorar a mi equipo",
    deliverables: [
      "Sesiones semanales",
      "Code reviews",
      "Architecture reviews",
      "Technical coaching"
    ],
    timeline: "3-12 meses (continuo)"
  }
];