# Requirements Document

## Introduction

Sistem KISS (Keluhan, Informasi, Saran, Survei) mengalami error 500 saat submit tiket internal dan survey melalui form publik. Error ini terjadi pada endpoint API yang menangani submission form, menyebabkan pengguna tidak dapat mengirim tiket atau mengisi survey.

## Glossary

- **System**: Sistem KISS (Keluhan, Informasi, Saran, Survei)
- **API_Handler**: Handler serverless function di Vercel untuk endpoint API
- **Survey_Form**: Form survei kepuasan yang diakses publik
- **Internal_Ticket_Form**: Form tiket internal untuk petugas
- **Supabase_Client**: Client untuk koneksi ke database Supabase
- **Error_Response**: Response HTTP dengan status 500 dan pesan error

## Requirements

### Requirement 1: Perbaikan Error Survey Submission

**User Story:** Sebagai pengunjung, saya ingin mengisi survey kepuasan tanpa error, sehingga feedback saya dapat tersimpan dengan baik.

#### Acceptance Criteria

1. WHEN pengguna submit survey form, THE System SHALL menyimpan data ke tabel public_surveys tanpa error 500
2. WHEN terjadi error validasi data, THE System SHALL mengembalikan pesan error yang jelas dengan status 400
3. WHEN koneksi Supabase gagal, THE System SHALL mengembalikan pesan error yang informatif dengan status 500
4. WHEN survey berhasil disimpan, THE System SHALL mengembalikan response JSON dengan status 201 dan ID survey
5. WHEN unit_id tidak valid atau null, THE System SHALL tetap menyimpan survey dengan unit_id null

### Requirement 2: Perbaikan Error Internal Ticket Submission

**User Story:** Sebagai petugas internal, saya ingin membuat tiket internal tanpa error, sehingga masalah dapat dilaporkan dan ditindaklanjuti.

#### Acceptance Criteria

1. WHEN petugas submit internal ticket form, THE System SHALL menyimpan data ke tabel tickets tanpa error 500
2. WHEN unit_id tidak valid, THE System SHALL mengembalikan error 400 dengan pesan yang jelas
3. WHEN category tidak ditemukan, THE System SHALL tetap menyimpan tiket dengan category_id null
4. WHEN tiket berhasil dibuat, THE System SHALL generate nomor tiket unik dan mengembalikan response dengan status 201
5. WHEN QR code token valid, THE System SHALL update usage_count pada tabel qr_codes

### Requirement 3: Validasi Environment Variables

**User Story:** Sebagai sistem, saya perlu memastikan environment variables Supabase tersedia, sehingga koneksi database dapat berfungsi.

#### Acceptance Criteria

1. WHEN API_Handler diinisialisasi, THE System SHALL memeriksa keberadaan SUPABASE_URL dan SUPABASE_ANON_KEY
2. WHEN environment variables tidak lengkap, THE System SHALL log error detail dan mengembalikan response 500
3. WHEN environment variables valid, THE System SHALL membuat Supabase_Client dengan sukses
4. WHEN menggunakan VITE_ prefix variables, THE System SHALL fallback ke non-VITE variables untuk Vercel production
5. WHEN Supabase_Client null, THE System SHALL menolak semua request dengan error 500

### Requirement 4: Error Handling dan Logging

**User Story:** Sebagai developer, saya ingin melihat log error yang detail, sehingga dapat melakukan debugging dengan cepat.

#### Acceptance Criteria

1. WHEN terjadi error, THE System SHALL log error message, stack trace, dan context data
2. WHEN terjadi database error, THE System SHALL log error code, message, details, dan hint dari Supabase
3. WHEN request gagal validasi, THE System SHALL log data yang dikirim dan alasan validasi gagal
4. WHEN response dikirim, THE System SHALL log status code dan summary response
5. WHEN terjadi error, THE System SHALL mengembalikan response JSON yang valid tanpa HTML

### Requirement 5: CORS dan Content-Type Headers

**User Story:** Sebagai frontend application, saya perlu menerima response JSON yang valid dengan CORS headers, sehingga dapat memproses response tanpa error.

#### Acceptance Criteria

1. WHEN API_Handler menerima request, THE System SHALL set CORS headers sebelum processing logic
2. WHEN API_Handler mengembalikan response, THE System SHALL set Content-Type header ke application/json
3. WHEN terjadi error, THE System SHALL tetap mengembalikan response JSON dengan headers yang benar
4. WHEN menerima OPTIONS request, THE System SHALL mengembalikan status 200 dengan CORS headers
5. WHEN headers sudah dikirim, THE System SHALL tidak mencoba set headers lagi untuk menghindari error

### Requirement 6: Data Validation dan Sanitization

**User Story:** Sebagai sistem, saya perlu memvalidasi data input, sehingga data yang tersimpan konsisten dan valid.

#### Acceptance Criteria

1. WHEN menerima unit_id, THE System SHALL validasi format UUID sebelum query database
2. WHEN menerima category_id, THE System SHALL validasi keberadaan di tabel service_categories
3. WHEN menerima priority, THE System SHALL validasi nilai terhadap enum yang valid
4. WHEN menerima source, THE System SHALL validasi nilai terhadap list source yang valid
5. WHEN field optional kosong atau null, THE System SHALL set nilai null di database

### Requirement 7: Database Transaction Safety

**User Story:** Sebagai sistem, saya perlu memastikan operasi database aman, sehingga tidak terjadi data corruption.

#### Acceptance Criteria

1. WHEN menyimpan survey, THE System SHALL validasi foreign key sebelum insert
2. WHEN menyimpan tiket, THE System SHALL generate ticket_number yang unik
3. WHEN update QR code usage, THE System SHALL handle race condition dengan proper locking
4. WHEN terjadi error saat insert, THE System SHALL rollback transaction jika diperlukan
5. WHEN operasi berhasil, THE System SHALL return data yang baru disimpan dengan relasi yang di-populate

### Requirement 8: Response Format Consistency

**User Story:** Sebagai frontend developer, saya ingin response API konsisten, sehingga mudah di-handle di client side.

#### Acceptance Criteria

1. WHEN operasi berhasil, THE System SHALL return JSON dengan field success: true dan data
2. WHEN terjadi error, THE System SHALL return JSON dengan field success: false dan error message
3. WHEN terjadi validation error, THE System SHALL return details tentang field yang error
4. WHEN terjadi database error, THE System SHALL return error_code dan error_message
5. WHEN response dikirim, THE System SHALL include timestamp untuk tracking
