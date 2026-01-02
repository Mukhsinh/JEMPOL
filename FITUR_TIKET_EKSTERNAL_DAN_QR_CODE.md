# Fitur Tiket Eksternal dan QR Code Management

## Ringkasan Implementasi

Telah berhasil dibuat 3 halaman submenu baru di bawah menu 'Tickets' dengan integrasi database lengkap:

### 1. Halaman Tiket Eksternal (`/tiket-eksternal`)
**Fitur Utama:**
- Formulir pengaduan publik yang dapat diakses tanpa login
- Support untuk identitas pribadi atau anonim
- Klasifikasi AI otomatis untuk prioritas dan urgensi
- Upload lampiran file (JPG, PNG, PDF max 5MB)
- Captcha verification
- Tracking nomor tiket otomatis
- Integrasi dengan QR Code untuk unit terverifikasi

**Teknologi:**
- Frontend: React TypeScript dengan Tailwind CSS
- Backend: Express.js dengan Multer untuk file upload
- Database: Tabel `external_tickets` dengan AI classification
- AI: Simulasi klasifikasi berdasarkan keyword analysis

### 2. Halaman QR Code Management (`/tickets/qr-management`)
**Fitur Utama:**
- Generate QR Code untuk setiap unit
- Tracking analytics (scan count, ticket count, conversion rate)
- Status management (aktif/tidak aktif)
- Print QR Code functionality
- Performance monitoring dengan sparkline charts
- Search dan filter berdasarkan unit, status, lokasi

**Teknologi:**
- QR Code generation dengan unique token
- Analytics tracking dalam tabel `qr_code_analytics`
- Real-time usage statistics
- Export functionality untuk laporan

### 3. Halaman AI-Driven Escalation Management (`/tickets/ai-escalation`)
**Fitur Utama:**
- Konfigurasi aturan eskalasi otomatis
- AI confidence threshold settings
- Workflow visualization (Petugas → Kepala Unit → Manager → Direktur)
- Rule-based escalation berdasarkan jenis layanan, kategori, prioritas
- Statistics dashboard dengan metrics:
  - Auto-escalated tickets
  - AI confidence score
  - SLA at risk
  - Active rules
- Execution logs dan audit trail

**Teknologi:**
- Tabel `ai_escalation_rules` untuk konfigurasi
- Tabel `ai_escalation_logs` untuk tracking eksekusi
- Auto-escalation checker untuk cron jobs
- Real-time monitoring dashboard

## Struktur Database Baru

### Tabel `external_tickets`
```sql
- id (UUID, Primary Key)
- ticket_number (VARCHAR, Unique)
- qr_code_id (UUID, Foreign Key ke qr_codes)
- unit_id (UUID, Foreign Key ke units)
- reporter_identity_type (VARCHAR: 'personal'/'anonymous')
- reporter_name, reporter_email, reporter_phone, reporter_address
- service_type (VARCHAR: 'complaint'/'request'/'suggestion'/'survey')
- category, title, description
- status, priority, urgency_level
- ai_classification (JSONB)
- sentiment_score, confidence_score
- sla_deadline, first_response_at, resolved_at
- ip_address, user_agent, source
- created_at, updated_at
```

### Tabel `qr_code_analytics`
```sql
- id (UUID, Primary Key)
- qr_code_id (UUID, Foreign Key)
- scan_date (DATE)
- scan_count, ticket_count, unique_visitors (INTEGER)
- created_at
```

### Tabel `ai_escalation_rules`
```sql
- id (UUID, Primary Key)
- name, description
- service_types, categories, priority_levels (JSONB Arrays)
- urgency_threshold, confidence_threshold, sentiment_threshold
- from_role, to_role, skip_levels
- escalation_time_hours, sla_breach_escalation
- is_active, execution_count, success_count
- created_by, created_at, updated_at
```

### Tabel `ai_escalation_logs`
```sql
- id (UUID, Primary Key)
- rule_id, ticket_id, ticket_type
- triggered_by, confidence_score, execution_status
- from_user_id, to_user_id, from_role, to_role
- error_message, executed_at
```

## API Endpoints Baru

### External Tickets API (`/api/external-tickets`)
- `POST /` - Create external ticket (public)
- `GET /` - Get external tickets (admin)
- `GET /:id` - Get external ticket by ID (admin)
- `PATCH /:id/status` - Update ticket status (admin)
- `GET /stats` - Get statistics (admin)

