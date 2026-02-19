import type { VercelResponse } from '@vercel/node';

/**
 * Safely set a header without throwing error if headers already sent
 * @param res - Vercel response object
 * @param key - Header key
 * @param value - Header value
 * @returns true if header was set successfully, false otherwise
 */
export function setHeaderSafe(res: VercelResponse, key: string, value: string): boolean {
  try {
    if (!res.headersSent) {
      res.setHeader(key, value);
      return true;
    }
    return false;
  } catch (e: any) {
    console.error(`❌ Failed to set header ${key}:`, e.message);
    return false;
  }
}

/**
 * Set all CORS headers for API responses
 * @param res - Vercel response object
 */
export function setCORSHeaders(res: VercelResponse): void {
  setHeaderSafe(res, 'Access-Control-Allow-Origin', '*');
  setHeaderSafe(res, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  setHeaderSafe(res, 'Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
}

/**
 * Set JSON content type headers
 * @param res - Vercel response object
 */
export function setJSONHeaders(res: VercelResponse): void {
  setHeaderSafe(res, 'Content-Type', 'application/json; charset=utf-8');
  setHeaderSafe(res, 'X-Content-Type-Options', 'nosniff');
}

/**
 * Set cache control headers
 * @param res - Vercel response object
 */
export function setCacheHeaders(res: VercelResponse): void {
  setHeaderSafe(res, 'Cache-Control', 'no-cache, no-store, must-revalidate');
  setHeaderSafe(res, 'Pragma', 'no-cache');
  setHeaderSafe(res, 'Expires', '0');
}

/**
 * Set all API headers (CORS + JSON + Cache)
 * Call this at the very beginning of each API handler
 * @param res - Vercel response object
 */
export function setAPIHeaders(res: VercelResponse): void {
  setCORSHeaders(res);
  setJSONHeaders(res);
  setCacheHeaders(res);
}

/**
 * Ensure response will be JSON even if error occurs
 * Use this in catch blocks to guarantee JSON response
 * @param res - Vercel response object
 */
export function ensureJSONResponse(res: VercelResponse): void {
  if (!res.headersSent) {
    setJSONHeaders(res);
    setCORSHeaders(res);
  }
}

/**
 * Check if headers have been sent
 * @param res - Vercel response object
 * @returns true if headers already sent
 */
export function areHeadersSent(res: VercelResponse): boolean {
  return res.headersSent;
}
