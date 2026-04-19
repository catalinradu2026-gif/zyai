'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { createListing } from '@/lib/actions/listings'
import Image from 'next/image'

const PLATFORMS = [
  { name: 'OLX', domain: 'olx.ro', icon: '🟠' },
  { name: 'AutoVit', domain: 'autovit.ro', icon: '🔵' },
  { name: 'Publi24', domain: 'publi24.ro', icon: '🟢' },
  { name: 'Storia', domain: 'storia.ro', icon: '🏠' },
  { name: 'Altă platformă', domain: '', icon: '🌐' },
]

export default function ImportListingPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scraped, setScraped] = useState<any>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login?redirect=/anunt/importa')
      else setCheckingAuth(false)
    })
  }, [router])

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setScraped(null)

    try {
      const res = await fetch('/api/scrape-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setScraped(data)
    } catch {
      setError('Eroare de rețea. Încearcă din nou.')
    }
    setLoading(false)
  }

  async function handlePublish() {
    if (!scraped) return
    setPublishing(true)
    setPublishError('')

    // Upload photos — max 3 gratuit
    const FREE_PHOTO_LIMIT = 3
    const uploadedImages: string[] = []
    for (const photoUrl of (scraped.photos || []).slice(0, FREE_PHOTO_LIMIT)) {
      try {
        const res = await fetch('/api/upload-from-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: photoUrl }),
        })
        const data = await res.json()
        if (data.url) uploadedImages.push(data.url)
      } catch { /* skip */ }
    }

    if (uploadedImages.length === 0) {
      setPublishError('Nu am putut descărca nicio poză. Încearcă din nou.')
      setPublishing(false)
      return
    }

    const m = scraped.metadata || {}
    const result = await createListing({
      title: scraped.title,
      description: scraped.description || scraped.title,
      categorySlug: scraped.category,
      categoryName: scraped.category,
      city: scraped.city || 'România',
      price: scraped.price || undefined,
      priceType: 'negociabil',
      currency: scraped.currency || 'EUR',
      images: uploadedImages,
      // Auto
      brand: m.brand,
      model: m.model,
      year: m.year,
      mileage: m.mileage,
      fuelType: m.fuelType,
      gearbox: m.gearbox,
      power: m.power,
      // Toți parametrii (imobiliare, electronice, etc.)
      extraMetadata: { ...m, sourceUrl: scraped.sourceUrl },
    })

    if (result.error) { setPublishError(result.error); setPublishing(false); return }
    router.push(`/anunt/${result.id}`)
  }

  const inputStyle = {
    background: 'var(--bg-input)', color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)', borderRadius: '12px',
    padding: '12px 16px', width: '100%', fontSize: '16px',
  }

  if (checkingAuth) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="animate-pulse text-lg" style={{ color: 'var(--text-secondary)' }}>Se verifică contul...</div>
    </main>
  )

  return (
    <main className="min-h-screen py-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🔗</div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Importă anunțul tău</h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Lipește linkul anunțului de pe altă platformă și îl publicăm automat pe zyAI
          </p>
        </div>

        {/* Platforms */}
        <div className="flex flex-wrap gap-2 justify-center">
          {PLATFORMS.map(p => (
            <span key={p.name} className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              {p.icon} {p.name}
            </span>
          ))}
        </div>

        {/* URL Input */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <form onSubmit={handleScrape} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Link anunț
              </label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://www.olx.ro/d/oferta/..."
                style={inputStyle}
                disabled={loading}
              />
            </div>
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}>
                ❌ {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full py-3 rounded-xl font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
            >
              {loading ? '⏳ Se citesc datele...' : '🔍 Citește anunțul'}
            </button>
          </form>
        </div>

        {/* Scraped Preview */}
        {scraped && (
          <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Anunț citit de pe {scraped.platform}
              </h2>
            </div>

            {/* Photos preview */}
            {scraped.photos?.length > 0 && (
              <div className="space-y-2">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {scraped.photos.slice(0, 3).map((p: string, i: number) => (
                    <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden"
                      style={{ border: '1px solid var(--border-subtle)' }}>
                      <Image src={p} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ))}
                  {scraped.photos.length > 3 && (
                    <div className="flex-shrink-0 w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1"
                      style={{ background: 'rgba(139,92,246,0.1)', border: '1px dashed rgba(139,92,246,0.4)', color: '#a78bfa' }}>
                      <span className="text-lg">🔒</span>
                      <span className="text-xs font-bold">+{scraped.photos.length - 3}</span>
                    </div>
                  )}
                </div>
                {scraped.photos.length > 3 && (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    📸 {scraped.photos.length} poze găsite — se publică primele 3 gratuit. Upgrade pentru toate.
                  </p>
                )}
              </div>
            )}

            {/* Details */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Titlu</span>
                <p className="font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{scraped.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {scraped.price && (
                  <div>
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Preț</span>
                    <p className="font-bold text-green-500 mt-0.5">{scraped.price.toLocaleString('ro-RO')} {scraped.currency}</p>
                  </div>
                )}
                {scraped.city && (
                  <div>
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Oraș</span>
                    <p className="mt-0.5" style={{ color: 'var(--text-primary)' }}>📍 {scraped.city}</p>
                  </div>
                )}
                {scraped.category && (
                  <div>
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Categorie</span>
                    <p className="mt-0.5" style={{ color: 'var(--text-primary)' }}>{scraped.category}</p>
                  </div>
                )}
              </div>

              {/* Metadata (auto params etc.) */}
              {Object.keys(scraped.metadata || {}).filter(k => scraped.metadata[k]).length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Detalii</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {Object.entries(scraped.metadata).filter(([, v]) => v).map(([k, v]) => (
                      <span key={k} className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                        {k}: {v as string}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {scraped.description && (
                <div>
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Descriere</span>
                  <p className="text-sm mt-0.5 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{scraped.description}</p>
                </div>
              )}
            </div>

            {publishError && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}>
                ❌ {publishError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setScraped(null); setUrl('') }}
                className="flex-1 py-3 rounded-xl font-semibold transition"
                style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                ← Înapoi
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-2 flex-1 py-3 rounded-xl font-bold text-white transition hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
              >
                {publishing ? '⏳ Se publică...' : '🚀 Publică pe zyAI'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
