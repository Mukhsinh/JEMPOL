import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import visitorRoutes from './routes/visitorRoutes.js';
import innovationRoutes from './routes/innovationRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import authRoutes from './routes/authRoutes.js';
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
import supabase from './config/supabase.js';
import { initializeAdminTable, createDefaultAdmin } from './models/Admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://jempol-frontend.vercel.app',
      ];
      
      // Allow all Vercel deployments
      if (origin.includes('.vercel.app')) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow anyway for now
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware - CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://jempol-frontend.vercel.app',
  'https://jempol-frontend-git-main-mukhainilfmpol.vercel.app',
];

// In production, allow all Vercel preview deployments
if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push('*.vercel.app');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin || (allowed === '*.vercel.app' && origin.includes('.vercel.app'));
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for now, can be strict later
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1100mb' }));
app.use(express.urlencoded({ extended: true, limit: '1100mb' }));

// Test Supabase connection and initialize admin
supabase.from('innovations').select('count').limit(1).then(
  async () => {
    console.log('Supabase connected successfully');
    await initializeAdminTable();
    await createDefaultAdmin();
  },
  (err) => console.error('Supabase connection error:', err)
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Serve uploaded files with proper CORS headers for Office Online Viewer
app.use('/uploads', (req, res, next) => {
  // Add CORS headers for Office Online Viewer and PDF viewers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}, express.static(path.join(__dirname, '../../uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper content type for files
    if (filePath.endsWith('.pptx')) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    } else if (filePath.endsWith('.ppt')) {
      res.setHeader('Content-Type', 'application/vnd.ms-powerpoint');
    } else if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline'); // Display in browser, not download
    }
    // Allow embedding in iframes
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.removeHeader('X-Frame-Options'); // Remove restrictive header
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/innovations', innovationRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/escalation', escalationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/users', userRoutes);
app.use('/api/service-categories', unitRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/response-templates', responseTemplatesRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/ai-trust-settings', aiTrustRoutes);
app.use('/api/external-tickets', externalTicketRoutes);
app.use('/api/ai-escalation', aiEscalationRoutes);
app.use('/api/app-settings', appSettingsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/public', publicSurveyRoutes);

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

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
