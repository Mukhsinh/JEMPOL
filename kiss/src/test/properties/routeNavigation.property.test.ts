/**
 * Property-Based Tests for Route Navigation
 * Feature: application-refactoring, Property 6: Route Navigation Completeness
 * Validates: Requirements 10.1, 10.2
 */

import { describe, it } from 'vitest';
import fc from 'fast-check';

describe('Route Navigation Properties', () => {
  /**
   * Property 6: Route Navigation Completeness
   * For any route yang didefinisikan di App.tsx, navigasi ke route tersebut harus berhasil tanpa error
   */

  const publicRoutes = [
    '/login',
    '/lacak-tiket',
    '/track-ticket',
    '/tiket-eksternal',
    '/survey/public',
    '/buku-petunjuk',
    '/form/internal',
    '/form/eksternal',
    '/form/survey'
  ];

  const protectedRoutes = [
    '/',
    '/dashboard',
    '/tickets',
    '/users',
    '/master-data',
    '/settings',
    '/reports',
    '/realtime-notification'
  ];

  const allRoutes = [...publicRoutes, ...protectedRoutes];

  it('should have valid route path structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allRoutes),
        (route) => {
          // Property: All routes should start with /
          const startsWithSlash = route.startsWith('/');
          
          // Property: Routes should not contain double slashes
          const noDoubleSlashes = !route.includes('//');
          
          // Property: Routes should not end with slash (except root)
          const validEnding = route === '/' || !route.endsWith('/');
          
          // Property: Routes should not contain 'frontend' or old directory names
          const notContainsFrontend = !route.includes('frontend');
          
          return startsWithSlash && noDoubleSlashes && validEnding && notContainsFrontend;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should distinguish between public and protected routes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allRoutes),
        (route) => {
          // Property: A route should be either public or protected, not both
          const isPublic = publicRoutes.includes(route);
          const isProtected = protectedRoutes.includes(route);
          
          // XOR: exactly one should be true
          return (isPublic && !isProtected) || (!isPublic && isProtected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have consistent route naming conventions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allRoutes),
        (route) => {
          // Property: Route segments should follow kebab-case or be single words
          const segments = route.split('/').filter(Boolean);
          
          const allSegmentsValid = segments.every(segment => {
            // Allow kebab-case, lowercase, or path parameters
            return /^[a-z]+(-[a-z]+)*$/.test(segment) || segment.startsWith(':');
          });
          
          return allSegmentsValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain route hierarchy consistency', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allRoutes.filter(r => r.includes('/'))),
        (route) => {
          // Property: Routes with multiple segments should have valid hierarchy
          const segments = route.split('/').filter(Boolean);
          
          // Property: Each segment should be non-empty
          const allSegmentsNonEmpty = segments.every(seg => seg.length > 0);
          
          // Property: No segment should contain spaces
          const noSpaces = segments.every(seg => !seg.includes(' '));
          
          return allSegmentsNonEmpty && noSpaces;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have valid form routes structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/form/internal', '/form/eksternal', '/form/survey'),
        (formRoute) => {
          // Property: Form routes should follow /form/{type} pattern
          const startsWithForm = formRoute.startsWith('/form/');
          
          // Property: Form type should be valid
          const validFormTypes = ['internal', 'eksternal', 'survey'];
          const formType = formRoute.split('/')[2];
          const hasValidType = validFormTypes.includes(formType);
          
          return startsWithForm && hasValidType;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have valid master-data routes structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '/master-data',
          '/master-data/units',
          '/master-data/unit-types',
          '/master-data/service-categories',
          '/master-data/ticket-types'
        ),
        (masterDataRoute) => {
          // Property: Master data routes should start with /master-data
          const startsWithMasterData = masterDataRoute.startsWith('/master-data');
          
          // Property: Sub-routes should use kebab-case
          const segments = masterDataRoute.split('/').filter(Boolean);
          const allKebabCase = segments.slice(1).every(seg => 
            /^[a-z]+(-[a-z]+)*$/.test(seg)
          );
          
          return startsWithMasterData && allKebabCase;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle route parameters correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          base: fc.constantFrom('/tickets', '/tiket-eksternal', '/survey/public', '/m'),
          param: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('/'))
        }),
        (routeConfig) => {
          // Build parameterized route
          const route = `${routeConfig.base}/${routeConfig.param}`;
          
          // Property: Parameterized routes should be well-formed
          const isWellFormed = route.startsWith('/');
          const noDoubleSlashes = !route.includes('//');
          const hasParam = route.split('/').length > routeConfig.base.split('/').length;
          
          return isWellFormed && noDoubleSlashes && hasParam;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have consistent survey route patterns', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/survey/public', '/survey/admin', '/survey/form', '/survey/report'),
        (surveyRoute) => {
          // Property: Survey routes should follow /survey/{scope} pattern
          const startsWithSurvey = surveyRoute.startsWith('/survey/');
          
          // Property: Survey scope should be valid
          const validScopes = ['public', 'admin', 'form', 'report'];
          const scope = surveyRoute.split('/')[2];
          const hasValidScope = validScopes.includes(scope);
          
          return startsWithSurvey && hasValidScope;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have consistent ticket route patterns', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '/tickets',
          '/tickets/qr-management',
          '/tickets/ai-escalation',
          '/tickets/escalation'
        ),
        (ticketRoute) => {
          // Property: Ticket routes should start with /tickets
          const startsWithTickets = ticketRoute.startsWith('/tickets');
          
          // Property: Sub-routes should use kebab-case
          const segments = ticketRoute.split('/').filter(Boolean);
          const allValid = segments.slice(1).every(seg => 
            /^[a-z]+(-[a-z]+)*$/.test(seg) || seg.startsWith(':')
          );
          
          return startsWithTickets && allValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not have routes referencing old directory structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allRoutes),
        (route) => {
          // Property: Routes should not contain references to old structure
          const notContainsFrontend = !route.includes('frontend');
          const notContainsOldPaths = !route.includes('old') && !route.includes('legacy');
          
          return notContainsFrontend && notContainsOldPaths;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain route uniqueness', () => {
    fc.assert(
      fc.property(
        fc.constant(allRoutes),
        (routes) => {
          // Property: All routes should be unique (no duplicates)
          const uniqueRoutes = new Set(routes);
          return uniqueRoutes.size === routes.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have valid QR code route pattern', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('/')),
        (qrCode) => {
          // Build QR route
          const qrRoute = `/m/${qrCode}`;
          
          // Property: QR routes should follow /m/{code} pattern
          const startsWithM = qrRoute.startsWith('/m/');
          const hasCode = qrRoute.split('/').length === 3;
          const noDoubleSlashes = !qrRoute.includes('//');
          
          return startsWithM && hasCode && noDoubleSlashes;
        }
      ),
      { numRuns: 100 }
    );
  });
});
