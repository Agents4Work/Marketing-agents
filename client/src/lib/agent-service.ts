/**
 * Agent Service
 * 
 * Servicio centralizado para la gestión de agentes, incluyendo:
 * - Registro y recuperación de agentes
 * - Control de versiones
 * - Registro de uso y estadísticas
 */

import { Agent, ExtendedAgent, AgentExecution, ChangelogEntry } from "@/types/marketplace";
import { agents } from "@/data/agents";
import { formatAgentVersion, areVersionsCompatible, compareVersions } from "./agent-version-control";

// Tipo para el contexto de ejecución de un agente
export interface ExecutionContext {
  userId: number;
  contextType: string;
  contextId: string;
  parameters: Record<string, any>;
}

// Clase para el servicio de agentes
class AgentService {
  /**
   * Ejecuta un agente con los parámetros y contexto dados
   */
  async executeAgent(
    agentId: string, 
    parameters: Record<string, any>,
    context: ExecutionContext
  ): Promise<any> {
    // Simula la ejecución de un agente
    console.log(`Executing agent ${agentId} with parameters:`, parameters);
    
    // Registra el uso del agente
    this.trackAgentUsage(agentId, '1.0', context);

    // Simulamos una respuesta
    return {
      content: "Este es el contenido generado por el agente.",
      metadata: {
        processingTime: 1.2,
        tokensUsed: 150,
      }
    };
  }

  /**
   * Registra la ejecución de un agente en el historial
   */
  async recordExecution(execution: Partial<AgentExecution>): Promise<AgentExecution> {
    const fullExecution: AgentExecution = {
      executionId: `exec-${Date.now()}`,
      agentId: execution.agentId || '',
      agentVersion: execution.agentVersion || '1.0',
      contextType: execution.contextType || 'unknown',
      contextId: execution.contextId || '',
      userId: execution.userId || 0,
      timestamp: execution.timestamp || new Date(),
      parameters: execution.parameters || {},
      status: execution.status || 'completed',
      result: execution.result,
      error: execution.error,
      duration: execution.duration
    };

    console.log("Recorded agent execution:", fullExecution);
    return fullExecution;
  }

  /**
   * Obtiene la lista de todos los agentes disponibles
   */
  getAgents(): Agent[] {
    return agents;
  }

  /**
   * Obtiene un agente por su ID
   */
  getAgentById(id: string): Agent | null {
    return agents.find(agent => agent.id === id) || null;
  }

  /**
   * Obtiene el historial de versiones para un agente
   */
  getAgentVersions(agentId: string): ChangelogEntry[] {
    const agent = this.getAgentById(agentId) as ExtendedAgent;
    return agent?.changelog || [];
  }

  /**
   * Verifica si un agente es compatible con una versión específica
   */
  isCompatibleWith(agentId: string, version: string): boolean {
    const agent = this.getAgentById(agentId);
    if (!agent || !agent.version) return false;
    
    // Si el agente tiene versiones compatibles especificadas, verificar contra ellas
    if (agent.compatibleVersions && agent.compatibleVersions.length > 0) {
      return agent.compatibleVersions.includes(version);
    }
    
    // Si no tiene compatibilidades especificadas, usar la lógica estándar
    return areVersionsCompatible(agent.version, version);
  }

  /**
   * Registra el uso de un agente para estadísticas
   */
  trackAgentUsage(
    agentId: string, 
    version: string, 
    context: { userId: number, contextType: string },
    metadata?: Record<string, any>
  ): void {
    console.log(`Agent ${agentId} v${version} used by user ${context.userId} in ${context.contextType}`);
    if (metadata) {
      console.log("Usage metadata:", metadata);
    }
  }
}

// Exportamos una instancia única del servicio
export const agentService = new AgentService();

// Función de conveniencia para obtener un agente por ID
export function getAgentById(id: string): Agent | null {
  return agentService.getAgentById(id);
}