# 📋 Dokumentasi Sistem Manajemen Keluhan AI-Powered

## 🎯 Gambaran Umum

Sistem Manajemen Keluhan AI-Powered adalah platform enterprise yang dibangun di atas platform inovasi JEMPOL (Jembatan Pembayaran Online) yang sudah ada. Sistem ini dirancang khusus untuk institusi publik seperti rumah sakit dan instansi pemerintah untuk mengelola permintaan informasi, keluhan, saran, dan survei kepuasan secara terpusat.

### ✨ Fitur Utama

#### 🔓 Akses Publik Tanpa Login
- **QR Code Scanner**: Akses langsung ke form keluhan melalui QR code unit-specific
- **Form Publik**: Pengajuan keluhan tanpa memerlukan registrasi
- **Tracking Nomor**: Sistem pelacakan keluhan dengan nomor unik
- **Opsi Anonim**: Pengajuan keluhan tanpa identitas pribadi

#### 🤖 AI-Powered Classification
- **NLP Indonesia**: Analisis otomatis konten dalam bahasa Indonesia
- **Klasifikasi Otomatis**: Penentuan jenis layanan dan tingkat urgensi
- **Sentiment Analysis**: Analisis sentimen untuk prioritas
- **Routing Cerdas**: Penyaluran otomatis ke unit yang tepat

#### 👥 Manajemen Role-Based
- **Multi-Level Access**: Staff, Supervisor, Manager, Director, Admin
- **Permission Control**: Kontrol akses berdasarkan peran dan unit
- **Dynamic Forms**: Form yang menyesuaikan dengan peran pengguna
- **Escalation Chain**: Rantai eskalasi otomatis berdasarkan hierarki

#### 📊 Dashboard Real-Time
- **Live Analytics**: Statistik real-time dengan update otomatis
- **KPI Monitoring**: Pemantauan indikator kinerja utama
- **SLA Tracking**: Pelacakan Service Level Agreement
- **Visual Reports**: Grafik dan chart interaktif

#### 🔔 Sistem Notifikasi Multi-Channel
- **Web Notifications**: Notifikasi dalam aplikasi
- **Email Alerts**: Pemberitahuan via email
- **WhatsApp Integration**: Notifikasi WhatsApp (opsional)
- **SMS Gateway**: Pemberitahuan SMS (opsional)

#### 📈 Survey & Analytics
- **Satisfaction Surveys**: Survei kepuasan otomatis
- **AI Analytics**: Analisis AI untuk tren dan pola
- **Performance Reports**: Laporan kinerja komprehensif
- **Export Capabilities**: Export data ke PDF dan Excel

## 🏗️ Arsitektur Sistem

### Stack Teknologi

#### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool modern
- **Tailwind CSS** - Styling utility-first
- **React Router** - Navigasi SPA
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication

#### Backend
- **Node.js** + Express.js
- **TypeScript** - Type safety
- **Supabase** - Database dan Authentication
- **Socket.io** - Real-time features
- **Multer** - File upload handling
- **JWT** - Authentication tokens

#### Database
- **PostgreSQL** (via Supabase)
- **Row Level Security** (RLS)
- **Real-time subscriptions**
- **Automatic backups**

#### Testing
- **Vitest** - Unit testing framework
- **fast-check** - Property-based testing
- **React Testing Library** - Component testing

### Struktur Database

#### Tabel Utama

