/**
 * Yowu DevTools Companion - Service Worker
 *
 * This service worker handles messages from the WebApp (tools.yowu.dev)
 * and executes cross-origin requests on behalf of the user.
 *
 * Design Principles:
 * - Event-driven: Only activates when messages are received
 * - Minimal state: All persistent state stored in chrome.storage
 * - Security first: Validates all origins and messages
 */

import {
  type WebAppMessage,
  type ExtensionResponse,
  type RequestSpec,
  type ResponseSpec,
  PROTOCOL_VERSION,
  SUPPORTED_FEATURES,
  ERROR_CODES,
  ALLOWED_ORIGINS,
  FORBIDDEN_HEADERS,
  HTTP_METHODS,
} from '@yowu-devtools/shared';

// =============================================================================
// Handler Registry Pattern
// =============================================================================

type MessageHandler = (
  message: WebAppMessage,
  sender: chrome.runtime.MessageSender
) => Promise<ExtensionResponse>;

const handlers: Map<string, MessageHandler> = new Map();

function registerHandler(type: string, handler: MessageHandler): void {
  handlers.set(type, handler);
}

// =============================================================================
// Origin Validation
// =============================================================================

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
}

// =============================================================================
// Permission Management
// =============================================================================

/**
 * Get permission patterns for an origin, including parent domains for cookie access
 * e.g., "https://api.sub.example.com" ->
 *   ["https://api.sub.example.com/*", "https://*.sub.example.com/*", "https://*.example.com/*"]
 */
function getPermissionPatterns(origin: string): string[] {
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    const protocol = url.protocol;
    const parts = hostname.split('.');
    
    const patterns: string[] = [`${origin}/*`];
    
    // Add wildcard patterns for parent domains (for cookie access)
    // e.g., *.sub.example.com, *.example.com
    for (let i = 1; i < parts.length - 1; i++) {
      const parentDomain = parts.slice(i).join('.');
      patterns.push(`${protocol}//*.${parentDomain}/*`);
    }
    
    return patterns;
  } catch {
    return [`${origin}/*`];
  }
}

async function hasPermission(origin: string): Promise<boolean> {
  try {
    const pattern = `${origin}/*`;
    return await chrome.permissions.contains({
      origins: [pattern],
    });
  } catch {
    return false;
  }
}

async function requestPermission(origin: string): Promise<boolean> {
  try {
    // Request permissions for the origin AND parent domains (for cookie access)
    const patterns = getPermissionPatterns(origin);
    console.log('[Extension] Requesting permissions for patterns:', patterns);
    
    return await chrome.permissions.request({
      origins: patterns,
    });
  } catch (err) {
    console.error('[Extension] Permission request failed:', err);
    return false;
  }
}

async function revokePermission(origin: string): Promise<boolean> {
  try {
    const pattern = `${origin}/*`;
    return await chrome.permissions.remove({
      origins: [pattern],
    });
  } catch {
    return false;
  }
}

async function getGrantedOrigins(): Promise<string[]> {
  try {
    const permissions = await chrome.permissions.getAll();
    const origins = permissions.origins || [];
    // Remove trailing /* from patterns to get clean origins
    return origins
      .filter((o) => o !== '<all_urls>')
      .map((o) => o.replace(/\/\*$/, ''));
  } catch {
    return [];
  }
}

// =============================================================================
// Cookie Management
// =============================================================================

/**
 * Extract all possible domain patterns from a hostname
 * e.g., "api.sub.example.com" -> 
 *   ["api.sub.example.com", ".sub.example.com", ".example.com"]
 */
function getDomainPatterns(hostname: string): string[] {
  const patterns: string[] = [hostname];
  const parts = hostname.split('.');
  
  // Generate parent domain patterns (with leading dot for wildcard matching)
  // Skip the last two parts (e.g., "example.com") to avoid too broad patterns
  for (let i = 1; i < parts.length - 1; i++) {
    patterns.push('.' + parts.slice(i).join('.'));
  }
  
  return patterns;
}

/**
 * Get cookies for a URL including parent domain cookies
 * This collects cookies from all matching domains (e.g., .example.com for *.example.com)
 */
