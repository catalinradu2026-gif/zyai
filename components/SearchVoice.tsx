'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

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
  const searchParams = useSearchParams()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.preload = 'auto'
    return () => { audioRef.current?.pause() }
  }, [])

  async function playVoice() {
    if (!audioRef.current || speaking) return
    const text = buildVoiceText(query, count, firstTitle, firstPrice, firstCity)

    // PASUL 1: Deblochează audio IMEDIAT în contextul tap-ului (sincron)
    try {
      audioRef.current.src = SILENT_WAV
      await audioRef.current.play()
    } catch {}

    // PASUL 2: Fetch TTS (acum audio e deblocat, play() va funcționa)
    try {
      setSpeaking(true)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) { setSpeaking(false); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      audioRef.current.src = url
      audioRef.current.onended = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      audioRef.current.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      await audioRef.current.play()
    } catch {
      setSpeaking(false)
    }
  }

  if (!query) return null

  return (
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
  )
}
