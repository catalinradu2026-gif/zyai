'use client'

import { useEffect, useState } from 'react'

type Props = {
  title: string
  price: number
  currency: string
  category: string
  city: string
  description?: string
}

type Verdict = 'ieftin' | 'corect' | 'scump' | null

export default function PriceVerdictBadge({ title, price, currency, category, city, description }: Props) {
  const [verdict, setVerdict] = useState<Verdict>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<{ min: number; max: number; currency: string } | null>(null)

  useEffect(() => {
    async function fetch_verdict() {
      try {
        const res = await fetch('/api/ai/suggest-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category, city, description }),
        })
        if (!res.ok) return
        const data = await res.json()
        if (!data.suggested || !data.min || !data.max) return

        // Normalizăm moneda pentru comparație
        const suggestedInSameCurrency = data.currency === currency ? data.suggested : null
        if (!suggestedInSameCurrency) return

        setRange({ min: data.min, max: data.max, currency: data.currency })

        const ratio = price / suggestedInSameCurrency
        if (ratio < 0.85) setVerdict('ieftin')
        else if (ratio <= 1.15) setVerdict('corect')
        else setVerdict('scump')
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetch_verdict()
  }, [title, price, currency, category, city, description])

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold animate-pulse"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
        <span className="w-2 h-2 rounded-full bg-current opacity-50" />
        AI analizează prețul...
      </span>
    )
  }

  if (!verdict) return null

  const config = {
    ieftin: {
      label: '🟢 PREȚ IEFTIN',
      bg: 'rgba(34,197,94,0.15)',
      border: 'rgba(34,197,94,0.4)',
      color: '#4ade80',
      tip: `Sub piață — ofertă bună${range ? ` (piața: ${range.min.toLocaleString()}–${range.max.toLocaleString()} ${range.currency})` : ''}`,
    },
    corect: {
      label: '🔵 PREȚ CORECT',
      bg: 'rgba(59,130,246,0.12)',
      border: 'rgba(59,130,246,0.4)',
      color: '#60a5fa',
      tip: `Preț conform pieței${range ? ` (piața: ${range.min.toLocaleString()}–${range.max.toLocaleString()} ${range.currency})` : ''}`,
    },
    scump: {
      label: '🔴 PREȚ RIDICAT',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.4)',
      color: '#f87171',
      tip: `Peste piață${range ? ` (piața: ${range.min.toLocaleString()}–${range.max.toLocaleString()} ${range.currency})` : ''}`,
    },
  }[verdict]

  return (
    <div className="flex flex-col gap-1">
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-fit"
        style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
      >
        {config.label}
      </span>
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        🤖 {config.tip}
      </span>
    </div>
  )
}
