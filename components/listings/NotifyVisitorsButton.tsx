'use client'

import { useState } from 'react'

type Props = {
  listingId: string
}

export default function NotifyVisitorsButton({ listingId }: Props) {
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
        body: JSON.stringify({ listingId }),
      })
      const data = await res.json()
      if (data.ok) {
        setResult(data.count)
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

  return (
    <div className="space-y-1">
      <button
        onClick={handleNotify}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)', color: '#A78BFA' }}
      >
        {loading
          ? <><div className="w-3 h-3 rounded-full border border-purple-400 border-t-transparent animate-spin" /> Se trimite...</>
          : '📣 Notifică vizitatorii interesați'}
      </button>
      {error && <p className="text-xs text-center" style={{ color: '#F87171' }}>⚠️ {error}</p>}
      <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
        zyai.ro le reamintește vizitatorilor că anunțul e disponibil
      </p>
    </div>
  )
}
