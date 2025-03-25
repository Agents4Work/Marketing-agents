/**
 * Utilidades para conversaciones y chats
 */

/**
 * Trunca un mensaje para mostrarlo en listas o resúmenes
 * @param message Mensaje a truncar
 * @param maxLength Longitud máxima (por defecto 100 caracteres)
 * @returns Mensaje truncado
 */
export function truncateMessage(message: string, maxLength: number = 100): string {
  if (!message) return '';
  
  if (message.length <= maxLength) {
    return message;
  }
  
  return message.substring(0, maxLength - 3) + '...';
}

/**
 * Genera un título para una conversación basado en el primer mensaje
 * @param message Mensaje inicial del usuario
 * @returns Título generado para la conversación
 */
export function generateChatTitle(message: string): string {
  if (!message || message.trim().length === 0) {
    return 'Nueva conversación';
  }
  
  // Limitar a 50 caracteres
  let title = message.trim();
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title;
}

/**
 * Formatea una fecha para mostrarla en el chat
 * @param date Fecha a formatear
 * @returns Texto formateado
 */
export function formatChatDate(date: Date | string | number): string {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Si es hoy, mostrar la hora
  if (diffDays < 1) {
    if (diffHours < 1) {
      if (diffMins < 1) {
        if (diffSecs < 5) {
          return 'ahora';
        }
        return `hace ${diffSecs} seg`;
      }
      return `hace ${diffMins} min`;
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Si es ayer
  if (diffDays === 1) {
    return 'ayer ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Si es esta semana (menos de 7 días)
  if (diffDays < 7) {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return days[d.getDay()] + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Para fechas más antiguas
  return d.toLocaleDateString();
}

/**
 * Genera un ID único aleatorio para una conversación
 * @returns ID único
 */
export function generateChatId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Calcula el tiempo transcurrido desde una fecha
 * @param date Fecha desde la que calcular
 * @returns Texto formateado con el tiempo transcurrido
 */
export function timeElapsed(date: Date | string | number): string {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffMonths > 0) {
    return diffMonths === 1 ? 'hace 1 mes' : `hace ${diffMonths} meses`;
  }
  
  if (diffDays > 0) {
    return diffDays === 1 ? 'hace 1 día' : `hace ${diffDays} días`;
  }
  
  if (diffHours > 0) {
    return diffHours === 1 ? 'hace 1 hora' : `hace ${diffHours} horas`;
  }
  
  if (diffMins > 0) {
    return diffMins === 1 ? 'hace 1 minuto' : `hace ${diffMins} minutos`;
  }
  
  return 'hace un momento';
}