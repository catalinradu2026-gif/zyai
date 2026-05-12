'use client'

import { useState, useRef } from 'react'

type AnalyzeResult = {
  title?: string
  description?: string
  category?: string
  subcategory?: string
  brand?: string | null
  condition?: string
  tags?: string[]
  _visualDescription?: string
}

export default function QuickForm() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null)

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(String(r.result))
      r.onerror = reject
      r.readAsDataURL(file)
    })
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null); setResult(null); setEstimatedPrice(null)
    const dataUrl = await fileToBase64(file)
    setPreview(dataUrl)
    setLoading(true)
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl }),
      })
      const data = await res.json()
      if (!res.ok || !data.result) {
        setError(data.error || 'AI nu a putut analiza poza.')
      } else {
        setResult(data.result)
        // Best-effort price estimate via suggest-price endpoint
        try {
          const p = await fetch('/api/ai/suggest-price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: data.result.title,
              description: data.result.description,
              category: data.result.category,
            }),
          })
          if (p.ok) {
            const pd = await p.json()
            const px = pd.price || pd.suggested || pd.result?.price
            if (px) setEstimatedPrice(String(px))
          }
        } catch { }
      }
    } catch {
      setError('Conexiune eșuată.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setPreview(null); setResult(null); setError(null); setEstimatedPrice(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      {!preview && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full glass rounded-3xl p-10 flex flex-col items-center gap-3 transition-transform hover:scale-[1.01]"
          style={{ border: '2px dashed rgba(34,197,94,0.4)' }}
        >
          <div className="text-5xl">📸</div>
          <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Apasă pentru a face / alege poză
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            JPG / PNG · max 10 MB
          </div>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFile}
      />

      {preview && (
        <div className="glass rounded-2xl p-4">
          <img src={preview} alt="preview" className="w-full rounded-xl mb-3" />
          <button
            type="button"
            onClick={reset}
            className="text-sm underline opacity-70 hover:opacity-100"
            style={{ color: 'var(--text-secondary)' }}
          >
            Altă poză
          </button>
        </div>
      )}

      {loading && (
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            AI analizează poza…
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            ~5-10 secunde
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-70 mb-1" style={{ color: 'var(--text-secondary)' }}>
              Titlu sugerat
            </div>
            <div className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {result.title || '—'}
            </div>
          </div>
          {estimatedPrice && (
            <div>
              <div className="text-xs uppercase tracking-wide opacity-70 mb-1" style={{ color: 'var(--text-secondary)' }}>
                Preț estimat
              </div>
              <div className="text-lg font-bold gradient-main-text">
                {estimatedPrice} RON
              </div>
            </div>
          )}
          <div>
            <div className="text-xs uppercase tracking-wide opacity-70 mb-1" style={{ color: 'var(--text-secondary)' }}>
              Descriere
            </div>
            <p className="text-base whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
              {result.description || result._visualDescription || '—'}
            </p>
          </div>
          {result.category && (
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Categorie: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{result.category}</span>
              {result.condition ? <> · Stare: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{result.condition}</span></> : null}
            </div>
          )}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2">
            <a
              href="/anunt/nou"
              className="flex-1 text-center px-5 py-3 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(to right,#22C55E,#EAB308)' }}
            >
              Publică pe zyAI →
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(`${result.title}\n\n${result.description}`)}
              className="px-5 py-3 rounded-xl font-semibold glass"
              style={{ color: 'var(--text-primary)' }}
            >
              📋 Copiază
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
