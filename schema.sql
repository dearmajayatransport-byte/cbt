-- ============================================
-- SCHEMA SQL UNTUK APLIKASI ONLINE CBT
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Tabel konfigurasi_ujian
CREATE TABLE IF NOT EXISTS konfigurasi_ujian (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'standby' 
    CHECK (status IN ('standby', 'mulai', 'selesai', 'tampilkan_nilai')),
  nama_ujian TEXT DEFAULT 'Ujian Online',
  durasi_menit INTEGER DEFAULT 60,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row jika belum ada
INSERT INTO konfigurasi_ujian (id, status) 
VALUES (1, 'standby') 
ON CONFLICT (id) DO NOTHING;

-- 2. Tabel soal
CREATE TABLE IF NOT EXISTS soal (
  id SERIAL PRIMARY KEY,
  nomor INTEGER NOT NULL,
  pertanyaan TEXT NOT NULL,
  opsi_a TEXT NOT NULL,
  opsi_b TEXT NOT NULL,
  opsi_c TEXT NOT NULL,
  opsi_d TEXT NOT NULL,
  jawaban_benar CHAR(1) NOT NULL CHECK (jawaban_benar IN ('A','B','C','D')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel siswa
CREATE TABLE IF NOT EXISTS siswa (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  kelas TEXT,
  nomor_peserta TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  status_login TEXT NOT NULL DEFAULT 'offline' 
    CHECK (status_login IN ('offline', 'online', 'selesai')),
  nilai INTEGER,
  jawaban JSONB,
  login_at TIMESTAMPTZ,
  selesai_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE REALTIME (jalankan di SQL Editor)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE konfigurasi_ujian;
ALTER PUBLICATION supabase_realtime ADD TABLE siswa;

-- ============================================
-- ROW LEVEL SECURITY (RLS) - OPTIONAL
-- Disable untuk development, enable untuk production
-- ============================================
-- ALTER TABLE konfigurasi_ujian DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE soal DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE siswa DISABLE ROW LEVEL SECURITY;

-- Sample data siswa untuk testing
INSERT INTO siswa (nama, kelas, nomor_peserta, password) VALUES
  ('Andi Sihombing', 'XII IPA 1', '001', 'siswa001'),
  ('Budi Sitorus', 'XII IPA 1', '002', 'siswa002'),
  ('Cici Purba', 'XII IPA 2', '003', 'siswa003'),
  ('Dani Sinaga', 'XII IPS 1', '004', 'siswa004'),
  ('Eva Manurung', 'XII IPS 1', '005', 'siswa005')
ON CONFLICT (nomor_peserta) DO NOTHING;
