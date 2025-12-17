/**
 * cURL Parser - Tokenizer
 * 
 * Shell-like tokenizer for parsing cURL commands.
 * Supports:
 * - Single and double quotes
 * - Backslash escaping
 * - Line continuation (\ + newline)
 */

export interface Token {
  value: string;
  quoted: boolean; // true if token was quoted
  quoteType?: "'" | '"'; // type of quote used
}

/**
 * Tokenize a cURL command string.
 * Handles quotes, escapes, and line continuations.
 * 
 * @param input - The input string to tokenize
 * @returns Array of tokens
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let i = 0;

  // First, normalize line continuations
  const normalized = normalizeLineContinuations(input);

  while (i < normalized.length) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (inSingleQuote) {
      // Inside single quotes: everything is literal except the closing quote
      if (char === "'") {
        inSingleQuote = false;
        if (current.trim()) {
          tokens.push({
            value: current,
            quoted: true,
            quoteType: "'",
          });
          current = '';
        }
        i++;
        continue;
      }
      current += char;
      i++;
      continue;
    }

    if (inDoubleQuote) {
      // Inside double quotes: handle escapes and closing quote
      if (char === '\\' && nextChar !== undefined) {
        // Handle escape sequences
        if (nextChar === '"') {
          current += '"';
          i += 2;
          continue;
        }
        if (nextChar === '\\') {
          current += '\\';
          i += 2;
          continue;
        }
        // Other escapes: pass through as-is (e.g., \n, \t)
        current += char + nextChar;
        i += 2;
        continue;
      }
      if (char === '"') {
        inDoubleQuote = false;
        if (current.trim()) {
          tokens.push({
            value: current,
            quoted: true,
            quoteType: '"',
          });
          current = '';
        }
        i++;
        continue;
      }
      current += char;
      i++;
      continue;
    }

    // Outside quotes
    if (char === "'") {
      // Start single quote
      if (current.trim()) {
        tokens.push({
          value: current.trim(),
          quoted: false,
        });
        current = '';
      }
      inSingleQuote = true;
      i++;
      continue;
    }

    if (char === '"') {
      // Start double quote
      if (current.trim()) {
        tokens.push({
          value: current.trim(),
          quoted: false,
        });
        current = '';
      }
      inDoubleQuote = true;
      i++;
      continue;
    }

    if (char === '\\' && nextChar !== undefined) {
      // Handle escape sequences outside quotes
      if (nextChar === "'") {
        current += "'";
        i += 2;
        continue;
      }
      if (nextChar === '"') {
        current += '"';
        i += 2;
        continue;
      }
      if (nextChar === '\\') {
        current += '\\';
        i += 2;
        continue;
      }
      // Other escapes: pass through
      current += char + nextChar;
      i += 2;
      continue;
    }

    if (/\s/.test(char)) {
      // Whitespace: end current token
      if (current.trim()) {
        tokens.push({
          value: current.trim(),
          quoted: false,
        });
        current = '';
      }
      i++;
      continue;
    }

    // Regular character
    current += char;
    i++;
  }

  // Add remaining token
  if (current.trim()) {
    tokens.push({
      value: current.trim(),
      quoted: inSingleQuote || inDoubleQuote,
      quoteType: inSingleQuote ? "'" : inDoubleQuote ? '"' : undefined,
    });
  }

  // Filter out empty tokens
  return tokens.filter(t => t.value.length > 0);
}

/**
 * Normalize line continuations (backslash + newline).
 * Replaces `\` followed by newline with a space.
 * 
 * @param input - The input string
 * @returns Normalized string with line continuations removed
 */
export function normalizeLineContinuations(input: string): string {
  // Replace backslash followed by newline (with optional whitespace) with a space
  return input.replace(/\\\s*\r?\n\s*/g, ' ');
}

/**
 * Extract cURL command from mixed text.
 * Finds the first occurrence of "curl" and extracts the command.
 * 
 * @param input - The input string (may contain other text)
 * @returns The extracted cURL command, or null if not found
 */
export function extractCurlCommand(input: string): string | null {
  const trimmed = input.trimStart();
  
  // Check if it starts with "curl "
  if (trimmed.startsWith('curl ')) {
    return trimmed;
  }

  // Check if it starts with "curl\n" or similar
  if (trimmed.startsWith('curl\n') || trimmed.startsWith('curl\r\n')) {
    return trimmed;
  }

  // Try to find "curl" as the first token
  const lines = trimmed.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('curl ')) {
      // Found curl command, extract from this line onwards
      return lines.slice(i).join('\n');
    }
  }

  // Try tokenizing to find "curl" as first token
  const tokens = tokenize(trimmed);
  if (tokens.length > 0 && tokens[0].value === 'curl') {
    // Reconstruct from original input
    const curlIndex = trimmed.indexOf('curl');
    if (curlIndex >= 0) {
      return trimmed.slice(curlIndex);
    }
  }

  return null;
}

