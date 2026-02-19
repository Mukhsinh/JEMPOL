# Implementation Plan: Perbaikan Error Submit Tiket Internal dan Survey

## Overview

Task list ini akan mengimplementasikan perbaikan untuk error 500 yang terjadi saat submit tiket internal dan survey. Implementasi akan dilakukan secara incremental dengan fokus pada critical fixes terlebih dahulu, kemudian high priority, dan medium priority.

## Tasks

- [x] 1. Setup utility modules dan shared functions
  - Buat folder structure untuk utilities
  - Implementasi base functions yang akan digunakan oleh semua handlers
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 1.1 Buat environment configuration module
  - Buat file `api/lib/config/supabase.ts`
  - Implementasi `getSupabaseConfig()` dengan fallback logic (SUPABASE_* → VITE_SUPABASE_*)
  - Export singleton Supabase client
  - Log configuration status saat initialization
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 1.2 Buat safe header manager utility
  - Buat file `api/lib/utils/headers.ts`
  - Implementasi `setHeaderSafe()` dengan try-catch
  - Implementasi `setCORSHeaders()` untuk set semua CORS headers
  - Implementasi `setJSONHeaders()` untuk set Content-Type
  - Implementasi `ensureJSONResponse()` untuk memastikan response adalah JSON
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 1.3 Buat error response builder utility
  - Buat file `api/lib/utils/response.ts`
  - Implementasi `buildErrorResponse()` untuk format error response
  - Implementasi `buildSuccessResponse()` untuk format success response
  - Implementasi error code mapping dari Supabase ke user-friendly messages
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 1.4 Buat logger utility
  - Buat file `api/lib/utils/logger.ts`
  - Implementasi `logInfo()`, `logError()`, `logWarn()`, `logDebug()`
  - Format log dengan emoji prefixes dan structured data
  - Limit stack trace length untuk readability
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2. Implementasi request validators
  - Buat validators untuk validasi input data sebelum database operations
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 2.1 Buat request validator module
  - Buat file `api/lib/validators/request.ts`
  - Implementasi `validateUUID()` dengan regex check
  - Implementasi `validateRequired()` untuk check required fields
  - Implementasi `validateEnum()` untuk validate enum values
  - Implementasi `sanitizeOptionalFields()` untuk convert empty to null
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [x] 2.2 Buat database validator module
  - Buat file `api/lib/validators/database.ts`
  - Implementasi `validateUnit()` untuk check unit exists dan active
  - Implementasi `validateCategory()` untuk check category exists dan active
  - Implementasi `validateQRCode()` untuk check QR code exists dan active
  - Return data jika valid untuk reuse (avoid duplicate queries)
  - _Requirements: 6.2, 7.1_

- [x] 2.3 Buat survey data validator
  - Tambahkan `validateSurveyData()` di `api/lib/validators/request.ts`
  - Validate service_type required
  - Validate score values (1-4 range)
  - Validate optional fields format (email, phone)
  - Return ValidationResult dengan errors array
  - _Requirements: 1.2, 6.1, 6.5_

- [x] 2.4 Buat internal ticket data validator
  - Tambahkan `validateInternalTicketData()` di `api/lib/validators/request.ts`
  - Validate title dan description required
  - Validate unit_id required dan UUID format
  - Validate priority enum
  - Return ValidationResult dengan errors array
  - _Requirements: 2.2, 6.1, 6.3_

- [x] 3. Perbaiki survey submission handler
  - Update `api/lib/handlers/surveys.ts` dengan fixes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3.1 Update surveys handler dengan safe header management
  - Import dan gunakan `setHeaderSafe()` di awal handler
  - Set CORS dan JSON headers sebelum semua logic
  - Wrap semua logic dalam try-catch untuk ensure JSON response
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 3.2 Update surveys handler dengan environment validation
  - Import dan gunakan `getSupabaseConfig()` dari config module
  - Check `isConfigured` sebelum process request
  - Return 500 dengan clear error jika config missing
  - Log configuration source (production/development/missing)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.3 Update surveys handler dengan request validation
  - Import dan gunakan validators dari request validator module
  - Validate survey data sebelum database operation
  - Return 400 dengan field errors jika validation gagal
  - Log validation errors dengan context
  - _Requirements: 1.2, 6.1, 6.3, 6.4, 6.5_

- [x] 3.4 Update surveys handler dengan foreign key validation
  - Import dan gunakan database validators
  - Validate unit_id jika provided (optional untuk survey)
  - Validate category_id jika provided (optional)
  - Set ke null jika invalid instead of error
  - Log validation results
  - _Requirements: 1.5, 6.2, 7.1_

