import { VisitorFormData, ValidationError } from '../types';

/**
 * Validates Indonesian phone number format
 * Accepts: +62xxx, 62xxx, 0xxx with 9-12 digits total
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Validates visitor registration form
 */
export const validateVisitorForm = (data: VisitorFormData): {
  isValid: boolean;
  errors: ValidationError[];
} => {
  const errors: ValidationError[] = [];

  // Validate nama
  if (!data.nama || data.nama.trim() === '') {
    errors.push({
      field: 'nama',
      message: 'Nama harus diisi',
    });
  } else if (data.nama.trim().length < 2) {
    errors.push({
      field: 'nama',
      message: 'Nama minimal 2 karakter',
    });
  }

  // Validate instansi
  if (!data.instansi || data.instansi.trim() === '') {
    errors.push({
      field: 'instansi',
      message: 'Instansi harus diisi',
    });
  }

  // Validate jabatan
  if (!data.jabatan || data.jabatan.trim() === '') {
    errors.push({
      field: 'jabatan',
      message: 'Jabatan harus diisi',
    });
  }

  // Validate noHandphone
  if (!data.noHandphone || data.noHandphone.trim() === '') {
    errors.push({
      field: 'noHandphone',
      message: 'Nomor handphone harus diisi',
    });
  } else if (!validatePhoneNumber(data.noHandphone)) {
    errors.push({
      field: 'noHandphone',
      message: 'Format nomor handphone tidak valid (contoh: 081234567890)',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Checks if a string is empty or only whitespace
 */
export const isEmpty = (value: string): boolean => {
  return !value || value.trim() === '';
};

/**
 * Sanitizes user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
