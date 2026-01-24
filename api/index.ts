import type { VercelRequest, VercelResponse } from '@vercel/node';

// Handler untuk semua endpoint backend
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    const path = req.url?.replace('/api', '') || '/';
    
    console.log('🎯 Backend API Request:', {
      method: req.method,
      path: path,
      url: req.url
    });

    // Health check
    if (path === '/health' || path === '/') {
      return res.status(200).json({
        success: true,
        message: 'Backend API is running on Vercel',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        note: 'Backend Express routes akan diimplementasikan sebagai serverless functions'
      });
    }

    // Import dan jalankan handler yang sesuai berdasarkan path
    if (path.startsWith('/auth/')) {
      const authHandler = await import('./handlers/auth');
      return authHandler.default(req, res);
    }
    
    if (path.startsWith('/complaints/')) {
      const complaintsHandler = await import('./handlers/complaints');
      return complaintsHandler.default(req, res);
    }
    
    if (path.startsWith('/reports/')) {
      const reportsHandler = await import('./handlers/reports');
      return reportsHandler.default(req, res);
    }
    
    if (path.startsWith('/users/')) {
      const usersHandler = await import('./handlers/users');
      return usersHandler.default(req, res);
    }
    
    if (path.startsWith('/master-data/')) {
      const masterDataHandler = await import('./handlers/master-data');
      return masterDataHandler.default(req, res);
    }
    
    if (path.startsWith('/qr-codes/')) {
      const qrCodesHandler = await import('./handlers/qr-codes');
      return qrCodesHandler.default(req, res);
    }
    
    if (path.startsWith('/escalation/')) {
      const escalationHandler = await import('./handlers/escalation');
      return escalationHandler.default(req, res);
    }
    
    if (path.startsWith('/units/')) {
      const unitsHandler = await import('./handlers/units');
      return unitsHandler.default(req, res);
    }
    
    if (path.startsWith('/roles/')) {
      const rolesHandler = await import('./handlers/roles');
      return rolesHandler.default(req, res);
    }
    
    if (path.startsWith('/response-templates/')) {
      const templatesHandler = await import('./handlers/response-templates');
      return templatesHandler.default(req, res);
    }
    
    if (path.startsWith('/app-settings/')) {
      const appSettingsHandler = await import('./handlers/app-settings');
      return appSettingsHandler.default(req, res);
    }
    
    if (path.startsWith('/ticket-actions/')) {
      const ticketActionsHandler = await import('./handlers/ticket-actions');
      return ticketActionsHandler.default(req, res);
    }

    // Jika tidak ada handler yang cocok
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: path,
      available_endpoints: [
        '/api/health',
        '/api/auth/*',
        '/api/complaints/*',
        '/api/reports/*',
        '/api/users/*',
        '/api/master-data/*',
        '/api/qr-codes/*',
        '/api/escalation/*',
        '/api/units/*',
        '/api/roles/*',
        '/api/response-templates/*',
        '/api/app-settings/*',
        '/api/ticket-actions/*'
      ]
    });

  } catch (error: any) {
    console.error('❌ Error in backend API:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

