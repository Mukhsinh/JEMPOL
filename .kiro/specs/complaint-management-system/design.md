# Design Document: Perbaikan Error Submit Tiket Internal dan Survey

## Overview

Dokumen ini menjelaskan design untuk memperbaiki error 500 yang terjadi saat submit tiket internal dan survey pada sistem KISS. Error terjadi karena beberapa masalah:

1. **Environment Variables**: Vercel serverless functions tidak mendapatkan VITE_ prefixed variables
2. **Error Handling**: Response error tidak konsisten, kadang return HTML instead of JSON
3. **Data Validation**: Validasi UUID dan foreign key tidak robust
4. **Header Management**: Headers di-set setelah response dikirim, menyebabkan error
5. **Database Operations**: Tidak ada proper error handling untuk constraint violations

Solusi akan fokus pada:
- Memperbaiki environment variable loading untuk Vercel
- Implementasi error handling yang robust dengan JSON response consistency
- Validasi data yang lebih ketat sebelum database operations
- Safe header management untuk menghindari "headers already sent" error
- Logging yang detail untuk debugging

## Architecture

### Current Architecture

```
Frontend (React)
    ↓ HTTP POST
Vercel Edge Network
    ↓ Route /api/*
Unified API Handler (api/index.ts)
    ↓ Route by path
Specific Handler (surveys.ts / internal-tickets.ts)
    ↓ Supabase Client
Supabase Database
```

### Problem Areas

1. **Environment Loading**: Handler menggunakan `process.env.VITE_*` yang tidak tersedia di Vercel runtime
2. **Error Response**: Kadang return HTML error page instead of JSON
3. **Header Setting**: Headers di-set multiple times, causing "headers already sent" error
4. **Validation**: UUID validation tidak dilakukan sebelum database query
5. **Foreign Key**: Tidak ada pre-validation untuk foreign key constraints

### Proposed Architecture

```
Frontend (React)
    ↓ HTTP POST with validated data
Vercel Edge Network
    ↓ Route /api/*
Unified API Handler
    ↓ Set headers FIRST (safe method)
    ↓ Route by path
Specific Handler
    ↓ Validate environment
    ↓ Validate request data
    ↓ Validate foreign keys
    ↓ Supabase operation
    ↓ Return JSON response
```

## Components and Interfaces

### 1. Environment Configuration Module

**Purpose**: Centralized environment variable loading dengan fallback logic

**Interface**:
```typescript
interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'production' | 'development' | 'missing';
}

function getSupabaseConfig(): SupabaseConfig {
  // Priority: SUPABASE_* (Vercel) > VITE_SUPABASE_* (local dev)
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  
  return {
    url,
    anonKey,
    isConfigured: !!(url && anonKey),
    source: process.env.SUPABASE_URL ? 'production' : 
            process.env.VITE_SUPABASE_URL ? 'development' : 'missing'
  };
}
```

**Implementation**:
- Create `api/lib/config/supabase.ts`
- Export singleton Supabase client
- Log configuration status on initialization
- Throw descriptive error if not configured

### 2. Safe Header Manager

**Purpose**: Prevent "headers already sent" errors

**Interface**:
```typescript
interface HeaderManager {
  setHeaderSafe(res: VercelResponse, key: string, value: string): boolean;
  setCORSHeaders(res: VercelResponse): void;
  setJSONHeaders(res: VercelResponse): void;
  ensureJSONResponse(res: VercelResponse): void;
}

function setHeaderSafe(res: VercelResponse, key: string, value: string): boolean {
  try {
    if (!res.headersSent) {
      res.setHeader(key, value);
      return true;
    }
    return false;
  } catch (e) {
    console.error(`Failed to set header ${key}:`, e);
    return false;
  }
}
```

**Implementation**:
- Create `api/lib/utils/headers.ts`
- Call at the very beginning of each handler
- Use try-catch to prevent crashes
- Return boolean to indicate success

### 3. Request Validator

**Purpose**: Validate request data before database operations

**Interface**:
```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: any;
}

interface Validator {
  validateUUID(value: string, fieldName: string): ValidationResult;
  validateRequired(data: any, fields: string[]): ValidationResult;
  validateEnum(value: string, allowed: string[], fieldName: string): ValidationResult;
  validateSurveyData(data: any): ValidationResult;
  validateInternalTicketData(data: any): ValidationResult;
}
```

**Implementation**:
- Create `api/lib/validators/request.ts`
- UUID validation using regex
- Required field checking
- Enum validation for priority, source, etc.
- Return detailed error messages

### 4. Database Validator

**Purpose**: Validate foreign keys before insert/update