async function getCookiesForUrl(url: string): Promise<string | null> {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const domainPatterns = getDomainPatterns(hostname);
    
    console.log('[Extension] Getting cookies for URL:', url);
    console.log('[Extension] Domain patterns to check:', domainPatterns);
    
    // Collect cookies from all domain patterns
    const cookieMap = new Map<string, chrome.cookies.Cookie>();
    
    for (const domain of domainPatterns) {
      try {
        // Get cookies by domain pattern
        const domainCookies = await chrome.cookies.getAll({ domain });
        console.log(`[Extension] Found ${domainCookies.length} cookies for domain: ${domain}`);
        
        for (const cookie of domainCookies) {
          // Check if cookie applies to this URL
          const cookieApplies = 
            // Domain matches
            (hostname === cookie.domain || hostname.endsWith(cookie.domain)) &&
            // Path matches
            parsedUrl.pathname.startsWith(cookie.path) &&
            // Secure flag matches
            (!cookie.secure || parsedUrl.protocol === 'https:');
          
          if (cookieApplies) {
            // Use cookie name as key to avoid duplicates (later cookies override earlier)
            cookieMap.set(cookie.name, cookie);
          }
        }
      } catch (err) {
        console.warn(`[Extension] Failed to get cookies for domain ${domain}:`, err);
      }
    }
    
    // Also try the URL-based approach as fallback
    try {
      const urlCookies = await chrome.cookies.getAll({ url });
      console.log(`[Extension] Found ${urlCookies.length} cookies by URL`);
      for (const cookie of urlCookies) {
        cookieMap.set(cookie.name, cookie);
      }
    } catch (err) {
      console.warn('[Extension] Failed to get cookies by URL:', err);
    }
    
    const cookies = Array.from(cookieMap.values());
    console.log('[Extension] Total unique cookies:', cookies.length);
    
    if (cookies.length === 0) return null;
    
    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    console.log('[Extension] Cookie header length:', cookieString.length);
    return cookieString;
  } catch (error) {
    console.warn('[Extension] Failed to get cookies:', error);
    return null;
  }
}

// =============================================================================
// Request Executor
// =============================================================================

function filterForbiddenHeaders(
  headers: Array<{ key: string; value: string; enabled: boolean }>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const h of headers) {
    if (!h.enabled) continue;

    const isForbidden = FORBIDDEN_HEADERS.some(
      (forbidden) => forbidden.toLowerCase() === h.key.toLowerCase()
    );

    if (!isForbidden) {
      result[h.key] = h.value;
    }
  }

  return result;
}

function buildRequestBody(body: RequestSpec['body']): BodyInit | undefined {
  switch (body.kind) {
    case 'none':
      return undefined;

    case 'text':
    case 'json':
      return body.text;

    case 'urlencoded': {
      const params = new URLSearchParams();
      for (const item of body.items) {
        params.append(item.key, item.value);
      }
      return params;
    }

    case 'multipart': {
      const formData = new FormData();
      for (const item of body.items) {
        if (item.type === 'text') {
          formData.append(item.key, item.textValue || '');
        } else if (item.type === 'file' && item.fileData) {
          // Convert base64 to Blob
          const binary = atob(item.fileData);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: item.mimeType || 'application/octet-stream' });
          formData.append(item.key, blob, item.fileName || 'file');
        }
      }
      return formData;
    }
  }
}

async function executeRequest(spec: RequestSpec): Promise<ResponseSpec> {
  const startTime = performance.now();

  // Validate URL
  let url: URL;
  try {
    url = new URL(spec.url);
  } catch {
    return {
      id: spec.id,
      ok: false,
      error: {
        code: ERROR_CODES.INVALID_URL,
        message: `Invalid URL: ${spec.url}`,
      },
    };
  }

  // Check permission for the target origin
  const targetOrigin = url.origin;
  const granted = await hasPermission(targetOrigin);

  if (!granted) {
    return {
      id: spec.id,
      ok: false,
      error: {
        code: ERROR_CODES.PERMISSION_DENIED,
        message: `Permission not granted for ${targetOrigin}. Please grant permission first.`,
      },
    };
  }

  // Build fetch options
  const headers = filterForbiddenHeaders(spec.headers);
  const body = buildRequestBody(spec.body);

  // Validate HTTP method
  const method = spec.method.toUpperCase();
  if (!HTTP_METHODS.includes(method as typeof HTTP_METHODS[number])) {
    return {
      id: spec.id,
      ok: false,
      error: {
        code: ERROR_CODES.INVALID_MESSAGE,
        message: `Invalid HTTP method: ${method}`,
      },
    };
  }

  // Get cookies for the target URL and add to headers
  // Note: In Service Worker context, we can set Cookie header directly
  const cookieValue = await getCookiesForUrl(spec.url);
  if (cookieValue) {
    console.log('[Extension] Adding cookies to request headers for:', targetOrigin);
    headers['Cookie'] = cookieValue;
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), spec.options.timeoutMs);

  try {
    console.log('[Extension] Executing fetch with headers:', Object.keys(headers));
    const response = await fetch(spec.url, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
      redirect: spec.options.redirect,
      credentials: spec.options.credentials,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const timingMs = Math.round(performance.now() - startTime);

    // Extract response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Get response body
    const contentType = response.headers.get('content-type') || '';
    let responseBody: ResponseSpec['body'];

    if (contentType.includes('text') || contentType.includes('json') || contentType.includes('xml')) {
      const text = await response.text();
      responseBody = { kind: 'text', data: text };
    } else {
      // Binary data - convert to base64
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      responseBody = { kind: 'base64', data: btoa(binary) };
    }

    return {
      id: spec.id,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      timingMs,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const timingMs = Math.round(performance.now() - startTime);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          id: spec.id,
          ok: false,
          timingMs,
          error: {
            code: ERROR_CODES.TIMEOUT,
            message: `Request timeout after ${spec.options.timeoutMs}ms`,
          },
        };
      }

      return {
        id: spec.id,
        ok: false,
        timingMs,
        error: {
          code: ERROR_CODES.NETWORK_ERROR,
          message: error.message,
        },
      };
    }

    return {
      id: spec.id,
      ok: false,
      timingMs,
      error: {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Unknown error occurred',
      },
    };
  }
}

