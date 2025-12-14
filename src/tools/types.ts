import React from 'react';

export interface ToolDefinition<TState = unknown> {
  id: string;
  title: string;
  description: string;
  icon?: React.ElementType; // LucideIcon
  path: string; // URL path (e.g., '/json')
  
  // Command Palette support (v1.2.0)
  keywords?: string[]; // Search keywords for Command Palette
  category?: string; // Tool category (e.g., 'converter', 'viewer', 'generator')
  
  defaultState: TState;
  
  // Component to render
  Component: React.ComponentType;
  
  // State serialization (optional for now)
  // encodeState?: (state: TState) => unknown;
  // decodeState?: (raw: any) => TState;
}
