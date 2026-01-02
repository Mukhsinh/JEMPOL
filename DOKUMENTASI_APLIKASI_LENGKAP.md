# 📋 Dokumentasi Lengkap Sistem JEMPOL - AI-Powered Complaint Management

## 🎯 Gambaran Umum Sistem

**JEMPOL (Jembatan Pembayaran Online)** adalah platform inovasi komprehensif yang dikembangkan untuk RSUD Bendan Kota Pekalongan. Sistem ini menggabungkan dua komponen utama:

1. **Platform Showcase Inovasi** - Menampilkan inovasi JEMPOL dengan fitur galeri multimedia dan game interaktif
2. **Sistem Manajemen Keluhan AI-Powered** - Platform enterprise untuk mengelola keluhan, saran, dan survei kepuasan

### ✨ Fitur Utama Terintegrasi

#### 🌟 Platform Showcase Inovasi
- **Galeri Multimedia**: Upload dan tampilkan PowerPoint, video tutorial
- **Game "Innovation Catcher"**: Game interaktif dengan leaderboard
- **Pendaftaran Pengunjung**: Sistem registrasi dengan export CSV
- **Dashboard Analytics**: Statistik pengunjung dan engagement

#### 🤖 Sistem Manajemen Keluhan AI-Powered
- **Akses Publik QR Code**: Pengajuan keluhan tanpa login melalui QR code
- **AI Classification**: Klasifikasi otomatis menggunakan NLP Indonesia
- **Role-Based Management**: Multi-level access (Staff, Supervisor, Manager, Director, Admin)
- **Real-time Dashboard**: Analytics dan monitoring real-time
- **Multi-Channel Notifications**: Web, email, WhatsApp, SMS
- **Survey Integration**: Survei kepuasan otomatis
- **Escalation Management**: Eskalasi otomatis berdasarkan SLA

## 🏗️ Arsitektur Sistem

### Stack Teknologi

#### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool modern dan cepat
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client untuk API calls
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icon library
- **Phaser** - Game engine untuk Innovation Catcher

#### Backend
- **Node.js** + Express.js
- **TypeScript** - Type safety dan developer experience
- **Supabase** - Database PostgreSQL dan Authentication
- **Socket.io** - Real-time features
- **Multer** - File upload handling
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Mongoose** - MongoDB ODM (untuk data legacy)

#### Database & Storage
- **PostgreSQL** (via Supabase) - Primary database
- **Row Level Security** (RLS) - Data security
- **Real-time subscriptions** - Live updates
- **File Storage** - Local dan cloud storage
- **Automatic backups** - Data protection

#### Testing & Quality
- **Vitest** - Unit testing framework
- **fast-check** - Property-based testing
- **React Testing Library** - Component testing
- **TypeScript** - Compile-time error checking

### Struktur Project

