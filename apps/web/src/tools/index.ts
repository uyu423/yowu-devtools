import type { ToolDefinition } from './types';
import { apiBurstTestTool } from './api-burst-test';
import { apiDiffTool } from './api-diff';
import { apiTesterTool } from './api-tester';
import { base64Tool } from './base64';
import { cronTool } from './cron';
import { curlParserTool } from './curl-parser';
import { diffTool } from './diff';
import { hashTool } from './hash';
import { iconConverterTool } from './icon-converter';
import { imageStudioTool } from './image-studio';
import { jsonTool } from './json';
import { jwtDecoderTool } from './jwt-decoder';
import { jwtEncoderTool } from './jwt-encoder';
import { passwordTool } from './password';
import { queryStringTool } from './query-string';
import { regexTool } from './regex';
import { stringLengthTool } from './string-length';
import { timeTool } from './time';
import { urlTool } from './url';
import { uuidTool } from './uuid';
import { videoStudioTool } from './video-studio';
import { yamlTool } from './yaml';

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
  iconConverterTool,
  imageStudioTool,
  videoStudioTool,
  apiBurstTestTool,
];

export const getToolById = (id: string) => tools.find((t) => t.id === id);
export const getToolByPath = (path: string) =>
  tools.find((t) => t.path === path);

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