**Interface**:
```typescript
interface ForeignKeyValidator {
  validateUnit(unitId: string): Promise<{ valid: boolean; data?: any; error?: string }>;
  validateCategory(categoryId: string): Promise<{ valid: boolean; data?: any; error?: string }>;
  validateQRCode(token: string): Promise<{ valid: boolean; data?: any; error?: string }>;
}
```

**Implementation**:
- Create `api/lib/validators/database.ts`
- Query database to check existence
- Check is_active status
- Return data if valid for reuse
- Cache results to avoid duplicate queries

### 5. Error Response Builder

**Purpose**: Consistent error response format

**Interface**:
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  error_code?: string;
  details?: string;
  field_errors?: Record<string, string>;
  timestamp: string;
  endpoint: string;
}

function buildErrorResponse(
  error: any,
  endpoint: string,
  context?: any
): ErrorResponse {
  return {
    success: false,
    error: error.message || 'Unknown error',
    error_code: error.code,
    details: error.details || error.hint,
    field_errors: context?.fieldErrors,
    timestamp: new Date().toISOString(),
    endpoint
  };
}
```

**Implementation**:
- Create `api/lib/utils/response.ts`
- Map Supabase error codes to user-friendly messages
- Include context for debugging
- Never expose sensitive data
- Always return valid JSON

### 6. Logger Utility

**Purpose**: Structured logging for debugging

**Interface**:
```typescript
interface Logger {
  info(message: string, data?: any): void;
  error(message: string, error: any, context?: any): void;
  warn(message: string, data?: any): void;
  debug(message: string, data?: any): void;
}

function logError(message: string, error: any, context?: any): void {
  console.error(`❌ ${message}`, {
    error_message: error.message,
    error_code: error.code,
    error_details: error.details,
    error_hint: error.hint,
    stack: error.stack?.split('\n').slice(0, 3),
    context,
    timestamp: new Date().toISOString()
  });
}
```

**Implementation**:
- Create `api/lib/utils/logger.ts`
- Use emoji prefixes for visual scanning
- Include timestamp
- Limit stack trace length
- Structured data for easy parsing

## Data Models

### Survey Submission Data

```typescript
interface SurveySubmissionData {
  // Required
  service_type: string;
  
  // Optional respondent info
  visitor_name?: string | null;
  visitor_email?: string | null;
  visitor_phone?: string | null;
  is_anonymous: boolean;
  
  // Demographics
  age_range?: string | null;
  gender?: string | null;
  education?: string | null;
  job?: string | null;
  patient_type?: string | null;
  
  // Location
  kabupaten_kota?: string | null;
  kecamatan?: string | null;
  alamat_jalan?: string | null;
  
  // Scores (11 unsur IKM)
  u1_score?: number | null;  // Maps to q1_score in DB
  u2_score?: number | null;  // Maps to q2_score in DB
  // ... u3 to u11
  
  // Overall
  overall_score?: number | null;
  comments?: string | null;
  
  // References
  unit_id?: string | null;
  service_category_id?: string | null;
  qr_code?: string | null;
  source: string;
}
```

### Internal Ticket Submission Data

```typescript
interface InternalTicketSubmissionData {
  // Required
  title: string;
  description: string;
  unit_id: string;  // REQUIRED for internal tickets
  
  // Reporter info
  reporter_name?: string | null;
  reporter_email?: string | null;
  reporter_phone?: string | null;
  reporter_department?: string | null;
  reporter_position?: string | null;
  