```
jempol-system/
├── frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── layout/        # Layout components (Header, Sidebar, etc.)
│   │   │   ├── ui/            # Basic UI components (Button, Input, etc.)
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── StatusChart.tsx
│   │   │   └── TicketTable.tsx
│   │   ├── pages/             # Page Components
│   │   │   ├── Dashboard.tsx  # Main dashboard
│   │   │   ├── LoginPage.tsx  # Authentication
│   │   │   ├── tickets/       # Ticket management pages
│   │   │   ├── users/         # User management pages
│   │   │   └── survey/        # Survey pages
│   │   ├── services/          # API Service Layer
│   │   │   ├── authService.ts
│   │   │   ├── complaintService.ts
│   │   │   └── apiClient.ts
│   │   ├── contexts/          # React Contexts
│   │   │   └── AuthContext.tsx
│   │   ├── layouts/           # Layout Components
│   │   │   └── MainLayout.tsx
│   │   ├── types/             # TypeScript Type Definitions
│   │   ├── utils/             # Utility Functions
│   │   └── App.tsx            # Main App Component
│   ├── public/                # Static Assets
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Express Backend Application
│   ├── src/
│   │   ├── controllers/       # Route Controllers
│   │   │   ├── authController.ts
│   │   │   ├── complaintController.ts
│   │   │   └── dashboardController.ts
│   │   ├── routes/            # API Routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── complaintRoutes.ts
│   │   │   ├── publicRoutes.ts
│   │   │   └── visitorRoutes.ts
│   │   ├── models/            # Data Models
│   │   │   ├── Admin.ts
│   │   │   ├── Ticket.ts
│   │   │   └── User.ts
│   │   ├── middleware/        # Express Middleware
│   │   │   ├── auth.ts
│   │   │   └── validation.ts
│   │   ├── config/            # Configuration
│   │   │   ├── supabase.ts
│   │   │   └── database.ts
│   │   ├── services/          # Business Logic Services
│   │   ├── utils/             # Utility Functions
│   │   └── server.ts          # Entry Point
│   ├── uploads/               # File Upload Directory
│   └── package.json
│
├── .kiro/                       # Kiro IDE Configuration
│   └── specs/                  # Project Specifications
│       └── complaint-management-system/
│           ├── requirements.md # Requirements Document
│           ├── design.md      # Design Document
│           └── tasks.md       # Implementation Tasks
│
├── api/                        # Vercel Serverless Functions
├── uploads/                    # Uploaded Files Storage
├── package.json               # Root Package Configuration
├── vercel.json                # Vercel Deployment Configuration
└── README.md                  # Project Documentation
```

## 🗄️ Database Schema

### Tabel Utama

#### 1. Tabel Legacy (Existing)
```sql
-- Admins (existing table for authentication)
admins (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  full_name VARCHAR(255),
  role VARCHAR(50),
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Innovations (existing showcase content)
innovations (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  file_path TEXT,
  file_type VARCHAR(50),
  view_count INTEGER,
  created_at TIMESTAMPTZ
)

-- Visitors (existing visitor registration)
visitors (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  organization VARCHAR(255),
  created_at TIMESTAMPTZ
)
```

#### 2. Tabel Complaint Management (New)
```sql
-- Units/Departments
units (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  parent_unit_id UUID REFERENCES units(id),
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  sla_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Service Categories
service_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  default_sla_hours INTEGER DEFAULT 24,
  requires_attachment BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Users (extends admins table)
users (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES admins(id),
  employee_id VARCHAR(50),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  unit_id UUID REFERENCES units(id),
  role VARCHAR(50) CHECK (role IN ('staff', 'supervisor', 'manager', 'director', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Tickets (core complaint management)
tickets (
  id UUID PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) CHECK (type IN ('information', 'complaint', 'suggestion', 'satisfaction')),
  category_id UUID REFERENCES service_categories(id),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  
  -- Submitter information
  submitter_name VARCHAR(255),
  submitter_email VARCHAR(255),
  submitter_phone VARCHAR(50),
  submitter_address TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  
  -- Assignment and routing
  unit_id UUID REFERENCES units(id) NOT NULL,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  
  -- Status and priority
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'escalated', 'resolved', 'closed')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  urgency_level INTEGER DEFAULT 3 CHECK (urgency_level BETWEEN 1 AND 5),
  
  -- AI Analysis
  ai_classification JSONB,
  sentiment_score DECIMAL(3,2),
  confidence_score DECIMAL(3,2),
  
  -- SLA Management
  sla_deadline TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Tracking
  source VARCHAR(50) DEFAULT 'web',
  qr_code_id UUID REFERENCES qr_codes(id),
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- QR Codes for Units
qr_codes (
  id UUID PRIMARY KEY,
  unit_id UUID REFERENCES units(id) NOT NULL,
  code VARCHAR(255) UNIQUE NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Ticket Responses
ticket_responses (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) NOT NULL,
  responder_id UUID REFERENCES users(id) NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  response_type VARCHAR(50) DEFAULT 'comment',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Ticket Escalations
ticket_escalations (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) NOT NULL,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  from_role VARCHAR(50) NOT NULL,
  to_role VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  escalation_type VARCHAR(50) DEFAULT 'manual',
  escalated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ
)

-- Satisfaction Surveys
satisfaction_surveys (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) NOT NULL,
  overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 5),
  response_time_score INTEGER CHECK (response_time_score BETWEEN 1 AND 5),
  solution_quality_score INTEGER CHECK (solution_quality_score BETWEEN 1 AND 5),
  staff_courtesy_score INTEGER CHECK (staff_courtesy_score BETWEEN 1 AND 5),
  comments TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ
)

-- Notifications
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ticket_id UUID REFERENCES tickets(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channels JSONB DEFAULT '["web"]',
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)

-- AI Processing Logs
ai_logs (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) NOT NULL,
  operation VARCHAR(100) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  model_version VARCHAR(50),
  created_at TIMESTAMPTZ
)

-- File Attachments
ticket_attachments (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ
)
```

