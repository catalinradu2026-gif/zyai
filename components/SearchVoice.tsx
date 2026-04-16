'use client'

import { useRef, useState } from 'react'

type Props = {
  query: string
  count: number
  firstTitle?: string
  firstPrice?: string
  firstCity?: string
}

function buildVoiceText(query: string, count: number, firstTitle?: string, firstPrice?: string, firstCity?: string) {
  if (count > 0 && firstTitle) {
    const city = firstCity ? `, în ${firstCity}` : ''
    const price = firstPrice || 'preț negociabil'
    if (count === 1) {
      return `Am găsit un anunț pentru ${query}: ${firstTitle}, la ${price}${city}. Vrei să cauți altceva?`
    }
    return `Am găsit ${count} anunțuri pentru ${query}. Cel mai bun: ${firstTitle}, la ${price}${city}. Vrei să rafinezi căutarea?`
  }
  return `Nu am găsit nimic pentru ${query}. Vrei să cauți cu alte cuvinte?`
}

export default function SearchVoice({ query, count, firstTitle, firstPrice, firstCity }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [speaking, setSpeaking] = useState(false)

  function playVoice() {
    const el = audioRef.current
    if (!el || speaking) return

    const text = buildVoiceText(query, count, firstTitle, firstPrice, firstCity)
    const src = `/api/tts-get?text=${encodeURIComponent(text)}`

    // Setăm src și apelăm play() SINCRON în click handler — funcționează pe iOS
    el.src = src
    setSpeaking(true)
    el.play().catch(() => setSpeaking(false))
  }

  if (!query) return null

  return (
    <>
      <audio
        ref={audioRef}
        playsInline
        onEnded={() => setSpeaking(false)}
        onError={() => setSpeaking(false)}
        style={{ display: 'none' }}
      />
      <button
        onClick={playVoice}
        disabled={speaking}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '999px',
          border: 'none',
          background: speaking ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : 'rgba(139,92,246,0.15)',
          color: speaking ? '#fff' : '#8B5CF6',
          fontSize: '14px',
          fontWeight: 600,
          cursor: speaking ? 'default' : 'pointer',
          transition: 'all 0.2s',
          marginBottom: '12px',
        }}
      >
        {speaking ? '🔊 Vorbesc...' : '🔊 Ascultă rezultatele'}
      </button>
    </>
  )
}
