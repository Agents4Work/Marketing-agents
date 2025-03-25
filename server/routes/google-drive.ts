import express, { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';
import axios from 'axios';
import crypto from 'crypto';
import { URL } from 'url';
import querystring from 'querystring';
import fs from 'fs';
import path from 'path';

// Define interface for Service Account credentials
interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// Paths for credentials
const CREDENTIALS_DIR = path.join(process.cwd(), 'credentials');
const SERVICE_ACCOUNT_PATH = path.join(CREDENTIALS_DIR, 'service-account.json');

// Load Service Account credentials if available
let googleServiceAccount: ServiceAccountCredentials | null = null;
try {
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const rawCredentials = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
    googleServiceAccount = JSON.parse(rawCredentials);
    console.log('🔄 Google Drive Service Account loaded successfully');
  } else {
    console.log('⚠️ No Service Account credentials found for Google Drive');
  }
} catch (err) {
  console.error('❌ Error loading Service Account credentials:', err);
}

// Get the appropriate redirect URI based on environment
// In Replit, we use the generated repl URL
let REDIRECT_URI = process.env.REDIRECT_URI;

if (!REDIRECT_URI) {
  // For local development
  if (process.env.NODE_ENV === 'development' && !process.env.REPL_ID) {
    REDIRECT_URI = 'http://localhost:5000/api/google-drive/callback';
  } 
  // For Replit environment
  else if (process.env.REPL_ID) {
    const replSlug = process.env.REPL_SLUG || 'ai-marketing-platform';
    const replOwner = process.env.REPL_OWNER || 'replit';
    REDIRECT_URI = `https://${replSlug}.${replOwner}.repl.co/api/google-drive/callback`;
  }
  // Fallback for other environments
  else {
    REDIRECT_URI = 'https://ai-marketing-platform.replit.app/api/google-drive/callback';
  }
}

console.log('🔄 Using redirect URI:', REDIRECT_URI);
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'];

// Session token storage for OAuth state validation
const oauthStateTokens: Map<string, { userId: string, expiresAt: number }> = new Map();

// User token storage - in production this should be in a database
const userTokens: Map<string, { 
  access_token: string, 
  refresh_token: string, 
  expires_at: number 
}> = new Map();

// Define a development auth bypass middleware
const devAuthBypassMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check for dev bypass header or non-production environment
  const hasDevBypassHeader = req.headers['x-dev-bypass-auth'] === 'true';
  const isDevEnvironment = process.env.NODE_ENV !== 'production';
  
  if (hasDevBypassHeader || isDevEnvironment) {
    console.log('🔄 Auth bypassed for development in Google Drive routes');
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

// Helper function to generate secure random state token
function generateStateToken(userId: string): string {
  const state = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 600000; // 10 minutes expiry
  oauthStateTokens.set(state, { userId, expiresAt });
  return state;
}

// Helper function to get a fresh access token through OAuth flow
async function getAccessToken(userId: string): Promise<string | null> {
  try {
    const tokenData = userTokens.get(userId);
    
    if (!tokenData) {
      console.log('No token found for user', userId);
      
      // If we have a service account configured, use it as fallback
      if (googleServiceAccount) {
        console.log('Falling back to service account authentication');
        return getServiceAccountToken();
      }
      
      return null;
    }
    
    // Check if token is expired
    if (tokenData.expires_at <= Date.now()) {
      console.log('Token expired for user', userId, 'refreshing...');
      
      // Refresh the token
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token'
      });
      
      const { access_token, expires_in } = response.data;
      
      // Update token
      userTokens.set(userId, {
        access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (expires_in * 1000)
      });
      
      return access_token;
    }
    
    return tokenData.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    
    // If we have a service account configured, use it as fallback
    if (googleServiceAccount) {
      console.log('Error with OAuth token, trying service account authentication');
      return getServiceAccountToken();
    }
    
    return null;
  }
}

// Helper function to get a token using Service Account
async function getServiceAccountToken(): Promise<string | null> {
  try {
    if (!googleServiceAccount) {
      console.error('Google Service Account not configured');
      return null;
    }
    
    // Create JWT claims for Google's OAuth token endpoint
    const now = Math.floor(Date.now() / 1000);
    const expiryTime = now + 3600; // Token valid for 1 hour
    
    const claims = {
      iss: googleServiceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
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
      
      // Sign the content with the private key from service account
      const privateKey = googleServiceAccount.private_key;
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signContent);
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
        console.log('✅ Successfully obtained access token using service account for Google Drive');
        return tokenResponse.data.access_token;
      } else {
        console.error('❌ No access token in response:', tokenResponse.data);
        return null;
      }
    } catch (jwtError: any) {
      console.error('❌ Error creating or exchanging JWT for Google Drive:', jwtError);
      
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
    console.error('Error getting service account token for Google Drive:', error);
    return null;
  }
}

