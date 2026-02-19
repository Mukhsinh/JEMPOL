/**
 * Logger utility for structured logging with emoji prefixes
 */

/**
 * Log info message
 * @param message - Log message
 * @param data - Additional data to log
 */
export function logInfo(message: string, data?: any): void {
  console.log(`ℹ️  ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

/**
 * Log success message
 * @param message - Log message
 * @param data - Additional data to log
 */
export function logSuccess(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`✅ ${message}`, {
    ...data,
    timestamp
  });
}

/**
 * Log warning message
 * @param message - Log message
 * @param data - Additional data to log
 */
export function logWarn(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.warn(`⚠️  ${message}`, {
    ...data,
    timestamp
  });
}

/**
 * Log error with detailed information
 * @param message - Error message
 * @param error - Error object
 * @param context - Additional context for debugging
 */
export function logError(message: string, error: any, context?: any): void {
  const timestamp = new Date().toISOString();
  
  // Extract error details
  const errorDetails: any = {
    message: error?.message || 'Unknown error',
    timestamp
  };
  
  // Add error code if available (Supabase errors)
  if (error?.code) {
    errorDetails.error_code = error.code;
  }
  
  // Add error details if available
  if (error?.details) {
    errorDetails.error_details = error.details;
  }
  
  // Add error hint if available
  if (error?.hint) {
    errorDetails.error_hint = error.hint;
  }
  
  // Add stack trace (limited to first 3 lines for readability)
  if (error?.stack) {
    errorDetails.stack = error.stack.split('\n').slice(0, 3).join('\n');
  }
  
  // Add context if provided
  if (context) {
    errorDetails.context = context;
  }
  
  console.error(`❌ ${message}`, errorDetails);
}

/**
 * Log debug message (only in development)
 * @param message - Debug message
 * @param data - Additional data to log
 */
export function logDebug(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.debug(`🐛 ${message}`, {
      ...data,
      timestamp
    });
  }
}

/**
 * Log HTTP request
 * @param method - HTTP method
 * @param path - Request path
 * @param data - Additional request data
 */
export function logRequest(method: string, path: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`🎯 ${method} ${path}`, {
    method,
    path,
    ...data,
    timestamp
  });
}

/**
 * Log database operation
 * @param operation - Database operation (INSERT, UPDATE, DELETE, SELECT)
 * @param table - Table name
 * @param data - Additional operation data
 */
export function logDatabase(operation: string, table: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`💾 DB ${operation} ${table}`, {
    operation,
    table,
    ...data,
    timestamp
  });
}

/**
 * Log validation error
 * @param field - Field name that failed validation
 * @param reason - Validation failure reason
 * @param value - Value that failed validation (optional)
 */
export function logValidationError(field: string, reason: string, value?: any): void {
  const timestamp = new Date().toISOString();
  console.warn(`⚠️  Validation failed: ${field}`, {
    field,
    reason,
    value: value !== undefined ? value : 'not provided',
    timestamp
  });
}

/**
 * Log performance metric
 * @param operation - Operation name
 * @param duration - Duration in milliseconds
 * @param data - Additional data
 */
export function logPerformance(operation: string, duration: number, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`⏱️  ${operation} took ${duration}ms`, {
    operation,
    duration_ms: duration,
    ...data,
    timestamp
  });
}
