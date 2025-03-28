import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { generateImages } from '@/lib/gemini';
import { buildGenerationPrompt, aspectRatioRecommendations } from './utils/promptBuilder';
import type { 
  ImageGeneratorFormData, 
  ImageType, 
  Industry, 
  ImageStyle, 
  ColorScheme, 
  AspectRatio
} from './types/imageGenerator';

// Arrays for select options
const industries: Industry[] = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Food & Beverage', 'Travel', 'Other'];
const styles: ImageStyle[] = ['Modern', 'Minimalist', 'Vintage', 'Playful', 'Professional', 'Luxury', 'Abstract'];
const colorSchemes: ColorScheme[] = ['Monochrome', 'Vibrant', 'Pastel', 'Earth Tones', 'Cool Colors', 'Warm Colors'];
const imageTypes: ImageType[] = ['Logo', 'Social Media', 'Banner', 'Image'];

interface GeneratedImage {
  url: string;
  alt: string;
}

export default function AIImageCreator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [formData, setFormData] = useState<ImageGeneratorFormData>({
    brandName: '',
    industry: 'Technology',
    style: 'Modern',
    imageType: 'Logo',
    colorScheme: 'Monochrome',
    aspectRatio: '1:1',
    description: '',
    numberOfImages: 4
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'imageType') {
      const imageType = value as ImageType;
      const recommendation = aspectRatioRecommendations[imageType];
      if (recommendation) {
        setFormData(prev => ({ 
          ...prev, 
          imageType,
          aspectRatio: recommendation.aspectRatio 
        }));
        
        toast(recommendation.description, {
          icon: 'ℹ️',
          duration: 4000
        });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageTypeClick = (type: ImageType) => {
    const recommendation = aspectRatioRecommendations[type];
    if (recommendation) {
      setFormData(prev => ({ 
        ...prev, 
        imageType: type,
        aspectRatio: recommendation.aspectRatio 
      }));
      
      toast(recommendation.description, {
        icon: 'ℹ️',
        duration: 4000
      });
    }
  };

  const simulateLoading = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 150);
    return interval;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Construct the prompt using all available information
      const prompt = [
        formData.description?.trim() || formData.brandName?.trim(),
        `Brand: ${formData.brandName}`,
        `Industry: ${formData.industry}`,
        `Style: ${formData.style}`,
        `Color scheme: ${formData.colorScheme}`
      ].filter(Boolean).join('. ');

      console.log('Generating images with prompt:', prompt);

      const response = await generateImages({
        prompt,
        numberOfImages: formData.numberOfImages,
        aspectRatio: formData.aspectRatio,
        allowPersonGeneration: true
      });

      setGeneratedImages(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate images';
      setError(errorMessage);
      console.error('Error generating images:', err);

      // Show placeholder images on error
      const [width, height] = formData.aspectRatio.split(':').map(Number);
      const placeholderImages = Array(formData.numberOfImages).fill(
        `https://via.placeholder.com/${width * 300}x${height * 300}/FF0000/FFFFFF?text=${encodeURIComponent(errorMessage)}`
      );
      setGeneratedImages(placeholderImages);
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">AI Image Creator</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imageTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleImageTypeClick(type)}
              className={`px-4 py-2 rounded-lg ${
                formData.imageType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Brand Name</label>
            <input
              type="text"
              value={formData.brandName}
              onChange={handleInputChange}
              name="brandName"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter your brand name"
            />
          </div>

          <div>
            <label className="block mb-2">Industry</label>
            <select
              value={formData.industry}
              onChange={handleInputChange}
              name="industry"
              className="w-full p-2 border rounded-lg"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Style</label>
            <select
              value={formData.style}
              onChange={handleInputChange}
              name="style"
              className="w-full p-2 border rounded-lg"
            >
              {styles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Color Scheme</label>
            <select
              value={formData.colorScheme}
              onChange={handleInputChange}
              name="colorScheme"
              className="w-full p-2 border rounded-lg"
            >
              {colorSchemes.map((scheme) => (
                <option key={scheme} value={scheme}>
                  {scheme}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Number of Images</label>
            <select
              value={formData.numberOfImages}
              onChange={handleInputChange}
              name="numberOfImages"
              className="w-full p-2 border rounded-lg"
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2">Image Description</label>
          <textarea
            value={formData.description}
            onChange={handleInputChange}
            name="description"
            className="w-full p-2 border rounded-lg"
            rows={4}
            placeholder="Add any specific details or requirements for your image..."
            required
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || (!formData.description?.trim() && !formData.brandName?.trim())}
          className={`w-full py-3 rounded-lg ${
            loading || (!formData.description?.trim() && !formData.brandName?.trim())
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {loading ? 'Generating...' : 'Generate Images'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Generating images...</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {generatedImages.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Generated image ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => handleImageClick(image)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => handleDownload(image)}
                className="bg-white text-black px-3 py-1 rounded-full text-sm hover:bg-gray-200"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={selectedImage}
              alt="Selected generated image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}