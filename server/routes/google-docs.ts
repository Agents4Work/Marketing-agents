import express, { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';

// Define a development auth bypass middleware for easier testing
const devAuthBypassMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check for dev bypass header or non-production environment
  const hasDevBypassHeader = req.headers['x-dev-bypass-auth'] === 'true';
  const isDevEnvironment = process.env.NODE_ENV !== 'production';
  
  if (hasDevBypassHeader || isDevEnvironment) {
    console.log('🔄 Auth bypassed for development in Google Docs routes');
    // Either bypass is set or we're in development mode, so set a dev user
    req.user = {
      uid: 'dev-user-123',
      email: 'dev@example.com',
    };
    next();
  } else {
    // In production with no bypass, use regular auth middleware
    return authMiddleware(req, res, next);
  }
};

// Definir interfaces para los tipos de credenciales
export interface OAuthCredentials {
  web: {
    client_id: string;
    client_secret: string;
    auth_uri: string;
    token_uri: string;
    redirect_uris: string[];
  };
}

export interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

const router = express.Router();

// Configuración para Google Docs API
const GOOGLE_CREDENTIALS_PATH = process.env.GOOGLE_DOCS_CREDENTIALS_PATH || path.join(process.cwd(), 'credentials', 'google-docs-credentials.json');
const GOOGLE_SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || path.join(process.cwd(), 'attached_assets', 'agents-4-work-a347b8c33e89.json');
const GOOGLE_DOCS_TOKEN_PATH = path.join(process.cwd(), 'credentials', 'google-docs-tokens.json');

// Declarar las variables a nivel global para el módulo
// Estas serán accesibles en todo el archivo
let googleOAuthCredentials: OAuthCredentials | null = null;
let googleServiceAccount: ServiceAccountCredentials | null = null;
let authMethod: 'oauth' | 'service_account' | null = null;

// Función para cargar credenciales
function loadCredentials() {
  try {
    if (fs.existsSync(GOOGLE_CREDENTIALS_PATH)) {
      const credentialsFile = fs.readFileSync(GOOGLE_CREDENTIALS_PATH, 'utf8');
      googleOAuthCredentials = JSON.parse(credentialsFile);
      console.log('🔄 Google Docs OAuth credentials cargadas correctamente');
    } else {
      console.warn('⚠️ Archivo de credenciales OAuth no encontrado:', GOOGLE_CREDENTIALS_PATH);
    }
  } catch (error) {
    console.error('❌ Error cargando credenciales OAuth:', error);
  }

  try {
    if (fs.existsSync(GOOGLE_SERVICE_ACCOUNT_PATH)) {
      const serviceAccountFile = fs.readFileSync(GOOGLE_SERVICE_ACCOUNT_PATH, 'utf8');
      googleServiceAccount = JSON.parse(serviceAccountFile);
      console.log('🔄 Google Docs Service Account cargada correctamente');
    } else {
      console.warn('⚠️ Archivo de cuenta de servicio no encontrado:', GOOGLE_SERVICE_ACCOUNT_PATH);
    }
  } catch (error) {
    console.error('❌ Error cargando cuenta de servicio:', error);
  }

  // Determinar el método de autenticación basado en las credenciales disponibles
  // En desarrollo, preferir la cuenta de servicio si está disponible
  if (process.env.NODE_ENV !== 'production' && googleServiceAccount) {
    authMethod = 'service_account';
    console.log('🔄 Usando autenticación de cuenta de servicio para Google Docs (modo desarrollo)');
  } else if (googleOAuthCredentials) {
    authMethod = 'oauth';
    console.log('🔄 Usando autenticación OAuth para Google Docs');
  } else if (googleServiceAccount) {
    authMethod = 'service_account';
    console.log('🔄 Usando autenticación de cuenta de servicio para Google Docs');
  } else {
    console.warn('⚠️ No se han encontrado credenciales válidas para Google Docs');
  }
}

// Cargar las credenciales inmediatamente
loadCredentials();

// Token storage para OAuth state validation
const oauthStateTokens: Map<string, { userId: string, expiresAt: number }> = new Map();

// User token storage - en producción esto debería estar en una base de datos
const userGoogleDocsTokens: Map<string, { 
  access_token: string, 
  refresh_token: string, 
  expires_at: number 
}> = new Map();

// Cargar tokens almacenados del archivo de persistencia
function loadSavedTokens() {
  try {
    if (fs.existsSync(GOOGLE_DOCS_TOKEN_PATH)) {
      const tokensFile = fs.readFileSync(GOOGLE_DOCS_TOKEN_PATH, 'utf8');
      const savedTokens = JSON.parse(tokensFile);
      
      // Restaurar tokens en el Map
      Object.entries(savedTokens).forEach(([userId, tokenData]: [string, any]) => {
        userGoogleDocsTokens.set(userId, {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at
        });
      });
      
      console.log('🔄 Tokens de Google Docs cargados desde el almacenamiento persistente');
    } else {
      console.log('⚠️ No hay tokens guardados para Google Docs');
    }
  } catch (error) {
    console.error('❌ Error cargando tokens guardados:', error);
  }
}

// Cargar tokens al iniciar
loadSavedTokens();

interface GoogleDoc {
  id: string;
  title: string;
  createdAt: string;
  modifiedAt: string;
  snippet?: string;
  url?: string;
}

