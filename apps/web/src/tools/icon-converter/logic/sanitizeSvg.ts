// SVG sanitization utilities

export interface SanitizeError {
  message: string;
  blockedElements?: string[];
}

export type SanitizeResult =
  | { success: true; sanitized: string }
  | { success: false; error: SanitizeError };

/**
 * List of potentially dangerous SVG elements
 */
const DANGEROUS_ELEMENTS = [
  'script',
  'object',
  'embed',
  'iframe',
  'frame',
  'frameset',
  'foreignObject',
];

/**
 * List of dangerous attributes that can execute JavaScript
 */
const DANGEROUS_ATTRIBUTES = [
  'onload',
  'onerror',
  'onclick',
  'onmouseover',
  'onmouseout',
  'onmousemove',
  'onmousedown',
  'onmouseup',
  'onfocus',
  'onblur',
  'onchange',
  'onsubmit',
];

/**
 * Check if SVG contains external references (href, xlink:href)
 */
function hasExternalReferences(svgText: string): boolean {
  // Check for http:// or https:// in href attributes
  const externalLinkPattern = /(xlink:)?href\s*=\s*["'](https?:\/\/)/i;
  return externalLinkPattern.test(svgText);
}

/**
 * Sanitize SVG by removing dangerous elements and attributes
 * Note: This is a basic sanitization. For production use, consider using DOMPurify.
 */
export function sanitizeSvg(svgText: string): SanitizeResult {
  const blockedElements: string[] = [];

  // Check for external references
  if (hasExternalReferences(svgText)) {
    return {
      success: false,
      error: {
        message: 'SVG contains external resources (blocked for security)',
        blockedElements: ['external references'],
      },
    };
  }

  // Parse SVG as DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');

  // Check for parse errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    return {
      success: false,
      error: {
        message: 'Invalid SVG syntax',
      },
    };
  }

  // Remove dangerous elements
  DANGEROUS_ELEMENTS.forEach((tagName) => {
    const elements = doc.querySelectorAll(tagName);
    if (elements.length > 0) {
      blockedElements.push(tagName);
      elements.forEach((el) => el.remove());
    }
  });

  // Remove dangerous attributes from all elements
  const allElements = doc.querySelectorAll('*');
  allElements.forEach((el) => {
    DANGEROUS_ATTRIBUTES.forEach((attr) => {
      if (el.hasAttribute(attr)) {
        el.removeAttribute(attr);
      }
    });

    // Also check for javascript: protocol in any attribute
    Array.from(el.attributes).forEach((attr) => {
      if (attr.value.toLowerCase().includes('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  // Serialize back to string
  const serializer = new XMLSerializer();
  const sanitized = serializer.serializeToString(doc.documentElement);

  // If we blocked any elements, return warning
  if (blockedElements.length > 0) {
    // For now, we still return success but could return warning
    // In the future, we might want to add a "warning" result type
  }

  return {
    success: true,
    sanitized,
  };
}

/**
 * Validate and sanitize SVG file
 */
export async function validateAndSanitizeSvg(
  file: File
): Promise<SanitizeResult> {
  try {
    const text = await file.text();
    return sanitizeSvg(text);
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to read SVG file',
      },
    };
  }
}

