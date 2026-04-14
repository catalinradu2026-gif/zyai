'use client'

import { useState } from 'react'

// Categorii fără buton SOLD: Servicii (4), Joburi (1)
const NO_SOLD_CATEGORIES = [1, 4]

type Props = {
  listingId: string
  categoryId: number
  currentStatus: string
}

export default function MarkAsSoldButton({ listingId, categoryId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  if (NO_SOLD_CATEGORIES.includes(categoryId)) return null
  if (status === 'vandut') {
    return (
      <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold w-full lg:w-auto"
        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
        🔴 VÂNDUT
      </div>
    )
  }

  async function handleSold() {
    if (!confirm) {
      setConfirm(true)
      return
    }
    setLoading(true)
    setConfirm(false)
    try {
      const res = await fetch('/api/listings/mark-sold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      const data = await res.json()
      if (data.ok) setStatus('vandut')
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  if (confirm) {
    return (
      <div className="flex gap-1.5 w-full lg:w-auto">
        <button
          onClick={handleSold}
          disabled={loading}
          className="flex-1 lg:flex-none px-3 py-2 rounded-xl text-sm font-bold transition hover:scale-105 active:scale-95"
          style={{ background: '#dc2626', color: 'white', border: '1px solid #b91c1c' }}
        >
          ✓ Da, vândut!
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-3 py-2 rounded-xl text-sm transition"
          style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleSold}
      disabled={loading}
      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition hover:scale-105 active:scale-95 w-full lg:w-auto disabled:opacity-60"
      style={{
        background: 'rgba(220,38,38,0.1)',
        border: '1px solid rgba(220,38,38,0.4)',
        color: '#f87171',
      }}
    >
      🔴 SOLD
    </button>
  )
}
