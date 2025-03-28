import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

// Load environment variables
config();

const router = express.Router();

// Initialize Gemini client
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface InlineData {
  mimeType: string;
  data: string;
}

interface ContentPart {
  inlineData?: InlineData;
}

// Generate images endpoint
router.post('/generate-images', async (req, res) => {
  try {
    const { prompt, numberOfImages = 4, aspectRatio = '1:1', allowPersonGeneration = true } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: { message: 'Please provide a prompt for image generation' } });
    }

    // Configure the generation request
    const request = {
      model: 'gemini-2.0-flash-exp',
      prompt,
      config: {
        number_of_images: Math.min(Math.max(1, numberOfImages), 4),
        aspect_ratio: aspectRatio,
        allow_person_generation: allowPersonGeneration,
        safety_settings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }
    };

    // Make the API call
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Gemini API:', errorData);
      
      if (errorData.error?.status === 'PERMISSION_DENIED') {
        return res.status(403).json({ error: { message: 'API key does not have permission to use Gemini. Please check your API key permissions.' } });
      } else if (errorData.error?.status === 'INVALID_ARGUMENT') {
        return res.status(400).json({ error: { message: 'Invalid request parameters. Please check your input.' } });
      } else {
        return res.status(500).json({ error: { message: errorData.error?.message || 'Failed to generate images' } });
      }
    }

    const result = await response.json();
    
    if (!result.candidates?.[0]?.content?.parts) {
      return res.status(500).json({ error: { message: 'No images were generated' } });
    }

    // Extract image URLs from the response
    const images = result.candidates[0].content.parts
      .filter((part: ContentPart) => part.inlineData?.mimeType?.startsWith('image/'))
      .map((part: ContentPart) => `data:${part.inlineData!.mimeType};base64,${part.inlineData!.data}`);

    if (images.length === 0) {
      return res.status(500).json({ error: { message: 'No valid images were generated' } });
    }

    res.json({ images });
  } catch (err) {
    console.error('Error in image generation:', err);
    res.status(500).json({ error: { message: err instanceof Error ? err.message : 'Failed to generate images' } });
  }
});

export default router; 