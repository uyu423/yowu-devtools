import React from 'react';

export interface ToolDefinition<TState = any> {
  id: string;
  title: string;
  description: string;
  icon?: React.ElementType; // LucideIcon
  path: string; // URL path (e.g., '/json')
  
  defaultState: TState;
  
  // Component to render
  Component: React.ComponentType;
  
  // State serialization (optional for now)
  // encodeState?: (state: TState) => unknown;
  // decodeState?: (raw: any) => TState;
}

