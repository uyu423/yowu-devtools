/**
 * URL Parsing Utilities for API Response Diff
 */

import type { KeyValuePair } from '../types';
import { generateId } from '../constants';

/**
 * Parse path with query string into separate path and params
 */
export const parsePathWithQuery = (
  pathWithQuery: string
): { path: string; params: KeyValuePair[] } => {
  const questionMarkIndex = pathWithQuery.indexOf('?');
  if (questionMarkIndex === -1) {
    return { path: pathWithQuery, params: [] };
  }

  const path = pathWithQuery.slice(0, questionMarkIndex);
  const queryString = pathWithQuery.slice(questionMarkIndex + 1);

  const params: KeyValuePair[] = [];
  const searchParams = new URLSearchParams(queryString);
  searchParams.forEach((value, key) => {
    params.push({
      id: generateId(),
      key,
      value,
    });
  });

  return { path, params };
};

/**
 * Sanitize path and merge query parameters
 * - Extract query params from path
 * - Merge with existing params (path params take precedence for same keys)
 * - Return sanitized path without query string and merged params
 */
export const sanitizePathAndParams = (
  path: string,
  existingParams: KeyValuePair[]
): { sanitizedPath: string; mergedParams: KeyValuePair[] } => {
  const questionMarkIndex = path.indexOf('?');
  
  // If no query params in path, return as-is
  if (questionMarkIndex === -1) {
    return { sanitizedPath: path, mergedParams: existingParams };
  }
  
  const basePath = path.slice(0, questionMarkIndex);
  const queryString = path.slice(questionMarkIndex + 1);
  
  // Extract params from path
  const pathParams = new Map<string, string>();
  const searchParams = new URLSearchParams(queryString);
  searchParams.forEach((value, key) => {
    pathParams.set(key, value);
  });
  
  // Build merged params list
  const mergedParams: KeyValuePair[] = [];
  const processedKeys = new Set<string>();
  
  // First, update existing params with path values (if key matches)
  existingParams.forEach((param) => {
    if (param.key && pathParams.has(param.key)) {
      // Key exists in path - use path value
      mergedParams.push({
        ...param,
        value: pathParams.get(param.key)!,
      });
      processedKeys.add(param.key);
    } else {
      // Keep existing param as-is
      mergedParams.push(param);
      if (param.key) {
        processedKeys.add(param.key);
      }
    }
  });
  
  // Add new params from path that don't exist in existing params
  pathParams.forEach((value, key) => {
    if (!processedKeys.has(key)) {
      mergedParams.push({
        id: generateId(),
        key,
        value,
      });
    }
  });
  
  return { sanitizedPath: basePath, mergedParams };
};
