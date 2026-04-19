'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Autodidact: citește corecțiile salvate local
function loadCorrections(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('zyai_voice_corrections') || '{}') } catch { return {} }
}

// Autodidact: salvează o corecție (ce a zis → ce era corect)
export function saveCorrection(wrong: string, right: string) {
  try {
    const c = loadCorrections()
    c[wrong.toLowerCase()] = right
    localStorage.setItem('zyai_voice_corrections', JSON.stringify(c))
  } catch {}
}

async function smartNavigate(query: string, router: any) {
  try {
    const corrections = loadCorrections()
    const res = await fetch('/api/ai/smart-filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, corrections }),
    })
    const data = await res.json()
    if (data.redirectUrl) {
      router.push(data.redirectUrl)
      return data
    }
  } catch {}
  // Fallback
  router.push(`/cauta?q=${encodeURIComponent(query)}`)
  return null
}

export default function HeroSearch({ suggestions = [] }: { suggestions?: string[] }) {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)
  const [listening, setListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [aiSummary, setAiSummary] = useState('')
  const recognitionRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Cleanup la unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  function saveSearch(term: string) {
    try {
      const prev: string[] = JSON.parse(localStorage.getItem('zyai_searches') || '[]')
      const updated = [term, ...prev.filter((s) => s !== term)].slice(0, 20)
      localStorage.setItem('zyai_searches', JSON.stringify(updated))
    } catch {}
  }

  async function navigate(query: string, useSmartFilter = false) {
    const q = query.trim()
    if (!q) return
    saveSearch(q)
    if (useSmartFilter) {
      setProcessing(true)
      const data = await smartNavigate(q, router)
      if (data?.summary) setAiSummary(data.summary)
      setProcessing(false)
    } else {
      router.push(`/cauta?q=${encodeURIComponent(q)}`)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(search, true)
  }

  function handleExampleClick(example: string) {
    navigate(example, true)
  }

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Browserul tău nu suportă recunoașterea vocală. Încearcă Chrome sau Edge.')
      return
    }

    // Dacă deja ascultăm, oprim
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      setInterimText('')
      return
    }

    // Deblocăm un audio element global sincron la tap (user gesture) — persistă după router.push
    const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
    if (!(window as any).__zyaiAudio) {
      (window as any).__zyaiAudio = new Audio()
    }
    const audio = (window as any).__zyaiAudio as HTMLAudioElement
    audio.src = SILENT_WAV
    audio.play().catch(() => {})

    const rec = new SpeechRecognition()
    rec.lang = 'ro-RO'
    rec.continuous = false
    rec.interimResults = true
    recognitionRef.current = rec

    // Păstrăm ultimul text recunoscut (final SAU interim) — fallback pentru mobile
    let capturedText = ''

    rec.onstart = () => {
      setListening(true)
      setInterimText('')
      capturedText = ''
    }

    rec.onresult = (e: any) => {
      // Colectăm tot ce a spus utilizatorul (indiferent de isFinal)
      let text = ''
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript
      }
      capturedText = text
      setInterimText(text)
    }

    rec.onerror = (e: any) => {
      setListening(false)
      setInterimText('')
      capturedText = ''
      if (e.error === 'not-allowed') {
        alert('Accesul la microfon a fost blocat. Verifică permisiunile browserului.')
      }
    }

    // onend se declanșează MEREU când recunoașterea se oprește — mai fiabil decât isFinal
    rec.onend = () => {
      setListening(false)
      setInterimText('')
      if (capturedText.trim()) {
        saveSearch(capturedText.trim())
        // Smart filter: AI parsează intentia + redirectează cu filtre
        setProcessing(true)
        setAiSummary('')
        smartNavigate(capturedText.trim(), router).then((data) => {
          if (data?.summary) setAiSummary(data.summary)
          setProcessing(false)
        })
      }
    }

    rec.start()
  }

  const displayValue = listening && interimText ? interimText : (processing ? '⚡ AI procesează...' : search)

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
        {/* Container pill */}
        <div
          className="flex items-center gap-0 transition-all duration-300"
          style={{
            background: 'var(--bg-input, rgba(15,22,41,0.9))',
            border: `2px solid ${listening ? '#ef4444' : processing ? '#8B5CF6' : focused ? 'var(--purple, #8B5CF6)' : 'var(--border-subtle, rgba(139,92,246,0.25))'}`,
            borderRadius: '999px',
            boxShadow: listening
              ? '0 0 0 4px rgba(239,68,68,0.18), 0 8px 32px rgba(239,68,68,0.12)'
              : focused
              ? '0 0 0 4px rgba(139,92,246,0.15), 0 8px 32px rgba(139,92,246,0.2)'
              : '0 4px 24px rgba(0,0,0,0.25)',
            transition: 'all 0.25s ease',
            overflow: 'hidden',
          }}
        >
          {/* Icona search */}
          <span
            className="flex-shrink-0 pl-5 pr-2 text-xl"
            style={{ color: focused || listening ? 'var(--purple, #8B5CF6)' : 'rgba(148,163,184,0.5)' }}
          >
            🔍
          </span>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={(e) => {
              if (!listening) setSearch(e.target.value)
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={listening ? '🎤 Te ascult...' : processing ? '⚡ AI procesează...' : 'Caută apartament, mașină, job...'}
            className="flex-1 py-4 text-base md:text-lg bg-transparent outline-none"
            style={{
              color: listening ? '#ef4444' : processing ? '#a78bfa' : 'var(--text-primary, #F8FAFC)',
              caretColor: listening ? '#ef4444' : 'var(--purple, #8B5CF6)',
              minWidth: 0,
            }}
            readOnly={listening || processing}
          />

          {/* Buton microfon */}
          <button
            type="button"
            onClick={startListening}
            className="flex-shrink-0 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 mx-2"
            title={listening ? 'Oprește microfonul' : 'Caută cu vocea (ro-RO)'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: listening
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'rgba(139,92,246,0.15)',
              border: `1.5px solid ${listening ? 'rgba(239,68,68,0.7)' : 'rgba(139,92,246,0.3)'}`,
              boxShadow: listening ? '0 0 16px rgba(239,68,68,0.5)' : 'none',
              animation: listening ? 'micPulseHero 1s ease-in-out infinite' : 'none',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            🎤
          </button>

          {/* Buton submit */}
          <button
            type="submit"
            className="flex-shrink-0 flex items-center gap-2 font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              padding: '10px 20px',
              borderRadius: '999px',
              margin: '4px',
              fontSize: '15px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
            }}
          >
            <span className="hidden sm:inline">Caută</span>
            <span className="sm:hidden">→</span>
          </button>
        </div>

        {/* Indicator ascultare */}
        {listening && (
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm"
            style={{ color: '#ef4444', whiteSpace: 'nowrap' }}
          >
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'micPulseHero 1s ease-in-out infinite' }} />
            Ascult... vorbește acum
          </div>
        )}
        {/* Indicator AI procesare */}
        {processing && !listening && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm" style={{ color: '#8B5CF6', whiteSpace: 'nowrap' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6', animation: 'micPulseHero 0.6s ease-in-out infinite' }} />
            AI înțelege cererea...
          </div>
        )}
        {/* Summary AI după procesare */}
        {aiSummary && !processing && !listening && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm px-3 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', whiteSpace: 'nowrap', border: '1px solid rgba(139,92,246,0.3)' }}>
            ✨ {aiSummary}
          </div>
        )}
      </form>

      {/* Sugestii */}
      {suggestions.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <span className="text-sm self-center" style={{ color: 'var(--text-secondary)' }}>
            Populare:
          </span>
          {suggestions.map((example) => (
            <button
              key={example}
              onClick={() => handleExampleClick(example)}
              className="px-4 py-1.5 rounded-full text-sm transition-all duration-200 hover:scale-105 glass glass-hover"
              style={{ color: 'var(--text-secondary)' }}
            >
              {example}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes micPulseHero {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  )
}
