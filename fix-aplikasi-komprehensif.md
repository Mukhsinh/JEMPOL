# 📋 DOKUMENTASI APLIKASI KOMPREHENSIF - JEMPOL (Jembatan Pembayaran Online)

## 🏗️ ARSITEKTUR APLIKASI

### Gambaran Umum
JEMPOL adalah aplikasi web full-stack yang terdiri dari:
- **Frontend**: React 18 + TypeScript dengan Vite
- **Backend**: Node.js + Express + TypeScript  
- **Database**: Supabase (PostgreSQL) dengan fallback MongoDB
- **Authentication**: Supabase Auth dengan JWT
- **Real-time**: Socket.io untuk notifikasi
- **Deployment**: Vercel (Frontend) + API Routes

### Struktur Monorepo
```
innovation-landing-page/
├── frontend/           # React Frontend (Port 3002)
├── backend/           # Express Backend (Port 3004)
├── api/              # Vercel API Routes
├── uploads/          # File storage
└── scripts/          # Utility scripts
```

## 🔐 SISTEM AUTENTIKASI

### Konfigurasi Auth
- **Provider**: Supabase Auth
- **Method**: Email/Password dengan JWT
- **Session**: Persistent dengan localStorage
- **Timeout**: 5 detik untuk login, 3 detik untuk inisialisasi
- **Retry**: 2 kali untuk profile fetch

### Flow Autentikasi
1. **Login Process**:
   ```
   User Input → Supabase Auth → Admin Profile Check → JWT Token → Session Storage
   ```

2. **Session Management**:
   ```
   App Init → Check Session → Validate Admin → Set User Context
   ```

3. **Protected Routes**:
   ```
   Route Access → Auth Check → Admin Role Check → Component Render
   ```

### Kredensial Default
- **Email**: admin@jempol.com
- **Password**: admin123
- **Role**: admin/superadmin

## 🗄️ STRUKTUR DATABASE

### Supabase Tables
```sql
-- Core Tables
admins              # Admin users dengan role-based access
tickets             # Sistem tiket/complaint management
units               # Unit/departemen organisasi
unit_types          # Kategori unit
service_categories  # Kategori layanan
patient_types       # Tipe pasien
ticket_statuses     # Status tiket
ticket_types        # Jenis tiket
ticket_classifications # Klasifikasi tiket

-- Settings & Configuration
sla_settings        # Service Level Agreement
roles               # Role management
response_templates  # Template respons
app_settings        # Pengaturan aplikasi
notification_settings # Pengaturan notifikasi

-- Survey & Feedback
surveys             # Data survei
survey_responses    # Respons survei

-- QR & External
qr_codes           # QR code management
external_tickets   # Tiket eksternal

-- Escalation & AI
escalation_rules   # Aturan eskalasi
escalation_logs    # Log eskalasi
ai_trust_settings  # Pengaturan AI

-- Audit & Logs
audit_logs         # Log aktivitas
```

### Konfigurasi Database
- **Mode**: Supabase (primary), MongoDB (fallback)
- **Connection**: Pool dengan timeout 45 detik (backend), 5 detik (frontend)
- **RLS**: Row Level Security enabled
- **Auth**: Service role key untuk backend operations

## 🌐 API ENDPOINTS

### Authentication Routes (`/api/auth`)
```typescript
POST /login          # Login admin
POST /logout         # Logout
GET  /verify         # Verify token
POST /refresh        # Refresh token
```

### Core Business Routes
```typescript
# Ticket Management
GET    /api/complaints           # List tickets
POST   /api/complaints           # Create ticket
PUT    /api/complaints/:id       # Update ticket
DELETE /api/complaints/:id       # Delete ticket

# Unit Management
GET    /api/units               # List units
POST   /api/units               # Create unit
PUT    /api/units/:id           # Update unit
DELETE /api/units/:id           # Delete unit

# User Management
GET    /api/users               # List users
POST   /api/users               # Create user
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user

# Master Data
GET    /api/master-data/*       # Various master data endpoints
POST   /api/master-data/*       # CRUD operations

# Reports & Analytics
GET    /api/reports             # Generate reports
GET    /api/reports/export      # Export data
```

### Public Routes (No Auth Required)
```typescript
GET  /api/public/units          # Public unit list
GET  /api/public/survey         # Public survey
POST /api/public/survey         # Submit survey
GET  /api/public/ticket-tracker # Track ticket
```

### Settings & Configuration
```typescript
GET    /api/app-settings        # App configuration
PUT    /api/app-settings        # Update settings
GET    /api/sla-settings        # SLA configuration
POST   /api/qr-codes           # QR management
GET    /api/escalation         # Escalation rules
```

## 🎨 FRONTEND ARCHITECTURE

