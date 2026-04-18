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
  const playedRef = useRef<string>('')
  const [speaking, setSpeaking] = useState(false)

  // Auto-play întotdeauna când apare un query nou
  useEffect(() => {
    if (!query || playedRef.current === query) return
    playedRef.current = query

    const text = buildVoiceText(query, count, firstTitle, firstPrice, firstCity)
    speak(text, setSpeaking)
  }, [query, count, firstTitle, firstPrice, firstCity])

  function speak(text: string, setSpeak?: (v: boolean) => void) {
    setSpeak?.(true)
    // Încearcă speechSynthesis (nu necesită user gesture pe desktop)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = 'ro-RO'
      utt.rate = 1.05
      utt.onend = () => setSpeak?.(false)
      utt.onerror = () => {
        setSpeak?.(false)
        // Fallback: audio element
        tryAudio(text, setSpeak)
      }
      window.speechSynthesis.speak(utt)
      return
    }
    tryAudio(text, setSpeak)
  }

  function tryAudio(text: string, setSpeak?: (v: boolean) => void) {
    let audio = (window as any).__zyaiAudio as HTMLAudioElement | undefined
    if (!audio) { audio = new Audio(); (window as any).__zyaiAudio = audio }
    audio.src = `/api/tts-get?text=${encodeURIComponent(text)}`
    audio.onended = () => setSpeak?.(false)
    audio.onerror = () => setSpeak?.(false)
    audio.play().catch(() => setSpeak?.(false))
  }

  function replay() {
    const text = buildVoiceText(query, count, firstTitle, firstPrice, firstCity)
    speak(text, setSpeaking)
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
