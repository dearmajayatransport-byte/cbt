-- ============================================
-- SCHEMA SQL UNTUK APLIKASI ONLINE CBT
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 0. Drop existing constraints if needed (run only if modifying existing DB)
-- ALTER TABLE soal DROP CONSTRAINT IF EXISTS soal_pkey;
-- ALTER TABLE soal DROP CONSTRAINT IF EXISTS soal_nomor_key;

-- 1. Tabel test (kumpulan soal untuk satu ujian)
CREATE TABLE IF NOT EXISTS test (
  id SERIAL PRIMARY KEY,
  nama_test TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample tests
INSERT INTO test (nama_test) VALUES ('Ujian Harian') ON CONFLICT DO NOTHING;
INSERT INTO test (nama_test) VALUES ('UTS Semester 1') ON CONFLICT DO NOTHING;
INSERT INTO test (nama_test) VALUES ('UAS Semester 1') ON CONFLICT DO NOTHING;

-- 2. Tabel konfigurasi_ujian (menyimpan sesi ujian aktif)
CREATE TABLE IF NOT EXISTS konfigurasi_ujian (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'standby' 
    CHECK (status IN ('standby', 'mulai', 'selesai', 'tampilkan_nilai')),
  nama_ujian TEXT DEFAULT 'Ujian Online',
  test_id INTEGER REFERENCES test(id) ON DELETE SET NULL,
  kelas_target TEXT, -- NULL = semua kelas, atau spesifik misal "XII IPA 1"
  durasi_menit INTEGER DEFAULT 60,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert/update default row
INSERT INTO konfigurasi_ujian (id, status) 
VALUES (1, 'standby') 
ON CONFLICT (id) DO NOTHING;

-- 3. Tabel soal (setiap soal punya test_id)
CREATE TABLE IF NOT EXISTS soal (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES test(id) ON DELETE CASCADE NOT NULL,
  nomor INTEGER NOT NULL,
  pertanyaan TEXT NOT NULL,
  opsi_a TEXT NOT NULL,
  opsi_b TEXT NOT NULL,
  opsi_c TEXT NOT NULL,
  opsi_d TEXT NOT NULL,
  jawaban_benar CHAR(1) NOT NULL CHECK (jawaban_benar IN ('A','B','C','D')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, nomor)
);

-- 4. Tabel siswa
CREATE TABLE IF NOT EXISTS siswa (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  nomor_peserta TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  status_login TEXT NOT NULL DEFAULT 'offline' 
    CHECK (status_login IN ('offline', 'online', 'selesai')),
  ujian_id INTEGER REFERENCES konfigurasi_ujian(id) ON DELETE SET NULL, -- track which ujian they took
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
ALTER PUBLICATION supabase_realtime ADD TABLE soal;
ALTER PUBLICATION supabase_realtime ADD TABLE test;
ALTER PUBLICATION supabase_realtime ADD TABLE siswa;

-- ============================================
-- ROW LEVEL SECURITY (RLS) - OPTIONAL
-- Disable untuk development, enable untuk production
-- ============================================
-- ALTER TABLE konfigurasi_ujian DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE soal DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE test DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE siswa DISABLE ROW LEVEL SECURITY;
