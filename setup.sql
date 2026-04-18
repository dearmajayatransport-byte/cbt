-- 1. Tabel test (jika belum ada)
CREATE TABLE IF NOT EXISTS test (
  id SERIAL PRIMARY KEY,
  nama_test TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO test (nama_test) VALUES ('Ujian Harian') ON CONFLICT DO NOTHING;
INSERT INTO test (nama_test) VALUES ('UTS Semester 1') ON CONFLICT DO NOTHING;
INSERT INTO test (nama_test) VALUES ('UAS Semester 1') ON CONFLICT DO NOTHING;

-- 2. Tabel konfigurasi_ujian (jika belum ada)
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

-- 3. Tabel soal (jika belum ada)
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

-- 4. Tabel siswa (jika belum ada)
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

-- Enable Realtime (abaikan jika sudah ada)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS test;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS konfigurasi_ujian;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS soal;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS siswa;

-- Disable RLS
ALTER TABLE IF EXISTS test DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS konfigurasi_ujian DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS soal DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS siswa DISABLE ROW LEVEL SECURITY;