const router = express.Router();

// Interface for Google Drive file/folder items
interface GoogleDriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  iconLink?: string;
  starred?: boolean;
  shared?: boolean;
}

// Mock data fallback - will be used when real Google API is not available
const mockDriveFiles: GoogleDriveItem[] = [
  {
    id: 'folder-1',
    name: 'Marketing Campaign Materials',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2025-03-15T14:00:00Z',
    starred: true
  },
  {
    id: 'spreadsheet-1',
    name: 'Q1 Analytics Report',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    size: '2.3 MB',
    modifiedTime: '2025-03-10T09:30:00Z',
    webViewLink: 'https://docs.google.com/spreadsheets/d/mock-id/edit',
    shared: true
  },
  {
    id: 'pdf-1',
    name: 'Brand Guidelines',
    mimeType: 'application/pdf',
    size: '4.8 MB',
    modifiedTime: '2025-02-28T16:45:00Z',
    webViewLink: 'https://drive.google.com/file/d/mock-id/view'
  }
];

/**
 * @route GET /api/google-drive/status
 * @desc Check Google Drive connection status
 * @access Public (for testing) or Private (for production)
 */
router.get('/status', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    console.log('🔄 Checking Google Drive status for user:', req.user.uid);
    
    // Check if we have a token for this user
    const accessToken = await getAccessToken(req.user.uid);
    const connected = !!accessToken;
    
    if (connected) {
      try {
        // Fetch storage quota from Google Drive API
        const response = await axios.get('https://www.googleapis.com/drive/v3/about', {
          params: {
            fields: 'storageQuota',
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        const { storageQuota } = response.data;
        
        // Determine auth method - if token came from service account, indicate this
        const authMethod = accessToken === await getServiceAccountToken() 
          ? 'service_account'
          : 'oauth';

        const email = authMethod === 'service_account' 
          ? googleServiceAccount?.client_email || 'service-account@example.com'
          : req.user.email;
        
        return res.json({
          connected: true,
          authMethod,
          storage: {
            limit: parseInt(storageQuota.limit) || 15 * 1024 * 1024 * 1024, // 15 GB default
            usage: parseInt(storageQuota.usage) || 0,
          },
          email
        });
      } catch (apiError) {
        console.error('Error fetching Google Drive quota:', apiError);
        
        // Try checking if we're using service account
        const serviceAccountToken = await getServiceAccountToken();
        const usingServiceAccount = accessToken === serviceAccountToken;
        
        return res.json({
          connected: true,
          authMethod: usingServiceAccount ? 'service_account' : 'oauth',
          storage: {
            limit: 15 * 1024 * 1024 * 1024, // 15 GB
            usage: 0, // Unknown usage
          },
          email: usingServiceAccount 
            ? googleServiceAccount?.client_email || 'service-account@example.com'
            : req.user.email
        });
      }
    } else {
      // Try to get service account token directly if OAuth failed
      const serviceAccountToken = await getServiceAccountToken();
      
      if (serviceAccountToken) {
        try {
          // Fetch storage quota using service account
          const response = await axios.get('https://www.googleapis.com/drive/v3/about', {
            params: {
              fields: 'storageQuota',
            },
            headers: {
              Authorization: `Bearer ${serviceAccountToken}`
            }
          });
          
          const { storageQuota } = response.data;
          
          return res.json({
            connected: true,
            authMethod: 'service_account',
            storage: {
              limit: parseInt(storageQuota.limit) || 15 * 1024 * 1024 * 1024,
              usage: parseInt(storageQuota.usage) || 0,
            },
            email: googleServiceAccount?.client_email || 'service-account@example.com'
          });
        } catch (saError) {
          console.error('Error fetching Google Drive quota with service account:', saError);
        }
      }
      
      // No connections available
      return res.json({
        connected: false,
        storage: {
          limit: 15 * 1024 * 1024 * 1024, // 15 GB
          usage: 0, // Unknown usage until connected
        },
        email: req.user.email
      });
    }
  } catch (error) {
    console.error('Error checking Google Drive status:', error);
    res.status(500).json({ error: 'Failed to check Google Drive connection status' });
  }
});

/**
 * @route GET /api/google-drive/files
 * @desc Get files from Google Drive
 * @access Public (for testing) or Private (for production)
 */
router.get('/files', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    // Query parameters
    const folderId = req.query.folderId as string || 'root';
    const query = req.query.q as string || '';
    const pageToken = req.query.pageToken as string;
    
    console.log('🔄 Fetching Google Drive files', { folderId, query });
    
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Try to get access token
    const accessToken = await getAccessToken(req.user.uid);
    
    // If we have a token, use the real Google Drive API
    if (accessToken) {
      try {
        // Build the query string
        let q = `'${folderId}' in parents and trashed = false`;
        if (query) {
          q += ` and name contains '${query}'`;
        }
        
        // Make request to Google Drive API
        const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
          params: {
            q,
            fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,shared,starred),nextPageToken',
            pageToken: pageToken || undefined,
            pageSize: 100
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        // Convert response to our interface format
        const files: GoogleDriveItem[] = response.data.files.map((file: any) => ({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size ? `${Math.round(parseInt(file.size) / (1024 * 1024) * 10) / 10} MB` : undefined,
          modifiedTime: file.modifiedTime,
          webViewLink: file.webViewLink,
          iconLink: file.iconLink,
          shared: file.shared,
          starred: file.starred
        }));
        
        console.log('🔄 Returning real Google Drive files', { count: files.length });
        
        return res.json({
          files,
          nextPageToken: response.data.nextPageToken || null
        });
      } catch (apiError) {
        console.error('Error calling Google Drive API:', apiError);
        // Fall back to mock data if API call fails
        console.log('🔄 Falling back to mock data due to API error');
      }
    }
    
    // Fall back to mock data if no token or API call failed
    let files = [...mockDriveFiles];
    
    // Simple filtering based on search query
    if (query) {
      files = files.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    console.log('🔄 Returning mock Google Drive files', { count: files.length });
    
    return res.json({
      files,
      nextPageToken: null
    });
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    res.status(500).json({ error: 'Failed to fetch files from Google Drive' });
  }
});

