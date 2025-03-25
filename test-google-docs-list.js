/**
 * Prueba para listar documentos de Google Docs
 */

import fetch from 'node-fetch';

// URL base para las solicitudes API
const BASE_URL = 'http://localhost:5000';

async function testListDocuments() {
  console.log('=== TEST DE LISTADO DE DOCUMENTOS EN GOOGLE DOCS ===\n');
  
  try {
    // 1. Obtener un token CSRF
    console.log('Paso 1: Obteniendo token CSRF...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf-token`);
    const csrfData = await csrfResponse.json();
    console.log(`Token CSRF obtenido: ${csrfData.token.substring(0, 20)}...`);
    
    // 2. Listar documentos
    console.log('\nPaso 2: Listando documentos...');
    
    const listResponse = await fetch(`${BASE_URL}/api/google-docs/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      }
    });
    
    const listData = await listResponse.json();
    
    if (listResponse.ok && listData.success) {
      console.log('\n✅ Documentos obtenidos correctamente:');
      console.log(`   Total de documentos: ${listData.documents.length}`);
      
      if (listData.documents.length > 0) {
        console.log('\n   Lista de documentos:');
        listData.documents.forEach((doc, index) => {
          console.log(`   ${index + 1}. "${doc.title}" (ID: ${doc.id})`);
        });
      } else {
        console.log('\n   No se encontraron documentos.');
      }
    } else {
      console.log('\n❌ Error al listar documentos:');
      console.log(listData);
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
  }
  
  console.log('\n=== FIN DEL TEST ===');
}

// Ejecutar la prueba
testListDocuments().catch(error => {
  console.error('Error ejecutando prueba:', error);
});