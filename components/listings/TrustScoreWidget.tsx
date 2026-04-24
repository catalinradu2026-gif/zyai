'use client'

import { useEffect, useState } from 'react'

type Props = {
  sellerName: string
  hasPhone: boolean
  city: string
  hasAvatar: boolean
  listingCount: number
  joinedDaysAgo: number
  avgImages: number
}

type TrustResult = {
  score: number
  level: string
  badge: string
  summary: string
}

const SCORE_COLOR = (score: number) =>
  score >= 80 ? '#4ADE80' : score >= 50 ? '#FBB024' : '#F87171'

export default function TrustScoreWidget(props: Props) {
  const [result, setResult] = useState<TrustResult | null>(null)

  useEffect(() => {
    fetch('/api/ai/trust-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(props),
    })
      .then(r => r.json())
      .then(d => { if (d.ok) setResult(d.result) })
      .catch(() => {})
  }, [])

  if (!result) return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="w-3 h-3 rounded-full border border-purple-400 border-t-transparent animate-spin" />
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Calculez scor...</span>
    </div>
  )

  const color = SCORE_COLOR(result.score)

  return (
    <div className="mt-2 rounded-xl px-3 py-2 flex items-center gap-2"
      style={{ background: `${color}12`, border: `1px solid ${color}40` }}>
      <span className="text-base">{result.badge}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold" style={{ color }}>{result.level}</span>
          <span className="text-xs font-semibold" style={{ color }}>· {result.score}/100</span>
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{result.summary}</p>
      </div>
    </div>
  )
}
