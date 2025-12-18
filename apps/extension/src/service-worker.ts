/**
 * Yowu DevTools Companion - Service Worker
 *
 * This service worker handles messages from the WebApp (tools.yowu.dev)
 * and executes cross-origin requests on behalf of the user.
 *
 * Design Principles:
 * - Event-driven: Only activates when messages are received
 * - Stateless: Permissions managed via chrome.permissions API
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
// Cookie Management
// =============================================================================
// Note: In Manifest V3, blocking webRequest listeners are only available for
// Enterprise Policy-installed extensions. For regular extensions, we use
// credentials: 'include' in fetch() which automatically includes cookies
// for domains the user has granted host permissions to.

// =============================================================================
// Origin Validation
// =============================================================================

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
}

// =============================================================================
// Dynamic Rule Management
// =============================================================================

/**
 * Generate a unique rule ID from a domain string.
 * Uses a simple hash function to convert domain to a positive integer.
 * Rule IDs start from 1000 to avoid conflicts with any static rules.
 */
function getDomainRuleId(domain: string): number {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    const char = domain.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Ensure positive number and add offset to avoid conflicts
  return Math.abs(hash) % 100000 + 1000;
}

/**
 * Add dynamic rule to modify headers for a specific domain.
 * This rule only applies to requests targeting the specified domain.
 */
async function addDynamicRuleForDomain(origin: string): Promise<void> {
  try {
    const url = new URL(origin);
    const domain = url.hostname;
    const ruleId = getDomainRuleId(domain);

    console.log('[Extension] Adding dynamic rule for domain:', domain, 'ruleId:', ruleId);

    // Remove existing rule with same ID first (if any)
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId],
      addRules: [
        {
          id: ruleId,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            requestHeaders: [
              { header: 'origin', operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE },
              { header: 'sec-fetch-site', operation: chrome.declarativeNetRequest.HeaderOperation.SET, value: 'none' },
              { header: 'sec-fetch-mode', operation: chrome.declarativeNetRequest.HeaderOperation.SET, value: 'cors' },
            ],
          },
          condition: {
            requestDomains: [domain],
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
              chrome.declarativeNetRequest.ResourceType.OTHER,
            ],
          },
        },
      ],
    });

    console.log('[Extension] Dynamic rule added successfully for:', domain);
  } catch (err) {
    console.error('[Extension] Failed to add dynamic rule:', err);
  }
}

/**
 * Remove dynamic rule for a specific domain.
 */
async function removeDynamicRuleForDomain(origin: string): Promise<void> {
  try {
    const url = new URL(origin);
    const domain = url.hostname;
    const ruleId = getDomainRuleId(domain);

    console.log('[Extension] Removing dynamic rule for domain:', domain, 'ruleId:', ruleId);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId],
    });

    console.log('[Extension] Dynamic rule removed successfully for:', domain);
  } catch (err) {
    console.error('[Extension] Failed to remove dynamic rule:', err);
  }
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
    
    const granted = await chrome.permissions.request({
      origins: patterns,
    });

    // If permission granted, add dynamic rule for CORS bypass
    if (granted) {
      await addDynamicRuleForDomain(origin);
    }

    return granted;
  } catch (err) {
    console.error('[Extension] Permission request failed:', err);
    return false;
  }
}

async function revokePermission(origin: string): Promise<boolean> {
  try {
    const pattern = `${origin}/*`;
    const revoked = await chrome.permissions.remove({
      origins: [pattern],
    });

    // If permission revoked, remove dynamic rule
    if (revoked) {
      await removeDynamicRuleForDomain(origin);
    }

    return revoked;
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
// Request Executor
// =============================================================================

function filterForbiddenHeaders(
  headers: Array<{ key: string; value: string; enabled: boolean }>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const h of headers) {
    // Skip disabled headers or headers with empty/whitespace-only keys
    if (!h.enabled || !h.key || !h.key.trim()) continue;

    const headerKey = h.key.trim();
    
    // Skip forbidden headers
    const isForbidden = FORBIDDEN_HEADERS.some(
      (forbidden) => forbidden.toLowerCase() === headerKey.toLowerCase()
    );

    if (!isForbidden) {
      result[headerKey] = h.value;
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

  // Check if includeCookies option is enabled
  // Note: Cookie header cannot be set directly in fetch() - it's a "forbidden header"
  // We use credentials: 'include' to let the browser handle cookies automatically
  const shouldIncludeCookies = spec.options.includeCookies === true;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), spec.options.timeoutMs);

  try {
    console.log('[Extension] Fetch:', method, spec.url, shouldIncludeCookies ? '(with cookies)' : '(no cookies)');
    
    const response = await fetch(spec.url, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
      redirect: spec.options.redirect,
      credentials: shouldIncludeCookies ? 'include' : spec.options.credentials,
      signal: controller.signal,
    });
    
    console.log('[Extension] Response:', response.status, response.statusText);

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('[Extension] Request failed:', errorMessage);
    
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('abort'))) {
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
        message: errorMessage,
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

/**
 * Sync dynamic rules with granted permissions on startup.
 * This ensures rules exist for all domains that have been granted permission.
 */
async function syncDynamicRulesWithPermissions(): Promise<void> {
  try {
    const origins = await getGrantedOrigins();
    console.log('[Extension] Syncing dynamic rules for granted origins:', origins);

    for (const origin of origins) {
      // Skip wildcard patterns
      if (origin.includes('*')) continue;
      
      try {
        await addDynamicRuleForDomain(origin);
      } catch (err) {
        console.error('[Extension] Failed to add rule for:', origin, err);
      }
    }

    console.log('[Extension] Dynamic rules sync completed');
  } catch (err) {
    console.error('[Extension] Failed to sync dynamic rules:', err);
  }
}

// Sync rules on startup
syncDynamicRulesWithPermissions();

console.log('[Extension] Yowu DevTools Companion v' + PROTOCOL_VERSION + ' initialized');

