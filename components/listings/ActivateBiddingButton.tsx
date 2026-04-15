'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  listingId: string
  categoryId: number
  fromSold?: boolean
}

const NO_BIDDING_CATEGORIES = [4] // Servicii

export default function ActivateBiddingButton({ listingId, categoryId, fromSold = false }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'select' | 'loading'>('idle')
  const [hours, setHours] = useState(2)
  const [errorMsg, setErrorMsg] = useState('')

  if (NO_BIDDING_CATEGORIES.includes(categoryId)) return null

  async function activate() {
    setStep('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/listings/activate-bidding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, durationHours: hours }),
      })
      const data = await res.json()
      if (data.ok) {
        window.location.href = `/anunt/${listingId}`
      } else {
        setErrorMsg(data.error || 'Eroare necunoscută')
        setStep('select')
      }
    } catch (e) {
      setErrorMsg('Eroare de conexiune')
      setStep('select')
    }
  }

  if (step === 'select') {
    return (
      <div className="space-y-2 p-3 rounded-xl" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.3)' }}>
        <p className="text-xs font-bold" style={{ color: '#fb923c' }}>🔥 Licitație finală — alege durata:</p>
        <div className="flex gap-1.5 flex-wrap">
          {[1, 2, 3, 6].map(h => (
            <button key={h} onClick={() => setHours(h)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition"
              style={{
                background: hours === h ? 'rgba(251,146,60,0.3)' : 'var(--bg-card-hover)',
                border: `1px solid ${hours === h ? 'rgba(251,146,60,0.6)' : 'var(--border-subtle)'}`,
                color: hours === h ? '#fb923c' : 'var(--text-secondary)',
              }}>
              {h}h
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={activate}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
            🔥 Activează {hours}h
          </button>
          <button onClick={() => { setStep('idle'); setErrorMsg('') }}
            className="px-3 py-2 rounded-xl text-xs transition"
            style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }}>
            ✕
          </button>
        </div>
        {errorMsg && (
          <p className="text-xs font-semibold" style={{ color: '#f87171' }}>❌ {errorMsg}</p>
        )}
      </div>
    )
  }

  if (step === 'loading') {
    return (
      <div className="px-3 py-2 rounded-xl text-xs font-semibold text-center" style={{ color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }}>
        ⏳ Se activează...
      </div>
    )
  }

  return (
    <button onClick={() => setStep('select')}
      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition hover:scale-105 active:scale-95 w-full"
      style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.4)', color: '#fb923c' }}>
      🔥 {fromSold ? 'Redeschide cu licitație' : 'SOLD cu licitație'}
    </button>
  )
}
