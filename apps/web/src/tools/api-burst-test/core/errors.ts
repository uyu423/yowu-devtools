/**
 * Error classification utilities for API Burst Test
 * 
 * Classifies errors into categories: timeout, CORS, network, aborted, http4xx, http5xx
 */

import type { ErrorBreakdown } from '../types';

/**
 * Error types that can occur during HTTP requests
 */
export type BurstErrorType = keyof ErrorBreakdown;

/**
 * Result of error classification
 */
export interface ClassifiedError {
  type: BurstErrorType;
  message: string;
  originalError?: Error;
}

/**
 * Classify an error that occurred during a fetch request
 */
export function classifyError(
  error: unknown,
  wasAborted: boolean = false
): ClassifiedError {
  // Check if explicitly aborted
  if (wasAborted) {
    return {
      type: 'aborted',
      message: 'Request was aborted',
      originalError: error instanceof Error ? error : undefined,
    };
  }
  
  // Handle DOMException (abort, timeout)
  if (error instanceof DOMException) {
    if (error.name === 'AbortError') {
      return {
        type: 'aborted',
        message: 'Request was aborted',
        originalError: error,
      };
    }
    if (error.name === 'TimeoutError') {
      return {
        type: 'timeout',
        message: 'Request timed out',
        originalError: error,
      };
    }
  }
  
  // Handle TypeError (often CORS or network errors)
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    
    // CORS error detection
    // Note: Browsers intentionally hide CORS details for security
    // These patterns may vary by browser
    if (
      message.includes('cors') ||
      message.includes('cross-origin') ||
      message.includes('access-control') ||
      message.includes('failed to fetch') ||
      message.includes('networkerror when attempting to fetch resource')
    ) {
      // "Failed to fetch" can be either CORS or network error
      // We'll default to CORS as it's more common in browser testing
      return {
        type: 'cors',
        message: 'CORS policy blocked the request',
        originalError: error,
      };
    }
    
    // Network error
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('dns') ||
      message.includes('unreachable') ||
      message.includes('refused')
    ) {
      return {
        type: 'network',
        message: 'Network error occurred',
        originalError: error,
      };
    }
    
    // Default TypeError to CORS (most common case in browsers)
    return {
      type: 'cors',
      message: error.message || 'Request failed (likely CORS)',
      originalError: error,
    };
  }
  
  // Handle standard Error
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) {
      return {
        type: 'timeout',
        message: error.message,
        originalError: error,
      };
    }
    
    if (message.includes('abort')) {
      return {
        type: 'aborted',
        message: error.message,
        originalError: error,
      };
    }
    
    return {
      type: 'network',
      message: error.message,
      originalError: error,
    };
  }
  
  // Unknown error
  return {
    type: 'network',
    message: String(error),
  };
}

/**
 * Classify HTTP status code into error category
 */
export function classifyHttpStatus(status: number): BurstErrorType | null {
  if (status >= 400 && status < 500) {
    return 'http4xx';
  }
  if (status >= 500) {
    return 'http5xx';
  }
  return null;
}

/**
 * Create an empty error breakdown object
 */
export function createEmptyErrorBreakdown(): ErrorBreakdown {
  return {
    timeout: 0,
    cors: 0,
    network: 0,
    aborted: 0,
    http4xx: 0,
    http5xx: 0,
  };
}

/**
 * Increment error count in breakdown
 */
export function incrementErrorCount(
  breakdown: ErrorBreakdown,
  errorType: BurstErrorType
): ErrorBreakdown {
  return {
    ...breakdown,
    [errorType]: breakdown[errorType] + 1,
  };
}

/**
 * Calculate total errors from breakdown
 */
export function getTotalErrors(breakdown: ErrorBreakdown): number {
  return (
    breakdown.timeout +
    breakdown.cors +
    breakdown.network +
    breakdown.aborted +
    breakdown.http4xx +
    breakdown.http5xx
  );
}

/**
 * Get error rate as percentage
 */
export function getErrorRate(breakdown: ErrorBreakdown, totalRequests: number): number {
  if (totalRequests <= 0) return 0;
  return (getTotalErrors(breakdown) / totalRequests) * 100;
}

/**
 * Get human-readable error message for display
 */
export function getErrorDisplayMessage(errorType: BurstErrorType): string {
  switch (errorType) {
    case 'timeout':
      return 'Request timed out';
    case 'cors':
      return 'Blocked by CORS policy';
    case 'network':
      return 'Network error';
    case 'aborted':
      return 'Request aborted';
    case 'http4xx':
      return 'Client error (4xx)';
    case 'http5xx':
      return 'Server error (5xx)';
    default:
      return 'Unknown error';
  }
}

/**
 * Check if an error is likely due to CORS
 * This is a heuristic since browsers hide CORS details
 */
export function isLikelyCorsError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('cors') ||
      message.includes('cross-origin') ||
      message.includes('networkerror when attempting to fetch')
    );
  }
  return false;
}