- [x] 3.5 Update surveys handler dengan improved error handling
  - Import dan gunakan `buildErrorResponse()` dan `logError()`
  - Map Supabase error codes ke user-friendly messages
  - Always return JSON response (never HTML)
  - Include timestamp dan endpoint dalam error response
  - Log detailed error dengan context
  - _Requirements: 1.3, 4.1, 4.2, 4.5, 8.2, 8.3, 8.4, 8.5_

- [x] 3.6 Update surveys handler dengan success response
  - Import dan gunakan `buildSuccessResponse()`
  - Return 201 dengan survey ID dan created_at
  - Include timestamp dalam response
  - Log success dengan summary
  - _Requirements: 1.4, 8.1, 8.5_

- [x] 4. Perbaiki internal ticket submission handler
  - Update `api/lib/handlers/internal-tickets.ts` dengan fixes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.1 Update internal-tickets handler dengan safe header management
  - Import dan gunakan `setHeaderSafe()` di awal handler
  - Set CORS dan JSON headers sebelum semua logic
  - Wrap semua logic dalam try-catch untuk ensure JSON response
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 4.2 Update internal-tickets handler dengan environment validation
  - Import dan gunakan `getSupabaseConfig()` dari config module
  - Check `isConfigured` sebelum process request
  - Return 500 dengan clear error jika config missing
  - Log configuration source
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.3 Update internal-tickets handler dengan request validation
  - Import dan gunakan validators dari request validator module
  - Validate ticket data sebelum database operation
  - Validate unit_id REQUIRED (berbeda dengan survey)
  - Return 400 dengan field errors jika validation gagal
  - Log validation errors dengan context
  - _Requirements: 2.2, 6.1, 6.3, 6.4, 6.5_

- [x] 4.4 Update internal-tickets handler dengan foreign key validation
  - Import dan gunakan database validators
  - Validate unit_id MUST exist dan active (required untuk internal ticket)
  - Validate category_id jika provided (optional)
  - Set category_id ke null jika invalid
  - Return 400 jika unit_id invalid
  - Log validation results
  - _Requirements: 2.2, 2.3, 6.2, 7.1_

- [x] 4.5 Update internal-tickets handler dengan ticket number generation
  - Implementasi `generateTicketNumber()` dengan proper error handling
  - Format: INT-YYYY-NNNN
  - Query last ticket number dengan error handling
  - Ensure uniqueness dengan proper increment logic
  - Log generated ticket number
  - _Requirements: 2.4, 7.2_

- [x] 4.6 Update internal-tickets handler dengan improved error handling
  - Import dan gunakan `buildErrorResponse()` dan `logError()`
  - Map Supabase error codes ke user-friendly messages
  - Always return JSON response (never HTML)
  - Include timestamp dan endpoint dalam error response
  - Log detailed error dengan context
  - _Requirements: 4.1, 4.2, 4.5, 8.2, 8.3, 8.4, 8.5_

- [x] 4.7 Update internal-tickets handler dengan success response
  - Import dan gunakan `buildSuccessResponse()`
  - Return 201 dengan ticket_number dan ticket data
  - Include populated relations (unit name)
  - Include timestamp dalam response
  - Log success dengan ticket number
  - _Requirements: 2.4, 7.5, 8.1, 8.5_

- [x] 4.8 Update internal-tickets handler dengan QR code usage update
  - Implementasi QR code usage update sebagai non-blocking operation
  - Use async/await dengan proper error handling
  - Don't fail request jika QR update gagal (log warning only)
  - Increment usage_count dengan proper race condition handling
  - Log QR code update result
  - _Requirements: 2.5, 7.3_

- [ ] 5. Testing dan validation
  - Write tests untuk verify fixes
  - _Requirements: All_

- [ ]* 5.1 Write unit tests untuk validators
  - Test `validateUUID()` dengan valid dan invalid UUIDs
  - Test `validateRequired()` dengan missing fields
  - Test `validateEnum()` dengan valid dan invalid values
  - Test `sanitizeOptionalFields()` dengan empty strings dan null
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [ ]* 5.2 Write unit tests untuk header manager
  - Test `setHeaderSafe()` dengan headers not sent
  - Test `setHeaderSafe()` dengan headers already sent
  - Test `setCORSHeaders()` sets all required headers
  - Test `setJSONHeaders()` sets Content-Type correctly
  - _Requirements: 5.1, 5.2, 5.5_

