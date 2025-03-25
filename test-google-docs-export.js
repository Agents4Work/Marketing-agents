/**
 * Prueba simplificada para exportar documentos de Google Docs a formato JSON
 */

import fetch from 'node-fetch';

// URL base para las solicitudes API
const BASE_URL = 'http://localhost:5000';

async function testExportDocument() {
  console.log('=== TEST DE EXPORTACIÓN DE DOCUMENTOS DE GOOGLE DOCS ===\n');
  
  try {
    // 1. Obtener un token CSRF
    console.log('Paso 1: Obteniendo token CSRF...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf-token`);
    const csrfData = await csrfResponse.json();
    console.log(`Token CSRF obtenido: ${csrfData.token.substring(0, 20)}...`);
    
    // 2. Listar documentos para obtener un ID válido
    console.log('\nPaso 2: Obteniendo lista de documentos para extraer un ID...');
    
    const listResponse = await fetch(`${BASE_URL}/api/google-docs/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      }
    });
    
    const listData = await listResponse.json();
    
    if (!listResponse.ok || !listData.docs || listData.docs.length === 0) {
      console.log('\n❌ No se encontraron documentos para exportar.');
      console.log('Por favor, crea un documento primero ejecutando test-google-docs-simple.js');
      return;
    }
    
    const firstDocId = listData.docs[0].id;
    const docTitle = listData.docs[0].title;
    console.log(`✅ Documento encontrado: "${docTitle}" (ID: ${firstDocId})`);
    
    // 3. Probar la exportación a formato JSON (más sencillo de testear)
    console.log('\nPaso 3: Exportando documento a formato JSON...');
    
    const exportUrl = `${BASE_URL}/api/google-docs/export/${firstDocId}?format=json`;
    const exportResponse = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'X-CSRF-Token': csrfData.token
      }
    });
    
    if (!exportResponse.ok) {
      const errorData = await exportResponse.json();
      console.log(`❌ Error al exportar a JSON: ${errorData.error}`);
      if (errorData.details) {
        console.log(`Detalles: ${errorData.details}`);
      }
      return;
    }
    
    const jsonData = await exportResponse.json();
    console.log(`✅ Documento exportado a JSON correctamente.`);
    console.log(`Título del documento: ${jsonData.title}`);
    console.log(`ID del documento: ${jsonData.documentId}`);
    
    if (jsonData.body && jsonData.body.content) {
      console.log(`Cantidad de elementos de contenido: ${jsonData.body.content.length}`);
      
      // Mostrar un resumen del contenido
      const textElements = [];
      JSON.stringify(jsonData.body.content, (key, value) => {
        if (key === 'textRun' && value.content) {
          textElements.push(value.content);
        }
        return value;
      });
      
      if (textElements.length > 0) {
        console.log('\nContenido del documento (primeros 3 elementos):');
        textElements.slice(0, 3).forEach((text, i) => {
          console.log(`  ${i+1}. ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
        });
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
  }
  
  console.log('\n=== FIN DEL TEST ===');
}

// Ejecutar la prueba
testExportDocument().catch(error => {
  console.error('Error ejecutando prueba:', error);
});