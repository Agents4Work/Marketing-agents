// Tipos compartidos para los componentes de workflow
import React from 'react';

export interface AgentData {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export interface LegoNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: AgentData;
  selected?: boolean;
}

export interface LegoConnection {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  label?: string;
}

export interface CustomLegoCanvasProps {
  agents?: AgentData[];
  onSave?: (nodes: LegoNode[], connections: LegoConnection[]) => void;
  onPlay?: () => void;
  readOnly?: boolean;
}

export interface LegoAgentNodeProps {
  node: LegoNode;
  onNodeClick?: (node: LegoNode) => void;
  onNodeDrag?: (nodeId: string, newPosition: { x: number; y: number }) => void;
}

export interface ConnectionLineProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  animated?: boolean;
  label?: string;
  connectionId?: string;
  sourceNodeId?: string;
  targetNodeId?: string;
}