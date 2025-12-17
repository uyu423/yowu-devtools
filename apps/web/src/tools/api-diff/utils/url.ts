/**
 * API Response Diff Tool - URL Utilities
 */

import type { HttpMethod, KeyValuePair } from '../types';

/**
 * Build full URL from domain, path, and params
 */
export function buildUrl(
  domain: string,
  path: string,
  params: KeyValuePair[]
): string {
  try {
    const url = new URL(path, domain);
    params.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        url.searchParams.set(key.trim(), value);
      }
    });
    return url.toString();
  } catch {
    // If URL construction fails, return concatenated string
    const queryString = params
      .filter((p) => p.key.trim() && p.value.trim())
      .map(
        (p) =>
          `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value)}`
      )
      .join('&');
    const separator = path.includes('?') ? '&' : '?';
    return `${domain}${path}${queryString ? separator + queryString : ''}`;
  }
}

/**
 * Parse query string from path and return clean path + params
 */
export function parsePathWithQuery(
  fullPath: string
): { path: string; params: KeyValuePair[] } {
  const queryIndex = fullPath.indexOf('?');
  if (queryIndex === -1) {
    return { path: fullPath, params: [] };
  }

  const path = fullPath.substring(0, queryIndex);
  const queryString = fullPath.substring(queryIndex + 1);
  const params: KeyValuePair[] = [];

  const searchParams = new URLSearchParams(queryString);
  searchParams.forEach((value, key) => {
    params.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      key,
      value,
    });
  });

  return { path, params };
}

/**
 * Generate cURL command from request parameters
 */
export function generateCurl(
  url: string,
  method: HttpMethod,
  headers: KeyValuePair[],
  body?: string
): string {
  let curl = `curl -X ${method} '${url}'`;

  headers.forEach(({ key, value }) => {
    if (key.trim() && value.trim()) {
      const escapedValue = value.replace(/'/g, "'\\''");
      curl += ` \\\n  -H '${key.trim()}: ${escapedValue}'`;
    }
  });

  if (body && method !== 'GET') {
    const escapedBody = body.replace(/'/g, "'\\''");
    curl += ` \\\n  -d '${escapedBody}'`;
  }

  return curl;
}

/**
 * Generate history item name from method and path
 */
export function generateHistoryName(
  method: HttpMethod,
  path: string,
  params: KeyValuePair[]
): string {
  const queryString = params
    .filter((p) => p.key.trim() && p.value.trim())
    .map((p) => `${p.key.trim()}=${p.value}`)
    .join('&');
  const queryPart = queryString ? `?${queryString}` : '';
  return `${method} ${path}${queryPart}`;
}

