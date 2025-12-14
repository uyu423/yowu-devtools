import type { ToolDefinition } from './types';
import { jsonTool } from './json';
import { urlTool } from './url';
import { base64Tool } from './base64';
import { timeTool } from './time';
import { yamlTool } from './yaml';
import { diffTool } from './diff';
import { cronTool } from './cron';

export const tools: ToolDefinition[] = [
  jsonTool,
  urlTool,
  base64Tool,
  timeTool,
  yamlTool,
  diffTool,
  cronTool,
];

export const getToolById = (id: string) => tools.find(t => t.id === id);
export const getToolByPath = (path: string) => tools.find(t => t.path === path);
