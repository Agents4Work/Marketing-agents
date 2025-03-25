/**
 * Prueba simplificada para la creación de documentos
 * usando la API de Google Docs integrada
 */

import fetch from 'node-fetch';

// URL base para las solicitudes API
const BASE_URL = 'http://localhost:5000';

async function testDocumentCreation() {
  console.log('=== TEST DE CREACIÓN DE DOCUMENTOS EN GOOGLE DOCS ===\n');
  
  try {
    // 1. Obtener un token CSRF
    console.log('Paso 1: Obteniendo token CSRF...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf-token`);
    const csrfData = await csrfResponse.json();
    console.log(`Token CSRF obtenido: ${csrfData.token.substring(0, 20)}...`);
    
    // 2. Crear un documento de prueba
    console.log('\nPaso 2: Creando documento de prueba...');
    const documentData = {
      title: `Test Document - ${new Date().toISOString()}`,
      content: '# Test Document\n\nThis is a test document created via API.'
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/google-docs/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(documentData)
    });
    
    const createData = await createResponse.json();
    
    if (createResponse.ok && createData.success) {
      console.log('\n✅ Documento creado correctamente:');
      console.log(`   ID: ${createData.document.id}`);
      console.log(`   URL: ${createData.document.url}`);
    } else {
      console.log('\n❌ Error al crear documento:');
      console.log(createData);
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
  }
  
  console.log('\n=== FIN DEL TEST ===');
}

// Ejecutar la prueba
testDocumentCreation().catch(error => {
  console.error('Error ejecutando prueba:', error);
});