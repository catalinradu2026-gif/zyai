'use client'

import { useEffect, useState } from 'react'

type Listing = {
  id: string
  title: string
  price: number | null
  currency: string
  price_type: string
  city: string
  description: string
  category: string
  source: string
  url?: string
  metadata?: Record<string, any>
}

function renderMarkdown(text: string) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-black mt-4 mb-1" style={{ color: 'var(--text-primary)' }}>{line.slice(4)}</h3>
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-black mt-5 mb-2" style={{ color: 'var(--text-primary)' }}>{line.slice(3)}</h2>
      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-black mt-2 mb-3 gradient-main-text">{line.slice(2)}</h1>
      if (line.startsWith('| ')) {
        const cells = line.split('|').filter(c => c.trim() !== '')
        const isSeparator = cells.every(c => /^[-: ]+$/.test(c))
        if (isSeparator) return null
        const isHeader = i > 0 && text.split('\n')[i - 1]?.startsWith('| ')
        const Tag = isHeader ? 'th' : 'td'
        return (
          <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {cells.map((cell, j) => (
              <Tag key={j} className="px-3 py-2 text-xs" style={{ color: 'var(--text-primary)', background: j === 0 ? 'var(--bg-card-hover)' : 'transparent' }}>
                {cell.trim()}
              </Tag>
            ))}
          </tr>
        )
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={i} className="text-sm ml-4 mb-1" style={{ color: 'var(--text-secondary)', listStyle: 'disc' }}>{line.slice(2)}</li>
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="text-sm font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{line.slice(2, -2)}</p>
      }
      if (line.trim() === '') return <br key={i} />
      return <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{line}</p>
    })
    .filter(Boolean)
}

export default function AICompareReport({ listings }: { listings: Listing[] }) {
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listings }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReport(data.report)
      setGenerated(true)
    } catch (e: any) {
      setError(e.message || 'Eroare la generare raport')
    } finally {
      setLoading(false)
    }
  }

  if (!generated && !loading) {
    return (
      <div className="mt-8 rounded-2xl p-6 text-center"
        style={{ background: 'rgba(139,92,246,0.07)', border: '1px dashed rgba(139,92,246,0.4)' }}>
        <div className="text-4xl mb-3">🤖</div>
        <h3 className="font-black text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Raport complet AI</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          AI analizează prețurile, starea, locația și îți dă o recomandare clară cu scor și sfaturi de negociere.
        </p>
        <button
          onClick={generate}
          className="px-8 py-3 rounded-xl font-bold text-white text-sm transition hover:scale-105"
          style={{ background: 'var(--gradient-main)', boxShadow: 'var(--glow-purple)' }}
        >
          🤖 Generează raport comparație AI
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
          <span style={{ color: 'var(--text-secondary)' }}>AI analizează și compară anunțurile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 rounded-2xl p-5 text-center" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <p className="text-sm" style={{ color: '#f87171' }}>❌ {error}</p>
        <button onClick={generate} className="mt-3 text-xs px-4 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
          Încearcă din nou
        </button>
      </div>
    )
  }

  // Detectăm dacă textul are tabele pentru a le wrapa corect
  const hasTable = report.includes('| ')

  return (
    <div className="mt-8 rounded-2xl p-5 md:p-8 space-y-2"
      style={{ background: 'var(--bg-card)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 30px rgba(139,92,246,0.1)' }}>
      <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <span className="text-2xl">🤖</span>
        <div>
          <p className="font-black text-sm" style={{ color: '#A78BFA' }}>RAPORT COMPARAȚIE AI</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Generat de zyAI • imparțial și obiectiv</p>
        </div>
        <button
          onClick={generate}
          className="ml-auto text-xs px-3 py-1.5 rounded-lg transition"
          style={{ border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA', background: 'rgba(139,92,246,0.1)' }}
        >
          🔄 Regenerează
        </button>
      </div>

      {hasTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left rounded-xl overflow-hidden" style={{ borderCollapse: 'collapse', border: '1px solid var(--border-subtle)' }}>
            <tbody>{renderMarkdown(report)}</tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-1">{renderMarkdown(report)}</div>
      )}
    </div>
  )
}
