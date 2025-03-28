# Web Integration Guide for Alex Copywriting Agent

This guide provides comprehensive instructions for integrating the Alex Copywriting Agent into a web application, with a focus on using Google's Gemini model as specified.

## Prerequisites

- Node.js (v16+) and NPM installed
- Basic knowledge of React (or other frontend frameworks)
- API keys for Google Gemini
- Access to the Alex Copywriting Agent API

## Setup

### 1. Backend API Configuration

The Alex Copywriting Agent API should be deployed and accessible. Follow these steps to deploy it:

1. Clone the repository with the agent code
2. Configure environment variables:
   ```
   cp .env.example .env
   ```
3. Fill in the required API keys and configuration in the `.env` file
4. Build and run the Docker container:
   ```
   docker build -t alex-copywriter .
   docker run -p 8000:8000 --env-file .env alex-copywriter
   ```

### 2. Frontend Integration

#### Setting up a React App with Gemini Integration

1. Create a new React application:
   ```bash
   npx create-react-app copywriter-web
   cd copywriter-web
   ```

2. Install required dependencies:
   ```bash
   npm install axios formik yup @google/generative-ai react-router-dom tailwindcss postcss autoprefixer
   ```

3. Initialize Tailwind CSS:
   ```bash
   npx tailwindcss init -p
   ```

4. Create an API service to interact with the Copywriting Agent:

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API endpoints
export const copywriterApi = {
  // Auth
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post(`${API_BASE_URL}/token`, formData);
    return response.data;
  },
  
  // Copywriting
  generateCopy: async (copyRequest) => {
    const response = await api.post('/copywriter/generate', copyRequest);
    return response.data;
  },
  
  getWorkflowStatus: async (workflowId) => {
    const response = await api.get(`/copywriter/status/${workflowId}`);
    return response.data;
  },
  
  refineCopy: async (contentId, feedback) => {
    const response = await api.post(`/copywriter/refine/${contentId}`, { feedback });
    return response.data;
  },
  
  analyzeCopy: async (contentId) => {
    const response = await api.get(`/copywriter/analyze/${contentId}`);
    return response.data;
  },
};

export default api;
```

## Gemini Integration

Create a service specifically for Gemini integration:

```javascript
// src/services/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiService = {
  // Generate content using Gemini directly (for real-time previews)
  generatePreview: async (prompt) => {
    try {
      // For text-only input
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating preview with Gemini:', error);
      throw error;
    }
  },
  
  // Analyze copy using Gemini directly
  quickAnalyze: async (copyText) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const prompt = `
      Analyze this copy text for effectiveness:
      
      ${copyText}
      
      Provide a brief analysis of its strengths and areas for improvement.
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error analyzing with Gemini:', error);
      throw error;
    }
  },
};

export default geminiService;
```

## Main Application Components

### Copy Request Form Component

