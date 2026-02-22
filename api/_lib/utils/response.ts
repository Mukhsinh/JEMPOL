/**
 * Standard error response interface
 */
export interface ErrorResponse {
  success: false;
  error: string;
  error_code?: string;
  details?: string;
  field_errors?: Record<string, string>;
  timestamp: string;
  endpoint: string;
}

/**
 * Standard success response interface
 */
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  timestamp: string;
}

/**
 * Supabase error code to user-friendly message mapping
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  '23503': 'Data referensi tidak valid (unit atau kategori tidak ditemukan)',
  '23505': 'Data sudah ada (duplikat)',
  '23514': 'Nilai tidak valid untuk field ini',
  '23502': 'Field wajib tidak boleh kosong',
  '22P02': 'Format data tidak valid (UUID atau tipe data salah)',
  '42703': 'Kolom database tidak ditemukan (bug sistem)',
  'PGRST116': 'Data tidak ditemukan',
  '42P01': 'Tabel tidak ditemukan (bug sistem)',
  '42501': 'Akses ditolak (permission error)'
};

/**
 * Build error response with consistent format
 * @param error - Error object (can be Supabase error or generic Error)
 * @param endpoint - API endpoint path
 * @param context - Additional context for debugging
 * @returns Formatted error response
 */
export function buildErrorResponse(
  error: any,
  endpoint: string,
  context?: any
): ErrorResponse {
  const errorCode = error?.code || error?.error_code;
  const errorMessage = error?.message || error?.error || 'Terjadi kesalahan yang tidak diketahui';
  
  // Map Supabase error code to user-friendly message
  let userFriendlyMessage = errorMessage;
  if (errorCode && ERROR_CODE_MESSAGES[errorCode]) {
    userFriendlyMessage = ERROR_CODE_MESSAGES[errorCode];
  }
  
  const response: ErrorResponse = {
    success: false,
    error: userFriendlyMessage,
    timestamp: new Date().toISOString(),
    endpoint
  };
  
  // Add error code if available
  if (errorCode) {
    response.error_code = errorCode;
  }
  
  // Add details if available (for debugging)
  if (error?.details || error?.hint) {
    response.details = error.details || error.hint;
  }
  
  // Add field errors if available (for validation errors)
  if (context?.fieldErrors) {
    response.field_errors = context.fieldErrors;
  }
  
  return response;
}

/**
 * Build success response with consistent format
 * @param data - Response data
 * @param message - Optional success message
 * @returns Formatted success response
 */
export function buildSuccessResponse<T = any>(
  data?: T,
  message?: string
): SuccessResponse<T> {
  const response: SuccessResponse<T> = {
    success: true,
    timestamp: new Date().toISOString()
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * Build validation error response
 * @param fieldErrors - Object with field names as keys and error messages as values
 * @param endpoint - API endpoint path
 * @returns Formatted validation error response
 */
export function buildValidationErrorResponse(
  fieldErrors: Record<string, string>,
  endpoint: string
): ErrorResponse {
  return {
    success: false,
    error: 'Validasi data gagal',
    field_errors: fieldErrors,
    timestamp: new Date().toISOString(),
    endpoint
  };
}

/**
 * Build configuration error response (for missing env vars)
 * @param endpoint - API endpoint path
 * @returns Formatted configuration error response
 */
export function buildConfigErrorResponse(endpoint: string): ErrorResponse {
  return {
    success: false,
    error: 'Konfigurasi server tidak lengkap',
    details: 'Supabase credentials tidak dikonfigurasi. Hubungi administrator.',
    timestamp: new Date().toISOString(),
    endpoint
  };
}

/**
 * Get HTTP status code based on error type
 * @param error - Error object
 * @returns Appropriate HTTP status code
 */
export function getErrorStatusCode(error: any): number {
  const errorCode = error?.code || error?.error_code;
  
  // Validation errors
  if (errorCode === '23502' || errorCode === '22P02' || errorCode === '23514') {
    return 400;
  }
  
  // Foreign key constraint violation
  if (errorCode === '23503') {
    return 400;
  }
  
  // Unique constraint violation
  if (errorCode === '23505') {
    return 409;
  }
  
  // Not found
  if (errorCode === 'PGRST116') {
    return 404;
  }
  
  // Permission denied
  if (errorCode === '42501') {
    return 403;
  }
  
  // Default to 500 for unknown errors
  return 500;
}
