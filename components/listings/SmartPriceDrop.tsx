'use client'

import { useState } from 'react'
import Link from 'next/link'

type Stalelisting = {
  id: string
  title: string
  price: number
  currency: string
  views: number
  daysSince: number
}

export default function SmartPriceDrop({ staleListings }: { staleListings: Stalelisting[] }) {
  const [dismissed, setDismissed] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Record<string, string>>({})

  const visible = staleListings.filter(l => !dismissed.includes(l.id))
  if (!visible.length) return null

  async function getSuggestion(listing: Stalelisting) {
    setLoading(listing.id)
    try {
      const res = await fetch('/api/ai/seller-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listings: [{ title: listing.title, price: listing.price, views: listing.views, status: 'activ' }] }),
      })
      const data = await res.json()
      if (data.ok && data.result?.topTip) {
        setSuggestions(prev => ({ ...prev, [listing.id]: data.result.topTip }))
      }
    } catch {}
    setLoading(null)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(251,191,36,0.35)', backgroundColor: 'var(--bg-card)' }}>
      <div className="px-5 py-3 flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(234,88,12,0.08))' }}>
        <span>📉</span>
        <p className="text-sm font-bold" style={{ color: '#FBB024' }}>
          {visible.length} anunț{visible.length !== 1 ? 'uri' : ''} fără activitate
        </p>
      </div>
      <div className="p-4 space-y-3">
        {visible.map(l => (
          <div key={l.id} className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{l.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {l.price} {l.currency} · {l.views} vizualizări · {l.daysSince} zile fără contact
                </p>
                {suggestions[l.id] && (
                  <p className="text-xs mt-2 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA' }}>
                    💡 {suggestions[l.id]}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!suggestions[l.id] && (
                  <button
                    onClick={() => getSuggestion(l)}
                    disabled={loading === l.id}
                    className="text-xs px-2.5 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', color: '#fff' }}
                  >
                    {loading === l.id ? '...' : '🤖 Sfat AI'}
                  </button>
                )}
                <Link href={`/anunt/${l.id}/edit`}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-semibold transition"
                  style={{ border: '1px solid rgba(251,191,36,0.4)', color: '#FBB024', background: 'transparent' }}>
                  Editează
                </Link>
                <button
                  onClick={() => setDismissed(d => [...d, l.id])}
                  className="text-xs px-2 py-1.5 rounded-lg transition"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
                >✕</button>
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-center pt-1" style={{ color: 'rgba(167,139,250,0.4)', letterSpacing: '0.05em' }}>⚡ powered by Ai Craiova</p>
      </div>
    </div>
  )
}
