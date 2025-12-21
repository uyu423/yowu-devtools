/**
 * JSON Comparison Utilities for API Response Diff
 */

import type { DifferentField, ComparisonResult, ResponseSide } from '../types';

/**
 * Deep equality check ignoring object key order
 * Arrays are compared by order
 */
export const deepEqualIgnoringKeyOrder = (a: unknown, b: unknown): boolean => {
  // Same reference or both null/undefined
  if (a === b) return true;

  // Type check
  if (typeof a !== typeof b) return false;

  // Handle null
  if (a === null || b === null) return a === b;

  // Primitives
  if (typeof a !== 'object') return a === b;

  // Arrays - order matters
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqualIgnoringKeyOrder(item, b[index]));
  }

  // One is array, other is not
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // Objects - key order doesn't matter
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  const keysA = Object.keys(objA).sort();
  const keysB = Object.keys(objB).sort();

  // Different number of keys
  if (keysA.length !== keysB.length) return false;

  // Check all keys exist and values match
  return keysA.every((key) => keysB.includes(key) && deepEqualIgnoringKeyOrder(objA[key], objB[key]));
};

/**
 * Find all fields that differ between two JSON objects
 * Returns array of paths with their values from both sides
 */
export const findDifferentFields = (
  a: unknown,
  b: unknown,
  path: string = ''
): DifferentField[] => {
  const differences: DifferentField[] = [];

  // Same value - no difference
  if (deepEqualIgnoringKeyOrder(a, b)) return differences;

  // Different types or one is null
  if (
    typeof a !== typeof b ||
    a === null ||
    b === null ||
    typeof a !== 'object' ||
    typeof b !== 'object'
  ) {
    differences.push({ path: path || '(root)', valueA: a, valueB: b });
    return differences;
  }

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;
      if (i >= a.length) {
        differences.push({ path: itemPath, valueA: undefined, valueB: b[i] });
      } else if (i >= b.length) {
        differences.push({ path: itemPath, valueA: a[i], valueB: undefined });
      } else {
        differences.push(...findDifferentFields(a[i], b[i], itemPath));
      }
    }
    return differences;
  }

  // Objects
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);

  for (const key of allKeys) {
    const keyPath = path ? `${path}.${key}` : key;
    const hasA = key in objA;
    const hasB = key in objB;

    if (!hasA) {
      differences.push({ path: keyPath, valueA: undefined, valueB: objB[key] });
    } else if (!hasB) {
      differences.push({ path: keyPath, valueA: objA[key], valueB: undefined });
    } else {
      differences.push(...findDifferentFields(objA[key], objB[key], keyPath));
    }
  }

  return differences;
};

/**
 * Compare two API responses and return comparison result
 */
export const compareResponses = (
  responseA: ResponseSide | null,
  responseB: ResponseSide | null
): ComparisonResult | null => {
  // Both responses must exist
  if (!responseA || !responseB) {
    return null;
  }

  // Status comparison
  const statusSame = responseA.status === responseB.status;

  // Body comparison (only if both are valid JSON)
  let bodySame = false;
  let differentFields: DifferentField[] = [];

  if (responseA.parsedJson !== undefined && responseB.parsedJson !== undefined) {
    bodySame = deepEqualIgnoringKeyOrder(responseA.parsedJson, responseB.parsedJson);
    if (!bodySame) {
      differentFields = findDifferentFields(responseA.parsedJson, responseB.parsedJson);
    }
  } else if (responseA.rawBody !== null && responseB.rawBody !== null) {
    // Compare raw bodies if not JSON
    bodySame = responseA.rawBody === responseB.rawBody;
    if (!bodySame) {
      differentFields = [{ path: '(raw)', valueA: responseA.rawBody, valueB: responseB.rawBody }];
    }
  }

  return {
    isSame: statusSame && bodySame,
    statusSame,
    bodySame,
    statusA: responseA.status,
    statusB: responseB.status,
    differentFields,
  };
};

/**
 * Get set of different field paths for highlighting in JSON viewer
 */
export const getDifferentFieldPaths = (differentFields: DifferentField[]): Set<string> => {
  const paths = new Set<string>();
  differentFields.forEach((field) => {
    paths.add(field.path);
  });
  return paths;
};

/**
 * Format value for display in diff table
 */
export const formatDiffValue = (value: unknown): string => {
  if (value === undefined) return '(missing)';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};
