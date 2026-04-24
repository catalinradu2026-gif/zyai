'use client'

import { useState } from 'react'

type Props = {
  category?: string
  city?: string
  query?: string
  minPrice?: number
  maxPrice?: number
}

export default function BuyerAlertSetup({ category, city, query, minPrice, maxPrice }: Props) {
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) { setError('Introdu un număr valid'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/alerts/buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, query, category, city, minPrice, maxPrice }),
      })
      const data = await res.json()
      if (data.ok) setDone(true)
      else setError(data.error || 'Eroare')
    } catch {
      setError('Eroare de conexiune')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
        style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', color: '#A78BFA' }}>
        ✅ Alertă activată! Vei primi mesaj WhatsApp când apare un anunț nou.
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:scale-[1.01]"
        style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA' }}
      >
        🔔 Alertă anunțuri noi
      </button>
    )
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.25)' }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase" style={{ color: '#A78BFA' }}>🔔 Alertă anunțuri noi</p>
        <button onClick={() => setOpen(false)} className="text-xs" style={{ color: 'var(--text-secondary)' }}>✕</button>
      </div>

      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Primești mesaj WhatsApp imediat ce apare un anunț nou care se potrivește cu căutarea ta.
      </p>

      {(query || category || city) && (
        <div className="flex flex-wrap gap-1.5">
          {query && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>🔍 {query}</span>}
          {category && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>📂 {category}</span>}
          {city && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>📍 {city}</span>}
          {minPrice && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>min {minPrice}</span>}
          {maxPrice && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>max {maxPrice}</span>}
        </div>
      )}

      <input
        type="tel"
        value={phone}
        onChange={e => { setPhone(e.target.value); setError('') }}
        placeholder="Nr. telefon (ex: 0740123456)"
        className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
        style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
      />

      {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}

      <button
        onClick={save}
        disabled={loading}
        className="w-full py-2 rounded-lg text-sm font-semibold transition"
        style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#A78BFA', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Se salvează...' : '🔔 Activează alerta'}
      </button>
    </div>
  )
}
