/**
 * Shared types for yowu-devtools
 *
 * This module contains types shared between the web app and Chrome extension.
 * For v1.4.0, this will include API Tester related types (RequestSpec, ResponseSpec, etc.)
 */

// Protocol version for WebApp <-> Extension communication
export const PROTOCOL_VERSION = '1.0';

// Base message interface for all messages
export interface BaseMessage {
  version: string;
  type: string;
  id: string;
  timestamp: number;
}

// Placeholder - API Tester types will be added in Phase 2/3
export interface ApiTesterPlaceholder {
  _placeholder: true;
}

