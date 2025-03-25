/**
 * Script de prueba para validar la integración con Google Docs
 * Este script verifica la funcionalidad de los endpoints de Google Docs
 * en el entorno de desarrollo, probando específicamente la autenticación
 * con cuenta de servicio cuando no hay tokens OAuth disponibles.
 */
import axios from 'axios';

// URL base para las peticiones API
const BASE_URL = 'http://localhost:5000';

// Función para imprimir resultados con colores
function printResult(operation, success, details) {
  const color = success ? '\x1b[32m' : '\x1b[31m'; // Verde o rojo
  const reset = '\x1b[0m';
  console.log(`${color}[${success ? '✓' : '✗'}] ${operation}${reset}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// Token CSRF (normalmente se obtendría de la página)
let csrfToken = null;

// Función para obtener un token CSRF
async function getCsrfToken() {
  try {
    // Hacemos una petición al endpoint específico para obtener el token CSRF
    const response = await axios.get(`${BASE_URL}/api/csrf-token`);
    console.log('   CSRF Token obtenido:', response.data);
    return response.data.csrfToken;
  } catch (error) {
    console.error('Error obteniendo CSRF token:', error.message);
    if (error.response) {
      console.error('   Error detallado:', error.response.data);
    }
    return null;
  }
}

// Función para probar un endpoint
async function testEndpoint(endpoint, options = {}) {
  try {
    console.log(`\n📝 Probando: ${endpoint}`);
    
    const url = `${BASE_URL}${endpoint}`;
    const method = options.method || 'get';
    const data = options.data || null;
    
    console.log(`   URL: ${url}`);
    console.log(`   Método: ${method.toUpperCase()}`);
    
    if (data) {
      console.log('   Datos:', JSON.stringify(data, null, 2));
    }
    
    // Para métodos POST, PUT, DELETE necesitamos el token CSRF
    if (method !== 'get' && !csrfToken) {
      csrfToken = await getCsrfToken();
      console.log(`   CSRF Token: ${csrfToken ? 'Obtenido' : 'No disponible'}`);
    }
    
    // Solo enviamos datos en el cuerpo para métodos que no son GET
    const requestOptions = {
      method,
      url,
      headers: {
        'Accept': 'application/json',
        'X-CSRF-Token': method !== 'get' ? csrfToken : undefined,
        ...(options.headers || {})
      }
    };
    
    // Solo añadir Content-Type y data para métodos que no son GET
    if (method !== 'get' && data) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.data = data;
    }
    
    const response = await axios(requestOptions);
    
    const responseData = response.data;
    
    printResult(endpoint, true, `Status: ${response.status}`);
    console.log('   Respuesta:', JSON.stringify(responseData, null, 2));
    
    return { success: true, data: responseData };
  } catch (error) {
    let errorMessage = error.message;
    let errorData = null;
    
    if (error.response) {
      errorMessage = `Status: ${error.response.status} - ${error.response.statusText}`;
      errorData = error.response.data;
    }
    
    printResult(endpoint, false, errorMessage);
    
    if (errorData) {
      console.log('   Error detallado:', JSON.stringify(errorData, null, 2));
    }
    
    return { success: false, error: errorMessage, details: errorData };
  }
}

// Función principal para ejecutar todas las pruebas
async function runAllTests() {
  console.log('\x1b[1m\x1b[36m=== PRUEBAS DE INTEGRACIÓN CON GOOGLE DOCS ===\x1b[0m\n');
  
  // 1. Verificar estado de la conexión
  await testEndpoint('/api/google-docs/status');
  
  // 2. Listar documentos (debería usar cuenta de servicio en desarrollo)
  await testEndpoint('/api/google-docs/list');
  
  // 3. Exportar documento (debería usar cuenta de servicio en desarrollo)
  const exportResult = await testEndpoint('/api/google-docs/export', {
    method: 'post',
    data: {
      title: 'Documento de prueba',
      content: '# Título del documento\n\nEste es un documento de prueba generado automáticamente.\n\n## Sección de prueba\n\nEsta es una sección de prueba.',
      format: 'markdown'
    }
  });
  
  // Si el export fue exitoso, probar obtener el documento creado
  if (exportResult.success && exportResult.data && exportResult.data.document && exportResult.data.document.id) {
    const docId = exportResult.data.document.id;
    await testEndpoint(`/api/google-docs/${docId}`);
  }
  
  console.log('\n\x1b[1m\x1b[36m=== PRUEBAS COMPLETADAS ===\x1b[0m');
}

// Ejecutar todas las pruebas
runAllTests().catch(error => {
  console.error('Error ejecutando pruebas:', error);
});