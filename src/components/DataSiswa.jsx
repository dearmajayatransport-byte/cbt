// src/components/DataSiswa.jsx
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

// ─── Struktur JH & Ruangan ────────────────────────────────────────────────────
const JH_DATA = {
  'JH 1': ['London', 'Paris', 'Sydney'],
  'JH 2': ['Harvard', 'Oxford', 'Stanford', 'Princeton'],
  'JH 3': ['Amsterdam', 'Berlin', 'Cambridge', 'Dublin', 'Edinburgh'],
}

const JH_STYLE = {
  'JH 1': { bg: 'bg-blue-900/20', border: 'border-blue-700/60', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300 border-blue-600/40', icon: '🔵' },
  'JH 2': { bg: 'bg-violet-900/20', border: 'border-violet-700/60', text: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-300 border-violet-600/40', icon: '🟣' },
  'JH 3': { bg: 'bg-emerald-900/20', border: 'border-emerald-700/60', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-600/40', icon: '🟢' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function genToken(len = 8) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function genNomorPeserta(jh, ruangan, index) {
  const jhNum = jh.replace('JH ', '')
  const ruangCode = ruangan.substring(0, 3).toUpperCase()
  return `${jhNum}${ruangCode}${String(index).padStart(3, '0')}`
}

// ─── Modal Tambah / Edit Siswa ────────────────────────────────────────────────
function ModalTambahSiswa({ jh, ruangan, onClose, onSaved, editData }) {
  const isEdit = !!editData
  const [form, setForm] = useState({
    nama: editData?.nama || '',
    nomor_peserta: editData?.nomor_peserta || '',
    password: editData?.password || '',
    kelas: editData?.kelas || `${jh} - ${ruangan}`,
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async () => {
    if (!form.nama.trim() || !form.nomor_peserta.trim() || !form.password.trim()) {
      setErr('Nama, No. Peserta, dan Password wajib diisi.'); return
    }
    setLoading(true); setErr('')
    if (isEdit) {
      const { error } = await supabase.from('siswa').update({
        nama: form.nama.trim(),
        nomor_peserta: form.nomor_peserta.trim(),
        password: form.password.trim(),
        kelas: form.kelas.trim(),
      }).eq('id', editData.id)
      if (error) { setErr(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.from('siswa').insert({
        nama: form.nama.trim(),
        nomor_peserta: form.nomor_peserta.trim(),
        password: form.password.trim(),
        kelas: form.kelas.trim(),
        jh, ruangan,
        status_login: 'offline',
      })
      if (error) { setErr(error.message.includes('unique') ? 'No. Peserta sudah digunakan.' : error.message); setLoading(false); return }
    }
    onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-white">{isEdit ? '✏️ Edit Siswa' : '➕ Tambah Siswa'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{jh} — {ruangan}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Nama Lengkap *</label>
            <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
              placeholder="Nama siswa"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">No. Peserta *</label>
            <input value={form.nomor_peserta} onChange={e => setForm(p => ({ ...p, nomor_peserta: e.target.value }))}
              placeholder="Contoh: 1LON001"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Password / Token *</label>
            <div className="flex gap-2">
              <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Password login siswa"
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400" />
              <button onClick={() => setForm(p => ({ ...p, password: genToken() }))}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs text-slate-300 whitespace-nowrap transition-colors">
                🎲 Generate
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Kelas</label>
            <input value={form.kelas} onChange={e => setForm(p => ({ ...p, kelas: e.target.value }))}
              placeholder="Kelas siswa"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
        </div>

        {err && <p className="text-red-400 text-xs mt-3">⚠️ {err}</p>}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm transition-colors">Batal</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50">
            {loading ? '⏳ Menyimpan...' : isEdit ? '💾 Simpan' : '➕ Tambah'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Token ──────────────────────────────────────────────────────────────
function ModalToken({ siswa, onClose, onUpdated }) {
  const [token, setToken] = useState(siswa.password)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => setToken(genToken())

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase.from('siswa').update({ password: token }).eq('id', siswa.id)
    if (error) console.error('Token save error:', error)
    setLoading(false)
    onUpdated()
    onClose()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`No. Peserta: ${siswa.nomor_peserta}\nToken: ${token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div className="text-3xl mb-2">🔑</div>
        <h3 className="font-bold text-white mb-1">Token Siswa</h3>
        <p className="text-slate-400 text-sm mb-5">{siswa.nama}</p>

        <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 mb-4">
          <p className="text-xs text-slate-500 mb-1">No. Peserta</p>
          <p className="text-white font-mono font-bold">{siswa.nomor_peserta}</p>
        </div>

        <div className="bg-slate-800 border border-amber-600/40 rounded-xl p-4 mb-4">
          <p className="text-xs text-slate-500 mb-1">Token / Password</p>
          <p className="text-amber-400 font-mono text-2xl font-black tracking-widest">{token}</p>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={handleGenerate}
            className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors">
            🎲 Generate Baru
          </button>
          <button onClick={handleCopy}
            className={`flex-1 py-2 border rounded-lg text-sm transition-colors ${copied ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300'}`}>
            {copied ? '✅ Tersalin!' : '📋 Salin'}
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm">Batal</button>
          <button onClick={handleSave} disabled={loading || token === siswa.password}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-colors disabled:opacity-40">
            {loading ? '⏳' : '💾 Simpan Token'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Import Excel ───────────────────────────────────────────────────────
function ModalImportExcel({ jh, ruangan, onClose, onImported }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const [failedRows, setFailedRows] = useState([])
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setErr(''); setRows([])

    try {
      const XLSX = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { defval: '' })
      if (!raw.length) { setErr('File kosong atau format tidak dikenali.'); return }

      const mapped = raw.map((r, i) => ({
        nama: String(r['nama'] || r['Nama'] || r['NAMA'] || '').trim(),
        nomor_peserta: String(r['nomor_peserta'] || r['No Peserta'] || r['NO PESERTA'] || r['nomor'] || '').trim()
          || genNomorPeserta(jh, ruangan, i + 1),
        password: String(r['password'] || r['Password'] || r['token'] || r['Token'] || '').trim()
          || genToken(),
        kelas: String(r['kelas'] || r['Kelas'] || `${jh} - ${ruangan}`).trim(),
      })).filter(r => r.nama)

      if (!mapped.length) { setErr('Tidak ada data nama siswa yang valid. Pastikan ada kolom "nama".'); return }
      setRows(mapped)
    } catch (e) {
      setErr('Gagal membaca file. Pastikan format Excel (.xlsx / .xls).')
    }
  }

  const handleImport = async () => {
    if (!rows.length) return
    setLoading(true); setErr(''); setFailedRows([])
    const inserts = rows.map(r => ({ ...r, jh, ruangan, status_login: 'offline' }))
    const failed = []

    for (const row of inserts) {
      const { error } = await supabase.from('siswa').insert(row)
      if (error) failed.push({ ...row, err: error.message.includes('unique') ? 'No. Peserta duplikat' : error.message })
    }

    setLoading(false)
    if (failed.length === 0) {
      setDone(true)
      onImported()
    } else {
      setFailedRows(failed)
      if (failed.length < rows.length) onImported()
    }
  }

  if (done) return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
        <div className="text-5xl mb-3">✅</div>
        <h3 className="font-bold text-white mb-2">Import Berhasil!</h3>
        <p className="text-slate-400 text-sm mb-5">{rows.length} siswa berhasil ditambahkan ke {ruangan}.</p>
        <button onClick={onClose} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm">Selesai</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-white">📊 Import Excel</h3>
            <p className="text-xs text-slate-500 mt-0.5">{jh} — {ruangan}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Format panduan */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-4">
          <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Format Kolom Excel</p>
          <div className="overflow-x-auto">
            <table className="text-xs text-slate-300 w-full">
              <thead>
                <tr className="text-slate-500">
                  <td className="py-1 pr-4 font-bold">Kolom</td>
                  <td className="py-1 pr-4">Wajib</td>
                  <td className="py-1">Keterangan</td>
                </tr>
              </thead>
              <tbody>
                <tr><td className="pr-4 font-mono text-amber-400">nama</td><td className="pr-4">✅ Ya</td><td>Nama lengkap</td></tr>
                <tr><td className="pr-4 font-mono text-slate-400">nomor_peserta</td><td className="pr-4">Opsional</td><td>Auto-generate jika kosong</td></tr>
                <tr><td className="pr-4 font-mono text-slate-400">password</td><td className="pr-4">Opsional</td><td>Auto-generate token jika kosong</td></tr>
                <tr><td className="pr-4 font-mono text-slate-400">kelas</td><td className="pr-4">Opsional</td><td>Default: {jh} - {ruangan}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-600 hover:border-violet-500 rounded-xl p-6 text-center cursor-pointer transition-colors mb-4"
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
          <div className="text-3xl mb-2">📂</div>
          <p className="text-slate-400 text-sm">Klik untuk pilih file</p>
          <p className="text-slate-600 text-xs mt-1">.xlsx / .xls / .csv</p>
        </div>

        {err && <p className="text-red-400 text-xs mb-3">⚠️ {err}</p>}

        {/* Preview rows */}
        {rows.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Preview ({rows.length} siswa)</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left px-3 py-2 text-slate-400">#</th>
                    <th className="text-left px-3 py-2 text-slate-400">Nama</th>
                    <th className="text-left px-3 py-2 text-slate-400">No. Peserta</th>
                    <th className="text-left px-3 py-2 text-slate-400">Token</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t border-slate-700/50">
                      <td className="px-3 py-1.5 text-slate-500">{i + 1}</td>
                      <td className="px-3 py-1.5 text-white">{r.nama}</td>
                      <td className="px-3 py-1.5 text-slate-300 font-mono">{r.nomor_peserta}</td>
                      <td className="px-3 py-1.5 text-amber-400 font-mono">{r.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Failed rows */}
        {failedRows.length > 0 && (
          <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-xs font-bold mb-1">{failedRows.length} baris gagal:</p>
            {failedRows.map((r, i) => (
              <p key={i} className="text-xs text-red-300">{r.nama} — {r.err}</p>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm">Batal</button>
          <button onClick={handleImport} disabled={!rows.length || loading}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-40">
            {loading ? '⏳ Mengimport...' : `📥 Import ${rows.length ? rows.length + ' Siswa' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Generate Token Massal ──────────────────────────────────────────────
function ModalTokenMassal({ jh, ruangan, siswaList, onClose, onUpdated }) {
  const [tokens, setTokens] = useState(() =>
    siswaList.map(s => ({ ...s, token_baru: genToken() }))
  )
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    for (const s of tokens) {
      const { error } = await supabase.from('siswa').update({ password: s.token_baru }).eq('id', s.id)
      if (error) console.error('Token update error:', error)
    }
    setLoading(false); setDone(true)
    onUpdated()
  }

  const handleCopyAll = () => {
    const text = tokens.map(s => `${s.nama} | ${s.nomor_peserta} | ${s.token_baru}`).join('\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">🔑 Generate Token Massal</h3>
            <p className="text-xs text-slate-500 mt-0.5">{jh} — {ruangan} ({tokens.length} siswa)</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-bold mb-5">Semua token berhasil diperbarui!</p>
            <button onClick={onClose} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm">Selesai</button>
          </div>
        ) : (
          <>
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden max-h-64 overflow-y-auto mb-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs text-slate-400">Nama</th>
                    <th className="text-left px-3 py-2 text-xs text-slate-400">No. Peserta</th>
                    <th className="text-left px-3 py-2 text-xs text-slate-400">Token Baru</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((s, i) => (
                    <tr key={s.id} className="border-t border-slate-700/40">
                      <td className="px-3 py-2 text-white text-xs">{s.nama}</td>
                      <td className="px-3 py-2 text-slate-300 font-mono text-xs">{s.nomor_peserta}</td>
                      <td className="px-3 py-2 text-amber-400 font-mono text-xs font-bold">{s.token_baru}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={handleCopyAll} className="w-full py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-xs text-slate-300 mb-3 transition-colors">
              📋 Salin Semua Kredensial
            </button>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm">Batal</button>
              <button onClick={handleSave} disabled={loading}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-colors disabled:opacity-50">
                {loading ? '⏳ Menyimpan...' : '💾 Simpan Semua Token'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DataSiswa({ onBack }) {
  const [selectedJH, setSelectedJH] = useState(null)
  const [selectedRuangan, setSelectedRuangan] = useState(null)
  const [siswaList, setSiswaList] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null) // 'tambah' | 'import' | 'token_massal'
  const [editSiswa, setEditSiswa] = useState(null)
  const [tokenSiswa, setTokenSiswa] = useState(null)
  const [hapusSiswa, setHapusSiswa] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchCounts() }, [])

  useEffect(() => {
    if (selectedJH && selectedRuangan) { setSearch(''); fetchSiswa() }
  }, [selectedJH, selectedRuangan])

  const fetchCounts = async () => {
    const { data } = await supabase.from('siswa').select('jh, ruangan').not('jh', 'is', null)
    if (!data) return
    const c = {}
    data.forEach(s => { const k = `${s.jh}__${s.ruangan}`; c[k] = (c[k] || 0) + 1 })
    setCounts(c)
  }

  const fetchSiswa = async () => {
    setLoading(true)
    const { data } = await supabase.from('siswa').select('*')
      .eq('jh', selectedJH).eq('ruangan', selectedRuangan)
      .order('created_at', { ascending: true })
    setSiswaList(data || [])
    setLoading(false)
  }

  const handleHapus = async () => {
    if (!hapusSiswa) return
    await supabase.from('siswa').delete().eq('id', hapusSiswa.id)
    setHapusSiswa(null)
    fetchSiswa(); fetchCounts()
  }

  const refresh = () => { fetchSiswa(); fetchCounts() }

  const filtered = siswaList.filter(s =>
    s.nama?.toLowerCase().includes(search.toLowerCase()) ||
    s.nomor_peserta?.toLowerCase().includes(search.toLowerCase())
  )

  const totalSiswa = Object.values(counts).reduce((a, b) => a + b, 0)
  const style = selectedJH ? JH_STYLE[selectedJH] : null

  // ── View: Detail Ruangan ──
  if (selectedJH && selectedRuangan) {
    const st = JH_STYLE[selectedJH]
    return (
      <div className="min-h-screen bg-slate-950 text-white font-mono">
        {/* Topbar */}
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button onClick={() => setSelectedRuangan(null)}
              className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
              ← Kembali
            </button>
            <span className="text-slate-700">/</span>
            <button onClick={() => { setSelectedJH(null); setSelectedRuangan(null) }}
              className="text-slate-400 hover:text-white transition-colors text-sm">{selectedJH}</button>
            <span className="text-slate-700">/</span>
            <span className={`text-sm font-bold ${st.text}`}>{selectedRuangan}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Header */}
          <div className={`${st.bg} border ${st.border} rounded-2xl p-5 mb-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl font-black ${st.text}`}>{selectedJH} — {selectedRuangan}</h2>
                <p className="text-slate-400 text-sm mt-1">{siswaList.length} siswa terdaftar</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setModal('tambah')}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors">
                  ➕ Tambah Siswa
                </button>
                {siswaList.length > 0 && (
                  <button onClick={() => setModal('token_massal')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors">
                    🔑 Buat Token
                  </button>
                )}
                <button onClick={() => setModal('import')}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 rounded-xl text-sm flex items-center gap-1.5 transition-colors">
                  📊 Import Excel
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          {siswaList.length > 0 && (
            <div className="mb-4">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama atau no. peserta..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          )}

          {/* Tabel siswa */}
          {loading ? (
            <div className="text-center py-16 text-slate-500">⏳ Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-slate-500 text-sm">{search ? 'Siswa tidak ditemukan.' : 'Belum ada siswa di ruangan ini.'}</p>
              {!search && (
                <button onClick={() => setModal('tambah')}
                  className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition-colors">
                  ➕ Tambah Siswa Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/80">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Nama</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">No. Peserta</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Token</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3 text-xs text-slate-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                        <td className="px-4 py-3 text-white font-medium">{s.nama}</td>
                        <td className="px-4 py-3 text-slate-300 font-mono text-xs">{s.nomor_peserta}</td>
                        <td className="px-4 py-3 text-amber-400 font-mono text-xs">{s.password}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            s.status_login === 'online' ? 'bg-amber-500/10 text-amber-400 border-amber-600/30' :
                            s.status_login === 'selesai' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-600/30' :
                            'bg-slate-700/30 text-slate-500 border-slate-600/30'
                          }`}>
                            {s.status_login === 'online' ? '● Aktif' : s.status_login === 'selesai' ? '✓ Selesai' : '○ Offline'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setTokenSiswa(s)}
                              title="Buat Token" className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors">🔑</button>
                            <button onClick={() => setEditSiswa(s)}
                              title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">✏️</button>
                            <button onClick={() => setHapusSiswa(s)}
                              title="Hapus" className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {modal === 'tambah' && (
          <ModalTambahSiswa jh={selectedJH} ruangan={selectedRuangan} onClose={() => setModal(null)} onSaved={refresh} />
        )}
        {modal === 'import' && (
          <ModalImportExcel jh={selectedJH} ruangan={selectedRuangan} onClose={() => setModal(null)} onImported={refresh} />
        )}
        {modal === 'token_massal' && siswaList.length > 0 && (
          <ModalTokenMassal jh={selectedJH} ruangan={selectedRuangan} siswaList={siswaList} onClose={() => setModal(null)} onUpdated={refresh} />
        )}
        {editSiswa && (
          <ModalTambahSiswa jh={selectedJH} ruangan={selectedRuangan} editData={editSiswa} onClose={() => setEditSiswa(null)} onSaved={refresh} />
        )}
        {tokenSiswa && (
          <ModalToken siswa={tokenSiswa} onClose={() => setTokenSiswa(null)} onUpdated={refresh} />
        )}
        {hapusSiswa && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="font-bold text-white mb-2">Hapus Siswa?</h3>
              <p className="text-slate-400 text-sm mb-5">
                <span className="text-white">{hapusSiswa.nama}</span> akan dihapus permanen dari sistem.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setHapusSiswa(null)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm">Batal</button>
                <button onClick={handleHapus} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm">🗑️ Hapus</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── View: List Ruangan (dalam JH) ──
  if (selectedJH) {
    const ruanganList = JH_DATA[selectedJH]
    const st = JH_STYLE[selectedJH]
    return (
      <div className="min-h-screen bg-slate-950 text-white font-mono">
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button onClick={() => setSelectedJH(null)}
              className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
              ← Kembali
            </button>
            <span className="text-slate-700">/</span>
            <span className={`text-sm font-bold ${st.text}`}>{selectedJH}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl ${st.bg} border ${st.border} flex items-center justify-center text-lg`}>
              {JH_STYLE[selectedJH].icon}
            </div>
            <div>
              <h2 className={`text-xl font-black ${st.text}`}>{selectedJH}</h2>
              <p className="text-slate-500 text-sm">{ruanganList.length} ruangan ujian</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ruanganList.map(ruangan => {
              const key = `${selectedJH}__${ruangan}`
              const count = counts[key] || 0
              return (
                <button key={ruangan} onClick={() => setSelectedRuangan(ruangan)}
                  className={`${st.bg} border ${st.border} rounded-2xl p-5 text-left hover:brightness-110 transition-all group`}>
                  <div className="text-2xl mb-3">📁</div>
                  <div className={`font-bold text-lg ${st.text} mb-1`}>{ruangan}</div>
                  <div className="text-slate-400 text-sm">{selectedJH}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${st.badge}`}>
                      {count} siswa
                    </span>
                    <span className="text-slate-600 group-hover:text-slate-400 text-sm transition-colors">→</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── View: List JH (root) ──
  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono">
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
            ← Dashboard
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-bold text-white">Data Siswa</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.keys(JH_DATA).map(jh => {
            const total = JH_DATA[jh].reduce((sum, r) => sum + (counts[`${jh}__${r}`] || 0), 0)
            const st = JH_STYLE[jh]
            return (
              <div key={jh} className={`${st.bg} border ${st.border} rounded-xl p-4 text-center`}>
                <div className={`text-2xl font-black ${st.text}`}>{total}</div>
                <div className="text-slate-400 text-xs mt-1">{jh}</div>
              </div>
            )
          })}
        </div>

        <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-4 font-bold">Pilih Kelompok JH</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(JH_DATA).map(([jh, ruanganList]) => {
            const st = JH_STYLE[jh]
            const totalSiswa = ruanganList.reduce((s, r) => s + (counts[`${jh}__${r}`] || 0), 0)
            return (
              <button key={jh} onClick={() => setSelectedJH(jh)}
                className={`${st.bg} border ${st.border} rounded-2xl p-6 text-left hover:brightness-110 transition-all group`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{st.icon}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${st.badge}`}>
                    {ruanganList.length} ruangan
                  </span>
                </div>
                <h3 className={`text-xl font-black ${st.text} mb-1`}>{jh}</h3>
                <p className="text-slate-400 text-sm mb-4">{totalSiswa} siswa terdaftar</p>
                <div className="flex flex-wrap gap-1.5">
                  {ruanganList.map(r => (
                    <span key={r} className={`text-xs px-2 py-0.5 rounded-md ${st.badge} border`}>{r}</span>
                  ))}
                </div>
                <div className="mt-4 text-right text-slate-600 group-hover:text-slate-400 text-sm transition-colors">Buka →</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
