-- Cek semua data di tabel
SELECT 'test' as table_name, COUNT(*) as count FROM test
UNION ALL
SELECT 'soal', COUNT(*) FROM soal
UNION ALL
SELECT 'konfigurasi_ujian', COUNT(*) FROM konfigurasi_ujian
UNION ALL
SELECT 'siswa', COUNT(*) FROM siswa;

-- Cek struktur siswa
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'siswa'
ORDER BY ordinal_position;