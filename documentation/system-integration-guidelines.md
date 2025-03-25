# Guía de Integración entre Frontend y Backend

## Sistemas Independientes pero Complementarios

En nuestra plataforma, hemos implementado dos sistemas independientes pero complementarios para la gestión de agentes de IA:

1. **Sistema de Identificación de Agentes con Control de Versiones (Backend)**
   - Documentado en: [Agent Identification System](./agent-identification-system.md)
   - Propósito: Gestión técnica de versiones, compatibilidad y seguimiento

2. **Estándares de Perfil de Agente (Frontend)**
   - Documentado en: [Agent Profile Standards](./agent-profile-standards.md)
   - Propósito: Definición de la experiencia visual y la estructura de datos para presentación

## Principios de Separación de Responsabilidades

Es crucial entender que estos sistemas tienen responsabilidades claramente diferenciadas:

### Backend (Identificación y Control de Versiones)
- Gestiona identificadores únicos de agentes
- Controla versiones de forma programática
- Maneja la compatibilidad entre componentes
- Realiza seguimiento de uso y desempeño
- Almacena historial de cambios

### Frontend (Estándares Visuales)
- Define la experiencia visual consistente
- Establece la estructura de tarjetas de agentes
- Especifica componentes UI y comportamientos
- Garantiza la coherencia de la experiencia de usuario
- Implementa las animaciones y efectos

## Cómo Funcionan Juntos

Cuando un desarrollador implementa un nuevo agente o actualiza uno existente:

1. Debe seguir el **Sistema de Identificación de Agentes** para:
   - Generar/mantener identificadores únicos
   - Gestionar cambios de versión
   - Documentar cambios en el historial
   - Definir compatibilidad con versiones anteriores

2. Debe cumplir con los **Estándares de Perfil de Agente** para:
   - Implementar la visualización correcta (tarjetas 3D, avatares, etc.)
   - Organizar la información en pestañas estandarizadas
   - Utilizar la estructura de datos requerida
   - Mantener la consistencia visual con otros agentes

## Escenarios de Ejemplo

### Escenario 1: Nuevo Agente de Email Marketing
- **Backend**: Generar ID único (email-[timestamp]-[random]), asignar versión 1.0.0, documentar capacidades iniciales
- **Frontend**: Implementar tarjeta 3D con sombras de 8px, borde negro de 3px, avatar cuadrado con emoji 📧, gradiente de colores apropiado

### Escenario 2: Actualización de Agente Existente
- **Backend**: Incrementar versión de 1.0.0 a 1.1.0, documentar nuevas capacidades, mantener compatibilidad
- **Frontend**: Conservar el diseño visual exacto según los estándares, actualizar solo la información sobre capacidades

## Resolución de Desalineaciones

Si se detecta que la implementación de un agente no cumple con ambos estándares:

1. **Desalineación Backend**: 
   - Error: Falta ID único, versionado incorrecto, compatibilidad no especificada
   - Solución: Implementar correctamente utilizando `agentService` y las utilidades de versionado

2. **Desalineación Frontend**:
   - Error: Visual no consistente, falta de tarjetas 3D, colores incorrectos, pestañas incompletas
   - Solución: Reformatear el componente visual siguiendo estrictamente `agent-profile-standards.md`

## Lineamientos Generales

1. **No modificar la visualización al actualizar la lógica**:
   Cuando se actualiza la versión de un agente, su funcionalidad o compatibilidad (backend), esto no debe afectar su visualización (frontend).

2. **No alterar la lógica al actualizar la visualización**:
   Cuando se mejora la presentación visual de un agente (frontend), esto no debe modificar su ID, versión o compatibilidad (backend).

3. **Mantener documentación sincronizada**:
   Cualquier cambio en cualquiera de los dos sistemas debe reflejarse en la documentación correspondiente.

## Herramientas para Verificación

Para verificar que un agente cumple con ambos conjuntos de estándares:

1. **Verificación Backend**: Ejecutar `npm run test:version-control`
2. **Verificación Frontend**: Ejecutar `npm run test:visual-standards`

---

La adherencia estricta a estas directrices garantiza que nuestros agentes sean tanto técnicamente robustos como visualmente coherentes, proporcionando una experiencia de usuario premium mientras mantenemos la estabilidad técnica de la plataforma.