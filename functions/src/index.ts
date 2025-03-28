import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { RequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for Gemini API
interface GeneratedImage {
  data: string;  // base64 encoded image data
}

interface GenerateImagesResult {
  images: GeneratedImage[];
}

interface GenerateImagesConfig {
  number_of_images: number;
  aspect_ratio: string;
  person_generation: 'DONT_ALLOW' | 'ALLOW_ADULT';
}

interface ImageGenerationRequest {
  prompt: string;
  numberOfImages?: number;
  aspectRatio?: string;
  allowPersonGeneration?: boolean;
}

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Load environment variables
dotenv.config();

// Health check endpoint
const healthCheck: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};

// Users API endpoints
const createUser: RequestHandler = async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    
    // Store user in Firestore
    await admin.firestore().collection('users').doc(uid).set({
      uid,
      email,
      displayName,
      photoURL,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    res.status(201).json({ 
      success: true, 
      user: { uid, email, displayName, photoURL } 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create user' 
    });
  }
};

const getUser: RequestHandler = async (req, res) => {
  try {
    const uid = req.params.uid;
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
      return;
    }
    
    res.status(200).json({ 
      success: true, 
      user: userDoc.data() 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user' 
    });
  }
};

// API for campaigns
const getCampaigns: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
      return;
    }
    
    const campaignsSnapshot = await admin.firestore()
      .collection('campaigns')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const campaigns = campaignsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({ 
      success: true, 
      campaigns 
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch campaigns' 
    });
  }
};

// API for agents
const getAgents: RequestHandler = async (_req, res) => {
  try {
    const agentsSnapshot = await admin.firestore()
      .collection('agents')
      .orderBy('name')
      .get();
    
    const agents = agentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({ 
      success: true, 
      agents 
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch agents' 
    });
  }
};

// API for workflows
const getWorkflows: RequestHandler = async (req, res) => {
  try {
    const campaignId = req.query.campaignId as string;
    if (!campaignId) {
      res.status(400).json({ 
        success: false, 
        error: 'Campaign ID is required' 
      });
      return;
    }
    
    const workflowsSnapshot = await admin.firestore()
      .collection('workflows')
      .where('campaignId', '==', campaignId)
      .orderBy('updatedAt', 'desc')
      .get();
    
    const workflows = workflowsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({ 
      success: true, 
      workflows 
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workflows' 
    });
  }
};

// Register routes
app.get('/api/healthcheck', healthCheck);
app.post('/api/users', createUser);
app.get('/api/users/:uid', getUser);
app.get('/api/campaigns', getCampaigns);
app.get('/api/agents', getAgents);
app.get('/api/workflows', getWorkflows);

// Export the Express API as a Firebase Function
export const api = functions.https.onRequest(app);

// Import OpenAI integration
import { generateContent as openaiGenerateContent } from './openai';

// Additional specialized Functions for AI processing
export const generateContent = functions.https.onCall(async (data: any, context) => {
  // Verify authentication if not in development
  if (process.env.NODE_ENV !== 'development') {
    if (!context || !context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to use this feature.'
      );
    }
  }

  try {
    const prompt = data?.prompt || 'No prompt provided';
    const options = data?.options || {};
    
    // Use OpenAI to generate content
    const [content, error] = await openaiGenerateContent(prompt, options);
    
    if (error) {
      console.error('Error from OpenAI:', error);
      throw new functions.https.HttpsError('internal', error);
    }
    
    return {
      success: true,
      content,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error generating content:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to generate content'
    );
  }
});

// Function to initialize default data for new installations
export const initializeDefaultData = functions.https.onRequest(async (req, res) => {
  try {
    // Create default agents
    const agentsRef = admin.firestore().collection('agents');
    
    // Check if agents already exist
    const agentSnapshot = await agentsRef.get();
    
    if (agentSnapshot.empty) {
      const defaultAgents = [
        {
          type: 'seo',
          name: 'SEO Specialist',
          description: 'Optimizes content for search engines',
          icon: 'search',
          color: '#4CAF50',
          configuration: {
            mode: 'autonomous',
            keywords: ['marketing', 'automation'],
            targetAudience: 'marketers',
            contentType: 'blog',
            optimizationLevel: 5
          }
        },
        {
          type: 'copywriting',
          name: 'Content Writer',
          description: 'Creates engaging marketing copy',
          icon: 'edit',
          color: '#2196F3',
          configuration: {
            mode: 'semiautonomous',
            contentType: 'website',
            tone: 'professional',
            length: 'medium'
          }
        },
        {
          type: 'social',
          name: 'Social Media Manager',
          description: 'Handles social media campaigns',
          icon: 'share',
          color: '#9C27B0',
          configuration: {
            mode: 'autonomous',
            platforms: ['twitter', 'linkedin', 'instagram'],
            postingFrequency: 'daily',
            contentMix: 'balanced'
          }
        }
      ];
      
      const batch = admin.firestore().batch();
      defaultAgents.forEach(agent => {
        const newAgentRef = agentsRef.doc();
        batch.set(newAgentRef, {
          ...agent,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      res.status(200).json({
        success: true,
        message: 'Default data initialized successfully'
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Default data already exists'
      });
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize default data'
    });
  }
});

// Image generation endpoint
export const generateImages = functions.https.onCall(async (data: any) => {
  console.log('Received image generation request:', { ...data, prompt: data.prompt?.substring(0, 50) + '...' });

  try {
    const { prompt, numberOfImages = 4, aspectRatio = '1:1', allowPersonGeneration = true } = data as ImageGenerationRequest;
    
    if (!prompt) {
      console.error('No prompt provided');
      throw new functions.https.HttpsError(
        'invalid-argument',
        'A prompt is required to generate images'
      );
    }

    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('Google API Key is not configured');
      }

      console.log('Initializing Gemini client...');
      const genAI = new GoogleGenerativeAI(apiKey);
      
      console.log('Getting generative model...');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      // Configure image generation parameters
      const config = {
        model: 'imagen-3.0-generate-002',
        prompt,
        params: {
          number_of_images: Math.min(Math.max(1, numberOfImages), 4),
          aspect_ratio: aspectRatio,
          person_generation: allowPersonGeneration ? 'ALLOW_ADULT' : 'DONT_ALLOW'
        }
      };

      console.log('Generating images with config:', { 
        prompt: prompt.substring(0, 50) + '...', 
        params: config.params 
      });

      // Generate images
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error from Gemini API:', error);
        throw new Error(error.error?.message || 'Failed to generate images');
      }

      const result = await response.json();
      
      if (!result.images || result.images.length === 0) {
        console.error('No images were generated');
        throw new Error('No images were generated');
      }

      console.log(`Successfully generated ${result.images.length} images`);

      return {
        success: true,
        images: result.images,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error in image generation:', error);
      // Return placeholder images on error
      const [width, height] = aspectRatio.split(':').map(Number);
      const placeholderImages = Array(numberOfImages).fill(
        `https://via.placeholder.com/${width * 300}x${height * 300}/FF0000/FFFFFF?text=Error+generating+image`
      );

      return {
        success: false,
        images: placeholderImages,
        error: error instanceof Error ? error.message : 'Failed to generate images',
        timestamp: new Date().toISOString()
      };
    }

  } catch (error: any) {
    console.error('Error in generateImages function:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to generate images'
    );
  }
});