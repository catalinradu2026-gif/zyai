'use client'

import { useEffect, useState, useCallback } from 'react'

type ScamResult = {
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
  score: number
  flags: string[]
  summary: string
  tip: string
}

type Props = {
  title: string
  description: string
  price: number | null
  category: string
  city: string
  imageCount: number
}

const RISK_STYLE = {
  LOW: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.3)', color: '#4ADE80', icon: '✅', label: 'RISC SCĂZUT' },
  MEDIUM: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.35)', color: '#FBB024', icon: '⚠️', label: 'RISC MEDIU' },
  HIGH: { bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.35)', color: '#F87171', icon: '🚨', label: 'RISC RIDICAT' },
}

export default function ScamDetectorPanel({ title, description, price, category, city, imageCount }: Props) {
  const [result, setResult] = useState<ScamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(true)

  useEffect(() => { analyze() }, [])

  async function analyze() {
    if (result) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai/scam-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, price, category, city, images: Array(imageCount).fill('') }),
      })
      const data = await res.json()
      if (data.ok) setResult(data.result)
    } catch {}
    setLoading(false)
  }

  const style = result ? RISK_STYLE[result.risk] : null

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
      <button
        onClick={analyze}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition"
        style={{ background: 'rgba(139,92,246,0.08)', color: 'var(--text-primary)' }}
      >
        <span className="flex items-center gap-2">
          🛡️ <span>Verificare Antifrauda AI</span>
          {result && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: style!.bg, border: `1px solid ${style!.border}`, color: style!.color }}>
              {style!.icon} {style!.label}
            </span>
          )}
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 py-2">
              <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analizez anunțul...</span>
            </div>
          )}
          {result && style && (
            <>
              <div className="rounded-xl p-3" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                <p className="font-bold text-sm" style={{ color: style.color }}>{style.icon} {style.label} — {result.score}/100</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{result.summary}</p>
              </div>
              {result.flags.length > 0 && (
                <div>
                  <p className="text-xs uppercase font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Semnale detectate</p>
                  <ul className="space-y-1">
                    {result.flags.map((f, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <span>•</span><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA' }}>
                💡 {result.tip}
              </div>
            </>
          )}
          <p className="text-xs text-center pt-1" style={{ color: 'rgba(167,139,250,0.4)', letterSpacing: '0.05em' }}>⚡ powered by Ai Craiova</p>
        </div>
      )}
    </div>
  )
}
