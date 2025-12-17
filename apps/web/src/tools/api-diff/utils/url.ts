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