```sql
-- Units/Departments
units (
  id, name, code, parent_unit_id, 
  description, contact_email, contact_phone,
  sla_hours, is_active, created_at, updated_at
)

-- Service Categories
service_categories (
  id, name, code, description,
  default_sla_hours, requires_attachment,
  is_active, created_at, updated_at
)

-- Users (extends existing admins table)
users (
  id, admin_id, employee_id, full_name,
  email, phone, unit_id, role,
  is_active, created_at, updated_at
)

-- Tickets (core complaint management)
tickets (
  id, ticket_number, type, category_id,
  title, description, submitter_name,
  submitter_email, submitter_phone,
  submitter_address, is_anonymous,
  unit_id, assigned_to, created_by,
  status, priority, urgency_level,
  ai_classification, sentiment_score,
  confidence_score, sla_deadline,
  first_response_at, resolved_at,
  source, qr_code_id, ip_address,
  user_agent, created_at, updated_at
)

-- QR Codes for Units
qr_codes (
  id, unit_id, code, token, name,
  description, is_active, usage_count,
  created_at, updated_at
)

-- Ticket Responses
ticket_responses (
  id, ticket_id, responder_id, message,
  is_internal, response_type,
  created_at, updated_at
)

-- Ticket Escalations
ticket_escalations (
  id, ticket_id, from_user_id, to_user_id,
  from_role, to_role, reason,
  escalation_type, escalated_at, created_at
)

-- Satisfaction Surveys
satisfaction_surveys (
  id, ticket_id, overall_score,
  response_time_score, solution_quality_score,
  staff_courtesy_score, comments,
  submitted_at, created_at
)

-- Notifications
notifications (
  id, user_id, ticket_id, type,
  title, message, channels,
  is_read, sent_at, created_at
)

-- AI Processing Logs
ai_logs (
  id, ticket_id, operation,
  input_data, output_data,
  confidence_score, processing_time_ms,
  model_version, created_at
)

-- File Attachments
ticket_attachments (
  id, ticket_id, file_name,
  file_path, file_size, mime_type,
  uploaded_by, created_at
)
```

## 🚀 Instalasi dan Setup

### Prerequisites
- Node.js 18+
- npm atau yarn
- Akun Supabase
- Git

### Langkah Instalasi

#### 1. Clone Repository
```bash
git clone <repository-url>
cd complaint-management-system
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
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE_MB=100
UPLOAD_PATH=./uploads

# AI Configuration (optional)
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

#### 3. Setup Database

**Jalankan migrasi database:**
```bash
# Setup tabel dan data awal
npm run setup:database

# Atau manual via Supabase Dashboard
# Import file: database/schema.sql
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

### 🔧 Konfigurasi Supabase

