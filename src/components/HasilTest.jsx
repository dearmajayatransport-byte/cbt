import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function HasilTest({ onBack }) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTest, setSelectedTest] = useState(null)
  const [siswaList, setSiswaList] = useState([])

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    setLoading(true)
    // Get all tests with their question counts
    const { data: testData } = await supabase
      .from('test')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (testData) {
      // Get question count and student count for each test
      const enrichedTests = await Promise.all(
        testData.map(async (test) => {
          const { count: soalCount } = await supabase
            .from('soal')
            .select('*', { count: 'exact', head: true })
            .eq('test_id', test.id)
          
          // Get students who took this test from konfigurasi_ujian
          const { data: konfig } = await supabase
            .from('konfigurasi_ujian')
            .select('*, test:test_id(*)')
            .eq('test_id', test.id)
            .order('updated_at', { ascending: false })
            .limit(1)
          
          return {
            ...test,
            soal_count: soalCount || 0,
            last_used: konfig?.[0]?.updated_at || null,
            nama_ujian: konfig?.[0]?.nama_ujian || '-'
          }
        })
      )
      setTests(enrichedTests)
    }
    setLoading(false)
  }

  const lihatHasilSiswa = async (test) => {
    setSelectedTest(test)
    // Get all students from the test's questions
    const { data: soal } = await supabase
      .from('soal')
      .select('id')
      .eq('test_id', test.id)
    
    if (soal?.length) {
      // Get students who have nilai (completed the test)
      const { data: students } = await supabase
        .from('siswa')
        .select('*')
        .not('nilai', 'is', null)
        .order('nilai', { ascending: false })
      
      setSiswaList(students || [])
    } else {
      setSiswaList([])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-mono flex items-center justify-center">
        <div className="text-slate-400">⏳ Memuat...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
            ← Dashboard
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-bold text-white">Hasil Test</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {!selectedTest ? (
          <>
            {/* List of Tests with Results */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Riwayat Test</h2>
                <p className="text-slate-400 text-sm mt-1">Lihat hasil ujian dari setiap test</p>
              </div>
            </div>

            {tests.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-slate-500 text-sm">Belum ada test.</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/80">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Nama Test</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Nama Ujian</th>
                      <th className="text-center px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Soal</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Terakhir Digunakan</th>
                      <th className="text-right px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {tests.map((test) => (
                      <tr key={test.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold text-white">{test.nama_test}</span>
                          {test.deskripsi && <p className="text-slate-500 text-xs mt-0.5">{test.deskripsi}</p>}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{test.nama_ujian}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            test.soal_count >= 10 
                              ? 'bg-emerald-900/30 text-emerald-400'
                              : 'bg-amber-900/30 text-amber-400'
                          }`}>
                            {test.soal_count} soal
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {test.last_used 
                            ? new Date(test.last_used).toLocaleDateString('id-ID', { 
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => lihatHasilSiswa(test)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            📊 Lihat Hasil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Detail Hasil Test */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedTest(null)} 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  ← Kembali
                </button>
                <span className="text-slate-700">/</span>
                <h2 className="text-lg font-bold text-white">{selectedTest.nama_test}</h2>
              </div>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Siswa</p>
                <p className="text-3xl font-black text-white">{siswaList.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Nilai Rata-rata</p>
                <p className="text-3xl font-black text-amber-400">
                  {siswaList.length > 0 
                    ? Math.round(siswaList.reduce((acc, s) => acc + (s.nilai || 0), 0) / siswaList.length)
                    : 0
                  }
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Nilai Tertinggi</p>
                <p className="text-3xl font-black text-emerald-400">
                  {siswaList.length > 0 ? Math.max(...siswaList.map(s => s.nilai || 0)) : 0}
                </p>
              </div>
            </div>

            {/* Tabel Hasil */}
            {siswaList.length === 0 ? (
              <div className="text-center py-16 bg-slate-900 border border-slate-700 rounded-xl">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-slate-500 text-sm">Belum ada siswa yang menyelesaikan ujian ini.</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/80">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Kelas</th>
                      <th className="text-center px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Nilai</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Waktu Selesai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {siswaList.map((siswa, i) => (
                      <tr key={siswa.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                        <td className="px-4 py-3 text-white font-medium">{siswa.nama}</td>
                        <td className="px-4 py-3 text-slate-400">{siswa.kelas || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-lg font-bold text-lg ${
                            siswa.nilai >= 80 ? 'bg-emerald-900/30 text-emerald-400' :
                            siswa.nilai >= 60 ? 'bg-amber-900/30 text-amber-400' :
                            'bg-red-900/30 text-red-400'
                          }`}>
                            {siswa.nilai}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {siswa.selesai_at 
                            ? new Date(siswa.selesai_at).toLocaleString('id-ID')
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}