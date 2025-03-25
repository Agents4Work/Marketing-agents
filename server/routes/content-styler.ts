import express, { Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = express.Router();

// Define the tone settings schema for validation
const toneStyleSettingsSchema = z.object({
  tone: z.string(),
  formality: z.number().min(0).max(100),
  creativity: z.number().min(0).max(100),
  enthusiasm: z.number().min(0).max(100),
  humor: z.number().min(0).max(100),
  selectedStyles: z.array(z.string()),
  customInstructions: z.string().optional()
});

const contentStyleRequestSchema = z.object({
  content: z.string(),
  title: z.string().optional(),
  settings: toneStyleSettingsSchema
});

/**
 * @route POST /api/content-styler/style
 * @desc Apply tone and style to content
 * @access Public
 */
router.post('/style', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate request
    const validationResult = contentStyleRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { content, title, settings } = validationResult.data;
    
    // In a real implementation, this would call an AI service
    // For now, we'll simulate content styling based on the tone settings
    
    const styledContent = styleContent(content, title, settings);
    
    return res.status(200).json({
      success: true,
      styledContent
    });
  } catch (error) {
    console.error('Error in content styler:', error);
    return res.status(500).json({ message: 'Server error while processing content styling request' });
  }
});

/**
 * @route GET /api/content-styler/presets
 * @desc Get available tone and style presets
 * @access Public
 */
router.get('/presets', async (_req: Request, res: Response) => {
  // Return predefined presets
  return res.status(200).json({
    presets: {
      'brand-awareness': {
        tone: 'enthusiastic',
        formality: 60,
        creativity: 80,
        enthusiasm: 90,
        humor: 30,
        selectedStyles: ['storytelling', 'inspirational'],
        customInstructions: 'Focus on brand values and unique selling points.'
      },
      'lead-generation': {
        tone: 'persuasive',
        formality: 70,
        creativity: 60,
        enthusiasm: 75,
        humor: 20,
        selectedStyles: ['action-oriented', 'direct', 'solution-focused'],
        customInstructions: 'Focus on clear CTAs and addressing pain points.'
      },
      'thought-leadership': {
        tone: 'authoritative',
        formality: 85,
        creativity: 50,
        enthusiasm: 50,
        humor: 10,
        selectedStyles: ['data-driven', 'educational'],
        customInstructions: 'Include industry insights and establish expertise.'
      },
      'social-engagement': {
        tone: 'conversational',
        formality: 30,
        creativity: 85,
        enthusiasm: 85,
        humor: 70,
        selectedStyles: ['question-based', 'storytelling'],
        customInstructions: 'Create content that encourages comments and shares.'
      },
      'seo-optimization': {
        tone: 'informative',
        formality: 65,
        creativity: 40,
        enthusiasm: 40, 
        humor: 15,
        selectedStyles: ['educational', 'comparative'],
        customInstructions: 'Incorporate relevant keywords naturally while providing value.'
      }
    }
  });
});

/**
 * Helper function to style content based on tone settings
 */
function styleContent(
  content: string, 
  title: string | undefined, 
  settings: z.infer<typeof toneStyleSettingsSchema>
): string {
  let styledContent = '';
  
  // Add title if provided
  if (title) {
    styledContent += `# ${title}\n\n`;
  }
  
  // Style based on tone
  switch (settings.tone) {
    case 'professional':
      styledContent += `${content}\n\nFurthermore, it's worth noting that our approach provides measurable results. We've observed significant improvements in performance metrics across multiple case studies.`;
      break;
    case 'conversational':
      styledContent += `Hey there! ${content}\n\nYou know what's really cool about this? It actually works! We've seen amazing results with clients just like you.`;
      break;
    case 'enthusiastic':
      styledContent += `Wow! This is amazing! ${content}\n\nWe're absolutely thrilled about the incredible results this can bring to your business! You won't believe the transformation!`;
      break;
    case 'informative':
      styledContent += `${content}\n\nStudies indicate that this approach leads to a 37% improvement in overall effectiveness. Research from industry leaders supports these findings.`;
      break;
    case 'persuasive':
      styledContent += `Imagine the possibilities: ${content}\n\nDon't miss this opportunity to transform your results. The benefits are clear, and the time to act is now.`;
      break;
    case 'authoritative':
      styledContent += `${content}\n\nExpert analysis confirms these findings. Our decade of experience in the industry validates this approach as the definitive solution for forward-thinking organizations.`;
      break;
    case 'empathetic':
      styledContent += `We understand the challenges you're facing. ${content}\n\nYou're not alone in this journey, and we're here to help every step of the way.`;
      break;
    case 'casual':
      styledContent += `Just thinking out loud here... ${content}\n\nPretty cool, right? Let's grab a coffee sometime and chat more about it!`;
      break;
    default:
      styledContent += content;
  }
  
  // Incorporate selected styles
  if (settings.selectedStyles.includes('storytelling')) {
    styledContent += `\n\nLet me share a story with you. A client once faced similar challenges...`;
  }
  
  if (settings.selectedStyles.includes('data-driven')) {
    styledContent += `\n\nThe data is compelling: 78% of users report improved outcomes within the first 30 days.`;
  }
  
  if (settings.selectedStyles.includes('action-oriented')) {
    styledContent += `\n\nStart implementing these strategies today. Take the first step by...`;
  }
  
  // Add custom instructions if provided
  if (settings.customInstructions) {
    styledContent += `\n\n${settings.customInstructions}`;
  }
  
  return styledContent;
}

export const contentStylerRouter = router;