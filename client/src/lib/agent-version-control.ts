/**
 * Agent Version Control System
 * 
 * Este archivo proporciona funciones para gestionar las versiones de los agentes,
 * incluyendo la validación de compatibilidad y el formato de versiones.
 */

/**
 * Tipos de incremento de versión
 */
export type VersionBumpType = 'major' | 'minor' | 'patch';

/**
 * Mapping de agentes a versiones
 * Este mapa contiene las versiones actuales de cada agente en el sistema
 */
const agentVersions: Record<string, string> = {
  'analytics-advisor': '1.3.0', 
  'seo-optimizer': '2.0.0',
  'social-media-creator': '1.7.2',
  'email-campaign-expert': '3.1.0',
  'content-strategist': '2.2.1'
};

/**
 * Formatea una versión al formato estándar (x.y.z)
 * Si se proporciona una versión parcial, la completa con ceros
 */
export function formatAgentVersion(version: string): string {
  // Si la versión está vacía, devuelve la versión predeterminada
  if (!version) return '1.0.0';
  
  const parts = version.split('.');
  
  // Si tiene formato completo (x.y.z), devolverlo tal cual
  if (parts.length === 3) return version;
  
  // Si solo tiene major (x), completar con minor y patch
  if (parts.length === 1) return `${parts[0]}.0.0`;
  
  // Si tiene major y minor (x.y), completar con patch
  if (parts.length === 2) return `${parts[0]}.${parts[1]}.0`;
  
  // Para cualquier otro formato inesperado, devolver versión predeterminada
  return '1.0.0';
}

/**
 * Compara dos versiones para determinar si son compatibles
 * 
 * @param version1 Versión a comparar
 * @param version2 Versión contra la que comparar
 * @returns true si las versiones son compatibles
 */
export function areVersionsCompatible(version1: string, version2: string): boolean {
  const v1 = formatAgentVersion(version1);
  const v2 = formatAgentVersion(version2);
  
  const [major1] = v1.split('.').map(Number);
  const [major2] = v2.split('.').map(Number);
  
  // Las versiones son compatibles si tienen el mismo major version
  return major1 === major2;
}

/**
 * Incrementa una versión según el tipo especificado
 * 
 * @param currentVersion Versión actual
 * @param bumpType Tipo de incremento (major, minor, patch)
 * @returns Nueva versión incrementada
 */
export function bumpVersion(currentVersion: string, bumpType: VersionBumpType): string {
  const formattedVersion = formatAgentVersion(currentVersion);
  const [major, minor, patch] = formattedVersion.split('.').map(Number);
  
  switch(bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return formattedVersion;
  }
}

/**
 * Compara dos versiones para determinar cuál es mayor
 * 
 * @param version1 Primera versión
 * @param version2 Segunda versión
 * @returns 1 si version1 > version2, -1 si version1 < version2, 0 si son iguales
 */
export function compareVersions(version1: string, version2: string): number {
  const v1 = formatAgentVersion(version1);
  const v2 = formatAgentVersion(version2);
  
  const [major1, minor1, patch1] = v1.split('.').map(Number);
  const [major2, minor2, patch2] = v2.split('.').map(Number);
  
  if (major1 !== major2) return major1 > major2 ? 1 : -1;
  if (minor1 !== minor2) return minor1 > minor2 ? 1 : -1;
  if (patch1 !== patch2) return patch1 > patch2 ? 1 : -1;
  
  return 0;
}

/**
 * Obtiene la versión actual de un agente
 * 
 * @param agentId Identificador único del agente
 * @returns La versión del agente, o '1.0.0' si no se encuentra
 */
export function getAgentVersion(agentId: string): string {
  return agentVersions[agentId] || '1.0.0';
}

/**
 * Obtiene todas las versiones de todos los agentes
 * 
 * @returns Un objeto con las versiones de todos los agentes
 */
export function getAgentVersions(): Record<string, string> {
  return { ...agentVersions };
}