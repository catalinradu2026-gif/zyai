'use client'

import { useState } from 'react'

type ScamResult = {
  ok?: boolean
  result?: {
    score?: number
    risk_level?: string
    verdict?: string
    reasons?: string[]
    advice?: string
  }
  error?: string
}

export default function BuyerForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScamResult['result'] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/ai/scam-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: price ? Number(price) : null,
          city,
          category,
          images: [],
        }),
      })
      const data: ScamResult = await res.json()
      if (!res.ok || !data.result) {
        setError(data.error || 'Eroare AI. Încearcă din nou.')
      } else {
        setResult(data.result)
      }
    } catch {
      setError('Conexiune eșuată.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (s?: number) => {
    if (s == null) return '#64748b'
    if (s <= 30) return '#22C55E'
    if (s <= 65) return '#EAB308'
    return '#EF4444'
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Titlu anunț *</label>
          <input
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="ex: BMW 320d 2015, 180.000 km"
            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-white/30 outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Preț (EUR)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="12000"
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-white/30 outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Oraș</label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="București"
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-white/30 outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Categorie</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-white/30 outline-none"
            style={{ color: 'var(--text-primary)' }}
          >
            <option value="auto">Auto</option>
            <option value="imobiliare">Imobiliare</option>
            <option value="electronice">Electronice</option>
            <option value="moda">Modă</option>
            <option value="casa-gradina">Casă & Grădină</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Descriere</label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Copiază descrierea anunțului aici…"
            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-white/30 outline-none resize-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !title}
          className="w-full px-6 py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-transform hover:scale-[1.01]"
          style={{ background: 'linear-gradient(to right,#3B82F6,#6366F1)' }}
        >
          {loading ? 'AI analizează…' : 'Verifică acum →'}
        </button>
      </form>

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white"
              style={{ background: scoreColor(result.score) }}
            >
              {result.score ?? '?'}
            </div>
            <div>
              <div className="text-sm uppercase tracking-wide opacity-70" style={{ color: 'var(--text-secondary)' }}>
                Risc {result.risk_level || '—'}
              </div>
              <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {result.verdict || 'Analiză AI'}
              </div>
            </div>
          </div>
          {result.reasons?.length ? (
            <ul className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {result.reasons.map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
          ) : null}
          {result.advice && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--text-primary)' }}>
              💡 {result.advice}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
