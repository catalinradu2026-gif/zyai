'use client'

import { useEffect, useState } from 'react'

type Props = {
  listingId: string
  views: number
  savedCount?: number
  category: string
  createdAt: string
}

export default function FomoSignals({ listingId, views, savedCount = 0, category, createdAt }: Props) {
  const [signals, setSignals] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/ai/fomo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ views, savedCount, category, createdAt }),
    })
      .then(r => r.json())
      .then(d => { if (d.ok && d.signals?.length) setSignals(d.signals) })
      .catch(() => {})
  }, [])

  if (!signals.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {signals.map((s, i) => (
        <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#A78BFA' }}>
          {s}
        </span>
      ))}
    </div>
  )
}
