import dotenv from 'dotenv';
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StateGraph } from "@langchain/langgraph";

// Load environment variables
dotenv.config();

/**
 * Test the basic LangChain generation functionality
 */
async function testLangChainGeneration() {
  try {
    console.log("\n🔍 Testing LangChain content generation...");
    
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
    console.log("✅ LangChain test completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ LangChain test failed:", error);
    return false;
  }
}

/**
 * Test a simple LangGraph workflow
 */
async function testLangGraphWorkflow() {
  try {
    console.log("\n🔍 Testing LangGraph workflow...");
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables.");
    }
    
    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7
    });
    
    // Define a simple state type
    type TestState = {
      question: string;
      analysis?: string;
      answer?: string;
      status: string;
    };
    
    // Create analysis node
    async function analyzeQuestion(state: TestState) {
      try {
        const template = `
        Analyze the following question to understand what's being asked:
        
        Question: {question}
        
        Provide a brief analysis of what information is needed to answer this question.
        `;
        
        const promptTemplate = PromptTemplate.fromTemplate(template);
        const chain = promptTemplate.pipe(chatModel).pipe(new StringOutputParser());
        
        const analysis = await chain.invoke({
          question: state.question
        });
        
        return {
          ...state,
          analysis,
          status: "analyzed"
        };
      } catch (error) {
        console.error("Error in analyze node:", error);
        return {
          ...state,
          status: "analysis_failed"
        };
      }
    }
    
    // Create answer node
    async function answerQuestion(state: TestState) {
      try {
        const template = `
        Answer the following question based on this analysis:
        
        Question: {question}
        Analysis: {analysis}
        
        Provide a clear and concise answer.
        `;
        
        const promptTemplate = PromptTemplate.fromTemplate(template);
        const chain = promptTemplate.pipe(chatModel).pipe(new StringOutputParser());
        
        const answer = await chain.invoke({
          question: state.question,
          analysis: state.analysis
        });
        
        return {
          ...state,
          answer,
          status: "completed"
        };
      } catch (error) {
        console.error("Error in answer node:", error);
        return {
          ...state,
          status: "answer_failed"
        };
      }
    }
    
    // Create the workflow graph with the latest LangGraph API
    const workflow = new StateGraph<TestState>({
      channels: {}
    });
    
    // Add nodes
    workflow.addNode("analyze", analyzeQuestion);
    workflow.addNode("answer", answerQuestion);
    
    // Add edges with the latest API
    workflow.addEdge({
      source: "__start__",
      target: "analyze"
    });
    
    // Add conditional edges
    workflow.addConditionalEdges({
      source: "analyze", 
      destinations: {
        answer: (state) => state.status === "analyzed",
        __end__: (state) => state.status === "analysis_failed"
      }
    });
    
    // Define end states
    workflow.addConditionalEdges({
      source: "answer",
      destinations: {
        __end__: (state) => true
      }
    });
    
    // Compile the workflow
    const app = workflow.compile();
    
    // Initialize state
    const initialState: TestState = {
      question: "What are the key benefits of using AI for marketing automation?",
      status: "started"
    };
    
    // Run the workflow
    const result = await app.invoke(initialState);
    
    console.log("✅ LangGraph initial state:", initialState);
    console.log("✅ LangGraph result:", result);
    console.log("✅ LangGraph test completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ LangGraph test failed:", error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("🧪 Running AI Integration Tests...");
  
  let langChainSuccess = false;
  let langGraphSuccess = false;
  
  try {
    // Test LangChain
    langChainSuccess = await testLangChainGeneration();
    
    // Test LangGraph
    langGraphSuccess = await testLangGraphWorkflow();
    
    // Report results
    console.log("\n📊 Test Results:");
    console.log(`LangChain: ${langChainSuccess ? "✅ Pass" : "❌ Fail"}`);
    console.log(`LangGraph: ${langGraphSuccess ? "✅ Pass" : "❌ Fail"}`);
    
    if (langChainSuccess && langGraphSuccess) {
      console.log("\n✅ All tests passed successfully!");
    } else {
      console.log("\n❌ Some tests failed. See logs above for details.");
    }
  } catch (error) {
    console.error("Error running tests:", error);
  }
}

// Run tests
runAllTests();