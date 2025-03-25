# Requisitos de Entrada Específicos por Tipo de Agente

Este documento detalla los campos de entrada y requisitos específicos que deben solicitarse al usuario para cada tipo de agente cuando utiliza la función "Try This Agent".

## Estructura Base del Formulario

Todos los formularios de agente deben incluir:
- Título claro que indique el propósito
- Campos organizados en un orden lógico
- Validación adecuada para evitar envíos incompletos o incorrectos
- Botones de acción claros (Enviar/Cancelar)

## Campos Específicos por Tipo de Agente

### SEO Specialist

**Campos obligatorios**:
- URL del sitio web o página a analizar
- 3-5 keywords objetivo principales
- Competidores principales (al menos 2)
- Objetivo de la optimización (tráfico, conversiones, visibilidad)

**Campos opcionales**:
- Mercado geográfico objetivo
- Presupuesto para SEO pagado
- Restricciones técnicas del sitio

**Ejemplos de formulario**:
```jsx
<TextField
  label="URL del sitio web"
  placeholder="https://ejemplo.com"
  required
  validation={{
    pattern: {
      value: /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?$/,
      message: "Por favor introduce una URL válida"
    }
  }}
/>

<KeywordsInput
  label="Keywords objetivo"
  placeholder="Añade hasta 5 keywords"
  minKeywords={3}
  maxKeywords={5}
  required
/>

<CompetitorInput
  label="Competidores principales"
  placeholder="Añade al menos 2 competidores"
  minCompetitors={2}
  required
/>

<RadioGroup
  label="Objetivo de la optimización"
  required
  options={[
    { value: "traffic", label: "Aumentar tráfico orgánico" },
    { value: "conversions", label: "Mejorar conversiones" },
    { value: "visibility", label: "Aumentar visibilidad de marca" },
    { value: "rankings", label: "Mejorar posiciones en buscadores" }
  ]}
/>
```

### Copywriting Pro

**Campos obligatorios**:
- Tipo de contenido (blog, landing page, email, etc)
- Tema o asunto principal
- Tono de voz (profesional, casual, persuasivo, informativo)
- Público objetivo 
- Longitud aproximada

**Campos opcionales**:
- Palabras clave a incluir
- Call to action deseado
- Referencias o ejemplos de estilo

**Ejemplos de formulario**:
```jsx
<SelectField
  label="Tipo de contenido"
  required
  options={[
    { value: "blog", label: "Post de blog" },
    { value: "landing", label: "Landing page" },
    { value: "email", label: "Email marketing" },
    { value: "social", label: "Post para redes sociales" },
    { value: "ad", label: "Anuncio publicitario" }
  ]}
/>

<TextField
  label="Tema principal"
  placeholder="Describe el tema central de tu contenido"
  required
/>

<SelectField
  label="Tono de voz"
  required
  options={[
    { value: "professional", label: "Profesional" },
    { value: "casual", label: "Casual/Conversacional" },
    { value: "persuasive", label: "Persuasivo/Ventas" },
    { value: "informative", label: "Informativo/Educativo" },
    { value: "humorous", label: "Humorístico" }
  ]}
/>

<TextArea
  label="Público objetivo"
  placeholder="Describe quién es tu audiencia ideal para este contenido"
  required
  maxLength={200}
/>

<RadioGroup
  label="Longitud aproximada"
  required
  options={[
    { value: "short", label: "Corto (300-500 palabras)" },
    { value: "medium", label: "Medio (500-1000 palabras)" },
    { value: "long", label: "Largo (1000-2000 palabras)" },
    { value: "comprehensive", label: "Extenso (2000+ palabras)" }
  ]}
/>
```

### Social Media Strategist

**Campos obligatorios**:
- Plataformas objetivo (Instagram, Twitter, LinkedIn, etc)
- Objetivo de la campaña (awareness, engagement, conversiones)
- Tipo de contenido (imagen, video, carrusel, texto)
- Tema o mensaje principal
- Tono de comunicación

**Campos opcionales**:
- Hashtags sugeridos
- Referencias de campañas similares
- Restricciones de marca

**Ejemplos de formulario**:
```jsx
<CheckboxGroup
  label="Plataformas objetivo"
  required
  minSelected={1}
  options={[
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "twitter", label: "Twitter/X" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "tiktok", label: "TikTok" },
    { value: "pinterest", label: "Pinterest" }
  ]}
/>

<SelectField
  label="Objetivo de la campaña"
  required
  options={[
    { value: "awareness", label: "Crear conciencia de marca" },
    { value: "engagement", label: "Aumentar interacción" },
    { value: "traffic", label: "Generar tráfico al sitio web" },
    { value: "leads", label: "Generar leads" },
    { value: "sales", label: "Impulsar ventas directas" }
  ]}
/>

<SelectField
  label="Tipo de contenido principal"
  required
  options={[
    { value: "image", label: "Imagen/Foto" },
    { value: "video", label: "Video" },
    { value: "carousel", label: "Carrusel/Múltiples imágenes" },
    { value: "text", label: "Texto predominante" },
    { value: "mixed", label: "Contenido mixto" }
  ]}
/>

<TextArea
  label="Mensaje principal"
  placeholder="¿Cuál es el mensaje clave que quieres comunicar?"
  required
  maxLength={300}
/>
```

