'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

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
    return `Am găsit ${count} anunțuri pentru ${query}. Cel mai bun: ${firstTitle}, la ${price}${city}. Vrei să cauți altceva?`
  }
  return `Nu am găsit nimic pentru ${query}. Vrei să cauți altceva?`
}

export default function SearchVoice({ query, count, firstTitle, firstPrice, firstCity }: Props) {
  const searchParams = useSearchParams()
  const playedRef = useRef(false)
  const [speaking, setSpeaking] = useState(false)

  // Auto-play la montare dacă vine de la mic (voice=1)
  useEffect(() => {
    if (searchParams.get('voice') !== '1') return
    if (playedRef.current) return
    playedRef.current = true

    const text = buildVoiceText(query, count, firstTitle, firstPrice, firstCity)

    // Folosim audio-ul global deblocat de HeroSearch la tap pe mic
    const audio = (window as any).__zyaiAudio as HTMLAudioElement | undefined
    if (!audio) return

    const src = `/api/tts-get?text=${encodeURIComponent(text)}`
    audio.src = src
    setSpeaking(true)
    audio.onended = () => setSpeaking(false)
    audio.onerror = () => setSpeaking(false)
    audio.play().catch(() => setSpeaking(false))
  }, [searchParams, query, count, firstTitle, firstPrice, firstCity])

  // Buton replay (dacă vrea să asculte din nou)
  function replay() {
    const text = buildVoiceText(query, count, firstTitle, firstPrice, firstCity)
    let audio = (window as any).__zyaiAudio as HTMLAudioElement | undefined
    if (!audio) {
      audio = new Audio()
      ;(window as any).__zyaiAudio = audio
    }
    const src = `/api/tts-get?text=${encodeURIComponent(text)}`
    audio.src = src
    setSpeaking(true)
    audio.onended = () => setSpeaking(false)
    audio.onerror = () => setSpeaking(false)
    audio.play().catch(() => setSpeaking(false))
  }

  if (!query) return null

  return (
    <button
      onClick={replay}
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
      {speaking ? '🔊 Vorbesc...' : '🔊 Ascultă din nou'}
    </button>
  )
}