```jsx
// src/components/CopyRequestForm.jsx
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { copywriterApi } from '../services/api';
import geminiService from '../services/gemini';

// Validation schema
const CopyRequestSchema = Yup.object().shape({
  objetivo: Yup.string().required('Objective is required'),
  producto: Yup.string().required('Product/service is required'),
  audiencia: Yup.string().required('Target audience is required'),
  estilo: Yup.string().required('Style is required'),
  longitud: Yup.string().required('Length is required'),
  plataforma: Yup.string().required('Platform is required'),
  contexto: Yup.string(),
});

const CopyRequestForm = ({ onSubmitSuccess }) => {
  const [preview, setPreview] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate a quick preview using Gemini directly
  const generatePreview = async (values) => {
    setIsGeneratingPreview(true);
    try {
      const prompt = `
        Write a quick preview of copy with these parameters:
        - Objective: ${values.objetivo}
        - Product: ${values.producto}
        - Audience: ${values.audiencia}
        - Style: ${values.estilo}
        - Platform: ${values.plataforma}
        
        This is just a quick preview, so keep it short.
      `;
      
      const previewText = await geminiService.generatePreview(prompt);
      setPreview(previewText);
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreview('Error generating preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Submit the request to the API
  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      const response = await copywriterApi.generateCopy(values);
      
      resetForm();
      setPreview('');
      
      if (onSubmitSuccess) {
        onSubmitSuccess(response);
      }
    } catch (error) {
      console.error('Error submitting copy request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Copy Request</h2>
      
      <Formik
        initialValues={{
          objetivo: '',
          producto: '',
          audiencia: '',
          estilo: 'emocional',
          longitud: 'medium',
          plataforma: 'Meta Ads',
          contexto: '',
        }}
        validationSchema={CopyRequestSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, dirty, values }) => (
          <Form className="space-y-4">
            {/* Form fields */}
            <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Alex Copywriter
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

## Routing Setup

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Auth guard component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

## Implementing the Web Application

Now that we have all the components, let's set up the complete web application:

1. Create the file structure:
   ```
   copywriter-web/
   ├── public/
   ├── src/
   │   ├── components/
   │   │   ├── CopyRequestForm.jsx
   │   │   ├── ContentViewer.jsx
   │   ├── pages/
   │   │   ├── Dashboard.jsx
   │   │   ├── Login.jsx
   │   ├── services/
   │   │   ├── api.js
   │   │   ├── gemini.js
   │   ├── App.jsx
   │   ├── index.js
   ├── .env
   ├── package.json
   ├── tailwind.config.js
   ```

2. Configure environment variables in `.env`:
   ```
   REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
   REACT_APP_GEMINI_API_KEY=your-gemini-api-key
   ```

3. Configure Tailwind CSS in `tailwind.config.js`:
   ```js
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [
       require('@tailwindcss/typography'),
       require('@tailwindcss/forms'),
     ],
   }
   ```

4. Update index.css to include Tailwind:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

5. Start the application:
   ```
   npm start
   ```

## Deployment

### Backend Deployment

1. Deploy the Alex Copywriting Agent API to a cloud provider (AWS, GCP, Azure):
   - Set up a VM or container service
   - Deploy using Docker
   - Configure environment variables
   - Set up a domain and SSL

2. Ensure the API is accessible from your frontend application:
   - Configure CORS properly
   - Set up authentication
   - Configure firewall rules

### Frontend Deployment

1. Build the React application:
   ```
   npm run build
   ```

2. Deploy to a static hosting service:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Firebase Hosting

3. Configure environment variables on your hosting service:
   - REACT_APP_API_BASE_URL
   - REACT_APP_GEMINI_API_KEY

## Advanced Gemini Integration

For more advanced features, consider implementing these additional Gemini functionalities:

### 1. Advanced Content Analysis

Expand the Gemini service to include more detailed content analysis:

```javascript
// Add to gemini.js
deepAnalyze: async (copyText, platform, objective) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
    Perform a comprehensive analysis of this copy text for a ${platform} ad with the objective of ${objective}:
    
    ${copyText}
    
    Analyze the following aspects and rate each on a scale of 1-10:
    1. Persuasiveness
    2. Clarity
    3. Alignment with stated objective
    4. Platform-specific optimization
    5. Call-to-action effectiveness
    6. Emotional appeal
    7. Brand voice consistency
    
    Also provide specific recommendations for improvement in each area.
    
    Format your response as a JSON object with the following structure:
    {
      "scores": {
        "persuasiveness": 8,
        ...
      },
      "feedback": {
        "persuasiveness": "Strong emotional appeal but could be more direct...",
        ...
      },
      "overall_score": 7.5,
      "key_recommendations": ["Recommendation 1", "Recommendation 2", ...]
    }
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json([\s\S]*?)```/) || text.match(/{[\s\S]*}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    
    try {
      return JSON.parse(jsonString.replace(/```/g, '').trim());
    } catch (jsonError) {
      console.error('Error parsing JSON from Gemini:', jsonError);
      return { error: "Could not parse analysis results", raw: text };
    }
  } catch (error) {
    console.error('Error analyzing with Gemini:', error);
    throw error;
  }
},
```

### 2. Multi-variant Generation

Add the ability to generate multiple copy variants:

```javascript
// Add to gemini.js
generateVariants: async (baseRequest, count = 3) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
    Generate ${count} distinct variants of copy for:
    
    - Objective: ${baseRequest.objetivo}
    - Product/Service: ${baseRequest.producto}
    - Target audience: ${baseRequest.audiencia}
    - Style: ${baseRequest.estilo}
    - Platform: ${baseRequest.plataforma}
    
    ${baseRequest.contexto ? `Additional context: ${baseRequest.contexto}` : ''}
    
    Make each variant distinctly different in approach but equally effective.
    For each variant, provide a title/concept name, and the copy text.
    
    Format the response as a JSON array with objects containing "title" and "copy" fields.
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json([\s\S]*?)```/) || text.match(/\[([\s\S]*?)\]/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    
    try {
      return JSON.parse(jsonString.replace(/```/g, '').trim());
    } catch (jsonError) {
      console.error('Error parsing JSON from Gemini:', jsonError);
      
      // Fallback: Try to extract variants manually
      const variants = [];
      const variantMatches = text.match(/Variant \d+:([\s\S]*?)(?=Variant \d+:|$)/g);
      
      if (variantMatches) {
        variantMatches.forEach((match, index) => {
          variants.push({
            title: `Variant ${index + 1}`,
            copy: match.replace(/Variant \d+:/, '').trim()
          });
        });
      }
      
      return variants.length ? variants : [{ title: "Fallback", copy: text }];
    }
  } catch (error) {
    console.error('Error generating variants with Gemini:', error);
    throw error;
  }
},
```

## Important Security Considerations

1. **API Keys**: Never expose your Gemini API key in the frontend code. Use environment variables and consider implementing a backend proxy for API calls.

2. **Authentication**: Implement proper JWT authentication with token refresh and expiration.

3. **Input Validation**: Validate all user inputs on both client and server side.

4. **Rate Limiting**: Implement rate limiting on your backend API to prevent abuse.

5. **CORS**: Configure CORS properly to only allow requests from your frontend domain.

## Conclusion

This guide has provided a comprehensive approach to integrating the Alex Copywriting Agent into a web application using React for the frontend, with special emphasis on Google's Gemini model integration.

The implementation leverages both the backend APIs (built with LangChain, LangGraph, and LangSmith) and direct Gemini API calls for real-time features, creating a robust and flexible copywriting assistant that can generate, analyze, and refine marketing copy for various platforms.

Remember to check for the latest versions of all libraries and APIs as they may update frequently, especially the Gemini API which is actively evolving.

              <label className="block text-sm font-medium text-gray-700">Objective</label>
              <Field
                name="objetivo"
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <ErrorMessage name="objetivo" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            {/* Add similar fields for product, audience, etc. */}
            
            {/* Additional context */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Context</label>
              <Field
                name="contexto"
                as="textarea"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            {/* Preview section */}
            <div className="mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md mr-2"
                onClick={() => generatePreview(values)}
                disabled={isGeneratingPreview || !isValid || !dirty}
              >
                {isGeneratingPreview ? 'Generating...' : 'Generate Preview'}
              </button>
              
              {preview && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-semibold mb-2">Preview:</h3>
                  <div className="prose">{preview}</div>
                </div>
              )}
            </div>
            
            {/* Submit button */}
            <div className="mt-6">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                disabled={isSubmitting || !isValid || !dirty}
              >
                {isSubmitting ? 'Submitting...' : 'Generate Copy with Alex'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CopyRequestForm;
```