// Mock data - will be replaced with real Google Docs API calls
const mockDocs: GoogleDoc[] = [
  {
    id: 'doc-1',
    title: 'Marketing Strategy 2025',
    createdAt: '2025-03-01T10:30:00Z',
    modifiedAt: '2025-03-18T14:15:00Z',
    snippet: 'This document outlines our comprehensive marketing strategy for 2025...',
    url: 'https://docs.google.com/document/d/mock-id-1/edit'
  },
  {
    id: 'doc-2',
    title: 'Q1 Campaign Analysis',
    createdAt: '2025-02-15T08:45:00Z',
    modifiedAt: '2025-03-10T11:20:00Z',
    snippet: 'Analysis of Q1 marketing campaign performance and recommendations...',
    url: 'https://docs.google.com/document/d/mock-id-2/edit'
  },
  {
    id: 'doc-3',
    title: 'Content Calendar',
    createdAt: '2025-01-20T15:00:00Z',
    modifiedAt: '2025-03-17T09:30:00Z',
    snippet: 'Editorial calendar for blog posts, social media, and email campaigns...',
    url: 'https://docs.google.com/document/d/mock-id-3/edit'
  }
];

/**
 * @route GET /api/google-docs/status
 * @desc Check Google Docs connection status
 * @access Private
 */
