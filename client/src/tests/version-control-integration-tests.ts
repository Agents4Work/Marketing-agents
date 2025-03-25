/**
 * Pruebas de Integración para el Sistema de Identificación de Agentes con Control de Versiones
 * 
 * Este archivo contiene pruebas que verifican la integración correcta del sistema de control
 * de versiones entre los diferentes componentes de la plataforma: Marketplace,
 * Workflow Builder, Content Hub y otros componentes relacionados.
 */

import { ExtendedAgent } from '../types/marketplace';
import agentService from '../services/agentService';

/**
 * Función de ayuda para ejecutar pruebas
 */
function runTest(testName: string, testFn: () => Promise<boolean>): Promise<void> {
  return testFn()
    .then(result => {
      if (result) {
        console.log(`✅ ${testName}: Prueba exitosa`);
      } else {
        console.error(`❌ ${testName}: Prueba fallida`);
      }
    })
    .catch(error => {
      console.error(`❌ ${testName}: Error - ${error.message}`);
    });
}

/**
 * Datos de prueba para un agente ficticio
 */
const mockAgent: ExtendedAgent = {
  id: "test-integration-agent",
  name: "Agente de Prueba",
  category: "marketing",
  description: "Agente para pruebas de integración",
  shortDescription: "Agente de prueba",
  avatar: "/images/agents/test-avatar.png",
  rating: 4.5,
  reviews: 0,
  level: "Intermedio",
  compatibility: 100,
  skills: ["Pruebas", "Integración"],
  primaryColor: "#4F46E5",
  secondaryColor: "#818CF8",
  tags: ["test", "integration"],
  
  // Información de versión
  version: "1.0.0",
  compatibleVersions: [],
  releaseDate: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  changelog: [
    {
      version: "1.0.0",
      date: new Date().toISOString(),
      changes: ["Versión inicial para pruebas de integración"]
    }
  ],
  
  free: true,
  benefits: ["Beneficio de prueba"],
  testimonials: [],
  sampleOutputs: [],
  compatibleAgents: [],
  useCases: [],
  performance: {
    conversionRate: 80,
    engagementScore: 75,
    outputQuality: 85,
    creativity: 70,
    consistency: 90
  }
};

/**
 * Prueba el registro y la obtención de un agente por su ID y versión
 */
async function testAgentRegistrationAndRetrieval() {
  let testPassed = true;
  
  try {
    // Registrar un agente de prueba
    await agentService.registerAgent(mockAgent);
    
    // Obtener el agente por ID
    const retrievedAgent = await agentService.getAgent(mockAgent.id);
    
    if (!retrievedAgent) {
      console.error('No se pudo recuperar el agente');
      return false;
    }
    
    // Verificar que los datos coincidan
    if (retrievedAgent.id !== mockAgent.id) {
      console.error('ID no coincide');
      testPassed = false;
    }
    
    if (retrievedAgent.version !== mockAgent.version) {
      console.error('Versión no coincide');
      testPassed = false;
    }
    
    // Obtener por versión específica
    const versionSpecificAgent = await agentService.getAgentVersion(mockAgent.id, mockAgent.version);
    
    if (!versionSpecificAgent) {
      console.error('No se pudo recuperar el agente con versión específica');
      return false;
    }
    
    if (versionSpecificAgent.version !== mockAgent.version) {
      console.error('Versión específica no coincide');
      testPassed = false;
    }
    
  } catch (error) {
    console.error('Error en la prueba:', error);
    testPassed = false;
  }
  
  return testPassed;
}

/**
 * Prueba el rastreo de uso de agentes
 */
async function testAgentUsageTracking() {
  let testPassed = true;
  
  try {
    const usageContext = {
      type: 'test-integration',
      component: 'workflow-builder'
    };
    
    const usageMetadata = {
      testId: 'integration-test-1',
      timestamp: new Date().toISOString()
    };
    
    // Registrar uso del agente
    await agentService.trackAgentUsage(
      mockAgent.id, 
      mockAgent.version,
      usageContext,
      usageMetadata
    );
    
    // Obtener historial de uso
    const usageHistory = await agentService.getAgentUsageHistory(mockAgent.id);
    
    if (!usageHistory || usageHistory.length === 0) {
      console.error('No se encontró historial de uso');
      return false;
    }
    
    // Verificar que el último uso registrado coincida con nuestros datos
    const lastUsage = usageHistory[usageHistory.length - 1];
    
    if (lastUsage.agentId !== mockAgent.id) {
      console.error('ID de agente en historial no coincide');
      testPassed = false;
    }
    
    if (lastUsage.version !== mockAgent.version) {
      console.error('Versión en historial no coincide');
      testPassed = false;
    }
    
    if (lastUsage.context.type !== usageContext.type) {
      console.error('Contexto de uso en historial no coincide');
      testPassed = false;
    }
    
  } catch (error) {
    console.error('Error en la prueba:', error);
    testPassed = false;
  }
  
  return testPassed;
}

/**
 * Prueba la actualización de versión de un agente
 */