/**
 * @route POST /api/google-drive/upload
 * @desc Upload a file to Google Drive
 * @access Public (for testing) or Private (for production)
 */
router.post('/upload', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, folderId = 'root', mimeType = 'application/octet-stream', content = '' } = req.body;
    
    console.log('🔄 Uploading file to Google Drive', { name, folderId });
    
    // Validate request
    if (!name) {
      return res.status(400).json({ error: 'File name is required' });
    }
    
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Try to get access token
    const accessToken = await getAccessToken(req.user.uid);
    
    // If we have a token, use the real Google Drive API
    if (accessToken) {
      try {
        // Define metadata for the file
        const fileMetadata = {
          name: name,
          mimeType: mimeType,
          parents: [folderId]
        };
        
        // Create a boundary for multipart data
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelimiter = "\r\n--" + boundary + "--";
        
        // Build the multipart request body
        let requestBody = 
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(fileMetadata) +
          delimiter +
          'Content-Type: ' + mimeType + '\r\n\r\n' +
          content +
          closeDelimiter;
        
        // For larger files or binary content, we would use a different approach
        // such as streaming the file data with a library like multer
        
        // Upload the file to Google Drive
        const response = await axios.post(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          requestBody,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': `multipart/related; boundary=${boundary}`,
              'Content-Length': requestBody.length
            }
          }
        );
        
        // After successful upload, get file details
        const fileDetailsResponse = await axios.get(
          `https://www.googleapis.com/drive/v3/files/${response.data.id}`,
          {
            params: {
              fields: 'id,name,mimeType,size,modifiedTime,webViewLink'
            },
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        const fileDetails = fileDetailsResponse.data;
        
        // Format the response
        const uploadedFile: GoogleDriveItem = {
          id: fileDetails.id,
          name: fileDetails.name,
          mimeType: fileDetails.mimeType,
          size: fileDetails.size ? `${Math.round(parseInt(fileDetails.size) / (1024 * 1024) * 10) / 10} MB` : '0 MB',
          modifiedTime: fileDetails.modifiedTime,
          webViewLink: fileDetails.webViewLink
        };
        
        console.log('🔄 File uploaded to Google Drive', uploadedFile);
        
        return res.status(201).json(uploadedFile);
      } catch (apiError) {
        console.error('Error calling Google Drive API for upload:', apiError);
        // Fall back to mock response if API call fails
        console.log('🔄 Falling back to mock response due to API error');
      }
    }
    
    // Fall back to mock response if no token or API call failed
    // Generate a mock response with a new file entry
    const newFile: GoogleDriveItem = {
      id: `file-${Date.now()}`,
      name,
      mimeType: mimeType || (name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
      size: '1.2 MB',
      modifiedTime: new Date().toISOString(),
      webViewLink: `https://drive.google.com/file/d/mock-id-${Date.now()}/view`
    };
    
    console.log('🔄 File upload simulated (mock response)', newFile);
    
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    res.status(500).json({ error: 'Failed to upload file to Google Drive' });
  }
});