### Indexes untuk Performance
```sql
-- Ticket indexes
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_unit_id ON tickets(unit_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_sla_deadline ON tickets(sla_deadline);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);

-- Performance indexes
CREATE INDEX idx_ticket_responses_ticket_id ON ticket_responses(ticket_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_escalations_ticket_id ON ticket_escalations(ticket_id);
```

## 🚀 Instalasi dan Setup

### Prerequisites
- **Node.js** 18+ 
- **npm** atau **yarn**
- **Akun Supabase** (untuk database dan auth)
- **Git** untuk version control

### Langkah Instalasi

#### 1. Clone Repository
```bash
git clone <repository-url>
cd jempol-system
npm install
```

#### 2. Setup Environment Variables

**Backend (.env)**
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE_MB=1000
UPLOAD_PATH=./uploads

# AI Configuration (optional - untuk future implementation)
AI_API_KEY=your_ai_service_key
AI_CONFIDENCE_THRESHOLD=0.7

# Notification Services (optional)
EMAIL_SERVICE_API_KEY=your_email_service_key
WHATSAPP_API_KEY=your_whatsapp_api_key
SMS_API_KEY=your_sms_api_key
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 3. Setup Database Supabase

1. **Buat Project Supabase**
   - Buka [supabase.com](https://supabase.com)
   - Buat project baru
   - Catat URL dan API keys

2. **Setup Authentication**
   ```sql
   -- Enable RLS (Row Level Security)
   ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own tickets" ON tickets
     FOR SELECT USING (
       auth.uid()::text = created_by::text OR 
       auth.uid()::text = assigned_to::text
     );

   CREATE POLICY "Admins can view all tickets" ON tickets
     FOR ALL USING (
       EXISTS (
         SELECT 1 FROM users 
         WHERE users.id = auth.uid()::text 
         AND users.role IN ('admin', 'superadmin')
       )
     );
   ```

3. **Setup Real-time**
   ```sql
   -- Enable real-time for tables
   ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
   ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
   ALTER PUBLICATION supabase_realtime ADD TABLE ticket_responses;
   ```

#### 4. Jalankan Aplikasi

**Development Mode:**
```bash
# Jalankan frontend dan backend bersamaan
npm run dev

# Atau jalankan terpisah
npm run dev:frontend  # Port 3000
npm run dev:backend   # Port 5000
```

**Production Build:**
```bash
npm run build
npm start
```

### 🔧 Setup Admin Default

Sistem akan otomatis membuat admin default saat pertama kali dijalankan:
- **Username**: admin
- **Email**: admin@jempol.com
- **Password**: admin123
- **Role**: superadmin

**⚠️ PENTING**: Segera ganti password default setelah login pertama!

## 📱 Penggunaan Aplikasi

### Untuk Admin/Staff

#### 1. Login ke Sistem
```
URL: http://localhost:3000/login
Email: admin@jempol.com
Password: admin123
```

#### 2. Dashboard Overview
- **KPI Cards**: Total tickets, open tickets, in progress, resolved
- **Status Charts**: Distribusi status ticket real-time
- **Recent Activity**: Aktivitas terbaru sistem
- **Quick Actions**: Akses cepat ke fitur utama

#### 3. Manajemen Ticket
- **Create Internal Ticket**: Buat ticket internal antar unit
- **Ticket List**: Lihat semua ticket dengan filter dan search
- **Assign Tickets**: Assign ticket ke staff yang tepat
- **Update Status**: Update status dan progress ticket
- **Add Responses**: Tambah komentar dan respon
- **Escalate**: Eskalasi manual ticket ke level yang lebih tinggi

#### 4. QR Code Management
- **Generate QR**: Buat QR code untuk setiap unit
- **Track Usage**: Pantau penggunaan QR code
- **Manage Access**: Kelola akses dan aktivasi QR code

#### 5. User Management
- **Add Users**: Tambah user baru dengan role tertentu
- **Manage Roles**: Kelola role dan permission
- **Unit Assignment**: Assign user ke unit tertentu

### Untuk Publik (Tanpa Login)

#### 1. Akses via QR Code
- Scan QR code unit yang tersedia di lokasi
- Isi form keluhan tanpa perlu registrasi
- Pilih jenis layanan (informasi, keluhan, saran)
- Upload attachment jika diperlukan
- Dapatkan nomor tracking untuk follow-up

#### 2. Tracking Ticket
```
URL: http://localhost:3000/ticket-tracker
```
- Masukkan nomor tracking yang diterima
- Lihat status dan progress ticket real-time
- Lihat respon dari petugas
- Download dokumen terkait jika ada

#### 3. Survey Kepuasan
- Terima link survey setelah ticket resolved
- Isi rating untuk berbagai aspek layanan
- Berikan feedback dan saran
- Submit untuk analisis kepuasan

## 🧪 Testing

### Menjalankan Tests

```bash
# Run semua tests
npm test

# Run tests dengan watch mode
npm run test:watch

# Run tests frontend saja
npm run test:frontend

# Run tests backend saja
npm run test:backend

# Run property-based tests
npm run test:properties
```

### Jenis Testing

#### 1. Unit Tests
- **Component Testing**: Test komponen React
- **Service Testing**: Test API service functions
- **Controller Testing**: Test API endpoints
- **Database Testing**: Test database operations

#### 2. Property-Based Tests
- **AI Classification**: Konsistensi klasifikasi AI
- **Role Permissions**: Validasi permission berdasarkan role
- **Data Integrity**: Integritas data dan referential integrity
- **Notification Delivery**: Verifikasi pengiriman notifikasi

#### 3. Integration Tests
- **End-to-End Flows**: Test complete user journeys
- **API Integration**: Test integrasi antar service
- **Database Transactions**: Test transaksi database
- **Real-time Features**: Test fitur real-time

### Test Coverage Target
- **Unit Tests**: 80% minimum
- **Integration Tests**: 70% minimum
- **Property Tests**: 100 iterations per property

## 🔒 Keamanan

### Implementasi Keamanan

#### 1. Authentication & Authorization
- **JWT Tokens**: Token-based authentication yang aman
- **Role-Based Access Control**: Kontrol akses granular berdasarkan role
- **Session Management**: Manajemen session yang aman
- **Password Hashing**: bcrypt untuk hashing password

#### 2. Data Protection
- **Input Validation**: Sanitasi input yang komprehensif
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **File Upload Security**: Validasi tipe dan ukuran file

#### 3. API Security
- **Rate Limiting**: Pencegahan abuse
- **CORS Configuration**: Konfigurasi cross-origin yang tepat
- **Request Validation**: Validasi schema request
- **Error Handling**: Response error yang aman

#### 4. Database Security
- **Row Level Security**: Supabase RLS policies
- **Encrypted Storage**: Enkripsi data sensitif
- **Audit Logging**: Comprehensive audit trails
- **Backup Strategy**: Strategi backup otomatis

### Security Best Practices

```typescript
// Input validation example
const validateTicketInput = (data: any) => {
  const schema = {
    title: { required: true, maxLength: 500 },
    description: { required: true, maxLength: 5000 },
    type: { required: true, enum: ['information', 'complaint', 'suggestion'] },
    priority: { enum: ['low', 'medium', 'high', 'critical'] }
  };
  
  return validateSchema(data, schema);
};

// Role-based access control
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

## 📊 Monitoring & Analytics

### Metrics yang Dipantau

#### 1. Performance Metrics
- **Response Time**: Waktu respon API (target < 200ms)
- **Throughput**: Request per detik
- **Error Rate**: Persentase error (target < 1%)
- **Uptime**: Availability sistem (target 99.9%)

#### 2. Business Metrics
- **Ticket Volume**: Jumlah ticket per periode
- **Resolution Time**: Waktu penyelesaian rata-rata
- **SLA Compliance**: Persentase SLA terpenuhi (target > 95%)
- **Satisfaction Score**: Skor kepuasan rata-rata (target > 4.0)

#### 3. AI Metrics (Future Implementation)
- **Classification Accuracy**: Akurasi klasifikasi AI
- **Confidence Scores**: Distribusi confidence score
- **Processing Time**: Waktu pemrosesan AI
- **Model Performance**: Performa model AI

### Dashboard Analytics

```typescript
// Real-time dashboard data structure
interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  overdueTickets: number;
  avgResolutionTime: number;
  slaCompliance: number;
  satisfactionScore: number;
  ticketsByCategory: CategoryStats[];
  ticketsByUnit: UnitStats[];
  recentActivity: Activity[];
}