async function testAgentVersionUpdate() {
  let testPassed = true;
  
  try {
    // Crear un clon del agente con versión actualizada
    const updatedAgent = { 
      ...mockAgent,
      version: "1.1.0",
      compatibleVersions: ["1.0.0"],
      lastUpdated: new Date().toISOString(),
      changelog: [
        {
          version: "1.1.0",
          date: new Date().toISOString(),
          changes: ["Actualización para pruebas de integración"]
        },
        ...mockAgent.changelog
      ]
    };
    
    // Registrar la nueva versión
    await agentService.updateAgentVersion(updatedAgent);
    
    // Obtener el agente (debería retornar la versión más reciente)
    const retrievedAgent = await agentService.getAgent(mockAgent.id);
    
    if (!retrievedAgent) {
      console.error('No se pudo recuperar el agente actualizado');
      return false;
    }
    
    if (retrievedAgent.version !== "1.1.0") {
      console.error('La versión no se actualizó correctamente');
      testPassed = false;
    }
    
    // Verificar que podemos obtener ambas versiones por separado
    const oldVersion = await agentService.getAgentVersion(mockAgent.id, "1.0.0");
    const newVersion = await agentService.getAgentVersion(mockAgent.id, "1.1.0");
    
    if (!oldVersion || oldVersion.version !== "1.0.0") {
      console.error('No se pudo recuperar la versión anterior');
      testPassed = false;
    }
    
    if (!newVersion || newVersion.version !== "1.1.0") {
      console.error('No se pudo recuperar la nueva versión');
      testPassed = false;
    }
    
  } catch (error) {
    console.error('Error en la prueba:', error);
    testPassed = false;
  }
  
  return testPassed;
}

/**
 * Prueba la compatibilidad entre versiones
 */
async function testVersionCompatibility() {
  let testPassed = true;
  
  try {
    // Verificar compatibilidad entre versiones
    const isCompatible = await agentService.isVersionCompatible(
      mockAgent.id,
      "1.0.0",
      "1.1.0"
    );
    
    if (!isCompatible) {
      console.error('Las versiones deberían ser compatibles');
      testPassed = false;
    }
    
    // Verificar incompatibilidad
    const isIncompatible = await agentService.isVersionCompatible(
      mockAgent.id,
      "1.0.0",
      "2.0.0" // Asumimos que no existe o no es compatible
    );
    
    if (isIncompatible) {
      console.error('Las versiones no deberían ser compatibles');
      testPassed = false;
    }
    
  } catch (error) {
    console.error('Error en la prueba:', error);
    testPassed = false;
  }
  
  return testPassed;
}

/**
 * Prueba la integración con el Workflow Builder
 */
async function testWorkflowBuilderIntegration() {
  let testPassed = true;
  
  try {
    // Simular uso de un agente en el Workflow Builder
    const workflowContext = {
      type: 'workflow',
      component: 'builder',
      workflowId: 'test-workflow-123'
    };
    
    // Registrar uso
    await agentService.trackAgentUsage(
      mockAgent.id,
      mockAgent.version,
      workflowContext,
      { action: 'add-to-canvas' }
    );
    
    // Verificar que el agente está disponible para el Workflow Builder
    const isAvailable = await agentService.isAgentAvailableFor(
      mockAgent.id,
      'workflow'
    );
    
    if (!isAvailable) {
      console.error('El agente debería estar disponible para workflows');
      testPassed = false;
    }
    
    // Obtener todos los agentes disponibles para workflows
    const workflowAgents = await agentService.getAgentsForContext('workflow');
    
    if (!workflowAgents.some(a => a.id === mockAgent.id)) {
      console.error('El agente no aparece en la lista de agentes para workflow');
      testPassed = false;
    }
    
  } catch (error) {
    console.error('Error en la prueba:', error);
    testPassed = false;
  }
  
  return testPassed;
}

/**
 * Prueba la integración con el Content Hub
 */
async function testContentHubIntegration() {
  let testPassed = true;
  
  try {
    // Simular generación de contenido
    const contentContext = {
      type: 'content-hub',
      component: 'generator',
      contentId: 'test-content-123'
    };
    
    // Registrar uso
    await agentService.trackAgentUsage(
      mockAgent.id,
      mockAgent.version,
      contentContext,
      { 
        contentType: 'blog-post',
        generatedAt: new Date().toISOString()
      }
    );
    
    // Verificar que podemos obtener metadatos del contenido generado
    const contentMetadata = await agentService.getContentGenerationMetadata('test-content-123');
    
    if (!contentMetadata) {
      console.error('No se pudieron recuperar los metadatos del contenido');
      return false;
    }
    
    if (contentMetadata.agentId !== mockAgent.id) {
      console.error('ID de agente en metadatos no coincide');
      testPassed = false;
    }
    
    if (contentMetadata.version !== mockAgent.version) {
      console.error('Versión en metadatos no coincide');
      testPassed = false;
    }
    
  } catch (error) {
    console.error('Error en la prueba:', error);
    testPassed = false;
  }
  
  return testPassed;
}

/**
 * Ejecuta todas las pruebas de integración
 */
export async function runAllIntegrationTests() {
  console.log('🧪 Iniciando pruebas de integración del sistema de control de versiones');
  
  console.log('\n📋 Prueba de registro y obtención de agentes:');
  await runTest('Registro y Obtención', testAgentRegistrationAndRetrieval);
  
  console.log('\n📋 Prueba de rastreo de uso:');
  await runTest('Rastreo de Uso', testAgentUsageTracking);
  
  console.log('\n📋 Prueba de actualización de versión:');
  await runTest('Actualización de Versión', testAgentVersionUpdate);
  
  console.log('\n📋 Prueba de compatibilidad entre versiones:');
  await runTest('Compatibilidad', testVersionCompatibility);
  
  console.log('\n📋 Prueba de integración con Workflow Builder:');
  await runTest('Workflow Builder', testWorkflowBuilderIntegration);
  
  console.log('\n📋 Prueba de integración con Content Hub:');
  await runTest('Content Hub', testContentHubIntegration);
  
  console.log('\n🏁 Pruebas de integración completadas\n');
}

// Si este archivo se ejecuta directamente, ejecutar las pruebas
if (typeof require !== 'undefined' && require.main === module) {
  runAllIntegrationTests().catch(console.error);
}