router.get('/status', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    // Verificar si el usuario tiene un token válido
    let connected = false;
    let tokenInfo = null;
    
    // Comprobar si hay credenciales cargadas
    if (!googleOAuthCredentials && !googleServiceAccount) {
      return res.json({
        connected: false,
        error: 'Google Docs credentials not configured',
        credentialsStatus: {
          oauth: !!googleOAuthCredentials,
          serviceAccount: !!googleServiceAccount
        }
      });
    }
    
    // Verificar el token si el usuario está autenticado
    if (req.user?.uid) {
      const userId = req.user.uid;
      const accessToken = await getAccessToken(userId);
      
      if (accessToken) {
        connected = true;
        
        try {
          // Obtener información del usuario de Google
          const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          tokenInfo = {
            email: response.data.email,
            name: response.data.name,
            picture: response.data.picture
          };
        } catch (tokenError) {
          console.error('Error verifying Google Docs token:', tokenError);
        }
      }
      
      // Si hay un token en el mapa pero no es válido, incluir información sobre el error
      if (!connected && userGoogleDocsTokens.has(userId)) {
        const tokenData = userGoogleDocsTokens.get(userId);
        const isExpired = tokenData?.expires_at && tokenData.expires_at <= Date.now();
        
        return res.json({
          connected: false,
          tokenStatus: {
            exists: true,
            expired: isExpired,
            expiryTime: tokenData?.expires_at ? new Date(tokenData.expires_at).toISOString() : null
          },
          authMethod,
          credentialsStatus: {
            oauth: !!googleOAuthCredentials,
            serviceAccount: !!googleServiceAccount
          }
        });
      }
    }
    
    // Si no hay token pero está disponible la cuenta de servicio, indicarlo
    if (!connected && authMethod === 'service_account') {
      return res.json({
        connected: false,
        serviceAccountAvailable: true,
        authMethod,
        message: 'No user token available, but service account can be used'
      });
    }
    
    res.json({
      connected,
      email: tokenInfo?.email || req.user?.email,
      name: tokenInfo?.name,
      picture: tokenInfo?.picture,
      authMethod,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking Google Docs status:', error);
    res.status(500).json({ 
      error: 'Failed to check Google Docs connection status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/google-docs/list
 * @desc Get a list of Google Docs
 * @access Private
 */
router.get('/list', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    // Query parameters
    const query = req.query.q as string || '';
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const pageToken = req.query.pageToken as string;
    
    // Verificar si el usuario está autenticado
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Obtener token de acceso
    let accessToken = await getAccessToken(req.user.uid);
    
    // Para entorno de desarrollo, intentar siempre usar cuenta de servicio si no hay token
    const isDevEnvironment = process.env.NODE_ENV !== 'production';
    
    // Si no hay token de acceso disponible, intentar usar cuenta de servicio
    if (!accessToken && (authMethod === 'service_account' || isDevEnvironment)) {
      console.log('🔄 Using service account for Google Docs access...');
      accessToken = await getServiceAccountToken();
      
      // Log de éxito o fallo para debugging
      if (accessToken) {
        console.log('✅ Successfully obtained service account token for Google Docs');
      } else {
        console.error('❌ Failed to obtain service account token for Google Docs');
      }
    }
    
    // Si aún no hay token disponible, devolver error
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'No access token available',
        details: 'Please connect to Google Docs first',
        connectUrl: '/api/google-docs/connect'
      });
    }
    
    try {
      // Usar la Drive API para listar documentos (Google Docs se accede a través de Drive API)
      const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
      
      // Parámetros para buscar solo documentos de Google Docs
      driveUrl.searchParams.append('q', "mimeType='application/vnd.google-apps.document'");
      driveUrl.searchParams.append('fields', 'files(id,name,description,mimeType,modifiedTime,createdTime),nextPageToken');
      driveUrl.searchParams.append('pageSize', pageSize.toString());
      
      if (pageToken) {
        driveUrl.searchParams.append('pageToken', pageToken);
      }
      
      // Si hay un término de búsqueda, agregar a la consulta
      if (query) {
        driveUrl.searchParams.append('q', `name contains '${query}'`);
      }
      
      // Llamada a la API de Google Drive
      const response = await axios.get(driveUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      // Transformar la respuesta de Drive API a nuestro formato
      const docs = response.data.files.map((file: any) => ({
        id: file.id,
        title: file.name,
        snippet: file.description || 'No description',
        createdAt: file.createdTime,
        modifiedAt: file.modifiedTime,
        url: `https://docs.google.com/document/d/${file.id}/edit`
      }));
      
      res.json({
        docs,
        nextPageToken: response.data.nextPageToken || null
      });
    } catch (apiError: any) {
      console.error('Error calling Google Drive API:', apiError);
      
      // Log de información detallada para debugging
      if (apiError.response) {
        console.error('API Error Details:', {
          status: apiError.response.status,
          data: apiError.response.data
        });
      }
      
      let errorMessage = 'Failed to fetch documents from Google Drive';
      let errorCode = 500;
      
      // Manejo específico de errores comunes
      if (apiError.response?.status === 401) {
        errorMessage = 'Authentication error. Please reconnect to Google Drive';
        errorCode = 401;
      } else if (apiError.response?.status === 403) {
        errorMessage = 'Permission denied. Make sure you have access to the requested files';
        errorCode = 403;
      }
      
      return res.status(errorCode).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Error fetching Google Docs:', error);
    res.status(500).json({ error: 'Failed to fetch documents from Google Docs' });
  }
});

/**
 * @route GET /api/google-docs/:id
 * @desc Get a single Google Doc by ID
 * @access Private
 */
router.get('/:id', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    const docId = req.params.id;
    
    // Verificar si el usuario está autenticado
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Obtener token de acceso
    let accessToken = await getAccessToken(req.user.uid);
    
    // Para entorno de desarrollo, intentar siempre usar cuenta de servicio si no hay token
    const isDevEnvironment = process.env.NODE_ENV !== 'production';
    
    // Si no hay token de acceso disponible, intentar usar cuenta de servicio
    if (!accessToken && (authMethod === 'service_account' || isDevEnvironment)) {
      console.log('🔄 Using service account for Google Docs access...');
      accessToken = await getServiceAccountToken();
      
      // Log de éxito o fallo para debugging
      if (accessToken) {
        console.log('✅ Successfully obtained service account token for Google Docs');
      } else {
        console.error('❌ Failed to obtain service account token for Google Docs');
      }
    }
    
    // Si aún no hay token disponible, devolver error
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'No access token available',
        details: 'Please connect to Google Docs first',
        connectUrl: '/api/google-docs/connect'
      });
    }
    
    try {
      // Primero, obtener los metadatos del documento desde Drive API
      const driveUrl = new URL(`https://www.googleapis.com/drive/v3/files/${docId}`);
      driveUrl.searchParams.append('fields', 'id,name,description,mimeType,modifiedTime,createdTime');
      
      const driveResponse = await axios.get(driveUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      // Luego, obtener el contenido del documento desde Docs API
      const docsUrl = new URL(`https://docs.googleapis.com/v1/documents/${docId}`);
      
      const docsResponse = await axios.get(docsUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      // Extraer el contenido del documento
      const document = docsResponse.data;
      
      // Construir un texto plano a partir del contenido estructurado
      let content = '';
      
      // Procesar el contenido del documento
      if (document.body && document.body.content) {
        content = processDocContent(document.body.content);
      }
      
      // Crear objeto de documento con metadatos y contenido
      const docWithContent = {
        id: driveResponse.data.id,
        title: driveResponse.data.name,
        snippet: driveResponse.data.description || 'No description',
        createdAt: driveResponse.data.createdTime,
        modifiedAt: driveResponse.data.modifiedTime,
        url: `https://docs.google.com/document/d/${docId}/edit`,
        content: content,
        rawDocument: document // Incluir el documento completo para procesamiento avanzado en el cliente
      };
      
      res.json(docWithContent);
    } catch (apiError: any) {
      console.error('Error calling Google API:', apiError);
      
      // Log de información detallada para debugging
      if (apiError.response) {
        console.error('API Error Details:', {
          status: apiError.response.status,
          data: apiError.response.data
        });
      }
      
      let errorMessage = 'Failed to fetch document from Google Docs';
      let errorCode = 500;
      
      // Manejo específico de errores comunes
      if (apiError.response?.status === 401) {
        errorMessage = 'Authentication error. Please reconnect to Google Docs';
        errorCode = 401;
      } else if (apiError.response?.status === 403) {
        errorMessage = 'Permission denied. Make sure you have access to the requested document';
        errorCode = 403;
      } else if (apiError.response?.status === 404) {
        errorMessage = 'Document not found. The requested document does not exist or you do not have access to it';
        errorCode = 404;
      }
      
      return res.status(errorCode).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Error fetching Google Doc:', error);
    res.status(500).json({ error: 'Failed to fetch document from Google Docs' });
  }
});

/**
 * Helper function to procesar el contenido del documento de Google Docs
 * Esta es una implementación básica que extrae texto de los elementos estructurados
 */
