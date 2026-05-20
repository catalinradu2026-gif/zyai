'use client'

import { useEffect, useState } from 'react'

type Proprietar = {
  id: number
  nume: string
  prenume: string
  studiouri: number
  nr_camera: string | null
}

export default function AsociatieBlaxyPage() {
  const [lista, setLista] = useState<Proprietar[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit')
  const [formNume, setFormNume] = useState('')
  const [formPrenume, setFormPrenume] = useState('')
  const [formStudiouri, setFormStudiouri] = useState(1)
  const [formCamera, setFormCamera] = useState('')
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const totalStudiouri = lista.reduce((s, p) => s + p.studiouri, 0)

  useEffect(() => {
    fetch('/api/asociatie')
      .then(r => r.json())
      .then(data => { setLista(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function adaugaPersoana() {
    if (!formNume.trim() || !formPrenume.trim()) return
    setSaving(true)
    const res = await fetch('/api/asociatie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nume: formNume, prenume: formPrenume, studiouri: formStudiouri, nr_camera: formCamera }),
    })
    if (res.ok) {
      const persoana = await res.json()
      setLista(prev => [...prev, persoana])
      setFormNume(''); setFormPrenume(''); setFormStudiouri(1); setFormCamera(''); setShowForm(false)
    }
    setSaving(false)
  }

  async function updateStudiouri(id: number, studiouri: number) {
    if (studiouri < 1) return
    setUpdatingId(id)
    setLista(prev => prev.map(p => p.id === id ? { ...p, studiouri } : p))
    await fetch(`/api/asociatie/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studiouri }),
    })
    setUpdatingId(null)
  }

  async function updateCamera(id: number, nr_camera: string, oldVal: string | null) {
    if (nr_camera === (oldVal ?? '')) return
    setLista(prev => prev.map(p => p.id === id ? { ...p, nr_camera: nr_camera || null } : p))
    await fetch(`/api/asociatie/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nr_camera }),
    })
  }

  async function stergePersoana(id: number) {
    if (!confirm('Stergi aceasta persoana?')) return
    await fetch(`/api/asociatie/${id}`, { method: 'DELETE' })
    setLista(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-widest"
          style={{ background: 'var(--gradient-main)', color: '#fff' }}
        >
          Blaxy Resort • Sunset Beach
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          ASOCIATIE DE PROPRIETARI
        </h1>
        <p className="text-lg font-semibold" style={{ color: 'var(--purple-light)' }}>Blaxy Resort</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-3xl font-bold" style={{ color: 'var(--purple-light)' }}>{lista.length}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Proprietari</div>
        </div>
        <div className="rounded-xl p-5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-3xl font-bold" style={{ color: 'var(--blue-light)' }}>{totalStudiouri}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Studiouri totale</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        {/* Toggle mod */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
          <button
            onClick={() => setViewMode('edit')}
            className="px-4 py-2 text-sm font-semibold cursor-pointer transition-colors"
            style={{
              background: viewMode === 'edit' ? 'var(--gradient-main)' : 'var(--bg-card)',
              color: viewMode === 'edit' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            ✏️ Editare
          </button>
          <button
            onClick={() => { setViewMode('view'); setShowForm(false) }}
            className="px-4 py-2 text-sm font-semibold cursor-pointer transition-colors"
            style={{
              background: viewMode === 'view' ? 'var(--gradient-main)' : 'var(--bg-card)',
              color: viewMode === 'view' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            📋 Tabel
          </button>
        </div>

        {/* Buton adaugă — doar în mod editare */}
        {viewMode === 'edit' && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: 'var(--gradient-main)', color: '#fff' }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{showForm ? '✕' : '+'}</span>
            {showForm ? 'Anuleaza' : 'Adauga persoana'}
          </button>
        )}
      </div>

      {/* Formular adăugare */}
      {showForm && viewMode === 'edit' && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--purple)', boxShadow: 'var(--glow-purple)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--purple-light)' }}>Proprietar nou</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nume</label>
              <input
                type="text"
                placeholder="ex: Popescu"
                value={formNume}
                onChange={e => setFormNume(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Prenume</label>
              <input
                type="text"
                placeholder="ex: Ion"
                value={formPrenume}
                onChange={e => setFormPrenume(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nr. camera</label>
              <input
                type="text"
                placeholder="ex: 12"
                value={formCamera}
                onChange={e => setFormCamera(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Nr. studiouri</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFormStudiouri(v => Math.max(1, v - 1))}
                className="w-9 h-9 rounded-lg font-bold text-lg cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
              >−</button>
              <span className="text-2xl font-bold w-8 text-center" style={{ color: 'var(--purple-light)' }}>{formStudiouri}</span>
              <button
                onClick={() => setFormStudiouri(v => v + 1)}
                className="w-9 h-9 rounded-lg font-bold text-lg cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
              >+</button>
            </div>
          </div>
          <button
            onClick={adaugaPersoana}
            disabled={saving || !formNume.trim() || !formPrenume.trim()}
            className="px-6 py-2 rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: 'var(--gradient-main)', color: '#fff' }}
          >
            {saving ? 'Se salveaza...' : 'Salveaza'}
          </button>
        </div>
      )}

      {/* Tabel */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {viewMode === 'view' ? 'Centralizator proprietari' : 'Lista proprietarilor'}
          </h3>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Se incarca...</div>
        ) : lista.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Niciun proprietar adaugat inca.
          </div>
        ) : viewMode === 'view' ? (
          /* ── MOD TABEL (read-only, curat) ── */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider w-10" style={{ color: 'var(--text-secondary)' }}>#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Nume si Prenume</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Nr. Camera</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Studiouri</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < lista.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{p.nume} {p.prenume}</td>
                    <td className="px-5 py-3 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {p.nr_camera || <span style={{ opacity: 0.4 }}>—</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
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
                  <td colSpan={3} className="px-5 py-4 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Total</td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'var(--gradient-main)', color: '#fff' }}>
                      {totalStudiouri} studiouri
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          /* ── MOD EDITARE ── */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-10" style={{ color: 'var(--text-secondary)' }}>#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Nume si Prenume</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Nr. Camera</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Studiouri</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < lista.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td className="px-4 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                    <td className="px-4 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{p.nume} {p.prenume}</td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="text"
                        defaultValue={p.nr_camera ?? ''}
                        placeholder="—"
                        onBlur={e => updateCamera(p.id, e.target.value, p.nr_camera)}
                        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                        className="w-20 px-2 py-1 rounded-lg text-sm text-center outline-none"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--purple)')}
                        onBlurCapture={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateStudiouri(p.id, p.studiouri - 1)}
                          disabled={p.studiouri <= 1 || updatingId === p.id}
                          className="w-7 h-7 rounded-lg font-bold cursor-pointer disabled:opacity-30 transition-opacity hover:opacity-70 text-sm"
                          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                        >−</button>
                        <span
                          className="text-lg font-bold w-7 text-center"
                          style={{ color: updatingId === p.id ? 'var(--text-secondary)' : 'var(--purple-light)' }}
                        >
                          {p.studiouri}
                        </span>
                        <button
                          onClick={() => updateStudiouri(p.id, p.studiouri + 1)}
                          disabled={updatingId === p.id}
                          className="w-7 h-7 rounded-lg font-bold cursor-pointer disabled:opacity-30 transition-opacity hover:opacity-70 text-sm"
                          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                        >+</button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => stergePersoana(p.id)}
                        className="text-xs cursor-pointer transition-opacity hover:opacity-70"
                        style={{ color: '#ef4444' }}
                        title="Sterge"
                      >✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border-light)' }}>
                  <td colSpan={3} className="px-4 py-4 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Total</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'var(--gradient-main)', color: '#fff' }}>
                      {totalStudiouri} studiouri
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
        Centralizator intern • Asociatie Proprietari Blaxy Resort
      </p>
    </div>
  )
}
