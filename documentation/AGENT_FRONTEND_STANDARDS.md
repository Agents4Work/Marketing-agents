# Estándares para el Frontend de Agentes

## Introducción

Este documento establece los estándares oficiales para el frontend de todos los agentes en nuestra plataforma de marketing AI. **Todos los agentes nuevos DEBEN seguir estas pautas sin excepción** para mantener una experiencia de usuario cohesiva y premium.

## Estructura y Personalización

### Estructura Base Común

Todos los agentes utilizan la misma estructura de página implementada en `AgentDetailPage.premium.tsx`, que incluye:
- Estructura de navegación con pestañas (Overview, Examples, Team, Reviews, Performance)
- Botón "Back to Marketplace" para navegación
- Panel de información principal (lado izquierdo)
- Panel de detalle con pestañas (lado derecho)
- Sección "Quick Team Builder" para equipos predefinidos

### Personalización por Agente

Aunque la estructura es común, cada agente DEBE personalizarse con:

1. **Colores específicos**: Paleta de colores adaptada al tipo de agente (azul para copywriting, verde para SEO, etc.)

2. **Información relevante al contexto**: 
   - Descripción específica para ese tipo de agente
   - Skills relevantes a su función principal
   - Ejemplos pertinentes a su uso específico

3. **Integraciones adecuadas**: Mostrar solo integraciones relevantes para ese tipo de agente

4. **Campos de entrada adaptados**: Los formularios de "Try This Agent" deben solicitar información específica según el tipo de agente:
   - Un SEO Agent pedirá URLs y keywords
   - Un Copywriting Agent pedirá tono de voz y estilo
   - Un Social Media Agent pedirá plataformas específicas

5. **Equipos contextualmente relevantes**: Solo recomendar agentes que realmente complementen la función principal

## Datos Contextuales

### Identificación de Agente

Cada agente debe tener:
- Un ID único en el sistema
- Un nombre descriptivo que refleje su función principal
- Un avatar o icono representativo 
- Un indicador claro si es un agente premium

### Descripción y Contenido

Todo el contenido debe ser:
1. **Contextualmente relevante** al agente específico
2. **Detallado y preciso** en la descripción de capacidades
3. **Honesto** sobre las limitaciones del agente

Los textos genéricos están prohibidos - cada descripción debe ser única para el agente.

### Equipo de Agentes Relacionados

Los agentes recomendados como equipo deben:
1. Tener una relación lógica con el agente principal
2. Mostrar porcentajes de compatibilidad realistas (85-98%)
3. Incluir una breve explicación de por qué trabajan bien juntos

Ejemplo para un Copywriting Pro:
- SEO Specialist (95%)
- Social Media Strategist (92%)
- Analytics Advisor (90%)

### Configuración Visual

Todos los agentes deben presentar:
- **Paleta de colores adaptada al tipo de agente**:
  - Agentes de copywriting: Tonalidades de azul
  - Agentes de SEO: Tonalidades de verde
  - Agentes de social media: Tonalidades de rojo/rosa
  - Agentes de análisis: Tonalidades de morado
  - Otros tipos: Colores distintivos que representen su función
- Bordes negros sólidos (2-3px) independientemente del color principal
- Sombras tipo "neobrutalism" (8px para elementos principales, 4px para secundarios)
- Efectos hover de "presionar" en elementos interactivos
- Avatar e iconografía que refleje el tipo específico de agente

## Implementación Técnica

Para implementar un nuevo agente:

1. Añadir datos del agente en `client/src/data/agents/index.ts`
2. Asegurar que implementa correctamente la interfaz `Agent` de `client/src/types/marketplace.ts`
3. Verificar que todos los campos requeridos están completos, incluyendo:
   - `id`: Identificador único
   - `name`: Nombre del agente
   - `description`: Descripción detallada
   - `skills`: Array de habilidades con niveles de competencia
   - `compatibleAgents`: Array de IDs de agentes complementarios
   - Todos los demás campos necesarios para la visualización premium

## Pruebas Requeridas

Antes de aprobar un nuevo agente:
1. Verificar visualización correcta en la página de detalle
2. Comprobar que la navegación entre marketplace y página de detalle funciona
3. Validar que los agentes del equipo son contextualmente relevantes
4. Probar la interacción con el botón "Try This Agent"

## Notas Finales

La estandarización del frontend de agentes es esencial para nuestra marca. Cualquier desviación de estos estándares debe ser aprobada explícitamente por el equipo de diseño.

Este documento debe revisarse y actualizarse a medida que evolucione la plataforma.