function processDocContent(content: any[]): string {
  if (!content || !Array.isArray(content)) {
    return '';
  }
  
  let result = '';
  
  for (const element of content) {
    // Procesar párrafos
    if (element.paragraph) {
      const paragraph = element.paragraph;
      
      // Procesar elementos de texto dentro del párrafo
      if (paragraph.elements && Array.isArray(paragraph.elements)) {
        for (const textElement of paragraph.elements) {
          if (textElement.textRun && textElement.textRun.content) {
            result += textElement.textRun.content;
          }
        }
      }
    }
    
    // Procesar tablas (simplemente como texto)
    if (element.table) {
      result += '[Tabla]\n';
      
      if (element.table.tableRows && Array.isArray(element.table.tableRows)) {
        for (const row of element.table.tableRows) {
          if (row.tableCells && Array.isArray(row.tableCells)) {
            for (const cell of row.tableCells) {
              if (cell.content && Array.isArray(cell.content)) {
                result += processDocContent(cell.content);
              }
            }
          }
        }
      }
    }
    
    // Procesar secciones anidadas
    if (element.sectionBreak) {
      result += '\n---\n';
    }
  }
  
  return result;
}

/**
 * @route POST /api/google-docs/import
 * @desc Import content from a Google Doc
 * @access Private
 */
router.post('/import', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { docUrl } = req.body;
    
    // Validate request
    if (!docUrl) {
      return res.status(400).json({ error: 'Google Doc URL is required' });
    }
    
    // Verificar si el usuario está autenticado
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Extraer el ID del documento de la URL
    let docId = '';
    try {
      const urlPattern = /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)\/?.*/;
      const match = docUrl.match(urlPattern);
      
      if (!match || !match[1]) {
        return res.status(400).json({ 
          error: 'Invalid Google Docs URL',
          message: 'The URL provided is not a valid Google Docs URL. It should be in the format: https://docs.google.com/document/d/DOCUMENT_ID/...'
        });
      }
      
      docId = match[1];
    } catch (parseError) {
      console.error('Error parsing Google Docs URL:', parseError);
      return res.status(400).json({ error: 'Failed to parse Google Docs URL' });
    }
    
    // Obtener token de acceso
    let accessToken = await getAccessToken(req.user.uid);
    
    // Para entorno de desarrollo, intentar siempre usar cuenta de servicio si no hay token
    const isDevEnvironment = process.env.NODE_ENV !== 'production';
    
    // Si no hay token de acceso disponible, intentar usar cuenta de servicio
    if (!accessToken && (authMethod === 'service_account' || isDevEnvironment)) {
      console.log('🔄 Using service account for Google Docs import...');
      accessToken = await getServiceAccountToken();
      
      // Log de éxito o fallo para debugging
      if (accessToken) {
        console.log('✅ Successfully obtained service account token for Google Docs import');
      } else {
        console.error('❌ Failed to obtain service account token for Google Docs import');
      }
    }
    
    // Si aún no hay token disponible, devolver error
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'No access token available',
        details: 'Please connect to Google Docs first',
        connectUrl: '/api/google-docs/connect'
      });
    }
    
    try {
      // Obtener los metadatos del documento desde Drive API
      const driveUrl = new URL(`https://www.googleapis.com/drive/v3/files/${docId}`);
      driveUrl.searchParams.append('fields', 'id,name,description,mimeType,modifiedTime,createdTime');
      
      const driveResponse = await axios.get(driveUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      // Obtener el contenido del documento desde Docs API
      const docsUrl = new URL(`https://docs.googleapis.com/v1/documents/${docId}`);
      
      const docsResponse = await axios.get(docsUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      // Extraer el contenido del documento
      const document = docsResponse.data;
      
      // Procesar el contenido del documento para convertirlo a texto plano o formato deseado
      let content = '';
      if (document.body && document.body.content) {
        content = processDocContent(document.body.content);
      }
      
      // Crear el objeto de respuesta con los metadatos y el contenido
      const importedDoc = {
        id: driveResponse.data.id,
        title: driveResponse.data.name,
        createdAt: driveResponse.data.createdTime,
        modifiedAt: driveResponse.data.modifiedTime,
        url: docUrl,
        content: content,
        rawDocument: document // Para uso avanzado en el cliente
      };
      
      res.json({
        success: true,
        document: importedDoc,
        importedAt: new Date().toISOString()
      });
    } catch (apiError: any) {
      console.error('Error importing from Google Docs API:', apiError);
      
      // Log de información detallada para debugging
      if (apiError.response) {
        console.error('API Error Details:', {
          status: apiError.response.status,
          data: apiError.response.data
        });
      }
      
      let errorMessage = 'Failed to import document from Google Docs';
      let errorCode = 500;
      
      // Manejo específico de errores comunes
      if (apiError.response?.status === 401) {
        errorMessage = 'Authentication error. Please reconnect to Google Docs';
        errorCode = 401;
      } else if (apiError.response?.status === 403) {
        errorMessage = 'Permission denied. Make sure you have access to the requested document';
        errorCode = 403;
      } else if (apiError.response?.status === 404) {
        errorMessage = 'Document not found. The requested document does not exist or you do not have access to it';
        errorCode = 404;
      }
      
      return res.status(errorCode).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Error importing from Google Docs:', error);
    res.status(500).json({ error: 'Failed to import content from Google Docs' });
  }
});

/**
 * @route POST /api/google-docs/export
 * @desc Export content to a new Google Doc
 * @access Private
 */
