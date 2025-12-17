/**
 * cURL Generation Utilities for API Response Diff
 */

import type { HttpMethod, KeyValuePair } from '../types';

/**
 * Build URL from domain, path, and params
 */
export const buildUrl = (domain: string, path: string, params: KeyValuePair[]): string => {
  const cleanDomain = domain.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const queryParams = params
    .filter((p) => p.key.trim())
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&');

  const url = `${cleanDomain}${cleanPath}`;
  return queryParams ? `${url}?${queryParams}` : url;
};

/**
 * Generate cURL command from request configuration
 */
export const generateCurl = (
  domain: string,
  path: string,
  method: HttpMethod,
  params: KeyValuePair[],
  headers: KeyValuePair[],
  body?: string
): string => {
  const url = buildUrl(domain, path, params);
  const parts: string[] = ['curl'];

  // Add method
  if (method !== 'GET') {
    parts.push(`-X ${method}`);
  }

  // Add URL
  parts.push(`'${url}'`);

  // Add headers
  headers
    .filter((h) => h.key.trim())
    .forEach((h) => {
      parts.push(`-H '${h.key}: ${h.value}'`);
    });

  // Add Content-Type header if body exists and not already specified
  if (body && method !== 'GET') {
    const hasContentType = headers.some(
      (h) => h.key.toLowerCase() === 'content-type'
    );
    if (!hasContentType) {
      parts.push("-H 'Content-Type: application/json'");
    }
  }

  // Add body
  if (body && method !== 'GET') {
    // Escape single quotes in body
    const escapedBody = body.replace(/'/g, "'\\''");
    parts.push(`-d '${escapedBody}'`);
  }

  return parts.join(' \\\n  ');
};

