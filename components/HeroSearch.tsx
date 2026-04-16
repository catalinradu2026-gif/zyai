'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroSearch({ suggestions = [] }: { suggestions?: string[] }) {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)
  const [listening, setListening] = useState(false)
  const [interimText, setInterimText] = useState('')
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

  function navigate(query: string) {
    const q = query.trim()
    if (!q) return
    saveSearch(q)
    router.push(`/cauta?q=${encodeURIComponent(q)}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(search)
  }

  function handleExampleClick(example: string) {
    navigate(example)
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

    // Deblocăm audio-ul ChatWidget sincron, în contextul gestului utilizatorului (tap pe mic)
    window.dispatchEvent(new Event('unlockChatAudio'))

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
        // Navighează la pagina de căutare (ca înainte) — vocea se aude după ce se încarcă rezultatele
        saveSearch(capturedText.trim())
        router.push(`/cauta?q=${encodeURIComponent(capturedText.trim())}&voice=1`)
      }
    }

    rec.start()
  }

  const displayValue = listening && interimText ? interimText : search

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
        {/* Container pill */}
        <div
          className="flex items-center gap-0 transition-all duration-300"
          style={{
            background: 'var(--bg-input, rgba(15,22,41,0.9))',
            border: `2px solid ${listening ? '#ef4444' : focused ? 'var(--purple, #8B5CF6)' : 'var(--border-subtle, rgba(139,92,246,0.25))'}`,
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
            placeholder={listening ? '🎤 Te ascult...' : 'Caută apartament, mașină, job...'}
            className="flex-1 py-4 text-base md:text-lg bg-transparent outline-none"
            style={{
              color: listening ? '#ef4444' : 'var(--text-primary, #F8FAFC)',
              caretColor: listening ? '#ef4444' : 'var(--purple, #8B5CF6)',
              minWidth: 0,
            }}
            readOnly={listening}
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
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                animation: 'micPulseHero 1s ease-in-out infinite',
              }}
            />
            Ascult... vorbește acum
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
