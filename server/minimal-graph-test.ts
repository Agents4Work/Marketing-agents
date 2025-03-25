/**
 * This is a simplified LangGraph adapter that creates a basic workflow 
 * system designed to work with our existing installation
 */

import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

/**
 * Simple workflow implementation that avoids LangGraph dependencies
 */
class SimpleWorkflow<T> {
  private nodes: Map<string, (state: T) => Promise<T>> = new Map();
  private transitions: Map<string, Array<{ target: string, condition: (state: T) => boolean }>> = new Map();
  
  constructor() {
    // Initialize with start and end nodes
    this.nodes.set("__start__", async (state: T) => state);
    this.nodes.set("__end__", async (state: T) => state);
    this.transitions.set("__start__", []);
    this.transitions.set("__end__", []);
  }
  
  addNode(name: string, handler: (state: T) => Promise<T>): SimpleWorkflow<T> {
    this.nodes.set(name, handler);
    this.transitions.set(name, []);
    return this;
  }
  
  addTransition(from: string, to: string, condition?: (state: T) => boolean): SimpleWorkflow<T> {
    const transitions = this.transitions.get(from) || [];
    transitions.push({
      target: to,
      condition: condition || (() => true)
    });
    this.transitions.set(from, transitions);
    return this;
  }
  
  async execute(initialState: T): Promise<T> {
    let currentState = initialState;
    let currentNode = "__start__";
    
    console.log(`Starting workflow execution at node: ${currentNode}`);
    
    while (currentNode !== "__end__") {
      // Execute the current node
      const nodeHandler = this.nodes.get(currentNode);
      if (!nodeHandler) {
        throw new Error(`Node "${currentNode}" not found in workflow`);
      }
      
      // Update state by executing the current node
      currentState = await nodeHandler(currentState);
      console.log(`Executed node: ${currentNode}`);
      
      // Find the next node based on transitions
      const transitions = this.transitions.get(currentNode) || [];
      let nextNode: string | null = null;
      
      for (const transition of transitions) {
        if (transition.condition(currentState)) {
          nextNode = transition.target;
          console.log(`Following transition to: ${nextNode}`);
          break;
        }
      }
      
      if (nextNode === null) {
        throw new Error(`No valid transition from node "${currentNode}"`);
      }
      
      currentNode = nextNode;
    }
    
    return currentState;
  }
}

// Test SimpleWorkflow with a basic counter
interface SimpleState {
  count: number;
  done: boolean;
}

async function incrementCounter(state: SimpleState): Promise<SimpleState> {
  console.log(`Incrementing counter: ${state.count} -> ${state.count + 1}`);
  return {
    ...state,
    count: state.count + 1,
    done: state.count + 1 >= 3 // Mark as done after 3 increments
  };
}

async function runSimpleTest() {
  try {
    console.log("Running simple counter test...");
    
    const workflow = new SimpleWorkflow<SimpleState>();
    
    // Set up workflow structure
    workflow
      .addNode("increment", incrementCounter)
      .addTransition("__start__", "increment")
      .addTransition("increment", "increment", state => !state.done)
      .addTransition("increment", "__end__", state => state.done);
    
    // Create initial state and run workflow
    const initialState: SimpleState = {
      count: 0,
      done: false
    };
    
    const finalState = await workflow.execute(initialState);
    console.log("Final state:", finalState);
    
    return finalState;
  } catch (error) {
    console.error("Simple test failed:", error);
    throw error;
  }
}

// Test SimpleWorkflow with a content generation pipeline
interface ContentGenState {
  prompt: string;
  topic?: string;
  outline?: string;
  content?: string;
  status: string;
}

async function runContentWorkflow() {
  try {
    console.log("\nRunning content generation workflow test...");
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key is not set");
    }
    
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      openAIApiKey: apiKey
    });
    
    const workflow = new SimpleWorkflow<ContentGenState>();
    
    // Topic analysis node
    workflow.addNode("analyzeTopic", async (state: ContentGenState) => {
      console.log("Analyzing topic from prompt...");
      
      const template = `
      Extract the main topic from the following content request:
      
      Content Request: {prompt}
      
      Respond with only the main topic in a clear, concise format.
      `;
      
      const promptTemplate = PromptTemplate.fromTemplate(template);
      const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());
      
      const topic = await chain.invoke({ prompt: state.prompt });
      
      console.log("Topic extracted:", topic);
      
      return {
        ...state,
        topic,
        status: "topic_analyzed"
      };
    });
    
    // Outline generation node
    workflow.addNode("generateOutline", async (state: ContentGenState) => {
      console.log("Generating outline for topic:", state.topic);
      
      const template = `
      Create a structured outline for an article about: {topic}
      
      The outline should include:
      - 3-5 main sections
      - Brief descriptions for each section
      - Key points to cover
      
      Respond with only the outline.
      `;
      
      const promptTemplate = PromptTemplate.fromTemplate(template);
      const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());
      
      const outline = await chain.invoke({ topic: state.topic });
      
      console.log("Outline generated");
      
      return {
        ...state,
        outline,
        status: "outline_generated"
      };
    });
    
    // Content writing node
    workflow.addNode("writeContent", async (state: ContentGenState) => {
      console.log("Writing content based on outline...");
      
      const template = `
      Write an introduction paragraph (about 150 words) for an article with:
      
      Topic: {topic}
      Outline: {outline}
      
      The introduction should engage the reader, introduce the topic, and preview the main points.
      `;
      
      const promptTemplate = PromptTemplate.fromTemplate(template);
      const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());
      
      const content = await chain.invoke({
        topic: state.topic,
        outline: state.outline
      });
      
      console.log("Content written");
      
      return {
        ...state,
        content,
        status: "content_written"
      };
    });
    
    // Set up workflow structure
    workflow
      .addTransition("__start__", "analyzeTopic")
      .addTransition("analyzeTopic", "generateOutline")
      .addTransition("generateOutline", "writeContent")
      .addTransition("writeContent", "__end__");
    
    // Create initial state and run workflow
    const initialState: ContentGenState = {
      prompt: "Write an article about AI in marketing automation",
      status: "started"
    };
    
    const finalState = await workflow.execute(initialState);
    
    console.log("\nFinal content result:");
    console.log("Topic:", finalState.topic);
    console.log("Content:", finalState.content);
    
    return finalState;
  } catch (error) {
    console.error("Content generation test failed:", error);
    throw error;
  }
}

async function runAllTests() {
  try {
    // Run counter test
    await runSimpleTest();
    
    // Run content generation test
    await runContentWorkflow();
    
    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Tests failed:", error);
  }
}

// Run all tests if this file is executed directly
runAllTests().catch(error => {
  console.error("Fatal error:", error);
});