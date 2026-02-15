import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validatePhoneNumber, validateVisitorForm, isEmpty } from '../validation';
import { VisitorFormData } from '../../types';

// **Feature: innovation-landing-page, Property 2: Empty field validation rejection**
describe('Property: Empty field validation rejection', () => {
  it('should reject any form with empty required fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          nama: fc.oneof(fc.constant(''), fc.string().filter(s => s.trim() === '')),
          instansi: fc.string(),
          jabatan: fc.string(),
          noHandphone: fc.string(),
        }),
        (formData) => {
          const result = validateVisitorForm(formData as VisitorFormData);
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          expect(result.errors.some(e => e.field === 'nama')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject form when instansi is empty', () => {
    fc.assert(
      fc.property(
        fc.record({
          nama: fc.string({ minLength: 2 }),
          instansi: fc.oneof(fc.constant(''), fc.string().filter(s => s.trim() === '')),
          jabatan: fc.string({ minLength: 1 }),
          noHandphone: fc.constant('081234567890'),
        }),
        (formData) => {
          const result = validateVisitorForm(formData as VisitorFormData);
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.field === 'instansi')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject form when jabatan is empty', () => {
    fc.assert(
      fc.property(
        fc.record({
          nama: fc.string({ minLength: 2 }),
          instansi: fc.string({ minLength: 1 }),
          jabatan: fc.oneof(fc.constant(''), fc.string().filter(s => s.trim() === '')),
          noHandphone: fc.constant('081234567890'),
        }),
        (formData) => {
          const result = validateVisitorForm(formData as VisitorFormData);
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.field === 'jabatan')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject form when noHandphone is empty', () => {
    fc.assert(
      fc.property(
        fc.record({
          nama: fc.string({ minLength: 2 }),
          instansi: fc.string({ minLength: 1 }),
          jabatan: fc.string({ minLength: 1 }),
          noHandphone: fc.oneof(fc.constant(''), fc.string().filter(s => s.trim() === '')),
        }),
        (formData) => {
          const result = validateVisitorForm(formData as VisitorFormData);
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.field === 'noHandphone')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: innovation-landing-page, Property 3: Phone number format validation**
describe('Property: Phone number format validation', () => {
  it('should accept valid Indonesian phone numbers', () => {
    const validNumbers = [
      '081234567890',
      '082123456789',
      '085987654321',
      '+6281234567890',
      '+6282123456789',
      '6281234567890',
      '6282123456789',
      '0811234567',
      '08112345678',
      '081123456789',
      '0811234567890',
      '08112345678901',
    ];

    validNumbers.forEach(number => {
      expect(validatePhoneNumber(number)).toBe(true);
    });
  });

  it('should reject invalid Indonesian phone numbers', () => {
    const invalidNumbers = [
      '12345',
      '08123',
      '081234567',
      '0812345678901234',
      'abcdefghijk',
      '+1234567890',
      '1234567890',
      '',
      '   ',
    ];

    invalidNumbers.forEach(number => {
      expect(validatePhoneNumber(number)).toBe(false);
    });
  });

  it('should validate phone numbers with various formats', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Valid formats
          fc.tuple(
            fc.constantFrom('+62', '62', '0'),
            fc.integer({ min: 8, max: 9 }).map(String),
            fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 8, maxLength: 11 })
              .map(arr => arr.join(''))
          ).map(([prefix, first, rest]) => prefix + first + rest),
          // Invalid formats
          fc.string().filter(s => !/^(\+62|62|0)[0-9]{9,12}$/.test(s))
        ),
        (phoneNumber) => {
          const isValid = validatePhoneNumber(phoneNumber);
          const matchesPattern = /^(\+62|62|0)[0-9]{9,12}$/.test(phoneNumber.replace(/[\s-]/g, ''));
          expect(isValid).toBe(matchesPattern);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('isEmpty utility', () => {
  it('should correctly identify empty strings', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (str) => {
          const result = isEmpty(str);
          const expected = !str || str.trim() === '';
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Valid form submission', () => {
  it('should accept valid visitor data', () => {
    fc.assert(
      fc.property(
        fc.record({
          nama: fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length >= 2),
          instansi: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length >= 1),
          jabatan: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length >= 1),
          noHandphone: fc.constantFrom(
            '081234567890',
            '082123456789',
            '+6281234567890',
            '6281234567890'
          ),
        }),
        (formData) => {
          const result = validateVisitorForm(formData as VisitorFormData);
          expect(result.isValid).toBe(true);
          expect(result.errors.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