router.post('/export', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content, format = 'text' } = req.body;
    
    // Validate request
    if (!title) {
      return res.status(400).json({ error: 'Document title is required' });
    }
    
    if (!content) {
      return res.status(400).json({ error: 'Document content is required' });
    }
    
    // Verificar si el usuario está autenticado
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Obtener token de acceso
    let accessToken = await getAccessToken(req.user.uid);
    
    // Para entorno de desarrollo, intentar siempre usar cuenta de servicio si no hay token
    const isDevEnvironment = process.env.NODE_ENV !== 'production';
    
    // Si no hay token de acceso disponible, intentar usar cuenta de servicio
    if (!accessToken && (authMethod === 'service_account' || isDevEnvironment)) {
      console.log('🔄 Using service account for Google Docs export...');
      accessToken = await getServiceAccountToken();
      
      // Log de éxito o fallo para debugging
      if (accessToken) {
        console.log('✅ Successfully obtained service account token for Google Docs export');
      } else {
        console.error('❌ Failed to obtain service account token for Google Docs export');
      }
    }
    
    // Si aún no hay token disponible, devolver error
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'No access token available',
        details: 'Please connect to Google Docs first',
        connectUrl: '/api/google-docs/connect'
      });
    }
    
    try {
      // Crear un nuevo documento en Google Docs
      const docsUrl = new URL('https://docs.googleapis.com/v1/documents');
      
      // Crear un documento vacío con el título proporcionado
      const createResponse = await axios.post(docsUrl.toString(), 
        { title },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      const documentId = createResponse.data.documentId;
      
      // Ahora, insertamos el contenido en el documento
      const updateUrl = new URL(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`);
      
      // Preparar las solicitudes de actualización para insertar el contenido
      let requests = [];
      
      // Algoritmo simple de formateo de texto a estructuras de Google Docs
      if (format === 'markdown' || format === 'text') {
        // Dividir el contenido en líneas
        const lines = content.split('\n');
        
        // Procesar cada línea y generar solicitudes de inserción apropiadas
        let index = 1; // Índice de inserción inicial (después del título)
        
        for (const line of lines) {
          // Detectar encabezados markdown (# Heading)
          const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
          
          if (headingMatch) {
            // Es un encabezado, formatear como tal
            const headingLevel = headingMatch[1].length; // Número de # (1-6)
            const headingText = headingMatch[2].trim();
            
            requests.push({
              insertText: {
                location: { index },
                text: headingText + '\n'
              }
            });
            
            const endIndex = index + headingText.length;
            
            // Aplicar estilo de encabezado
            requests.push({
              updateParagraphStyle: {
                range: {
                  startIndex: index,
                  endIndex: endIndex
                },
                paragraphStyle: {
                  namedStyleType: `HEADING_${headingLevel}`
                },
                fields: 'namedStyleType'
              }
            });
            
            index = endIndex + 1; // +1 para el \n
          } else {
            // Texto normal
            requests.push({
              insertText: {
                location: { index },
                text: line + '\n'
              }
            });
            
            index += line.length + 1; // +1 para el \n
          }
        }
      }
      
      // Enviar solicitudes de actualización
      await axios.post(updateUrl.toString(), 
        { requests },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      // Obtener los detalles del documento creado
      const docUrl = new URL(`https://www.googleapis.com/drive/v3/files/${documentId}`);
      docUrl.searchParams.append('fields', 'id,name,description,mimeType,modifiedTime,createdTime,webViewLink');
      
      const docResponse = await axios.get(docUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      // Crear el objeto de respuesta
      const newDoc = {
        id: docResponse.data.id,
        title: docResponse.data.name,
        createdAt: docResponse.data.createdTime,
        modifiedAt: docResponse.data.modifiedTime,
        url: docResponse.data.webViewLink || `https://docs.google.com/document/d/${documentId}/edit`,
        snippet: content.substring(0, 100) + '...'
      };
      
      res.status(201).json({
        success: true,
        document: newDoc
      });
    } catch (apiError: any) {
      console.error('Error exporting to Google Docs API:', apiError);
      
      // Log de información detallada para debugging
      if (apiError.response) {
        console.error('API Error Details:', {
          status: apiError.response.status,
          data: apiError.response.data
        });
      }
      
      let errorMessage = 'Failed to export content to Google Docs';
      let errorCode = 500;
      
      // Manejo específico de errores comunes
      if (apiError.response?.status === 401) {
        errorMessage = 'Authentication error. Please reconnect to Google Docs';
        errorCode = 401;
      } else if (apiError.response?.status === 403) {
        errorMessage = 'Permission denied. Your account may not have sufficient permissions';
        errorCode = 403;
      } else if (apiError.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your input format';
        errorCode = 400;
      }
      
      return res.status(errorCode).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Error exporting to Google Docs:', error);
    res.status(500).json({ error: 'Failed to export content to Google Docs' });
  }
});

// Helper function to generate secure random state token
function generateStateToken(userId: string): string {
  const state = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 600000; // 10 minutes expiry
  oauthStateTokens.set(state, { userId, expiresAt });
  return state;
}

// Helper function to get a fresh access token using OAuth
async function getAccessToken(userId: string): Promise<string | null> {
  try {
    const tokenData = userGoogleDocsTokens.get(userId);
    
    if (!tokenData) {
      console.log('No Google Docs token found for user', userId);
      return null;
    }
    
    // Check if token is expired
    if (tokenData.expires_at <= Date.now()) {
      console.log('Google Docs token expired for user', userId, 'refreshing...');
      
      if (!googleOAuthCredentials) {
        console.error('No Google OAuth credentials available to refresh token');
        return null;
      }
      
      // Refresh the token
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: googleOAuthCredentials.web.client_id,
        client_secret: googleOAuthCredentials.web.client_secret,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token'
      });
      
      const { access_token, expires_in } = response.data;
      
      // Update token
      userGoogleDocsTokens.set(userId, {
        access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (expires_in * 1000)
      });
      
      return access_token;
    }
    
    return tokenData.access_token;
  } catch (error) {
    console.error('Error refreshing Google Docs access token:', error);
    return null;
  }
}