#### 1. Buat Project Supabase
1. Buka [supabase.com](https://supabase.com)
2. Buat project baru
3. Catat URL dan API keys

#### 2. Setup Authentication
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

#### 3. Setup Real-time
```sql
-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_responses;
```

## 📱 Penggunaan Aplikasi

### Untuk Admin/Staff

#### 1. Login
- Buka `http://localhost:3000/login`
- Masukkan email dan password admin
- Sistem akan redirect ke dashboard

#### 2. Dashboard
- **Overview**: Statistik umum tickets
- **Recent Tickets**: Ticket terbaru
- **SLA Status**: Status SLA real-time
- **Performance Metrics**: Metrik kinerja

#### 3. Manajemen Ticket
- **Create Internal Ticket**: Buat ticket internal
- **Assign Tickets**: Assign ticket ke staff
- **Update Status**: Update status ticket
- **Add Responses**: Tambah respon/komentar
- **Escalate**: Eskalasi manual ticket

#### 4. QR Code Management
- **Generate QR**: Buat QR code untuk unit
- **Track Usage**: Pantau penggunaan QR
- **Manage Access**: Kelola akses QR code

### Untuk Publik

#### 1. Akses via QR Code
- Scan QR code unit yang tersedia
- Isi form keluhan tanpa login
- Dapatkan nomor tracking

#### 2. Tracking Ticket
- Buka `http://localhost:3000/ticket-tracker`
- Masukkan nomor tracking
- Lihat status dan progress

#### 3. Survey Kepuasan
- Terima link survey setelah ticket resolved
- Isi rating dan feedback
- Submit untuk analisis

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
- Component testing (React)
- Service function testing
- API endpoint testing
- Database operation testing

#### 2. Property-Based Tests
- AI classification consistency
- Role permission validation
- Data integrity checks
- Notification delivery verification

#### 3. Integration Tests
- End-to-end user flows
- API integration testing
- Database transaction testing
- Real-time feature testing

### Test Coverage

Target coverage minimum:
- **Unit Tests**: 80%
- **Integration Tests**: 70%
- **Property Tests**: 100 iterations per property

## 🔒 Keamanan

### Implementasi Keamanan

#### 1. Authentication & Authorization
- **JWT Tokens**: Secure token-based auth
- **Role-Based Access**: Granular permission control
- **Session Management**: Secure session handling
- **Password Hashing**: bcrypt untuk password

#### 2. Data Protection
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **File Upload Security**: Type dan size validation

#### 3. API Security
- **Rate Limiting**: Prevent abuse
- **CORS Configuration**: Proper cross-origin setup
- **Request Validation**: Schema validation
- **Error Handling**: Secure error responses

#### 4. Database Security
- **Row Level Security**: Supabase RLS policies
- **Encrypted Storage**: Sensitive data encryption
- **Audit Logging**: Comprehensive audit trails
- **Backup Strategy**: Automated backups

### Best Practices

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
- **Response Time**: Waktu respon API
- **Throughput**: Jumlah request per detik
- **Error Rate**: Persentase error
- **Uptime**: Availability sistem

#### 2. Business Metrics
- **Ticket Volume**: Jumlah ticket per periode
- **Resolution Time**: Waktu penyelesaian rata-rata
- **SLA Compliance**: Persentase SLA terpenuhi
- **Satisfaction Score**: *: Maintenance dokumentasi teknis
- **User Training**: Training untuk admin dan staff
- **System Updates**: Prosedur update sistem yang aman

## 📞 Kontak & Support

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

---

**Dokumentasi ini dibuat untuk memastikan pemahaman yang komprehensif tentang sistem JEMPOL dan memfasilitasi maintenance, development, dan deployment yang efektif.**

*Terakhir diupdate: [Tanggal]*
*Versi Dokumentasi: 1.0*Skor kepuasan rata-rata

#### 3. AI Metrics
- **Classification Accuracy**: Akurasi klasifikasi AI
- **Confidence Scores**: Distribusi confidence score
- **Processing Time**: Waktu pemrosesan AI
- **Model Performance**: Performa model AI

### Dashboard Analytics

```typescript
// Real-time dashboard data
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

// KPI calculation
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

# Set environment variables di Vercel dashboard
```

#### 2. Railway/Render (Backend)
```bash
# Deploy ke Railway
railway login
railway init
railway up

# Atau deploy ke Render via GitHub integration
```

#### 3. Supabase (Database)
- Database sudah hosted di Supabase
- Setup production environment variables
- Configure production policies

### Environment Variables Production

```env
# Production Backend
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
JWT_SECRET=your_strong_production_secret
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
```

#### 2. Authentication Problems
```bash
# Clear browser storage
localStorage.clear()

# Check JWT token validity
npm run verify:token

# Reset admin password
npm run reset:admin
```

#### 3. File Upload Issues
```bash
# Check upload directory permissions
ls -la uploads/

# Verify file size limits
# Check MAX_FILE_SIZE_MB in .env
```

#### 4. Real-time Issues
```bash
# Check Socket.io connection
# Open browser dev tools > Network > WS

# Verify CORS settings
# Check allowedOrigins in server.ts
```

### Logs dan Debugging

```typescript
// Enable debug logging
process.env.DEBUG = 'app:*';

// Log levels
const logger = {
  error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data),
  info: (msg: string, data?: any) => console.info(`[INFO] ${msg}`, data),
  debug: (msg: string, data?: any) => console.debug(`[DEBUG] ${msg}`, data)
};

// Error tracking
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

### Public Endpoints

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

## 👨‍💻 Support

Untuk bantuan dan support:
- **Email**: support@example.com
- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues]
- **Discord**: [Community Discord]

---

**Dibuat dengan ❤️ menggunakan teknologi modern dan best practices untuk melayani masyarakat dengan lebih baik! 🎉**