// KPI calculation example
const calculateKPIs = async (timeframe: string) => {
  const tickets = await getTicketsInTimeframe(timeframe);
  
  return {
    totalVolume: tickets.length,
    avgResolutionTime: calculateAvgResolutionTime(tickets),
    slaCompliance: calculateSLACompliance(tickets),
    satisfactionScore: await getAvgSatisfactionScore(tickets),
    escalationRate: calculateEscalationRate(tickets)
  };
};
```

## 🚀 Deployment

### Production Deployment

#### 1. Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Set environment variables di Vercel dashboard:
# VITE_API_URL=https://your-backend-domain.railway.app/api
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

#### 2. Railway/Render (Backend)
```bash
# Deploy ke Railway
railway login
railway init
railway up

# Atau deploy ke Render via GitHub integration
# Set environment variables di dashboard
```

#### 3. Supabase (Database)
- Database sudah hosted di Supabase
- Setup production environment variables
- Configure production RLS policies
- Setup automated backups

### Environment Variables Production

```env
# Production Backend
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
JWT_SECRET=your_strong_production_secret_minimum_32_characters
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Production Frontend
VITE_API_URL=https://your-backend-domain.railway.app/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Health Checks

```typescript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbHealth = await checkDatabaseHealth();
    
    // Check external services
    const servicesHealth = await checkExternalServices();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      services: servicesHealth,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check Supabase connection
npm run test:connection

# Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test database query
curl -X GET "https://your-project.supabase.co/rest/v1/admins?select=count" \
  -H "apikey: your_anon_key"
```

