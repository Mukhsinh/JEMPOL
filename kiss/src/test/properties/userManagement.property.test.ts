import fc from 'fast-check';
import { describe, it, expect, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Setup Supabase client untuk testing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials tidak ditemukan di environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Setup axios dengan base URL untuk testing
const api = axios.create({
  baseURL: 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper untuk membuat test user
async function createTestUser(userData: any) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role || 'staff',
      is_active: true
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Helper untuk menghapus test user
async function deleteTestUser(userId: string) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  
  if (error) throw error;
}

// Helper untuk check apakah user exists
async function userExists(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();
  
  return !error && data !== null;
}

describe('User Management Property Tests', () => {
  const testUsers: string[] = [];

  afterAll(async () => {
    // Cleanup: hapus semua test users
    for (const userId of testUsers) {
      try {
        await deleteTestUser(userId);
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  });

  // Feature: user-management-fix, Property 1: DELETE Request Processing
  it('Property 1: DELETE request processing - valid user ID should be accepted and processed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          full_name: fc.string({ minLength: 3, maxLength: 50 }),
          email: fc.emailAddress(),
          role: fc.constantFrom('staff', 'supervisor', 'manager', 'director')
        }),
        async (userData) => {
          // Arrange: Create a test user
          const user = await createTestUser(userData);
          testUsers.push(user.id);

          // Act: Send DELETE request
          const response = await fetch(`/api/public/users/${user.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          // Assert: Request should be accepted and processed successfully
          expect(response.status).toBe(200);
          
          const result = await response.json();
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // Timeout 60 detik untuk property test

  // Feature: user-management-fix, Property 2: User Deletion Persistence
  it('Property 2: User deletion persistence - deleted user should not exist in database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          full_name: fc.string({ minLength: 3, maxLength: 50 }),
          email: fc.emailAddress(),
          role: fc.constantFrom('staff', 'supervisor', 'manager', 'director')
        }),
        async (userData) => {
          // Arrange: Create a test user
          const user = await createTestUser(userData);
          testUsers.push(user.id);

          // Act: Delete the user via API
          const response = await fetch(`/api/public/users/${user.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          expect(response.status).toBe(200);

          // Assert: User should not exist in database
          const exists = await userExists(user.id);
          expect(exists).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  // Feature: user-management-fix, Property 3: DELETE Non-Existent User Error Handling
  it('Property 3: DELETE non-existent user - should return 404 error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (nonExistentId) => {
          // Pastikan ID ini tidak ada di database
          const exists = await userExists(nonExistentId);
          if (exists) return; // Skip jika kebetulan ID ada

          // Act: Try to delete non-existent user
          const response = await fetch(`/api/public/users/${nonExistentId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          // Assert: Should return 404
          expect(response.status).toBe(404);
          
          const result = await response.json();
          expect(result.success).toBe(false);
          expect(result.error).toContain('tidak ditemukan');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  // Feature: user-management-fix, Property 4: CREATE User with Valid Data
  it('Property 4: CREATE user with valid data - should create user successfully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          full_name: fc.string({ minLength: 3, maxLength: 50 }),
          email: fc.emailAddress(),
          role: fc.constantFrom('staff', 'supervisor', 'manager', 'director', 'admin')
        }),
        async (userData) => {
          // Act: Create user via API
          const response = await fetch('/api/public/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });

          // Assert: Should create successfully
          expect(response.status).toBe(200);
          
          const result = await response.json();
          expect(result.success).toBe(true);
          expect(result.data).toBeDefined();
          expect(result.data.full_name).toBe(userData.full_name);
          expect(result.data.email).toBe(userData.email);
          expect(result.data.role).toBe(userData.role);

          // Cleanup
          if (result.data?.id) {
            testUsers.push(result.data.id);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  // Feature: user-management-fix, Property 5: Duplicate Email Rejection
  it('Property 5: Duplicate email rejection - should reject duplicate emails', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          full_name: fc.string({ minLength: 3, maxLength: 50 }),
          email: fc.emailAddress(),
          role: fc.constantFrom('staff', 'supervisor', 'manager', 'director')
        }),
        async (userData) => {
          // Arrange: Create first user
          const firstUser = await createTestUser(userData);
          testUsers.push(firstUser.id);

          // Act: Try to create second user with same email
          const response = await fetch('/api/public/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              full_name: 'Different Name',
              email: userData.email, // Same email
              role: 'staff'
            })
          });

          // Assert: Should reject with 400
          expect(response.status).toBe(400);
          
          const result = await response.json();
          expect(result.success).toBe(false);
          expect(result.error.toLowerCase()).toContain('email');
          expect(result.error.toLowerCase()).toContain('terdaftar');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  // Feature: user-management-fix, Property 6: Required Fields Validation
  it('Property 6: Required fields validation - should reject missing required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Missing full_name
          fc.record({
            email: fc.emailAddress(),
            role: fc.constantFrom('staff', 'supervisor', 'manager')
          }),
          // Missing email
          fc.record({
            full_name: fc.string({ minLength: 3, maxLength: 50 }),
            role: fc.constantFrom('staff', 'supervisor', 'manager')
          }),
          // Empty full_name
          fc.record({
            full_name: fc.constant(''),
            email: fc.emailAddress(),
            role: fc.constantFrom('staff', 'supervisor', 'manager')
          }),
          // Empty email
          fc.record({
            full_name: fc.string({ minLength: 3, maxLength: 50 }),
            email: fc.constant(''),
            role: fc.constantFrom('staff', 'supervisor', 'manager')
          })
        ),
        async (invalidData) => {
          // Act: Try to create user with missing/empty required fields
          const response = await fetch('/api/public/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(invalidData)
          });

          // Assert: Should reject with 400
          expect(response.status).toBe(400);
          
          const result = await response.json();
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  // Feature: user-management-fix, Property 7: Consistent Response Format
  it('Property 7: Consistent response format - all responses should have consistent structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Valid request
          fc.record({
            full_name: fc.string({ minLength: 3, maxLength: 50 }),
            email: fc.emailAddress(),
            role: fc.constantFrom('staff', 'supervisor', 'manager')
          }),
          // Invalid request (missing fields)
          fc.record({
            email: fc.emailAddress()
          })
        ),
        async (userData) => {
          // Act: Send request
          const response = await fetch('/api/public/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });

          const result = await response.json();

          // Assert: Response should have consistent structure
          expect(result).toHaveProperty('success');
          expect(typeof result.success).toBe('boolean');

          if (result.success) {
            expect(result).toHaveProperty('data');
            // Cleanup
            if (result.data?.id) {
              testUsers.push(result.data.id);
            }
          } else {
            expect(result).toHaveProperty('error');
            expect(typeof result.error).toBe('string');
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  // Feature: user-management-fix, Property 8: Error Message Clarity
  it('Property 8: Error message clarity - error messages should be specific and actionable', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Missing required field
          fc.constant({ role: 'staff' }),
          // Invalid email format (akan di-handle oleh fast-check email generator, jadi kita test missing email)
          fc.record({
            full_name: fc.string({ minLength: 3, maxLength: 50 }),
            role: fc.constantFrom('staff', 'supervisor')
          })
        ),
        async (invalidData) => {
          // Act: Send invalid request
          const response = await fetch('/api/public/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(invalidData)
          });

          const result = await response.json();

          // Assert: Error message should be clear and specific
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
          expect(result.error.length).toBeGreaterThan(0);
          // Error message should not be generic
          expect(result.error.toLowerCase()).not.toBe('error');
          expect(result.error.toLowerCase()).not.toBe('failed');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});

describe('Frontend-Backend Integration Property Tests', () => {
  const testUsers: string[] = [];

  afterAll(async () => {
    // Cleanup: hapus semua test users
    for (const userId of testUsers) {
      try {
        await deleteTestUser(userId);
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  });

  // Feature: user-management-fix, Property 9: Frontend-Backend Integration
  it('Property 9: Frontend-backend integration - service methods should use correct HTTP methods and URL formats', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          full_name: fc.string({ minLength: 3, maxLength: 50 }),
          email: fc.emailAddress(),
          role: fc.constantFrom('staff', 'supervisor', 'manager', 'director')
        }),
        async (userData) => {
          // Test CREATE operation
          const createResponse = await fetch('/api/public/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });

          expect(createResponse.status).toBe(200);
          const createResult = await createResponse.json();
          expect(createResult.success).toBe(true);
          expect(createResult.data).toBeDefined();
          
          const userId = createResult.data.id;
          testUsers.push(userId);

          // Test GET operation (by ID)
          const getResponse = await fetch(`/api/public/users/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          expect(getResponse.status).toBe(200);
          const getResult = await getResponse.json();
          expect(getResult.success).toBe(true);
          expect(getResult.data.id).toBe(userId);

          // Test UPDATE operation
          const updateData = {
            full_name: 'Updated Name',
            phone: '081234567890'
          };

          const updateResponse = await fetch(`/api/public/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          });

          expect(updateResponse.status).toBe(200);
          const updateResult = await updateResponse.json();
          expect(updateResult.success).toBe(true);
          expect(updateResult.data.full_name).toBe('Updated Name');

          // Test DELETE operation
          const deleteResponse = await fetch(`/api/public/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          expect(deleteResponse.status).toBe(200);
          const deleteResult = await deleteResponse.json();
          expect(deleteResult.success).toBe(true);

          // Verify user is deleted
          const exists = await userExists(userId);
          expect(exists).toBe(false);
        }
      ),
      { numRuns: 50 } // Reduced runs karena ini full integration test
    );
  }, 120000); // Timeout 120 detik untuk full integration test
});
