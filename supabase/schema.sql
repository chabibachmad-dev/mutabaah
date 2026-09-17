-- =============================================================================
-- Skema database "Mutabaah"
-- Jalankan seluruh file ini SEKALI di Supabase Dashboard -> SQL Editor -> New query -> Run
-- =============================================================================
-- Catatan penting soal keamanan:
-- Aplikasi ini TIDAK memakai login (sesuai permintaan) — user hanya membuat/memilih
-- nama, disimpan di localStorage perangkat. Karena itu semua akses ke tabel di bawah
-- memakai anon key yang sama untuk semua orang, dan RLS di bawah ini bersifat terbuka
-- (siapapun yang punya anon key bisa baca & ubah data siapapun). Ini trade-off yang
-- wajar untuk aplikasi tracking santai antar teman/keluarga tanpa akun, tapi jangan
-- pakai pola ini untuk data yang sensitif/rahasia.
-- =============================================================================

create extension if not exists "pgcrypto"; -- untuk gen_random_uuid()

-- -----------------------------------------------------------------------------
-- Tabel: users — satu baris per orang yang memakai aplikasi
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Tabel: habit_types — daftar target harian milik seorang user
-- (5 default dibuatkan otomatis saat user baru dibuat, lihat trigger di bawah;
--  user bisa menambah target custom, mengubah besaran target, atau mengarsipkannya)
-- -----------------------------------------------------------------------------
create table if not exists public.habit_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  unit text not null default 'kali' check (char_length(trim(unit)) between 1 and 20),
  target_amount numeric not null default 1 check (target_amount > 0),
  is_default boolean not null default false,
  sort_order integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists habit_types_user_id_idx on public.habit_types(user_id);

-- -----------------------------------------------------------------------------
-- Tabel: daily_logs — capaian aktual seorang user untuk satu target di satu tanggal
-- -----------------------------------------------------------------------------
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  habit_type_id uuid not null references public.habit_types(id) on delete cascade,
  log_date date not null default current_date,
  actual_amount numeric not null default 0 check (actual_amount >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, habit_type_id, log_date)
);

create index if not exists daily_logs_date_idx on public.daily_logs(log_date);
create index if not exists daily_logs_user_date_idx on public.daily_logs(user_id, log_date);

-- -----------------------------------------------------------------------------
-- Trigger: otomatis isi 5 target default setiap ada user baru dibuat
-- -----------------------------------------------------------------------------
create or replace function public.seed_default_habit_types()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.habit_types (user_id, name, unit, target_amount, is_default, sort_order)
  values
    (new.id, 'Tilawah', 'juz', 1, true, 1),
    (new.id, 'Shalat Sunnah', 'rakaat', 4, true, 2),
    (new.id, 'Baca Buku', 'halaman', 10, true, 3),
    (new.id, 'Olahraga', 'menit', 30, true, 4),
    (new.id, 'Shadaqah', 'kali', 1, true, 5);
  return new;
end;
$$;

drop trigger if exists trg_seed_default_habit_types on public.users;
create trigger trg_seed_default_habit_types
  after insert on public.users
  for each row execute function public.seed_default_habit_types();

-- -----------------------------------------------------------------------------
-- Trigger: auto-update kolom updated_at di daily_logs setiap kali diubah
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_daily_logs on public.daily_logs;
create trigger trg_touch_daily_logs
  before update on public.daily_logs
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security — dibuka untuk anon key (lihat catatan keamanan di atas)
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.habit_types enable row level security;
alter table public.daily_logs enable row level security;

-- users: siapapun boleh lihat daftar nama (untuk fitur "pilih user" & klasemen)
-- dan boleh membuat user baru + mengubah namanya sendiri. Tidak ada policy delete
-- (sengaja) supaya tidak ada yang bisa menghapus user lain lewat app.
drop policy if exists "users_select_all" on public.users;
create policy "users_select_all" on public.users for select using (true);

drop policy if exists "users_insert_all" on public.users;
create policy "users_insert_all" on public.users for insert with check (true);

drop policy if exists "users_update_all" on public.users;
create policy "users_update_all" on public.users for update using (true) with check (true);

-- habit_types & daily_logs: dibuka penuh (select/insert/update/delete) karena
-- tidak ada konsep "milik saya" tanpa login — semua yang pegang anon key setara.
drop policy if exists "habit_types_all" on public.habit_types;
create policy "habit_types_all" on public.habit_types for all using (true) with check (true);

drop policy if exists "daily_logs_all" on public.daily_logs;
create policy "daily_logs_all" on public.daily_logs for all using (true) with check (true);

-- =============================================================================
-- Selesai. Setelah ini jalan, tabel users, habit_types, dan daily_logs siap dipakai
-- oleh aplikasi Mutabaah.
-- =============================================================================
