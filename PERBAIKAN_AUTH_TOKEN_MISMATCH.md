# Perbaikan Error "Token tidak valid" dan 403 Forbidden

Saya telah melakukan perbaikan untuk mengatasi masalah autentikasi dan error 403 pada endpoint `/api/users/units`, `/api/master-data/public/units`, dan `/api/notification-settings`.

## Analisis Masalah

1.  **Token Mismatch**: Frontend menggunakan konfigurasi fallback Supabase yang mengarah ke project `jxxzbdivafzzwqhagwrf`, sedangkan Backend menggunakan project `gvgxlpmqwqqcqfammcub`. Hal ini menyebabkan token yang dihasilkan frontend tidak valid di backend (tanda tangan JWT berbeda).
2.  **Fallback URL Salah**: `userService.ts` menggunakan URL fallback `/master-data/public/units` yang tidak ada. URL yang benar adalah `/public/units`.
3.  **Handling Error Kurang Agresif**: Frontend tidak secara otomatis logout ketika backend secara eksplisit menolak token dengan pesan "Token tidak valid", karena frontend masih melihat session lokal sebagai valid.

## Perbaikan yang Dilakukan

1.  **Update `frontend/src/utils/supabaseClient.ts`**:
    *   Mengupdate nilai fallback `supabaseUrl` dan `supabaseAnonKey` agar sesuai dengan project backend (`gvgxlpmqwqqcqfammcub`).
    *   Ini memastikan bahwa jika `.env` gagal dimuat, frontend tetap terhubung ke project yang benar.

2.  **Update `frontend/src/services/userService.ts`**:
    *   Memperbaiki URL fallback dari `/master-data/public/units` menjadi `/public/units`.
    *   Memperbaiki URL fallback dari `/master-data/public/roles` menjadi `/public/roles`.
    *   Menambahkan penanganan respons array langsung dari endpoint public.

3.  **Update `frontend/src/services/api.ts`**:
    *   Menambahkan logika untuk mendeteksi pesan error spesifik "Token tidak valid. Silakan login ulang.".
    *   Jika error ini terdeteksi, aplikasi akan **memaksa logout** dan mengarahkan pengguna ke halaman login, meskipun session lokal terlihat valid. Ini mencegah aplikasi terjebak dalam loop error.

## Langkah Selanjutnya untuk Anda

1.  **Refresh Halaman**: Silakan refresh halaman aplikasi Anda.
2.  **Login Ulang**: Jika Anda diarahkan ke halaman login, silakan login kembali. Token baru yang dihasilkan sekarang akan valid dan diterima oleh backend.
3.  **Cek Console**: Jika masih ada error, periksa console browser. Seharusnya error 403 sudah hilang setelah login ulang.
