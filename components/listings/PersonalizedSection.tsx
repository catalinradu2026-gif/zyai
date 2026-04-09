'use client'

import { useEffect, useState } from 'react'
import SwipeableRow from './SwipeableRow'

interface Listing {
  id: string
  title: string
  description?: string
  price?: number
  currency: string
  city: string
  images: string[]
  category?: string
  metadata?: Record<string, any> | null
}

interface PersonalizedSectionProps {
  allListings: Listing[]
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  auto: ['bmw', 'mercedes', 'volkswagen', 'dacia', 'audi', 'toyota', 'ford', 'masina', 'auto', 'motor', 'moto'],
  imobiliare: ['apartament', 'casa', 'teren', 'garsoniera', 'villa', 'inchiriat', 'vanzare', 'camere', 'imobil'],
  electronice: ['iphone', 'samsung', 'laptop', 'telefon', 'tv', 'playstation', 'pc', 'monitor', 'rtx', 'gaming'],
  joburi: ['developer', 'job', 'angajare', 'programator', 'designer', 'manager', 'remote', 'full-time'],
  servicii: ['reparatii', 'curatenie', 'instalatii', 'zugravit', 'montaj', 'service'],
  moda: ['haine', 'pantofi', 'geanta', 'rochie', 'bluza', 'adidasi', 'zara', 'nike'],
  sport: ['bicicleta', 'fitness', 'greutati', 'sala', 'fotbal', 'tenis', 'ski'],
  'mama-copilul': ['copii', 'bebelus', 'jucarii', 'carucior', 'scaun auto', 'mama'],
  animale: ['caine', 'pisica', 'labrador', 'golden', 'bulldog', 'siameza'],
  'casa-gradina': ['mobila', 'canapea', 'masa', 'scaun', 'frigider', 'masina de spalat', 'gradina'],
}

function getRelevantCategories(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const searches: string[] = JSON.parse(localStorage.getItem('zyai_searches') || '[]')
    const visitedCats: string[] = JSON.parse(localStorage.getItem('zyai_categories') || '[]')

    const matchedCats = new Set<string>(visitedCats)

    for (const term of searches) {
      const lower = term.toLowerCase()
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((kw) => lower.includes(kw))) {
          matchedCats.add(cat)
        }
      }
    }

    return Array.from(matchedCats)
  } catch {
    return []
  }
}

export default function PersonalizedSection({ allListings }: PersonalizedSectionProps) {
  const [personalized, setPersonalized] = useState<Listing[]>([])

  useEffect(() => {
    const relevantCats = getRelevantCategories()

    if (relevantCats.length === 0) {
      // No history — show popular (shuffled)
      const shuffled = [...allListings].sort(() => Math.random() - 0.5).slice(0, 8)
      setPersonalized(shuffled)
    } else {
      // Filter by relevant categories, then fill with others
      const matched = allListings.filter((l) => l.category && relevantCats.includes(l.category))
      const rest = allListings.filter((l) => !matched.includes(l))
      const combined = [...matched, ...rest].slice(0, 10)
      setPersonalized(combined)
    }
  }, [allListings])

  if (!personalized.length) return null

  const relevantCats = typeof window !== 'undefined' ? getRelevantCategories() : []
  const hasHistory = relevantCats.length > 0
  const subtitle = hasHistory
    ? `Bazat pe interesele tale recente`
    : `Cele mai populare anunțuri acum`

  return (
    <SwipeableRow
      listings={personalized}
      title="Oferte pentru tine"
      subtitle={subtitle}
    />
  )
}
