# ✅ Supabase Database Setup - JEMPOL Platform

## 🎉 Database Tables Created Successfully!

Semua tabel backend telah dibuat di Supabase menggunakan MCP tools.

## 📊 Tables Created

### 1. **visitors** - Pendaftaran Pengunjung
Menyimpan data pengunjung yang mendaftar.

**Columns:**
- `id` (UUID) - Primary key
- `nama` (VARCHAR) - Nama lengkap pengunjung
- `instansi` (VARCHAR) - Nama instansi/organisasi
- `jabatan` (VARCHAR) - Jabatan pengunjung
- `no_handphone` (VARCHAR) - Nomor handphone
- `registered_at` (TIMESTAMPTZ) - Waktu pendaftaran
- `ip_address` (VARCHAR) - IP address (optional)
- `created_at` (TIMESTAMPTZ) - Timestamp created
- `updated_at` (TIMESTAMPTZ) - Timestamp updated

**Indexes:**
- `idx_visitors_registered_at` - Fast query by registration date
- `idx_visitors_nama` - Full-text search on nama
- `idx_visitors_instansi` - Full-text search on instansi

**RLS Policies:**
- Public read access
- Public insert (anyone can register)

---

### 2. **innovations** - Konten Inovasi JEMPOL
Menyimpan file PowerPoint dan Video inovasi.

**Columns:**
- `id` (UUID) - Primary key
- `title` (VARCHAR) - Judul inovasi
- `description` (TEXT) - Deskripsi lengkap
- `type` (VARCHAR) - Type: 'powerpoint' atau 'video'
- `file_url` (TEXT) - URL file di storage
- `file_name` (VARCHAR) - Nama file original
- `file_size` (BIGINT) - Ukuran file dalam bytes
- `mime_type` (VARCHAR) - MIME type file
- `thumbnail_url` (TEXT) - URL thumbnail (optional)
- `uploaded_by` (VARCHAR) - User yang upload (default: 'admin')
- `uploaded_at` (TIMESTAMPTZ) - Waktu upload
- `views` (INTEGER) - Jumlah views (default: 0)
- `created_at` (TIMESTAMPTZ) - Timestamp created
- `updated_at` (TIMESTAMPTZ) - Timestamp updated

**Indexes:**
- `idx_innovations_uploaded_at` - Sort by upload date
- `idx_innovations_type` - Filter by type
- `idx_innovations_views` - Sort by popularity
- `idx_innovations_title` - Full-text search on title

**RLS Policies:**
- Public read access
- Authenticated insert/update/delete

---

### 3. **game_scores** - Skor Game Innovation Catcher
Menyimpan skor pemain game.

**Columns:**
- `id` (UUID) - Primary key
- `player_name` (VARCHAR) - Nama pemain
- `score` (INTEGER) - Skor yang diraih (min: 0)
- `mode` (VARCHAR) - Mode: 'single' atau 'multiplayer'
- `level` (INTEGER) - Level yang dicapai (default: 1)
- `duration` (INTEGER) - Durasi bermain (detik)
- `played_at` (TIMESTAMPTZ) - Waktu bermain
- `device_type` (VARCHAR) - Device: 'mobile', 'tablet', atau 'desktop'
- `created_at` (TIMESTAMPTZ) - Timestamp created
- `updated_at` (TIMESTAMPTZ) - Timestamp updated

**Indexes:**
- `idx_game_scores_score` - Leaderboard sorting
- `idx_game_scores_mode_score` - Leaderboard by mode
- `idx_game_scores_played_at` - Recent games
- `idx_game_scores_player_name` - Player history

**RLS Policies:**
- Public read access
- Public insert (anyone can submit score)

---

## 🔧 Features Implemented

### Auto-Update Timestamps
Trigger `update_updated_at_column()` otomatis update `updated_at` saat record diupdate.

### Row Level Security (RLS)
Semua tabel menggunakan RLS untuk keamanan:
- Public dapat read dan insert
- Update/delete memerlukan authentication (untuk innovations)

