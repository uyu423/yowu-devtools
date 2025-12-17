/**
 * cURL Parser - Main parsing logic
 * 
 * Parses cURL commands into structured data.
 */

import type {
  CurlParseResult,
  CurlRequest,
  CurlBody,
  CurlHeader,
  CurlWarning,
  HttpMethod,
  BodyKind,
} from './types';
import { tokenize, extractCurlCommand, normalizeLineContinuations } from './tokenizer';

/**
 * Normalize cURL command
 * - Remove line continuations
 * - Clean up whitespace
 * - Preserve structure
 */
export function normalizeCurl(input: string): string {
  return normalizeLineContinuations(input)
    .split(/\s+/)
    .join(' ')
    .trim();
}

/**
 * Decode URL for display
 */
export function decodeUrl(url: string): string {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

/**
 * Encode URL for export
 */
export function encodeUrl(url: string): string {
  try {
    return encodeURIComponent(url);
  } catch {
    return url;
  }
}

/**
 * Decode cookie value
 */
export function decodeCookie(cookie: string): string {
  try {
    return decodeURIComponent(cookie);
  } catch {
    return cookie;
  }
}

/**
 * Sensitive header names (case-insensitive)
 */
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'api-key',
  'access-token',
  'bearer',
]);

/**
 * Check if a header is sensitive
 */
function isSensitiveHeader(key: string): boolean {
  return SENSITIVE_HEADERS.has(key.toLowerCase());
}

/**
 * Parse cookie string (e.g., "a=b; c=d")
 */
function parseCookieString(cookieStr: string): Array<{ key: string; value: string }> {
  const items: Array<{ key: string; value: string }> = [];
  const parts = cookieStr.split(';');
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex < 0) {
      // No equals sign, treat as key with empty value
      items.push({ key: trimmed, value: '' });
    } else {
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      items.push({ key, value });
    }
  }
  
  return items;
}

/**
 * Extract query parameters from URL
 */
function extractQueryParams(url: string): Array<{ key: string; value: string; enabled: boolean }> {
  try {
    const urlObj = new URL(url);
    const params: Array<{ key: string; value: string; enabled: boolean }> = [];
    urlObj.searchParams.forEach((value, key) => {
      params.push({ key, value, enabled: true });
    });
    return params;
  } catch {
    // Invalid URL, try manual parsing
    const queryIndex = url.indexOf('?');
    if (queryIndex < 0) return [];
    
    const queryStr = url.slice(queryIndex + 1);
    const params: Array<{ key: string; value: string; enabled: boolean }> = [];
    const pairs = queryStr.split('&');
    
    for (const pair of pairs) {
      const eqIndex = pair.indexOf('=');
      if (eqIndex < 0) {
        params.push({ key: decodeURIComponent(pair), value: '', enabled: true });
      } else {
        const key = decodeURIComponent(pair.slice(0, eqIndex));
        const value = decodeURIComponent(pair.slice(eqIndex + 1));
        params.push({ key, value, enabled: true });
      }
    }
    
    return params;
  }
}

/**
 * Detect body type from content and headers
 */
function detectBodyType(
  content: string,
  headers: CurlHeader[]
): BodyKind {
  // Check Content-Type header
  const contentTypeHeader = headers.find(
    h => h.key.toLowerCase() === 'content-type'
  );
  
  if (contentTypeHeader) {
    const contentType = contentTypeHeader.value.toLowerCase();
    if (contentType.includes('application/json')) {
      return 'json';
    }
    if (contentType.includes('application/x-www-form-urlencoded')) {
      return 'urlencoded';
    }
    if (contentType.includes('multipart/form-data')) {
      return 'multipart';
    }
  }
  
  // Try to detect JSON
  const trimmed = content.trim();
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }
  
  // Check if it looks like URL-encoded
  if (content.includes('=') && !content.includes('\n')) {
    return 'urlencoded';
  }
  
  return 'text';
}

/**
 * Parse URL-encoded body
 */
function parseUrlencodedBody(content: string): Array<{ key: string; value: string }> {
  const items: Array<{ key: string; value: string }> = [];
  const pairs = content.split('&');
  
  for (const pair of pairs) {
    const eqIndex = pair.indexOf('=');
    if (eqIndex < 0) {
      items.push({ key: decodeURIComponent(pair), value: '' });
    } else {
      const key = decodeURIComponent(pair.slice(0, eqIndex));
      const value = decodeURIComponent(pair.slice(eqIndex + 1));
      items.push({ key, value });
    }
  }
  
  return items;
}


