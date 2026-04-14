'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReactivateButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()

  async function handleReactivate() {
    if (!confirm) { setConfirm(true); return }
    setLoading(true)
    setConfirm(false)
    try {
      const res = await fetch('/api/listings/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      const data = await res.json()
      if (data.ok) router.refresh()
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  if (confirm) {
    return (
      <div className="flex gap-1.5">
        <button
          onClick={handleReactivate}
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-xl text-sm font-bold transition hover:scale-105 active:scale-95"
          style={{ background: '#16a34a', color: 'white', border: '1px solid #15803d' }}
        >
          ✓ Da, reactivează!
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
      onClick={handleReactivate}
      disabled={loading}
      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition hover:scale-105 active:scale-95 disabled:opacity-60 w-full"
      style={{
        background: 'rgba(34,197,94,0.1)',
        border: '1px solid rgba(34,197,94,0.4)',
        color: '#4ade80',
      }}
    >
      ♻️ Reactivează
    </button>
  )
}
