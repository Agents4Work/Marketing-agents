/**
 * Script de prueba específico para la integración con Google Docs usando cuenta de servicio
 * Este script se enfoca en verificar la correcta generación del token JWT y su intercambio por un token de acceso
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo de cuenta de servicio
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'attached_assets', 'agents-4-work-a347b8c33e89.json');

// Cargar la cuenta de servicio
let googleServiceAccount = null;
try {
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const serviceAccountFile = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
    googleServiceAccount = JSON.parse(serviceAccountFile);
    console.log('✅ Cuenta de servicio cargada correctamente:', {
      email: googleServiceAccount.client_email,
      project: googleServiceAccount.project_id
    });
  } else {
    console.error('❌ Archivo de cuenta de servicio no encontrado:', SERVICE_ACCOUNT_PATH);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error cargando cuenta de servicio:', error);
  process.exit(1);
}

// Función para obtener un token de acceso utilizando la cuenta de servicio
async function getServiceAccountToken() {
  try {
    // Create JWT claims for Google's OAuth token endpoint
    const now = Math.floor(Date.now() / 1000);
    const expiryTime = now + 3600; // Token valid for 1 hour
    
    const claims = {
      iss: googleServiceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      exp: expiryTime,
      iat: now
    };
    
    console.log('🔄 Creando JWT con los siguientes claims:', claims);
    
    try {
      // Create JWT header
      const header = {
        alg: 'RS256',
        typ: 'JWT'
      };
      
      // Verify private key format
      let privateKey = googleServiceAccount.private_key;
      
      // Ensure the private key has the right format (with newlines)
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error('❌ La clave privada no tiene el formato correcto');
        return null;
      }
      
      // Some environments replace newlines with literal \\n - fix this
      if (privateKey.includes('\\n') && !privateKey.includes('\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
        console.log('🔄 Fixed newlines in private key');
      }
      
      // Encode header and payload as base64url
      const encodedHeader = Buffer.from(JSON.stringify(header))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      const encodedPayload = Buffer.from(JSON.stringify(claims))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Concatenate to form the content to be signed
      const signContent = `${encodedHeader}.${encodedPayload}`;
      
      console.log('🔄 Firmando contenido JWT...');
      
      // Sign the content with the private key from service account
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signContent);
      signer.end();
      
      const signature = signer.sign(privateKey, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Combine to form the complete JWT
      const jwt = `${signContent}.${signature}`;
      
      console.log('✅ JWT creado correctamente');
      console.log('🔄 Intercambiando JWT por token de acceso...');
      
      // Exchange JWT for access token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      });
      
      if (tokenResponse.data && tokenResponse.data.access_token) {
        console.log('✅ Token de acceso obtenido correctamente');
        console.log('   Expira en:', tokenResponse.data.expires_in, 'segundos');
        return tokenResponse.data.access_token;
      } else {
        console.error('❌ No se obtuvo token de acceso en la respuesta:', tokenResponse.data);
        return null;
      }
    } catch (jwtError) {
      console.error('❌ Error creando o intercambiando JWT:', jwtError.message);
      
      // Log detailed error information
      if (jwtError.response) {
        console.error('❌ Error detallado:', {
          status: jwtError.response.status,
          statusText: jwtError.response.statusText,
          data: jwtError.response.data
        });
      }
      
      throw jwtError;
    }
  } catch (error) {
    console.error('❌ Error obteniendo token de cuenta de servicio:', error.message);
    return null;
  }
}

// Función para probar el listado de documentos
async function testListDocuments(accessToken) {
  try {
    console.log('\n📝 Probando listado de documentos con token de acceso');
    
    // Usar la Drive API para listar documentos (Google Docs se accede a través de Drive API)
    const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
    
    // Parámetros para buscar solo documentos de Google Docs
    driveUrl.searchParams.append('q', "mimeType='application/vnd.google-apps.document'");
    driveUrl.searchParams.append('fields', 'files(id,name,description,mimeType,modifiedTime,createdTime),nextPageToken');
    driveUrl.searchParams.append('pageSize', '10');
    
    console.log('🔄 Enviando solicitud a Drive API:', driveUrl.toString());
    
    // Llamada a la API de Google Drive
    const response = await axios.get(driveUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Respuesta recibida de Drive API');
    console.log('   Total de documentos:', response.data.files.length);
    
    // Mostrar información básica de cada documento
    if (response.data.files.length > 0) {
      console.log('\n📄 Documentos encontrados:');
      response.data.files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (ID: ${file.id}, Modificado: ${file.modifiedTime})`);
      });
    } else {
      console.log('⚠️ No se encontraron documentos');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error listando documentos:', error.message);
    
    // Log detailed error information
    if (error.response) {
      console.error('❌ Error detallado:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    return null;
  }
}

// Ejecutar las pruebas
async function runTests() {
  console.log('\n=== PRUEBA DE INTEGRACIÓN CON GOOGLE DOCS (SERVICE ACCOUNT) ===\n');
  
  try {
    // Obtener token de acceso con cuenta de servicio
    const accessToken = await getServiceAccountToken();
    
    if (!accessToken) {
      console.error('❌ No se pudo obtener token de acceso');
      return;
    }
    
    // Probar listado de documentos
    await testListDocuments(accessToken);
    
    console.log('\n=== PRUEBAS COMPLETADAS ===');
  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error);
  }
}

runTests();