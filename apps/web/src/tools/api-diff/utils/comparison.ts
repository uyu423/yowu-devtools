/**
 * API Response Diff Tool - Comparison Utilities
 */

import type { ResponseSide, DifferentField, ComparisonResult } from '../types';

/**
 * Deep equality comparison ignoring key order
 * Objects are compared by sorted keys, arrays are compared by order
 */
export function deepEqualIgnoringKeyOrder(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualIgnoringKeyOrder(a[i], b[i])) return false;
    }
    return true;
  }

  if (
    typeof a === 'object' &&
    typeof b === 'object' &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj).sort();
    const bKeys = Object.keys(bObj).sort();

    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
      if (!bKeys.includes(key)) return false;
      if (!deepEqualIgnoringKeyOrder(aObj[key], bObj[key])) return false;
    }
    return true;
  }

  return false;
}

/**
 * Find different fields between two objects recursively
 */
export function findDifferentFields(
  a: unknown,
  b: unknown,
  path: string = ''
): DifferentField[] {
  const differences: DifferentField[] = [];

  // Both null/undefined
  if (a == null && b == null) {
    return differences;
  }

  // One is null/undefined
  if (a == null || b == null) {
    differences.push({
      path: path || 'root',
      valueA: a,
      valueB: b,
    });
    return differences;
  }

  // Different types
  if (typeof a !== typeof b) {
    differences.push({
      path: path || 'root',
      valueA: a,
      valueB: b,
    });
    return differences;
  }

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i++) {
      const subPath = path ? `${path}[${i}]` : `[${i}]`;
      if (i >= a.length) {
        differences.push({
          path: subPath,
          valueA: undefined,
          valueB: b[i],
        });
      } else if (i >= b.length) {
        differences.push({
          path: subPath,
          valueA: a[i],
          valueB: undefined,
        });
      } else {
        // For primitive types, compare directly
        if (typeof a[i] !== 'object' || a[i] === null) {
          if (a[i] !== b[i]) {
            differences.push({
              path: subPath,
              valueA: a[i],
              valueB: b[i],
            });
          }
        } else {
          // For objects/arrays, recurse
          differences.push(...findDifferentFields(a[i], b[i], subPath));
        }
      }
    }
    return differences;
  }

  // Objects
  if (
    typeof a === 'object' &&
    typeof b === 'object' &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);

    for (const key of allKeys) {
      const subPath = path ? `${path}.${key}` : key;

      if (!(key in aObj)) {
        // A doesn't have this key (B only)
        differences.push({
          path: subPath,
          valueA: undefined,
          valueB: bObj[key],
        });
      } else if (!(key in bObj)) {
        // B doesn't have this key (A only)
        differences.push({
          path: subPath,
          valueA: aObj[key],
          valueB: undefined,
        });
      } else {
        // Both have the key
        const valA = aObj[key];
        const valB = bObj[key];

        // Primitive types - direct comparison
        if (
          valA === null ||
          valB === null ||
          typeof valA !== 'object' ||
          typeof valB !== 'object'
        ) {
          if (valA !== valB) {
            differences.push({
              path: subPath,
              valueA: valA,
              valueB: valB,
            });
          }
        } else {
          // Objects/arrays - recurse
          differences.push(...findDifferentFields(valA, valB, subPath));
        }
      }
    }
    return differences;
  }

  // Primitive types - different values
  if (a !== b) {
    differences.push({
      path: path || 'root',
      valueA: a,
      valueB: b,
    });
  }

  return differences;
}

/**
 * Compare two responses and return comparison result
 */
export function compareResponses(
  a: ResponseSide | null,
  b: ResponseSide | null
): ComparisonResult {
  if (!a || !b) {
    return {
      isSame: false,
      statusSame: false,
      bodySame: false,
      statusA: a?.status ?? null,
      statusB: b?.status ?? null,
      differentFields: [],
    };
  }

  const statusSame = a.status === b.status;
  const statusA = a.status;
  const statusB = b.status;

  // Compare bodies only if both are valid JSON
  let bodySame = false;
  let differentFields: DifferentField[] = [];

  if (a.parsedJson !== undefined && b.parsedJson !== undefined) {
    bodySame = deepEqualIgnoringKeyOrder(a.parsedJson, b.parsedJson);
    if (!bodySame) {
      differentFields = findDifferentFields(a.parsedJson, b.parsedJson);
    }
  }

  const isSame = statusSame && bodySame;

  return {
    isSame,
    statusSame,
    bodySame,
    statusA,
    statusB,
    differentFields,
  };
}

/**
 * Format value for display in diff table
 */
export function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return '(missing)';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

