/**
 * Helper functions for file operations
 */

/**
 * Helper function to get file extension from content type or filename
 */
export function getFileExtension(fileName?: string, mimeType?: string): string {
  if (fileName) {
    const match = fileName.match(/\.([^.]+)$/);
    if (match) return match[1];
  }

  // Map MIME types to extensions
  const mimeToExt: Record<string, string> = {
    'application/json': 'json',
    'application/x-yaml': 'yaml',
    'text/yaml': 'yaml',
    'text/x-yaml': 'yaml',
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/javascript': 'js',
  };

  if (mimeType && mimeToExt[mimeType]) {
    return mimeToExt[mimeType];
  }

  return 'txt';
}

/**
 * Helper function to get MIME type from file extension
 */
export function getMimeType(extension: string): string {
  const extToMime: Record<string, string> = {
    json: 'application/json',
    yaml: 'application/x-yaml',
    yml: 'application/x-yaml',
    txt: 'text/plain',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    diff: 'text/plain',
  };

  return extToMime[extension.toLowerCase()] || 'text/plain';
}


