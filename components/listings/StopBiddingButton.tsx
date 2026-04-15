'use client'

import { useState } from 'react'
import { stopBidding } from '@/lib/actions/listings'
import { useRouter } from 'next/navigation'

export default function StopBiddingButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleStop() {
    if (!confirm) { setConfirm(true); return }
    setLoading(true)
    setError('')
    const result = await stopBidding(listingId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      setConfirm(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleStop}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm transition hover:scale-105 active:scale-95 disabled:opacity-50"
        style={confirm
          ? { background: 'rgba(220,38,38,0.15)', border: '1.5px solid rgba(220,38,38,0.5)', color: '#f87171' }
          : { background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.35)', color: '#fb923c' }
        }
      >
        {loading ? '⏳ Se oprește...' : confirm ? '⚠️ Confirmi oprirea licitației?' : '🛑 Oprește licitația'}
      </button>
      {confirm && !loading && (
        <button
          onClick={() => setConfirm(false)}
          className="w-full py-1.5 text-xs rounded-lg transition"
          style={{ color: 'var(--text-secondary)', background: 'var(--bg-input)' }}
        >
          Anulează
        </button>
      )}
      {error && <p className="text-xs" style={{ color: '#f87171' }}>❌ {error}</p>}
      {confirm && (
        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          Dacă există oferte, anunțul va fi marcat vândut cu oferta curentă.
        </p>
      )}
    </div>
  )
}