### Content Viewer Component

```jsx
// src/components/ContentViewer.jsx
import React, { useState, useEffect } from 'react';
import { copywriterApi } from '../services/api';
import geminiService from '../services/gemini';

const ContentViewer = ({ workflowId, contentId, content }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinedContent, setRefinedContent] = useState(null);

  useEffect(() => {
    // Reset state when contentId changes
    if (contentId) {
      setAnalysisData(null);
      setRefinedContent(null);
      setFeedback('');
    }
  }, [contentId]);

  // Analyze copy using the API
  const analyzeContent = async () => {
    if (!contentId) return;
    
    setIsAnalyzing(true);
    try {
      const result = await copywriterApi.analyzeCopy(contentId);
      setAnalysisData(result.analysis);
    } catch (error) {
      console.error('Error analyzing content:', error);
      alert('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick analysis using Gemini directly
  const quickAnalyze = async () => {
    if (!content) return;
    
    setIsAnalyzing(true);
    try {
      const analysisText = await geminiService.quickAnalyze(content);
      
      // Display as plain text analysis
      setAnalysisData({
        overall_assessment: analysisText,
        scores: {},
        feedback: {}
      });
    } catch (error) {
      console.error('Error with quick analysis:', error);
      alert('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Refine content with feedback
  const refineContent = async () => {
    if (!contentId || !feedback) return;
    
    setIsRefining(true);
    try {
      const result = await copywriterApi.refineCopy(contentId, feedback);
      setRefinedContent(result.content);
    } catch (error) {
      console.error('Error refining content:', error);
      alert('Failed to refine content');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Content Viewer</h2>
      
      {workflowId && (
        <div className="mb-4 text-sm text-gray-500">
          Workflow ID: {workflowId}
        </div>
      )}
      
      {/* Content display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Generated Copy:</h3>
        <div className="p-4 bg-gray-50 rounded-md prose">
          {refinedContent || content || "No content to display"}
        </div>
      </div>
      
      {/* Analysis section */}
      <div className="mb-6">
        <div className="flex mb-2">
          <button
            onClick={analyzeContent}
            disabled={!contentId || isAnalyzing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md mr-2"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze with API'}
          </button>
          
          <button
            onClick={quickAnalyze}
            disabled={!content || isAnalyzing}
            className="px-4 py-2 bg-purple-600 text-white rounded-md"
          >
            {isAnalyzing ? 'Analyzing...' : 'Quick Analysis (Gemini)'}
          </button>
        </div>
        
        {analysisData && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Analysis:</h3>
            
            {analysisData.overall_assessment && (
              <div className="mb-4">
                <h4 className="font-medium">Overall Assessment:</h4>
                <p>{analysisData.overall_assessment}</p>
              </div>
            )}
            
            {Object.keys(analysisData.scores || {}).length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium">Scores:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(analysisData.scores).map(([criterion, score]) => (
                    <div key={criterion} className="flex justify-between">
                      <span>{criterion}:</span>
                      <span className={score >= 7 ? 'text-green-600' : score >= 5 ? 'text-amber-600' : 'text-red-600'}>
                        {score}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Refinement section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Refine Content:</h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter feedback for refining the copy..."
          className="w-full p-2 border border-gray-300 rounded-md mb-2"
          rows={4}
        />
        
        <button
          onClick={refineContent}
          disabled={!contentId || !feedback || isRefining}
          className="px-4 py-2 bg-green-600 text-white rounded-md"
        >
          {isRefining ? 'Refining...' : 'Refine Copy'}
        </button>
      </div>
    </div>
  );
};

export default ContentViewer;
```