- [ ]* 5.3 Write unit tests untuk error response builder
  - Test error mapping untuk berbagai Supabase error codes
  - Test response structure consistency
  - Test field error formatting
  - Test timestamp inclusion
  - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [ ]* 5.4 Write property test untuk survey submission
  - **Property 1: Survey Submission Success**
  - **Validates: Requirements 1.1**
  - Generate random valid survey data
  - Submit survey
  - Verify returns 201 dan data saved
  - Run 100 iterations

- [ ]* 5.5 Write property test untuk validation error response
  - **Property 2: Validation Error Response Format**
  - **Validates: Requirements 1.2, 2.2**
  - Generate random invalid data
  - Submit data
  - Verify returns 400 dengan clear error message
  - Run 100 iterations

- [ ]* 5.6 Write property test untuk optional foreign key handling
  - **Property 4: Optional Foreign Key Handling**
  - **Validates: Requirements 1.5, 2.3**
  - Generate survey dengan invalid unit_id
  - Submit survey
  - Verify saved dengan unit_id null
  - Run 100 iterations

- [ ]* 5.7 Write property test untuk internal ticket submission
  - **Property 5: Internal Ticket Submission Success**
  - **Validates: Requirements 2.1**
  - Generate random valid ticket data
  - Submit ticket
  - Verify returns 201 dan data saved
  - Run 100 iterations

- [ ]* 5.8 Write property test untuk ticket number uniqueness
  - **Property 6: Ticket Number Uniqueness**
  - **Validates: Requirements 2.4, 7.2**
  - Generate multiple tickets
  - Verify all ticket numbers are unique
  - Run 100 iterations

- [ ]* 5.9 Write property test untuk JSON response consistency
  - **Property 11: JSON Response Consistency**
  - **Validates: Requirements 4.5, 5.2, 5.3**
  - Generate various error scenarios
  - Verify all responses have Content-Type application/json
  - Verify response body is valid JSON
  - Run 100 iterations

- [ ]* 5.10 Write property test untuk CORS headers
  - **Property 12: CORS Headers Presence**
  - **Validates: Requirements 5.1, 5.2**
  - Make various API requests
  - Verify all responses include CORS headers
  - Run 100 iterations

- [ ]* 5.11 Write property test untuk UUID validation
  - **Property 14: UUID Validation Before Query**
  - **Validates: Requirements 6.1, 6.2**
  - Generate random strings (valid and invalid UUIDs)
  - Verify validation happens before database query
  - Run 100 iterations

- [ ]* 5.12 Write property test untuk enum validation
  - **Property 15: Enum Validation**
  - **Validates: Requirements 6.3, 6.4**
  - Generate random priority and source values
  - Verify valid values accepted, invalid rejected with default
  - Run 100 iterations

- [ ]* 5.13 Write property test untuk response structure
  - **Property 19 & 20: Response Structure**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**
  - Generate various success and error scenarios
  - Verify response structure matches schema
  - Verify timestamp included
  - Run 100 iterations

- [x] 6. Checkpoint - Verify all fixes working
  - Test survey submission manually dengan valid data
  - Test survey submission dengan invalid unit_id
  - Test internal ticket submission dengan valid data
  - Test internal ticket submission dengan invalid unit_id
  - Verify error responses are JSON
  - Verify CORS headers present
  - Check logs untuk proper error details
  - Ensure all tests pass

- [ ] 7. Update environment variables di Vercel
  - Login ke Vercel dashboard
  - Navigate ke project settings → Environment Variables
  - Add `SUPABASE_URL` dengan value dari .env.local
  - Add `SUPABASE_ANON_KEY` dengan value dari .env.local
  - Verify variables saved
  - Redeploy untuk apply changes
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 8. Deploy dan verify di production
  - Deploy ke Vercel
  - Test survey submission di production
  - Test internal ticket submission di production
  - Verify error responses
  - Check Vercel function logs
  - Monitor error rate
  - _Requirements: All_

## Notes

- Tasks marked dengan `*` adalah optional dan dapat di-skip untuk faster MVP
- Setiap task references specific requirements untuk traceability
- Checkpoints memastikan incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples dan edge cases
- Priority: Critical fixes (tasks 1-4) harus selesai sebelum testing
- Testing (task 5) dapat dilakukan parallel dengan implementation
- Deployment (tasks 7-8) hanya setelah semua tests pass
