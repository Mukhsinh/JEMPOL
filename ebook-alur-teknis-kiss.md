# 📖 E-BOOK ALUR TEKNIS APLIKASI KISS
## (Kanal Informasi Saran dan Survei)

---

**Penulis dan Pengembang:**  
MUKHSIN HADI, SE, M.Si, CGAA, CPFRM, CSEP, CRP, CPRM, CSCAP, CPABC

**Hak Cipta:**  
aplikasiKISS@2024.Mukhsin Hadi. Hak Cipta dilindungi oleh Undang-Undang

**Kontak dan Dukungan:**
- 📧 support@kiss-app.com  
- 🌐 www.kiss-app.com  
- 📱 http://wa.me/085726112001  

---

## DAFTAR ISI

1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Database Schema dan Relasi](#database-schema-dan-relasi)
3. [API Architecture](#api-architecture)
4. [Alur Data dan Proses](#alur-data-dan-proses)
5. [Integrasi Sistem](#integrasi-sistem)
6. [Security Implementation](#security-implementation)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring dan Logging](#monitoring-dan-logging)
9. [Deployment Architecture](#deployment-architecture)

---

## 1. ARSITEKTUR SISTEM

### 1.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                       │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Web Client    │   Mobile PWA    │      Admin Panel            │
│   (React)       │   (React)       │      (React)                │
│                 │                 │                             │
│ - Public Forms  │ - QR Scanner    │ - Dashboard                 │
│ - Tracking      │ - Offline Mode  │ - User Management           │
│ - Surveys       │ - Push Notif    │ - Reports                   │
└─────────────────┴─────────────────┴─────────────────────────────┘
                                │
                    ┌─────────────────────┐
                    │    API GATEWAY      │
                    │                     │
                    │ - Authentication    │
                    │ - Rate Limiting     │
                    │ - Load Balancing    │
                    │ - Request Routing   │
                    └─────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Complaint      │   User          │    Notification             │
│  Service        │   Service       │    Service                  │
│                 │                 │                             │
│ - CRUD Ops      │ - Auth          │ - Multi-channel             │
│ - AI Process    │ - Role Mgmt     │ - Templates                 │
│ - Escalation    │ - Permissions   │ - Scheduling                │
│ - SLA Mgmt      │ - Profile       │ - Delivery                  │
└─────────────────┴─────────────────┴─────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   PostgreSQL    │   File Storage  │    Cache Layer              │
│   (Supabase)    │   (Local/Cloud) │    (Redis)                  │
│                 │                 │                             │
│ - Transactional │ - Attachments   │ - Session Data              │
│ - Real-time     │ - Documents     │ - Temp Data                 │
│ - Backup        │ - Media Files   │ - Query Cache               │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### 1.2 Technology Stack Detail

#### 1.2.1 Frontend Stack
- **React 18** + TypeScript
- **Vite** - Build tool modern dan cepat
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client untuk API calls
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icon library
- **Phaser** - Game engine untuk Innovation Catcher

#### 1.2.2 Backend Stack
- **Node.js** + Express.js
- **TypeScript** - Type safety dan developer experience
- **Supabase** - Database PostgreSQL dan Authentication
- **Socket.io** - Real-time features
- **Multer** - File upload handling
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Mongoose** - MongoDB ODM (untuk data legacy)

---

## 2. DATABASE SCHEMA DAN RELASI

### 2.1 Tabel Utama dan Struktur

#### 2.1.1 Tabel ADMINS
```sql
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) CHECK (role IN ('admin', 'superadmin')) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2.1.2 Tabel USERS
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id),
    employee_id VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    unit_id UUID REFERENCES units(id),
    role VARCHAR(50) CHECK (role IN ('staff', 'supervisor', 'manager', 'director', 'admin')) NOT NULL,
    role_id UUID REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2.1.3 Tabel UNITS
```sql
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    parent_unit_id UUID REFERENCES units(id),
    unit_type_id UUID REFERENCES unit_types(id),
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    sla_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2.1.4 Tabel TICKETS
```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) CHECK (type IN ('information', 'complaint', 'suggestion', 'satisfaction')) NOT NULL,
    category_id UUID REFERENCES service_categories(id),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    
    -- Submitter Information
    submitter_name VARCHAR(255),
    submitter_email VARCHAR(255),
    submitter_phone VARCHAR(50),
    submitter_address TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    
    -- Assignment and Routing
    unit_id UUID REFERENCES units(id) NOT NULL,
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    
    -- Status and Priority
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'medium',
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
);
```

### 2.2 Relasi Antar Tabel

#### 2.2.1 Entity Relationship Diagram
```
ADMINS (1) ──── (0..n) USERS
UNITS (1) ──── (0..n) USERS
UNITS (1) ──── (0..n) TICKETS
USERS (1) ──── (0..n) TICKETS (assigned_to)
USERS (1) ──── (0..n) TICKETS (created_by)
SERVICE_CATEGORIES (1) ──── (0..n) TICKETS
QR_CODES (1) ──── (0..n) TICKETS
TICKETS (1) ──── (0..n) TICKET_RESPONSES
TICKETS (1) ──── (0..n) TICKET_ATTACHMENTS
TICKETS (1) ──── (0..n) SATISFACTION_SURVEYS
```

#### 2.2.2 Tabel Pendukung

**SERVICE_CATEGORIES**
```sql
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    default_sla_hours INTEGER DEFAULT 24,
    requires_attachment BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**QR_CODES**
```sql
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES units(id) NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**TICKET_RESPONSES**
```sql
CREATE TABLE ticket_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(id) NOT NULL,
    responder_id UUID REFERENCES users(id) NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    response_type VARCHAR(50) DEFAULT 'comment',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. API ARCHITECTURE

### 3.1 RESTful API Design

#### 3.1.1 API Endpoints Structure
```
/api/v1/
├── auth/
│   ├── POST /login
│   ├── POST /logout
│   ├── GET /verify
│   └── POST /refresh
├── public/
│   ├── POST /tickets
│   ├── GET /tickets/:number
│   ├── GET /qr/:token
│   └── POST /qr/:token/tickets
├── tickets/
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id
│   ├── DELETE /:id
│   ├── POST /:id/responses
│   ├── POST /:id/escalate
│   └── POST /:id/assign
├── users/
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id
│   └── DELETE /:id
├── dashboard/
│   ├── GET /metrics
│   ├── GET /kpi
│   └── GET /analytics
└── reports/
    ├── GET /tickets
    ├── GET /satisfaction
    └── GET /performance
```

### 3.2 Authentication & Authorization

#### 3.2.1 JWT Token Structure
```typescript
interface JWTPayload {
  sub: string;        // User ID
  email: string;      // User email
  role: string;       // Primary role
  roles: string[];    // All roles
  unit_id?: string;   // Unit ID
  permissions: string[]; // Permissions
  iat: number;        // Issued at
  exp: number;        // Expires at
  iss: string;        // Issuer
}
```

#### 3.2.2 Permission System
```typescript
enum Permission {
  TICKET_VIEW = 'ticket:view',
  TICKET_CREATE = 'ticket:create',
  TICKET_UPDATE = 'ticket:update',
  TICKET_DELETE = 'ticket:delete',
  TICKET_ASSIGN = 'ticket:assign',
  TICKET_ESCALATE = 'ticket:escalate',
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  ADMIN_DASHBOARD = 'admin:dashboard',
  ADMIN_REPORTS = 'admin:reports',
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_SYSTEM = 'admin:system'
}
```

---

## 4. ALUR DATA DAN PROSES

### 4.1 Ticket Lifecycle

#### 4.1.1 Alur Pengajuan Keluhan
```
1. User Input (QR Code/Web) 
   ↓
2. Validation & Sanitization
   ↓
3. AI Processing (Classification, Sentiment)
   ↓
4. Auto Routing (Unit Assignment)
   ↓
5. Staff Assignment (Auto/Manual)
   ↓
6. Notification (Multi-channel)
   ↓
7. Processing & Response
   ↓
8. Escalation (if needed)
   ↓
9. Resolution
   ↓
10. Survey & Feedback
    ↓
11. Closure & Archival
```

#### 4.1.2 Status Transitions
```
Open → In Progress → Resolved → Closed
  ↓         ↓           ↓
Escalated → On Hold → Cancelled
```

### 4.2 AI Processing Pipeline

#### 4.2.1 Text Processing
```typescript
interface AIProcessingPipeline {
  preprocess: (text: string) => {
    cleaned: string;
    tokens: string[];
    features: TextFeatures;
  };
  
  classify: (features: TextFeatures) => {
    category: string;
    confidence: number;
    subcategories: string[];
  };
  
  analyzeSentiment: (text: string) => {
    score: number; // -1 to 1
    magnitude: number; // 0 to 1
    emotions: EmotionScores;
  };
  
  assessPriority: (classification: Classification, sentiment: Sentiment) => {
    priority: 'low' | 'medium' | 'high' | 'critical';
    urgency: number; // 1-5
    reasoning: string;
  };
}
```

### 4.3 Real-time Data Flow

#### 4.3.1 WebSocket Events
```typescript
// Client → Server Events
interface ClientEvents {
  'ticket:subscribe': (ticketId: string) => void;
  'ticket:unsubscribe': (ticketId: string) => void;
  'dashboard:subscribe': () => void;
  'notification:read': (notificationId: string) => void;
}

// Server → Client Events
interface ServerEvents {
  'ticket:created': (ticket: Ticket) => void;
  'ticket:updated': (ticket: Ticket) => void;
  'ticket:assigned': (assignment: Assignment) => void;
  'notification:new': (notification: Notification) => void;
  'dashboard:metrics': (metrics: DashboardMetrics) => void;
}
```

---

## 5. INTEGRASI SISTEM

### 5.1 External Services Integration

#### 5.1.1 Email Service
```typescript
interface EmailService {
  sendEmail(params: EmailParams): Promise<EmailResult>;
  sendBulkEmail(params: BulkEmailParams): Promise<BulkEmailResult>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}
```

#### 5.1.2 WhatsApp Integration
```typescript
interface WhatsAppService {
  sendMessage(params: WhatsAppMessageParams): Promise<WhatsAppResult>;
  sendTemplate(params: WhatsAppTemplateParams): Promise<WhatsAppResult>;
  getMessageStatus(messageId: string): Promise<MessageStatus>;
}
```

### 5.2 File Storage Strategy

#### 5.2.1 Hybrid Storage
```typescript
class HybridStorageService {
  private localStorage: LocalStorageService;
  private cloudStorage: CloudStorageService;
  
  async upload(file: Express.Multer.File): Promise<UploadResult> {
    const useCloud = file.size > this.config.cloudThreshold;
    
    if (useCloud) {
      return await this.cloudStorage.upload(file);
    } else {
      return await this.localStorage.upload(file);
    }
  }
}
```

---

## 6. SECURITY IMPLEMENTATION

### 6.1 Authentication Security

#### 6.1.1 Password Security
```typescript
class PasswordService {
  private readonly saltRounds = 12;
  
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
  
  validatePasswordStrength(password: string): ValidationResult {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    if (password.length < minLength) errors.push('Password must be at least 8 characters');
    if (!hasUpperCase) errors.push('Password must contain uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain lowercase letter');
    if (!hasNumbers) errors.push('Password must contain number');
    if (!hasSpecialChar) errors.push('Password must contain special character');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### 6.2 Input Validation & Sanitization

#### 6.2.1 Request Validation
```typescript
const ticketValidationSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 500,
    sanitize: true
  },
  description: {
    required: true,
    type: 'string',
    minLength: 10,
    maxLength: 5000,
    sanitize: true
  },
  type: {
    required: true,
    enum: ['information', 'complaint', 'suggestion', 'satisfaction']
  },
  submitter_email: {
    type: 'email',
    optional: true
  },
  submitter_phone: {
    type: 'phone',
    optional: true,
    pattern: /^(\+62|62|0)[0-9]{9,13}$/
  }
};
```

### 6.3 Data Protection

#### 6.3.1 Encryption
```typescript
class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
  
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

---

## 7. PERFORMANCE OPTIMIZATION

### 7.1 Database Optimization

#### 7.1.1 Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_unit_id ON tickets(unit_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_sla_deadline ON tickets(sla_deadline);

-- Composite indexes
CREATE INDEX idx_tickets_status_unit ON tickets(status, unit_id);
CREATE INDEX idx_tickets_assigned_status ON tickets(assigned_to, status);
```

#### 7.1.2 Query Optimization
```typescript
class TicketRepository {
  async getTicketsWithPagination(filters: TicketFilters, pagination: Pagination) {
    const query = this.supabase
      .from('tickets')
      .select(`
        *,
        unit:units(name, code),
        category:service_categories(name),
        assigned_user:users!assigned_to(full_name, email),
        responses:ticket_responses(count)
      `)
      .order(pagination.sortBy, { ascending: pagination.sortOrder === 'asc' })
      .range(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit - 1
      );
    
    // Apply filters
    if (filters.status) query.eq('status', filters.status);
    if (filters.unit_id) query.eq('unit_id', filters.unit_id);
    if (filters.assigned_to) query.eq('assigned_to', filters.assigned_to);
    if (filters.date_from) query.gte('created_at', filters.date_from);
    if (filters.date_to) query.lte('created_at', filters.date_to);
    
    return await query;
  }
}
```

### 7.2 Caching Strategy

#### 7.2.1 Redis Caching
```typescript
class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage in service
class DashboardService {
  async getMetrics(userId: string): Promise<DashboardMetrics> {
    const cacheKey = `dashboard:metrics:${userId}`;
    
    // Try cache first
    let metrics = await this.cache.get<DashboardMetrics>(cacheKey);
    
    if (!metrics) {
      // Calculate metrics
      metrics = await this.calculateMetrics(userId);
      
      // Cache for 5 minutes
      await this.cache.set(cacheKey, metrics, 300);
    }
    
    return metrics;
  }
}
```

---

## 8. MONITORING DAN LOGGING

### 8.1 Application Monitoring

#### 8.1.1 Metrics Collection
```typescript
class MetricsService {
  private metrics = {
    requests: new Map<string, number>(),
    responseTime: new Map<string, number[]>(),
    errors: new Map<string, number>(),
    activeUsers: new Set<string>()
  };
  
  recordRequest(endpoint: string, responseTime: number, statusCode: number) {
    // Count requests
    this.metrics.requests.set(
      endpoint, 
      (this.metrics.requests.get(endpoint) || 0) + 1
    );
    
    // Record response time
    if (!this.metrics.responseTime.has(endpoint)) {
      this.metrics.responseTime.set(endpoint, []);
    }
    this.metrics.responseTime.get(endpoint)!.push(responseTime);
    
    // Count errors
    if (statusCode >= 400) {
      this.metrics.errors.set(
        endpoint,
        (this.metrics.errors.get(endpoint) || 0) + 1
      );
    }
  }
  
  getMetrics() {
    return {
      totalRequests: Array.from(this.metrics.requests.values()).reduce((a, b) => a + b, 0),
      averageResponseTime: this.calculateAverageResponseTime(),
      errorRate: this.calculateErrorRate(),
      activeUsers: this.metrics.activeUsers.size
    };
  }
}
```

#### 8.1.2 Health Checks
```typescript
class HealthCheckService {
  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkFileStorage(),
      this.checkExternalServices()
    ]);
    
    const results = checks.map((check, index) => ({
      service: ['database', 'redis', 'storage', 'external'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: check.status === 'fulfilled' ? check.value : check.reason
    }));
    
    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: results,
      uptime: process.uptime()
    };
  }
}
```

### 8.2 Logging Strategy

#### 8.2.1 Structured Logging
```typescript
class Logger {
  private winston: winston.Logger;
  
  constructor() {
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }
  
  info(message: string, meta?: any) {
    this.winston.info(message, meta);
  }
  
  error(message: string, error?: Error, meta?: any) {
    this.winston.error(message, { error: error?.stack, ...meta });
  }
  
  warn(message: string, meta?: any) {
    this.winston.warn(message, meta);
  }
  
  debug(message: string, meta?: any) {
    this.winston.debug(message, meta);
  }
}
```

---

## 9. DEPLOYMENT ARCHITECTURE

### 9.1 Production Deployment

#### 9.1.1 Infrastructure Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:5000/api
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=kiss_db
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 9.1.2 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 9.2 Monitoring & Alerting

#### 9.2.1 Application Monitoring
```typescript
// Monitoring middleware
const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Record metrics
    metricsService.recordRequest(
      req.route?.path || req.path,
      responseTime,
      res.statusCode
    );
    
    // Log request
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};
```

---

**Dokumentasi teknis ini memberikan panduan lengkap untuk memahami arsitektur, implementasi, dan operasional sistem KISS. Setiap bagian dirancang untuk memfasilitasi development, maintenance, dan scaling yang efektif.**

---

*© 2024 MUKHSIN HADI, SE, M.Si, CGAA, CPFRM, CSEP, CRP, CPRM, CSCAP, CPABC*  
*aplikasiKISS@2024.Mukhsin Hadi. Hak Cipta dilindungi oleh Undang-Undang*

**Kontak dan Dukungan:**
- 📧 support@kiss-app.com  
- 🌐 www.kiss-app.com  
- 📱 http://wa.me/085726112001