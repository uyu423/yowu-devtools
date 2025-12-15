/**
 * API Tester - Shared Types for WebApp ↔ Extension Communication
 */

// =============================================================================
// Request/Response Types
// =============================================================================

/**
 * HTTP Body specification for requests
 */
export type RequestBody =
  | { kind: 'none' }
  | { kind: 'text'; text: string }
  | { kind: 'json'; text: string }
  | { kind: 'urlencoded'; items: Array<{ key: string; value: string }> }
  | {
      kind: 'multipart';
      items: Array<{
        key: string;
        type: 'text' | 'file';
        textValue?: string;
        fileData?: string; // Base64 encoded
        fileName?: string;
        mimeType?: string;
      }>;
    };

/**
 * Request specification sent to Extension
 */
export interface RequestSpec {
  id: string; // UUID for request identification
  method: string; // HTTP method
  url: string; // Full URL with query params
  headers: Array<{
    key: string;
    value: string;
    enabled: boolean;
  }>;
  body: RequestBody;
  options: {
    timeoutMs: number;
    redirect: 'follow' | 'manual';
    credentials: 'omit' | 'include';
  };
}

/**
 * Response specification returned from Extension
 */
export interface ResponseSpec {
  id: string; // Matches request ID
  ok: boolean; // response.ok
  status?: number; // HTTP status code
  statusText?: string; // HTTP status text
  headers?: Record<string, string>; // Response headers
  body?: {
    kind: 'text' | 'base64';
    data: string;
  };
  timingMs?: number; // Duration in milliseconds
  error?: {
    code: string; // Error code
    message: string; // Error message
  };
}

// =============================================================================
// Message Types (WebApp ↔ Extension)
// =============================================================================

/**
 * Base message interface with version field for extensibility
 */
export interface BaseMessage {
  version: string; // Protocol version (e.g., '1.0.0')
}

/**
 * Messages sent from WebApp to Extension
 */
export type WebAppMessage = BaseMessage &
  (
    | { type: 'PING' }
    | { type: 'HANDSHAKE' }
    | { type: 'EXECUTE_REQUEST'; payload: RequestSpec }
    | { type: 'CHECK_PERMISSION'; payload: { origin: string } }
    | { type: 'REQUEST_PERMISSION'; payload: { origin: string } }
    | { type: 'GET_GRANTED_ORIGINS' }
    | { type: 'REVOKE_PERMISSION'; payload: { origin: string } }
  );

/**
 * Response sent from Extension to WebApp
 */
export type ExtensionResponse =
  | { type: 'PONG'; version: string }
  | {
      type: 'HANDSHAKE_ACK';
      version: string;
      features: string[];
      extensionId: string;
    }
  | { type: 'RESPONSE'; payload: ResponseSpec }
  | { type: 'PERMISSION_STATUS'; payload: { granted: boolean; origin: string } }
  | { type: 'GRANTED_ORIGINS'; payload: { origins: string[] } }
  | { type: 'PERMISSION_REVOKED'; payload: { origin: string; success: boolean } }
  | { type: 'ERROR'; error: { code: string; message: string } };

// =============================================================================
// Constants
// =============================================================================

/**
 * Current protocol version
 */
export const PROTOCOL_VERSION = '1.0.0';

/**
 * Supported features
 */
export const SUPPORTED_FEATURES = [
  'EXECUTE_REQUEST',
  'PERMISSION_MANAGEMENT',
] as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  UNKNOWN_MESSAGE_TYPE: 'UNKNOWN_MESSAGE_TYPE',
  INVALID_MESSAGE: 'INVALID_MESSAGE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PERMISSION_REQUEST_FAILED: 'PERMISSION_REQUEST_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_URL: 'INVALID_URL',
  FORBIDDEN_HEADER: 'FORBIDDEN_HEADER',
  ORIGIN_NOT_ALLOWED: 'ORIGIN_NOT_ALLOWED',
} as const;

/**
 * HTTP methods supported
 */
export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

/**
 * Headers that are forbidden to be set by the extension
 */
export const FORBIDDEN_HEADERS = [
  'Host',
  'Content-Length',
  'Transfer-Encoding',
  'Connection',
  'Upgrade',
  'Keep-Alive',
] as const;

// =============================================================================
// Allowed Origins for externally_connectable
// =============================================================================

/**
 * Origins that are allowed to communicate with the extension
 */
export const ALLOWED_ORIGINS = [
  'https://tools.yowu.dev',
  'http://localhost:5173',
] as const;