  // Ticket classification
  category?: string | null;
  category_id?: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // References
  qr_code?: string | null;
  source: string;
}
```

### Database Schema Mapping

**public_surveys table**:
- `u1_score` (frontend) → `q1_score` (database)
- `u2_score` (frontend) → `q2_score` (database)
- ... (u3 to u11 → q3 to q11)

**tickets table**:
- `type` = 'complaint' for internal tickets
- `ticket_number` = auto-generated (INT-YYYY-NNNN)
- `status` = 'open' (initial)
- `sla_deadline` = calculated based on priority

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Survey Submission Success
*For any* valid survey data, submitting the survey should result in a 201 status code and the data should be saved to public_surveys table without error 500.
**Validates: Requirements 1.1**

### Property 2: Validation Error Response Format
*For any* invalid survey or ticket data, the system should return status 400 with a clear error message describing what field is invalid.
**Validates: Requirements 1.2, 2.2**

### Property 3: Success Response Format
*For any* successful survey submission, the response should be JSON with success: true, status 201, and include the survey ID.
**Validates: Requirements 1.4**

### Property 4: Optional Foreign Key Handling
*For any* survey submission with invalid or null unit_id, the system should still save the survey with unit_id set to null instead of returning error.
**Validates: Requirements 1.5, 2.3**

### Property 5: Internal Ticket Submission Success
*For any* valid internal ticket data with valid unit_id, submitting the ticket should result in a 201 status code and the data should be saved to tickets table.
**Validates: Requirements 2.1**

### Property 6: Ticket Number Uniqueness
*For any* two successful ticket submissions, the generated ticket_number values should be different (unique).
**Validates: Requirements 2.4, 7.2**

### Property 7: QR Code Usage Update
*For any* submission with a valid qr_code token, the usage_count in qr_codes table should increase by 1 after successful submission.
**Validates: Requirements 2.5**

### Property 8: Environment Variable Fallback
*For any* handler initialization, if SUPABASE_URL is not set but VITE_SUPABASE_URL is set, the system should use VITE_SUPABASE_URL as fallback.
**Validates: Requirements 3.4**

### Property 9: Null Client Guard
*For any* request when Supabase client is null, the system should return status 500 with error message about missing configuration.
**Validates: Requirements 3.5**

### Property 10: Error Logging Completeness
*For any* error that occurs, the log output should contain error message, error code (if available), and context data.
**Validates: Requirements 4.1, 4.2**

### Property 11: JSON Response Consistency
*For any* error response, the Content-Type header should be application/json and the response body should be valid JSON (not HTML).
**Validates: Requirements 4.5, 5.2, 5.3**

### Property 12: CORS Headers Presence
*For any* API request, the response should include Access-Control-Allow-Origin header set to *.
**Validates: Requirements 5.1, 5.2**

### Property 13: Safe Header Setting
*For any* attempt to set headers after headers are already sent, the setHeaderSafe function should not throw error and should return false.
**Validates: Requirements 5.5**

### Property 14: UUID Validation Before Query
*For any* unit_id or category_id input, the system should validate UUID format before making database query.
**Validates: Requirements 6.1, 6.2**

### Property 15: Enum Validation
*For any* priority or source input, the system should validate the value is in the allowed enum list and use default value if invalid.
**Validates: Requirements 6.3, 6.4**

### Property 16: Null Handling for Optional Fields
*For any* optional field that is empty string or undefined, the system should convert it to null before database insert.
**Validates: Requirements 6.5**

### Property 17: Foreign Key Pre-validation
*For any* survey or ticket submission, the system should validate foreign keys (unit_id, category_id) exist in database before attempting insert.
**Validates: Requirements 7.1**

### Property 18: Response Data Population
*For any* successful insert operation, the returned data should include populated relations (e.g., unit name from units table).
**Validates: Requirements 7.5**

### Property 19: Success Response Structure
*For any* successful operation, the response JSON should have structure { success: true, data: {...}, message?: string }.
**Validates: Requirements 8.1**

### Property 20: Error Response Structure
*For any* error, the response JSON should have structure { success: false, error: string, error_code?: string, details?: string, timestamp: string }.
**Validates: Requirements 8.2, 8.3, 8.4, 8.5**

## Error Handling

### Error Categories

1. **Configuration Errors** (500)
   - Missing environment variables
   - Invalid Supabase credentials
   - Null Supabase client

2. **Validation Errors** (400)
   - Invalid UUID format
   - Missing required fields
   - Invalid enum values
   - Invalid data types

3. **Database Errors** (500)
   - Foreign key constraint violations (23503)
   - Unique constraint violations (23505)
   - Check constraint violations (23514)
   - Connection errors

4. **Not Found Errors** (404)
   - Unit not found
   - Category not found
   - QR code not found

### Error Response Format

All errors should return JSON in this format:

```typescript
{
  success: false,
  error: "User-friendly error message",
  error_code?: "DATABASE_ERROR_CODE",
  details?: "Technical details for debugging",
  field_errors?: {
    "field_name": "Field-specific error message"
  },
  timestamp: "2025-02-19T10:30:00.000Z",
  endpoint: "/api/public/surveys"
}
```

### Error Mapping

| Supabase Error Code | HTTP Status | User Message |
|---------------------|-------------|--------------|
| 23503 | 400 | Data referensi tidak valid (unit/kategori tidak ditemukan) |
| 23505 | 409 | Data sudah ada (duplikat) |
| 23514 | 400 | Nilai tidak valid untuk field ini |
| 23502 | 400 | Field wajib tidak boleh kosong |
| 22P02 | 400 | Format data tidak valid |
| 42703 | 500 | Kolom database tidak ditemukan (bug) |
| PGRST116 | 404 | Data tidak ditemukan |

### Error Handling Flow

```
Request Received
    ↓
Set Headers (safe method)
    ↓
