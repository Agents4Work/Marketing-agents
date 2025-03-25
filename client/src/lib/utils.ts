import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases con clsx y tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera un ID aleatorio con un prefijo opcional
 */
export function generateRandomId(prefix = ""): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}-${randomStr}`;
}

/**
 * Formatea una fecha a una cadena legible
 */
export function formatDate(date?: Date): string {
  if (!date) return 'Fecha desconocida';
  
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}

/**
 * Formatea una fecha para mostrar en chats
 * Muestra solo la hora si es hoy, o fecha y hora si es otro día
 */
export function formatChatDate(date?: Date): string {
  if (!date) return 'Desconocido';
  
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();
  
  if (isToday) {
    return new Intl.DateTimeFormat('es-ES', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  }
  
  return formatDate(date);
}

/**
 * Formatea una fecha relativa al momento actual
 * Ej: "hace 5 minutos", "hace 1 hora", "ayer", etc.
 */
export function formatRelativeDate(date?: Date): string {
  if (!date) return 'Fecha desconocida';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSec < 60) {
    return 'ahora mismo';
  } else if (diffMin < 60) {
    return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHours < 24) {
    return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffDays < 7) {
    if (diffDays === 1) return 'ayer';
    return `hace ${diffDays} días`;
  } else {
    return formatDate(date);
  }
}

/**
 * Trunca una cadena a una longitud máxima
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Asigna un color basado en el tipo de agente
 */
export function getColorByAgentType(type: string): string {
  const colorMap: Record<string, string> = {
    seo: 'bg-emerald-100 text-emerald-800',
    copywriting: 'bg-blue-100 text-blue-800',
    ads: 'bg-purple-100 text-purple-800',
    creative: 'bg-pink-100 text-pink-800',
    email: 'bg-yellow-100 text-yellow-800',
    analytics: 'bg-gray-100 text-gray-800',
    social: 'bg-red-100 text-red-800',
    strategy: 'bg-indigo-100 text-indigo-800'
  };
  
  return colorMap[type] || 'bg-gray-100 text-gray-800';
}

/**
 * Asigna un nombre legible a un tipo de agente
 */
export function getAgentTypeName(type: string): string {
  const nameMap: Record<string, string> = {
    seo: 'SEO Specialist',
    copywriting: 'Copywriter',
    ads: 'Ads Expert',
    creative: 'Creative Director',
    email: 'Email Marketer',
    analytics: 'Analytics Expert',
    social: 'Social Media Manager',
    strategy: 'Marketing Strategist'
  };
  
  return nameMap[type] || type;
}

/**
 * Crea una función de delay para pruebas
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));