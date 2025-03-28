export type ImageStyle = 'Modern' | 'Minimalist' | 'Vintage' | 'Playful' | 'Professional' | 'Luxury' | 'Abstract';

export type ColorScheme = 'Monochrome' | 'Vibrant' | 'Pastel' | 'Earth Tones' | 'Cool Colors' | 'Warm Colors';

export type Industry = 'Technology' | 'Finance' | 'Healthcare' | 'Education' | 'Retail' | 'Food & Beverage' | 'Travel' | 'Other';

export type AspectRatio = '1:1' | '4:3' | '16:9' | '21:9';

export type ImageType = 'Logo' | 'Social Media' | 'Banner' | 'Image';

export interface ImageGeneratorFormData {
  imageType: ImageType;
  brandName: string;
  industry: Industry;
  style: ImageStyle;
  colorScheme: ColorScheme;
  aspectRatio: AspectRatio;
  description: string;
  numberOfImages: number;
}

export interface AspectRatioRecommendation {
  aspectRatio: AspectRatio;
  description: string;
}

export interface ImageGenerationOptions {
  numberOfImages?: number;
  aspectRatio?: AspectRatio;
  allowPersonGeneration?: boolean;
}

export interface ImageGenerationRequest {
  prompt: string;
  numberOfImages?: number;
  aspectRatio?: AspectRatio;
  allowPersonGeneration?: boolean;
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