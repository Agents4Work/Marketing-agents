/**
 * This is a simplified LangChain test that doesn't use LangGraph
 */

import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

async function testLangChainBasic() {
  try {
    console.log("Testing basic LangChain functionality...");
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables.");
    }
    
    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7
    });
    
    const template = `
    Write a short marketing tagline for a product with the following characteristics:
    
    Product: {product}
    Target audience: {audience}
    Key benefit: {benefit}
    Tone: {tone}
    
    Your tagline should be concise, memorable, and highlight the key benefit.
    `;
    
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const outputParser = new StringOutputParser();
    
    const chain = promptTemplate.pipe(chatModel).pipe(outputParser);
    
    const result = await chain.invoke({
      product: "AI-powered marketing automation platform",
      audience: "small business owners",
      benefit: "saves time and increases marketing effectiveness",
      tone: "professional but friendly"
    });
    
    console.log("✅ LangChain result:", result);
    return true;
  } catch (error) {
    console.error("❌ LangChain test failed:", error);
    return false;
  }
}

/**
 * Simple sequential workflow without using LangGraph
 */
async function testSequentialWorkflow() {
  try {
    console.log("\nTesting sequential workflow...");
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables.");
    }
    
    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7
    });
    
    // Step 1: Topic Analysis
    console.log("Step 1: Analyzing topic");
    const topicTemplate = `
    Analyze the following content request and extract the main topic:
    
    Request: {prompt}
    
    Return only the main topic in a clear, concise format.
    `;
    
    const topicPrompt = PromptTemplate.fromTemplate(topicTemplate);
    const topicChain = topicPrompt.pipe(chatModel).pipe(new StringOutputParser());
    
    const prompt = "Create an article about AI in marketing automation";
    const topic = await topicChain.invoke({ prompt });
    
    console.log("Topic extracted:", topic);
    
    // Step 2: Generate Outline
    console.log("\nStep 2: Generating outline");
    const outlineTemplate = `
    Create a structured outline for an article about the following topic:
    
    Topic: {topic}
    
    The outline should include 3-5 main sections with brief descriptions.
    `;
    
    const outlinePrompt = PromptTemplate.fromTemplate(outlineTemplate);
    const outlineChain = outlinePrompt.pipe(chatModel).pipe(new StringOutputParser());
    
    const outline = await outlineChain.invoke({ topic });
    
    console.log("Outline generated:", outline);
    
    // Step 3: Generate Content
    console.log("\nStep 3: Generating content");
    const contentTemplate = `
    Write an introduction paragraph for an article following this outline:
    
    Topic: {topic}
    Outline: {outline}
    
    Generate an engaging introduction paragraph that hooks the reader and outlines what the article will cover.
    `;
    
    const contentPrompt = PromptTemplate.fromTemplate(contentTemplate);
    const contentChain = contentPrompt.pipe(chatModel).pipe(new StringOutputParser());
    
    const content = await contentChain.invoke({
      topic,
      outline
    });
    
    console.log("\nContent generated:", content);
    
    return true;
  } catch (error) {
    console.error("❌ Sequential workflow test failed:", error);
    return false;
  }
}

// Run tests
async function runAllTests() {
  const basicSuccess = await testLangChainBasic();
  console.log(basicSuccess ? 
    "✅ Basic LangChain test completed successfully!" : 
    "❌ Basic LangChain test failed."
  );
  
  const sequentialSuccess = await testSequentialWorkflow();
  console.log(sequentialSuccess ? 
    "✅ Sequential workflow test completed successfully!" : 
    "❌ Sequential workflow test failed."
  );
}

runAllTests().catch(error => {
  console.error("Fatal error:", error);
});