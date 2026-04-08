'use client'

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
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 w-full">
      {ALL_CATEGORIES.map((cat) => (
        <Link key={cat.slug} href={`/marketplace/${cat.slug}`} className="block">
          <div
            className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer glow-blue"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              minHeight: '100px',
            }}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
              {cat.icon}
            </span>
            <span className="font-bold text-xs text-center leading-tight" style={{ color: 'var(--text-primary)' }}>
              {cat.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