// Helper function to get access token using Service Account
async function getServiceAccountToken(): Promise<string | null> {
  try {
    if (!googleServiceAccount) {
      console.error('Google Service Account not configured');
      return null;
    }
    
    console.log('🔄 Intentando obtener token con cuenta de servicio:', {
      clientEmail: googleServiceAccount.client_email,
      projectId: googleServiceAccount.project_id
    });
    
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
    
    // Implement JWT signing manually with crypto
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
        console.error('La clave privada no tiene el formato correcto');
        return null;
      }
      
      // Some environments replace newlines with literal \n - fix this
      if (privateKey.includes('\\n') && !privateKey.includes('\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
        console.log('🔄 Fixed newlines in private key');
      }
      
      // Encode header and payload as base64
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      const encodedPayload = Buffer.from(JSON.stringify(claims)).toString('base64')
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
      
      // Exchange JWT for an access token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      });
      
      if (tokenResponse.data && tokenResponse.data.access_token) {
        console.log('✅ Successfully obtained access token using service account');
        return tokenResponse.data.access_token;
      } else {
        console.error('❌ No access token in response:', tokenResponse.data);
        return null;
      }
    } catch (jwtError: any) {
      console.error('❌ Error creating or exchanging JWT:', jwtError);
      
      // Log detailed error for debugging
      if (jwtError.response) {
        console.error('JWT exchange error details:', {
          status: jwtError.response.status,
          data: jwtError.response.data
        });
      }
      
      throw jwtError;
    }
  } catch (error) {
    console.error('Error getting service account token:', error);
    return null;
  }
}

/**
 * @route POST /api/google-docs/connect
 * @desc Connect to Google Docs (OAuth flow initiation)
 * @access Private
 */
router.post('/connect', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    console.log('🔄 Initiating Google Docs connection for user:', req.user.email);
    
    if (!googleOAuthCredentials && !googleServiceAccount) {
      return res.status(500).json({ 
        error: 'Google Docs credentials not configured',
        details: 'Please add the Google Docs credentials JSON file to configure integration'
      });
    }
    
    // Prefer OAuth, but fall back to service account as last resort
    if (!googleOAuthCredentials) {
      // If only service account is available, respond with appropriate message
      return res.status(200).json({ 
        message: 'Using Google Docs Service Account authentication',
        authType: 'service_account',
        serviceEmail: googleServiceAccount?.client_email
      });
    }
    
    const clientId = googleOAuthCredentials.web.client_id;
    if (!clientId) {
      return res.status(500).json({ error: 'Google Client ID not configured in credentials file' });
    }
    
    // Generate a state token to protect against CSRF
    const state = generateStateToken(req.user.uid);
    
    // Get the appropriate redirect URI based on environment
    let redirectUri;
    if (process.env.NODE_ENV === 'development' && !process.env.REPL_ID) {
      redirectUri = 'http://localhost:5000/api/google-docs/callback';
    } else if (process.env.REPL_ID) {
      const replSlug = process.env.REPL_SLUG || 'workspace';
      const replOwner = process.env.REPL_OWNER || '4gents4work';
      redirectUri = `https://${replSlug}.${replOwner}.repl.co/api/google-docs/callback`;
    } else {
      redirectUri = 'https://ai-marketing-platform.replit.app/api/google-docs/callback';
    }
    
    // Build the OAuth2 consent URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file');
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('prompt', 'consent');
    
    console.log('🔄 Google Docs auth URL generated:', authUrl.toString());
    
    res.json({ authUrl: authUrl.toString() });
  } catch (error: any) {
    console.error('Error initiating Google Docs connection:', error);
    
    // Log detailed error information for debugging
    if (error.response) {
      console.error('Detailed Google Docs connection error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    // Include more specific error details in response
    const errorMessage = error.response?.data?.error_description || 
                        error.response?.data?.error ||
                        error.message || 
                        'Failed to connect to Google Docs';
                        
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * @route GET /api/google-docs/callback
 * @desc Handle OAuth callback from Google 
 * @access Public
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;
    
    // Check for errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect('/#/google-docs?error=access_denied');
    }
    
    // Validate state parameter
    if (!state || typeof state !== 'string') {
      console.error('Invalid state parameter');
      return res.redirect('/#/google-docs?error=invalid_state');
    }
    
    // Get stored state token
    const storedState = oauthStateTokens.get(state);
    
    if (!storedState) {
      console.error('State token not found');
      return res.redirect('/#/google-docs?error=invalid_state');
    }
    
    // Check if state token is expired
    if (storedState.expiresAt < Date.now()) {
      console.error('State token expired');
      oauthStateTokens.delete(state);
      return res.redirect('/#/google-docs?error=expired_state');
    }
    
    // Check code
    if (!code) {
      console.error('No authorization code present');
      return res.redirect('/#/google-docs?error=no_code');
    }
    
    // State is valid, exchange code for access token
    const userId = storedState.userId;
    console.log('Processing OAuth callback for user ID:', userId);
    
    if (!googleOAuthCredentials) {
      console.error('Google OAuth credentials not available to exchange code');
      return res.redirect('/#/google-docs?error=server_error');
    }
    
    // Get the appropriate redirect URI based on environment
    let redirectUri;
    if (process.env.NODE_ENV === 'development' && !process.env.REPL_ID) {
      redirectUri = 'http://localhost:5000/api/google-docs/callback';
    } else if (process.env.REPL_ID) {
      const replSlug = process.env.REPL_SLUG || 'workspace';
      const replOwner = process.env.REPL_OWNER || '4gents4work';
      redirectUri = `https://${replSlug}.${replOwner}.repl.co/api/google-docs/callback`;
    } else {
      redirectUri = 'https://ai-marketing-platform.replit.app/api/google-docs/callback';
    }
    
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: googleOAuthCredentials.web.client_id,
      client_secret: googleOAuthCredentials.web.client_secret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });
    
    // Extract tokens
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Store tokens
    userGoogleDocsTokens.set(userId, {
      access_token,
      refresh_token,
      expires_at: Date.now() + (expires_in * 1000)
    });
    
    // In a real app, we would store these tokens in a database
    // For demo purposes, also save to a local tokens file
    try {
      const tokensData = { [userId]: { access_token, refresh_token, expires_at: Date.now() + (expires_in * 1000) } };
      fs.writeFileSync(GOOGLE_DOCS_TOKEN_PATH, JSON.stringify(tokensData, null, 2));
      console.log('Saved Google Docs tokens to file');
    } catch (writeError) {
      console.warn('Could not save tokens to file:', writeError);
    }
    
    // Clean up state token
    oauthStateTokens.delete(state);
    
    // Redirect back to the app
    res.redirect('/#/google-docs?success=true');
  } catch (error: any) {
    console.error('Error handling Google Docs OAuth callback:', error);
    
    // Log more detailed information
    if (error.response) {
      console.error('Callback error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    // Determine error code
    let errorCode = 'server_error';
    if (error.response?.data?.error === 'invalid_grant') {
      errorCode = 'invalid_grant';
    }
    
    res.redirect(`/#/google-docs?error=${errorCode}`);
  }
});

