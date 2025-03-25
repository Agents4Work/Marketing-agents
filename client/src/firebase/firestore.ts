import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  setDoc
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '@/firebase/index';

// Re-exportar db para que sea accesible desde aquí
export { db };

/**
 * Función para convertir Timestamp de Firestore a Date
 */
export const timestampToDate = (timestamp: Timestamp | Date | any): Date => {
  if (!timestamp) {
    return new Date();
  }
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  return new Date(timestamp);
};

/**
 * Función mejorada para sanitizar un objeto para Firestore
 * Convierte Date a Timestamp y elimina propiedades no válidas
 * Corrige tipos de datos no compatibles para evitar error "invalid-argument"
 * Validación exhaustiva para prevenir problemas de formateo
 */
export const sanitizeForFirestore = (obj: any): any => {
  // Caso base: valores nulos o indefinidos
  if (obj === null || obj === undefined) {
    return null; // Firestore prefiere null explícito sobre undefined
  }

  // Manejar fechas - convertir a Timestamp para Firestore
  if (obj instanceof Date) {
    if (isNaN(obj.getTime())) {
      console.warn('Fecha inválida detectada, usando fecha actual');
      return Timestamp.fromDate(new Date());
    }
    return Timestamp.fromDate(obj);
  }

  // Convertir arrays asegurando que todos los elementos son válidos
  if (Array.isArray(obj)) {
    // Limitar arrays excesivamente grandes (para evitar límites de Firestore)
    if (obj.length > 1000) {
      console.warn(`Array demasiado grande (${obj.length} elementos), truncando a 1000`);
      obj = obj.slice(0, 1000);
    }
    
    // Filtra cualquier elemento indefinido o no válido
    const validItems = obj.filter(function(item) { return item !== undefined; });
    return validItems.map(function(item) { return sanitizeForFirestore(item); });
  }

  // Proceso especial para strings
  if (typeof obj === 'string') {
    // Limitar longitud de strings excesivamente largos
    if (obj.length > 10000) {
      console.warn(`String demasiado largo (${obj.length} caracteres), truncando a 10000`);
      return obj.substring(0, 10000);
    }
    return obj;
  }

  // Procesar objetos
  if (typeof obj === 'object' && obj !== null) {
    // Detectar y convertir objetos no serializables específicos
    if (obj.constructor?.name) {
      const constructorName = obj.constructor.name;
      // Lista de constructores no serializables comunes
      const nonSerializableTypes = [
        'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'RegExp', 'Error',
        'ArrayBuffer', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
        'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array',
        'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array'
      ];
      
      if (nonSerializableTypes.includes(constructorName)) {
        console.warn(`Tipo de objeto no serializable encontrado: ${constructorName}, convirtiendo a string.`);
        
        // Conversiones específicas para tipos comunes
        if (constructorName === 'Map' || constructorName === 'Set') {
          try {
            return `[${constructorName}: ${Array.from(obj).length} items]`;
          } catch (e) {
            return `[Object ${constructorName}]`;
          }
        }
        
        if (constructorName === 'Error') {
          return `[Error: ${obj.message || 'Unknown error'}]`;
        }
        
        if (constructorName === 'RegExp') {
          return obj.toString();
        }
        
        // Valor genérico para otros tipos no serializables
        return `[Object ${constructorName}]`;
      }
    }

    // Verificar que no sea un objeto circular
    try {
      // Esto lanzará error si hay circularidad
      JSON.stringify(obj);
    } catch (e) {
      if (e instanceof TypeError && e.message.includes('circular')) {
        console.warn('Detectada estructura circular en objeto, simplificando');
        return {
          __note: 'Estructura circular detectada y simplificada',
          __type: obj.constructor?.name || 'Object'
        };
      }
    }

    const sanitized: Record<string, any> = {};
    
    // Limitar número de propiedades para objetos muy grandes
    const entries = Object.entries(obj);
    if (entries.length > 500) {
      console.warn(`Objeto con demasiadas propiedades (${entries.length}), limitando a 500`);
    }
    
    const limitedEntries = entries.slice(0, 500);
    
    for (const [key, value] of limitedEntries) {
      // Omitir propiedades problemáticas
      if (value === undefined || 
          typeof value === 'function' || 
          typeof value === 'symbol' ||
          key.startsWith('_') ||
          key.startsWith('$') ||
          key === '__proto__') {
        continue;
      }
      
      // Nombres de campos no pueden contener puntos, caracteres especiales o empezar con números
      let safeKey = key.replace(/[.\\/[\]#$]/g, '_');
      
      // Si la clave comienza con número, agregar prefijo
      if (/^\d/.test(safeKey)) {
        safeKey = 'n_' + safeKey;
      }
      
      // Limitar longitud de claves excesivamente largas
      if (safeKey.length > 1500) {
        safeKey = safeKey.substring(0, 1500);
      }
      
      // Sanitizar valor recursivamente
      sanitized[safeKey] = sanitizeForFirestore(value);
    }
    return sanitized;
  }

  // Manejar tipos primitivos problemáticos
  if (typeof obj === 'bigint') {
    return obj.toString(); // BigInt no es compatible, convertir a string
  }
  
  if (Number.isNaN(obj)) {
    return null; // NaN no es compatible con Firestore
  }
  
  if (typeof obj === 'number' && !isFinite(obj)) {
    return null; // Infinity/-Infinity no son compatibles con Firestore
  }
  
  // Verificar números válidos (evitar valores que no son realmente números)
  if (typeof obj === 'number') {
    // Validar rango (Firestore tiene límites en valores numéricos)
    const MAX_SAFE_VALUE = 9007199254740991; // Number.MAX_SAFE_INTEGER
    if (Math.abs(obj) > MAX_SAFE_VALUE) {
      console.warn(`Número fuera de rango seguro: ${obj}, convirtiendo a string`);
      return obj.toString();
    }
    return obj;
  }

  // Devolver valor primitivo sin cambios (string, number, boolean)
  return obj;
};

/**
 * Determina si un error de Firebase es un error de permisos
 */
export function isPermissionError(error: any): boolean {
  return (
    error instanceof FirebaseError && 
    (error.code === 'permission-denied' || error.code === 'insufficient-permissions')
  );
}

/**
 * Determina si un error de Firebase es un error de autenticación
 */
export function isAuthError(error: any): boolean {
  return (
    error instanceof FirebaseError && 
    (error.code === 'unauthenticated' || error.code === 'auth/unauthenticated')
  );
}

/**
 * Obtiene un mensaje de error apropiado según el tipo de error de Firebase
 */
export function getFirebaseErrorMessage(error: any): string {
  if (!error) return 'Error desconocido';
  
  if (isPermissionError(error)) {
    return 'No tienes permisos para acceder a esta función. Verifica tu inicio de sesión.';
  }
  
  if (isAuthError(error)) {
    return 'Necesitas iniciar sesión para usar esta función.';
  }
  
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'invalid-argument':
        return 'Datos inválidos para la operación.';
      case 'not-found':
        return 'El recurso solicitado no existe.';
      case 'already-exists':
        return 'Este recurso ya existe.';
      case 'resource-exhausted':
        return 'Límite de recursos alcanzado. Intenta más tarde.';
      case 'failed-precondition':
        return 'La operación fue rechazada porque el sistema no está en el estado requerido.';
      case 'aborted':
        return 'La operación fue abortada.';
      case 'unavailable':
        return 'El servicio no está disponible. Verifica tu conexión.';
      default:
        return `Error de Firebase: ${error.code}`;
    }
  }
  
  return error.message || 'Error desconocido';
}

