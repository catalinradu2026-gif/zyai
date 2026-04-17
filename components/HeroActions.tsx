'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function HeroActions() {
  const router = useRouter()
  const [listening, setListening] = useState(false)

  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { router.push('/cauta'); return }

    setListening(true)
    const rec = new SR()
    rec.lang = 'ro-RO'
    rec.continuous = false
    rec.interimResults = false

    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setListening(false)
      router.push(`/cauta?q=${encodeURIComponent(text)}`)
    }
    rec.onerror = () => { setListening(false); router.push('/cauta') }
    rec.onend = () => setListening(false)
    rec.start()
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-3">
      {/* BUTON 1: VINDE CU AI */}
      <Link
        href="/anunt/nou"
        className="flex flex-col items-center justify-center w-full py-5 px-6 rounded-2xl font-black text-xl text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'var(--gradient-main)',
          boxShadow: '0 0 40px rgba(139,92,246,0.5), 0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        <span className="text-2xl mb-1">📸 Vinde cu AI</span>
        <span className="text-sm font-normal opacity-90">Fă o poză → AI creează anunțul</span>
      </Link>

      {/* BUTON 2: SPUNE CE CAUȚI */}
      <button
        onClick={startVoice}
        className="flex flex-col items-center justify-center w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] glass"
        style={{
          border: '1px solid rgba(59,130,246,0.5)',
          boxShadow: listening
            ? '0 0 40px rgba(59,130,246,0.6)'
            : '0 0 20px rgba(59,130,246,0.2)',
          animation: listening ? 'micPulse 1s ease-in-out infinite' : 'none',
        }}
      >
        <span className="text-xl mb-1">
          {listening ? '🔴 Te ascult...' : '🎤 Spune ce cauți'}
        </span>
        <span className="text-sm font-normal opacity-80">
          {listening ? 'Vorbește acum...' : 'Vorbești → AI caută pentru tine'}
        </span>
      </button>

      {/* EXEMPLE */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <span className="text-xs opacity-50" style={{ color: 'var(--text-secondary)' }}>💡 Exemple:</span>
        {['BMW sub 5000 euro', 'telefon bun și ieftin', 'canapea modernă'].map(ex => (
          <button
            key={ex}
            onClick={() => router.push(`/cauta?q=${encodeURIComponent(ex)}`)}
            className="text-xs px-3 py-1 rounded-full glass hover:scale-105 transition-transform"
            style={{ color: 'var(--text-secondary)' }}
          >
            {ex}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes micPulse {
          0%,100% { box-shadow: 0 0 20px rgba(59,130,246,0.3) }
          50% { box-shadow: 0 0 50px rgba(59,130,246,0.8) }
        }
      `}</style>
    </div>
  )
}
