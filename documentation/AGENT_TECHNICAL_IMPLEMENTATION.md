# Guía Técnica para Implementación de Agentes

Esta guía proporciona instrucciones detalladas para desarrolladores sobre cómo implementar nuevos agentes en la plataforma utilizando el frontend premium.

## Estructura de Datos

### Interfaz Agent

Todos los agentes deben implementar la interfaz `Agent` definida en `client/src/types/marketplace.ts`:

```typescript
interface Agent {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  avatar?: string;
  rating?: number;
  reviews?: number;
  premium?: boolean;
  type: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  price?: number;
  languages?: string[];
  integrations?: string[];
  skills: (string | AgentSkill)[];
  highlight1?: string;
  highlight2?: string;
  highlight3?: string;
  uniqueFeature1?: string;
  uniqueFeature2?: string;
  uniqueFeature3?: string;
  compatibleAgents?: number[];
  popularCombinations?: TeamCombination[];
}

interface AgentSkill {
  name: string;
  level: number;
}

interface TeamCombination {
  name: string;
  description: string;
  agentIds: number[];
}
```

### Agregar un Nuevo Agente

Los nuevos agentes deben agregarse al array en `client/src/data/agents/index.ts`. Ejemplo:

```typescript
{
  id: 5, // Asegúrate de usar un ID único
  name: "Email Campaign Specialist",
  description: "Especialista en campañas de email marketing que optimiza tasas de apertura y conversión con contenido personalizado.",
  shortDescription: "Crea campañas de email efectivas con alto engagement y conversión",
  avatar: "📧",
  rating: 4.7,
  reviews: 89,
  premium: true,
  type: "specialist",
  category: "email-marketing",
  level: "intermediate",
  languages: ["English", "Spanish", "German"],
  integrations: ["Mailchimp", "HubSpot", "Active Campaign"],
  skills: [
    { name: "Email Copywriting", level: 95 },
    { name: "A/B Testing", level: 92 },
    { name: "Audience Segmentation", level: 90 },
    { name: "Conversion Optimization", level: 88 }
  ],
  highlight1: "Aumenta las tasas de apertura con asuntos optimizados",
  highlight2: "Mejora conversiones con llamadas a la acción efectivas",
  highlight3: "Implementa segmentación avanzada para personalización",
  uniqueFeature1: "Análisis predictivo de comportamiento para optimizar horarios de envío",
  uniqueFeature2: "Generación de contenido personalizado basado en segmentos de audiencia",
  uniqueFeature3: "Sistema integrado de pruebas A/B para mejorar resultados continuamente",
  compatibleAgents: [2, 3, 7], // IDs de agentes complementarios
  popularCombinations: [
    {
      name: "Email Conversion Squad",
      description: "Equipo optimizado para maximizar conversiones en campañas de email",
      agentIds: [5, 2, 7]
    },
    {
      name: "Customer Journey Team",
      description: "Especialistas en optimizar la experiencia del cliente completa",
      agentIds: [5, 3, 8]
    }
  ]
}
```

## Consideraciones Visuales

### Estilo Premium Obligatorio

Todos los agentes deben utilizar el estilo visual neobrutalism definido en `AgentDetailPage.premium.tsx`, adaptando la paleta de colores según el tipo de agente:

- **Bordes**: Negros, 2-3px de grosor (constante para todos los agentes)
- **Sombras**: Estilo neobrutalism (8px para tarjetas principales, 4px para secundarias)
- **Botones**: Con efecto hover de "presionar" (reducción de sombra y ligero movimiento)
- **Paleta de colores específica por tipo de agente**:
  - Copywriting: `bg-blue-600`, `text-blue-800`, `border-blue-100`
  - SEO: `bg-green-600`, `text-green-800`, `border-green-100`
  - Social Media: `bg-red-600`, `text-red-800`, `border-red-100`
  - Analytics: `bg-purple-600`, `text-purple-800`, `border-purple-100`
  - Content Creation: `bg-indigo-600`, `text-indigo-800`, `border-indigo-100`
  - Email Marketing: `bg-orange-600`, `text-orange-800`, `border-orange-100`
- **Indicadores premium**: Siempre en amarillo (`bg-yellow-400`) para destacar características exclusivas

### Estructura de Componentes

La página de detalle del agente incluye estos componentes principales:

1. **Panel de información principal**:
   - Avatar con indicador premium
   - Información básica y calificaciones
   - Botón "Try This Agent"
   - Highlights y skills

2. **Panel de detalle con pestañas**:
   - Overview: Descripción detallada y características únicas
   - Examples: Ejemplos de uso (resultados, casos de estudio)
   - Team: Agentes compatibles y combinaciones recomendadas
   - Reviews: Opiniones de usuarios
   - Performance: Métricas de rendimiento

## Equipo de Agentes

### Configuración del Equipo

Es crucial que los agentes recomendados en el equipo sean contextualmente relevantes. Por ejemplo:

- Un especialista en copywriting debería recomendar un SEO specialist, no un video editor
- Los porcentajes de compatibilidad deben ser realistas (85-98%)

### Quick Team Builder

La función "Quick Team Builder" debe mostrar combinaciones predefinidas que:

1. Tengan nombres temáticos atractivos (ej: "Content Dream Team")
2. Incluyan una breve descripción de por qué funcionan bien juntos
3. Agreguen valor claro para casos de uso específicos

## Pruebas de Implementación

Antes de aprobar un nuevo agente, verifica:

1. Que todos los datos se muestran correctamente en la página de detalle
2. Que la navegación funciona (botón "Back to Marketplace")
3. Que el botón "Try This Agent" muestra correctamente el proceso
4. Que los agentes relacionados son contextualmente relevantes
5. Que la interfaz es visualmente consistente con otros agentes

## Solución de Problemas Comunes

- **Problema**: Datos no aparecen en la página
  **Solución**: Verifica que el nuevo agente sigue exactamente la estructura de la interfaz `Agent`

- **Problema**: Estilos inconsistentes
  **Solución**: Asegúrate de usar las clases CSS definidas en la plantilla (`border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]`)

- **Problema**: Agentes relacionados no aparecen
  **Solución**: Verifica que los IDs en `compatibleAgents` existen en el array de agentes

## Recursos Adicionales

- `client/src/pages/AgentDetailPage.premium.tsx` - Plantilla principal para agentes
- `client/src/types/marketplace.ts` - Definiciones de tipos
- `client/src/data/agents/index.ts` - Datos de agentes existentes