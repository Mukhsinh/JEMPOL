import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes - dioptimalkan dengan lazy loading untuk routes yang jarang digunakan
import authRoutes from './routes/authRoutes.js';
import authVerifyRoutes from './routes/authVerifyRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import escalationRoutes from './routes/escalationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import unitRoutes from './routes/unitRoutes.js';
import userRoutes from './routes/userRoutes.js';
import masterDataRoutes from './routes/masterDataRoutes.js';
import rolesRoutes from './routes/rolesRoutes.js';
import responseTemplatesRoutes from './routes/responseTemplatesRoutes.js';
import qrCodeRoutes from './routes/qrCodeRoutes.js';
import aiTrustRoutes from './routes/aiTrustRoutes.js';
import externalTicketRoutes from './routes/externalTicketRoutes.js';
import aiEscalationRoutes from './routes/aiEscalationRoutes.js';
import publicSurveyRoutes from './routes/publicSurveyRoutes.js';
import appSettingsRoutes from './routes/appSettingsRoutes.js';
import ebookRoutes from './routes/ebookRoutes.js';
import notificationSettingsRoutes from './routes/notificationSettingsRoutes.js';
import publicDataRoutes from './routes/publicDataRoutes.js';
import ticketActionRoutes from './routes/ticketActionRoutes.js';

import { authenticateToken } from './middleware/auth.js';
import { initializeAdminTable, createDefaultAdmin } from './models/Admin.js';
import supabase from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const httpServer = createServer(app);

// Optimized CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3002',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://jempol-frontend.vercel.app',
];

// In production, allow all Vercel preview deployments
if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push('*.vercel.app');
}

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      if (origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(null, true); // Allow anyway for development
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Optimized CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin || (allowed === '*.vercel.app' && origin.includes('.vercel.app'));
      }
      return false;
    });

    callback(null, isAllowed || true); // Allow for development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Handle preflight requests explicitly
app.options('*', cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Optimized body parsing dengan limit yang lebih realistis
app.use(express.json({ limit: '50mb' })); // Kurangi dari 1100mb
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Supabase connection dan admin dengan error handling yang lebih baik
const initializeApp = async () => {
  try {
    const { error } = await supabase.from('admins').select('count').limit(1);
    if (!error) {
      await initializeAdminTable();
      await createDefaultAdmin();
    }
  } catch (err) {
    // Silent error handling untuk menghindari noise
  }
};

initializeApp();

// Health check endpoint yang dioptimalkan
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Optimized static file serving
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static(path.join(__dirname, '../../uploads'), {
  maxAge: '1d', // Cache untuk 1 hari
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
    res.setHeader('X-Frame-Options', 'ALLOWALL');
  }
}));

// Core routes - yang paling sering digunakan
app.use('/api/auth', authRoutes);
app.use('/api/auth', authVerifyRoutes);
app.use('/api/complaints', complaintRoutes);
// PENTING: publicSurveyRoutes harus di-mount SEBELUM publicRoutes
// karena publicRoutes punya route /surveys/:ticketId yang bisa menangkap /surveys/stats
app.use('/api/public', publicSurveyRoutes);
app.use('/api/public', publicDataRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/escalation', escalationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/users', userRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/response-templates', responseTemplatesRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/ai-trust-settings', aiTrustRoutes);
app.use('/api/external-tickets', externalTicketRoutes);
app.use('/api/ai-escalation', aiEscalationRoutes);
app.use('/api/app-settings', appSettingsRoutes);
app.use('/api/ebooks', ebookRoutes);
app.use('/api/notification-settings', notificationSettingsRoutes);
app.use('/api/ticket-actions', ticketActionRoutes);

// Route aliases untuk kompatibilitas
app.use('/api/escalation-rules', escalationRoutes);
app.use('/api/escalation-stats', escalationRoutes);
app.use('/api/service-categories', unitRoutes);