#### 2. Authentication Problems
```bash
# Clear browser storage
localStorage.clear()
sessionStorage.clear()

# Check JWT token validity
# Open browser dev tools > Application > Local Storage

# Reset admin password via Supabase dashboard
# Or run reset script
npm run reset:admin
```

#### 3. File Upload Issues
```bash
# Check upload directory permissions
ls -la uploads/

# Verify file size limits in .env
echo $MAX_FILE_SIZE_MB

# Check disk space
df -h
```

#### 4. Real-time Issues
```bash
# Check Socket.io connection
# Open browser dev tools > Network > WS tab

# Verify CORS settings in server.ts
# Check allowedOrigins configuration
```

### Error Logging dan Debugging

```typescript
// Enable debug logging
process.env.DEBUG = 'app:*';

// Structured logging
const logger = {
  error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data),
  info: (msg: string, data?: any) => console.info(`[INFO] ${msg}`, data),
  debug: (msg: string, data?: any) => console.debug(`[DEBUG] ${msg}`, data)
};

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});
```

## 📚 API Documentation

### Authentication Endpoints

```typescript
// Login
POST /api/auth/login
Body: { email: string, password: string }
Response: { success: boolean, data: { admin: User, token: string } }

// Verify Token
GET /api/auth/verify
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, data: { admin: User } }

// Logout
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean }
```

### Ticket Management Endpoints

