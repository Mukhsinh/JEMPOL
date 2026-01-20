# URL Standalone Forms untuk QR Management

## URL Form Tiket Internal (Standalone)

### URL Utama
```
http://localhost:3002/standalone/tiket-internal
```

### URL dengan Parameter Unit (Terkunci)
```
http://localhost:3002/standalone/tiket-internal?unit_id={UNIT_ID}
```

Contoh:
```
http://localhost:3002/standalone/tiket-internal?unit_id=123
```

## Fitur Halaman Standalone

✅ **Tanpa Login** - Akses langsung tanpa autentikasi
✅ **Tanpa Sidebar** - Tampilan clean dan fokus pada form
✅ **Tanpa Navigasi** - Hanya form input yang ditampilkan
✅ **Responsive** - Optimal untuk mobile dan desktop
✅ **Modern UI** - Desain gradient dengan animasi smooth
✅ **Success Screen** - Menampilkan nomor tiket setelah berhasil
✅ **Unit Lock** - Jika ada parameter unit_id, field unit akan terkunci

## Cara Penggunaan di QR Management

1. Buka halaman **QR Code Management**
2. Pada kolom **Redirect URL**, masukkan:
   ```
   http://localhost:3002/standalone/tiket-internal
   ```
   
3. Jika ingin mengunci unit tertentu, tambahkan parameter:
   ```
   http://localhost:3002/standalone/tiket-internal?unit_id=123
   ```

4. Generate QR Code
5. Scan QR Code akan langsung membuka form standalone

## Perbedaan dengan Form Lain

| Form | URL | Login | Sidebar | Navigasi |
|------|-----|-------|---------|----------|
| **Standalone** | `/standalone/tiket-internal` | ❌ | ❌ | ❌ |
| Direct Form | `/form/internal` | ❌ | ❌ | ✅ |
| Mobile Form | `/m/tiket-internal` | ❌ | ❌ | ✅ |
| Admin Form | `/tickets/create/internal` | ✅ | ✅ | ✅ |

## URL Production (Setelah Deploy)

Ganti `localhost:3002` dengan domain production Anda:
```
https://your-domain.com/standalone/tiket-internal
https://your-domain.com/standalone/tiket-internal?unit_id=123
```

## Testing

1. Buka browser
2. Akses: `http://localhost:3002/standalone/tiket-internal`
3. Isi form dan submit
4. Verifikasi tiket berhasil dibuat
5. Cek success screen dengan nomor tiket

## Catatan

- Form ini menggunakan API yang sama dengan form admin
- Data master (units, categories, types) diambil dari backend
- Tiket yang dibuat akan masuk ke sistem yang sama
- Tidak perlu login untuk mengakses form ini
- Cocok untuk QR Code yang dipasang di area publik
