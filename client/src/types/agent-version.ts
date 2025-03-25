/**
 * Agent Version Types
 * 
 * This file defines the interfaces related to agent versioning
 * to ensure consistent evolution of agents over time.
 */

/**
 * Represents a change entry in the agent's changelog
 */
export interface ChangelogEntry {
  version: string;       // Version where this change was made
  date: string;          // ISO date string when the change was made
  changes: string[];     // Array of changes made in this version
}

/**
 * Version-related fields for agents
 */
export interface VersionedAgent {
  version: string;               // Current version of the agent
  compatibleVersions: string[];  // Previous versions this agent is compatible with
  releaseDate: string;           // When this version was released (ISO date string)
  lastUpdated: string;           // When this version was last updated (ISO date string)
  changelog: ChangelogEntry[];   // History of changes for this agent
}

/**
 * Utility function to get the latest compatible version
 * for a requested version of an agent
 */
export function getCompatibleVersion(
  requestedVersion: string,
  availableVersions: string[],
  compatibilityMap: Record<string, string[]>
): string | null {
  // If the exact version is available, use it
  if (availableVersions.includes(requestedVersion)) {
    return requestedVersion;
  }
  
  // Look for a newer version that's compatible with the requested version
  for (const version of availableVersions) {
    const compatibleWith = compatibilityMap[version] || [];
    if (compatibleWith.includes(requestedVersion)) {
      return version;
    }
  }
  
  // No compatible version found
  return null;
}

/**
 * Utility to compare versions
 * Returns: -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  
  return 0;
}

/**
 * Utility to check if a version is valid
 * Follows semver format: major.minor.patch
 */
export function isValidVersion(version: string): boolean {
  const pattern = /^\d+\.\d+(\.\d+)?$/;
  return pattern.test(version);
}

/**
 * Calculate the type of version bump
 */
export type VersionBumpType = 'major' | 'minor' | 'patch';

/**
 * Bump a version number based on the type of change
 */
export function bumpVersion(currentVersion: string, bumpType: VersionBumpType): string {
  const parts = currentVersion.split('.').map(Number);
  
  switch (bumpType) {
    case 'major':
      return `${parts[0] + 1}.0.0`;
    case 'minor':
      return `${parts[0]}.${(parts[1] || 0) + 1}.0`;
    case 'patch':
      return `${parts[0]}.${parts[1] || 0}.${(parts[2] || 0) + 1}`;
    default:
      return currentVersion;
  }
}