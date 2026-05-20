'use client'

import { useEffect, useState } from 'react'

function mascheazaNume(nume: string) {
  if (!nume) return ''
  return nume[0] + '*'.repeat(Math.max(nume.length - 1, 3))
}

type Proprietar = {
  id: number
  nume: string
  prenume: string
  studiouri: number
  nr_camera: string | null
}

const ADMIN_KEY_SESSION = 'asociatie_admin_key'

function adminHeaders(key: string) {
  return { 'Content-Type': 'application/json', 'x-admin-key': key }
}

function CameraInput({ id, adminKey, initial, onSave }: {
  id: number
  adminKey: string
  initial: string | null
  onSave: (id: number, val: string) => Promise<string | null>
}) {
  const [val, setVal] = useState(initial ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle')

  async function save() {
    if (status === 'saving') return
    setStatus('saving')
    const err = await onSave(id, val)
    setStatus(err ? 'err' : 'ok')
    setTimeout(() => setStatus('idle'), 1500)
  }

  const borderColor = status === 'ok' ? '#22c55e' : status === 'err' ? '#ef4444' : 'var(--border-subtle)'

  return (
    <div className="flex items-center justify-center gap-1">
      <input
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save() }}
        placeholder="—"
        className="w-20 px-2 py-1 rounded-lg text-sm text-center outline-none"
        style={{ background: 'var(--bg-input)', border: `1px solid ${borderColor}`, color: 'var(--text-primary)', transition: 'border-color 0.2s' }}
      />
      <button
        onClick={save}
        disabled={status === 'saving' || !adminKey}
        className="px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: status === 'ok' ? '#22c55e' : status === 'err' ? '#ef4444' : 'var(--text-secondary)' }}
      >
        {status === 'saving' ? '…' : status === 'ok' ? '✓' : status === 'err' ? '✗' : 'OK'}
      </button>
    </div>
  )
}

