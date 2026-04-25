'use client'

import { useState } from 'react'

type ExternalResult = {
  platform: string
  emoji: string
  url: string
  tagline: string
  aiNote: string
}

type ParsedFilters = {
  categoryId: number | null
  brand: string | null
  model: string | null
  maxPrice: number | null
  minPrice: number | null
  city: string | null
  subcategory: string | null
  nrCamere: string | null
  keyword: string
}

export default function ExternalSearchPanel({
  query,
  filters,
}: {
  query: string
  filters: ParsedFilters
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ExternalResult[]>([])
  const [searched, setSearched] = useState(false)

  async function fetchExternal() {
    setLoading(true)
    setOpen(true)
    try {
      const res = await fetch('/api/ai/external-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters }),
      })
      const data = await res.json()
      if (data.results) setResults(data.results)
    } catch {}
    setLoading(false)
    setSearched(true)
  }

  async function searchAgain() {
    setResults([])
    setSearched(false)
    await fetchExternal()
  }

  const categoryLabel =
    filters.categoryId === 3 ? 'auto' :
    filters.categoryId === 2 ? 'imobiliare' :
    filters.categoryId === 5 ? 'electronice' :
    'toate categoriile'

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Buton principal */}
      {!open && (
        <button
          onClick={fetchExternal}
          style={{
            width: '100%',
            padding: '16px 24px',
            borderRadius: '16px',
            border: '1.5px dashed rgba(139,92,246,0.5)',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#8B5CF6'; (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.5)'; (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))' }}
        >
          <span style={{ fontSize: '22px' }}>🌐</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>
            Caută pe toate platformele românești de {categoryLabel}
          </span>
          <span style={{
            background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)',
            color: 'white',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '20px',
            letterSpacing: '0.5px',
          }}>AI</span>
        </button>
      )}

      {/* Panou rezultate externe */}
      {open && (
        <div style={{
          borderRadius: '20px',
          border: '1px solid rgba(139,92,246,0.3)',
          background: 'var(--bg-card)',
          overflow: 'hidden',
        }}>
          {/* Header panou */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))',
            borderBottom: '1px solid rgba(139,92,246,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🌐</span>
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '15px', margin: 0 }}>
                  Platforme românești — <span style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>"{query}"</span>
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '2px 0 0' }}>
                  Top 5 surse externe selectate de AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '3px solid rgba(139,92,246,0.2)',
                borderTopColor: '#8B5CF6',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 12px',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>AI caută pe platformele din România...</p>
            </div>
          )}

          {/* Rezultate */}
          {!loading && results.length > 0 && (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(139,92,246,0.1)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139,92,246,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-subtle)' }}
                >
                  {/* Rank badge */}
                  <span style={{
                    minWidth: '28px', height: '28px',
                    borderRadius: '50%',
                    background: i === 0 ? 'linear-gradient(135deg,#8B5CF6,#3B82F6)' : 'rgba(255,255,255,0.08)',
                    color: i === 0 ? 'white' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 800,
                  }}>
                    {i + 1}
                  </span>

                  {/* Emoji + info */}
                  <span style={{ fontSize: '24px', minWidth: '30px', textAlign: 'center' }}>{r.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px', margin: 0 }}>{r.platform}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.tagline}</p>
                    <p style={{
                      color: '#8B5CF6', fontSize: '11px', margin: '4px 0 0',
                      fontStyle: 'italic',
                    }}>
                      💡 {r.aiNote}
                    </p>
                  </div>

                  {/* Arrow */}
                  <span style={{ color: 'var(--text-secondary)', fontSize: '18px', marginLeft: 'auto' }}>→</span>
                </a>
              ))}
            </div>
          )}

          {/* Footer */}
          {!loading && searched && (
            <div style={{
              padding: '12px 16px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
                Nu ai găsit ce cauți?
              </p>
              <button
                onClick={searchAgain}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(139,92,246,0.4)',
                  background: 'transparent',
                  color: '#8B5CF6',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                🔄 Caută din nou
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
