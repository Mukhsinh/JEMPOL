/**
 * Route Testing Helper Functions
 * Utilities untuk testing direct access, refresh, dan API endpoints
 */

export interface RouteTestResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

/**
 * Helper untuk test direct route access
 * Mensimulasikan akses langsung ke route tanpa navigasi
 */
export async function testDirectAccess(
  baseUrl: string,
  route: string
): Promise<RouteTestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${baseUrl}${route}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      success: response.ok,
      statusCode: response.status,
      responseTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Helper untuk test page refresh
 * Mensimulasikan refresh halaman dengan header yang sesuai
 */
export async function testPageRefresh(
  baseUrl: string,
  route: string
): Promise<RouteTestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${baseUrl}${route}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Cache-Control': 'no-cache',
      },
    });
    
    const responseTime = Date.now() - startTime;
    const contentType = response.headers.get('content-type');
    
    // Verify response adalah HTML, bukan JSON atau error page
    const isHtml = contentType?.includes('text/html');
    
    return {
      success: response.ok && isHtml === true,
      statusCode: response.status,
      responseTime,
      error: !isHtml ? 'Response is not HTML' : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Helper untuk test API endpoints
 * Memastikan API endpoints tidak terpengaruh oleh SPA rewrite rules
 */
export async function testApiEndpoint(
  baseUrl: string,
  apiPath: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<RouteTestResult> {
  const startTime = Date.now();
  
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${baseUrl}${apiPath}`, options);
    
    const responseTime = Date.now() - startTime;
    const contentType = response.headers.get('content-type');
    
    // Verify response adalah JSON, bukan HTML (yang berarti kena rewrite)
    const isJson = contentType?.includes('application/json');
    
    return {
      success: response.ok && isJson === true,
      statusCode: response.status,
      responseTime,
      error: !isJson ? 'API returned HTML instead of JSON (rewrite issue)' : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Helper untuk test static assets
 * Memastikan static assets dapat diakses dengan benar
 */
export async function testStaticAsset(
  baseUrl: string,
  assetPath: string
): Promise<RouteTestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${baseUrl}${assetPath}`, {
      method: 'GET',
    });
    
    const responseTime = Date.now() - startTime;
    const contentType = response.headers.get('content-type');
    
    // Verify response bukan HTML (yang berarti kena rewrite)
    const isNotHtml = !contentType?.includes('text/html');
    
    return {
      success: response.ok && isNotHtml,
      statusCode: response.status,
      responseTime,
      error: !isNotHtml ? 'Asset returned HTML instead of asset file' : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Helper untuk batch testing multiple routes
 */
export async function testMultipleRoutes(
  baseUrl: string,
  routes: string[],
  testFn: (baseUrl: string, route: string) => Promise<RouteTestResult>
): Promise<Map<string, RouteTestResult>> {
  const results = new Map<string, RouteTestResult>();
  
  for (const route of routes) {
    const result = await testFn(baseUrl, route);
    results.set(route, result);
  }
  
  return results;
}

/**
 * Helper untuk verify semua routes berhasil
 */
export function verifyAllRoutesSuccessful(
  results: Map<string, RouteTestResult>
): { success: boolean; failedRoutes: string[] } {
  const failedRoutes: string[] = [];
  
  for (const [route, result] of results.entries()) {
    if (!result.success) {
      failedRoutes.push(route);
    }
  }
  
  return {
    success: failedRoutes.length === 0,
    failedRoutes,
  };
}

/**
 * Route definitions untuk testing
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/lacak-tiket',
  '/track-ticket',
  '/form/internal',
  '/form/eksternal',
  '/form/survey',
];

export const PROTECTED_ROUTES = [
  '/',
  '/dashboard',
  '/tickets',
  '/users',
  '/settings',
  '/reports',
];

export const API_ENDPOINTS = [
  '/api/public/tickets',
  '/api/public/internal-tickets',
  '/api/public/external-tickets',
  '/api/public/surveys',
  '/api/public/qr-codes',
  '/api/public/track-ticket',
];

export const STATIC_ASSETS = [
  '/assets/index.css',
  '/assets/index.js',
  '/favicon.ico',
];
