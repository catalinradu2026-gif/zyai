'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function loadCorrections(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('zyai_voice_corrections') || '{}') } catch { return {} }
}

async function smartNavigate(query: string, router: any): Promise<string | null> {
  try {
    const corrections = loadCorrections()
    const res = await fetch('/api/ai/smart-filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, corrections }),
    })
    const data = await res.json()
    if (data.redirectUrl) { router.push(data.redirectUrl); return data.summary || null }
  } catch {}
  router.push(`/cauta?q=${encodeURIComponent(query)}`)
  return null
}

export default function SearchInline({ defaultValue = '' }: { defaultValue?: string }) {
  const [search, setSearch] = useState(defaultValue)
  const [focused, setFocused] = useState(false)
  const [listening, setListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [aiSummary, setAiSummary] = useState('')
  const recognitionRef = useRef<any>(null)
  const router = useRouter()

  useEffect(() => { setSearch(defaultValue) }, [defaultValue])
  useEffect(() => { return () => { recognitionRef.current?.abort() } }, [])

  async function navigate(query: string) {
    const q = query.trim()
    if (!q) return
    setProcessing(true)
    setAiSummary('')
    const summary = await smartNavigate(q, router)
    if (summary) setAiSummary(summary)
    setProcessing(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(search)
  }

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Browserul tău nu suportă recunoașterea vocală. Încearcă Chrome sau Edge.')
      return
    }
    if (listening) { recognitionRef.current?.stop(); setListening(false); setInterimText(''); return }

    const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
    if (!(window as any).__zyaiAudio) (window as any).__zyaiAudio = new Audio()
    const audio = (window as any).__zyaiAudio as HTMLAudioElement
    audio.src = SILENT_WAV
    audio.play().catch(() => {})

    const rec = new SpeechRecognition()
    rec.lang = 'ro-RO'
    rec.continuous = false
    rec.interimResults = true
    recognitionRef.current = rec

    let capturedText = ''
    rec.onstart = () => { setListening(true); setInterimText(''); capturedText = '' }
    rec.onresult = (e: any) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript
      capturedText = text
      setInterimText(text)
    }
    rec.onerror = () => { setListening(false); setInterimText(''); capturedText = '' }
    rec.onend = () => {
      setListening(false)
      setInterimText('')
      if (capturedText.trim()) {
        setProcessing(true)
        setAiSummary('')
        smartNavigate(capturedText.trim(), router).then((s) => {
          if (s) setAiSummary(s)
          setProcessing(false)
        })
      }
    }
    rec.start()
  }

  const displayValue = listening && interimText ? interimText : search

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div
        className="flex items-center transition-all duration-200"
        style={{
          background: 'var(--bg-input, rgba(15,22,41,0.9))',
          border: `1.5px solid ${listening ? '#ef4444' : processing ? '#8B5CF6' : focused ? '#8B5CF6' : 'rgba(139,92,246,0.25)'}`,
          borderRadius: '999px',
          boxShadow: listening
            ? '0 0 0 3px rgba(239,68,68,0.15)'
            : processing
            ? '0 0 0 3px rgba(139,92,246,0.2)'
            : focused
            ? '0 0 0 3px rgba(139,92,246,0.12)'
            : 'none',
          overflow: 'hidden',
        }}
      >
        <span className="pl-4 pr-2 text-base flex-shrink-0" style={{ color: focused || listening || processing ? '#8B5CF6' : 'rgba(148,163,184,0.5)' }}>
          {processing ? '⚡' : '🔍'}
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={(e) => { if (!listening && !processing) setSearch(e.target.value) }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={listening ? '🎤 Te ascult...' : processing ? 'AI procesează...' : 'Caută din nou...'}
          className="flex-1 py-3 text-sm bg-transparent outline-none"
          style={{ color: listening ? '#ef4444' : processing ? '#a78bfa' : 'var(--text-primary, #F8FAFC)', minWidth: 0 }}
          readOnly={listening || processing}
        />
        {aiSummary && !processing && !listening && (
          <span className="text-xs px-2 flex-shrink-0" style={{ color: '#a78bfa' }}>✨ {aiSummary}</span>
        )}
        <button
          type="button"
          onClick={startListening}
          disabled={processing}
          className="flex-shrink-0 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 mx-1"
          style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: listening ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'rgba(139,92,246,0.12)',
            border: `1.5px solid ${listening ? 'rgba(239,68,68,0.6)' : 'rgba(139,92,246,0.25)'}`,
            animation: listening ? 'micPulseInline 1s ease-in-out infinite' : 'none',
            fontSize: '14px', opacity: processing ? 0.5 : 1,
          }}
        >
          🎤
        </button>
        <button
          type="submit"
          disabled={processing}
          className="flex-shrink-0 text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)',
            padding: '8px 16px', borderRadius: '999px', margin: '3px', whiteSpace: 'nowrap',
            opacity: processing ? 0.6 : 1,
          }}
        >
          {processing ? '...' : 'Caută'}
        </button>
      </div>
      <style>{`
        @keyframes micPulseInline {
          0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5);}
          50%{box-shadow:0 0 0 6px rgba(239,68,68,0);}
        }
      `}</style>
    </form>
  )
}
