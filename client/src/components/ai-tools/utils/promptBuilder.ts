import type { 
  ImageGeneratorFormData, 
  ImageType, 
  AspectRatio,
  AspectRatioRecommendation
} from '../types/imageGenerator';

export function buildGenerationPrompt(formData: ImageGeneratorFormData): string {
  const { brandName, industry, style, imageType, colorScheme, description } = formData;
  
  let prompt = `Generate a ${style.toLowerCase()} ${imageType.toLowerCase()}`;
  
  if (brandName) {
    prompt += ` for the brand "${brandName}"`;
  }
  
  if (industry) {
    prompt += ` in the ${industry.toLowerCase()} industry`;
  }
  
  if (colorScheme) {
    prompt += ` using a ${colorScheme.toLowerCase()} color scheme`;
  }
  
  if (description) {
    prompt += `. Additional details: ${description}`;
  }
  
  return prompt;
}

export const aspectRatioRecommendations: Record<ImageType, AspectRatioRecommendation> = {
  Logo: {
    aspectRatio: '1:1',
    description: 'For logos, a square 1:1 aspect ratio is recommended for optimal display across platforms.'
  },
  'Social Media': {
    aspectRatio: '16:9',
    description: 'For social media posts, 16:9 is recommended for most platforms like Twitter and LinkedIn.'
  },
  Banner: {
    aspectRatio: '21:9',
    description: 'For banners, a wide 21:9 aspect ratio is recommended for website headers and cover images.'
  },
  Image: {
    aspectRatio: '4:3',
    description: 'For general images, 4:3 is a versatile aspect ratio that works well in most contexts.'
  }
}; 