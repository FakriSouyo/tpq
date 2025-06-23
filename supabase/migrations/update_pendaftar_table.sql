-- Tambah kolom baru untuk juz Al-Quran
alter table pendaftar_santri
add column juz_alquran int,
add column foto_akte text,
add column foto_kk text,
add column foto_3x4 text,
add column foto_2x4 text,
add column is_verified boolean default false,
add column tanggal_verifikasi timestamp with time zone,
add column verifikasi_oleh uuid references auth.users,
add column notifikasi_terkirim boolean default false;

-- Buat tabel untuk biaya pendaftaran
create table biaya_pendaftaran (
    id uuid default gen_random_uuid() primary key,
    nama_biaya text not null,
    jumlah int not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Insert data default biaya
insert into biaya_pendaftaran (nama_biaya, jumlah) values
('Biaya Pendaftaran', 25000),
('SPP Bulan Berjalan', 25000),
('Buku Prestasi Iqro', 10000),
('Buku Prestasi Al-Quran', 15000),
('Buku KMH', 50000),
('Buku Raport', 25000),
('Buku Iqro', 30000);

-- Buat tabel untuk pembayaran
create table pembayaran (
    id uuid default gen_random_uuid() primary key,
    pendaftar_id uuid references pendaftar_santri not null,
    total_biaya int not null,
    detail_biaya jsonb not null,
    bukti_pembayaran text,
    status_pembayaran text default 'Menunggu Pembayaran',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable RLS untuk tabel baru
alter table biaya_pendaftaran enable row level security;
alter table pembayaran enable row level security;

-- Policies untuk biaya_pendaftaran
create policy "Enable read access for all users"
on biaya_pendaftaran for select
to anon, authenticated
using (true);

-- Policies untuk pembayaran
create policy "Enable insert for anon and authenticated"
on pembayaran for insert
to anon, authenticated
with check (true);

create policy "Enable select for authenticated users"
on pembayaran for select
to authenticated
using (true); 