### Full-Text Search
Indonesian language support untuk search di:
- Nama dan instansi pengunjung
- Judul inovasi

### Constraints & Validation
- Check constraints untuk enum values
- NOT NULL constraints
- Default values
- Primary keys (UUID)

---

## 🔌 Integration dengan Backend

### Option 1: Migrate ke Supabase (Recommended)

**Install Supabase Client:**
```bash
cd backend
npm install @supabase/supabase-js
```

**Create Supabase Config:**
```typescript
// backend/src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Update .env:**
```env
SUPABASE_URL=https://jxxzbdivafzzwqhagwrf.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

**Example Controller Update:**
```typescript
// backend/src/controllers/visitorController.ts
import { supabase } from '../config/supabase.js';

export const registerVisitor = async (req: Request, res: Response) => {
  try {
    const { nama, instansi, jabatan, noHandphone } = req.body;
    
    const { data, error } = await supabase
      .from('visitors')
      .insert([{
        nama,
        instansi,
        jabatan,
        no_handphone: noHandphone,
        ip_address: req.ip
      }])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### Option 2: Dual Database (MongoDB + Supabase)

Gunakan kedua database secara bersamaan:
- MongoDB untuk development/testing
- Supabase untuk production
- Sync data antara keduanya

---

## 📝 Sample Queries

### Insert Visitor
```sql
INSERT INTO visitors (nama, instansi, jabatan, no_handphone)
VALUES ('John Doe', 'RSUD Bendan', 'Dokter', '081234567890');
```

### Get All Innovations
```sql
SELECT * FROM innovations
ORDER BY uploaded_at DESC;
```

### Get Leaderboard (Top 10)
```sql
SELECT player_name, score, level, mode, played_at
FROM game_scores
ORDER BY score DESC, played_at DESC
LIMIT 10;
```

### Search Visitors
```sql
SELECT * FROM visitors
WHERE to_tsvector('indonesian', nama || ' ' || instansi) 
  @@ to_tsquery('indonesian', 'search_term');
```

### Increment Innovation Views
```sql
UPDATE innovations
SET views = views + 1
WHERE id = 'uuid-here';
```

---

## 🔐 Security Notes

### RLS Policies
- Semua tabel protected dengan RLS
- Public dapat read dan insert
- Update/delete hanya untuk authenticated users

### API Keys
Gunakan environment variables untuk menyimpan:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (untuk public access)
- `SUPABASE_SERVICE_KEY` (untuk admin operations)

### Best Practices
1. Never commit API keys ke git
2. Use service role key hanya di backend
3. Use anon key di frontend
4. Enable RLS di semua tabel
5. Validate input di backend

---

## 🚀 Next Steps

### 1. Get Supabase Credentials
- Login ke https://supabase.com
- Buka project: jxxzbdivafzzwqhagwrf
- Go to Settings → API
- Copy URL dan anon key

### 2. Update Backend
- Install @supabase/supabase-js
- Create supabase config
- Update controllers
- Test endpoints

### 3. Update Frontend (Optional)
- Install @supabase/supabase-js
- Direct query dari frontend
- Real-time subscriptions

### 4. Storage Setup (Optional)
- Setup Supabase Storage bucket
- Upload files ke Supabase Storage
- Replace local uploads

---

## 📊 Database Statistics

- **Total Tables:** 3
- **Total Columns:** 29
- **Total Indexes:** 11
- **RLS Enabled:** Yes (all tables)
- **Triggers:** 3 (auto-update timestamps)

---

## 📞 Support

**JEMPOL Platform**
- RSUD Bendan Kota Pekalongan
- Mukhsin Hadi: +62 857 2611 2001

**Supabase Project**
- Project Ref: jxxzbdivafzzwqhagwrf
- Dashboard: https://supabase.com/dashboard/project/jxxzbdivafzzwqhagwrf

---

**Status:** ✅ Database setup complete and ready to use!
**Date:** December 5, 2025
**Version:** 1.0.0
