import DOMPurify from 'dompurify';

/**
 * Security utilities for input sanitization and validation
 */

// Configure DOMPurify for safe HTML sanitization
const configureDOMPurify = () => {
  DOMPurify.addHook('beforeSanitizeElements', (node) => {
    // Remove all script tags and event handlers
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.tagName === 'SCRIPT') {
        element.remove();
      }
    }
  });
};

configureDOMPurify();

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed for form inputs
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content, remove tags
  });
};

/**
 * Sanitize form input data
 */
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeHtml(value.trim()) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate phone number format (Indian format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate input length and content
 */
export const validateInput = (
  value: string, 
  minLength: number = 1, 
  maxLength: number = 255
): { isValid: boolean; error?: string } => {
  if (!value || value.trim().length < minLength) {
    return { isValid: false, error: `Minimum ${minLength} characters required` };
  }
  
  if (value.length > maxLength) {
    return { isValid: false, error: `Maximum ${maxLength} characters allowed` };
  }
  
  // Check for potential XSS patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(value)) {
      return { isValid: false, error: 'Invalid characters detected' };
    }
  }
  
  return { isValid: true };
};

/**
 * Rate limiting tracker for client-side
 */
export const rateLimitTracker = {
  attempts: new Map<string, { count: number; lastAttempt: number }>(),
  
  canAttempt(key: string, maxAttempts: number = 8, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key);
    
    if (!attempts) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Reset if window has passed
    if (now - attempts.lastAttempt > windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    if (attempts.count >= maxAttempts) {
      return false;
    }
    
    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  },
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
};