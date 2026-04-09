# zyAI UI Improvements - Minimalist + AI Vocal

## 1. HERO SECTION - Cu AI Chat + Microfon

```tsx
'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')

  const handleMicrophone = () => {
    setIsListening(!isListening)
    // Conectă cu Speech Recognition API
  }

  return (
    <section className="min-h-screen pt-32 pb-16 px-4 flex items-center">
      <div className="max-w-2xl mx-auto text-center w-full">
        {/* Badge */}
        <div className="inline-block mb-8 px-3 py-1 border border-gray-200 rounded-full text-sm text-gray-600">
          🤖 Asistent AI vocal în limba română
        </div>

        {/* Titlu */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight">
          Găsește ceea ce cauți cu vocea
        </h1>

        {/* Subtitlu */}
        <p className="text-xl text-gray-600 mb-12 max-w-xl mx-auto">
          Spune natural ce vrei. zyAI ascultă și găsește anunțuri potrivite în 2 secunde.
        </p>

        {/* Chat + Microfon */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition mb-8">
          <div className="flex gap-3 mb-4">
            {/* Text Input */}
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Scrie sau apasă 🎤 pentru a vorbi..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />

            {/* Microfon Button */}
            <button
              onClick={handleMicrophone}
              className={`p-3 rounded-lg transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isListening ? 'Se înregistrează...' : 'Apasă să vorbești'}
            >
              🎤
            </button>

            {/* Search Button */}
            <Button variant="primary" size="md">
              Caută
            </Button>
          </div>

          {isListening && (
            <p className="text-xs text-red-500 font-medium">
              🔴 Se înregistrează... Vorbește natural!
            </p>
          )}
        </div>

        {/* Subtext */}
        <p className="text-sm text-gray-500">
          Ex: „apartament 2 camere cluj 500 euro" sau „job frontend developer remote"
        </p>
      </div>
    </section>
  )
}
```

---

## 2. ANUNȚURI RECOMANDATE - Grid Minimalist

```tsx
import Link from 'next/link'
import Image from 'next/image'

const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max, 256GB, negru',
    price: 4500,
    currency: 'RON',
    city: 'București',
    image: '/placeholder-1.jpg',
  },
  {
    id: '2',
    title: 'Apartament 2 camere, Dorobanți, 85m²',
    price: 250000,
    currency: 'EUR',
    city: 'București',
    image: '/placeholder-2.jpg',
  },
  {
    id: '3',
    title: 'BMW 320d 2015, 180.000 km',
    price: 12000,
    currency: 'EUR',
    city: 'Cluj',
    image: '/placeholder-3.jpg',
  },
  {
    id: '4',
    title: 'React Developer Senior - Remote',
    price: 5000,
    currency: 'RON/luna',
    city: 'Remote',
    image: '/placeholder-4.jpg',
  },
  {
    id: '5',
    title: 'Laptop Gaming ASUS ROG, RTX 4070',
    price: 6500,
    currency: 'RON',
    city: 'Timișoara',
    image: '/placeholder-5.jpg',
  },
  {
    id: '6',
    title: 'Apartament 2 camere, Obor, 60m²',
    price: 800,
    currency: 'RON/luna',
    city: 'București',
    image: '/placeholder-6.jpg',
  },
]

export default function RecommendedListings() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Anunțuri recomandate</h2>
        <Link href="/marketplace" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Vezi toate →
        </Link>
      </div>

      {/* Grid 6 carduri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_LISTINGS.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  )
}

function ListingCard({ listing }: { listing: any }) {
  return (
    <Link href={`/anunt/${listing.id}`}>
      <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl">📦</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition">
            {listing.title}
          </h3>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-lg font-bold text-gray-900">
              {listing.price.toLocaleString('ro-RO')} {listing.currency}
            </span>
            <span className="text-xs text-gray-500">📍 {listing.city}</span>
          </div>

          <button className="w-full mt-3 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition">
            Vezi detalii
          </button>
        </div>
      </div>
    </Link>
  )
}
```

---

## 3. PALETĂ CULORI + STIL GENERAL

```css
/* globals.css - Update */

:root {
  /* Culori minimalist + AI accent */
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-text-light: #6b7280;
  --color-border: #e5e7eb;
  --color-bg-hover: #f9fafb;

  /* AI Accent */
  --color-primary: #2563eb; /* Blue - Search, CTA */
  --color-primary-light: #3b82f6;
  --color-accent-ai: #dc2626; /* Red - Microfon recording */
  --color-accent-ai-light: #ef4444;

  /* Shadows - discrete */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Font */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Reset + minimalist defaults */
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-family);
  line-height: 1.6;
}

h1, h2, h3 {
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Buttons default */
button {
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Inputs */
input, textarea {
  font-size: 1rem;
  font-family: inherit;
}

/* Links */
a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--color-primary-light);
}

/* Hover effects discrete */
.hover-lift:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.hover-bg:hover {
  background: var(--color-bg-hover);
}

/* Recording animation */
@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-record {
  animation: pulse-red 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## 4. CARD DE ANUNȚ - Design Detaliat

```tsx
import Link from 'next/link'
import Image from 'next/image'

interface ListingProps {
  id: string
  title: string
  price: number
  currency: string
  city: string
  image?: string
  isNew?: boolean
  isSaved?: boolean
  views?: number
}

export default function ListingCardDetailed({
  id,
  title,
  price,
  currency,
  city,
  image,
  isNew = false,
  isSaved = false,
  views = 0,
}: ListingProps) {
  return (
    <Link href={`/anunt/${id}`}>
      <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image Container */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-5xl opacity-50">📦</span>
            </div>
          )}

          {/* Badge - Nou */}
          {isNew && (
            <div className="absolute top-3 left-3 inline-block px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              🆕 Nou
            </div>
          )}

          {/* Badge - Salvat */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
              isSaved
                ? 'bg-red-100 text-red-600'
                : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-600'
            }`}
            title={isSaved ? 'Salvat' : 'Salvează'}
          >
            ❤️
          </button>

          {/* Views counter */}
          {views > 0 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded">
              👁️ {views}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition leading-snug">
            {title}
          </h3>

          {/* Price + Location */}
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {price.toLocaleString('ro-RO')}
              </span>
              <span className="text-sm text-gray-500">{currency}</span>
            </div>
            <span className="text-xs text-gray-500">📍 {city}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-4"></div>

          {/* Meta */}
          <div className="text-xs text-gray-500 mb-4 flex gap-2">
            <span>Just now</span>
            <span>•</span>
            <span>Active</span>
          </div>

          {/* Button */}
          <button className="w-full px-4 py-2.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-all active:scale-95">
            Vezi detalii
          </button>
        </div>
      </div>
    </Link>
  )
}
```

---

## IMPLEMENTARE - Pas cu Pas:

1. **Adaugă `HeroSection.tsx`** cu microfon + chat
2. **Adaugă `RecommendedListings.tsx`** cu grid 6 carduri
3. **Updatează `app/globals.css`** cu paletă nouă
4. **Rădaug `ListingCardDetailed.tsx`** în locul celui vechi
5. **Updatează `app/page.tsx`** pentru a folosi noile componente

---

## CULORI TAILWIND - Add to tailwind config:

```js
colors: {
  primary: '#2563eb',
  'primary-light': '#3b82f6',
  'accent-ai': '#dc2626',
  'accent-ai-light': '#ef4444',
}
```

---

Minimalist. Clean. AI-focused. ✨
