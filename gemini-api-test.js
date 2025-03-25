/**
 * Gemini API Test Script
 * This script tests the Gemini API with proper CSRF token handling
 */

// Use the correct URL for the API in Replit environment
const GEMINI_API_URL = 'http://0.0.0.0:5000/api/gemini';
const MODEL_NAME = 'gemini-1.5-pro'; // Using the correct model name

async function getCsrfToken() {
    try {
        console.log('Fetching CSRF token...');
        const response = await fetch('http://0.0.0.0:5000/api/csrf-token');
        const data = await response.json();
        console.log('CSRF token retrieved:', data.token.substring(0, 10) + '...');
        return data.token;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
}

async function testGeminiHealth() {
    try {
        console.log('Testing Gemini health endpoint...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${GEMINI_API_URL}/health`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        console.log('Gemini health status:', data);
        return data;
    } catch (error) {
        console.error('Error testing Gemini health:', error);
        if (error.name === 'AbortError') {
            return { status: 'error', error: 'Request timed out' };
        }
        return { status: 'error', error: error.message };
    }
}

async function testGeminiChat(message, csrfToken) {
    try {
        console.log('Testing Gemini chat endpoint with message:', message);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
        
        const response = await fetch(`${GEMINI_API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({ message }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini chat error:', errorText);
            try {
                return JSON.parse(errorText);
            } catch (e) {
                return { error: `HTTP error ${response.status}: ${errorText}` };
            }
        }
        
        const data = await response.json();
        console.log('Gemini chat response:', data);
        return data;
    } catch (error) {
        console.error('Error testing Gemini chat:', error);
        if (error.name === 'AbortError') {
            return { error: 'Request timed out after 20 seconds' };
        }
        return { error: error.message };
    }
}

async function runTests() {
    console.log('Starting Gemini API tests...');
    
    // First get a CSRF token
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
        console.error('Failed to get CSRF token, cannot continue tests');
        return;
    }
    
    // Test health endpoint
    console.log('\n--- Testing Gemini Health ---');
    const healthResult = await testGeminiHealth();
    
    // Test chat endpoint
    console.log('\n--- Testing Gemini Chat ---');
    const chatResult = await testGeminiChat('Hello, how are you today?', csrfToken);
    
    console.log('\n--- Test Results Summary ---');
    console.log('Health Check:', healthResult.status);
    console.log('Chat Test:', chatResult.error ? 'Failed' : 'Success');
    
    if (chatResult.error) {
        console.log('Chat Error:', chatResult.error);
    } else {
        console.log('Chat Response:', chatResult.content);
    }
}

// Run all tests
runTests();