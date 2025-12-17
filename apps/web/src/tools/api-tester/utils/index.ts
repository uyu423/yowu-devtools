/**
 * API Tester - Utility Functions
 */

import type { ApiTesterState, KeyValueItem, RequestBody, HttpMethod } from '../types';

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return crypto.randomUUID();
};

/**
 * Create a new empty key-value item
 */
export const createKeyValueItem = (key = '', value = '', enabled = true): KeyValueItem => ({
  id: generateId(),
  key,
  value,
  enabled,
});

/**
 * Parse URL and extract query parameters
 */
export const parseUrlParams = (url: string): KeyValueItem[] => {
  try {
    const urlObj = new URL(url);
    const params: KeyValueItem[] = [];
    urlObj.searchParams.forEach((value, key) => {
      params.push(createKeyValueItem(key, value, true));
    });
    return params;
  } catch {
    return [];
  }
};

/**
 * Build URL with query parameters
 */
export const buildUrlWithParams = (baseUrl: string, params: KeyValueItem[]): string => {
  try {
    const url = new URL(baseUrl);
    // Clear existing params
    url.search = '';
    // Add enabled params
    params.filter(p => p.enabled && p.key).forEach(p => {
      url.searchParams.append(p.key, p.value);
    });
    return url.toString();
  } catch {
    // If URL is invalid, just return as-is
    return baseUrl;
  }
};

/**
 * Get base URL without query parameters
 */
export const getBaseUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    return url.split('?')[0];
  }
};

/**
 * Convert state to cURL command
 */
export const toCurlCommand = (state: ApiTesterState, platform: 'unix' | 'windows' = 'unix'): string => {
  const quote = platform === 'windows' ? '"' : "'";
  const escape = (s: string) => {
    if (platform === 'windows') {
      return s.replace(/"/g, '\\"');
    }
    return s.replace(/'/g, "'\\''");
  };
  
  const lines: string[] = [];
  
  // Build URL with query params
  const fullUrl = buildUrlWithParams(getBaseUrl(state.url), state.queryParams);
  
  // Method
  lines.push(`curl -X ${state.method} ${quote}${escape(fullUrl)}${quote}`);
  
  // Headers
  state.headers
    .filter(h => h.enabled && h.key)
    .forEach(h => {
      // Handle sensitive headers
      if (h.key.toLowerCase() === 'cookie') {
        lines.push(`  -H ${quote}${escape(h.key)}: <your cookies>${quote}`);
      } else {
        lines.push(`  -H ${quote}${escape(h.key)}: ${escape(h.value)}${quote}`);
      }
    });
  
  // Body
  if (state.body.kind !== 'none') {
    switch (state.body.kind) {
      case 'text':
      case 'json':
        if (state.body.text) {
          lines.push(`  -d ${quote}${escape(state.body.text)}${quote}`);
        }
        break;
      case 'urlencoded':
        state.body.items.filter(i => i.enabled && i.key).forEach(i => {
          lines.push(`  --data-urlencode ${quote}${escape(i.key)}=${escape(i.value)}${quote}`);
        });
        break;
      case 'multipart':
        state.body.items.forEach(i => {
          if (i.type === 'text') {
            lines.push(`  -F ${quote}${escape(i.key)}=${escape(i.textValue || '')}${quote}`);
          } else {
            lines.push(`  -F ${quote}${escape(i.key)}=@${escape(i.fileName || 'file')}${quote}`);
          }
        });
        break;
    }
  }
  
  // Options
  if (!state.followRedirects) {
    // curl follows redirects with -L, so omit it for no-follow
  } else {
    lines.push('  -L');
  }
  
  const separator = platform === 'windows' ? ' ^\n' : ' \\\n';
  return lines.join(separator);
};

/**
 * Check if method supports body
 */
export const methodSupportsBody = (method: HttpMethod): boolean => {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
};

/**
 * Get Content-Type header from body type
 */
export const getContentTypeForBody = (body: RequestBody): string | null => {
  switch (body.kind) {
    case 'json':
      return 'application/json';
    case 'text':
      return 'text/plain';
    case 'urlencoded':
      return 'application/x-www-form-urlencoded';
    case 'multipart':
      return null; // Browser sets this automatically with boundary
    default:
      return null;
  }
};

/**
 * Validate JSON string
 */
export const validateJson = (text: string): { valid: boolean; error?: string } => {
  if (!text.trim()) {
    return { valid: true };
  }
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid JSON',
    };
  }
};

/**
 * Format JSON string with indentation
 */
export const formatJson = (text: string, indent = 2): string => {
  try {
    return JSON.stringify(JSON.parse(text), null, indent);
  } catch {
    return text;
  }
};

/**
 * Minify JSON string
 */
export const minifyJson = (text: string): string => {
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return text;
  }
};

/**
 * Parse response body based on content type
 */
export const parseResponseBody = (
  body: { kind: 'text' | 'base64'; data: string } | undefined,
  contentType?: string
): { type: 'json' | 'yaml' | 'text' | 'image' | 'binary'; data: unknown } => {
  if (!body) {
    return { type: 'text', data: '' };
  }

  if (body.kind === 'base64') {
    // Check if it's an image
    if (contentType?.startsWith('image/')) {
      return { type: 'image', data: `data:${contentType};base64,${body.data}` };
    }
    return { type: 'binary', data: body.data };
  }

  // Text response
  const lowerContentType = contentType?.toLowerCase() || '';
  
  // Check for JSON
  if (lowerContentType.includes('json')) {
    try {
      return { type: 'json', data: JSON.parse(body.data) };
    } catch {
      return { type: 'text', data: body.data };
    }
  }

  // Check for YAML
  if (lowerContentType.includes('yaml') || lowerContentType.includes('yml')) {
    return { type: 'yaml', data: body.data };
  }

  // Try to detect JSON/YAML from content
  if (body.data.trim()) {
    // Try JSON first
    if (body.data.trim().startsWith('{') || body.data.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(body.data);
        return { type: 'json', data: parsed };
      } catch {
        // Not JSON, continue
      }
    }
    
    // Try YAML detection (basic heuristics)
    // YAML often starts with key-value pairs or list items
    const trimmed = body.data.trim();
    if (
      trimmed.includes(':') &&
      (trimmed.includes('\n') || trimmed.split(':').length > 1) &&
      !trimmed.startsWith('{') &&
      !trimmed.startsWith('[')
    ) {
      // Could be YAML, but we'll return as text and let the user decide
      // The UI will show a button if content-type suggests YAML
    }
  }

  return { type: 'text', data: body.data };
};

/**
 * Check if a header is sensitive
 */
export const isSensitiveHeader = (key: string): boolean => {
  const sensitive = ['authorization', 'cookie', 'x-api-key', 'api-key', 'x-auth-token'];
  return sensitive.includes(key.toLowerCase());
};

/**
 * Filter sensitive headers for sharing
 */
export const filterSensitiveHeaders = (
  headers: KeyValueItem[],
  includeAuth = false,
  includeCookie = false
): KeyValueItem[] => {
  return headers.filter(h => {
    const key = h.key.toLowerCase();
    if (key === 'authorization' && !includeAuth) return false;
    if (key === 'cookie' && !includeCookie) return false;
    if (key.includes('api-key') && !includeAuth) return false;
    return true;
  });
};