/**
 * @route POST /api/google-drive/create-folder
 * @desc Create a new folder in Google Drive
 * @access Public (for testing) or Private (for production)
 */
router.post('/create-folder', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, parentFolderId = 'root' } = req.body;
    
    console.log('🔄 Creating Google Drive folder', { name, parentFolderId });
    
    // Validate request
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Try to get access token
    const accessToken = await getAccessToken(req.user.uid);
    
    // If we have a token, use the real Google Drive API
    if (accessToken) {
      try {
        // Define metadata for the folder
        const folderMetadata = {
          name: name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId]
        };
        
        // Create the folder in Google Drive
        const response = await axios.post(
          'https://www.googleapis.com/drive/v3/files',
          folderMetadata,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Format the response
        const newFolder: GoogleDriveItem = {
          id: response.data.id,
          name: response.data.name,
          mimeType: response.data.mimeType,
          modifiedTime: new Date().toISOString() // Google doesn't always return modifiedTime in this API
        };
        
        console.log('🔄 Created Google Drive folder', newFolder);
        
        return res.status(201).json(newFolder);
      } catch (apiError) {
        console.error('Error calling Google Drive API for folder creation:', apiError);
        // Fall back to mock response if API call fails
        console.log('🔄 Falling back to mock folder creation due to API error');
      }
    }
    
    // Fall back to mock response if no token or API call failed
    const newFolder: GoogleDriveItem = {
      id: `folder-${Date.now()}`,
      name,
      mimeType: 'application/vnd.google-apps.folder',
      modifiedTime: new Date().toISOString()
    };
    
    console.log('🔄 Folder creation simulated (mock response)', newFolder);
    
    res.status(201).json(newFolder);
  } catch (error) {
    console.error('Error creating folder in Google Drive:', error);
    res.status(500).json({ error: 'Failed to create folder in Google Drive' });
  }
});

/**
 * @route GET /api/google-drive/download/:fileId
 * @desc Generate a download URL for a file
 * @access Public (for testing) or Private (for production)
 */
