/**
 * SQL Injection Protection
 * 
 * This module provides utilities to protect against SQL injection attacks.
 * This is especially important for applications that use raw SQL queries.
 */

/**
 * Sanitizes a string to prevent SQL injection
 * This is a basic sanitization function that should be used with parameterized queries
 */
export function sanitizeSQL(input: string): string {
  if (!input) return input;
  
  // Replace SQL injection characters and patterns
  return input
    .replace(/'/g, "''") // Escape single quotes by doubling them
    .replace(/--/g, "") // Remove comment markers
    .replace(/;/g, "") // Remove semicolons
    .replace(/\/\*/g, "") // Remove comment start markers
    .replace(/\*\//g, ""); // Remove comment end markers
}

/**
 * Validates SQL parameters to ensure they're of expected types
 * This helps prevent type-based SQL injection attacks
 */
export function validateSQLParams(params: Record<string, any>, schema: Record<string, string>): boolean {
  for (const [key, expectedType] of Object.entries(schema)) {
    const value = params[key];
    
    // Check if the parameter exists
    if (value === undefined || value === null) {
      return false;
    }
    
    // Check parameter type
    switch(expectedType) {
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return false;
        }
        break;
      case 'string':
        if (typeof value !== 'string') {
          return false;
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return false;
        }
        break;
      case 'date':
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          return false;
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          return false;
        }
        break;
      default:
        // Unknown type specification
        return false;
    }
  }
  
  return true;
}

/**
 * Creates a safe SQL query using parameterized queries
 * This is much safer than string concatenation
 */
export function createSafeQuery(
  baseQuery: string, 
  params: Record<string, any>
): { query: string; values: any[] } {
  const paramNames = Object.keys(params);
  const values: any[] = [];
  
  // Replace named parameters with positional parameters
  let query = baseQuery;
  let paramIndex = 1;
  
  for (const name of paramNames) {
    const paramPlaceholder = `:${name}`;
    while (query.includes(paramPlaceholder)) {
      query = query.replace(paramPlaceholder, `$${paramIndex}`);
      values.push(params[name]);
      paramIndex++;
    }
  }
  
  return { query, values };
}

/**
 * Sanitizes a table or column name to prevent SQL injection via identifier names
 * This should be used when dynamic table or column names are needed
 */
export function sanitizeIdentifier(identifier: string): string {
  if (!identifier) return '';
  
  // Allow only alphanumeric characters and underscores
  // Remove anything that doesn't match this pattern
  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * Validates and sanitizes sort and filter parameters for dynamically built queries
 */
export function sanitizeDynamicQueryParams(
  sortColumn: string, 
  sortDirection: string, 
  filterColumns: string[]
): { 
  isSafe: boolean; 
  sanitizedSort?: { column: string; direction: string }; 
  sanitizedFilters?: string[];
} {
  // Validate sort direction
  const validDirections = ['ASC', 'DESC', 'asc', 'desc'];
  if (sortDirection && !validDirections.includes(sortDirection)) {
    return { isSafe: false };
  }
  
  // Sanitize the sort column name
  const sanitizedSortColumn = sortColumn ? sanitizeIdentifier(sortColumn) : '';
  
  // If original and sanitized values don't match, it contained invalid characters
  if (sortColumn && sanitizedSortColumn !== sortColumn) {
    return { isSafe: false };
  }
  
  // Sanitize filter columns
  const sanitizedFilters = filterColumns.map(sanitizeIdentifier);
  
  // If any filter column was changed during sanitization, reject the request
  if (filterColumns.some((col, i) => col !== sanitizedFilters[i])) {
    return { isSafe: false };
  }
  
  return { 
    isSafe: true, 
    sanitizedSort: sortColumn ? { 
      column: sanitizedSortColumn, 
      direction: sortDirection.toUpperCase() 
    } : undefined,
    sanitizedFilters
  };
}