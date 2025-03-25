/**
 * LangGraph Adapter Layer
 * 
 * This module provides a compatibility layer for working with LangGraph
 * without directly depending on the @langchain/langgraph package.
 * 
 * When the actual LangGraph package is properly installed and configured,
 * this adapter can be replaced with direct LangGraph imports.
 */

// Types for graph nodes and edges
export interface GraphNode<T = any> {
  id: string;
  type: string;
  data: T;
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: any;
}

export interface GraphState {
  [key: string]: any;
}

// Simple graph execution engine (will be replaced by LangGraph)
export class WorkflowGraph<T extends GraphState> {
  private nodes: Map<string, (state: T) => Promise<T>> = new Map();
  private edges: Map<string, string[]> = new Map();
  private nodeData: Map<string, any> = new Map();

  constructor() {
    // Add start and end nodes by default
    this.nodes.set('__start__', async (state: T) => state);
    this.edges.set('__start__', []);
    this.nodeData.set('__start__', { type: 'system', label: 'Start' });

    this.nodes.set('__end__', async (state: T) => state);
    this.edges.set('__end__', []);
    this.nodeData.set('__end__', { type: 'system', label: 'End' });
  }

  addNode(id: string, handler: (state: T) => Promise<T>, data?: any): WorkflowGraph<T> {
    this.nodes.set(id, handler);
    this.edges.set(id, []);
    this.nodeData.set(id, data || {});
    return this;
  }

  connect(source: string, target: string, condition?: (state: T) => boolean): WorkflowGraph<T> {
    if (!this.nodes.has(source)) {
      throw new Error(`Source node "${source}" not found`);
    }
    if (!this.nodes.has(target)) {
      throw new Error(`Target node "${target}" not found`);
    }

    const targets = this.edges.get(source) || [];
    targets.push(target);
    this.edges.set(source, targets);
    return this;
  }

  async execute(initialState: T): Promise<T> {
    let currentState = { ...initialState };
    let visited = new Set<string>();
    
    // Start with the __start__ node
    let currentNode = '__start__';
    
    while (currentNode && !visited.has(currentNode)) {
      visited.add(currentNode);
      
      // Execute the current node
      const nodeHandler = this.nodes.get(currentNode);
      if (!nodeHandler) {
        throw new Error(`Node "${currentNode}" not found`);
      }
      
      // Process the node
      currentState = await nodeHandler(currentState);
      
      // Find the next node to execute
      const targets = this.edges.get(currentNode) || [];
      if (targets.length === 0) {
        // No outgoing edges, end the execution
        break;
      }
      
      // For now, just take the first target
      // In a more complex implementation, you would evaluate conditions
      currentNode = targets[0];
    }
    
    return currentState;
  }

  getNodeData(id: string): any {
    return this.nodeData.get(id);
  }

  getNodes(): string[] {
    return Array.from(this.nodes.keys());
  }

  getEdges(): { source: string; target: string }[] {
    const result: { source: string; target: string }[] = [];
    
    // Manual iteration using keys to avoid MapIterator issues
    const keys = Array.from(this.edges.keys());
    for (const source of keys) {
      const targets = this.edges.get(source) || [];
      for (const target of targets) {
        result.push({ source, target });
      }
    }
    
    return result;
  }
}

// Factory function to create a new workflow graph
export function createWorkflow<T extends GraphState>(): WorkflowGraph<T> {
  return new WorkflowGraph<T>();
}

// Export a type that matches the LangGraph API signature
export type GraphFactory<T> = (initialState: T) => Promise<T>;

// Create a workflow factory function that returns an async function matching LangGraph signature
export function createWorkflowFactory<T extends GraphState>(
  setupFn: (graph: WorkflowGraph<T>) => WorkflowGraph<T>
): GraphFactory<T> {
  return async (initialState: T) => {
    const graph = setupFn(new WorkflowGraph<T>());
    return await graph.execute(initialState);
  };
}