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

const inputStyle = {
  background: 'var(--bg-input)', color: 'var(--text-primary)',
  border: '1px solid var(--border-subtle)', borderRadius: '10px',
  padding: '10px 14px', width: '100%', fontSize: '15px',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
      <option value="">— selectează —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function ImportListingPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [url, setUrl] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scraped, setScraped] = useState<any>(null)
  const [meta, setMeta] = useState<Record<string, string>>({})
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login?redirect=/anunt/importa'); return }
      const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single()
      if (profile?.phone) setPhone(profile.phone)
      setCheckingAuth(false)
    })
  }, [router])

  function setM(key: string, val: string) {
    setMeta(prev => ({ ...prev, [key]: val }))
  }

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setScraped(null)
    setMeta({})

    try {
      const res = await fetch('/api/scrape-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setScraped(data)
      setMeta(data.metadata || {})
    } catch {
      setError('Eroare de rețea. Încearcă din nou.')
    }
    setLoading(false)
  }

  async function handlePublish() {
    if (!scraped) return
    setPublishing(true)
    setPublishError('')

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

    const catSlug = scraped.subcategory ? `${scraped.category}/${scraped.subcategory}` : scraped.category
    const result = await createListing({
      title: scraped.title,
      description: scraped.description || scraped.title,
      categorySlug: catSlug,
      categoryName: scraped.subcategory || scraped.category,
      city: scraped.city || 'România',
      price: scraped.price || undefined,
      priceType: 'negociabil',
      currency: scraped.currency || 'EUR',
      images: uploadedImages,
      brand: meta.brand,
      model: meta.model,
      year: meta.year,
      mileage: meta.mileage || meta.rulaj_pana,
      fuelType: meta.fuelType || meta.petrol,
      gearbox: meta.gearbox,
      power: meta.power || meta.engine_power,
      contactPhone: phone.trim() || undefined,
      extraMetadata: { ...meta, sourceUrl: scraped.sourceUrl },
    })

    if (result.error) { setPublishError(result.error); setPublishing(false); return }
    router.push(`/anunt/${result.id}`)
  }

  if (checkingAuth) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="animate-pulse text-lg" style={{ color: 'var(--text-secondary)' }}>Se verifică contul...</div>
    </main>
  )

  const category = scraped?.category || ''
  const subcategory = scraped?.subcategory || ''
  const isAuto = category === 'auto'
  const isImob = category === 'imobiliare'

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

        {/* URL + Phone Input */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <form onSubmit={handleScrape} className="space-y-4">
            <Field label="Link anunț">
              <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://www.olx.ro/d/oferta/..." style={inputStyle} disabled={loading} />
            </Field>
            <Field label="Număr de telefon">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="07xxxxxxxx" style={inputStyle} disabled={loading} />
            </Field>
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}>
                ❌ {error}
              </div>
            )}
            <button type="submit" disabled={loading || !url.trim()}
              className="w-full py-3 rounded-xl font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
              {loading ? '⏳ Se citesc datele...' : '🔍 Citește anunțul'}
            </button>
          </form>
        </div>

        {/* Scraped Preview */}
        {scraped && (
          <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xl">✓</span>
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                  Anunț citit de pe {scraped.platform}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                  {scraped.category}
                </span>
                {scraped.subcategory && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                    {scraped.subcategory}
                  </span>
                )}
              </div>
            </div>

            {/* Photos */}
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
                    📸 {scraped.photos.length} poze găsite — se publică primele 3 gratuit.
                  </p>
                )}
              </div>
            )}

            {/* Title + price + city */}
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
              </div>
              {scraped.description && (
                <div>
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Descriere</span>
                  <p className="text-sm mt-0.5 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{scraped.description}</p>
                </div>
              )}
            </div>

            {/* ── AUTO filters ── */}
            {isAuto && (
              <div className="space-y-3 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>🚗 Detalii vehicul</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Marcă">
                    <input type="text" value={meta.brand || ''} onChange={e => setM('brand', e.target.value)} placeholder="ex: VW" style={inputStyle} />
                  </Field>
                  <Field label="Model">
                    <input type="text" value={meta.model || ''} onChange={e => setM('model', e.target.value)} placeholder="ex: Golf" style={inputStyle} />
                  </Field>
                  <Field label="An fabricație">
                    <input type="text" value={meta.year || ''} onChange={e => setM('year', e.target.value)} placeholder="ex: 2018" style={inputStyle} />
                  </Field>
                  <Field label="Rulaj (km)">
                    <input type="text" value={meta.mileage || meta.rulaj_pana || ''} onChange={e => setM('mileage', e.target.value)} placeholder="ex: 150000" style={inputStyle} />
                  </Field>
                  <Field label="Combustibil">
                    <Select value={meta.fuelType || meta.petrol || ''} onChange={v => setM('fuelType', v)}
                      options={['Benzina', 'Diesel', 'Hibrid', 'Electric', 'GPL', 'Benzina+GPL']} />
                  </Field>
                  <Field label="Cutie viteze">
                    <Select value={meta.gearbox || ''} onChange={v => setM('gearbox', v)}
                      options={['Manuala', 'Automata']} />
                  </Field>
                  <Field label="Putere (CP)">
                    <input type="text" value={meta.power || meta.engine_power || ''} onChange={e => setM('power', e.target.value)} placeholder="ex: 150" style={inputStyle} />
                  </Field>
                  <Field label="Caroserie">
                    <Select value={meta.car_body || meta.bodyType || ''} onChange={v => setM('car_body', v)}
                      options={['Berlina', 'Break', 'SUV', 'Coupe', 'Cabrio', 'Monovolum', 'Pickup', 'Utilitara', 'Hatchback']} />
                  </Field>
                  <Field label="Stare">
                    <Select value={meta.state || meta.condition || ''} onChange={v => setM('state', v)}
                      options={['Utilizat', 'Nou']} />
                  </Field>
                  <Field label="Culoare">
                    <input type="text" value={meta.color || ''} onChange={e => setM('color', e.target.value)} placeholder="ex: Negru" style={inputStyle} />
                  </Field>
                </div>
              </div>
            )}

            {/* ── IMOBILIARE filters ── */}
            {isImob && (
              <div className="space-y-3 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>🏠 Detalii proprietate</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tip tranzacție">
                    <Select value={meta.tipTranzactie || ''} onChange={v => setM('tipTranzactie', v)}
                      options={['Vanzare', 'Inchiriere']} />
                  </Field>
                  <Field label="Tip imobil">
                    <Select value={meta.tipImobil || ''} onChange={v => setM('tipImobil', v)}
                      options={['Apartament', 'Casa', 'Vila', 'Garsoniera', 'Teren', 'Spatiu comercial', 'Birou', 'Depozit']} />
                  </Field>
                  <Field label="Nr. camere">
                    <Select value={meta.nrCamere || ''} onChange={v => setM('nrCamere', v)}
                      options={['1', '2', '3', '4', '5+']} />
                  </Field>
                  <Field label="Suprafață (mp)">
                    <input type="text" value={meta.suprafata || ''} onChange={e => setM('suprafata', e.target.value)} placeholder="ex: 65" style={inputStyle} />
                  </Field>
                  <Field label="Etaj">
                    <input type="text" value={meta.etaj || ''} onChange={e => setM('etaj', e.target.value)} placeholder="ex: 3" style={inputStyle} />
                  </Field>
                  <Field label="An construcție">
                    <input type="text" value={meta.anConstructie || ''} onChange={e => setM('anConstructie', e.target.value)} placeholder="ex: 1995" style={inputStyle} />
                  </Field>
                  <Field label="Compartimentare">
                    <Select value={meta.compartimentare || ''} onChange={v => setM('compartimentare', v)}
                      options={['Decomandat', 'Semidecomandat', 'Nedecomandat', 'Circular']} />
                  </Field>
                  <Field label="Confort">
                    <Select value={meta.confort || ''} onChange={v => setM('confort', v)}
                      options={['Confort 1', 'Confort 2', 'Confort 3', 'Lux']} />
                  </Field>
                </div>
              </div>
            )}

            {publishError && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}>
                ❌ {publishError}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setScraped(null); setUrl(''); setMeta({}) }}
                className="flex-1 py-3 rounded-xl font-semibold transition"
                style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                ← Înapoi
              </button>
              <button onClick={handlePublish} disabled={publishing}
                className="flex-2 flex-1 py-3 rounded-xl font-bold text-white transition hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
                {publishing ? '⏳ Se publică...' : '🚀 Publică pe zyAI'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