```typescript
// Get Tickets
GET /api/complaints/tickets
Query: { page?, limit?, status?, unit_id?, assigned_to? }
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, data: Ticket[], pagination: PaginationInfo }

// Create Ticket
POST /api/complaints/tickets
Body: CreateTicketRequest
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, data: Ticket }

// Update Ticket
PUT /api/complaints/tickets/:id
Body: UpdateTicketRequest
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, data: Ticket }

// Escalate Ticket
POST /api/complaints/tickets/:id/escalate
Body: { reason: string, to_user_id?: string }
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, data: Escalation }
```

### Public Endpoints (No Auth Required)

```typescript
// Submit Public Ticket
POST /api/public/tickets
Body: PublicTicketRequest
Response: { success: boolean, data: { ticket_number: string } }

// Track Ticket
GET /api/public/tickets/:ticket_number
Response: { success: boolean, data: PublicTicketInfo }

// QR Code Access
GET /api/public/qr/:token
Response: { success: boolean, data: { unit: Unit, form_config: FormConfig } }

// Submit via QR
POST /api/public/qr/:token/tickets
Body: PublicTicketRequest
Response: { success: boolean, data: { ticket_number: string } }
```

### Dashboard & Analytics Endpoints

```typescript
// Dashboard Metrics
GET /api/dashboard/metrics
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, data: DashboardMetrics }

// Generate Reports
GET /api/analytics/reports
Query: { type: string, period: string, format: 'pdf'|'excel' }
Headers: { Authorization: "Bearer <token>" }
Response: File download or { success: boolean, data: ReportData }

// KPI Data
GET /api/analytics/kpi
Query: { role: string, timeframe: string }
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, data: KPIData }
```

## 🎯 Roadmap & Future Enhancements

### Phase 1: Core Implementation ✅
- [x] Basic ticket management
- [x] Authentication system
- [x] Dashboard analytics
- [x] QR code access
- [x] File upload handling

### Phase 2: AI Integration (In Progress)
- [ ] Indonesian NLP classification
- [ ] Sentiment analysis
- [ ] Automatic routing
- [ ] Duplicate detection
- [ ] Smart escalation

### Phase 3: Advanced Features (Planned)
- [ ] WhatsApp integration
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Machine learning insights

### Phase 4: Enterprise Features (Future)
- [ ] Multi-tenant support
- [ ] Advanced reporting
- [ ] API rate limiting
- [ ] Audit compliance
- [ ] Integration APIs

## 🤝 Contributing

### Development Workflow

1. **Fork Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Changes**
4. **Run Tests**
   ```bash
   npm test
   npm run test:properties
   ```
5. **Commit Changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Create Pull Request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

### Testing Requirements

- Unit tests untuk semua functions
- Property-based tests untuk core logic
- Integration tests untuk API endpoints
- Minimum 80% code coverage

## 📄 License

MIT License - Silakan gunakan untuk kebutuhan Anda!

## 👨‍💻 Support & Contact

### Development Team
- **Project Lead**: [Nama Lead Developer]
- **Backend Developer**: [Nama Backend Dev]
- **Frontend Developer**: [Nama Frontend Dev]
- **QA Engineer**: [Nama QA]

### Technical Support
- **Email**: support@jempol-system.com
- **Documentation**: [Link ke dokumentasi teknis]
- **Issue Tracker**: [Link ke GitHub Issues]
- **Knowledge Base**: [Link ke knowledge base]

### Quick Links
- **Live Demo**: [Link ke demo]
- **API Documentation**: [Link ke API docs]
- **User Manual**: [Link ke user manual]
- **Video Tutorials**: [Link ke video tutorials]

---

**Dokumentasi ini dibuat untuk memastikan pemahaman yang komprehensif tentang sistem JEMPOL dan memfasilitasi maintenance, development, dan deployment yang efektif.**

*Terakhir diupdate: 30 Desember 2024*
*Versi Dokumentasi: 2.0*
*Versi Aplikasi: 1.0.0*

**Dibuat dengan ❤️ menggunakan teknologi modern dan best practices untuk melayani masyarakat dengan lebih baik! 🎉**