import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import HasilUjian from '../components/HasilUjian'

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginSiswa({ onLogin }) {
  const [nomorPeserta, setNomorPeserta] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('siswa')
        .select('*')
        .eq('nomor_peserta', nomorPeserta.trim())
        .eq('password', password.trim())
        .single()

      if (err || !data) {
        setError('Nomor peserta atau password salah.')
        return
      }

      // Allow login if already completed (to view results) or still active
      // Update status menjadi online if not yet completed
      if (data.nilai === null && !data.selesai_at) {
        const { error: loginError } = await supabase.from('siswa').update({
          status_login: 'online',
          login_at: new Date().toISOString()
        }).eq('id', data.id)
        if (loginError) console.error('Login update error:', loginError)
        onLogin({ ...data, status_login: 'online' })
      } else {
        // Already completed - allow login to view results
        onLogin({ ...data, status_login: data.status_login || 'selesai' })
      }
    } catch (e) {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-3xl mb-4">
            📋
          </div>
          <h1 className="text-2xl font-black text-white">Online CBT</h1>
          <p className="text-slate-400 text-sm mt-1">Masuk dengan nomor peserta Anda</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900 rounded-2xl border border-slate-700 p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
              Nomor Peserta
            </label>
            <input
              type="text"
              value={nomorPeserta}
              onChange={e => setNomorPeserta(e.target.value)}
              placeholder="Contoh: 001"
              required
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          {error && (
            <div className="bg-red-900/40 border border-red-700 rounded-lg px-3 py-2 text-red-300 text-xs">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Memverifikasi...' : 'Masuk →'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Ruang Tunggu Sebelum Ujian ───────────────────────────────────────────────
function RuangTungguMulai({ siswa, onLogout, kelasTarget }) {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-mono">
      <div className="text-center max-w-sm">
        <div className="relative inline-flex mb-8">
          <div className="w-20 h-20 rounded-full border-2 border-amber-400/30 animate-ping absolute inset-0 m-auto" />
          <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-3xl relative">
            ⏳
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Halo, {siswa.nama}!</h2>
        <p className="text-slate-400 text-sm mb-6">
          Kelas: <span className="text-white">{siswa.kelas}</span> · No. Peserta: <span className="text-amber-400">{siswa.nomor_peserta}</span>
        </p>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <p className="text-white font-medium mb-1">
            Menunggu Admin memulai ujian{dots}
          </p>
          {kelasTarget && (
            <p className="text-amber-400 text-xs mt-2">
              Target kelas: {kelasTarget}
            </p>
          )}
          <p className="text-slate-500 text-xs mt-2">
            Harap tetap di halaman ini. Ujian akan dimulai secara otomatis.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Terhubung ke server · Status: Online
        </div>
        <div className="mt-6">
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
          >
            ← Keluar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Halaman Ujian ─────────────────────────────────────────────────────────────
function HalamanUjian({ siswa, soalList, onSelesai, onLogout }) {
  const totalSoal = soalList.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const [jawaban, setJawaban] = useState({})
  const [waktuSisa, setWaktuSisa] = useState(60 * 60) // 60 menit
  const [submitting, setSubmitting] = useState(false)
  const [konfirmasiSelesai, setKonfirmasiSelesai] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setWaktuSisa(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatWaktu = (detik) => {
    const m = Math.floor(detik / 60).toString().padStart(2, '0')
    const s = (detik % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handlePilih = (nomor, pilihan) => {
    setJawaban(prev => ({ ...prev, [nomor]: pilihan }))
  }

  const handleSubmit = async (forceSubmit = false) => {
    if (!forceSubmit && Object.keys(jawaban).length < totalSoal) {
      setKonfirmasiSelesai(true)
      return
    }
    setKonfirmasiSelesai(false)
    setSubmitting(true)
    clearInterval(timerRef.current)

    // Hitung nilai
    const benar = soalList.filter(s => jawaban[s.nomor] === s.jawaban_benar).length
    const nilai = Math.round((benar / totalSoal) * 100)

    const { error: submitError } = await supabase.from('siswa').update({
      status_login: 'selesai',
      nilai,
      jawaban,
      selesai_at: new Date().toISOString()
    }).eq('id', siswa.id)
    if (submitError) console.error('Submit error:', submitError)

    onSelesai(nilai, jawaban)
    setSubmitting(false)
  }

  const soalIni = soalList[currentIndex]
  const sudahDijawab = Object.keys(jawaban).length
  const waktuKritis = waktuSisa < 300

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono flex flex-col">
      {/* Header bar */}
      <div className={`sticky top-0 z-10 border-b px-4 py-3 flex items-center justify-between transition-colors ${
        waktuKritis ? 'bg-red-950 border-red-800' : 'bg-slate-900 border-slate-700'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{siswa.nama}</span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">{sudahDijawab}/{totalSoal} dijawab</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`font-black text-lg tabular-nums ${waktuKritis ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
            ⏱ {formatWaktu(waktuSisa)}
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row max-w-4xl mx-auto w-full px-4 py-6 gap-6">
        {/* Panel soal */}
        <div className="flex-1">
          {/* Progress */}
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Soal {currentIndex + 1} dari {totalSoal}</span>
            <span>{Math.round((sudahDijawab / totalSoal) * 100)}% selesai</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-5">
            <div
              className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalSoal) * 100}%` }}
            />
          </div>

          {/* Pertanyaan */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-4">
            <span className="inline-block text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded mb-3">
              Soal {soalIni?.nomor}
            </span>
            <p className="text-white text-base leading-relaxed">{soalIni?.pertanyaan}</p>
          </div>

          {/* Pilihan */}
          <div className="space-y-2">
            {['a', 'b', 'c', 'd'].map(opt => {
              const key = opt.toUpperCase()
              const teks = soalIni?.[`opsi_${opt}`]
              const dipilih = jawaban[soalIni?.nomor] === key
              return (
                <button
                  key={opt}
                  onClick={() => handlePilih(soalIni?.nomor, key)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition-all text-sm flex items-center gap-3 ${
                    dipilih
                      ? 'bg-amber-400/15 border-amber-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    dipilih ? 'bg-amber-400 border-amber-400 text-slate-900' : 'border-slate-500 text-slate-500'
                  }`}>
                    {key}
                  </span>
                  {teks}
                </button>
              )
            })}
          </div>

          {/* Nav soal */}
          <div className="flex justify-between mt-5 gap-3">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-30 transition-colors"
            >
              ← Sebelumnya
            </button>
            {currentIndex < totalSoal - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm hover:bg-slate-700 transition-colors"
              >
                Selanjutnya →
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="px-4 py-2 bg-amber-400 text-slate-900 font-bold rounded-lg text-sm hover:bg-amber-300 transition-all disabled:opacity-50"
              >
                {submitting ? '⏳ Menyimpan...' : '✓ Selesai & Kumpulkan'}
              </button>
            )}
          </div>
        </div>

        {/* Navigasi grid soal */}
        <div className="md:w-48 shrink-0">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 sticky top-20">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Navigasi Soal</p>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {soalList.map((soal, i) => {
                const terjawab = !!jawaban[soal.nomor]
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-8 w-full rounded text-xs font-bold transition-all border ${
                      currentIndex === i
                        ? 'bg-amber-400 text-slate-900 border-amber-400'
                        : terjawab
                          ? 'bg-emerald-900/50 border-emerald-600 text-emerald-300'
                          : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="w-full py-2 bg-amber-400 text-slate-900 font-bold rounded-lg text-xs hover:bg-amber-300 transition-all disabled:opacity-50"
            >
              Kumpulkan
            </button>
          </div>
        </div>
      </div>

      {/* Modal konfirmasi selesai */}
      {konfirmasiSelesai && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-600 rounded-2xl p-6 max-w-sm w-full text-center">
            <p className="text-xl mb-2">⚠️</p>
            <h3 className="font-bold text-white mb-2">Yakin ingin mengumpulkan?</h3>
            <p className="text-slate-400 text-sm mb-5">
              Masih ada <span className="text-amber-400 font-bold">{totalSoal - sudahDijawab} soal</span> yang belum dijawab.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setKonfirmasiSelesai(false)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl text-sm transition-colors"
              >
                Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Ruang Tunggu Setelah Submit ──────────────────────────────────────────────
function RuangTungguNilai({ siswa, onLogout }) {
  const [dots, setDots] = useState('')
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 600)
    const s = setTimeout(() => setStep(1), 2000)
    return () => { clearInterval(t); clearTimeout(s) }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-mono">
      <div className="text-center max-w-sm">
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 rounded-full border-2 border-emerald-400/20 animate-ping absolute inset-0 m-auto" />
          <div className="w-24 h-24 rounded-full bg-emerald-400/5 border border-emerald-400/30 flex items-center justify-center text-4xl relative">
            {step === 0 ? '📤' : '✅'}
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          {step === 0 ? `Menyimpan jawaban${dots}` : 'Jawaban Tersimpan!'}
        </h2>
        <p className="text-slate-400 text-sm mb-2">
          {step === 0
            ? 'Sedang mengirim jawaban ke server...'
            : `Hei ${siswa?.nama}, jawaban kamu sudah diterima.`
          }
        </p>

        {step > 0 && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mt-4">
            <div className="flex items-center gap-2 justify-center mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
              <p className="text-amber-400 font-medium text-sm">Menunggu penilaian Guru</p>
            </div>
            <p className="text-slate-500 text-xs">
              Nilai akan ditampilkan setelah Guru merilis hasil.
              <br />Tetap di halaman ini.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Terhubung realtime · Memantau status ujian
        </div>
        {siswa.status_login === 'online' && (
          <div className="mt-6">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
            >
              ← Keluar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN HALAMAN SISWA ────────────────────────────────────────────────────────
export default function HalamanSiswa() {
  const [phase, setPhase] = useState('login')
  const [siswa, setSiswa] = useState(null)
  const [soalList, setSoalList] = useState([])
  const [nilaiAkhir, setNilaiAkhir] = useState(null)
  const [jawabanFinal, setJawabanFinal] = useState({})
  const [kelasTarget, setKelasTarget] = useState(null)
  const channelRef = useRef(null)
  const selfLogoutRef = useRef(false)
  const phaseRef = useRef(phase)

  // Keep phaseRef in sync with current phase
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const savedSiswaId = sessionStorage.getItem('siswa_id')
    if (savedSiswaId) {
      supabase.from('siswa').select('*').eq('id', savedSiswaId).single()
        .then(({ data }) => {
          if (data && (data.status_login === 'online' || data.status_login === 'selesai')) {
            setSiswa(data)
            // Phase will be determined by checkStatusAwal in the realtime effect
          } else {
            sessionStorage.removeItem('siswa_id')
          }
        })
    }
  }, [])

  // Subscribe to Supabase Realtime after login
  useEffect(() => {
    if (!siswa) return

    // Save student ID to sessionStorage on login
    sessionStorage.setItem('siswa_id', siswa.id)

    const channel = supabase
      .channel(`ujian-siswa-${siswa.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'konfigurasi_ujian', filter: 'id=eq.1' },
        (payload) => {
          const newStatus = payload.new.status
          const newKelasTarget = payload.new.kelas_target
          
          if (newStatus === 'mulai' && phaseRef.current === 'tunggu_mulai') {
            // Check if student matches the target class
            const cocokKelas = !newKelasTarget || siswa.kelas === newKelasTarget || siswa.kelas?.startsWith(newKelasTarget)
            if (cocokKelas) {
              fetchSoal()
            }
          } else if (newStatus === 'tampilkan_nilai' && phaseRef.current === 'tunggu_nilai') {
            // Refresh student data and show results
            supabase.from('siswa').select('*').eq('id', siswa.id).single()
              .then(({ data }) => {
                if (data) {
                  setSiswa(data)
                  setPhase('hasil')
                }
              })
          } else if (newStatus === 'standby') {
            // Reset to login if ujian resets
            forceLogout()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'siswa', filter: `id=eq.${siswa.id}` },
        (payload) => {
          // If admin sets status to offline, logout student
          if (payload.new.status_login === 'offline' && phaseRef.current !== 'login') {
            if (selfLogoutRef.current) {
              selfLogoutRef.current = false
              return
            }
            forceLogout()
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    // Check initial status only once when siswa首次设置
    checkStatusAwal(siswa)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [siswa?.id]) // Only re-create channel when student ID changes

  const checkStatusAwal = async (currentSiswa) => {
    const { data: cfg } = await supabase
      .from('konfigurasi_ujian')
      .select('status, kelas_target')
      .eq('id', 1)
      .single()
    const globalStatus = cfg?.status
    const target = cfg?.kelas_target
    
    // Update kelas target state
    setKelasTarget(target)
    
    // If student is offline, clear session
    if (currentSiswa.status_login === 'offline') {
      sessionStorage.removeItem('siswa_id')
      return
    }

    // Check if student matches the target class (for JH 1 - London format)
    const cocokKelas = !target || currentSiswa.kelas === target || currentSiswa.kelas?.startsWith(target)

    // Student has already submitted
    if (currentSiswa.status_login === 'selesai') {
      if (globalStatus === 'tampilkan_nilai') {
        // Results released – show hasil
        const { data: dataSiswa } = await supabase
          .from('siswa')
          .select('*')
          .eq('id', currentSiswa.id)
          .single()
        if (dataSiswa?.nilai !== null) {
          setSiswa(dataSiswa)
          setPhase('hasil')
        }
      } else {
        // Still waiting for teacher to release results
        setSiswa(currentSiswa)
        setPhase('tunggu_nilai')
      }
      return
    }

    // Student is online (active)
    if (currentSiswa.status_login === 'online') {
      if (globalStatus === 'mulai' && cocokKelas) {
        // Exam started – go to exam page
        await fetchSoal()
      } else if (globalStatus === 'mulai' && !cocokKelas) {
        // Exam started but student is not in target class
        setSiswa(currentSiswa)
        setPhase('tunggu_mulai')
      } else {
        // Not started yet – wait
        setSiswa(currentSiswa)
        setPhase('tunggu_mulai')
      }
    }
  }

  const fetchSoal = async () => {
    // Get test_id from konfigurasi_ujian
    const { data: cfg } = await supabase
      .from('konfigurasi_ujian')
      .select('test_id')
      .eq('id', 1)
      .single()
    
    let query = supabase.from('soal').select('*')
    
    // If test_id is set, filter by test_id, otherwise get all (for backward compatibility)
    if (cfg?.test_id) {
      query = query.eq('test_id', cfg.test_id)
    }
    
    const { data, error } = await query.order('nomor', { ascending: true })
    
    if (!error && data?.length > 0) {
      setSoalList(data)
      setPhase('ujian')
    }
  }

  const handleLogin = (dataSiswa) => {
    setSiswa(dataSiswa)
    // Phase will be determined by checkStatusAwal in the realtime effect
  }

  const forceLogout = () => {
    sessionStorage.removeItem('siswa_id')
    setSiswa(null)
    setPhase('login')
    setSoalList([])
    setNilaiAkhir(null)
    setJawabanFinal({})
  }

  const triggerLogout = async () => {
    selfLogoutRef.current = true
    if (siswa) {
      const { error: logoutError } = await supabase.from('siswa').update({
        status_login: 'offline',
        login_at: null
      }).eq('id', siswa.id)
      if (logoutError) console.error('Logout error:', logoutError)
    }
    forceLogout()
  }

  const handleLogout = triggerLogout

  const handleSelesaiUjian = (nilai, jawaban) => {
    setNilaiAkhir(nilai)
    setJawabanFinal(jawaban)
    setSiswa(prev => ({ ...prev, nilai, jawaban, selesai_at: new Date().toISOString(), status_login: 'selesai' }))
    setPhase('tunggu_nilai')
  }

  if (phase === 'login') return <LoginSiswa onLogin={handleLogin} />
  if (phase === 'tunggu_mulai') return <RuangTungguMulai siswa={siswa} onLogout={handleLogout} kelasTarget={kelasTarget} />
  if (phase === 'ujian') return (
    <HalamanUjian
      siswa={siswa}
      soalList={soalList}
      onSelesai={handleSelesaiUjian}
      onLogout={handleLogout}
    />
  )
  if (phase === 'tunggu_nilai') return <RuangTungguNilai siswa={siswa} onLogout={handleLogout} />
  if (phase === 'hasil') return (
    <HasilUjian siswa={siswa} soalList={soalList} onLogout={handleLogout} />
  )
  return null
}
