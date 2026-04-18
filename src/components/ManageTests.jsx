import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

export default function ManageTests({ onBack }) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null) // 'create' | 'edit'
  const [editTest, setEditTest] = useState(null)
  const [hapusTest, setHapusTest] = useState(null)
  const [form, setForm] = useState({ nama_test: '', deskripsi: '' })
  const [err, setErr] = useState('')

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    setLoading(true)
    const { data } = await supabase.from('test').select('*').order('created_at', { ascending: true })
    setTests(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nama_test.trim()) {
      setErr('Nama test wajib diisi')
      return
    }
    setLoading(true)
    setErr('')

    if (editTest) {
      const { error } = await supabase.from('test').update({
        nama_test: form.nama_test.trim(),
        deskripsi: form.deskripsi.trim()
      }).eq('id', editTest.id)
      if (error) setErr(error.message)
    } else {
      const { error } = await supabase.from('test').insert({
        nama_test: form.nama_test.trim(),
        deskripsi: form.deskripsi.trim()
      })
      if (error) {
        if (error.code === '23505') {
          setErr('Nama test sudah digunakan.')
        } else {
          setErr(error.message)
        }
      }
    }

    setLoading(false)
    if (!err) {
      setModal(null)
      setEditTest(null)
      setForm({ nama_test: '', deskripsi: '' })
      fetchTests()
    }
  }

  const handleHapus = async () => {
    if (!hapusTest) return
    await supabase.from('test').delete().eq('id', hapusTest.id)
    setHapusTest(null)
    fetchTests()
  }

  const openCreate = () => {
    setForm({ nama_test: '', deskripsi: '' })
    setEditTest(null)
    setModal('create')
  }

  const openEdit = (test) => {
    setForm({ nama_test: test.nama_test, deskripsi: test.deskripsi || '' })
    setEditTest(test)
    setModal('edit')
  }

  const jumlahSoal = async (testId) => {
    const { count } = await supabase.from('soal').select('*', { count: 'exact', head: true }).eq('test_id', testId)
    return count || 0
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
            ← Dashboard
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-bold text-white">Kelola Test</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Kelola Test Soal</h2>
            <p className="text-slate-400 text-sm mt-1">Buat dan kelola kumpulan soal untuk ujian</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors"
          >
            ➕ Buat Test
          </button>
        </div>

        {/* Test List */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">⏳ Memuat...</div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-slate-500 text-sm">Belum ada test.</p>
            <button onClick={openCreate} className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm">Buat Test Pertama</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => (
              <div key={test.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5 hover:border-violet-600 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{test.nama_test}</h3>
                    {test.deskripsi && <p className="text-slate-400 text-xs mt-1">{test.deskripsi}</p>}
                  </div>
                  <span className="text-xs px-2 py-1 bg-violet-900/30 text-violet-300 border border-violet-700/50 rounded">ID: {test.id}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => openEdit(test)}
                    className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setHapusTest(test)}
                    className="text-xs px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-300 rounded-lg transition-colors"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">{modal === 'create' ? '➕ Buat Test Baru' : '✏️ Edit Test'}</h3>
              <button onClick={() => { setModal(null); setEditTest(null); setForm({ nama_test: '', deskripsi: '' }) }} className="text-slate-500 hover:text-white text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Nama Test *</label>
                <input
                  value={form.nama_test}
                  onChange={(e) => setForm(p => ({ ...p, nama_test: e.target.value }))}
                  placeholder="Contoh: UTS Ganjil"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Deskripsi (opsional)</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm(p => ({ ...p, deskripsi: e.target.value }))}
                  placeholder="Keterangan test..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                />
              </div>
              {err && <p className="text-red-400 text-xs">⚠️ {err}</p>}
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setModal(null); setEditTest(null) }} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50">
                  {loading ? '⏳' : modal === 'create' ? '➕ Buat' : '💾 Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {hapusTest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="font-bold text-white mb-2">Hapus Test?</h3>
            <p className="text-slate-400 text-sm mb-5">
              Test <span className="text-white font-bold">{hapusTest.nama_test}</span> akan dihapus permanen. Data soal yang terkait juga akan terhapus.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setHapusTest(null)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm">Batal</button>
              <button onClick={handleHapus} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm">🗑️ Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