### Analytics Advisor

**Campos obligatorios**:
- Fuentes de datos (Google Analytics, Facebook Ads, CRM, etc)
- Período de análisis (último mes, trimestre, año)
- Métricas principales a analizar
- Objetivos de negocio

**Campos opcionales**:
- Segmentos específicos a analizar
- Eventos de conversión
- Benchmarks o metas específicas

**Ejemplos de formulario**:
```jsx
<CheckboxGroup
  label="Fuentes de datos disponibles"
  required
  minSelected={1}
  options={[
    { value: "ga", label: "Google Analytics" },
    { value: "fb", label: "Facebook Ads Manager" },
    { value: "gads", label: "Google Ads" },
    { value: "crm", label: "CRM (especificar)" },
    { value: "csv", label: "Archivos CSV/Datos propios" }
  ]}
/>

<DateRangePicker
  label="Período de análisis"
  required
  defaultValue={{
    from: subtractMonths(new Date(), 1),
    to: new Date()
  }}
/>

<MultiSelectField
  label="Métricas principales"
  required
  minSelected={2}
  options={[
    { value: "traffic", label: "Tráfico web" },
    { value: "conversions", label: "Conversiones" },
    { value: "engagement", label: "Engagement" },
    { value: "roi", label: "ROI" },
    { value: "cac", label: "Coste de adquisición" },
    { value: "ltv", label: "Valor del ciclo de vida" }
  ]}
/>

<TextArea
  label="Objetivos de negocio"
  placeholder="¿Qué objetivos específicos buscas lograr con este análisis?"
  required
  maxLength={400}
/>
```

### Email Marketing Specialist

**Campos obligatorios**:
- Tipo de campaña (newsletter, promoción, bienvenida, etc)
- Objetivo de la campaña
- Información sobre la audiencia/segmento
- Asunto propuesto
- Call to action principal

**Campos opcionales**:
- Elementos visuales requeridos
- Plantillas existentes a utilizar
- Ofertas o promociones específicas

**Ejemplos de formulario**:
```jsx
<SelectField
  label="Tipo de campaña de email"
  required
  options={[
    { value: "newsletter", label: "Newsletter regular" },
    { value: "promotional", label: "Email promocional" },
    { value: "welcome", label: "Email de bienvenida" },
    { value: "abandoned", label: "Recuperación de carrito abandonado" },
    { value: "reengagement", label: "Reactivación de usuarios" }
  ]}
/>

<SelectField
  label="Objetivo principal"
  required
  options={[
    { value: "information", label: "Informar" },
    { value: "sale", label: "Vender un producto/servicio" },
    { value: "download", label: "Generar descargas" },
    { value: "appointment", label: "Programar citas" },
    { value: "feedback", label: "Obtener feedback" }
  ]}
/>

<TextArea
  label="Información sobre la audiencia"
  placeholder="Describe el segmento al que enviarás este email"
  required
  maxLength={300}
/>

<TextField
  label="Asunto propuesto"
  placeholder="Escribe un asunto atractivo para el email"
  required
  maxLength={70}
/>

<TextField
  label="Call to action principal"
  placeholder="¿Qué acción específica quieres que realice el usuario?"
  required
  maxLength={100}
/>
```

## Implementación Técnica

La implementación de estos campos debe hacerse utilizando los componentes de formulario de Shadcn UI, incluyendo:

- Validación adecuada para cada campo
- Estado de carga durante el procesamiento
- Mensajes de error claros
- Valores por defecto cuando sea apropiado

Ejemplo de configuración de un formulario completo:

```jsx
function AgentInputForm({ agentType, onSubmit }) {
  // Determinar qué campos mostrar según el tipo de agente
  const formConfig = getFormConfigForAgentType(agentType);
  
  const form = useForm({
    resolver: zodResolver(formConfig.schema),
    defaultValues: formConfig.defaultValues
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {/* Renderizar campos dinámicamente basados en el tipo de agente */}
          {formConfig.fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: fieldProps }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {/* Renderizar el tipo de campo adecuado */}
                    {renderFormControl(field, fieldProps)}
                  </FormControl>
                  <FormDescription>{field.description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>Procesando... <Spinner className="ml-2" /></>
            ) : (
              "Generar con IA"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## Consideraciones de UX

- Agrupar campos relacionados visualmente
- Mostrar indicadores claros para campos obligatorios
- Proporcionar textos de ayuda o tooltips para campos complejos
- Implementar validación en tiempo real para mejorar la experiencia
- Mantener coherencia visual con la paleta de colores del agente