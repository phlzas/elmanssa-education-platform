/**
 * XSS Sanitization Utilities
 *
 * These utilities prevent XSS attacks by escaping HTML entities
 * before displaying user-provided or API-generated content.
 */

/**
 * Escape HTML entities in a string to prevent XSS attacks.
 * Converts &, <, >, ", and ' to their HTML entity equivalents.
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'\/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitize an error message from the API before displaying it in the UI.
 * This prevents XSS via malicious API error messages.
 */
export function sanitizeErrorMessage(message: unknown): string {
  if (typeof message !== 'string') {
    return 'An error occurred';
  }

  // Trim the message
  let sanitized = message.trim();

  // Escape HTML entities
  sanitized = escapeHtml(sanitized);

  // Limit length to prevent abuse
  const MAX_LENGTH = 500;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH) + '...';
  }

  return sanitized;
}

/**
 * General-purpose HTML sanitization for user content.
 * Use this when displaying any user-provided content in the UI.
 */
export function sanitizeHtml(content: unknown): string {
  if (typeof content !== 'string') {
    return '';
  }

  return escapeHtml(content);
}

/**
 * Sanitize a string for use in HTML attributes.
 * This is stricter than general HTML sanitization.
 */
export function sanitizeAttribute(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  // Remove newlines and escape HTML
  return escapeHtml(value.replace(/[\n\r]/g, ''));
}

/**
 * Check if a string contains potentially dangerous HTML/script content.
 * Useful for validation before processing user input.
 */
export function containsDangerousContent(text: unknown): boolean {
  if (typeof text !== 'string') {
    return false;
  }

  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onerror, etc.
  ];

  return dangerousPatterns.some((pattern) => pattern.test(text));
}
