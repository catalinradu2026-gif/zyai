'use client'

import { useState } from 'react'
import Link from 'next/link'

const MAIN_CATEGORIES = [
  { icon: '🏠', name: 'Imobiliare', slug: 'imobiliare', color: 'purple' },
  { icon: '🚗', name: 'Auto', slug: 'auto', color: 'blue' },
  { icon: '💼', name: 'Joburi', slug: 'joburi', color: 'purple' },
  { icon: '🔧', name: 'Servicii', slug: 'servicii', color: 'blue' },
]

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
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="w-full">
      {!expanded ? (
        /* Grid 4 carduri mari cu glow */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MAIN_CATEGORIES.map((cat) => {
            const isGlow = cat.color === 'purple' ? 'var(--glow-purple)' : 'var(--glow-blue)'
            return (
              <Link key={cat.slug} href={`/marketplace/${cat.slug}`}>
                <div
                  className="group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer h-full"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'initial',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = isGlow
                    e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'initial'
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)'
                  }}
                >
                  <span className="text-6xl group-hover:animate-float transition-transform duration-300">
                    {cat.icon}
                  </span>
                  <span className="font-bold text-lg text-center group-hover:gradient-main-text transition-all duration-300">
                    {cat.name}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        /* Grid expanded cu toate categoriile */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/marketplace/${cat.slug}`}>
              <div
                className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'
                  e.currentTarget.style.boxShadow = 'var(--glow-blue)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)'
                  e.currentTarget.style.boxShadow = 'initial'
                }}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="font-semibold text-sm text-center group-hover:text-blue-light transition-colors line-clamp-2">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-6 block mx-auto px-6 py-2 rounded-full text-sm font-medium glass glass-hover"
        style={{ color: 'var(--text-secondary)' }}
      >
        {expanded ? '← Așteaptă' : 'Explore all →'}
      </button>
    </div>
  )
}