### Component Structure
```
src/
├── components/          # Reusable components
│   ├── ui/             # Basic UI components
│   ├── layout/         # Layout components
│   ├── forms/          # Form components
│   └── modals/         # Modal components
├── pages/              # Page components
│   ├── tickets/        # Ticket management
│   ├── settings/       # Settings pages
│   ├── master-data/    # Master data pages
│   ├── survey/         # Survey pages
│   └── users/          # User management
├── services/           # API services
├── contexts/           # React contexts
├── utils/              # Utilities
└── types/              # TypeScript types
```

### State Management
- **Auth State**: React Context (`AuthContext`)
- **API State**: Axios dengan interceptors
- **Local State**: React hooks (useState, useEffect)
- **Form State**: Controlled components

### Routing System
```typescript
// Public Routes
/login                  # Login page
/ticket-tracker         # Public ticket tracking
/survey/public          # Public survey
/buku-petunjuk         # Documentation

// Protected Admin Routes (require authentication)
/dashboard             # Main dashboard
/tickets/*             # Ticket management
/users/*               # User management
/master-data/*         # Master data management
/settings/*            # Settings
/reports               # Reports & analytics
```

## 🔧 BACKEND ARCHITECTURE

### Server Configuration
```typescript
// Express Setup
- CORS: Multi-origin support
- Body Parser: JSON + URL encoded (1100MB limit)
- File Upload: Multer with size limits
- Socket.io: Real-time communication
- Static Files: /uploads serving
```

### Middleware Stack
```typescript
1. CORS Middleware       # Cross-origin requests
2. Body Parser          # Request parsing
3. Authentication       # JWT verification
4. Authorization        # Role-based access
5. Error Handler        # Global error handling
```

### Database Integration
```typescript
// Supabase Client
- Service Role Key: Backend operations
- Anon Key: Frontend operations
- Connection Pool: Optimized for performance
- RLS Bypass: Service role for admin operations
```

## 📱 FITUR UTAMA APLIKASI

### 1. Dashboard & Analytics
- **Statistik Real-time**: Tiket, unit, pengguna
- **Grafik Performa**: Chart.js integration
- **Filter & Search**: Advanced filtering
- **Export Data**: PDF, Excel, CSV

### 2. Ticket Management System
- **Create Ticket**: Internal & external
- **Ticket Tracking**: Public tracking dengan QR
- **Status Management**: Workflow-based status
- **Escalation**: Automated escalation rules
- **SLA Monitoring**: Service level tracking

### 3. QR Code Management
- **Generate QR**: Untuk tiket eksternal
- **QR Tracking**: Track via QR code
- **Bulk Generation**: Mass QR creation
- **QR Analytics**: Usage statistics

### 4. Survey System
- **Public Survey**: No authentication required
- **Survey Builder**: Dynamic form creation
- **Response Analytics**: Survey reporting
- **Export Results**: Data export

### 5. Master Data Management
- **Units**: Organizational units
- **Unit Types**: Unit categorization
- **Service Categories**: Service classification
- **Patient Types**: Patient categorization
- **SLA Settings**: Service level agreements
- **Roles & Permissions**: Access control

### 6. User Management
- **Admin Users**: Role-based access
- **Profile Management**: User profiles
- **Permission System**: Granular permissions
- **Activity Logs**: User activity tracking

### 7. Settings & Configuration
- **App Settings**: Global configuration
- **Notification Settings**: Real-time notifications
- **Response Templates**: Predefined responses
- **AI Trust Settings**: AI integration settings

### 8. Reports & Analytics
- **Performance Reports**: KPI tracking
- **Export Functions**: Multiple formats
- **Custom Reports**: Configurable reports
- **Real-time Data**: Live updates

## 🔄 INTEGRASI FRONTEND-BACKEND

### API Communication
```typescript
// Frontend Service Layer
class ApiService {
  baseURL: string = process.env.VITE_API_URL
  timeout: number = 5000
  
  // Interceptors
  - Request: Add auth headers
  - Response: Handle errors
  - Retry: Failed requests
}
```

### Authentication Flow
```typescript
// Frontend Auth Context
1. Initialize → Check session → Validate admin
2. Login → Supabase auth → Admin profile → Set context
3. API calls → Add JWT header → Backend verification
4. Token refresh → Automatic renewal
```

### Error Handling
```typescript
// Global Error Handling
Frontend: Try-catch + user notifications
Backend: Express error middleware
Database: Connection retry logic
Network: Timeout + retry mechanism
```

## 🚀 DEPLOYMENT & PRODUCTION

### Environment Configuration
```bash
# Backend (.env)
PORT=3004
SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_MODE=supabase
JWT_SECRET=your-secret-key

# Frontend (.env)
VITE_API_URL=http://localhost:3004/api
VITE_SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build"
    },
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/[...slug]"
    }
  ]
}
```

