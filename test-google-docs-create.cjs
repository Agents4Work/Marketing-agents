/**
 * Script simplificado para probar la creación de documentos en Google Docs
 * usando la cuenta de servicio.
 */
const https = require('https');
const http = require('http');
const querystring = require('querystring');

// URL base para las peticiones API
const BASE_URL = 'localhost';

// Función para realizar una solicitud HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(responseBody);
          resolve({ statusCode: res.statusCode, body: parsedBody });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: responseBody });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testApp() {
  console.log('\n=== PRUEBA DE CREACIÓN DE DOCUMENTOS EN GOOGLE DOCS (SIMPLIFICADA) ===\n');
  
  try {
    // 1. Obtener CSRF token
    console.log('1. Obteniendo CSRF token...');
    const csrfResponse = await makeRequest({
      hostname: BASE_URL,
      port: 5000,
      path: '/api/csrf-token',
      method: 'GET',
      protocol: 'http:'
    });
    
    console.log(`   Status: ${csrfResponse.statusCode}`);
    console.log(`   Token: ${csrfResponse.body.token}`);
    
    if (!csrfResponse.body.token) {
      throw new Error('No se pudo obtener el token CSRF');
    }
    
    const csrfToken = csrfResponse.body.token;
    
    // 2. Crear un documento
    console.log('\n2. Creando documento de prueba...');
    
    const documentData = {
      title: 'Prueba Simple - ' + new Date().toISOString(),
      content: '# Documento de prueba\n\nContenido simple.'
    };
    
    const createResponse = await makeRequest({
      hostname: BASE_URL,
      port: 5000,
      path: '/api/google-docs/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      protocol: 'http:'
    }, JSON.stringify(documentData));
    
    console.log(`   Status: ${createResponse.statusCode}`);
    console.log(`   Respuesta: ${JSON.stringify(createResponse.body, null, 2)}`);
    
    if (createResponse.statusCode === 200 && createResponse.body.success) {
      console.log('\n✅ Documento creado correctamente');
      console.log(`   ID: ${createResponse.body.document.id}`);
      console.log(`   URL: ${createResponse.body.document.url}`);
    } else {
      console.log('\n❌ Error creando documento');
      console.log(`   Error: ${JSON.stringify(createResponse.body)}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
  }
  
  console.log('\n=== FIN DE LA PRUEBA ===');
}

// Ejecutar la prueba
testApp();