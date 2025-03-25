import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Load environment variables
dotenv.config();

// Health check endpoint
app.get('/api/healthcheck', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Users API endpoints
app.post('/api/users', async (req, res) => {
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
});

app.get('/api/users/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      user: userDoc.data() 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user' 
    });
  }
});

// API for campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
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
    
    return res.status(200).json({ 
      success: true, 
      campaigns 
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch campaigns' 
    });
  }
});

// API for agents
app.get('/api/agents', async (_req, res) => {
  try {
    const agentsSnapshot = await admin.firestore()
      .collection('agents')
      .orderBy('name')
      .get();
    
    const agents = agentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return res.status(200).json({ 
      success: true, 
      agents 
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch agents' 
    });
  }
});

// API for workflows
app.get('/api/workflows', async (req, res) => {
  try {
    const campaignId = req.query.campaignId as string;
    if (!campaignId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Campaign ID is required' 
      });
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
    
    return res.status(200).json({ 
      success: true, 
      workflows 
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workflows' 
    });
  }
});

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