export default function AsociatieBlaxyPage() {
  const [lista, setLista] = useState<Proprietar[]>([])
  const [loading, setLoading] = useState(true)
  const [adminKey, setAdminKey] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [loginInput, setLoginInput] = useState('')
  const [loginErr, setLoginErr] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formNume, setFormNume] = useState('')
  const [formPrenume, setFormPrenume] = useState('')
  const [formStudiouri, setFormStudiouri] = useState(1)
  const [formCamera, setFormCamera] = useState('')
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const isAdmin = !!adminKey
  const totalStudiouri = lista.reduce((s, p) => s + p.studiouri, 0)

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_KEY_SESSION)
    if (saved) setAdminKey(saved)
    fetch('/api/asociatie')
      .then(r => r.json())
      .then(data => { setLista(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function tryLogin() {
    const res = await fetch('/api/asociatie', {
      headers: { 'x-admin-key': loginInput },
    })
    // Testăm cheia: POST cu date goale → dacă primim 400 (validare) nu 401 → cheia e corectă
    const test = await fetch('/api/asociatie', {
      method: 'POST',
      headers: adminHeaders(loginInput),
      body: JSON.stringify({ nume: '', prenume: '' }),
    })
    if (test.status !== 401) {
      setAdminKey(loginInput)
      sessionStorage.setItem(ADMIN_KEY_SESSION, loginInput)
      setShowLogin(false)
      setLoginInput('')
      setLoginErr(false)
    } else {
      setLoginErr(true)
    }
  }

  function logout() {
    setAdminKey('')
    sessionStorage.removeItem(ADMIN_KEY_SESSION)
    setShowForm(false)
  }

  async function adaugaPersoana() {
    if (!formNume.trim() || !formPrenume.trim()) return
    setSaving(true)
    const res = await fetch('/api/asociatie', {
      method: 'POST',
      headers: adminHeaders(adminKey),
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
      headers: adminHeaders(adminKey),
      body: JSON.stringify({ studiouri }),
    })
    setUpdatingId(null)
  }

  async function updateCamera(id: number, nr_camera: string): Promise<string | null> {
    const res = await fetch(`/api/asociatie/${id}`, {
      method: 'PATCH',
      headers: adminHeaders(adminKey),
      body: JSON.stringify({ nr_camera }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return body.error ?? `Eroare ${res.status}`
    }
    setLista(prev => prev.map(p => p.id === id ? { ...p, nr_camera: nr_camera || null } : p))
    return null
  }

  async function stergePersoana(id: number) {
    if (!confirm('Stergi aceasta persoana?')) return
    await fetch(`/api/asociatie/${id}`, { method: 'DELETE', headers: adminHeaders(adminKey) })
    setLista(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Modal login admin */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 w-80" style={{ background: 'var(--bg-card)', border: '1px solid var(--purple)', boxShadow: 'var(--glow-purple)' }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--purple-light)' }}>🔐 Acces administrator</h3>
            <input
              type="password"
              placeholder="Parola admin"
              value={loginInput}
              onChange={e => { setLoginInput(e.target.value); setLoginErr(false) }}
              onKeyDown={e => { if (e.key === 'Enter') tryLogin() }}
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-2"
              style={{
                background: 'var(--bg-input)',
                border: `1px solid ${loginErr ? '#ef4444' : 'var(--border-light)'}`,
                color: 'var(--text-primary)',
              }}
            />
            {loginErr && <p className="text-xs mb-2" style={{ color: '#ef4444' }}>Parolă incorectă</p>}
            <div className="flex gap-2 mt-3">
              <button
                onClick={tryLogin}
                className="flex-1 py-2 rounded-xl font-semibold text-sm cursor-pointer"
                style={{ background: 'var(--gradient-main)', color: '#fff' }}
              >
                Intră
              </button>
              <button
                onClick={() => { setShowLogin(false); setLoginInput(''); setLoginErr(false) }}
                className="flex-1 py-2 rounded-xl font-semibold text-sm cursor-pointer"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                🔓 Admin activ
              </span>
              <button
                onClick={logout}
                className="text-xs px-3 py-1 rounded-full cursor-pointer"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
              >
                Ieși
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="text-xs px-3 py-1 rounded-full cursor-pointer flex items-center gap-1"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
            >
              🔒 Admin
            </button>
          )}
        </div>

        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm cursor-pointer transition-opacity hover:opacity-90"
          style={{ background: 'var(--gradient-main)', color: '#fff' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{showForm ? '✕' : '+'}</span>
          {showForm ? 'Anuleaza' : 'Adauga persoana'}
        </button>
      </div>

      {/* Formular adăugare — doar admin */}
      {showForm && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--purple)', boxShadow: 'var(--glow-purple)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--purple-light)' }}>Proprietar nou</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nume</label>
              <input type="text" placeholder="ex: Popescu" value={formNume} onChange={e => setFormNume(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Prenume</label>
              <input type="text" placeholder="ex: Ion" value={formPrenume} onChange={e => setFormPrenume(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nr. camera</label>
              <input type="text" placeholder="ex: 12" value={formCamera} onChange={e => setFormCamera(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Nr. studiouri</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setFormStudiouri(v => Math.max(1, v - 1))}
                className="w-9 h-9 rounded-lg font-bold text-lg cursor-pointer hover:opacity-80"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>−</button>
              <span className="text-2xl font-bold w-8 text-center" style={{ color: 'var(--purple-light)' }}>{formStudiouri}</span>
              <button onClick={() => setFormStudiouri(v => v + 1)}
                className="w-9 h-9 rounded-lg font-bold text-lg cursor-pointer hover:opacity-80"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>+</button>
            </div>
          </div>
          <button onClick={adaugaPersoana} disabled={saving || !formNume.trim() || !formPrenume.trim()}
            className="px-6 py-2 rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50 hover:opacity-90"
            style={{ background: 'var(--gradient-main)', color: '#fff' }}>
            {saving ? 'Se salveaza...' : 'Salveaza'}
          </button>
        </div>
      )}

      {/* Tabel */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Lista proprietarilor</h3>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Se incarca...</div>
        ) : lista.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>Niciun proprietar adaugat inca.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-10" style={{ color: 'var(--text-secondary)' }}>#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Nume si Prenume</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Nr. Camera</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Studiouri {!isAdmin && <span title="Doar admin poate modifica">🔒</span>}
                  </th>
                  {isAdmin && <th className="px-4 py-3 w-8"></th>}
                </tr>
              </thead>
              <tbody>
                {lista.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < lista.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td className="px-4 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                    <td className="px-4 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{isAdmin ? p.nume : mascheazaNume(p.nume)} {p.prenume}</td>
                    <td className="px-4 py-4 text-center">
                      <CameraInput id={p.id} adminKey={adminKey} initial={p.nr_camera} onSave={updateCamera} />
                    </td>
                    <td className="px-4 py-4">
                      {isAdmin ? (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateStudiouri(p.id, p.studiouri - 1)} disabled={p.studiouri <= 1 || updatingId === p.id}
                            className="w-7 h-7 rounded-lg font-bold cursor-pointer disabled:opacity-30 hover:opacity-70 text-sm"
                            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>−</button>
                          <span className="text-lg font-bold w-7 text-center"
                            style={{ color: updatingId === p.id ? 'var(--text-secondary)' : 'var(--purple-light)' }}>{p.studiouri}</span>
                          <button onClick={() => updateStudiouri(p.id, p.studiouri + 1)} disabled={updatingId === p.id}
                            className="w-7 h-7 rounded-lg font-bold cursor-pointer disabled:opacity-30 hover:opacity-70 text-sm"
                            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>+</button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                            style={{
                              background: p.studiouri > 1 ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.12)',
                              color: p.studiouri > 1 ? 'var(--purple-light)' : 'var(--blue-light)',
                              border: `1px solid ${p.studiouri > 1 ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.3)'}`,
                            }}>
                            {p.studiouri} {p.studiouri === 1 ? 'studio' : 'studiouri'}
                          </span>
                        </div>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-4">
                        <button onClick={() => stergePersoana(p.id)}
                          className="text-xs cursor-pointer hover:opacity-70" style={{ color: '#ef4444' }}>✕</button>
                      </td>
                    )}
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
                  {isAdmin && <td></td>}
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
