import { apiRequest } from '@/lib/queryClient';

export interface ToneStyleSettings {
  tone: string;
  formality: number;
  creativity: number;
  enthusiasm: number;
  humor: number;
  selectedStyles: string[];
  customInstructions?: string;
}

export interface ContentStyleRequest {
  content: string;
  title?: string;
  settings: ToneStyleSettings;
}

export interface ContentStyleResponse {
  success: boolean;
  styledContent: string;
}

/**
 * Apply tone and style settings to content
 */
export async function styleContent(request: ContentStyleRequest): Promise<ContentStyleResponse> {
  try {
    const response = await apiRequest(
      '/api/content-styler/style',
      'POST',
      request
    ) as ContentStyleResponse;
    return response;
  } catch (error) {
    console.error('Error styling content:', error);
    throw error;
  }
}

/**
 * Get predefined tone and style presets
 */
export async function getStylePresets(): Promise<Record<string, ToneStyleSettings>> {
  try {
    const response = await apiRequest(
      '/api/content-styler/presets',
      'GET'
    ) as { presets: Record<string, ToneStyleSettings> };
    return response.presets;
  } catch (error) {
    console.error('Error fetching style presets:', error);
    throw error;
  }
}

/**
 * Map ContentToneSettings to ToneStyleSettings
 * This adapter helps connect our new wizard to the existing API
 */
export function mapToneSettingsToStyleSettings(contentToneSettings: any): ToneStyleSettings {
  // Map tone type to available tones in the API
  const toneMap: Record<string, string> = {
    professional: 'professional',
    friendly: 'conversational',
    casual: 'casual',
    authoritative: 'authoritative',
    humorous: 'casual', // No direct mapping, use casual as fallback
  };

  // Map emotion intensity to enthusiasm and humor
  const enthusiasm = Math.min(contentToneSettings.emotionIntensity * 1.2, 100);
  const humor = contentToneSettings.toneType === 'humorous' 
    ? Math.max(contentToneSettings.emotionIntensity, 70) 
    : Math.min(contentToneSettings.emotionIntensity * 0.5, 50);

  // Determine selectedStyles based on contentType and settings
  const selectedStyles: string[] = [];
  
  // Add styles based on creativity level
  if (contentToneSettings.creativity > 70) {
    selectedStyles.push('storytelling');
  }
  
  // Add styles based on formality level
  if (contentToneSettings.formality > 70) {
    selectedStyles.push('data-driven');
  }
  
  // Add styles based on contentType
  switch (contentToneSettings.contentType) {
    case 'blog':
      selectedStyles.push('educational');
      break;
    case 'social':
      selectedStyles.push('question-based');
      break;
    case 'email':
      selectedStyles.push('action-oriented');
      break;
    case 'ad':
      selectedStyles.push('action-oriented');
      break;
    case 'landing':
      selectedStyles.push('solution-focused');
      break;
    default:
      // No additional styles
      break;
  }

  // Filter duplicates without using Set
  const uniqueStyles: string[] = [];
  for (const style of selectedStyles) {
    if (!uniqueStyles.includes(style)) {
      uniqueStyles.push(style);
    }
  }
  
  return {
    tone: toneMap[contentToneSettings.toneType] || 'professional',
    formality: contentToneSettings.formality,
    creativity: contentToneSettings.creativity,
    enthusiasm,
    humor,
    selectedStyles: uniqueStyles,
    customInstructions: contentToneSettings.customPrompt,
  };
}