/**
 * @route POST /api/google-docs/create
 * @desc Create a new Google Docs document
 * @access Private
 */
router.post('/create', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    // Verificar si el usuario está autenticado
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Obtener parámetros del cuerpo de la solicitud
    const { title, content, mimeType = 'application/vnd.google-apps.document' } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Obtener token de acceso
    let accessToken = await getAccessToken(req.user.uid);
    
    // Para entorno de desarrollo, intentar siempre usar cuenta de servicio si no hay token
    const isDevEnvironment = process.env.NODE_ENV !== 'production';
    
    // Si no hay token de acceso disponible, intentar usar cuenta de servicio
    if (!accessToken && (authMethod === 'service_account' || isDevEnvironment)) {
      console.log('🔄 Using service account for Google Docs access...');
      accessToken = await getServiceAccountToken();
      
      // Log de éxito o fallo para debugging
      if (accessToken) {
        console.log('✅ Successfully obtained service account token for Google Docs');
      } else {
        console.error('❌ Failed to obtain service account token for Google Docs');
      }
    }
    
    // Si aún no hay token disponible, devolver error
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'No access token available',
        details: 'Please connect to Google Docs first',
        connectUrl: '/api/google-docs/connect'
      });
    }
    
    try {
      // Crear un archivo en Google Drive
      const driveResponse = await axios.post(
        'https://www.googleapis.com/drive/v3/files',
        {
          name: title,
          mimeType: mimeType,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const fileId = driveResponse.data.id;
      
      // Si hay contenido, actualizarlo en el documento
      if (content && fileId) {
        // Para Google Docs, necesitamos usar la Docs API para actualizar el contenido
        // Aquí un enfoque simplificado para actualizar el contenido
        const docsResponse = await axios.post(
          `https://docs.googleapis.com/v1/documents/${fileId}:batchUpdate`,
          {
            requests: [
              {
                insertText: {
                  location: {
                    index: 1
                  },
                  text: content
                }
              }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Devolver información del documento creado
        res.json({
          success: true,
          document: {
            id: fileId,
            title: title,
            url: `https://docs.google.com/document/d/${fileId}/edit`,
            createdAt: new Date().toISOString()
          }
        });
      } else {
        // Si no hay contenido, simplemente devolver la información del documento creado
        res.json({
          success: true,
          document: {
            id: fileId,
            title: title,
            url: `https://docs.google.com/document/d/${fileId}/edit`,
            createdAt: new Date().toISOString()
          }
        });
      }
    } catch (apiError: any) {
      console.error('Error calling Google API:', apiError);
      
      // Log de información detallada para debugging
      if (apiError.response) {
        console.error('API Error Details:', {
          status: apiError.response.status,
          data: apiError.response.data
        });
      }
      
      let errorMessage = 'Failed to create document in Google Docs';
      let errorCode = 500;
      
      // Manejo específico de errores comunes
      if (apiError.response?.status === 401) {
        errorMessage = 'Authentication error. Please reconnect to Google Docs';
        errorCode = 401;
      } else if (apiError.response?.status === 403) {
        errorMessage = 'Permission denied. Make sure the service account has the necessary permissions';
        errorCode = 403;
      }
      
      return res.status(errorCode).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Error creating Google Doc:', error);
    res.status(500).json({ error: 'Failed to create document in Google Docs' });
  }
});

/**
 * @route POST /api/google-docs/credentials
 * @desc Upload Google Docs credentials JSON file
 * @access Private (admin only)
 */
router.post('/credentials', authMiddleware, async (req: Request, res: Response) => {
  try {
    // This endpoint should be protected with admin-only access
    // For now, we'll just check if the user is authenticated
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // In a real implementation, we would validate the user is an admin
    
    // Get credentials from request body
    const { credentials } = req.body;
    
    if (!credentials) {
      return res.status(400).json({ error: 'No credentials provided' });
    }
    
    // Validate credentials format
    try {
      // If credentials are a string, parse them
      const credentialsObj = typeof credentials === 'string' 
        ? JSON.parse(credentials) 
        : credentials;
      
      // Simple validation that it's a Google OAuth credentials file
      if (!credentialsObj.web || !credentialsObj.web.client_id || !credentialsObj.web.client_secret) {
        return res.status(400).json({ error: 'Invalid Google credentials format' });
      }
      
      // Save credentials to file
      fs.writeFileSync(
        GOOGLE_CREDENTIALS_PATH, 
        JSON.stringify(credentialsObj, null, 2)
      );
      
      // Actualizar las credenciales en el sistema
      // Cargar las credenciales actualizadas
      googleOAuthCredentials = credentialsObj;
      
      // Actualizar el método de autenticación
      authMethod = 'oauth';
      console.log('🔄 Auth method updated to OAuth after credentials upload');
      
      console.log('Successfully saved Google Docs credentials');
      
      res.json({ 
        success: true, 
        message: 'Google Docs credentials saved successfully',
        client_id: credentialsObj.web.client_id
      });
    } catch (parseError) {
      console.error('Error parsing credentials:', parseError);
      return res.status(400).json({ error: 'Invalid JSON format for credentials' });
    }
  } catch (error) {
    console.error('Error uploading Google Docs credentials:', error);
    res.status(500).json({ error: 'Failed to save Google Docs credentials' });
  }
});

/**
 * @route GET /api/google-docs/export/:id
 * @desc Export a Google Doc to a specific format
 * @access Private
 */
router.get('/export/:id', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { format = 'pdf' } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Document ID is required' });
  }
  
  try {
    // Check if the user is authenticated
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get access token for the user
    let accessToken = await getAccessToken(req.user.uid);
    
    // For development, try to use service account if no token is available
    const isDevEnvironment = process.env.NODE_ENV !== 'production';
    
    // If no access token is available, try to use service account
    if (!accessToken && (authMethod === 'service_account' || isDevEnvironment)) {
      console.log('🔄 Using service account for Google Docs access...');
      accessToken = await getServiceAccountToken();
      
      // Log success or failure for debugging
      if (accessToken) {
        console.log('✅ Successfully obtained service account token for Google Docs export');
      } else {
        console.error('❌ Failed to obtain service account token for Google Docs export');
      }
    }
    
    // If no access token is available, return error
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'No access token available', 
        details: 'Please connect to Google Docs first',
        connectUrl: '/api/google-docs/connect'
      });
    }
    
    // Get the export format
    const exportFormat = format.toString().toLowerCase();
    
    // Map Google Docs export format
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'odt': 'application/vnd.oasis.opendocument.text',
      'txt': 'text/plain',
      'html': 'text/html',
      'epub': 'application/epub+zip',
      'json': 'application/vnd.google-apps.document'
    };
    
    // Check if the format is supported
    if (!mimeTypes[exportFormat]) {
      return res.status(400).json({ 
        error: 'Unsupported export format',
        supportedFormats: Object.keys(mimeTypes)
      });
    }
    
    const exportMimeType = mimeTypes[exportFormat];
    
    // For JSON special handling - returns document structure directly
    if (exportFormat === 'json') {
      try {
        const response = await axios.get(
          `https://docs.googleapis.com/v1/documents/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        return res.json(response.data);
      } catch (error: any) {
        console.error('Error exporting document to JSON:', error);
        
        // Log detailed error for debugging
        if (error.response) {
          console.error('API Error Details:', {
            status: error.response.status,
            data: error.response.data
          });
        }
        
        return res.status(500).json({ 
          error: 'Failed to export document to JSON',
          details: error.response?.data || error.message 
        });
      }
    }
    
    // For other formats, use export link
    try {
      const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${id}/export`,
        {
          params: {
            mimeType: exportMimeType
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          responseType: 'arraybuffer'
        }
      );
      
      // Set content type and disposition headers
      res.setHeader('Content-Type', exportMimeType);
      res.setHeader('Content-Disposition', `attachment; filename="document.${exportFormat}"`);
      
      // Send the exported content
      return res.send(response.data);
    } catch (error: any) {
      console.error('Error exporting document:', error);
      
      // Log detailed error for debugging
      if (error.response) {
        console.error('API Error Details:', {
          status: error.response.status,
          data: Buffer.from(error.response.data).toString() // Convert arraybuffer to string
        });
      }
      
      // Return JSON error even though we were trying to export
      return res.status(500).json({ 
        error: 'Failed to export document',
        details: error.response?.data?.error || error.message 
      });
    }
  } catch (error) {
    console.error('Error exporting Google Doc:', error);
    return res.status(500).json({ error: 'Failed to export document' });
  }
});

export const googleDocsRouter = router;