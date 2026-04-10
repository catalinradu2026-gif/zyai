'use client'

import { useState } from 'react'
import { updateListing } from '@/lib/actions/listings'
import ImageUploader from './ImageUploader'
import { ROMANIAN_CITIES } from '@/lib/constants/cities'

interface EditListingFormProps {
  listing: any
}

const ss = {
  color: 'var(--text-primary)',
  backgroundColor: 'var(--bg-card-hover)',
  border: '1px solid var(--border-subtle)',
}
const ic = 'px-3 py-2.5 rounded-xl text-sm focus:outline-none w-full'
const sc = 'px-3 py-2.5 rounded-xl text-sm focus:outline-none w-full'

const lbl = (text: string) => (
  <label style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {text}
  </label>
)

export default function EditListingForm({ listing }: EditListingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [title, setTitle] = useState(listing.title || '')
  const [description, setDescription] = useState(listing.description || '')
  const [city, setCity] = useState(listing.city || '')
  const [price, setPrice] = useState(listing.price ? String(listing.price) : '')
  const [priceType, setPriceType] = useState(listing.price_type || 'fix')
  const [currency, setCurrency] = useState(listing.currency || 'EUR')
  const [images, setImages] = useState<string[]>(listing.images || [])

  // AI Price Suggestion
  const [aiPriceLoading, setAiPriceLoading] = useState(false)
  const [aiPrice, setAiPrice] = useState<{
    currency: string; min: number; max: number; suggested: number;
    reasoning: string; tips: string[];
  } | null>(null)

  async function suggestPrice() {
    if (!title) return
    setAiPriceLoading(true)
    setAiPrice(null)
    try {
      const res = await fetch('/api/ai/suggest-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, city }),
      })
      const data = await res.json()
      if (data.ok && data.result) setAiPrice(data.result)
    } catch {}
    finally { setAiPriceLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const result = await updateListing(listing.id, {
        title, description, city,
        county: city,
        price: price ? Number(price) : undefined,
        priceType, currency, images,
      })
      if (result.error) {
        setError(result.error)
      } else if (result.id) {
        setSuccess(true)
        setTimeout(() => { window.location.href = `/anunt/${listing.id}` }, 1500)
      }
    } catch {
      setError('Eroare la actualizare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <form onSubmit={handleSubmit} className="space-y-6">

        {error && (
          <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <p className="text-sm font-medium" style={{ color: '#FCA5A5' }}>❌ {error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p className="text-sm font-medium" style={{ color: '#86EFAC' }}>✓ Anunț actualizat! Se redirecționează...</p>
          </div>
        )}

        {/* Titlu */}
        <div>
          {lbl('Titlu *')}
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            required style={ss} className={ic} />
        </div>

        {/* Descriere */}
        <div>
          {lbl('Descriere *')}
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            required rows={6}
            style={{ ...ss, width: '100%', resize: 'vertical' }}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none" />
        </div>

        {/* Imagini */}
        <div>
          {lbl('Imagini (max 8)')}
          <ImageUploader initialImages={images} onImagesChange={setImages} />
        </div>

        {/* Locație */}
        <div>
          {lbl('Oraș *')}
          <select value={city} onChange={e => setCity(e.target.value)} style={ss} className={sc}>
            <option value="">Alege orașul...</option>
            {ROMANIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Preț */}
        <div className="space-y-3">
          {lbl('Preț')}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="0" style={ss} className={ic} />
            </div>
            <div>
              <select value={priceType} onChange={e => setPriceType(e.target.value)} style={ss} className={sc}>
                <option value="fix">Fix</option>
                <option value="negociabil">Negociabil</option>
                <option value="gratuit">Gratuit</option>
              </select>
            </div>
            <div>
              <select value={currency} onChange={e => setCurrency(e.target.value)} style={ss} className={sc}>
                <option value="EUR">EUR</option>
                <option value="RON">RON</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* AI Price Suggestion */}
          {title && (
            <div>
              {!aiPrice && !aiPriceLoading && (
                <button type="button" onClick={suggestPrice}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm transition hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px dashed rgba(139,92,246,0.5)', color: '#A78BFA' }}>
                  🤖 Sugerează preț corect cu AI
                </button>
              )}
              {aiPriceLoading && (
                <div className="py-3 text-center rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <span style={{ color: '#A78BFA', fontSize: '13px' }}>⏳ zyAI calculează prețul corect pentru piața română...</span>
                </div>
              )}
              {aiPrice && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 20px rgba(139,92,246,0.1)' }}>
                  <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)' }}>
                    <span className="text-white text-base">💡</span>
                    <span className="text-white font-bold text-sm">Sugestie preț — piața română 2025</span>
                  </div>
                  <div className="p-4 space-y-3" style={{ background: 'var(--bg-card)' }}>
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Minim</p>
                        <p className="text-lg font-black" style={{ color: '#60A5FA' }}>{aiPrice.min} {aiPrice.currency}</p>
                      </div>
                      <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)' }}>
                        <p className="text-xs mb-1" style={{ color: '#A78BFA' }}>Recomandat</p>
                        <p className="text-2xl font-black price-text">{aiPrice.suggested} {aiPrice.currency}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Maxim</p>
                        <p className="text-lg font-black" style={{ color: '#60A5FA' }}>{aiPrice.max} {aiPrice.currency}</p>
                      </div>
                    </div>
                    <p className="text-xs italic text-center" style={{ color: 'var(--text-secondary)' }}>💬 {aiPrice.reasoning}</p>
                    {aiPrice.tips?.length > 0 && (
                      <div className="space-y-1">
                        {aiPrice.tips.map((tip, i) => (
                          <p key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ color: '#4ADE80' }}>✓</span> {tip}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button type="button"
                        onClick={() => { setPrice(String(aiPrice.suggested)); setCurrency(aiPrice.currency) }}
                        className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition hover:scale-105"
                        style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                        ✓ Folosește {aiPrice.suggested} {aiPrice.currency}
                      </button>
                      <button type="button" onClick={() => setAiPrice(null)}
                        className="px-3 py-2 rounded-lg text-xs transition"
                        style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Butoane */}
        <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <a href={`/anunt/${listing.id}`}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition hover:scale-105"
            style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }}>
            ← Anulare
          </a>
          <div className="flex-1" />
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 text-white font-bold rounded-xl transition hover:scale-105 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
            {loading ? '⏳ Se salvează...' : '✓ Salvează modificări'}
          </button>
        </div>
      </form>
    </div>
  )
}
