# Ejemplos de Implementación de Colores por Tipo de Agente

Este documento proporciona ejemplos concretos de cómo implementar la paleta de colores específica para cada tipo de agente, manteniendo el estilo neobrutalism consistente.

## Ejemplo: SEO Specialist (Verde)

```tsx
// Avatar con color específico de agente SEO
<div className="bg-green-600 text-white p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] w-24 h-24 flex items-center justify-center text-4xl">
  {selectedAgent.avatar || "🔍"}
</div>

// Botón principal
<Button
  className="w-full mb-3 bg-green-600 hover:bg-green-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200"
  onClick={handleTryAgent}
  disabled={isTryingAgent}
>
  Try This Agent
</Button>

// Contenedor de características
<div className="bg-green-50 border border-green-100 rounded-lg p-4">
  <h3 className="font-medium text-green-800 mb-2 flex items-center">
    <Rocket className="h-4 w-4 mr-2" />
    What Makes This Agent Special
  </h3>
  {/* Contenido */}
</div>

// Tabs customizadas para SEO
<TabsList className="grid w-full grid-cols-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
  <TabsTrigger 
    value="overview" 
    className="font-semibold data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
  >
    Overview
  </TabsTrigger>
  {/* Otras pestañas */}
</TabsList>
```

## Ejemplo: Social Media Manager (Rojo)

```tsx
// Avatar con color específico de agente de social media
<div className="bg-red-600 text-white p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] w-24 h-24 flex items-center justify-center text-4xl">
  {selectedAgent.avatar || "📱"}
</div>

// Botón principal
<Button
  className="w-full mb-3 bg-red-600 hover:bg-red-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200"
  onClick={handleTryAgent}
  disabled={isTryingAgent}
>
  Try This Agent
</Button>

// Contenedor de características
<div className="bg-red-50 border border-red-100 rounded-lg p-4">
  <h3 className="font-medium text-red-800 mb-2 flex items-center">
    <Rocket className="h-4 w-4 mr-2" />
    What Makes This Agent Special
  </h3>
  {/* Contenido */}
</div>

// Títulos de secciones
<CardTitle className="flex items-center">
  <FileText className="h-5 w-5 mr-2 text-red-600" />
  About {selectedAgent.name}
</CardTitle>
```

## Ejemplo: Analytics Expert (Morado)

```tsx
// Avatar con color específico de agente de analytics
<div className="bg-purple-600 text-white p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] w-24 h-24 flex items-center justify-center text-4xl">
  {selectedAgent.avatar || "📊"}
</div>

// Botón principal
<Button
  className="w-full mb-3 bg-purple-600 hover:bg-purple-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200"
  onClick={handleTryAgent}
  disabled={isTryingAgent}
>
  Try This Agent
</Button>

// Pasos del proceso
<div className="bg-purple-100 h-8 w-8 rounded-full flex items-center justify-center text-purple-700 font-semibold">
  1
</div>

// Subtitulares
<h3 className="font-medium text-purple-800">Analytics Setup</h3>
```

## Ejemplo: Email Marketing Specialist (Naranja)

```tsx
// Avatar con color específico de agente de email marketing
<div className="bg-orange-600 text-white p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] w-24 h-24 flex items-center justify-center text-4xl">
  {selectedAgent.avatar || "📧"}
</div>

// Botón principal
<Button
  className="w-full mb-3 bg-orange-600 hover:bg-orange-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200"
  onClick={handleTryAgent}
  disabled={isTryingAgent}
>
  Try This Agent
</Button>

// Skills
<div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
  <div className="flex justify-between items-center mb-1">
    <span className="text-sm font-medium">Email Copywriting</span>
    <span className="text-xs text-orange-500">95%</span>
  </div>
  <Progress value={95} className="h-1.5 bg-orange-100" indicatorClassName="bg-orange-600" />
</div>
```

## Implementación Dinámica

Para implementar dinámicamente los colores basados en el tipo de agente, puedes usar un enfoque como este:

```tsx
// Función para obtener la paleta de colores basada en el tipo de agente
function getAgentColorPalette(agentType: string) {
  switch (agentType.toLowerCase()) {
    case 'copywriting':
      return {
        primary: 'blue',
        bg: 'bg-blue-600',
        bgHover: 'hover:bg-blue-700',
        bgLight: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-100'
      };
    case 'seo':
      return {
        primary: 'green',
        bg: 'bg-green-600',
        bgHover: 'hover:bg-green-700',
        bgLight: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-100'
      };
    case 'social-media':
      return {
        primary: 'red',
        bg: 'bg-red-600',
        bgHover: 'hover:bg-red-700',
        bgLight: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-100'
      };
    case 'analytics':
      return {
        primary: 'purple',
        bg: 'bg-purple-600',
        bgHover: 'hover:bg-purple-700',
        bgLight: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-100'
      };
    case 'email-marketing':
      return {
        primary: 'orange',
        bg: 'bg-orange-600',
        bgHover: 'hover:bg-orange-700',
        bgLight: 'bg-orange-50',
        text: 'text-orange-800',
        border: 'border-orange-100'
      };
    case 'content-creation':
      return {
        primary: 'indigo',
        bg: 'bg-indigo-600',
        bgHover: 'hover:bg-indigo-700',
        bgLight: 'bg-indigo-50',
        text: 'text-indigo-800',
        border: 'border-indigo-100'
      };
    default:
      // Color por defecto para tipos no definidos
      return {
        primary: 'blue',
        bg: 'bg-blue-600',
        bgHover: 'hover:bg-blue-700',
        bgLight: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-100'
      };
  }
}

// Uso en componentes
const colors = getAgentColorPalette(selectedAgent.type);

// Avatar
<div className={`${colors.bg} text-white p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] w-24 h-24 flex items-center justify-center text-4xl`}>
  {selectedAgent.avatar || "🤖"}
</div>

// Botón principal
<Button
  className={`w-full mb-3 ${colors.bg} ${colors.bgHover} border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200`}
  onClick={handleTryAgent}
  disabled={isTryingAgent}
>
  Try This Agent
</Button>

// Contenedor de características
<div className={`${colors.bgLight} ${colors.border} rounded-lg p-4`}>
  <h3 className={`font-medium ${colors.text} mb-2 flex items-center`}>
    <Rocket className="h-4 w-4 mr-2" />
    What Makes This Agent Special
  </h3>
  {/* Contenido */}
</div>
```

Este enfoque permite una implementación consistente pero adaptada a cada tipo de agente, manteniendo el estilo neobrutalism pero con la identidad visual específica para cada categoría.