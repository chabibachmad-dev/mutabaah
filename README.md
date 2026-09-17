# Mutabaah

Aplikasi pelacak target ibadah & kebiasaan harian (mutabaah yaumiyah), tanpa perlu login —
cukup buat nama sekali di perangkatmu. Dibuat sebagai PWA (Progressive Web App) supaya bisa
"diinstall" di HP seperti aplikasi biasa.

Target bawaan (bisa diubah besarannya atau dihapus, dan bisa tambah target baru sendiri):

1. Tilawah
2. Shalat Sunnah
3. Baca Buku
4. Olahraga
5. Shadaqah

Ada juga halaman **Klasemen** yang membandingkan rata-rata persentase capaian target harian
antar semua user aplikasi ini.

## 1. Setup database Supabase (sekali saja)

1. Buka project Supabase kamu di https://supabase.com/dashboard
2. Masuk ke menu **SQL Editor** → **New query**
3. Copy seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql) di repo ini, paste, lalu klik **Run**
4. Selesai — tabel `users`, `habit_types`, dan `daily_logs` beserta keamanan (RLS) sudah siap

> Catatan keamanan: karena aplikasi ini tidak pakai login, semua orang yang membuka aplikasi
> memakai `anon key` yang sama, dan lewat RLS semua orang bisa saling melihat/mengubah data
> (supaya fitur klasemen & pilih-user bisa jalan). Cocok untuk pemakaian santai antar
> keluarga/teman, tapi jangan pakai untuk data yang perlu dirahasiakan.

## 2. Jalankan aplikasi di komputer (development)

Pastikan [Node.js](https://nodejs.org) versi 18+ sudah terinstall.

```bash
npm install
npm run dev
```

Buka alamat yang muncul di terminal (biasanya `http://localhost:5173`).

Kredensial Supabase sudah diisi di file `.env` (lihat `.env.example` sebagai contoh format).
File `.env` sengaja tidak ikut ke GitHub (lihat `.gitignore`) — kalau kamu clone ulang repo ini
di komputer lain, salin `.env.example` menjadi `.env` lalu isi ulang URL & anon key project
Supabase kamu.

## 3. Build untuk production

```bash
npm run build
```

Hasilnya ada di folder `dist/` — folder ini yang di-deploy ke hosting.

## 4. Deploy supaya bisa dipakai dari HP (disarankan: Vercel atau Netlify, gratis)

Paling gampang pakai **Vercel**:

1. Push repo ini ke GitHub (kalau pakai GitHub Desktop: `File → Add local repository`, pilih
   folder project ini, lalu `Publish repository` ke akun GitHub kamu dengan nama `mutabaah`)
2. Buka https://vercel.com → **Add New Project** → import repo `mutabaah`
3. Vercel otomatis mendeteksi ini project Vite — biarkan default build command (`npm run build`)
   dan output directory (`dist`)
4. Di bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = URL project Supabase kamu
   - `VITE_SUPABASE_ANON_KEY` = anon public key project Supabase kamu
5. Klik **Deploy**

Setelah deploy selesai, buka link Vercel-nya lewat HP (Chrome/Safari), lalu:

- **Android (Chrome)**: menu titik tiga → "Tambahkan ke layar Utama" / "Install app"
- **iPhone (Safari)**: tombol Share → "Tambah ke Layar Utama"

Aplikasi akan muncul seperti app biasa dengan ikon sendiri, tanpa address bar browser.

Alternatif deploy lain yang juga gratis & serupa langkahnya: **Netlify** (drag-drop folder
`dist/`, atau hubungkan ke repo GitHub dengan cara yang sama seperti Vercel).

## Struktur project

```
src/
  lib/
    supabaseClient.js  -> koneksi ke Supabase
    api.js             -> semua query ke database (users, habit_types, daily_logs)
    scoring.js         -> rumus perhitungan persentase & skor klasemen
    dateUtils.js       -> helper format tanggal
    storage.js         -> simpan identitas user di localStorage (pengganti login)
  components/
    HabitCard.jsx      -> kartu satu target di halaman "Hari Ini"
    ProgressRing.jsx   -> lingkaran persentase capaian harian
  pages/
    Onboarding.jsx     -> buat nama baru / pilih nama yang sudah ada
    TodayPage.jsx       -> input capaian harian (bisa lihat tanggal sebelumnya juga)
    LeaderboardPage.jsx -> klasemen antar user
    TargetsPage.jsx     -> kelola target: tambah baru, ubah besaran, hapus
supabase/
  schema.sql           -> script SQL setup tabel & keamanan (RLS) di Supabase
```

## Cara kerja "tanpa login"

Saat pertama kali membuka aplikasi, kamu diminta membuat nama (atau memilih nama yang sudah
ada di daftar, kalau sebelumnya sudah pernah dibuat orang lain/di perangkat lain). ID user
tersebut disimpan di `localStorage` HP/browser kamu, jadi aplikasi otomatis "ingat" kamu tiap
dibuka lagi — tanpa email/password. Kalau HP di-reset atau cache browser dibersihkan, kamu
tinggal pilih lagi nama yang sama dari daftar (menu ⇄ di pojok kanan atas untuk ganti user).
