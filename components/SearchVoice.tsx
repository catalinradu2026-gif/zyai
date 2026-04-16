'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

// WAV silențios — deblochează audio pe iOS
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

type Props = {
  query: string
  count: number
  firstTitle?: string
  firstPrice?: string
  firstCity?: string
}

export default function SearchVoice({ query, count, firstTitle, firstPrice, firstCity }: Props) {
  const searchParams = useSearchParams()
  const playedRef = useRef(false)

  useEffect(() => {
    // Vorbește doar dacă vine de la mic (voice=1 în URL)
    if (searchParams.get('voice') !== '1') return
    if (playedRef.current) return
    playedRef.current = true

    // Construiește textul vocal
    let text = ''
    if (count > 0 && firstTitle) {
      const city = firstCity ? `, în ${firstCity}` : ''
      const price = firstPrice || 'preț negociabil'
      if (count === 1) {
        text = `Am găsit un anunț pentru ${query}: ${firstTitle}, la ${price}${city}. Vrei să cauți altceva?`
      } else {
        text = `Am găsit ${count} anunțuri pentru ${query}. Cel mai bun: ${firstTitle}, la ${price}${city}. Vrei să rafinezi căutarea?`
      }
    } else {
      text = `Nu am găsit nimic pentru ${query}. Vrei să cauți cu alte cuvinte?`
    }

    // Trimite la ChatWidget prin event — audio-ul e deja deblocat de la tap-ul pe mic
    window.dispatchEvent(new CustomEvent('speakSearchResult', { detail: text }))
  }, [searchParams, query, count, firstTitle, firstPrice, firstCity])

  return null
}
