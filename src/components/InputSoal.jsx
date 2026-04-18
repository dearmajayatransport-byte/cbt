import { useState } from 'react'
import { supabase } from '../supabaseClient'

const JUMLAH_SOAL = 10

const soalKosong = () => ({
  pertanyaan: '',
  opsi_a: '',
  opsi_b: '',
  opsi_c: '',
  opsi_d: '',
  jawaban_benar: 'A',
})

export default function InputSoal({ onBack }) {
  const [soalList, setSoalList] = useState(
    Array.from({ length: JUMLAH_SOAL }, soalKosong)
  )
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
  const [activeTab, setActiveTab] = useState(0)
  const [validasi, setValidasi] = useState({})

  const handleChange = (index, field, value) => {
    setSoalList(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    // Clear validasi error saat user mengetik
    setValidasi(prev => {
      const next = { ...prev }
      delete next[`${index}_${field}`]
      return next
    })
  }

  const validateAll = () => {
    const errors = {}
    soalList.forEach((soal, i) => {
      if (!soal.pertanyaan.trim()) errors[`${i}_pertanyaan`] = true
      if (!soal.opsi_a.trim()) errors[`${i}_opsi_a`] = true
      if (!soal.opsi_b.trim()) errors[`${i}_opsi_b`] = true
      if (!soal.opsi_c.trim()) errors[`${i}_opsi_c`] = true
      if (!soal.opsi_d.trim()) errors[`${i}_opsi_d`] = true
    })
    setValidasi(errors)
    return Object.keys(errors).length === 0
  }

  const soalYangBelumLengkap = () => {
    return soalList.reduce((acc, soal, i) => {
      const lengkap = soal.pertanyaan.trim() && soal.opsi_a.trim() &&
        soal.opsi_b.trim() && soal.opsi_c.trim() && soal.opsi_d.trim()
      if (!lengkap) acc.push(i + 1)
      return acc
    }, [])
  }

  const handleSubmit = async () => {
    if (!validateAll()) {
      const belumLengkap = soalYangBelumLengkap()
      setStatus({
        type: 'error',
        msg: `Soal nomor ${belumLengkap.join(', ')} belum lengkap diisi.`
      })
      setActiveTab(belumLengkap[0] - 1)
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      // Hapus soal lama dulu
      const { error: delError } = await supabase.from('soal').delete().gte('id', 0)
      if (delError) throw delError

      // Insert soal baru
      const payload = soalList.map((soal, i) => ({
        nomor: i + 1,
        pertanyaan: soal.pertanyaan.trim(),
        opsi_a: soal.opsi_a.trim(),
        opsi_b: soal.opsi_b.trim(),
        opsi_c: soal.opsi_c.trim(),
        opsi_d: soal.opsi_d.trim(),
        jawaban_benar: soal.jawaban_benar,
      }))

      const { error: insError } = await supabase.from('soal').insert(payload)
      if (insError) throw insError

      setStatus({ type: 'success', msg: '✅ 10 soal berhasil disimpan ke database!' })
    } catch (err) {
      setStatus({ type: 'error', msg: `❌ Gagal menyimpan: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  const loadSoalDariDB = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('soal')
        .select('*')
        .order('nomor', { ascending: true })
      if (error) throw error
      if (data && data.length > 0) {
        const mapped = Array.from({ length: JUMLAH_SOAL }, (_, i) => {
          const found = data.find(d => d.nomor === i + 1)
          return found ? {
            pertanyaan: found.pertanyaan,
            opsi_a: found.opsi_a,
            opsi_b: found.opsi_b,
            opsi_c: found.opsi_c,
            opsi_d: found.opsi_d,
            jawaban_benar: found.jawaban_benar,
          } : soalKosong()
        })
        setSoalList(mapped)
        setStatus({ type: 'success', msg: '✅ Data soal berhasil dimuat dari database.' })
      } else {
        setStatus({ type: 'error', msg: 'Belum ada soal di database.' })
      }
    } catch (err) {
      setStatus({ type: 'error', msg: `Gagal memuat: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  const soalIni = soalList[activeTab]
  const progres = soalList.filter(s =>
    s.pertanyaan.trim() && s.opsi_a.trim() && s.opsi_b.trim() && s.opsi_c.trim() && s.opsi_d.trim()
  ).length

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              ← Kembali
            </button>
            <span className="text-slate-600">|</span>
            <h1 className="text-lg font-bold text-amber-400">📝 Input Bank Soal</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadSoalDariDB}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              🔄 Muat dari DB
            </button>
            <span className="text-slate-400 text-sm">
              {progres}/{JUMLAH_SOAL} soal lengkap
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress pengisian soal</span>
            <span>{Math.round((progres / JUMLAH_SOAL) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(progres / JUMLAH_SOAL) * 100}%` }}
            />
          </div>
        </div>

        {/* Status Alert */}
        {status && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border ${
            status.type === 'success'
              ? 'bg-green-900/40 border-green-600 text-green-300'
              : 'bg-red-900/40 border-red-600 text-red-300'
          }`}>
            {status.msg}
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          {/* Tab navigasi soal */}
          <div className="col-span-3">
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Navigasi Soal</p>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: JUMLAH_SOAL }, (_, i) => {
                  const soal = soalList[i]
                  const lengkap = soal.pertanyaan.trim() && soal.opsi_a.trim() &&
                    soal.opsi_b.trim() && soal.opsi_c.trim() && soal.opsi_d.trim()
                  const adaError = Object.keys(validasi).some(k => k.startsWith(`${i}_`))
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`
                        h-10 rounded-lg text-sm font-bold transition-all border
                        ${activeTab === i
                          ? 'bg-amber-400 text-slate-900 border-amber-400 scale-105'
                          : adaError
                            ? 'bg-red-900/40 border-red-600 text-red-300'
                            : lengkap
                              ? 'bg-green-900/40 border-green-600 text-green-300'
                              : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                        }
                      `}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-green-400">
                  <span className="w-3 h-3 rounded bg-green-900 border border-green-600 inline-block"/>
                  Lengkap
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <span className="w-3 h-3 rounded bg-red-900 border border-red-600 inline-block"/>
                  Ada error
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-3 h-3 rounded bg-slate-800 border border-slate-600 inline-block"/>
                  Belum diisi
                </div>
              </div>
            </div>
          </div>

          {/* Form soal aktif */}
          <div className="col-span-9">
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-amber-400 font-bold text-base">
                  Soal Nomor {activeTab + 1}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
                    disabled={activeTab === 0}
                    className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setActiveTab(prev => Math.min(JUMLAH_SOAL - 1, prev + 1))}
                    disabled={activeTab === JUMLAH_SOAL - 1}
                    className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Teks Soal */}
              <div className="mb-4">
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
                  Teks Pertanyaan *
                </label>
                <textarea
                  rows={3}
                  value={soalIni.pertanyaan}
                  onChange={e => handleChange(activeTab, 'pertanyaan', e.target.value)}
                  placeholder="Tuliskan pertanyaan di sini..."
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none transition-colors ${
                    validasi[`${activeTab}_pertanyaan`] ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {validasi[`${activeTab}_pertanyaan`] && (
                  <p className="text-red-400 text-xs mt-1">Pertanyaan wajib diisi</p>
                )}
              </div>

              {/* Pilihan A, B, C, D */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div key={opt}>
                    <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
                      Pilihan {opt.toUpperCase()} *
                    </label>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold w-5 h-5 rounded flex items-center justify-center text-slate-900 ${
                        soalIni.jawaban_benar === opt.toUpperCase()
                          ? 'bg-amber-400'
                          : 'bg-slate-500'
                      }`}>
                        {opt.toUpperCase()}
                      </span>
                      <input
                        type="text"
                        value={soalIni[`opsi_${opt}`]}
                        onChange={e => handleChange(activeTab, `opsi_${opt}`, e.target.value)}
                        placeholder={`Teks pilihan ${opt.toUpperCase()}...`}
                        className={`w-full bg-slate-800 border rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                          validasi[`${activeTab}_opsi_${opt}`] ? 'border-red-500' : 'border-slate-600'
                        }`}
                      />
                    </div>
                    {validasi[`${activeTab}_opsi_${opt}`] && (
                      <p className="text-red-400 text-xs mt-1">Pilihan {opt.toUpperCase()} wajib diisi</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Kunci Jawaban */}
              <div className="mb-2">
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">
                  🔑 Kunci Jawaban *
                </label>
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleChange(activeTab, 'jawaban_benar', opt)}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all border ${
                        soalIni.jawaban_benar === opt
                          ? 'bg-amber-400 text-slate-900 border-amber-400 scale-105 shadow-lg shadow-amber-400/20'
                          : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Kunci: <span className="text-amber-400 font-bold">{soalIni.jawaban_benar}</span>
                  {soalIni[`opsi_${soalIni.jawaban_benar.toLowerCase()}`] && (
                    <span className="text-slate-400"> — {soalIni[`opsi_${soalIni.jawaban_benar.toLowerCase()}`]}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {progres < JUMLAH_SOAL
              ? `⚠️ Masih ada ${JUMLAH_SOAL - progres} soal yang belum lengkap`
              : '✅ Semua soal sudah lengkap, siap disimpan!'}
          </p>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`
              px-6 py-3 rounded-xl font-bold text-sm transition-all
              ${loading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Menyimpan...
              </span>
            ) : (
              '💾 Simpan Semua Soal ke Database'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
