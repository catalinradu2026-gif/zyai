import type { Metadata } from 'next'
import data from '@/data/asociatie-blaxy.json'

export const metadata: Metadata = {
  title: 'Asociație Proprietari – Blaxy Resort',
}

type Proprietar = {
  id: number
  nume: string
  prenume: string
  studiouri: number
}

export default function AsociatieBlaxyPage() {
  const lista: Proprietar[] = data.proprietari

  const totalStudiouri = lista.reduce((sum, p) => sum + p.studiouri, 0)
  const totalProprietari = lista.length

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-widest"
          style={{ background: 'var(--gradient-main)', color: '#fff' }}
        >
          Blaxy Resort • Sunset Beach
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          ASOCIAȚIE DE PROPRIETARI
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--purple-light)' }}>
          Blaxy Resort
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className="rounded-xl p-5 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="text-3xl font-bold" style={{ color: 'var(--purple-light)' }}>
            {totalProprietari}
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Proprietari
          </div>
        </div>
        <div
          className="rounded-xl p-5 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="text-3xl font-bold" style={{ color: 'var(--blue-light)' }}>
            {totalStudiouri}
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Studiouri totale
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Lista proprietarilor
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-12"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  #
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Nume și Prenume
                </th>
                <th
                  className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Studiouri
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p, index) => (
                <tr
                  key={p.id}
                  className="asociatie-row"
                  style={{
                    borderBottom: index < lista.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {p.nume} {p.prenume}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        background: p.studiouri > 1 ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.12)',
                        color: p.studiouri > 1 ? 'var(--purple-light)' : 'var(--blue-light)',
                        border: `1px solid ${p.studiouri > 1 ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.3)'}`,
                      }}
                    >
                      {p.studiouri} {p.studiouri === 1 ? 'studio' : 'studiouri'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border-light)' }}>
                <td
                  colSpan={2}
                  className="px-6 py-4 text-sm font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Total
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background: 'var(--gradient-main)',
                      color: '#fff',
                    }}
                  >
                    {totalStudiouri} studiouri
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
        Centralizator intern • Asociație Proprietari Blaxy Resort
      </p>
    </div>
  )
}
