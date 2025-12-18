import type { ToolDefinition } from './types';
import { jsonTool } from './json';
import { urlTool } from './url';
import { base64Tool } from './base64';
import { timeTool } from './time';
import { yamlTool } from './yaml';
import { diffTool } from './diff';
import { cronTool } from './cron';
import { jwtDecoderTool } from './jwt-decoder';
import { jwtEncoderTool } from './jwt-encoder';
import { hashTool } from './hash';
import { uuidTool } from './uuid';
import { passwordTool } from './password';
import { queryStringTool } from './query-string';
import { regexTool } from './regex';
import { stringLengthTool } from './string-length';
import { apiTesterTool } from './api-tester';
import { curlParserTool } from './curl-parser';
import { apiDiffTool } from './api-diff';
import { imageStudioTool } from './image-studio';
import { videoStudioTool } from './video-studio';

export const tools: ToolDefinition[] = [
  jsonTool,
  urlTool,
  base64Tool,
  timeTool,
  yamlTool,
  diffTool,
  cronTool,
  jwtDecoderTool,
  jwtEncoderTool,
  hashTool,
  uuidTool,
  passwordTool,
  queryStringTool,
  regexTool,
  stringLengthTool,
  apiTesterTool,
  curlParserTool,
  apiDiffTool,
  imageStudioTool,
  videoStudioTool,
];

export const getToolById = (id: string) => tools.find(t => t.id === id);
export const getToolByPath = (path: string) => tools.find(t => t.path === path);

/**
 * Get the i18n key for a tool.
 * If i18nKey is explicitly defined, use that; otherwise convert id to camelCase.
 * @param tool - The tool definition or tool id string
 * @returns The i18n key (e.g., 'jwtDecoder' for tool.jwtDecoder.*)
 */
export const getToolI18nKey = (tool: ToolDefinition | string): string => {
  if (typeof tool === 'string') {
    const foundTool = getToolById(tool);
    if (foundTool?.i18nKey) return foundTool.i18nKey;
    // Convert kebab-case to camelCase (e.g., 'jwt-decoder' → 'jwtDecoder')
    return tool.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }
  if (tool.i18nKey) return tool.i18nKey;
  return tool.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
};
