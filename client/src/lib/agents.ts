/**
 * Definiciones de tipos y utilidades para agentes
 */

/**
 * Tipos de agentes disponibles en el sistema
 */
export type AgentType = 
  | 'seo'
  | 'copywriting'
  | 'ads'
  | 'creative'
  | 'email'
  | 'analytics'
  | 'social'
  | 'strategy';

/**
 * Definición básica de un agente
 */
export interface IAgent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  avatar?: string;
  capabilities: string[];
  skills?: string[] | Array<{name: string; level: number}>;
  configuration?: {
    model: string;
    temperature: number;
    maxTokens: number;
    endpoints: {
      generate: string;
      refine: string;
      analyze: string;
    };
  };
  premium?: boolean;
  trending?: boolean;
  new?: boolean;
}

/**
 * Representa una habilidad de un agente con su nivel
 */
export interface AgentSkill {
  name: string;
  level: number;
}

/**
 * Objeto para mapear colores a tipos de agentes
 */
export const agentColors: Record<AgentType, string> = {
  seo: 'bg-amber-500 text-amber-50',
  copywriting: 'bg-sky-500 text-sky-50',
  ads: 'bg-violet-500 text-violet-50',
  creative: 'bg-rose-500 text-rose-50',
  email: 'bg-emerald-500 text-emerald-50',
  analytics: 'bg-blue-500 text-blue-50',
  social: 'bg-pink-500 text-pink-50',
  strategy: 'bg-indigo-500 text-indigo-50'
};

/**
 * Iconos por tipo de agente - usamos strings para evitar problemas con TSX
 */
export const agentIconNames: Record<AgentType, string> = {
  seo: 'Search',
  copywriting: 'FileEdit',
  ads: 'BarChart3',
  creative: 'PenTool',
  email: 'Mail',
  analytics: 'BarChart3',
  social: 'Share2',
  strategy: 'MessageSquare'
};

/**
 * Verifica si un skill es un objeto con name y level
 */
export function isSkillObject(skill: any): skill is AgentSkill {
  return typeof skill === 'object' && 'name' in skill && 'level' in skill;
}

/**
 * Obtiene el color de un agente basado en su tipo
 */
export function getAgentColor(type: AgentType): string {
  return agentColors[type] || 'gray';
}

/**
 * Colección de agentes por defecto
 */
export const DEFAULT_AGENTS: IAgent[] = [
  {
    id: 'alex-copywriter-1',
    name: 'Alex Copywriter',
    type: 'copywriting',
    description: 'Award-winning AI copywriter specializing in persuasion and conversion optimization',
    capabilities: ['Marketing Copy', 'Product Descriptions', 'Ad Copy', 'Email Sequences', 'Landing Pages'],
    skills: [
      { name: 'Persuasive Writing', level: 5 },
      { name: 'Brand Voice', level: 5 },
      { name: 'Marketing Strategy', level: 4 },
      { name: 'SEO Optimization', level: 4 },
      { name: 'A/B Testing', level: 4 }
    ],
    configuration: {
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 2048,
      endpoints: {
        generate: '/api/v1/agents/copywriter/generate',
        refine: '/api/v1/agents/copywriter/refine',
        analyze: '/api/v1/agents/copywriter/analyze'
      }
    },
    premium: true,
    trending: true,
    new: true
  },
  {
    id: '1',
    name: 'SEO Specialist',
    type: 'seo',
    description: 'Experto en optimización para motores de búsqueda',
    capabilities: ['Keyword Research', 'On-page SEO', 'Content Optimization'],
    skills: [
      { name: 'Keyword Analysis', level: 5 },
      { name: 'Technical SEO', level: 4 },
      { name: 'Content Optimization', level: 5 }
    ]
  },
  {
    id: '2',
    name: 'Copywriter',
    type: 'copywriting',
    description: 'Crea contenido persuasivo para tu marca',
    capabilities: ['Landing Pages', 'Product Descriptions', 'Brand Storytelling'],
    skills: [
      { name: 'Persuasive Writing', level: 5 },
      { name: 'Storytelling', level: 4 },
      { name: 'Brand Voice', level: 4 }
    ]
  },
  {
    id: '3',
    name: 'Ads Expert',
    type: 'ads',
    description: 'Maximiza el ROI de tus campañas publicitarias',
    capabilities: ['Google Ads', 'Facebook Ads', 'Ad Copy'],
    skills: [
      { name: 'PPC Strategy', level: 5 },
      { name: 'Ad Copywriting', level: 4 },
      { name: 'Ad Performance Analysis', level: 5 }
    ]
  },
  {
    id: '4',
    name: 'Creative Director',
    type: 'creative',
    description: 'Conceptos creativos para tus campañas',
    capabilities: ['Brand Identity', 'Campaign Concepts', 'Creative Strategy'],
    skills: [
      { name: 'Visual Design', level: 4 },
      { name: 'Creative Thinking', level: 5 },
      { name: 'Brand Strategy', level: 4 }
    ]
  },
  {
    id: '5',
    name: 'Email Marketer',
    type: 'email',
    description: 'Especialista en campañas de email marketing',
    capabilities: ['Email Sequences', 'Newsletter Design', 'Conversion Strategy'],
    skills: [
      { name: 'Email Copywriting', level: 5 },
      { name: 'Automation Flows', level: 4 },
      { name: 'A/B Testing', level: 4 }
    ]
  },
  {
    id: '6',
    name: 'Analytics Specialist',
    type: 'analytics',
    description: 'Analiza y optimiza el rendimiento de tus campañas',
    capabilities: ['Data Analysis', 'Performance Reporting', 'Conversion Tracking'],
    skills: [
      { name: 'Data Interpretation', level: 5 },
      { name: 'Google Analytics', level: 4 },
      { name: 'Conversion Optimization', level: 4 }
    ]
  },
  {
    id: '7',
    name: 'Social Media Manager',
    type: 'social',
    description: 'Estrategia y contenido para redes sociales',
    capabilities: ['Content Calendar', 'Community Management', 'Platform Strategy'],
    skills: [
      { name: 'Social Copywriting', level: 5 },
      { name: 'Trend Analysis', level: 4 },
      { name: 'Community Engagement', level: 5 }
    ]
  },
  {
    id: '8',
    name: 'Strategy Director',
    type: 'strategy',
    description: 'Planificación estratégica para campañas de marketing',
    capabilities: ['Brand Strategy', 'Campaign Planning', 'Market Analysis'],
    skills: [
      { name: 'Strategic Planning', level: 5 },
      { name: 'Market Research', level: 4 },
      { name: 'Campaign Direction', level: 5 }
    ]
  }
];