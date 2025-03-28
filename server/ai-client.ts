import { Router } from "express";
import { createOpenAIRouter } from './openai';
import { createGeminiRouter } from './gemini';

export function createAIRouter() {
    const router = Router();
    
    // Mount both AI services under their respective paths
    router.use('/openai', createOpenAIRouter());
    router.use('/gemini', createGeminiRouter());
    
    return router;
} 