### QR Codes API (`/api/qr-codes`)
- `GET /scan/:code` - Get QR code by code (public)
- `POST /` - Create QR code (admin)
- `GET /` - Get QR codes (admin)
- `PATCH /:id` - Update QR code (admin)
- `DELETE /:id` - Delete QR code (admin)
- `GET /:id/analytics` - Get analytics (admin)
- `GET /stats` - Get statistics (admin)

### AI Escalation API (`/api/ai-escalation`)
- `POST /rules` - Create escalation rule
- `GET /rules` - Get escalation rules
- `PATCH /rules/:id` - Update escalation rule
- `DELETE /rules/:id` - Delete escalation rule
- `POST /execute` - Execute escalation rule
- `POST /check-auto` - Check auto escalation
- `GET /stats` - Get escalation statistics
- `GET /logs` - Get escalation logs

## Fitur Keamanan

### Public Access
- Rate limiting untuk prevent spam
- Captcha verification
- File upload validation (type, size)
- IP tracking untuk audit

### Admin Access
- JWT authentication required
- Role-based access control
- Audit logging untuk semua actions
- Data sanitization dan validation

## Integrasi dengan Sistem Existing

### Dengan Tabel Units
- QR Code terhubung dengan units
- External tickets routing ke unit terkait
- Analytics per unit

### Dengan User Management
- Escalation rules menggunakan user roles
- Assignment berdasarkan role hierarchy
- Audit trail dengan user tracking

### Dengan Notification System
- Auto-notification saat escalation
- SLA breach warnings
- Real-time updates via WebSocket

## Cara Penggunaan

### Untuk Admin:
1. **QR Code Management:**
   - Buka `/tickets/qr-management`
   - Klik "Generate QR Code Baru"
   - Pilih unit dan beri nama
   - Print atau copy link QR code
   - Monitor analytics dan performance

2. **AI Escalation Setup:**
   - Buka `/tickets/ai-escalation`
   - Klik "Aturan Eskalasi Baru"
   - Konfigurasi kondisi trigger
   - Set confidence threshold
   - Tentukan jalur eskalasi
   - Aktifkan rule

3. **Monitor External Tickets:**
   - Buka `/tickets/tiket-eksternal`
   - Review tiket masuk
   - Update status dan response
   - Monitor SLA compliance

### Untuk Public:
1. **Submit Ticket via QR:**
   - Scan QR code di lokasi unit
   - Isi formulir pengaduan
   - Upload lampiran jika ada
   - Submit dan dapatkan nomor tiket

2. **Submit Ticket via Web:**
   - Buka `/tiket-eksternal`
   - Pilih identitas (pribadi/anonim)
   - Isi formulir lengkap
   - Submit dan dapatkan konfirmasi

## Testing dan Validasi

### Sample Data
- 5 QR codes untuk units aktif
- 4 escalation rules dengan berbagai kondisi
- 3 external tickets untuk testing

### Test Cases
1. **QR Code Flow:**
   - Scan QR → Form pre-filled → Submit → Success
   - Analytics tracking → Usage count update

2. **AI Escalation:**
   - Critical ticket → Auto-escalate to Director
   - SLA breach → Trigger escalation
   - Rule execution → Log tracking

3. **File Upload:**
   - Valid files → Success upload
   - Invalid files → Proper error handling
   - Size limits → Validation working

## Monitoring dan Maintenance

### Analytics Dashboard
- QR code performance metrics
- Escalation rule effectiveness
- Ticket volume trends
- Response time analytics

### Health Checks
- Auto-escalation cron job status
- File upload directory space
- Database performance
- API response times

### Backup dan Recovery
- Regular database backups
- File upload backups
- Configuration backups
- Disaster recovery procedures

## Roadmap Pengembangan

### Phase 2 (Future):
1. **Advanced AI:**
   - Real AI/ML integration
   - Sentiment analysis
   - Auto-categorization
   - Predictive escalation

2. **Mobile App:**
   - Native mobile app
   - Push notifications
   - Offline capability
   - Camera integration

3. **Advanced Analytics:**
   - Machine learning insights
   - Predictive analytics
   - Performance optimization
   - Custom reporting

4. **Integration:**
   - WhatsApp integration
   - Email notifications
   - SMS alerts
   - Third-party APIs

Semua fitur telah diimplementasi dengan bahasa Indonesia dan terintegrasi penuh dengan database menggunakan MCP tools Supabase.