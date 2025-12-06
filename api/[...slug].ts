import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Extract the slug from the request
  const { slug } = request.query;
  
  // Convert slug array to path string
  const path = Array.isArray(slug) ? slug.join('/') : slug || '';
  
  // Log the request for debugging
  console.log(`API request: ${request.method} /api/${path}`);
  
  // Simple routing based on path
  if (path === 'health') {
    return response.status(200).json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }
  
  // For all other paths, return a placeholder response
  // In a real implementation, you would forward these requests to your backend services
  return response.status(200).json({
    success: true,
    message: `API endpoint /api/${path} reached`,
    method: request.method,
    path: `/api/${path}`,
    note: 'This is a placeholder. In production, requests would be forwarded to backend services.'
  });
}