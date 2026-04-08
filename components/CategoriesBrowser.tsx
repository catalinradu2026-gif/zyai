'use client'

import { useRef } from 'react'
import Link from 'next/link'

const ALL_CATEGORIES = [
  { icon: '🏠', name: 'Imobiliare', slug: 'imobiliare' },
  { icon: '🚗', name: 'Auto', slug: 'auto' },
  { icon: '💼', name: 'Joburi', slug: 'joburi' },
  { icon: '🔧', name: 'Servicii', slug: 'servicii' },
  { icon: '📱', name: 'Electronice', slug: 'electronice' },
  { icon: '👗', name: 'Modă', slug: 'moda' },
  { icon: '🏡', name: 'Casă & Grădină', slug: 'casa-gradina' },
  { icon: '⚽', name: 'Sport', slug: 'sport' },
  { icon: '🐾', name: 'Animale', slug: 'animale' },
]

export default function CategoriesBrowser() {
  const scrollRef = useRef<HTMLDivElement>(null)
  let interval: ReturnType<typeof setInterval> | null = null

  function startScroll(dir: 'left' | 'right') {
    if (interval) return
    interval = setInterval(() => {
      scrollRef.current?.scrollBy({ left: dir === 'left' ? -6 : 6, behavior: 'auto' })
    }, 16)
  }

  function stopScroll() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  return (
    <div className="relative w-full flex items-center gap-3">
      {/* Săgeată stânga */}
      <button
        onMouseEnter={() => startScroll('left')}
        onMouseLeave={stopScroll}
        onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-10"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
      >
        ◀
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto flex-1"
        style={{ scrollbarWidth: 'none' } as React.CSSProperties}
      >
        {ALL_CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/marketplace/${cat.slug}`} className="block flex-shrink-0">
            <div
              className="group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer glow-blue"
              style={{
                width: '160px',
                height: '160px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </span>
              <span className="font-bold text-sm text-center leading-tight" style={{ color: 'var(--text-primary)' }}>
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Săgeată dreapta */}
      <button
        onMouseEnter={() => startScroll('right')}
        onMouseLeave={stopScroll}
        onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-10"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
      >
        ▶
      </button>
    </div>
  )
}