/**
 * Verifica si Firestore está disponible y configurado correctamente
 */
export async function isFirestoreAvailable(): Promise<boolean> {
  try {
    // Intenta acceder a una colección de prueba
    const testCollection = collection(db, '_firestore_test');
    const q = query(testCollection, limit(1));
    await getDocs(q);
    
    console.log('Firestore is available! ✅');
    return true;
  } catch (error) {
    console.error('Firestore is not available:', error);
    // Si el error es de permisos, es posible que Firestore esté disponible 
    // pero el usuario no tenga permisos para esta colección específica
    if (isPermissionError(error)) {
      console.warn('Firestore is available but user lacks permissions');
      return false;
    }
    return false;
  }
}

/**
 * Crea un documento en Firestore con ID personalizado
 */
export async function createDocumentWithId(
  collectionPath: string, 
  docId: string, 
  data: any
): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    const sanitizedData = sanitizeForFirestore(data);
    await setDoc(docRef, sanitizedData);
  } catch (error) {
    console.error(`Error creating document in ${collectionPath}/${docId}:`, error);
    throw error;
  }
}

/**
 * Obtiene un documento de Firestore
 */
export async function getDocument<T>(
  collectionPath: string, 
  docId: string,
  converter?: (data: DocumentData) => T
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return converter ? converter(data) : data as unknown as T;
  } catch (error) {
    console.error(`Error getting document from ${collectionPath}/${docId}:`, error);
    throw error;
  }
}

/**
 * Obtiene documentos de una colección con filtros
 */
export async function getDocuments<T>(
  collectionPath: string,
  queryConstraints: any[] = [],
  converter?: (data: DocumentData, id: string) => T
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return converter ? converter(data, doc.id) : { id: doc.id, ...data } as unknown as T;
    });
  } catch (error) {
    console.error(`Error getting documents from ${collectionPath}:`, error);
    throw error;
  }
}

/**
 * Verifica si hay un usuario conectado para operaciones con Firestore
 */
export function isUserAuthenticated(): boolean {
  return !!localStorage.getItem('firebase:authUser');
}