Validate Environment
    ↓ (if invalid)
    Return 500 with config error
    ↓
Validate Request Data
    ↓ (if invalid)
    Return 400 with validation errors
    ↓
Validate Foreign Keys
    ↓ (if invalid)
    Return 400 with FK errors
    ↓
Execute Database Operation
    ↓ (if error)
    Map error code → user message
    Log detailed error
    Return appropriate status with error JSON
    ↓ (if success)
    Log success
    Return 201 with data JSON
```

## Testing Strategy

### Unit Tests

Unit tests akan fokus pada:

1. **Validator Functions**
   - Test UUID validation dengan valid/invalid UUIDs
   - Test required field validation
   - Test enum validation
   - Test null handling

2. **Header Manager**
   - Test setHeaderSafe dengan headers not sent
   - Test setHeaderSafe dengan headers already sent
   - Test CORS header setting
   - Test JSON header setting

3. **Error Response Builder**
   - Test error mapping untuk berbagai Supabase error codes
   - Test response structure consistency
   - Test field error formatting

4. **Environment Config**
   - Test dengan SUPABASE_* variables
   - Test dengan VITE_SUPABASE_* variables
   - Test dengan missing variables
   - Test fallback logic

### Property-Based Tests

Property-based tests akan menggunakan library `fast-check` untuk TypeScript/JavaScript. Setiap test akan run minimum 100 iterations.

1. **Survey Submission Properties**
   - Generate random valid survey data → should return 201
   - Generate random invalid survey data → should return 400
   - Generate survey with invalid unit_id → should save with null unit_id

2. **Internal Ticket Properties**
   - Generate random valid ticket data → should return 201
   - Generate random invalid ticket data → should return 400
   - Generate multiple tickets → ticket numbers should be unique

3. **Validation Properties**
   - Generate random strings → UUID validator should correctly identify valid UUIDs
   - Generate random priority values → should accept valid enums, reject invalid
   - Generate random optional fields → empty values should become null

4. **Response Format Properties**
   - For all successful operations → response should match success schema
   - For all errors → response should match error schema
   - For all responses → Content-Type should be application/json

5. **Header Management Properties**
   - For all requests → CORS headers should be present
   - For all error scenarios → headers should still be set correctly
   - Multiple header set attempts → should not throw error

### Integration Tests

Integration tests akan test end-to-end flow:

1. **Survey Submission Flow**
   - Submit valid survey → verify saved in database
   - Submit survey with QR code → verify QR usage updated
   - Submit survey with invalid unit → verify saved with null unit

2. **Internal Ticket Flow**
   - Submit valid ticket → verify saved in database
   - Submit ticket with invalid unit → verify returns 400
   - Submit ticket with QR code → verify QR usage updated

3. **Error Scenarios**
   - Missing env vars → verify 500 response
   - Invalid UUID → verify 400 response
   - Database constraint violation → verify appropriate error response

### Test Configuration

```json
{
  "test": {
    "framework": "vitest",
    "pbt_library": "fast-check",
    "min_iterations": 100,
    "timeout": 5000,
    "coverage_threshold": {
      "lines": 80,
      "functions": 80,
      "branches": 75
    }
  }
}
```

Each property test should be tagged with:
```typescript
// Feature: complaint-management-system, Property 1: Survey Submission Success
```

## Implementation Notes

### Priority Order

1. **Critical** (Must fix first)
   - Environment variable loading
   - Safe header management
   - JSON response consistency

2. **High** (Fix next)
   - UUID validation
   - Foreign key validation
   - Error response mapping

3. **Medium** (After critical/high)
   - Logging improvements
   - Response data population
   - QR code usage update

### Deployment Checklist

Before deploying to Vercel:

1. ✅ Set environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

2. ✅ Test locally with both VITE_ and non-VITE variables

3. ✅ Verify all handlers return JSON (not HTML) on errors

4. ✅ Test CORS headers with OPTIONS requests

5. ✅ Verify UUID validation works

6. ✅ Test with invalid foreign keys

7. ✅ Check logs for proper error details

### Rollback Plan

If issues occur after deployment:

1. Revert to previous deployment in Vercel dashboard
2. Check Vercel function logs for errors
3. Verify environment variables are set correctly
4. Test endpoints manually with curl/Postman
5. Fix issues locally and redeploy

### Monitoring

After deployment, monitor:

1. Error rate for /api/public/surveys
2. Error rate for /api/public/internal-tickets
3. Response time for both endpoints
4. Supabase connection errors
5. Validation error frequency

Set up alerts for:
- Error rate > 5%
- Response time > 3 seconds
- Supabase connection failures