/**
 * Main parsing function
 */
export function parseCurl(input: string): CurlParseResult {
  const original = input.trim();
  const normalized = normalizeLineContinuations(original);
  
  // Extract cURL command if mixed with other text
  const curlCommand = extractCurlCommand(normalized) || normalized;
  
  // Tokenize
  const tokens = tokenize(curlCommand);
  
  if (tokens.length === 0 || tokens[0].value !== 'curl') {
    throw new Error('Invalid cURL command: must start with "curl"');
  }
  
  const warnings: CurlWarning[] = [];
  const request: CurlRequest = {
    method: 'GET',
    url: '',
    urlDecoded: undefined,
    query: [],
    headers: [],
    cookies: undefined,
    body: undefined,
    options: {},
  };
  
  // Track flags
  let hasBody = false;
  let hasGetFlag = false;
  let bodyContent: string | undefined;
  let bodyKind: BodyKind | undefined;
  const multipartItems: Array<
    | { kind: 'field'; key: string; value: string }
    | { kind: 'file'; key: string; filename?: string; path?: string; note: 'unsupported-file-path' }
  > = [];
  
  // Parse tokens
  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    const value = token.value;
    const nextToken = tokens[i + 1];
    
    // Method (-X, --request)
    if (value === '-X' || value === '--request') {
      if (nextToken) {
        const method = nextToken.value.toUpperCase() as HttpMethod;
        if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)) {
          request.method = method;
        }
        i++; // Skip next token
      }
      continue;
    }
    
    // GET flag (-G)
    if (value === '-G' || value === '--get') {
      hasGetFlag = true;
      continue;
    }
    
    // Headers (-H, --header)
    if (value === '-H' || value === '--header') {
      if (nextToken) {
        const headerValue = nextToken.value;
        const colonIndex = headerValue.indexOf(':');
        if (colonIndex >= 0) {
          const key = headerValue.slice(0, colonIndex).trim();
          const headerValueStr = headerValue.slice(colonIndex + 1).trim();
          
          // Check if it's a Cookie header
          if (key.toLowerCase() === 'cookie') {
            if (!request.cookies) {
              request.cookies = {
                raw: headerValueStr,
                items: parseCookieString(headerValueStr).map(item => ({
                  ...item,
                  sensitive: isSensitiveHeader('cookie'),
                })),
                source: 'cookie-header',
              };
            }
          }
          
          request.headers.push({
            key,
            value: headerValueStr,
            enabled: true,
            sensitive: isSensitiveHeader(key),
          });
        }
        i++; // Skip next token
      }
      continue;
    }
    
    // Cookies (-b, --cookie)
    if (value === '-b' || value === '--cookie') {
      if (nextToken) {
        const cookieValue = nextToken.value;
        
        // Check if it's a file path
        if (cookieValue.includes('.txt') || cookieValue.includes('/') || cookieValue.includes('\\')) {
          warnings.push({
            code: 'UNSUPPORTED_COOKIE_FILE',
            message: `Cookie file not supported: ${cookieValue}. Please paste cookie string directly.`,
          });
        } else {
          if (!request.cookies) {
            request.cookies = {
              raw: cookieValue,
              items: parseCookieString(cookieValue).map(item => ({
                ...item,
                sensitive: true,
              })),
              source: 'cookie-flag',
            };
          }
        }
        i++; // Skip next token
      }
      continue;
    }
    
    // Body data (-d, --data, --data-raw, --data-binary)
    if (
      value === '-d' ||
      value === '--data' ||
      value === '--data-raw' ||
      value === '--data-binary'
    ) {
      if (nextToken) {
        // Check for @file
        if (nextToken.value.startsWith('@')) {
          warnings.push({
            code: 'UNSUPPORTED_DATA_FILE',
            message: `Data file not supported: ${nextToken.value}. Please paste data directly.`,
          });
        } else {
          bodyContent = nextToken.value;
          hasBody = true;
        }
        i++; // Skip next token
      }
      continue;
    }
    
    // URL-encoded data (--data-urlencode)
    if (value === '--data-urlencode') {
      if (nextToken) {
        bodyContent = nextToken.value;
        bodyKind = 'urlencoded';
        hasBody = true;
        i++; // Skip next token
      }
      continue;
    }
    
    // Form data (-F, --form)
    if (value === '-F' || value === '--form') {
      if (nextToken) {
        bodyKind = 'multipart';
        hasBody = true;
        
        const formValue = nextToken.value;
        const eqIndex = formValue.indexOf('=');
        
        if (eqIndex >= 0) {
          const key = formValue.slice(0, eqIndex);
          const value = formValue.slice(eqIndex + 1);
          
          // Check if it's a file (@path)
          if (value.startsWith('@')) {
            const path = value.slice(1);
            multipartItems.push({
              kind: 'file',
              key,
              path,
              note: 'unsupported-file-path',
            });
          } else {
            multipartItems.push({
              kind: 'field',
              key,
              value,
            });
          }
        }
        
        i++; // Skip next token
      }
      continue;
    }
    
    // Options
    if (value === '-L' || value === '--location') {
      request.options.followRedirects = true;
      continue;
    }
    
    if (value === '-k' || value === '--insecure') {
      request.options.insecureTLS = true;
      warnings.push({
        code: 'INSECURE_TLS',
        message: 'Insecure TLS (-k) is not supported in browser. Use Extension mode for local testing.',
      });
      continue;
    }
    
    if (value === '--compressed') {
      request.options.compressed = true;
      continue;
    }
    
    // Basic auth (-u, --user)
    if (value === '-u' || value === '--user') {
      if (nextToken) {
        const authValue = nextToken.value;
        const colonIndex = authValue.indexOf(':');
        if (colonIndex >= 0) {
          request.options.basicAuth = {
            user: authValue.slice(0, colonIndex),
            password: authValue.slice(colonIndex + 1),
          };
          // Add Authorization header
          const credentials = btoa(`${request.options.basicAuth.user}:${request.options.basicAuth.password}`);
          request.headers.push({
            key: 'Authorization',
            value: `Basic ${credentials}`,
            enabled: true,
            sensitive: true,
          });
        }
        i++; // Skip next token
      }
      continue;
    }
    
    // Config file (-K, --config)
    if (value === '-K' || value === '--config') {
      if (nextToken) {
        warnings.push({
          code: 'UNSUPPORTED_CONFIG_FILE',
          message: `Config file not supported: ${nextToken.value}. Please paste command directly.`,
        });
        i++; // Skip next token
      }
      continue;
    }
    
    // Check for shell variables ($VAR, $(command))
    if (value.includes('$') || value.includes('`') || value.includes('$(')) {
      warnings.push({
        code: 'SHELL_EXPANSION',
        message: `Shell expansion detected: ${value}. Variable substitution is not supported.`,
      });
    }
  }
  
  // Find URL (last non-flag token that looks like a URL)
  // Process tokens in reverse to find the last URL
  for (let i = tokens.length - 1; i >= 1; i--) {
    const token = tokens[i];
    const value = token.value;
    
    // Skip if it's a flag
    if (value.startsWith('-') || value.startsWith('--')) {
      continue;
    }
    
    // Check if it looks like a URL
    if (value.startsWith('http://') || value.startsWith('https://')) {
      request.url = value;
      request.query = extractQueryParams(value);
      
      // Try to decode URL for display
      try {
        request.urlDecoded = decodeURIComponent(value);
      } catch {
        // Invalid URL encoding, keep original
        request.urlDecoded = value;
      }
      break; // Found URL, stop searching
    }
  }
  
  // If no URL found, try to find any non-flag token as URL
  if (!request.url) {
    for (let i = tokens.length - 1; i >= 1; i--) {
      const token = tokens[i];
      const value = token.value;
      
      // Skip if it's a flag
      if (value.startsWith('-') || value.startsWith('--')) {
        continue;
      }
      
      // Use this as URL (might be a relative URL or domain)
      request.url = value;
      request.query = extractQueryParams(value);
      request.urlDecoded = value;
      break;
    }
  }
  
  // Infer method if body exists and method not set
  if (hasBody && request.method === 'GET' && !hasGetFlag) {
    request.method = 'POST';
  }
  
  // Parse body
  if (hasBody && bodyContent !== undefined) {
    if (!bodyKind) {
      bodyKind = detectBodyType(bodyContent, request.headers);
    }
    
    const body: CurlBody = {
      kind: bodyKind,
    };
    
    switch (bodyKind) {
      case 'json':
      case 'text':
        body.text = bodyContent;
        break;
      case 'urlencoded':
        body.urlencodedItems = parseUrlencodedBody(bodyContent);
        break;
      case 'multipart':
        body.multipartItems = multipartItems;
        break;
    }
    
    request.body = body;
  }
  
  return {
    original,
    normalized,
    request,
    warnings,
  };
}
