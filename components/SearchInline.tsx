'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchInline({ defaultValue = '' }: { defaultValue?: string }) {
  const [search, setSearch] = useState(defaultValue)
  const [focused, setFocused] = useState(false)
  const [listening, setListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    setSearch(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    return () => { recognitionRef.current?.abort() }
  }, [])

  function navigate(query: string) {
    const q = query.trim()
    if (!q) return
    router.push(`/cauta?q=${encodeURIComponent(q)}`)
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
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      setInterimText('')
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = 'ro-RO'
    rec.continuous = false
    rec.interimResults = true
    recognitionRef.current = rec

    rec.onstart = () => { setListening(true); setInterimText('') }
    rec.onresult = (e: any) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      if (interim) setInterimText(interim)
      if (final) {
        setSearch(final)
        setInterimText('')
        setListening(false)
        setTimeout(() => navigate(final), 300)
      }
    }
    rec.onerror = () => { setListening(false); setInterimText('') }
    rec.onend = () => { setListening(false); setInterimText('') }
    rec.start()
  }

  const displayValue = listening && interimText ? interimText : search

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div
        className="flex items-center transition-all duration-200"
        style={{
          background: 'var(--bg-input, rgba(15,22,41,0.9))',
          border: `1.5px solid ${listening ? '#ef4444' : focused ? '#8B5CF6' : 'rgba(139,92,246,0.25)'}`,
          borderRadius: '999px',
          boxShadow: listening
            ? '0 0 0 3px rgba(239,68,68,0.15)'
            : focused
            ? '0 0 0 3px rgba(139,92,246,0.12)'
            : 'none',
          overflow: 'hidden',
        }}
      >
        <span className="pl-4 pr-2 text-base flex-shrink-0" style={{ color: focused || listening ? '#8B5CF6' : 'rgba(148,163,184,0.5)' }}>
          🔍
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={(e) => { if (!listening) setSearch(e.target.value) }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={listening ? '🎤 Te ascult...' : 'Caută din nou...'}
          className="flex-1 py-3 text-sm bg-transparent outline-none"
          style={{
            color: listening ? '#ef4444' : 'var(--text-primary, #F8FAFC)',
            minWidth: 0,
          }}
          readOnly={listening}
        />
        <button
          type="button"
          onClick={startListening}
          className="flex-shrink-0 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 mx-1"
          style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: listening ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'rgba(139,92,246,0.12)',
            border: `1.5px solid ${listening ? 'rgba(239,68,68,0.6)' : 'rgba(139,92,246,0.25)'}`,
            animation: listening ? 'micPulseInline 1s ease-in-out infinite' : 'none',
            fontSize: '14px',
          }}
        >
          🎤
        </button>
        <button
          type="submit"
          className="flex-shrink-0 text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)',
            padding: '8px 16px', borderRadius: '999px', margin: '3px', whiteSpace: 'nowrap',
          }}
        >
          Caută
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
