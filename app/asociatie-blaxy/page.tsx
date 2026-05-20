'use client'

import { useEffect, useState } from 'react'

type Proprietar = {
  id: number
  nume: string
  prenume: string
  studiouri: number
}

export default function AsociatieBlaxyPage() {
  const [lista, setLista] = useState<Proprietar[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formNume, setFormNume] = useState('')
  const [formPrenume, setFormPrenume] = useState('')
  const [formStudiouri, setFormStudiouri] = useState(1)
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
      body: JSON.stringify({ nume: formNume, prenume: formPrenume, studiouri: formStudiouri }),
    })
    if (res.ok) {
      const persoana = await res.json()
      setLista(prev => [...prev, persoana])
      setFormNume(''); setFormPrenume(''); setFormStudiouri(1); setShowForm(false)
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

  async function stergePersoana(id: number) {
    if (!confirm('Ștergi această persoană?')) return
    await fetch(`/api/asociatie/${id}`, { method: 'DELETE' })
    setLista(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-widest"
          style={{ background: 'var(--gradient-main)', color: '#fff' }}
        >
          Blaxy Resort • Sunset Beach
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          ASOCIAȚIE DE PROPRIETARI
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

      {/* Buton adaugă */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm cursor-pointer transition-opacity hover:opacity-90"
          style={{ background: 'var(--gradient-main)', color: '#fff' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{showForm ? '✕' : '+'}</span>
          {showForm ? 'Anulează' : 'Adaugă persoană'}
        </button>
      </div>

      {/* Formular adăugare */}
      {showForm && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--purple)', boxShadow: 'var(--glow-purple)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--purple-light)' }}>Proprietar nou</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
            {saving ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      )}

      {/* Tabel proprietari */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Lista proprietarilor</h3>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Se încarcă...</div>
        ) : lista.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Niciun proprietar adăugat încă. Apasă &quot;Adaugă persoană&quot;.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider w-10" style={{ color: 'var(--text-secondary)' }}>#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Nume și Prenume</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Studiouri</th>
                <th className="px-5 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < lista.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                  <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {p.nume} {p.prenume}
                  </td>
                  <td className="px-5 py-4">
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
                  <td className="px-5 py-4">
                    <button
                      onClick={() => stergePersoana(p.id)}
                      className="text-xs cursor-pointer transition-opacity hover:opacity-70"
                      style={{ color: '#ef4444' }}
                      title="Șterge"
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border-light)' }}>
                <td colSpan={2} className="px-5 py-4 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  Total
                </td>
                <td className="px-5 py-4 text-center">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                    style={{ background: 'var(--gradient-main)', color: '#fff' }}
                  >
                    {totalStudiouri} studiouri
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
        Centralizator intern • Asociație Proprietari Blaxy Resort
      </p>
    </div>
  )
}
