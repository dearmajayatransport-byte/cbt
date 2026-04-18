import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import InputSoal from '../components/InputSoal'
import DataSiswa from '../components/DataSiswa'
import ManageTests from '../components/ManageTests'

const STATUS_LABEL = {
  standby: { label: 'Standby', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-600', dot: 'bg-slate-400' },
  mulai:   { label: 'Ujian Berlangsung', color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-600', dot: 'bg-amber-400' },
  selesai: { label: 'Ujian Selesai', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-600', dot: 'bg-blue-400' },
  tampilkan_nilai: { label: 'Nilai Dirilis', color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-600', dot: 'bg-emerald-400' },
}

const STATUS_SISWA = {
  offline: { label: 'Offline', color: 'text-slate-500', dot: 'bg-slate-500' },
  online:  { label: 'Mengerjakan', color: 'text-amber-400', dot: 'bg-amber-400' },
  selesai: { label: 'Selesai', color: 'text-emerald-400', dot: 'bg-emerald-400' },
}

// ─── Login Admin ──────────────────────────────────────────────────────────────
function LoginAdmin({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  const ADMIN_USER = 'admin'
  const ADMIN_PASS = 'admin123'

  const handle = (e) => {
    e.preventDefault()
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem('admin_logged_in', 'true')
      onLogin()
    } else {
      setErr('Username atau password salah.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-400/10 border border-red-400/30 text-3xl mb-4">
            🔐
          </div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Online CBT Management</p>
        </div>
        <form onSubmit={handle} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
            <input
              value={user} onChange={e => setUser(e.target.value)}
              placeholder="admin"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password" value={pass} onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl text-sm transition-all hover:scale-[1.02]">
            Masuk →
          </button>
        </form>
        <p className="text-center text-slate-600 text-xs mt-4">Demo: admin / admin123</p>
      </div>
    </div>
  )
}

// ─── Monitoring Tabel ─────────────────────────────────────────────────────────
function TabelMonitoring({ siswaList, statusUjian, showOnlineOnly, onLogout }) {
  const displayedSiswa = showOnlineOnly
    ? siswaList.filter(s => s.status_login !== 'offline')
    : siswaList
  const selesai = displayedSiswa.filter(s => s.status_login === 'selesai').length
  const mengerjakan = displayedSiswa.filter(s => s.status_login === 'online').length
  const offline = displayedSiswa.filter(s => s.status_login === 'offline').length

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
      {/* Statistik bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">{selesai}</p>
          <p className="text-xs text-slate-500 mt-0.5">Selesai</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-black text-amber-400">{mengerjakan}</p>
          <p className="text-xs text-slate-500 mt-0.5">Mengerjakan</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-black text-slate-400">{offline}</p>
          <p className="text-xs text-slate-500 mt-0.5">Offline</p>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Nama Siswa</th>
              <th className="px-4 py-3 text-left">Kelas</th>
              <th className="px-4 py-3 text-left">No. Peserta</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Nilai</th>
              <th className="px-4 py-3 text-left">Selesai Pada</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {displayedSiswa.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-600 text-xs">
                  {showOnlineOnly ? 'Tidak ada siswa yang aktif.' : 'Belum ada data siswa'}
                </td>
              </tr>
            ) : (
              displayedSiswa.map((siswa, i) => {
                const st = STATUS_SISWA[siswa.status_login] || STATUS_SISWA.offline
                return (
                  <tr key={siswa.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 text-white font-medium">{siswa.nama}</td>
                    <td className="px-4 py-3 text-slate-400">{siswa.kelas || '-'}</td>
                    <td className="px-4 py-3 text-amber-400 font-mono">{siswa.nomor_peserta}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${st.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${siswa.status_login === 'online' ? 'animate-pulse' : ''}`} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {statusUjian === 'tampilkan_nilai' || siswa.nilai !== null ? (
                        <span className={`font-black text-base ${
                          siswa.nilai >= 80 ? 'text-emerald-400' :
                          siswa.nilai >= 60 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {siswa.nilai ?? '-'}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {siswa.selesai_at ? new Date(siswa.selesai_at).toLocaleTimeString('id-ID') : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {siswa.status_login === 'online' && (
                          <button
                            onClick={() => onLogout(siswa)}
                            title="Keluar siswa"
                            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-slate-300 transition-colors"
                          >
                            Keluar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true'
  })
  const [view, setView] = useState('dashboard')
  const [statusUjian, setStatusUjian] = useState('standby')
  const [namaUjian, setNamaUjian] = useState('Ujian Online')
  const [currentTest, setCurrentTest] = useState(null)
  const [kelasTarget, setKelasTarget] = useState('')
  const [siswaList, setSiswaList] = useState([])
  const [jumlahSoal, setJumlahSoal] = useState(0)
  const [loading, setLoading] = useState({})
  const [konfirmasi, setKonfirmasi] = useState(null)
  const [showOnlineOnly, setShowOnlineOnly] = useState(true)
  const [modalUjianBaru, setModalUjianBaru] = useState(false)
  const [tests, setTests] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [selectedTestId, setSelectedTestId] = useState('')
  const [selectedKelas, setSelectedKelas] = useState('')
  const [namaUjianBaru, setNamaUjianBaru] = useState('')
  const channelRef = useRef(null)

  useEffect(() => {
    if (!loggedIn) return
    fetchAwal()
    setupRealtime()
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [loggedIn])

  const fetchAwal = async () => {
    const [{ data: cfg }, { data: sw }, { data: sq }, { data: testsData }, { data: kelasData }] = await Promise.all([
      supabase.from('konfigurasi_ujian').select('status, nama_ujian, test_id, kelas_target').eq('id', 1).single(),
      supabase.from('siswa').select('*').order('nomor_peserta'),
      supabase.from('soal').select('id'),
      supabase.from('test').select('*').order('created_at', { ascending: true }),
      supabase.from('siswa').select('kelas').not('kelas', 'is', null),
    ])
    if (cfg) {
      setStatusUjian(cfg.status)
      setNamaUjian(cfg.nama_ujian || 'Ujian Online')
      setCurrentTest(cfg.test_id)
      setKelasTarget(cfg.kelas_target || '')
    }
    if (sw) setSiswaList(sw)
    if (sq) setJumlahSoal(sq.length)
    if (testsData) setTests(testsData)
    if (kelasData) {
      const unique = [...new Set(kelasData.map(k => k.kelas).filter(Boolean))]
      setKelasList(unique)
    }
  }

  const setupRealtime = () => {
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'siswa' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setSiswaList(prev => prev.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s))
        } else if (payload.eventType === 'INSERT') {
          setSiswaList(prev => [...prev, payload.new])
        } else if (payload.eventType === 'DELETE') {
          setSiswaList(prev => prev.filter(s => s.id !== payload.old.id))
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'konfigurasi_ujian', filter: 'id=eq.1' }, (payload) => {
        setStatusUjian(payload.new.status)
        if (payload.new.nama_ujian) setNamaUjian(payload.new.nama_ujian)
      })
      .subscribe()
    channelRef.current = channel
  }

   const handleLogoutSiswa = async (siswa) => {
     await supabase.from('siswa').update({
       status_login: 'offline',
       login_at: null
     }).eq('id', siswa.id)
     // Real-time will update the list
   }

   const updateStatus = async (newStatus) => {
     setLoading(prev => ({ ...prev, [newStatus]: true }))
     const { error } = await supabase
       .from('konfigurasi_ujian')
       .update({ status: newStatus, updated_at: new Date().toISOString() })
       .eq('id', 1)
     if (!error) setStatusUjian(newStatus)
     setLoading(prev => ({ ...prev, [newStatus]: false }))
     setKonfirmasi(null)
   }

   const openUjianBaru = () => {
     setSelectedTestId(currentTest || '')
     setSelectedKelas(kelasTarget || '')
     setNamaUjianBaru(namaUjian)
     setModalUjianBaru(true)
   }

   const saveUjianBaru = async () => {
     if (!selectedTestId) return alert('Pilih test terlebih dahulu')
     setLoading(prev => ({ ...prev, ujian_baru: true }))
     const updateData = {
       test_id: parseInt(selectedTestId),
       status: 'standby',
       updated_at: new Date().toISOString()
     }
     if (namaUjianBaru.trim()) updateData.nama_ujian = namaUjianBaru.trim()
     if (selectedKelas) updateData.kelas_target = selectedKelas

     const { error } = await supabase.from('konfigurasi_ujian').update(updateData).eq('id', 1)
     if (!error) {
       setCurrentTest(parseInt(selectedTestId))
       setKelasTarget(selectedKelas)
       setNamaUjian(namaUjianBaru.trim() || 'Ujian Online')
       setModalUjianBaru(false)
       fetchAwal()
     }
     setLoading(prev => ({ ...prev, ujian_baru: false }))
   }

  const handleResetUjian = async () => {
    setLoading(prev => ({ ...prev, reset: true }))
    await supabase.from('konfigurasi_ujian').update({ status: 'standby' }).eq('id', 1)
    await supabase.from('siswa').update({ status_login: 'offline', nilai: null, jawaban: null, selesai_at: null, login_at: null })
    setSiswaList(prev => prev.map(s => ({ ...s, status_login: 'offline', nilai: null })))
    setStatusUjian('standby')
    setLoading(prev => ({ ...prev, reset: false }))
    setKonfirmasi(null)
  }

  const semuaSiswaSelesai = siswaList.filter(s => s.status_login !== 'offline').length > 0
    && siswaList.filter(s => s.status_login !== 'offline').every(s => s.status_login === 'selesai')

  const siswaOnline = siswaList.filter(s => s.status_login !== 'offline')
  const pct = siswaOnline.length > 0
    ? Math.round((siswaOnline.filter(s => s.status_login === 'selesai').length / siswaOnline.length) * 100)
    : 0

  const stInfo = STATUS_LABEL[statusUjian] || STATUS_LABEL.standby

   if (!loggedIn) return <LoginAdmin onLogin={() => setLoggedIn(true)} />
   if (view === 'input_soal') return <InputSoal onBack={() => { setView('dashboard'); fetchAwal() }} testId={selectedTestId} />
   if (view === 'data_siswa') return <DataSiswa onBack={() => setView('dashboard')} />
   if (view === 'manage_tests') return <ManageTests onBack={() => { setView('dashboard'); fetchAwal() }} />

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-white">🎓 CBT Admin</span>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${stInfo.bg} ${stInfo.border} ${stInfo.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stInfo.dot} ${statusUjian === 'mulai' ? 'animate-pulse' : ''}`} />
              {stInfo.label}
            </span>
          </div>
           <div className="flex items-center gap-2">
             <button
               onClick={() => setView('data_siswa')}
               className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
             >
               👥 <span className="hidden sm:inline">Data Siswa</span>
             </button>
             <button
               onClick={() => setView('manage_tests')}
               className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
             >
               📚 <span className="hidden sm:inline">Kelola Test</span>
               {tests.length > 0 && <span className="text-xs text-amber-400">({tests.length})</span>}
             </button>
             <button
               onClick={() => setView('input_soal')}
               className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
             >
               📝 <span className="hidden sm:inline">Input Soal</span>
             </button>
             <button
               onClick={() => setModalUjianBaru(true)}
               className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 rounded-lg transition-colors flex items-center gap-2"
             >
               🆕 <span className="hidden sm:inline">Ujian Baru</span>
             </button>
             <button
               onClick={() => {
                 localStorage.removeItem('admin_logged_in')
                 setLoggedIn(false)
               }}
               className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
             >
               Logout
             </button>
           </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
         {/* Panel Kontrol Ujian */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Status Card */}
           <div className={`rounded-xl border p-5 ${stInfo.bg} ${stInfo.border}`}>
             <div className="flex items-center justify-between mb-2">
               <p className="text-xs text-slate-500 uppercase tracking-wider">Nama Ujian</p>
             </div>
             <h3 className="text-lg font-black text-white mb-3 truncate" title={namaUjian}>{namaUjian}</h3>
             <p className="text-xs text-slate-500 mb-1">Status Ujian</p>
             <div className="flex items-center gap-2 mb-1">
               <span className={`w-3 h-3 rounded-full ${stInfo.dot} ${statusUjian === 'mulai' ? 'animate-pulse' : ''}`} />
               <p className={`text-lg font-bold ${stInfo.color}`}>{stInfo.label}</p>
             </div>
             <p className="text-xs text-slate-500">
               {statusUjian === 'standby' && 'Ujian belum dimulai'}
               {statusUjian === 'mulai' && `${siswaOnline.filter(s => s.status_login === 'selesai').length}/${siswaOnline.length} selesai`}
               {statusUjian === 'selesai' && 'Semua siswa selesai mengerjakan'}
               {statusUjian === 'tampilkan_nilai' && 'Nilai sudah dirilis ke siswa'}
             </p>
           </div>

          {/* Soal Card */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Bank Soal</p>
            <p className={`text-3xl font-black mb-1 ${jumlahSoal >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {jumlahSoal}
            </p>
            <p className="text-xs text-slate-500">
              {jumlahSoal === 0 ? '⚠️ Belum ada soal!' : jumlahSoal < 10 ? `${jumlahSoal}/10 soal` : '✅ 10 soal siap'}
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Progress Siswa</p>
            <p className="text-3xl font-black text-white mb-2">{pct}%</p>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {siswaOnline.filter(s => s.status_login === 'selesai').length}/{siswaOnline.length} selesai
            </p>
          </div>
        </div>

        {/* Tombol Aksi Utama */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Kontrol Ujian</p>
          <div className="flex flex-wrap gap-3">

            {/* MULAI */}
            {statusUjian === 'standby' && (
              <button
                onClick={() => setKonfirmasi('mulai')}
                disabled={jumlahSoal < 10}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                ▶ Mulai Ujian
                {jumlahSoal < 10 && <span className="text-xs opacity-70">(soal kurang)</span>}
              </button>
            )}

            {/* HENTIKAN MANUAL */}
            {statusUjian === 'mulai' && (
              <button
                onClick={() => setKonfirmasi('selesai')}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                ⏹ Hentikan Ujian
              </button>
            )}

            {/* TAMPILKAN HASIL */}
            {(statusUjian === 'selesai' || statusUjian === 'mulai') && (
              <button
                onClick={() => setKonfirmasi('rilis')}
                className={`px-5 py-3 font-bold rounded-xl text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${
                  semuaSiswaSelesai || statusUjian === 'selesai'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    : 'bg-emerald-900/40 border border-emerald-700 text-emerald-400 hover:bg-emerald-800/40'
                }`}
              >
                🏆 Tampilkan Hasil Test
                {semuaSiswaSelesai && <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Semua selesai ✓</span>}
              </button>
            )}

            {/* RESET */}
            {statusUjian !== 'standby' && (
              <button
                onClick={() => setKonfirmasi('reset')}
                className="px-5 py-3 bg-red-900/40 border border-red-700 text-red-400 hover:bg-red-900/60 font-bold rounded-xl text-sm transition-all flex items-center gap-2"
              >
                🔄 Reset Ujian
              </button>
            )}

          </div>

          {/* Peringatan soal kurang */}
          {statusUjian === 'standby' && jumlahSoal < 10 && (
            <div className="mt-3 flex items-center gap-2 text-amber-400 text-xs bg-amber-900/20 border border-amber-800 rounded-lg px-3 py-2">
              ⚠️ Soal harus 10 sebelum memulai. Klik "Input Soal" di navbar untuk mengisi soal.
            </div>
          )}

          {/* Notif semua selesai */}
          {statusUjian === 'mulai' && semuaSiswaSelesai && (
            <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs bg-emerald-900/20 border border-emerald-700 rounded-lg px-3 py-2 animate-pulse">
              ✅ Semua siswa sudah selesai mengerjakan! Klik "Tampilkan Hasil Test" untuk merilis nilai.
            </div>
          )}
        </div>

        {/* Tabel Monitoring */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Monitor Peserta
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  showOnlineOnly
                    ? 'bg-amber-500/10 border-amber-600 text-amber-400'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {showOnlineOnly ? '👁️ Aktif saja' : '👁️‍🗨️ Semua'}
              </button>
              <button
                onClick={fetchAwal}
                className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          <TabelMonitoring
            siswaList={siswaList}
            statusUjian={statusUjian}
            showOnlineOnly={showOnlineOnly}
            onLogout={handleLogoutSiswa}
          />
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {konfirmasi && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-600 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            {konfirmasi === 'mulai' && (
              <>
                <p className="text-3xl mb-3">▶️</p>
                <h3 className="font-bold text-white mb-2">Mulai Ujian?</h3>
                <p className="text-slate-400 text-sm mb-5">
                  Semua siswa yang online akan otomatis mendapatkan soal dan mulai mengerjakan.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setKonfirmasi(null)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition-colors">Batal</button>
                  <button onClick={() => updateStatus('mulai')} disabled={loading.mulai} className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl text-sm transition-colors">
                    {loading.mulai ? '⏳' : '▶ Mulai'}
                  </button>
                </div>
              </>
            )}
            {konfirmasi === 'selesai' && (
              <>
                <p className="text-3xl mb-3">⏹️</p>
                <h3 className="font-bold text-white mb-2">Hentikan Ujian?</h3>
                <p className="text-slate-400 text-sm mb-5">
                  Siswa yang belum selesai tidak bisa lagi mengumpulkan jawaban.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setKonfirmasi(null)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm">Batal</button>
                  <button onClick={() => updateStatus('selesai')} disabled={loading.selesai} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm">
                    {loading.selesai ? '⏳' : '⏹ Hentikan'}
                  </button>
                </div>
              </>
            )}
            {konfirmasi === 'rilis' && (
              <>
                <p className="text-3xl mb-3">🏆</p>
                <h3 className="font-bold text-white mb-2">Rilis Nilai Sekarang?</h3>
                <p className="text-slate-400 text-sm mb-5">
                  Nilai akan langsung tampil di layar semua siswa secara real-time.
                  Tindakan ini <span className="text-amber-400">tidak dapat dibatalkan</span>.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setKonfirmasi(null)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm">Batal</button>
                  <button
                    onClick={async () => {
                      await updateStatus('selesai')
                      await updateStatus('tampilkan_nilai')
                    }}
                    disabled={loading.tampilkan_nilai}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-sm"
                  >
                    {loading.tampilkan_nilai ? '⏳' : '🏆 Rilis'}
                  </button>
                </div>
              </>
            )}
            {konfirmasi === 'reset' && (
              <>
                <p className="text-3xl mb-3">⚠️</p>
                <h3 className="font-bold text-white mb-2">Reset Semua Data?</h3>
                <p className="text-slate-400 text-sm mb-5">
                  Status ujian kembali ke <span className="text-white font-bold">Standby</span> dan semua nilai serta jawaban siswa akan dihapus.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setKonfirmasi(null)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm">Batal</button>
                  <button onClick={handleResetUjian} disabled={loading.reset} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm">
                    {loading.reset ? '⏳' : '🔄 Reset'}
                  </button>
                </div>
              </>
            )}
          </div>
         </div>
       )}

      {/* Modal Ujian Baru */}
      {modalUjianBaru && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-emerald-700/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-white text-lg">🆕 Ujian Baru</h3>
                <p className="text-xs text-slate-500 mt-0.5">Buat sesi ujian baru dengan pilih test dan kelas</p>
              </div>
              <button onClick={() => setModalUjianBaru(false)} className="text-slate-500 hover:text-white text-xl">×</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Pilih Test *</label>
                  <select
                    value={selectedTestId}
                    onChange={(e) => setSelectedTestId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">-- Pilih Test --</option>
                    {tests.map(t => (
                      <option key={t.id} value={t.id}>{t.nama_test}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Kelas Target</label>
                  <select
                    value={selectedKelas}
                    onChange={(e) => setSelectedKelas(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Semua Kelas</option>
                    {kelasList.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Kosongkan untuk semua kelas</p>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Nama Ujian</label>
                <input
                  value={namaUjianBaru}
                  onChange={(e) => setNamaUjianBaru(e.target.value)}
                  placeholder="Contoh: UTS Ganjil 2025"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModalUjianBaru(false); setSelectedTestId(''); setSelectedKelas(''); }} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm transition-colors">Batal</button>
              <button
                onClick={saveUjianBaru}
                disabled={loading.ujian_baru || !selectedTestId}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {loading.ujian_baru ? '⏳ Membuat...' : '✨ Buat Ujian'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
