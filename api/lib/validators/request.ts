/**
 * Request validation utilities
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: any;
}

/**
 * UUID validation regex (RFC 4122 compliant)
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate UUID format
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export function validateUUID(value: string, fieldName: string): ValidationResult {
  if (!value || typeof value !== 'string') {
    return {
      valid: false,
      errors: [`${fieldName} harus berupa string`]
    };
  }
  
  if (!UUID_REGEX.test(value)) {
    return {
      valid: false,
      errors: [`${fieldName} harus berupa UUID yang valid`]
    };
  }
  
  return {
    valid: true,
    errors: []
  };
}

/**
 * Validate required fields
 * @param data - Data object to validate
 * @param fields - Array of required field names
 * @returns Validation result
 */
export function validateRequired(data: any, fields: string[]): ValidationResult {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Data harus berupa object']
    };
  }
  
  for (const field of fields) {
    const value = data[field];
    // Field dianggap kosong jika undefined, null, atau string kosong setelah trim
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`Field ${field} wajib diisi`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate enum value
 * @param value - Value to validate
 * @param allowed - Array of allowed values
 * @param fieldName - Field name for error message
 * @param defaultValue - Default value if invalid (optional)
 * @returns Validation result with sanitized value
 */
export function validateEnum(
  value: string,
  allowed: string[],
  fieldName: string,
  defaultValue?: string
): ValidationResult {
  if (!value || typeof value !== 'string') {
    if (defaultValue) {
      return {
        valid: true,
        errors: [],
        sanitized: defaultValue
      };
    }
    return {
      valid: false,
      errors: [`${fieldName} harus berupa string`]
    };
  }
  
  if (!allowed.includes(value)) {
    if (defaultValue) {
      return {
        valid: true,
        errors: [],
        sanitized: defaultValue
      };
    }
    return {
      valid: false,
      errors: [`${fieldName} harus salah satu dari: ${allowed.join(', ')}`]
    };
  }
  
  return {
    valid: true,
    errors: [],
    sanitized: value
  };
}

/**
 * Sanitize optional fields (convert empty strings to null)
 * @param data - Data object
 * @param fields - Array of optional field names
 * @returns Sanitized data object
 */
export function sanitizeOptionalFields(data: any, fields: string[]): any {
  const sanitized = { ...data };
  
  for (const field of fields) {
    const value = sanitized[field];
    if (value === '' || value === undefined) {
      sanitized[field] = null;
    }
  }
  
  return sanitized;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Indonesian)
 * @param phone - Phone number to validate
 * @returns true if valid phone format
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Indonesian phone: starts with 0 or +62, followed by 8-15 digits
  const phoneRegex = /^(\+62|62|0)[0-9]{8,15}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate score value (1-4 range for IKM)
 * @param score - Score value to validate
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export function validateScore(score: any, fieldName: string): ValidationResult {
  if (score === null || score === undefined || score === '') {
    // Score is optional
    return {
      valid: true,
      errors: [],
      sanitized: null
    };
  }
  
  const numScore = typeof score === 'number' ? score : parseInt(score as string);
  
  if (isNaN(numScore)) {
    return {
      valid: false,
      errors: [`${fieldName} harus berupa angka`]
    };
  }
  
  if (numScore < 1 || numScore > 4) {
    return {
      valid: false,
      errors: [`${fieldName} harus antara 1-4`]
    };
  }
  
  return {
    valid: true,
    errors: [],
    sanitized: numScore
  };
}

/**
 * Validate survey data
 * @param data - Survey data to validate
 * @returns Validation result
 */
export function validateSurveyData(data: any): ValidationResult {
  const errors: string[] = [];
  
  // Validate required field: service_type
  if (!data.service_type || data.service_type === '') {
    errors.push('Jenis layanan (service_type) wajib diisi');
  }
  
  // Validate email if provided
  if (data.visitor_email && !validateEmail(data.visitor_email)) {
    errors.push('Format email tidak valid');
  }
  
  // Validate phone if provided
  if (data.visitor_phone && !validatePhone(data.visitor_phone)) {
    errors.push('Format nomor telepon tidak valid');
  }
  
  // Validate scores (u1_score to u11_score)
  for (let i = 1; i <= 11; i++) {
    const scoreField = `u${i}_score`;
    if (data[scoreField] !== null && data[scoreField] !== undefined && data[scoreField] !== '') {
      const scoreValidation = validateScore(data[scoreField], `Skor pertanyaan ${i}`);
      if (!scoreValidation.valid) {
        errors.push(...scoreValidation.errors);
      }
    }
  }
  
  // Validate overall_score if provided
  if (data.overall_score !== null && data.overall_score !== undefined && data.overall_score !== '') {
    const overallValidation = validateScore(data.overall_score, 'Skor keseluruhan');
    if (!overallValidation.valid) {
      errors.push(...overallValidation.errors);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate internal ticket data
 * @param data - Internal ticket data to validate
 * @returns Validation result
 */
export function validateInternalTicketData(data: any): ValidationResult {
  const errors: string[] = [];
  
  // Validate required fields
  const requiredValidation = validateRequired(data, ['title', 'description', 'unit_id']);
  if (!requiredValidation.valid) {
    errors.push(...requiredValidation.errors);
  }
  
  // Validate unit_id format (must be UUID)
  if (data.unit_id) {
    const uuidValidation = validateUUID(data.unit_id, 'Unit ID');
    if (!uuidValidation.valid) {
      errors.push(...uuidValidation.errors);
    }
  }
  
  // Validate priority enum
  if (data.priority) {
    const priorityValidation = validateEnum(
      data.priority,
      ['low', 'medium', 'high', 'critical'],
      'Priority',
      'medium'
    );
    if (!priorityValidation.valid) {
      errors.push(...priorityValidation.errors);
    }
  }
  
  // Validate email if provided (dan tidak kosong)
  if (data.reporter_email && data.reporter_email.trim() !== '' && !validateEmail(data.reporter_email)) {
    errors.push('Format email tidak valid');
  }
  
  // Validate phone if provided (dan tidak kosong)
  if (data.reporter_phone && data.reporter_phone.trim() !== '' && !validatePhone(data.reporter_phone)) {
    errors.push('Format nomor telepon tidak valid');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
