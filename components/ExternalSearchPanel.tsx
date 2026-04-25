'use client'

import { useState, useEffect } from 'react'

type AIListing = {
  id: string
  title: string
  price: string
  platform: string
  platformEmoji: string
  platformUrl: string
  specs: string[]
  matchScore: number
  aiReason: string
  location: string
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

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? '#10b981' : score >= 80 ? '#3b82f6' : '#f59e0b'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, color, minWidth: '32px' }}>{score}%</span>
    </div>
  )
}

function ListingCard({ listing, index }: { listing: AIListing; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={listing.platformUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        textDecoration: 'none',
        borderRadius: '14px',
        border: `1px solid ${hovered ? 'rgba(139,92,246,0.5)' : 'var(--border-subtle)'}`,
        background: hovered ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
        padding: '14px',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        {/* Rank */}
        <div style={{
          minWidth: '28px', height: '28px', borderRadius: '50%',
          background: index < 3 ? 'linear-gradient(135deg,#8B5CF6,#3B82F6)' : 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 800,
          color: index < 3 ? 'white' : 'var(--text-secondary)',
          flexShrink: 0,
        }}>
          {index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Platform badge - vizibil ca titlu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
            <span style={{
              fontSize: '12px', fontWeight: 800,
              padding: '2px 10px', borderRadius: '20px',
              background: 'rgba(139,92,246,0.18)',
              border: '1px solid rgba(139,92,246,0.35)',
              color: '#c4b5fd',
              letterSpacing: '0.3px',
            }}>
              {listing.platformEmoji} {listing.platform}
            </span>
          </div>
          {/* Title */}
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.3 }}>{listing.title}</span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              fontSize: '16px', fontWeight: 900,
              background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {listing.price}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
              📍 {listing.location}
            </span>
          </div>

          {/* Specs chips */}
          {listing.specs.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
              {listing.specs.map((spec, i) => (
                <span key={i} style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}>
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Match score */}
          <ScoreBar score={listing.matchScore} />

          {/* AI reason + platform */}
          <div style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: '#8B5CF6', fontStyle: 'italic' }}>
              💡 {listing.aiReason}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <span style={{ color: hovered ? '#8B5CF6' : 'var(--text-secondary)', fontSize: '16px', flexShrink: 0, transition: 'color 0.2s' }}>→</span>
      </div>
    </a>
  )
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [allResults, setAllResults] = useState<AIListing[]>([])
  const [batch, setBatch] = useState(0)
  const [stickyVisible, setStickyVisible] = useState(true)

  // Ascunde sticky când panoul e deschis
  useEffect(() => {
    setStickyVisible(!open)
  }, [open])

  const categoryLabel =
    filters.categoryId === 3 ? 'Auto' :
    filters.categoryId === 2 ? 'Imobiliare' :
    filters.categoryId === 5 ? 'Electronice & Telefoane' :
    'toate platformele'

  async function doSearch(batchNum: number, isMore: boolean) {
    if (isMore) setLoadingMore(true)
    else { setLoading(true); setOpen(true) }

    try {
      const res = await fetch('/api/ai/external-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters, batch: batchNum }),
      })
      const data = await res.json()
      if (data.results) {
        if (isMore) {
          setAllResults(prev => [...prev, ...data.results])
        } else {
          setAllResults(data.results)
        }
        setBatch(batchNum + 1)
      }
    } catch {}

    if (isMore) setLoadingMore(false)
    else setLoading(false)
  }

  return (
    <>
      {/* ── STICKY BOTTOM BAR (mobil) / inline (desktop) ── */}
      {!open && (
        <>
          {/* Desktop: inline după rezultate */}
          <div
            className="hidden sm:block"
            style={{ marginTop: '32px' }}
          >
            <button
              onClick={() => doSearch(0, false)}
              style={{
                width: '100%',
                padding: '18px 24px',
                borderRadius: '16px',
                border: '1.5px dashed rgba(139,92,246,0.5)',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '24px' }}>🌐</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '15px' }}>
                  Caută pe OLX, Autovit, Imobiliare.ro și alte platforme
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                  AI găsește 10 anunțuri reale pentru "{query}"
                </div>
              </div>
              <span style={{
                background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)',
                color: 'white', fontSize: '11px', fontWeight: 700,
                padding: '4px 10px', borderRadius: '20px', marginLeft: 'auto',
              }}>
                AI
              </span>
            </button>
          </div>

          {/* Mobil: sticky bottom */}
          {stickyVisible && (
            <div
              className="sm:hidden"
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                zIndex: 100,
                padding: '12px 16px',
                paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                background: 'rgba(10,10,20,0.95)',
                borderTop: '1px solid rgba(139,92,246,0.3)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <button
                onClick={() => doSearch(0, false)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 24px rgba(139,92,246,0.4)',
                }}
              >
                <span style={{ fontSize: '20px' }}>🌐</span>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '15px' }}>
                  Caută pe toate platformele
                </span>
                <span style={{
                  background: 'rgba(255,255,255,0.25)',
                  color: 'white', fontSize: '11px', fontWeight: 700,
                  padding: '3px 8px', borderRadius: '20px',
                }}>
                  {categoryLabel}
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── PANOU REZULTATE ── */}
      {open && (
        <div style={{ marginTop: '32px', marginBottom: '80px' }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '18px', margin: 0 }}>
                🌐 Rezultate externe AI
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
                {allResults.length} anunțuri găsite pe platformele românești pentru{' '}
                <span style={{ color: '#8B5CF6', fontWeight: 700 }}>"{query}"</span>
              </p>
            </div>
            <button
              onClick={() => { setOpen(false); setAllResults([]); setBatch(0) }}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                padding: '6px 12px', borderRadius: '8px', fontSize: '13px',
              }}
            >
              ✕ Închide
            </button>
          </div>

          {/* Loading initial */}
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                border: '3px solid rgba(139,92,246,0.2)',
                borderTopColor: '#8B5CF6',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>
                🤖 AI caută pe platformele românești...
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Autovit · OLX · Imobiliare.ro · AutoScout24 · Storia
              </p>
            </div>
          ) : (
            <>
              {/* Grid rezultate */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allResults.map((listing, i) => (
                  <ListingCard key={listing.id} listing={listing} index={i % 10} />
                ))}
              </div>

              {/* Buton încă 10 */}
              <div style={{ marginTop: '20px' }}>
                {loadingMore ? (
                  <div style={{
                    padding: '20px', textAlign: 'center',
                    borderRadius: '14px', border: '1px dashed rgba(139,92,246,0.3)',
                    background: 'rgba(139,92,246,0.05)',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      border: '3px solid rgba(139,92,246,0.2)',
                      borderTopColor: '#8B5CF6',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto 10px',
                    }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                      AI caută încă 10 anunțuri...
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => doSearch(batch, true)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '14px',
                      border: '1.5px dashed rgba(139,92,246,0.4)',
                      background: 'rgba(139,92,246,0.06)',
                      cursor: 'pointer',
                      color: '#a78bfa',
                      fontWeight: 700,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🔄</span>
                    Încă 10 anunțuri noi ({allResults.length} găsite până acum)
                    <span style={{
                      background: 'rgba(139,92,246,0.3)', color: '#c4b5fd',
                      fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px',
                    }}>
                      Batch {batch + 1}
                    </span>
                  </button>
                )}
              </div>

              {/* Info footer */}
              <p style={{
                textAlign: 'center', color: 'var(--text-secondary)',
                fontSize: '11px', marginTop: '16px', lineHeight: 1.5,
              }}>
                ℹ️ Rezultatele sunt generate de AI pe baza cunoștințelor despre piața românească.
                Dă click pe orice anunț pentru a vedea oferte reale pe platformă.
              </p>
            </>
          )}
        </div>
      )}
    </>
  )
}
