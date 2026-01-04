# 📖 E-BOOK PETUNJUK TEKNIS APLIKASI KISS
## (Kanal Informasi Saran dan Survei)

---

**Penulis dan Pengembang:**  
MUKHSIN HADI, SE, M.Si, CGAA, CPFRM, CSEP, CRP, CPRM, CSCAP, CPABC

**Hak Cipta:**  
aplikasiKISS@2024.Mukhsin Hadi. Hak Cipta dilindungi oleh Undang-Undang

---

## DAFTAR ISI

1. [Persiapan dan Instalasi](#persiapan-dan-instalasi)
2. [Penyusunan Data Master](#penyusunan-data-master)
3. [Konfigurasi Sistem](#konfigurasi-sistem)
4. [Manajemen User dan Role](#manajemen-user-dan-role)
5. [Operasional Harian](#operasional-harian)
6. [Penanganan Keluhan](#penanganan-keluhan)
7. [Monitoring dan Reporting](#monitoring-dan-reporting)
8. [Maintenance dan Troubleshooting](#maintenance-dan-troubleshooting)
9. [Studi Kasus dan Contoh](#studi-kasus-dan-contoh)

---

## 1. PERSIAPAN DAN INSTALASI

### 1.1 Persyaratan Sistem

#### 1.1.1 Hardware Requirements
**Minimum Requirements:**
- CPU: 2 cores, 2.0 GHz
- RAM: 4 GB
- Storage: 20 GB SSD
- Network: 10 Mbps

**Recommended Requirements:**
- CPU: 4 cores, 2.5 GHz
- RAM: 8 GB
- Storage: 50 GB SSD
- Network: 100 Mbps

#### 1.1.2 Software Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: Version 18.0 atau lebih baru
- **Database**: PostgreSQL 13+ (via Supabase)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+

### 1.2 Langkah Instalasi

#### 1.2.1 Persiapan Environment
```bash
# 1. Install Node.js
# Download dari https://nodejs.org/
# Verifikasi instalasi
node --version
npm --version

# 2. Clone repository
git clone https://github.com/your-org/kiss-application.git
cd kiss-application

# 3. Install dependencies
npm install
```

#### 1.2.2 Konfigurasi Database
```bash
# 1. Buat akun Supabase di https://supabase.com
# 2. Buat project baru
# 3. Catat URL dan API Keys

# 4. Setup environment variables
cp .env.example .env

# Edit .env file:
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_minimum_32_characters
```

#### 1.2.3 Inisialisasi Database
```sql
-- Jalankan script SQL berikut di Supabase SQL Editor

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create tables (jalankan script dari database schema)
-- 3. Insert initial data
INSERT INTO admins (username, password_hash, full_name, email, role) VALUES
('admin', '$2b$12$hash_password_here', 'Administrator', 'admin@kiss.com', 'superadmin');

-- 4. Setup Row Level Security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
-- (tambahkan policies sesuai kebutuhan)
```

#### 1.2.4 Menjalankan Aplikasi
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Akses aplikasi:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

---

## 2. PENYUSUNAN DATA MASTER

### 2.1 Setup Unit Kerja

#### 2.1.1 Membuat Struktur Organisasi
**Langkah-langkah:**

1. **Login sebagai Admin**
   - Buka http://localhost:3000/login
   - Username: admin
   - Password: admin123 (ganti setelah login pertama)

2. **Akses Menu Master Data → Units**
   - Klik "Tambah Unit Baru"
   - Isi form dengan data berikut:

**Contoh Data Unit:**
```
Unit Induk: RSUD Bendan
├── Kode: RSUD-001
├── Nama: RSUD Bendan Kota Pekalongan
├── Deskripsi: Rumah Sakit Umum Daerah
├── Email: info@rsudbendanpekalongan.com
├── Telepon: (0285) 123456
├── SLA: 24 jam
└── Status: Aktif

Sub Unit: Instalasi Rawat Jalan
├── Kode: IRJ-001
├── Parent: RSUD-001
├── Nama: Instalasi Rawat Jalan
├── Deskripsi: Pelayanan pasien rawat jalan
├── Email: irj@rsudbendanpekalongan.com
├── Telepon: (0285) 123457
├── SLA: 4 jam
└── Status: Aktif
```

3. **Validasi Data Unit**
   - Pastikan hierarki unit sudah benar
   - Cek kontak email dan telepon
   - Verifikasi SLA sesuai standar pelayanan

#### 2.1.2 Konfigurasi Tipe Unit
```sql
-- Insert unit types
INSERT INTO unit_types (name, code, description, icon, color) VALUES
('Instalasi', 'INST', 'Unit instalasi medis', 'building-2', '#3B82F6'),
('Poliklinik', 'POLI', 'Poliklinik spesialis', 'stethoscope', '#10B981'),
('Penunjang', 'PENJ', 'Unit penunjang medis', 'activity', '#F59E0B'),
('Administrasi', 'ADM', 'Unit administrasi', 'file-text', '#6B7280');
```

### 2.2 Setup Kategori Layanan

#### 2.2.1 Membuat Kategori Layanan
**Akses Menu: Master Data → Service Categories**

**Contoh Kategori Layanan:**
```
1. Pelayanan Medis
   ├── Kode: MED-001
   ├── Deskripsi: Keluhan terkait pelayanan medis
   ├── SLA Default: 4 jam
   ├── Perlu Attachment: Ya
   └── Status: Aktif

2. Pelayanan Administrasi
   ├── Kode: ADM-001
   ├── Deskripsi: Keluhan administrasi dan billing
   ├── SLA Default: 2 jam
   ├── Perlu Attachment: Tidak
   └── Status: Aktif

3. Fasilitas dan Infrastruktur
   ├── Kode: FAS-001
   ├── Deskripsi: Keluhan fasilitas dan infrastruktur
   ├── SLA Default: 24 jam
   ├── Perlu Attachment: Ya
   └── Status: Aktif
```

#### 2.2.2 Konfigurasi SLA per Kategori
```sql
-- Insert SLA settings
INSERT INTO sla_settings (name, service_category_id, priority_level, response_time_hours, resolution_time_hours) VALUES
('Medis Kritis', 'med-001-uuid', 'critical', 1, 4),
('Medis Normal', 'med-001-uuid', 'medium', 2, 8),
('Administrasi Urgent', 'adm-001-uuid', 'high', 1, 2),
('Fasilitas Normal', 'fas-001-uuid', 'medium', 4, 24);
```

### 2.3 Setup Jenis Pasien

#### 2.3.1 Konfigurasi Patient Types
**Akses Menu: Master Data → Patient Types**

**Contoh Data:**
```
1. Pasien BPJS
   ├── Kode: BPJS
   ├── Prioritas: 3 (Normal)
   ├── SLA Default: 24 jam
   └── Status: Aktif

2. Pasien Umum
   ├── Kode: UMUM
   ├── Prioritas: 3 (Normal)
   ├── SLA Default: 24 jam
   └── Status: Aktif

3. Pasien VIP
   ├── Kode: VIP
   ├── Prioritas: 4 (High)
   ├── SLA Default: 12 jam
   └── Status: Aktif

4. Pasien Emergency
   ├── Kode: EMG
   ├── Prioritas: 5 (Critical)
   ├── SLA Default: 2 jam
   └── Status: Aktif
```

---

## 3. KONFIGURASI SISTEM

### 3.1 Pengaturan Aplikasi

#### 3.1.1 Konfigurasi Dasar
**Akses Menu: Settings → App Settings**

**Pengaturan Wajib:**
```
1. Informasi Organisasi
   ├── Nama: RSUD Bendan Kota Pekalongan
   ├── Alamat: Jl. Dr. Sutomo No. 1, Pekalongan
   ├── Telepon: (0285) 123456
   ├── Email: info@rsudbendanpekalongan.com
   └── Website: www.rsudbendanpekalongan.com

2. Pengaturan Sistem
   ├── Timezone: Asia/Jakarta
   ├── Bahasa Default: Indonesia
   ├── Format Tanggal: DD/MM/YYYY
   ├── Format Waktu: 24 jam
   └── Mata Uang: IDR

3. Pengaturan Ticket
   ├── Format Nomor: TKT{YYYYMM}{0000}
   ├── Auto Assignment: Aktif
   ├── SLA Default: 24 jam
   ├── Max File Size: 10 MB
   └── Allowed Extensions: jpg,png,pdf,doc,docx
```

#### 3.1.2 Konfigurasi Notifikasi
```
1. Email Settings
   ├── SMTP Host: smtp.gmail.com
   ├── SMTP Port: 587
   ├── Username: your-email@gmail.com
   ├── Password: your-app-password
   └── From Name: KISS RSUD Bendan

2. WhatsApp Settings (Opsional)
   ├── Provider: Twilio
   ├── Account SID: your-twilio-sid
   ├── Auth Token: your-twilio-token
   └── Phone Number: +62xxx

3. SMS Settings (Opsional)
   ├── Provider: Local SMS Gateway
   ├── API URL: http://sms-gateway.local/api
   └── API Key: your-api-key
```

### 3.2 Setup QR Code

#### 3.2.1 Generate QR Code per Unit
**Akses Menu: Tickets → QR Management**

**Langkah-langkah:**
1. **Pilih Unit** yang akan dibuatkan QR Code
2. **Klik "Generate QR Code"**
3. **Isi Form:**
   ```
   Nama QR: QR Code Instalasi Rawat Jalan
   Deskripsi: QR Code untuk keluhan IRJ
   Unit: Instalasi Rawat Jalan
   Status: Aktif
   ```
4. **Download QR Code** dalam format PNG/SVG
5. **Cetak dan Pasang** di lokasi strategis

#### 3.2.2 Kustomisasi QR Code
```typescript
// Konfigurasi QR Code
const qrConfig = {
  size: 200,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  logo: '/assets/logo-rsud.png',
  logoSize: 40
};
```

---

## 4. MANAJEMEN USER DAN ROLE

### 4.1 Setup Role dan Permission

#### 4.1.1 Membuat Role
**Akses Menu: Settings → Roles & Permissions**

**Role Standard:**
```
1. Staff
   ├── Permissions:
   │   ├── ticket:view (own unit)
   │   ├── ticket:update (assigned)
   │   ├── ticket:create (internal)
   │   └── ticket:respond
   └── Deskripsi: Staff operasional unit

2. Supervisor
   ├── Permissions:
   │   ├── All Staff permissions
   │   ├── ticket:assign
   │   ├── ticket:view (unit)
   │   ├── user:view (unit)
   │   └── dashboard:unit
   └── Deskripsi: Supervisor unit

3. Manager
   ├── Permissions:
   │   ├── All Supervisor permissions
   │   ├── ticket:escalate
   │   ├── user:create
   │   ├── user:update
   │   ├── reports:unit
   │   └── settings:unit
   └── Deskripsi: Manager unit

4. Director
   ├── Permissions:
   │   ├── All Manager permissions
   │   ├── ticket:view (all)
   │   ├── reports:all
   │   ├── dashboard:executive
   │   └── settings:system
   └── Deskripsi: Direktur/Pimpinan

5. Admin
   ├── Permissions:
   │   └── All permissions
   └── Deskripsi: Administrator sistem
```

#### 4.1.2 Assignment Role ke User
```sql
-- Contoh assignment role
INSERT INTO user_roles (user_id, role_id, assigned_by, is_active) VALUES
('user-uuid-1', 'staff-role-uuid', 'admin-uuid', true),
('user-uuid-2', 'supervisor-role-uuid', 'admin-uuid', true);
```

### 4.2 Membuat User Account

#### 4.2.1 Registrasi User Baru
**Akses Menu: Users → User Management**

**Form User Baru:**
```
1. Data Pribadi
   ├── Nama Lengkap: Dr. Ahmad Santoso
   ├── Email: ahmad.santoso@rsudbendanpekalongan.com
   ├── Telepon: 081234567890
   └── NIP/Employee ID: 198501012010011001

2. Data Jabatan
   ├── Unit: Instalasi Rawat Jalan
   ├── Role: Staff
   ├── Posisi: Dokter Umum
   └── Status: Aktif

3. Akses Sistem
   ├── Username: ahmad.santoso
   ├── Password: (auto-generate atau manual)
   ├── Harus Ganti Password: Ya
   └── Akses Terakhir: -
```

#### 4.2.2 Bulk Import User
```csv
# Template CSV untuk bulk import
full_name,email,phone,employee_id,unit_code,role_code,position
"Dr. Ahmad Santoso","ahmad.santoso@rsud.com","081234567890","198501012010011001","IRJ-001","staff","Dokter Umum"
"Ns. Siti Aminah","siti.aminah@rsud.com","081234567891","198502022010012002","IRJ-001","staff","Perawat"
"Budi Hartono","budi.hartono@rsud.com","081234567892","198503032010013003","IRJ-001","supervisor","Kepala Ruang"
```

---

## 5. OPERASIONAL HARIAN

### 5.1 Dashboard Monitoring

#### 5.1.1 Dashboard Admin
**Akses: http://localhost:3000/dashboard**

**KPI Cards yang Dipantau:**
```
1. Total Tickets Hari Ini
   ├── Jumlah: 45
   ├── Trend: ↑ 12% dari kemarin
   └── Target: < 50 per hari

2. Tickets Terbuka
   ├── Jumlah: 12
   ├── Overdue: 3 (merah)
   ├── Due Today: 5 (kuning)
   └── Normal: 4 (hijau)

3. Response Time Rata-rata
   ├── Waktu: 2.5 jam
   ├── Target: < 4 jam
   └── Status: ✅ Tercapai

4. Satisfaction Score
   ├── Skor: 4.2/5.0
   ├── Total Survey: 28
   └── Trend: ↑ 0.3 dari bulan lalu
```

#### 5.1.2 Dashboard Unit
**Filter berdasarkan Unit yang dipilih**

**Metrics Unit:**
```
1. Workload Distribution
   ├── Dr. Ahmad: 8 tickets (40%)
   ├── Ns. Siti: 6 tickets (30%)
   ├── Budi: 4 tickets (20%)
   └── Unassigned: 2 tickets (10%)

2. Status Distribution
   ├── Open: 5 (25%)
   ├── In Progress: 10 (50%)
   ├── Resolved: 4 (20%)
   └── Escalated: 1 (5%)

3. Category Breakdown
   ├── Pelayanan Medis: 12 (60%)
   ├── Administrasi: 5 (25%)
   └── Fasilitas: 3 (15%)
```

### 5.2 Monitoring Real-time

#### 5.2.1 Live Notifications
**Setup Notifikasi Real-time:**
```typescript
// Client-side notification handler
useEffect(() => {
  socket.on('ticket:created', (ticket) => {
    showNotification({
      title: 'Ticket Baru',
      message: `${ticket.ticket_number}: ${ticket.title}`,
      type: 'info',
      action: () => navigate(`/tickets/${ticket.id}`)
    });
  });

  socket.on('ticket:escalated', (ticket) => {
    showNotification({
      title: 'Ticket Dieskalasi',
      message: `${ticket.ticket_number} memerlukan perhatian`,
      type: 'warning',
      urgent: true
    });
  });
}, []);
```

#### 5.2.2 SLA Monitoring
**Alert SLA Breach:**
```
1. Warning (75% SLA)
   ├── Notifikasi: Email + Web Push
   ├── Penerima: Assigned Staff + Supervisor
   └── Aksi: Review dan prioritas

2. Critical (90% SLA)
   ├── Notifikasi: Email + SMS + WhatsApp
   ├── Penerima: Staff + Supervisor + Manager
   └── Aksi: Eskalasi otomatis

3. Breach (100% SLA)
   ├── Notifikasi: All channels
   ├── Penerima: All levels
   └── Aksi: Incident report
```

---

## 6. PENANGANAN KELUHAN

### 6.1 Alur Penerimaan Keluhan

#### 6.1.1 Keluhan via QR Code
**Proses untuk Masyarakat:**

1. **Scan QR Code**
   - Buka kamera smartphone
   - Scan QR Code yang tersedia
   - Otomatis redirect ke form keluhan

2. **Isi Form Keluhan**
   ```
   Jenis Layanan: [Dropdown]
   ├── Informasi
   ├── Keluhan
   ├── Saran
   └── Survei Kepuasan

   Data Pelapor: [Opsional]
   ├── Nama: Ahmad Wijaya
   ├── Email: ahmad@email.com
   ├── Telepon: 081234567890
   ├── Alamat: Jl. Merdeka No. 123
   └── ☑ Anonim (jika tidak ingin identitas diketahui)

   Detail Keluhan:
   ├── Judul: Antrian panjang di loket pendaftaran
   ├── Deskripsi: [Minimal 10 karakter]
   ├── Kategori: Pelayanan Administrasi
   ├── Prioritas: Normal
   └── Lampiran: [Upload file, max 10MB]
   ```

3. **Submit dan Tracking**
   ```
   Berhasil Submit:
   ├── Nomor Tracking: TKT202412001
   ├── Link Tracking: kiss.rsud.com/track/TKT202412001
   ├── Estimasi Respon: 2 jam
   └── Estimasi Selesai: 24 jam
   ```

#### 6.1.2 Keluhan via Web Portal
**Akses: http://localhost:3000/complaint**

**Proses sama dengan QR Code, namun:**
- Pilih unit tujuan manual
- Lebih banyak opsi kategori
- Form lebih lengkap
- Bisa attach multiple files

### 6.2 Proses Internal

#### 6.2.1 Auto Assignment
**Algoritma Assignment:**
```typescript
class AutoAssignmentService {
  async assignTicket(ticket: Ticket): Promise<Assignment> {
    // 1. Filter staff berdasarkan unit
    const staffList = await this.getActiveStaff(ticket.unit_id);
    
    // 2. Filter berdasarkan skill/kategori
    const qualifiedStaff = staffList.filter(staff => 
      staff.skills.includes(ticket.category_id)
    );
    
    // 3. Load balancing berdasarkan workload
    const workloads = await this.getWorkloads(qualifiedStaff);
    const leastBusyStaff = workloads.sort((a, b) => 
      a.activeTickets - b.activeTickets
    )[0];
    
    // 4. Assign ticket
    return await this.assignToStaff(ticket.id, leastBusyStaff.user_id);
  }
}
```

#### 6.2.2 AI Classification
**Proses Otomatis:**
```
1. Text Preprocessing
   ├── Cleaning: Remove noise, normalize text
   ├── Tokenization: Split into words
   └── Feature Extraction: TF-IDF, N-grams

2. Classification
   ├── Category: Pelayanan Medis (85% confidence)
   ├── Subcategory: Antrian/Waiting Time
   ├── Priority: Medium
   └── Urgency: 3/5

3. Sentiment Analysis
   ├── Score: -0.3 (Slightly Negative)
   ├── Emotions: Frustration (60%), Disappointment (40%)
   └── Magnitude: 0.7 (Strong sentiment)

4. Routing Decision
   ├── Recommended Unit: Instalasi Rawat Jalan
   ├── Suggested Assignee: Supervisor IRJ
   └── Escalation Path: Manager → Director
```

### 6.3 Penanganan oleh Staff

#### 6.3.1 Workflow Staff
**Login Staff: http://localhost:3000/login**

1. **Dashboard Staff**
   ```
   My Tickets:
   ├── Assigned to Me: 8 tickets
   ├── Due Today: 3 tickets
   ├── Overdue: 1 ticket (⚠️)
   └── Completed Today: 5 tickets

   Quick Actions:
   ├── [View All Tickets]
   ├── [Create Internal Ticket]
   ├── [Update Status]
   └── [Generate Report]
   ```

2. **Detail Ticket**
   ```
   Ticket: TKT202412001
   ├── Status: In Progress
   ├── Priority: Medium
   ├── Assigned: Dr. Ahmad Santoso
   ├── SLA: 18 jam tersisa
   └── Last Update: 2 jam yang lalu

   Submitter Info:
   ├── Nama: Ahmad Wijaya
   ├── Email: ahmad@email.com
   ├── Telepon: 081234567890
   └── Tipe: Pasien BPJS

   Complaint Details:
   ├── Kategori: Pelayanan Administrasi
   ├── Judul: Antrian panjang di loket pendaftaran
   ├── Deskripsi: [Full description]
   ├── Attachments: foto_antrian.jpg
   └── AI Analysis: Category confidence 85%
   ```

3. **Response Actions**
   ```
   Response Options:
   ├── [Add Response] - Kirim respon ke pelapor
   ├── [Internal Note] - Catatan internal
   ├── [Update Status] - Ubah status ticket
   ├── [Escalate] - Eskalasi ke level atas
   ├── [Assign] - Assign ke staff lain
   └── [Close] - Tutup ticket
   ```

#### 6.3.2 Template Response
**Akses: Settings → Response Templates**

**Contoh Template:**
```
1. Acknowledgment
   Subjek: Terima kasih atas laporan Anda - {{ticket_number}}
   Isi:
   Yth. {{submitter_name}},
   
   Terima kasih telah menyampaikan {{complaint_type}} melalui sistem KISS.
   Laporan Anda dengan nomor {{ticket_number}} telah kami terima dan 
   sedang dalam proses penanganan.
   
   Estimasi penyelesaian: {{sla_deadline}}
   
   Hormat kami,
   {{responder_name}}
   {{unit_name}}

2. Resolution
   Subjek: Penyelesaian Laporan {{ticket_number}}
   Isi:
   Yth. {{submitter_name}},
   
   Laporan Anda dengan nomor {{ticket_number}} telah kami selesaikan.
   
   Tindakan yang telah dilakukan:
   {{resolution_actions}}
   
   Mohon konfirmasi apakah penyelesaian ini sudah sesuai dengan harapan.
   
   Terima kasih atas kepercayaan Anda.
   
   Hormat kami,
   {{responder_name}}
```

---

## 7. MONITORING DAN REPORTING

### 7.1 Dashboard Analytics

#### 7.1.1 Executive Dashboard
**Akses: Dashboard → Executive View**

**Key Metrics:**
```
1. Performance Overview
   ├── Total Tickets (Bulan ini): 1,247
   ├── Resolution Rate: 94.2%
   ├── Avg Response Time: 2.1 jam
   ├── Avg Resolution Time: 18.5 jam
   └── Customer Satisfaction: 4.3/5.0

2. Trend Analysis
   ├── Ticket Volume: ↑ 15% vs last month
   ├── Response Time: ↓ 0.3 jam (improved)
   ├── Resolution Time: ↓ 2.1 jam (improved)
   └── Satisfaction: ↑ 0.2 points

3. Unit Performance
   ├── Best Performer: Instalasi Rawat Jalan (4.8/5.0)
   ├── Needs Attention: Instalasi Gawat Darurat (3.9/5.0)
   ├── Most Tickets: IRJ (35%), IGD (28%), Farmasi (15%)
   └── Fastest Response: Administrasi (1.2 jam avg)
```

#### 7.1.2 Operational Dashboard
**Real-time Monitoring:**
```
1. Live Tickets
   ├── New (Last 1 hour): 12
   ├── In Progress: 45
   ├── Pending Response: 8
   ├── Escalated: 3
   └── Overdue: 2 ⚠️

2. Staff Workload
   ├── Online Staff: 28/35
   ├── Avg Tickets per Staff: 3.2
   ├── Busiest Staff: Dr. Ahmad (8 tickets)
   └── Available Staff: 7

3. System Health
   ├── Response Time: 145ms ✅
   ├── Database: Healthy ✅
   ├── File Storage: 78% used ⚠️
   └── Active Users: 156
```

### 7.2 Laporan Berkala

#### 7.2.1 Laporan Harian
**Auto-generate setiap hari pukul 23:59**

**Format Laporan:**
```
LAPORAN HARIAN SISTEM KISS
Tanggal: 15 Desember 2024

RINGKASAN EKSEKUTIF:
├── Total Tickets Masuk: 52
├── Tickets Diselesaikan: 48
├── Tickets Tertunda: 4
├── Response Time Rata-rata: 2.3 jam
└── Satisfaction Score: 4.1/5.0

BREAKDOWN PER UNIT:
1. Instalasi Rawat Jalan
   ├── Tickets Masuk: 18 (35%)
   ├── Diselesaikan: 16 (89%)
   ├── Avg Response: 1.8 jam
   └── Satisfaction: 4.3/5.0

2. Instalasi Gawat Darurat
   ├── Tickets Masuk: 14 (27%)
   ├── Diselesaikan: 13 (93%)
   ├── Avg Response: 0.8 jam
   └── Satisfaction: 4.0/5.0

KATEGORI KELUHAN:
├── Pelayanan Medis: 28 (54%)
├── Administrasi: 15 (29%)
├── Fasilitas: 9 (17%)

TOP ISSUES:
1. Antrian panjang (8 tickets)
2. Sistem informasi error (5 tickets)
3. Fasilitas toilet kotor (4 tickets)

REKOMENDASI:
├── Tambah loket pendaftaran
├── Perbaiki sistem informasi
└── Tingkatkan cleaning service
```

#### 7.2.2 Laporan Bulanan
**Generate: Reports → Monthly Report**

**Sections:**
```
1. Executive Summary
2. Performance Metrics
3. Trend Analysis
4. Unit Performance Comparison
5. Staff Performance
6. Customer Satisfaction Analysis
7. Issue Category Analysis
8. SLA Compliance Report
9. Recommendations & Action Plans
10. Appendix (Raw Data)
```

#### 7.2.3 Custom Reports
**Report Builder:**
```
Filter Options:
├── Date Range: [Start Date] - [End Date]
├── Units: [Multi-select dropdown]
├── Categories: [Multi-select dropdown]
├── Status: [Multi-select dropdown]
├── Priority: [Multi-select dropdown]
├── Staff: [Multi-select dropdown]

Metrics to Include:
├── ☑ Ticket Volume
├── ☑ Response Time
├── ☑ Resolution Time
├── ☑ SLA Compliance
├── ☑ Satisfaction Scores
├── ☑ Staff Performance

Output Format:
├── ○ PDF Report
├── ○ Excel Spreadsheet
├── ○ CSV Data
└── ○ Dashboard View
```

---

## 8. MAINTENANCE DAN TROUBLESHOOTING

### 8.1 Maintenance Rutin

#### 8.1.1 Daily Maintenance
**Checklist Harian:**
```
□ Cek status sistem (Health Check)
□ Monitor disk space (< 80%)
□ Review error logs
□ Backup database
□ Cek notifikasi yang gagal
□ Monitor response time
□ Review tickets overdue
□ Update dashboard metrics
```

**Script Otomatis:**
```bash
#!/bin/bash
# daily-maintenance.sh

echo "Starting daily maintenance..."

# 1. Health check
curl -f http://localhost:5000/api/health || echo "Health check failed"

# 2. Database backup
pg_dump $DATABASE_URL > backups/daily_$(date +%Y%m%d).sql

# 3. Clean old logs
find logs/ -name "*.log" -mtime +30 -delete

# 4. Update statistics
node scripts/update-daily-stats.js

echo "Daily maintenance completed"
```

#### 8.1.2 Weekly Maintenance
**Checklist Mingguan:**
```
□ Analisis performa database
□ Optimasi index database
□ Review dan archive old tickets
□ Update sistem dependencies
□ Security scan
□ Performance testing
□ Backup verification
□ User access review
```

#### 8.1.3 Monthly Maintenance
**Checklist Bulanan:**
```
□ Full system backup
□ Database maintenance (VACUUM, REINDEX)
□ Security audit
□ Performance optimization
□ User training review
□ System capacity planning
□ Disaster recovery test
□ Documentation update
```

### 8.2 Troubleshooting Common Issues

#### 8.2.1 Database Connection Issues
**Symptoms:**
- Error: "Connection refused"
- Slow query performance
- Timeout errors

**Diagnosis:**
```bash
# Check database status
pg_isready -h localhost -p 5432

# Check connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

**Solutions:**
```sql
-- Terminate idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < now() - interval '1 hour';

-- Optimize queries
EXPLAIN ANALYZE SELECT * FROM tickets WHERE status = 'open';

-- Update statistics
ANALYZE tickets;
```

#### 8.2.2 Authentication Problems
**Symptoms:**
- Login failures
- Token expired errors
- Permission denied

**Diagnosis:**
```bash
# Check JWT token
node -e "console.log(require('jsonwebtoken').decode('$TOKEN'))"

# Check user status
SELECT id, email, is_active, last_login FROM users WHERE email = 'user@example.com';

# Check permissions
SELECT r.name, r.permissions 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
WHERE u.email = 'user@example.com';
```

**Solutions:**
```sql
-- Reset user password
UPDATE users SET password_hash = '$2b$12$new_hash' WHERE email = 'user@example.com';

-- Activate user
UPDATE users SET is_active = true WHERE email = 'user@example.com';

-- Update last login
UPDATE users SET last_login = now() WHERE email = 'user@example.com';
```

#### 8.2.3 File Upload Issues
**Symptoms:**
- Upload fails
- File not found errors
- Storage full

**Diagnosis:**
```bash
# Check disk space
df -h

# Check upload directory permissions
ls -la uploads/

# Check file sizes
find uploads/ -type f -size +10M

# Check recent uploads
find uploads/ -type f -mtime -1 -ls
```

**Solutions:**
```bash
# Fix permissions
chmod 755 uploads/
chown -R www-data:www-data uploads/

# Clean old files
find uploads/ -type f -mtime +90 -delete

# Move large files to cloud storage
node scripts/migrate-to-cloud.js
```

#### 8.2.4 Performance Issues
**Symptoms:**
- Slow page loads
- High CPU usage
- Memory leaks

**Diagnosis:**
```bash
# Check system resources
top
htop
free -h

# Check Node.js memory usage
node --inspect server.js

# Check database performance
SELECT * FROM pg_stat_user_tables WHERE relname = 'tickets';
```

**Solutions:**
```javascript
// Enable compression
app.use(compression());

// Add caching
const cache = new NodeCache({ stdTTL: 600 });

// Optimize queries
const tickets = await supabase
  .from('tickets')
  .select('id, title, status, created_at')
  .limit(20);

// Add pagination
const { data, count } = await supabase
  .from('tickets')
  .select('*', { count: 'exact' })
  .range(0, 19);
```

---

## 9. STUDI KASUS DAN CONTOH

### 9.1 Kasus 1: Keluhan Antrian Panjang

#### 9.1.1 Skenario
**Situasi:**
Seorang pasien bernama Ibu Sari mengunjungi RSUD Bendan untuk kontrol rutin. Dia mengalami antrian yang sangat panjang di loket pendaftaran dan menunggu lebih dari 2 jam. Ibu Sari merasa kecewa dan ingin menyampaikan keluhan.

#### 9.1.2 Langkah Penanganan

**Step 1: Pengajuan Keluhan**
```
Ibu Sari melihat QR Code di area tunggu:
├── Scan QR Code dengan smartphone
├── Redirect ke form keluhan IRJ
├── Isi form:
│   ├── Jenis: Keluhan
│   ├── Nama: Ibu Sari Wijaya
│   ├── Email: sari.wijaya@email.com
│   ├── Telepon: 081234567890
│   ├── Judul: Antrian pendaftaran terlalu lama
│   ├── Deskripsi: Sudah menunggu 2 jam di loket pendaftaran...
│   ├── Kategori: Pelayanan Administrasi
│   └── Lampiran: foto_antrian.jpg
└── Submit → Dapat nomor: TKT202412015
```

**Step 2: AI Processing**
```
Sistem AI menganalisis:
├── Kategori: Pelayanan Administrasi (92% confidence)
├── Prioritas: Medium
├── Sentimen: Negative (-0.6)
├── Emosi: Frustration (70%), Disappointment (30%)
├── Unit Tujuan: Instalasi Rawat Jalan
└── Suggested Assignee: Supervisor IRJ
```

**Step 3: Auto Assignment**
```
Sistem assign ke:
├── Unit: Instalasi Rawat Jalan
├── Assigned to: Budi Hartono (Supervisor IRJ)
├── SLA: 2 jam (kategori administrasi)
├── Notifikasi: Email + WhatsApp ke Budi
└── Auto-reply ke Ibu Sari dengan nomor tracking
```

**Step 4: Penanganan oleh Staff**
```
Budi Hartono (Supervisor IRJ):
├── Menerima notifikasi dalam 5 menit
├── Login ke sistem, buka ticket TKT202412015
├── Review detail keluhan dan foto
├── Koordinasi dengan staff loket pendaftaran
├── Investigasi penyebab antrian panjang
└── Kirim response acknowledgment ke Ibu Sari
```

**Response Template:**
```
Yth. Ibu Sari Wijaya,

Terima kasih telah menyampaikan keluhan melalui sistem KISS RSUD Bendan.

Keluhan Anda dengan nomor TKT202412015 mengenai antrian panjang di loket 
pendaftaran telah kami terima dan sedang dalam proses penanganan.

Kami akan segera melakukan investigasi dan koordinasi dengan tim terkait 
untuk mengatasi masalah ini.

Estimasi penyelesaian: 15 Desember 2024, 16:00 WIB

Terima kasih atas kesabaran Anda.

Hormat kami,
Budi Hartono
Supervisor Instalasi Rawat Jalan
RSUD Bendan Kota Pekalongan
```

**Step 5: Investigasi dan Tindakan**
```
Budi melakukan investigasi:
├── Cek data antrian hari ini: rata-rata 45 menit
├── Identifikasi penyebab: 2 loket tutup karena maintenance sistem
├── Koordinasi dengan IT untuk perbaikan sistem
├── Buka loket tambahan sementara
├── Instruksi staff untuk informasi proaktif ke pasien
└── Update progress di sistem
```

**Step 6: Resolution**
```
Setelah 1.5 jam:
├── Sistem loket sudah diperbaiki
├── Antrian kembali normal (15-20 menit)
├── Budi update status ticket ke "Resolved"
├── Kirim resolution response ke Ibu Sari
└── Sistem otomatis kirim survey kepuasan
```

**Resolution Response:**
```
Yth. Ibu Sari Wijaya,

Keluhan Anda dengan nomor TKT202412015 telah kami selesaikan.

Tindakan yang telah dilakukan:
1. Perbaikan sistem loket pendaftaran yang mengalami gangguan
2. Pembukaan loket tambahan untuk mengurangi antrian
3. Instruksi kepada staff untuk memberikan informasi estimasi waktu tunggu
4. Implementasi sistem nomor antrian digital (dalam proses)

Saat ini antrian pendaftaran sudah kembali normal dengan waktu tunggu 
rata-rata 15-20 menit.

Mohon maaf atas ketidaknyamanan yang terjadi. Kami berkomitmen untuk 
terus meningkatkan kualitas pelayanan.

Mohon luangkan waktu untuk mengisi survey kepuasan yang akan dikirim 
ke email Anda.

Terima kasih atas kepercayaan Anda.

Hormat kami,
Budi Hartono
Supervisor Instalasi Rawat Jalan
```

**Step 7: Survey dan Follow-up**
```
Survey kepuasan dikirim ke Ibu Sari:
├── Overall satisfaction: 4/5
├── Response time: 5/5 (sangat cepat)
├── Solution quality: 4/5 (memuaskan)
├── Staff courtesy: 5/5 (sangat baik)
├── Comments: "Terima kasih responnya cepat dan solusinya tepat"
└── Recommendation: Ya, akan merekomendasikan RSUD Bendan
```

#### 9.1.3 Lessons Learned
```
Positive Points:
├── Response time sangat cepat (1.5 jam vs target 2 jam)
├── Root cause analysis yang tepat
├── Tindakan korektif dan preventif
├── Komunikasi yang baik dengan pasien
└── Follow-up dengan survey

Improvement Areas:
├── Preventive maintenance sistem loket
├── Backup plan untuk gangguan sistem
├── Real-time monitoring antrian
└── Proactive communication saat ada gangguan
```

### 9.2 Kasus 2: Keluhan Fasilitas Toilet

#### 9.2.1 Skenario
**Situasi:**
Bapak Andi, pengunjung pasien rawat inap, menemukan kondisi toilet di lantai 2 yang kotor dan tidak terawat. Dia ingin melaporkan kondisi ini agar segera diperbaiki.

#### 9.2.2 Langkah Penanganan

**Step 1: Pengajuan Keluhan**
```
Bapak Andi menggunakan web portal:
├── Akses: kiss.rsudbendanpekalongan.com
├── Pilih "Ajukan Keluhan"
├── Isi form:
│   ├── Jenis: Keluhan
│   ├── Nama: Andi Prasetyo
│   ├── Email: andi.prasetyo@email.com
│   ├── Telepon: 081234567891
│   ├── Unit: Instalasi Rawat Inap
│   ├── Judul: Toilet lantai 2 kotor dan tidak terawat
│   ├── Deskripsi: Toilet di dekat ruang 201-210 kondisinya...
│   ├── Kategori: Fasilitas dan Infrastruktur
│   └── Lampiran: foto_toilet_kotor.jpg, foto_wastafel.jpg
└── Submit → Nomor: TKT202412016
```

**Step 2: Processing**
```
AI Classification:
├── Kategori: Fasilitas (88% confidence)
├── Prioritas: High (karena menyangkut kesehatan)
├── Sentimen: Negative (-0.4)
├── Unit: Instalasi Rawat Inap
└── Escalation: Langsung ke Manager (fasilitas kritis)

Auto Assignment:
├── Assigned to: Siti Nurhasanah (Manager IRI)
├── CC: Kepala Bagian Umum
├── SLA: 4 jam (fasilitas kritis)
└── Notifikasi: Email + SMS (urgent)
```

**Step 3: Immediate Response**
```
Siti Nurhasanah:
├── Menerima notifikasi dalam 3 menit
├── Langsung ke lokasi untuk verifikasi
├── Konfirmasi kondisi sesuai laporan
├── Koordinasi dengan cleaning service
├── Instruksi perbaikan segera
└── Update status ke "In Progress"
```

**Immediate Action Response:**
```
Yth. Bapak Andi Prasetyo,

Terima kasih atas laporan Anda mengenai kondisi toilet di lantai 2.

Kami telah melakukan verifikasi langsung ke lokasi dan mengkonfirmasi 
kondisi yang Anda laporkan. Tim cleaning service telah kami instruksikan 
untuk melakukan pembersihan menyeluruh segera.

Tindakan yang sedang dilakukan:
1. Pembersihan dan disinfeksi toilet secara menyeluruh
2. Perbaikan fasilitas yang rusak
3. Penambahan jadwal pembersihan rutin

Estimasi selesai: Hari ini pukul 16:00 WIB

Kami akan menginformasikan progress selanjutnya.

Terima kasih atas perhatian Anda terhadap kebersihan fasilitas rumah sakit.

Hormat kami,
Siti Nurhasanah
Manager Instalasi Rawat Inap
```

**Step 4: Execution dan Monitoring**
```
Tindakan yang dilakukan:
├── 14:30 - Tim cleaning mulai pembersihan
├── 15:00 - Perbaikan keran wastafel yang rusak
├── 15:30 - Disinfeksi dan pengharum ruangan
├── 16:00 - Quality check oleh supervisor
├── 16:15 - Foto hasil perbaikan
└── 16:30 - Update status ke "Resolved"
```

**Resolution Response:**
```
Yth. Bapak Andi Prasetyo,

Laporan Anda dengan nomor TKT202412016 telah kami selesaikan.

Tindakan yang telah dilakukan:
1. ✅ Pembersihan menyeluruh toilet lantai 2
2. ✅ Perbaikan keran wastafel yang rusak
3. ✅ Disinfeksi dan pengharum ruangan
4. ✅ Penambahan jadwal pembersihan dari 2x menjadi 4x sehari
5. ✅ Penempatan petugas cleaning khusus untuk area rawat inap

Hasil perbaikan dapat dilihat pada foto terlampir.

Untuk memastikan kondisi tetap terjaga, kami telah:
- Meningkatkan frekuensi pembersihan
- Menambah petugas cleaning khusus
- Implementasi checklist kebersihan per 2 jam
- QR Code feedback di setiap toilet untuk monitoring

Mohon bantuan Anda untuk melaporkan jika ada kondisi serupa di masa mendatang.

Terima kasih atas kontribusi Anda dalam menjaga kualitas fasilitas RSUD Bendan.

Hormat kami,
Siti Nurhasanah
Manager Instalasi Rawat Inap

Lampiran: foto_toilet_setelah_perbaikan.jpg
```

#### 9.2.3 Preventive Actions
```
Long-term Improvements:
├── SOP pembersihan toilet yang lebih ketat
├── Checklist digital untuk petugas cleaning
├── QR Code feedback di setiap toilet
├── Monitoring real-time kondisi fasilitas
├── Training ulang untuk cleaning service
└── Audit kebersihan mingguan

System Updates:
├── Kategori "Fasilitas Kritis" dengan SLA 2 jam
├── Auto-escalation untuk keluhan fasilitas
├── Integration dengan sistem maintenance
└── Dashboard monitoring fasilitas real-time
```

### 9.3 Kasus 3: Keluhan Sistem Informasi

#### 9.3.1 Skenario
**Situasi:**
Dr. Maya, dokter di Poliklinik Dalam, mengalami masalah dengan sistem informasi rumah sakit yang sering error saat input data pasien. Hal ini mengganggu pelayanan dan membuat antrian pasien menjadi panjang.

#### 9.3.2 Langkah Penanganan

**Step 1: Internal Ticket Creation**
```
Dr. Maya login ke sistem KISS:
├── Menu: Create Internal Ticket
├── Form:
│   ├── Jenis: Keluhan Internal
│   ├── Kategori: Sistem Informasi
│   ├── Prioritas: Critical (mengganggu pelayanan)
│   ├── Unit Tujuan: IT Support
│   ├── Judul: SIMRS error saat input data pasien
│   ├── Deskripsi: Sistem sering hang dan error 500...
│   ├── Dampak: Antrian pasien terhambat
│   └── Screenshot: error_simrs.png
└── Submit → TKT202412017
```

**Step 2: Critical Escalation**
```
Karena prioritas Critical:
├── Auto-escalation ke IT Manager
├── CC ke Direktur Pelayanan
├── SLA: 1 jam response, 4 jam resolution
├── Notifikasi: Email + SMS + WhatsApp
└── Alert dashboard: Red flag
```

**Step 3: Immediate Response**
```
Agus Setiawan (IT Manager):
├── Menerima alert dalam 2 menit
├── Langsung ke Poliklinik Dalam
├── Reproduksi error bersama Dr. Maya
├── Identifikasi: Database connection timeout
├── Temporary fix: Restart database service
└── Permanent fix: Optimize database queries
```

**Critical Response:**
```
Yth. Dr. Maya,

Laporan sistem error SIMRS telah kami terima dan sedang ditangani dengan 
prioritas tertinggi.

IMMEDIATE ACTION (Completed):
✅ Database service telah di-restart
✅ Sistem SIMRS kembali normal
✅ Testing input data pasien - OK

PERMANENT SOLUTION (In Progress):
🔄 Optimasi query database (ETA: 2 jam)
🔄 Upgrade server capacity (ETA: 4 jam)
🔄 Implementation monitoring system (ETA: 6 jam)

Tim IT sedang standby di lokasi untuk memastikan sistem stabil.

Mohon informasikan segera jika masih ada gangguan.

Terima kasih,
Agus Setiawan
IT Manager
Ext: 1234
```

**Step 4: Root Cause Analysis**
```
Investigation Results:
├── Cause: Database connection pool exhausted
├── Trigger: High concurrent users (50+ simultaneous)
├── Impact: 15 minutes downtime, 30+ patients affected
├── Root Cause: Insufficient database optimization
└── Contributing Factors: Old server hardware

Technical Details:
├── Database: PostgreSQL 12 (outdated)
├── Connection Pool: 20 (insufficient)
├── Server RAM: 8GB (need 16GB)
├── Query Performance: Some queries > 5 seconds
└── Monitoring: Limited visibility
```

**Step 5: Comprehensive Solution**
```
Short-term (Completed):
├── ✅ Increase connection pool to 50
├── ✅ Restart database with optimized config
├── ✅ Kill long-running queries
├── ✅ Add database monitoring
└── ✅ Create backup connection

Medium-term (24 hours):
├── 🔄 Upgrade PostgreSQL to version 15
├── 🔄 Optimize slow queries
├── 🔄 Add database indexing
├── 🔄 Implement connection pooling
└── 🔄 Setup database replication

Long-term (1 week):
├── 📋 Server hardware upgrade
├── 📋 Implement load balancing
├── 📋 Database performance monitoring
├── 📋 Automated backup system
└── 📋 Disaster recovery plan
```

**Final Resolution:**
```
Yth. Dr. Maya,

Laporan sistem error SIMRS dengan nomor TKT202412017 telah diselesaikan 
secara komprehensif.

COMPLETED ACTIONS:
✅ Database optimization dan upgrade ke PostgreSQL 15
✅ Server RAM upgrade dari 8GB ke 16GB
✅ Implementation database monitoring system
✅ Query optimization (response time < 1 second)
✅ Connection pooling dan load balancing
✅ Automated backup dan recovery system

PERFORMANCE IMPROVEMENT:
├── Response time: 5 detik → 0.8 detik (84% faster)
├── Concurrent users: 50 → 200 (4x capacity)
├── Uptime: 99.2% → 99.9% (target achieved)
└── Error rate: 2.1% → 0.1% (95% reduction)

PREVENTIVE MEASURES:
├── 24/7 system monitoring dengan alert
├── Weekly performance review
├── Monthly capacity planning
├── Quarterly disaster recovery test
└── Annual hardware assessment

Sistem sekarang dapat menangani beban kerja yang lebih tinggi dengan 
performa yang optimal.

Terima kasih atas laporan yang membantu kami meningkatkan sistem.

Hormat kami,
Agus Setiawan
IT Manager

Technical Support: ext.1234 (24/7)
```

#### 9.3.3 System Improvements
```
Monitoring Dashboard:
├── Real-time system performance
├── Database connection status
├── Query performance metrics
├── User activity monitoring
└── Alert system for anomalies

Preventive Maintenance:
├── Daily health checks
├── Weekly performance reports
├── Monthly capacity planning
├── Quarterly system updates
└── Annual hardware refresh

SLA Updates:
├── Critical System Issues: 30 min response, 2 hour resolution
├── High Priority: 1 hour response, 4 hour resolution
├── Medium Priority: 4 hour response, 24 hour resolution
└── Low Priority: 24 hour response, 72 hour resolution
```

---

**Dokumentasi ini memberikan panduan lengkap untuk operasional harian sistem KISS, mulai dari setup awal hingga penanganan kasus kompleks. Setiap langkah dirancang untuk memastikan pelayanan yang optimal dan kepuasan pengguna.**

---

*© 2024 MUKHSIN HADI, SE, M.Si, CGAA, CPFRM, CSEP, CRP, CPRM, CSCAP, CPABC*  
*aplikasiKISS@2024.Mukhsin Hadi. Hak Cipta dilindungi oleh Undang-Undang*