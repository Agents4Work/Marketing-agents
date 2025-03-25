# Sistema de Identificación de Agentes con Control de Versiones (Backend)

## Descripción General

El Sistema de Identificación de Agentes con Control de Versiones proporciona una infraestructura robusta **a nivel de backend** para gestionar y rastrear las versiones de los agentes de IA en toda la plataforma. Este sistema trabaja por debajo de la interfaz visual sin modificar la apariencia definida en el documento de estándares de perfil de agente (agent-profile-standards.md). Su objetivo es garantizar la compatibilidad entre diferentes componentes y permitir una evolución controlada de los agentes mientras se mantiene la estabilidad para los usuarios.

## Características Principales

- **Identificación Única**: Cada agente tiene un identificador único y una versión específica a nivel de backend.
- **Control de Versiones**: Seguimiento completo del historial de cambios para cada agente.
- **Compatibilidad**: Definición de compatibilidad entre versiones para una transición suave.
- **Historial de Cambios**: Registro detallado de modificaciones por versión.
- **Rastreo de Uso**: Monitoreo del uso de agentes con información de versión en todos los componentes.

> **IMPORTANTE**: Este sistema es una capa de infraestructura backend que NO modifica la visualización o diseño de los agentes definida en `agent-profile-standards.md`. La apariencia visual de los agentes debe seguir estrictamente los estándares de la interfaz de usuario existentes.

## Sistema de Identificación Única

El sistema implementa mecanismos rigurosos para garantizar que cada agente tenga un identificador absolutamente único:

### Generación de IDs Únicos

1. **Estructura del ID**: Cada ID de agente sigue el formato:
   ```
   {categoría}-{timestamp}-{sufijo aleatorio}
   ```
   Ejemplo: `copy-1742431200123-a7f9b`

2. **Componentes del ID**:
   - **Prefijo de categoría**: Identifica el tipo de agente (ej: "copy-", "seo-", "analytics-")
   - **Timestamp único**: Milisegundos desde época UNIX para garantizar secuencia temporal
   - **Sufijo aleatorio**: 5 caracteres alfanuméricos para prevenir colisiones en el mismo milisegundos

3. **Algoritmo de generación**:
   ```typescript
   function generateUniqueAgentId(category: string): string {
     const timestamp = Date.now();
     const randomSuffix = generateRandomString(5);
     return `${category}-${timestamp}-${randomSuffix}`;
   }
   ```

### Verificación y Prevención de Duplicados

El sistema implementa múltiples capas de protección:

1. **Validación en registro**: Antes de registrar un nuevo agente, el sistema verifica que el ID propuesto no exista ya en la base de datos.

2. **Sistema de reserva de IDs**: Mantiene un registro centralizado de IDs reservados que no pueden ser utilizados por nuevos agentes, incluyendo:
   - IDs de agentes eliminados (para evitar reutilización)
   - IDs reservados para versiones futuras
   - IDs de sistemas externos integrados

3. **Verificación en importación**: Al importar agentes (desde marketplaces externos o migraciones), el sistema:
   - Verifica existencia de ID en el sistema actual
   - Comprueba conflictos con IDs reservados
   - Valida el formato del ID según estándares del sistema

4. **Resolución de conflictos automática**: Si se detecta un conflicto de ID, el sistema:
   - Genera un nuevo ID único según el algoritmo establecido
   - Mantiene referencia al ID original en metadata (para compatibilidad)
   - Registra el cambio en logs del sistema para auditoría
   - Notifica a administradores sobre el conflicto detectado

5. **Persistencia transaccional**: Las operaciones de registro y actualización de IDs se realizan en transacciones atómicas para prevenir condiciones de carrera.

## Arquitectura del Sistema

El sistema se basa en los siguientes componentes principales:

1. **Tipos y Interfaces**: Definidos en `marketplace.ts` y `agent-version.ts`
2. **Servicio de Agentes**: Implementado en `agentService.ts`
3. **Componentes de UI**: Integración en `AgentDetailPage.tsx`, `LegoToolbox.tsx` y otros
4. **Almacenamiento de Datos**: Estructuras para versiones y compatibilidad de agentes

## Modelo de Datos

### Agente Versionado