### Build Process
```bash
# Development
npm run dev                 # Start both frontend & backend

# Production Build
npm run build              # Build both applications
npm run build:frontend     # Frontend only
npm run vercel-build       # Vercel-specific build
```

## 🔒 KEAMANAN & PERFORMANCE

### Security Measures
- **Authentication**: JWT dengan expiry
- **Authorization**: Role-based access control
- **Input Validation**: Sanitization & validation
- **File Upload**: Type & size restrictions
- **CORS**: Configured origins
- **RLS**: Row Level Security di Supabase

### Performance Optimizations
- **Connection Pooling**: Database connections
- **Caching**: API response caching
- **Code Splitting**: Lazy loading components
- **Image Optimization**: Compressed uploads
- **Bundle Optimization**: Tree shaking
- **CDN**: Static asset delivery

### Monitoring & Logging
- **Error Tracking**: Console logging
- **Performance Monitoring**: Response times
- **User Activity**: Audit logs
- **Database Monitoring**: Query performance

## 🧪 TESTING & QUALITY

### Testing Strategy
```typescript
// Frontend Testing
- Unit Tests: Component testing
- Integration Tests: API integration
- E2E Tests: User workflows

// Backend Testing
- Unit Tests: Controller testing
- Integration Tests: Database operations
- API Tests: Endpoint testing
```

### Code Quality
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Property-based Testing**: fast-check

## 📚 DOKUMENTASI & MAINTENANCE

### Documentation Files
- `README.md`: Project overview
- `CHANGELOG.md`: Version history
- `TROUBLESHOOTING.md`: Common issues
- `DEPLOYMENT_GUIDE.md`: Deployment instructions
- Various `.md` files: Feature documentation

### Maintenance Scripts
```bash
# Database
npm run test:database      # Test DB connection
npm run migrate           # Run migrations

# Development
npm run dev:fast          # Fast development mode
npm run build:fast        # Fast build mode

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
```

## 🎯 FITUR KHUSUS & INOVASI

### 1. Buku Petunjuk Digital
- **E-book Integration**: HTML-based documentation
- **PDF Generation**: Dynamic PDF creation
- **Multi-format Support**: HTML, PDF export
- **Responsive Reading**: Mobile-optimized

### 2. Real-time Notifications
- **Socket.io Integration**: Live updates
- **Push Notifications**: Browser notifications
- **Email Notifications**: SMTP integration
- **SMS Integration**: SMS gateway support

### 3. AI Integration
- **AI Escalation**: Intelligent ticket routing
- **AI Trust Settings**: Confidence scoring
- **Response Suggestions**: AI-powered responses
- **Sentiment Analysis**: Ticket sentiment

### 4. Mobile Optimization
- **PWA Support**: Progressive Web App
- **Touch Optimization**: Mobile gestures
- **Responsive Design**: All screen sizes
- **Offline Support**: Service worker

### 5. Multi-language Support
- **Bahasa Indonesia**: Primary language
- **English**: Secondary language
- **Dynamic Translation**: Runtime translation
- **Locale Management**: Date, number formatting

## 🔧 TROUBLESHOOTING UMUM

### Connection Issues
```bash
# Check Supabase connection
npm run test:connection

# Verify environment variables
npm run check:env

# Test API endpoints
npm run test:api
```

### Authentication Problems
```bash
# Reset admin password
node scripts/reset-admin.js

# Verify JWT configuration
npm run verify:jwt

# Check RLS policies
npm run check:rls
```

### Performance Issues
```bash
# Monitor performance
npm run monitor

# Check bundle size
npm run analyze

# Database performance
npm run db:analyze
```

## 📈 ROADMAP & FUTURE ENHANCEMENTS

### Planned Features
1. **Advanced Analytics**: Machine learning insights
2. **Mobile App**: React Native version
3. **API Gateway**: Microservices architecture
4. **Advanced Security**: 2FA, OAuth integration
5. **Workflow Engine**: Custom workflow builder
6. **Integration Hub**: Third-party integrations

### Technical Improvements
1. **GraphQL**: Replace REST APIs
2. **Redis Caching**: Performance optimization
3. **Kubernetes**: Container orchestration
4. **CI/CD Pipeline**: Automated deployment
5. **Monitoring**: APM integration
6. **Load Balancing**: High availability

---

## 📞 SUPPORT & CONTACT

Untuk pertanyaan teknis atau dukungan:
- **Email**: admin@jempol.com
- **Documentation**: `/buku-petunjuk`
- **Issue Tracking**: GitHub Issues
- **Development Team**: RSUD Bendan Kota Pekalongan

---

**Dokumentasi ini mencakup seluruh aspek aplikasi JEMPOL dari arsitektur hingga deployment. Aplikasi telah terintegrasi dengan baik antara frontend dan backend dengan sistem autentikasi yang robust dan fitur-fitur lengkap untuk manajemen tiket, survei, dan administrasi.**