-- Refresh semua tabel dari nol
-- Copy dan jalankan di SQL Editor

-- 1. Hapus semua tabel
DROP TABLE IF EXISTS soal CASCADE;
DROP TABLE IF EXISTS konfigurasi_ujian CASCADE;
DROP TABLE IF EXISTS test CASCADE;
DROP TABLE IF EXISTS siswa CASCADE;

-- 2. Buat tabel test
CREATE TABLE test (
  id SERIAL PRIMARY KEY,
  nama_test TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert test default
INSERT INTO test (nama_test) VALUES 
  ('Ujian Harian'), 
  ('UTS Semester 1'), 
  ('UAS Semester 1');

-- 4. Buat tabel konfigurasi_ujian
CREATE TABLE konfigurasi_ujian (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'standby',
  nama_ujian TEXT DEFAULT 'Ujian Online',
  test_id INTEGER REFERENCES test(id) ON DELETE SET NULL,
  kelas_target TEXT,
  durasi_menit INTEGER DEFAULT 60,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO konfigurasi_ujian (id, status) VALUES (1, 'standby');

-- 5. Buat tabel soal
CREATE TABLE soal (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES test(id) ON DELETE CASCADE NOT NULL,
  nomor INTEGER NOT NULL,
  pertanyaan TEXT NOT NULL,
  opsi_a TEXT NOT NULL,
  opsi_b TEXT NOT NULL,
  opsi_c TEXT NOT NULL,
  opsi_d TEXT NOT NULL,
  jawaban_benar CHAR(1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, nomor)
);

-- 6. Buat tabel siswa
CREATE TABLE siswa (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  kelas TEXT,
  nomor_peserta TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  status_login TEXT NOT NULL DEFAULT 'offline',
  jh TEXT,
  ruangan TEXT,
  nilai INTEGER,
  jawaban JSONB,
  login_at TIMESTAMPTZ,
  selesai_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Disable RLS
ALTER TABLE test DISABLE ROW LEVEL SECURITY;
ALTER TABLE konfigurasi_ujian DISABLE ROW LEVEL SECURITY;
ALTER TABLE soal DISABLE ROW LEVEL SECURITY;
ALTER TABLE siswa DISABLE ROW LEVEL SECURITY;

-- 8. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 9. Verifikasi
SELECT 
  (SELECT COUNT(*) FROM test) as test_count,
  (SELECT COUNT(*) FROM konfigurasi_ujian) as konfigurasi_count,
  (SELECT COUNT(*) FROM soal) as soal_count,
  (SELECT COUNT(*) FROM siswa) as siswa_count;