import React, { useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import AnimatedTooltip from './AnimatedTooltip';
import { useTooltips } from './TooltipManager';

interface ConnectionLineProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  animated?: boolean;
  label?: string;
  connectionId?: string;
  sourceNodeId?: string;
  targetNodeId?: string;
}

// Componente altamente optimizado para renderizar las líneas de conexión
// Mejoras para rendimiento y estabilidad visual
const ConnectionLine: React.FC<ConnectionLineProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  animated = false,
  label,
  connectionId,
  sourceNodeId,
  targetNodeId
}) => {
  // Usar el sistema de tooltips
  const { getConnectionTooltip, updateTooltipState, tooltipState } = useTooltips();
  
  // Manejador seguro que evita llamadas setState durante renderizado
  const safeUpdateTooltipState = useCallback((updates: any) => {
    // Usamos un timeout para evitar actualizar durante el renderizado
    setTimeout(() => {
      updateTooltipState(updates);
    }, 0);
  }, [updateTooltipState]);
  
  // Usamos useMemo para almacenar en caché valores calculados
  // que solo deberían recalcularse cuando cambian las coordenadas
  const pathData = useMemo(() => {
    // Calculate a bezier path that looks smoother
    // Controlamos la curvatura según la distancia entre puntos para una apariencia más natural
    const dx = Math.abs(targetX - sourceX);
    const dy = Math.abs(targetY - sourceY);
    
    // ⚠️ FIX: Mejorar el cálculo de la curvatura para líneas más naturales
    const curveFactor = Math.min(Math.max(dx, dy) * 0.5, 120);
    
    // ⚠️ FIX: Añadir un pequeño offset a las coordenadas de inicio y fin
    // para evitar que las líneas se conecten exactamente en el borde del nodo
    const offsetX = sourceX < targetX ? 3 : -3;
    const offsetY = sourceY < targetY ? 3 : -3;
    
    return {
      // Optimizado: cálculo del path bezier más fluido
      path: `M${sourceX},${sourceY} C${sourceX + curveFactor},${sourceY} ${targetX - curveFactor},${targetY} ${targetX},${targetY}`,
      // Evitamos recalcular estos valores en cada render
      midX: (sourceX + targetX) / 2,
      midY: (sourceY + targetY) / 2,
      // Calculamos la longitud aproximada para animaciones
      length: Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2))
    };
  }, [sourceX, sourceY, targetX, targetY]);
  
  // Si tenemos IDs de conexión, actualizar estadísticas de conexiones
  useEffect(() => {
    if (connectionId) {
      safeUpdateTooltipState({
        connectionCount: Math.max(tooltipState.connectionCount, 1)
      });
    }
  }, [connectionId, safeUpdateTooltipState, tooltipState.connectionCount]);
  
  // Obtener tooltip contextual para esta conexión si está disponible
  const connectionTooltip = useMemo(() => {
    if (connectionId && sourceNodeId && targetNodeId) {
      const mockConnection = {
        id: connectionId,
        source: sourceNodeId,
        target: targetNodeId,
        animated
      };
      
      // Llamamos al servicio de tooltips para obtener el tooltip contextual
      return getConnectionTooltip(mockConnection);
    }
    return null;
  }, [connectionId, sourceNodeId, targetNodeId, animated, getConnectionTooltip]);

  // ⚠️ FIX: Determinar el estilo de la línea basado en el tipo (temporal o permanente)
  const lineStyles = useMemo(() => {
    if (animated || connectionId === 'temp-connection') {
      return {
        stroke: "rgba(34, 211, 238, 0.8)", // Cyan para líneas temporales
        strokeWidth: 3,
        strokeDasharray: "5,5", // Línea punteada para indicar temporalidad
      };
    }
    
    return {
      stroke: "rgba(59, 130, 246, 0.8)", // Azul para líneas permanentes
      strokeWidth: 4,
    };
  }, [animated, connectionId]);

  // Renderizar el componente con tooltip condicional
  return (
    <>
      <svg
        className="absolute left-0 top-0 w-full h-full overflow-visible pointer-events-none"
        style={{ 
          zIndex: animated ? 15 : 10 // ⚠️ FIX: Líneas temporales por encima
        }}
      >
        <motion.path
          d={pathData.path}
          stroke={lineStyles.stroke}
          strokeWidth={lineStyles.strokeWidth}
          strokeDasharray={lineStyles.strokeDasharray}
          fill="none"
          strokeLinecap="round"
          // Optimización: solo aplicar animación en la primera aparición cuando realmente sea necesario
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{ 
            pathLength: 1, 
            opacity: animated ? 0.8 : 1 // ⚠️ FIX: Líneas temporales un poco más transparentes
          }}
          transition={{ 
            duration: Math.min(0.3, pathData.length / 1000), // ⚠️ FIX: Duración basada en longitud
            ease: "easeOut" 
          }} 
          className={`lego-connection-line ${animated ? 'lego-connection-line-animated' : ''}`}
          style={{
            willChange: 'transform', // Sugerencia al navegador para optimizar transformaciones
          }}
        />
        
        {/* ⚠️ FIX: Añadir círculos en los extremos para mejorar visualmente las conexiones */}
        {!animated && (
          <>
            <circle 
              cx={sourceX} 
              cy={sourceY} 
              r={3} 
              fill={lineStyles.stroke} 
            />
            <circle 
              cx={targetX} 
              cy={targetY} 
              r={3} 
              fill={lineStyles.stroke} 
            />
          </>
        )}
      </svg>
      
      {/* Label o Tooltip Contextual */}
      {connectionTooltip ? (
        <div
          className="absolute pointer-events-auto"
          style={{
            left: pathData.midX,
            top: pathData.midY,
            transform: 'translate(-50%, -50%)',
            zIndex: 20
          }}
        >
          <AnimatedTooltip
            content={connectionTooltip.content}
            position={connectionTooltip.position} 
            color={connectionTooltip.color}
            highlight={connectionTooltip.highlight}
            delay={300}
            alwaysShow={true}
            width="w-56"
          >
            <div 
              className="bg-white dark:bg-gray-800 text-xs font-medium px-2 py-1 rounded-full shadow-md border border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              onClick={() => {
                // Al hacer clic, podemos actualizar estadísticas o marcar como visto
                safeUpdateTooltipState({
                  connectionCount: tooltipState.connectionCount + 1
                });
              }}
            >
              {label || "Conexión"}
            </div>
          </AnimatedTooltip>
        </div>
      ) : (
        // Renderizado condicional optimizado con && para el label normal
        label && (
          <div
            className="absolute bg-white dark:bg-gray-800 text-xs font-medium px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700 pointer-events-none"
            style={{
              left: pathData.midX,
              top: pathData.midY,
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              willChange: 'transform' // Optimización para transformaciones
            }}
          >
            {label}
          </div>
        )
      )}
    </>
  );
};

