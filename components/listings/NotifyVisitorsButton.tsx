'use client'

import { useState } from 'react'

type Props = {
  listingId: string
}

export default function NotifyVisitorsButton({ listingId }: Props) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function handleNotify() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/listings/notify-visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, note: note.trim() }),
      })
      const data = await res.json()
      if (data.ok) {
        setResult(data.count)
        setOpen(false)
        setNote('')
      } else {
        setError(data.error || 'Eroare necunoscută')
      }
    } catch {
      setError('Eroare de conexiune')
    }
    setLoading(false)
  }

  if (result !== null) {
    return (
      <div className="space-y-1">
        <div className="rounded-xl px-4 py-3 text-center text-sm font-semibold"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA' }}>
          {result > 0
            ? `✅ Mesaj trimis către ${result} vizitator${result !== 1 ? 'i' : ''}`
            : '👀 Niciun vizitator cu 2+ vizite încă'}
        </div>
        <button onClick={() => setResult(null)} className="w-full text-xs text-center py-1"
          style={{ color: 'var(--text-secondary)' }}>
          Trimite din nou
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:scale-[1.02]"
        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)', color: '#A78BFA' }}
      >
        📣 Notifică vizitatorii interesați
      </button>
    )
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.3)' }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase" style={{ color: '#A78BFA' }}>📣 Mesaj către vizitatori</p>
        <button onClick={() => { setOpen(false); setNote('') }} className="text-xs" style={{ color: 'var(--text-secondary)' }}>✕</button>
      </div>
      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Notă opțională (ex: Am scăzut prețul cu 10%!)"
        className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
        style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
      />
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        zyai.ro va trimite mesaj tuturor vizitatorilor cu 2+ vizite pe anunț.
      </p>
      <button
        onClick={handleNotify}
        disabled={loading}
        className="w-full py-2 rounded-lg text-xs font-semibold transition disabled:opacity-60"
        style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#A78BFA' }}
      >
        {loading ? 'Se trimite...' : '📤 Trimite mesaj'}
      </button>
      {error && <p className="text-xs" style={{ color: '#F87171' }}>⚠️ {error}</p>}
    </div>
  )
}