### Dashboard Page

```jsx
// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import CopyRequestForm from '../components/CopyRequestForm';
import ContentViewer from '../components/ContentViewer';
import { copywriterApi } from '../services/api';

const Dashboard = () => {
  const [workflowData, setWorkflowData] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [content, setContent] = useState(null);
  
  // Handle successful form submission
  const handleSubmitSuccess = (response) => {
    setWorkflowData(response);
    
    // Start polling for workflow status
    if (response.workflow_id) {
      startPolling(response.workflow_id);
    }
  };
  
  // Start polling for workflow status
  const startPolling = (workflowId) => {
    // Clear any existing poll
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    
    // Poll every 3 seconds
    const interval = setInterval(async () => {
      try {
        const status = await copywriterApi.getWorkflowStatus(workflowId);
        setWorkflowData(status);
        
        // Stop polling when workflow is completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setPollInterval(null);
          
          // If completed, get the content
          if (status.status === 'completed' && status.content) {
            setContent(status.content);
          }
        }
      } catch (error) {
        console.error('Error polling workflow status:', error);
        clearInterval(interval);
        setPollInterval(null);
      }
    }, 3000);
    
    setPollInterval(interval);
  };
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Alex Copywriting Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Request Form */}
        <div>
          <CopyRequestForm onSubmitSuccess={handleSubmitSuccess} />
        </div>
        
        {/* Content Viewer */}
        <div>
          {workflowData && (
            <div className="mb-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Workflow Status</h2>
                <div className="flex items-center">
                  <span className="mr-2">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    workflowData.status === 'completed' ? 'bg-green-100 text-green-800' :
                    workflowData.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {workflowData.status}
                  </span>
                </div>
                
                {workflowData.status === 'processing' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                )}
                
                {workflowData.error && (
                  <div className="mt-2 text-red-600">
                    Error: {workflowData.error}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <ContentViewer 
            workflowId={workflowData?.workflow_id}
            contentId={workflowData?.content_id}
            content={content || workflowData?.content}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

## Authentication Setup

```jsx
// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { copywriterApi } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await copywriterApi.login(username, password);
      
      // Store token in localStorage
      localStorage.setItem('token', response.access_token);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials or server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div>