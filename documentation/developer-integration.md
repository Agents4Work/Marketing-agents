# Manual de Integración para Desarrolladores

## Introducción

Este manual proporciona instrucciones detalladas para desarrolladores que deseen crear o modificar agentes en la plataforma de Marketing AI. El Sistema de Identificación de Agentes con Control de Versiones debe ser integrado correctamente para garantizar la compatibilidad y estabilidad en toda la plataforma.

## Índice

1. [Configuración del Entorno](#configuración-del-entorno)
2. [Creación de un Nuevo Agente](#creación-de-un-nuevo-agente)
3. [Actualización de Agentes Existentes](#actualización-de-agentes-existentes)
4. [Integración con Componentes de la Plataforma](#integración-con-componentes-de-la-plataforma)
5. [Prácticas Recomendadas](#prácticas-recomendadas)
6. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

## Configuración del Entorno

Antes de comenzar a desarrollar, asegúrese de tener las siguientes dependencias y estructuras:

```
client/
  ├── src/
  │   ├── services/
  │   │   ├── agentService.ts    # Servicio central para agentes
  │   ├── types/
  │   │   ├── marketplace.ts     # Definiciones de tipos principales
  │   │   ├── agent-version.ts   # Tipos específicos de versionado
  │   ├── data/
  │   │   ├── agents/            # Implementaciones de agentes
```

## Creación de un Nuevo Agente

### 1. Generación de ID Único para el Agente

Para crear un nuevo agente con un identificador garantizado como único, utilice el servicio de agentes para generar el ID:

```typescript
// client/src/data/agents/create-agent.ts
import agentService from '../../services/agentService';
import { ExtendedAgent } from '../../types/marketplace';

// Generar un ID único para el agente basado en su categoría
const uniqueAgentId = agentService.generateUniqueAgentId('marketing');
// Resultado ejemplo: marketing-1742432650378-a7f9b
```

Alternativamente, puede generar manualmente un ID siguiendo el formato establecido, pero esto no es recomendado ya que no verifica contra la base de datos de IDs existentes:

```typescript
function manuallyGenerateAgentId(category: string): string {
  const timestamp = Date.now();
  const randomSuffix = Array(5)
    .fill(0)
    .map(() => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)])
    .join('');
  return `${category}-${timestamp}-${randomSuffix}`;
}
```

### 2. Definir los Metadatos del Agente

Cree un nuevo archivo en `client/src/data/agents/` con el siguiente formato:

```typescript
// client/src/data/agents/my-new-agent.ts
import { ExtendedAgent } from '../../types/marketplace';
import agentService from '../../services/agentService';

// Utilizar el servicio para generar un ID único
const agentId = agentService.generateUniqueAgentId('marketing');

export const myNewAgent: ExtendedAgent = {
  id: agentId, // ID único generado automáticamente
  name: "Mi Nuevo Agente",
  category: "marketing",
  description: "Descripción completa de lo que hace el agente",
  shortDescription: "Descripción corta para tarjetas",
  avatar: "/images/agents/my-agent-avatar.png",
  rating: 4.5,
  reviews: 0,
  level: "Intermedio",
  compatibility: 100,
  skills: ["SEO", "Copywriting", { name: "Email Marketing", level: 3 }],
  primaryColor: "#4F46E5",
  secondaryColor: "#818CF8",
  tags: ["marketing", "copy", "email"],
  
  // Información de versión (obligatorio)
  version: "1.0.0",
  compatibleVersions: [],
  releaseDate: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  changelog: [
    {
      version: "1.0.0",
      date: new Date().toISOString(),
      changes: [
        "Versión inicial del agente",
        "Capacidad de generar contenido SEO",
        "Soporte para análisis de keywords"
      ]
    }
  ],
  
  // Otros campos requeridos...
  free: true,
  benefits: ["Beneficio 1", "Beneficio 2"],
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

// Registrar el agente en el sistema para verificar unicidad del ID
agentService.registerAgent(myNewAgent).then(registeredAgent => {
  console.log(`Agente registrado con ID: ${registeredAgent.id}`);
}).catch(error => {
  console.error('Error al registrar agente:', error);
});
```

### 2. Implementar la Funcionalidad del Agente

Cree la implementación del agente en el mismo archivo:

```typescript
/**
 * Implementación del agente
 */
export async function executeMyNewAgent(params: Record<string, any>): Promise<string> {
  // Lógica del agente
  return "Resultado generado por el agente";
}
```

### 3. Registrar el Agente en el Catálogo

Agregue el agente al catálogo principal en `client/src/data/agents/index.ts`:

```typescript
import { myNewAgent } from './my-new-agent';

export const agentCatalog = {
  // ... agentes existentes
  "unique-agent-id": myNewAgent
};
```

## Actualización de Agentes Existentes

Cuando actualice un agente existente, siga estos pasos:

### 1. Determinar el Tipo de Cambio

- **Patch (1.0.0 → 1.0.1)**: Correcciones de errores sin cambiar funcionalidad
- **Minor (1.0.0 → 1.1.0)**: Nuevas características que no rompen compatibilidad
- **Major (1.0.0 → 2.0.0)**: Cambios que rompen compatibilidad con versiones anteriores

### 2. Actualizar la Versión y el Changelog

```typescript
import { bumpVersion } from '../../types/agent-version';

// Actualizar la versión
const currentVersion = "1.0.0";
const newVersion = bumpVersion(currentVersion, "minor"); // Resulta en "1.1.0"

export const updatedAgent: ExtendedAgent = {
  // ... propiedades existentes
  
  version: newVersion,
  compatibleVersions: ["1.0.0"], // Agregar versiones con las que es compatible
  lastUpdated: new Date().toISOString(),
  changelog: [
    {
      version: newVersion,
      date: new Date().toISOString(),
      changes: [
        "Agregada nueva funcionalidad X",
        "Mejorado rendimiento en Y",
        "Corregido problema Z"
      ]
    },
    // Mantener entradas anteriores del changelog
    {
      version: "1.0.0",
      date: "2025-01-15T12:00:00Z",
      changes: ["Versión inicial"]
    }
  ]
};
```

### 3. Probar Compatibilidad

Utilice la función `getCompatibleVersion` para validar la compatibilidad con versiones anteriores:

```typescript
import { getCompatibleVersion } from '../../types/agent-version';

// Verificar si la versión 1.0.0 es compatible con la versión actual
const requestedVersion = "1.0.0";
const availableVersions = ["1.0.0", "1.1.0", "2.0.0"];
const compatibilityMap = {
  "1.1.0": ["1.0.0"],
  "2.0.0": ["1.1.0"]
};

const compatibleVersion = getCompatibleVersion(
  requestedVersion, 
  availableVersions, 
  compatibilityMap
);

console.log(`La versión compatible es: ${compatibleVersion}`);
```

## Integración con Componentes de la Plataforma

### Workflow Builder (Lego)

Cuando integre un agente en el Workflow Builder, asegúrese de:

1. Rastrear el uso del agente:

```typescript
import agentService from '../../services/agentService';

// Al arrastrar o seleccionar un agente
agentService.trackAgentUsage(
  agentId,
  agentVersion,
  { 
    type: 'workflow',
    component: 'builder' 
  },
  {
    action: 'add-to-canvas',
    timestamp: new Date().toISOString()
  }
);
```

2. Validar compatibilidad entre nodos conectados:

```typescript
// Al conectar nodos
function validateConnection(sourceNode, targetNode) {
  const sourceAgentVersion = sourceNode.data.agentVersion;
  const targetAgentId = targetNode.data.agentId;
  
  // Verificar si la versión del agente fuente es compatible con el agente destino
  return agentService.getCompatibleVersion(
    targetAgentId,
    sourceAgentVersion
  ).then(compatibleVersion => {
    return !!compatibleVersion;
  });
}
```

### Content Hub

Al generar contenido con agentes, registre la versión utilizada:

```typescript
// Al generar contenido
async function generateContent(agentId, params) {
  const result = await agentService.executeAgent(agentId, params, {
    type: 'content-hub',
    id: contentId
  });
  
  // Guardar el contenido con metadatos de versión
  saveContent({
    content: result,
    metadata: {
      agentId,
      agentVersion: agentService.getAgentVersion(agentId),
      generatedAt: new Date().toISOString()
    }
  });
  
  return result;
}
```

## Prácticas Recomendadas

1. **Seguimiento de Versiones**:
   - Use el formato semántico de versiones (SemVer): `MAJOR.MINOR.PATCH`
   - Documente claramente los cambios en cada versión
   - Mantenga el historial completo de versiones

2. **Compatibilidad**:
   - Especifique explícitamente las versiones compatibles
   - Implemente pruebas de compatibilidad para cada actualización
   - Notifique a los usuarios sobre cambios importantes

3. **Rendimiento**:
   - Optimice las llamadas a `trackAgentUsage` para evitar afectar el rendimiento
   - Use importaciones dinámicas para implementaciones de agentes grandes

4. **Seguridad**:
   - Valide siempre los parámetros de entrada
   - Evite almacenar datos sensibles en el agente
   - Implemente límites de tasa para evitar uso excesivo

## Solución de Problemas Comunes

### El agente no aparece en el Marketplace

Verifique que:
- El agente está correctamente registrado en el catálogo
- Todos los campos obligatorios están completados
- El ID del agente es único

### Error de versión incompatible

Si recibe errores de compatibilidad:
- Verifique que la lista `compatibleVersions` incluye todas las versiones soportadas
- Asegúrese de que la versión solicitada existe en el sistema
- Revise los nodos conectados en el Workflow Builder para incompatibilidades

### Problemas de seguimiento de uso

Si el seguimiento de uso no funciona:
- Verifique que está importando `agentService` correctamente
- Confirme que los parámetros pasados a `trackAgentUsage` son correctos
- Revise los logs para errores específicos

### Errores en el historial de cambios

Si el historial de versiones no se muestra correctamente:
- Asegúrese de que el array `changelog` está en orden cronológico inverso
- Verifique que cada entrada tiene un formato de fecha ISO válido
- Confirme que todas las entradas de versión tienen cambios documentados

---

Para más información, consulte la [Documentación completa del Sistema de Identificación de Agentes](./agent-identification-system.md) o contacte al equipo de desarrollo.