// Función de comparación personalizada para rendimiento óptimo
const areEqual = (prevProps: ConnectionLineProps, nextProps: ConnectionLineProps) => {
  // ⚠️ FIX: Añadir un pequeño margen para evitar actualizaciones innecesarias con pequeños cambios
  const positionThreshold = 2; // 2 píxeles de tolerancia
  
  const sourceXEqual = Math.abs(prevProps.sourceX - nextProps.sourceX) <= positionThreshold;
  const sourceYEqual = Math.abs(prevProps.sourceY - nextProps.sourceY) <= positionThreshold;
  const targetXEqual = Math.abs(prevProps.targetX - nextProps.targetX) <= positionThreshold;
  const targetYEqual = Math.abs(prevProps.targetY - nextProps.targetY) <= positionThreshold;
  
  return (
    sourceXEqual &&
    sourceYEqual &&
    targetXEqual &&
    targetYEqual &&
    prevProps.animated === nextProps.animated &&
    prevProps.label === nextProps.label &&
    prevProps.connectionId === nextProps.connectionId &&
    prevProps.sourceNodeId === nextProps.sourceNodeId &&
    prevProps.targetNodeId === nextProps.targetNodeId
  );
};

// Aplicamos memoización con función de comparación personalizada para evitar re-renderizados innecesarios
export default React.memo(ConnectionLine, areEqual);