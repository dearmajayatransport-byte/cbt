-- ============================================
-- MIGRATION: Tambah kolom jh & ruangan ke tabel siswa
-- Jalankan di Supabase SQL Editor
-- ============================================

ALTER TABLE siswa 
  ADD COLUMN IF NOT EXISTS jh TEXT,
  ADD COLUMN IF NOT EXISTS ruangan TEXT;

-- Index untuk query yang lebih cepat
CREATE INDEX IF NOT EXISTS idx_siswa_jh ON siswa(jh);
CREATE INDEX IF NOT EXISTS idx_siswa_ruangan ON siswa(ruangan);
CREATE INDEX IF NOT EXISTS idx_siswa_jh_ruangan ON siswa(jh, ruangan);

-- Verifikasi kolom berhasil ditambahkan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'siswa' 
ORDER BY ordinal_position;
