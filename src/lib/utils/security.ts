/**
 * Security utilities for input validation and sanitization
 */

/**
 * Validates if a URL is safe and belongs to allowed domains
 */
export function isValidURL(url: string): boolean {
  try {
    const urlObject = new URL(url);
    
    // Allow only HTTPS and specific trusted domains
    if (urlObject.protocol !== 'https:') {
      return false;
    }
    
    // Whitelist of allowed domains for GitHub issues
    const allowedDomains = [
      'github.com',
      'api.github.com'
    ];
    
    return allowedDomains.includes(urlObject.hostname);
  } catch {
    return false;
  }
}

/**
 * Sanitizes user input to prevent XSS and other injection attacks
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Trim and limit length
  const trimmed = input.trim().slice(0, maxLength);
  
  // Remove potentially dangerous characters and patterns
  return trimmed
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:(?!image\/)/gi, ''); // Remove data: URIs except images
}

/**
 * Validates session ID format
 */
export function isValidSessionId(sessionId: string): boolean {
  if (typeof sessionId !== 'string') {
    return false;
  }
  
  // Session ID should be alphanumeric (including hyphens and underscores) and reasonable length
  const sessionIdRegex = /^[a-zA-Z0-9_-]{6,40}$/;
  return sessionIdRegex.test(sessionId);
}

/**
 * Validates message content
 */
export function validateMessageContent(content: string): { isValid: boolean; error?: string } {
  if (typeof content !== 'string') {
    return { isValid: false, error: 'Message content must be a string' };
  }
  
  const trimmed = content.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Message content cannot be empty' };
  }
  
  if (trimmed.length > 2000) {
    return { isValid: false, error: 'Message content is too long (max 2000 characters)' };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:(?!image\/)/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return { isValid: false, error: 'Message content contains suspicious patterns' };
    }
  }
  
  return { isValid: true };
}

/**
 * Validates feedback data structure
 */
export function validateFeedbackData(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid feedback data structure' };
  }
  
  // Required fields
  const requiredFields = ['title', 'description'];
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim().length === 0) {
      return { isValid: false, error: `Missing or invalid field: ${field}` };
    }
  }
  
  // Validate title length
  if (data.title.length > 200) {
    return { isValid: false, error: 'Title is too long (max 200 characters)' };
  }
  
  // Validate description length
  if (data.description.length > 5000) {
    return { isValid: false, error: 'Description is too long (max 5000 characters)' };
  }
  
  // Validate priority if provided
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    return { isValid: false, error: 'Invalid priority value' };
  }
  
  // Validate labels if provided
  if (data.labels && (!Array.isArray(data.labels) || data.labels.length > 10)) {
    return { isValid: false, error: 'Invalid labels format or too many labels' };
  }
  
  return { isValid: true };
}