'use client'

import { useEffect, useState } from 'react'

type Insight = {
  listingTitle: string
  type: 'warning' | 'tip' | 'success'
  message: string
}

type InsightsResult = {
  totalViews: number
  insights: Insight[]
  topTip: string
  overallScore: number
}

type ListingSummary = {
  title: string
  price: number
  views: number
  status: string
}

const TYPE_STYLE = {
  warning: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.3)', color: '#FBB024', icon: '⚠️' },
  tip: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)', color: '#60A5FA', icon: '💡' },
  success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.3)', color: '#4ADE80', icon: '✅' },
}

export default function SellerInsightsPanel({ listings }: { listings: ListingSummary[] }) {
  const [result, setResult] = useState<InsightsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function analyze() {
    if (result) { setOpen(o => !o); return }
    setLoading(true)
    setOpen(true)
    try {
      const res = await fetch('/api/ai/seller-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listings }),
      })
      const data = await res.json()
      if (data.ok) setResult(data.result)
    } catch {}
    setLoading(false)
  }

  if (!listings.length) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.3)', backgroundColor: 'var(--bg-card)' }}>
      <button
        onClick={analyze}
        className="w-full flex items-center justify-between px-5 py-4 font-bold text-sm transition"
        style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(59,130,246,0.1))', color: 'var(--text-primary)' }}
      >
        <span className="flex items-center gap-2">
          🧠 <span>Analiză AI Performanță Anunțuri</span>
          {result && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(139,92,246,0.2)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.4)' }}>
              Scor: {result.overallScore}/100
            </span>
          )}
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 py-3">
              <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analizez performanța anunțurilor...</span>
            </div>
          )}
          {result && (
            <>
              {result.topTip && (
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#A78BFA' }}>🎯 Sfatul zilei</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{result.topTip}</p>
                </div>
              )}
              {result.insights.map((insight, i) => {
                const s = TYPE_STYLE[insight.type]
                return (
                  <div key={i} className="rounded-xl px-4 py-3" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <p className="text-xs font-bold uppercase mb-0.5" style={{ color: s.color }}>{s.icon} {insight.listingTitle}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{insight.message}</p>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
