// src/components/HasilUjian.jsx
export default function HasilUjian({ siswa, soalList, onLogout }) {
  const nilai = siswa?.nilai ?? 0
  const jawaban = siswa?.jawaban ?? {}

  const getGrade = (n) => {
    if (n >= 90) return { label: 'A', color: 'text-emerald-400' }
    if (n >= 80) return { label: 'B', color: 'text-blue-400' }
    if (n >= 70) return { label: 'C', color: 'text-amber-400' }
    if (n >= 60) return { label: 'D', color: 'text-orange-400' }
    return { label: 'E', color: 'text-red-400' }
  }

  const grade = getGrade(nilai)
  const benar = soalList.filter(
    (s) => jawaban[s.nomor] === s.jawaban_benar
  ).length
  const salah = soalList.length - benar

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header nilai */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-6 text-center">
          <div className="flex justify-end mb-2">
            {siswa.status_login === 'online' && (
              <button
                onClick={onLogout}
                className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-slate-300 transition-colors"
              >
                Keluar
              </button>
            )}
          </div>
          <div className="text-slate-400 text-sm mb-1">Hasil Ujian</div>
          <div className="text-2xl font-bold text-white mb-4">
            {siswa?.nama}
            {siswa?.kelas && (
              <span className="ml-2 text-sm font-normal text-slate-400">
                — {siswa.kelas}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 my-6">
            <div>
              <div className={`text-7xl font-black ${grade.color}`}>{nilai}</div>
              <div className="text-slate-400 text-sm mt-1">Nilai</div>
            </div>
            <div className="text-slate-600 text-4xl">/</div>
            <div>
              <div className={`text-5xl font-black ${grade.color}`}>{grade.label}</div>
              <div className="text-slate-400 text-sm mt-1">Grade</div>
            </div>
          </div>

          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{benar}</div>
              <div className="text-slate-400">Benar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{salah}</div>
              <div className="text-slate-400">Salah</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-300">{soalList.length}</div>
              <div className="text-slate-400">Total Soal</div>
            </div>
          </div>
        </div>

        {/* Review jawaban */}
        <div className="text-slate-400 text-sm font-medium mb-3 px-1">
          Review Jawaban
        </div>
        <div className="space-y-3">
          {soalList.map((soal) => {
            const jawabanSiswa = jawaban[soal.nomor]
            const isBenar = jawabanSiswa === soal.jawaban_benar
            const opsiList = ['A', 'B', 'C', 'D']
            const opsiText = {
              A: soal.opsi_a,
              B: soal.opsi_b,
              C: soal.opsi_c,
              D: soal.opsi_d,
            }

            return (
              <div
                key={soal.id}
                className={`bg-slate-800 border rounded-xl p-5 ${
                  isBenar ? 'border-emerald-700/50' : 'border-red-700/50'
                }`}
              >
                {/* Badge + Nomor */}
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isBenar
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {isBenar ? '✓' : '✗'}
                  </span>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    <span className="text-slate-400 mr-1">Soal {soal.nomor}.</span>
                    {soal.pertanyaan}
                  </p>
                </div>

                {/* Opsi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-9">
                  {opsiList.map((opt) => {
                    const isBENAR = opt === soal.jawaban_benar
                    const isSISWA = opt === jawabanSiswa
                    let cls =
                      'rounded-lg px-3 py-2 text-sm flex items-center gap-2 border '

                    if (isBENAR && isSISWA) {
                      cls += 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    } else if (isBENAR) {
                      cls += 'bg-emerald-500/10 border-emerald-700 text-emerald-400'
                    } else if (isSISWA) {
                      cls += 'bg-red-500/10 border-red-700 text-red-400 line-through'
                    } else {
                      cls += 'bg-slate-700/40 border-slate-700 text-slate-400'
                    }

                    return (
                      <div key={opt} className={cls}>
                        <span className="font-bold shrink-0">{opt}.</span>
                        <span>{opsiText[opt]}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Tidak menjawab */}
                {!jawabanSiswa && (
                  <p className="ml-9 mt-2 text-xs text-slate-500 italic">
                    Tidak dijawab — Jawaban benar: {soal.jawaban_benar}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center text-slate-600 text-xs">
          {siswa?.selesai_at &&
            `Selesai: ${new Date(siswa.selesai_at).toLocaleString('id-ID')}`}
        </div>
      </div>
    </div>
  )
}
