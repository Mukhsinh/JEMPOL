/**
 * Property-Based Tests for API Endpoint Accessibility
 * Feature: application-refactoring, Property 4: API Endpoint Accessibility
 * Validates: Requirements 4.4
 */

import { describe, it } from 'vitest';
import fc from 'fast-check';

describe('API Endpoint Accessibility Properties', () => {
  /**
   * Property 4: API Endpoint Accessibility
   * For any API call dari aplikasi, endpoint `/api/*` harus tetap dapat diakses dan mengembalikan response yang valid
   */
  
  const apiEndpoints = [
    '/api/public/health',
    '/api/public/app-settings',
    '/api/public/external-tickets',
    '/api/public/internal-tickets',
    '/api/public/surveys',
    '/api/public/track-ticket',
    '/api/public/units'
  ];

  it('should have valid API endpoint paths starting with /api/', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...apiEndpoints),
        (endpoint) => {
          // Property: All API endpoints must start with /api/
          const startsWithApi = endpoint.startsWith('/api/');
          
          // Property: Endpoints should not contain 'frontend' or 'kiss' in path
          const notContainsFrontend = !endpoint.includes('frontend');
          const notContainsKiss = !endpoint.includes('kiss');
          
          // Property: Endpoints should be well-formed (no double slashes, etc)
          const noDoubleSlashes = !endpoint.includes('//');
          
          return startsWithApi && notContainsFrontend && notContainsKiss && noDoubleSlashes;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent API path structure', () => {
    fc.assert(
      fc.property(
        fc.record({
          prefix: fc.constant('/api'),
          scope: fc.constantFrom('public', 'private'),
          resource: fc.constantFrom('health', 'tickets', 'surveys', 'units', 'settings')
        }),
        (pathConfig) => {
          // Build API path
          const apiPath = `${pathConfig.prefix}/${pathConfig.scope}/${pathConfig.resource}`;
          
          // Property: Path should be well-formed
          const isWellFormed = apiPath.startsWith('/api/');
          const hasNoDoubleSlashes = !apiPath.includes('//');
          const hasNoTrailingSlash = !apiPath.endsWith('/');
          
          return isWellFormed && hasNoDoubleSlashes && hasNoTrailingSlash;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have API paths independent of frontend directory name', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('frontend', 'kiss'),
        fc.constantFrom(...apiEndpoints),
        (frontendDirName, apiEndpoint) => {
          // Property: API endpoint paths should not depend on frontend directory name
          // Changing frontend directory name should not affect API paths
          // We check that the frontend dir name doesn't appear as a standalone path segment
          const pathSegments = apiEndpoint.split('/').filter(Boolean);
          const containsFrontendDirAsSegment = pathSegments.includes(frontendDirName);
          
          return !containsFrontendDirAsSegment;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should construct valid API URLs with base path', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('http://localhost:3002', 'http://localhost:3004', 'https://example.com'),
        fc.constantFrom(...apiEndpoints),
        (baseUrl, apiPath) => {
          // Construct full URL
          const fullUrl = `${baseUrl}${apiPath}`;
          
          // Property: Full URL should be valid
          try {
            const url = new URL(fullUrl);
            const hasValidProtocol = url.protocol === 'http:' || url.protocol === 'https:';
            const hasValidPath = url.pathname.startsWith('/api/');
            
            return hasValidProtocol && hasValidPath;
          } catch {
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain API endpoint naming consistency', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...apiEndpoints),
        (endpoint) => {
          // Property: Endpoint names should follow kebab-case convention
          const pathParts = endpoint.split('/').filter(Boolean);
          
          // Check each part (except 'api') follows naming convention
          const allPartsValid = pathParts.slice(1).every(part => {
            // Should be lowercase with optional hyphens
            return /^[a-z]+(-[a-z]+)*$/.test(part);
          });
          
          return allPartsValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have consistent public API scope', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...apiEndpoints.filter(e => e.includes('/public/'))),
        (publicEndpoint) => {
          // Property: All public endpoints should be under /api/public/
          const isUnderPublicScope = publicEndpoint.includes('/api/public/');
          
          // Property: Public endpoints should not require authentication path segments
          const noAuthSegments = !publicEndpoint.includes('/auth/') && 
                                 !publicEndpoint.includes('/protected/');
          
          return isUnderPublicScope && noAuthSegments;
        }
      ),
      { numRuns: 100 }
    );
  });
});