```typescript
interface VersionedAgent {
  version: string;               // Versión actual del agente
  compatibleVersions: string[];  // Versiones anteriores compatibles
  releaseDate: string;           // Fecha de lanzamiento de la versión
  lastUpdated: string;           // Fecha de última actualización
  changelog: ChangelogEntry[];   // Historial de cambios
}

interface ChangelogEntry {
  version: string;       // Versión donde se realizó el cambio
  date: string;          // Fecha del cambio
  changes: string[];     // Lista de cambios realizados
}
```

## Flujo de Trabajo para Desarrolladores

### Creación de un Nuevo Agente

1. Asignar un ID único al agente
2. Establecer versión inicial (e.g., "1.0.0")
3. Documentar capacidades iniciales en el changelog
4. Implementar funcionalidad del agente

### Actualización de un Agente Existente

1. Determinar el tipo de cambio (major, minor, patch)
2. Actualizar la versión según el tipo de cambio:
   - Major (1.0.0 → 2.0.0): Cambios que rompen compatibilidad
   - Minor (1.0.0 → 1.1.0): Nuevas funcionalidades compatibles
   - Patch (1.0.0 → 1.0.1): Correcciones de errores
3. Actualizar compatibleVersions según corresponda
4. Documentar cambios en el changelog
5. Implementar los cambios en el código del agente

## Integración con la Plataforma

Este sistema backend interactúa con los componentes existentes de la plataforma **sin alterar su diseño visual**, que debe seguir las especificaciones del documento `agent-profile-standards.md`. El sistema trabaja detrás de escena para proporcionar funcionalidad de control de versiones:

### Marketplace

- Registra versión actual mientras utiliza la interfaz visual ya especificada
- Proporciona datos para el historial de versiones respetando el diseño existente
- Permite filtrado por versión sin modificar la apariencia de los componentes

### Workflow Builder (Lego)

- Provee información de versión durante selección y arrastre de agentes
- Maneja validación de compatibilidad entre nodos conectados
- Gestiona actualización automática a versiones compatibles

### Content Hub

- Registra la versión del agente al generar contenido
- Almacena metadatos de versión con el contenido generado
- Permite regenerar contenido con versiones específicas

### Calendario y Planificador

- Mantiene información de versión para tareas programadas
- Provee datos para alertas de actualización

> **NOTA**: La representación visual de esta información debe seguir el esquema de diseño establecido en `agent-profile-standards.md` y en la implementación frontend existente. Este sistema solo se ocupa de la lógica y los datos subyacentes.

## Seguimiento de Uso

El sistema registra el uso de agentes con el método `trackAgentUsage` que captura:

- ID del agente
- Versión utilizada
- Contexto de uso (workflow, content-hub, etc.)
- Metadatos adicionales específicos del contexto

## Utilidades de Compatibilidad

El sistema proporciona funciones de utilidad para:

- Comparar versiones (`compareVersions`)
- Validar formato de versión (`isValidVersion`)
- Calcular versión compatible (`getCompatibleVersion`)
- Incrementar versión (`bumpVersion`)

## Lineamientos para Nuevos Desarrolladores

Al crear o modificar agentes:

1. Utilice siempre el servicio `agentService` para interactuar con agentes
2. Registre el uso a través de `trackAgentUsage` en cada ejecución
3. Documente claramente los cambios en cada actualización
4. Especifique explícitamente la compatibilidad entre versiones
5. Considere el impacto en flujos de trabajo existentes antes de hacer cambios importantes

## Dashboard de Monitoreo

El sistema incluye un panel administrativo que muestra:

- Uso de agentes por versión
- Patrones de actualización
- Posibles problemas de compatibilidad
- Alertas sobre versiones obsoletas

## Pruebas

Para garantizar la estabilidad del sistema, se han implementado pruebas de:

- Validación de formato de versiones
- Compatibilidad entre versiones
- Integración entre componentes
- Escenarios de actualización
- Casos límite y recuperación de errores

## Recursos Adicionales

- [Guía Completa de Control de Versiones](./version-control-guide.md)
- [Manual de Integración para Desarrolladores](./developer-integration.md)
- [Políticas de Actualización de Agentes](./agent-update-policies.md)