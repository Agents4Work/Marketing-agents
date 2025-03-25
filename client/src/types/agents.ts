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
 * Información de un agente
 */
export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  icon?: string;
  capabilities: string[];
  premium?: boolean;
}

/**
 * Habilidad de un agente
 * Puede ser un string o un objeto con nombre y nivel
 */
export type AgentSkill = string | { name: string, level: number };