/**
 * Detect if pasted text is a cURL command
 */

/**
 * Check if text is a cURL command
 * - Starts with "curl " (after trim)
 * - Or first token is "curl" (with newlines)
 */
export function isCurlCommand(text: string): boolean {
  const trimmed = text.trimStart();
  
  // Check if it starts with "curl "
  if (trimmed.startsWith('curl ')) {
    return true;
  }
  
  // Check if first token is "curl" (with newlines)
  const lines = trimmed.split(/\r?\n/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('curl ')) {
      return true;
    }
    if (trimmedLine === 'curl') {
      return true;
    }
    // Stop at first non-empty line
    if (trimmedLine) {
      break;
    }
  }
  
  return false;
}