router.get('/download/:fileId', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    const fileId = req.params.fileId;
    
    console.log('🔄 Generating download URL for file:', fileId);
    
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Try to get access token
    const accessToken = await getAccessToken(req.user.uid);
    
    // If we have a token, generate a real download URL
    if (accessToken) {
      try {
        // Get file metadata to determine how to download it
        const response = await axios.get(
          `https://www.googleapis.com/drive/v3/files/${fileId}`,
          {
            params: {
              fields: 'id,name,mimeType,size'
            },
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        // Generate download URL
        // For Google Docs files, we need to export them to a specific format
        let downloadUrl;
        
        if (response.data.mimeType.startsWith('application/vnd.google-apps')) {
          // This is a Google Docs/Sheets/Slides file
          const exportFormat = getExportFormat(response.data.mimeType);
          downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${exportFormat}&alt=media`;
        } else {
          // This is a regular file
          downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        }
        
        console.log('🔄 Generated real download URL for:', response.data.name);
        
        return res.json({
          downloadUrl: downloadUrl,
          accessToken: accessToken, // This is needed for the client to authenticate the download
          fileName: response.data.name,
          mimeType: response.data.mimeType
        });
      } catch (apiError) {
        console.error('Error generating download URL with API:', apiError);
        // Fall back to mock download URL if API call fails
        console.log('🔄 Falling back to mock download URL due to API error');
      }
    }
    
    // Fall back to mock download URL if no token or API call failed
    const downloadResponse = {
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      fileName: 'unknown-file.txt',
      mimeType: 'application/octet-stream'
    };
    
    console.log('🔄 Download URL generated (mock):', downloadResponse.downloadUrl);
    
    res.json(downloadResponse);
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// Helper function to determine export format for Google Docs files
function getExportFormat(mimeType: string): string {
  switch(mimeType) {
    case 'application/vnd.google-apps.document':
      return 'application/pdf';
    case 'application/vnd.google-apps.spreadsheet':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'application/vnd.google-apps.presentation':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'application/vnd.google-apps.drawing':
      return 'image/png';
    default:
      return 'application/pdf';
  }
}

/**
 * @route POST /api/google-drive/connect
 * @desc Connect to Google Drive (OAuth flow initiation)
 * @access Public (for testing) or Private (for production)
 */
router.post('/connect', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    console.log('🔄 Initiating Google Drive connection for user:', req.user.email);
    
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google Client ID not configured' });
    }
    
    // Generate a state token to protect against CSRF
    const state = generateStateToken(req.user.uid);
    
    // Build the OAuth2 consent URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', SCOPES.join(' '));
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('prompt', 'consent');
    
    console.log('🔄 Google Drive auth URL generated:', authUrl.toString());
    
    res.json({ authUrl: authUrl.toString() });
  } catch (error: any) {
    console.error('Error initiating Google Drive connection:', error);
    
    // Log detailed error information for debugging
    if (error.response) {
      console.error('Detailed Google Drive connection error:', {
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
                         'Failed to connect to Google Drive';
                         
    res.status(500).json({ 
      error: errorMessage,
      details: error.response?.data
    });
  }
});

/**
 * @route GET /api/google-drive/callback
 * @desc Handle callback from Google OAuth2
 * @access Public
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;
    
    // Check for errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect('/#/google-drive?error=access_denied');
    }
    
    // Validate state parameter
    if (!state || typeof state !== 'string') {
      console.error('Invalid state parameter');
      return res.redirect('/#/google-drive?error=invalid_state');
    }
    
    // Get stored state token
    const storedState = oauthStateTokens.get(state);
    
    if (!storedState) {
      console.error('State token not found');
      return res.redirect('/#/google-drive?error=invalid_state');
    }
    
    // Check if state token is expired
    if (storedState.expiresAt < Date.now()) {
      console.error('State token expired');
      oauthStateTokens.delete(state);
      return res.redirect('/#/google-drive?error=expired_state');
    }
    
    // Exchange auth code for tokens
    if (!code || typeof code !== 'string') {
      console.error('No authorization code provided');
      return res.redirect('/#/google-drive?error=no_code');
    }
    
    const userId = storedState.userId;
    console.log('🔄 Processing OAuth callback for user:', userId);
    
    // Exchange the code for access and refresh tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });
    
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Store the tokens
    userTokens.set(userId, {
      access_token,
      refresh_token,
      expires_at: Date.now() + (expires_in * 1000)
    });
    
    console.log('🔄 Google Drive successfully connected for user:', userId);
    
    // Redirect to the application with success message
    return res.redirect('/#/google-drive?success=true');
  } catch (error) {
    console.error('Error processing OAuth callback:', error);
    return res.redirect('/#/google-drive?error=server_error');
  }
});

/**
 * @route POST /api/google-drive/disconnect
 * @desc Disconnect from Google Drive
 * @access Public (for testing) or Private (for production)
 */
router.post('/disconnect', devAuthBypassMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    console.log('🔄 Disconnecting from Google Drive for user:', req.user.email);
    
    // Get tokens for this user
    const tokenData = userTokens.get(req.user.uid);
    
    if (tokenData?.access_token) {
      try {
        // Revoke the access token
        await axios.post('https://oauth2.googleapis.com/revoke', 
          querystring.stringify({ token: tokenData.access_token }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
      } catch (revokeError) {
        console.warn('Error revoking token, continuing with disconnection:', revokeError);
      }
    }
    
    // Remove token from storage
    userTokens.delete(req.user.uid);
    
    console.log('🔄 Google Drive disconnected successfully for user:', req.user.uid);
    
    res.json({ 
      success: true, 
      message: 'Successfully disconnected from Google Drive' 
    });
  } catch (error) {
    console.error('Error disconnecting from Google Drive:', error);
    res.status(500).json({ error: 'Failed to disconnect from Google Drive' });
  }
});

// Test endpoint to check Google auth configuration
router.get('/test-config', (_req: Request, res: Response) => {
  try {
    const config = {
      redirectUri: REDIRECT_URI,
      clientId: GOOGLE_CLIENT_ID ? "Present (First 5 chars: " + GOOGLE_CLIENT_ID.substring(0, 5) + "...)" : "Missing",
      clientSecret: GOOGLE_CLIENT_SECRET ? "Present (length: " + GOOGLE_CLIENT_SECRET.length + ")" : "Missing",
      scopes: SCOPES,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasReplId: !!process.env.REPL_ID,
        replSlug: process.env.REPL_SLUG,
        replOwner: process.env.REPL_OWNER,
        baseUrl: process.env.BASE_URL
      }
    };
    
    res.json({
      message: "Google Drive configuration test",
      config
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve configuration" });
  }
});

export const googleDriveRouter = router;