// Route aliases for frontend compatibility
app.get('/api/escalation-rules', authenticateToken, async (req, res) => {
  try {
    const { data: rules, error } = await supabase
      .from('escalation_rules')
      .select(`
        *,
        creator:created_by(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(rules || []);
  } catch (error) {
    console.error('Error fetching escalation rules:', error);
    res.status(500).json({ error: 'Gagal mengambil aturan eskalasi' });
  }
});

app.get('/api/escalation-stats', authenticateToken, async (req, res) => {
  try {
    // Ambil statistik aturan eskalasi
    const { data: rulesStats, error: rulesError } = await supabase
      .from('escalation_rules')
      .select('is_active');

    if (rulesError) throw rulesError;

    const totalRules = rulesStats?.length || 0;
    const activeRules = rulesStats?.filter(rule => rule.is_active).length || 0;
    const inactiveRules = totalRules - activeRules;

    // Ambil statistik log eskalasi (30 hari terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logsStats, error: logsError } = await supabase
      .from('escalation_logs')
      .select('execution_status, executed_at')
      .gte('executed_at', thirtyDaysAgo.toISOString());

    if (logsError) throw logsError;

    const totalExecutions = logsStats?.length || 0;
    const successfulExecutions = logsStats?.filter(log => log.execution_status === 'success').length || 0;
    const failedExecutions = logsStats?.filter(log => log.execution_status === 'failed').length || 0;
    const partialExecutions = logsStats?.filter(log => log.execution_status === 'partial').length || 0;

    // Ambil statistik tiket yang dieskalasi (30 hari terakhir)
    const { data: ticketsStats, error: ticketsError } = await supabase
      .from('tickets')
      .select('status, created_at')
      .eq('status', 'escalated')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (ticketsError) throw ticketsError;

    const escalatedTickets = ticketsStats?.length || 0;

    const stats = {
      rules: {
        total: totalRules,
        active: activeRules,
        inactive: inactiveRules
      },
      executions: {
        total: totalExecutions,
        successful: successfulExecutions,
        failed: failedExecutions,
        partial: partialExecutions,
        successRate: totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0
      },
      tickets: {
        escalated: escalatedTickets
      },
      period: '30 days'
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching escalation stats:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik eskalasi' });
  }
});

app.patch('/api/escalation-rules/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const { data: rule, error } = await supabase
      .from('escalation_rules')
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!rule) {
      return res.status(404).json({ error: 'Aturan eskalasi tidak ditemukan' });
    }

    res.json(rule);
  } catch (error) {
    console.error('Error toggling escalation rule:', error);
    res.status(500).json({ error: 'Gagal mengubah status aturan eskalasi' });
  }
});

// Public units endpoint (no auth required) for fallback
app.get('/api/public/units', async (req, res) => {
  try {
    const { search, type, status } = req.query;

    let query = supabase
      .from('units')
      .select(`
        id, name, code, description, contact_email, contact_phone, 
        sla_hours, is_active, parent_unit_id, unit_type_id,
        created_at, updated_at,
        unit_type:unit_types(id, name, code, color, icon),
        parent_unit:units!parent_unit_id(name, code)
      `)
      .order('name');

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    if (type && type !== 'Semua Tipe') {
      const { data: unitTypeData } = await supabase
        .from('unit_types')
        .select('id')
        .eq('name', type)
        .single();

      if (unitTypeData?.id) {
        query = query.eq('unit_type_id', unitTypeData.id);
      }
    }

    if (status === 'active' || status === 'Aktif') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive' || status === 'Tidak Aktif' || status === 'Pemeliharaan') {
      query = query.eq('is_active', false);
    }

    const { data: units, error } = await query;

    if (error) {
      throw error;
    }

    // Transform the data to match frontend expectations
    const transformedUnits = (units || []).map((unit: any) => ({
      ...unit,
      unit_type: unit.unit_type ? {
        id: unit.unit_type.id,
        name: unit.unit_type.name,
        code: unit.unit_type.code,
        color: unit.unit_type.color || '#6B7280',
        icon: unit.unit_type.icon || 'domain'
      } : null
    }));

    res.json(transformedUnits);
  } catch (error) {
    console.error('Error fetching public units:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/public/unit-types', async (req, res) => {
  try {
    const { data: unitTypes, error } = await supabase
      .from('unit_types')
      .select('id, name, code, description, icon, color, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw error;
    }

    res.json(unitTypes || []);
  } catch (error) {
    console.error('Error fetching public unit types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for units (no auth)
app.get('/api/test/units', async (req, res) => {
  try {
    const { data: units, error } = await supabase
      .from('units')
      .select(`
        id, name, code, description, contact_email, contact_phone, 
        sla_hours, is_active, parent_unit_id, unit_type_id,
        created_at, updated_at,
        unit_type:unit_types(id, name, code, color, icon),
        parent_unit:units!parent_unit_id(name, code)
      `)
      .order('name')
      .limit(5);

    if (error) throw error;

    res.json({
      success: true,
      data: units,
      message: 'Test units endpoint working'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Test endpoint for reports (no auth)
app.get('/api/test/reports', async (req, res) => {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        units!inner(name),
        service_categories(name)
      `)
      .limit(5);

    if (error) throw error;

    res.json({
      success: true,
      data: tickets,
      message: 'Test endpoint working'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Test endpoint for SLA settings (no auth)
app.get('/api/test/sla-settings', async (req, res) => {
  try {
    const { data: slaSettings, error } = await supabase
      .from('sla_settings')
      .select(`
        *,
        unit_types(name, code),
        service_categories(name, code),
        patient_types(name, code)
      `)
      .order('name')
      .limit(5);

    if (error) throw error;

    res.json({
      success: true,
      data: slaSettings,
      message: 'Test SLA settings endpoint working',
      count: slaSettings?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Test endpoint for SLA settings with admin client (no auth, bypasses RLS)
app.get('/api/test/sla-settings-admin', async (req, res) => {
  try {
    // Coba query langsung dengan raw SQL untuk bypass RLS
    const { data: slaSettings, error } = await supabase.rpc('get_sla_settings_public');

    if (error) {
      console.error('RPC error:', error);
      // Fallback ke query biasa
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('sla_settings')
        .select(`
          *,
          unit_types(name, code),
          service_categories(name, code),
          patient_types(name, code)
        `)
        .order('name')
        .limit(5);

      if (fallbackError) throw fallbackError;

      res.json({
        success: true,
        data: fallbackData,
        message: 'Test SLA settings fallback endpoint working',
        count: fallbackData?.length || 0
      });
    } else {
      res.json({
        success: true,
        data: slaSettings,
        message: 'Test SLA settings RPC endpoint working',
        count: slaSettings?.length || 0
      });
    }
  } catch (error) {
    console.error('Admin endpoint error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'Ukuran file terlalu besar. Maksimal 1GB untuk video, 100MB untuk PowerPoint, dan 50MB untuk foto.',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Terlalu banyak file. Hanya satu file yang diperbolehkan.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Terjadi kesalahan pada server',
  });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 3004;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