// =============================================================================
// Message Handlers
// =============================================================================

registerHandler('PING', async () => {
  return { type: 'PONG', version: PROTOCOL_VERSION };
});

registerHandler('HANDSHAKE', async () => {
  return {
    type: 'HANDSHAKE_ACK',
    version: PROTOCOL_VERSION,
    features: [...SUPPORTED_FEATURES],
    extensionId: chrome.runtime.id,
  };
});

registerHandler('EXECUTE_REQUEST', async (message) => {
  if (message.type !== 'EXECUTE_REQUEST') {
    return {
      type: 'ERROR',
      error: { code: ERROR_CODES.INVALID_MESSAGE, message: 'Invalid message type' },
    };
  }

  const response = await executeRequest(message.payload);
  return { type: 'RESPONSE', payload: response };
});

registerHandler('CHECK_PERMISSION', async (message) => {
  if (message.type !== 'CHECK_PERMISSION') {
    return {
      type: 'ERROR',
      error: { code: ERROR_CODES.INVALID_MESSAGE, message: 'Invalid message type' },
    };
  }

  const { origin } = message.payload;
  const granted = await hasPermission(origin);
  return { type: 'PERMISSION_STATUS', payload: { granted, origin } };
});

registerHandler('REQUEST_PERMISSION', async (message) => {
  if (message.type !== 'REQUEST_PERMISSION') {
    return {
      type: 'ERROR',
      error: { code: ERROR_CODES.INVALID_MESSAGE, message: 'Invalid message type' },
    };
  }

  const { origin } = message.payload;

  // Note: chrome.permissions.request() requires user gesture
  // This may fail if not called from a proper user gesture context
  const granted = await requestPermission(origin);

  if (!granted) {
    return {
      type: 'ERROR',
      error: {
        code: ERROR_CODES.PERMISSION_REQUEST_FAILED,
        message: `Permission request failed for ${origin}. User may have denied the request.`,
      },
    };
  }

  return { type: 'PERMISSION_STATUS', payload: { granted: true, origin } };
});

registerHandler('GET_GRANTED_ORIGINS', async () => {
  const origins = await getGrantedOrigins();
  return { type: 'GRANTED_ORIGINS', payload: { origins } };
});

registerHandler('REVOKE_PERMISSION', async (message) => {
  if (message.type !== 'REVOKE_PERMISSION') {
    return {
      type: 'ERROR',
      error: { code: ERROR_CODES.INVALID_MESSAGE, message: 'Invalid message type' },
    };
  }

  const { origin } = message.payload;
  const success = await revokePermission(origin);
  return { type: 'PERMISSION_REVOKED', payload: { origin, success } };
});

// =============================================================================
// Message Listener
// =============================================================================

chrome.runtime.onMessageExternal.addListener(
  (
    message: WebAppMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse) => void
  ) => {
    // Validate origin
    if (!isOriginAllowed(sender.origin)) {
      console.warn('[Extension] Rejected message from unauthorized origin:', sender.origin);
      sendResponse({
        type: 'ERROR',
        error: {
          code: ERROR_CODES.ORIGIN_NOT_ALLOWED,
          message: `Origin ${sender.origin} is not allowed to communicate with this extension`,
        },
      });
      return true;
    }

    // Log incoming message (dev only)
    console.log('[Extension] Received message:', message.type, 'from:', sender.origin);

    // Get handler for message type
    const handler = handlers.get(message.type);

    if (!handler) {
      sendResponse({
        type: 'ERROR',
        error: {
          code: ERROR_CODES.UNKNOWN_MESSAGE_TYPE,
          message: `Unknown message type: ${message.type}`,
        },
      });
      return true;
    }

    // Execute handler asynchronously
    handler(message, sender)
      .then((response) => {
        console.log('[Extension] Sending response:', response.type);
        sendResponse(response);
      })
      .catch((error) => {
        console.error('[Extension] Handler error:', error);
        sendResponse({
          type: 'ERROR',
          error: {
            code: ERROR_CODES.NETWORK_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      });

    // Return true to indicate async response
    return true;
  }
);

// =============================================================================
// Action Button Handler
// =============================================================================

// Open options page when toolbar icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// =============================================================================
// Service Worker Lifecycle
// =============================================================================

console.log('[Extension] Yowu DevTools Companion service worker initialized');
console.log('[Extension] Protocol version:', PROTOCOL_VERSION);
console.log('[Extension] Supported features:', SUPPORTED_FEATURES);

