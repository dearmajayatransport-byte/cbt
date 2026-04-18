-- 1. Buat tabel test
CREATE TABLE IF NOT EXISTS test (
  id SERIAL PRIMARY KEY,
  nama_test TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert data test (abaikan jika sudah ada)
INSERT INTO test (nama_test) VALUES 
  ('Ujian Harian'), 
  ('UTS Semester 1'), 
  ('UAS Semester 1') 
ON CONFLICT (nama_test) DO NOTHING;

-- 3. Buat tabel konfigurasi_ujian
CREATE TABLE IF NOT EXISTS konfigurasi_ujian (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'standby',
  nama_ujian TEXT DEFAULT 'Ujian Online',
  test_id INTEGER REFERENCES test(id) ON DELETE SET NULL,
  kelas_target TEXT,
  durasi_menit INTEGER DEFAULT 60,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO konfigurasi_ujian (id, status) VALUES (1, 'standby') ON CONFLICT (id) DO NOTHING;

-- 4. Buat tabel soal
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

-- 5. Buat tabel siswa
CREATE TABLE IF NOT EXISTS siswa (
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

-- 6. GRANT permissions ke anon dan authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Nonaktifkan RLS
ALTER TABLE test DISABLE ROW LEVEL SECURITY;
ALTER TABLE konfigurasi_ujian DISABLE ROW LEVEL SECURITY;
ALTER TABLE soal DISABLE ROW LEVEL SECURITY;
ALTER TABLE siswa DISABLE ROW LEVEL SECURITY;