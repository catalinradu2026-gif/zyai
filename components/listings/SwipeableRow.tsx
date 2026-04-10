'use client'

import { useRef } from 'react'
import Link from 'next/link'
import FavoriteButton from './FavoriteButton'

interface AutoMeta {
  year?: string | null
  mileage?: string | null
  fuelType?: string | null
  gearbox?: string | null
}

interface Listing {
  id: string
  title: string
  description?: string
  price?: number
  currency: string
  city: string
  images: string[]
  category?: string
  metadata?: AutoMeta | null
}

interface SwipeableRowProps {
  listings: Listing[]
  title: string
  subtitle?: string
  userId?: string
  favoritedIds?: string[]
}

export default function SwipeableRow({ listings, title, subtitle, userId, favoritedIds = [] }: SwipeableRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
    }
  }

  if (!listings.length) return null

  return (
    <section className="max-w-6xl mx-auto mb-16 px-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            aria-label="Stânga"
          >
            ←
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            aria-label="Dreapta"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {listings.map((listing) => {
          const formattedPrice = listing.price
            ? `${listing.price.toLocaleString('ro-RO')} ${listing.currency}`
            : 'Negociabil'

          const isAuto = listing.category === 'auto' || listing.category?.startsWith('auto')
          const meta = listing.metadata as AutoMeta | null | undefined
          const chips: { icon: string; label: string }[] = []
          if (isAuto && meta) {
            if (meta.year) chips.push({ icon: '📅', label: meta.year })
            if (meta.mileage) chips.push({ icon: '🛣️', label: `${Number(meta.mileage).toLocaleString('ro-RO')} km` })
            if (meta.fuelType) chips.push({ icon: '⛽', label: meta.fuelType })
            if (meta.gearbox) chips.push({ icon: '⚙️', label: meta.gearbox })
          }

          return (
            <Link
              key={listing.id}
              href={`/anunt/${listing.id}`}
              style={{ scrollSnapAlign: 'start', flexShrink: 0, width: '220px' }}
              className="block"
            >
              <div
                className="group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--glow-blue)'
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                }}
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-purple-700 to-blue-600 flex items-center justify-center">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl opacity-50">📦</span>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold rounded-full">
                    ✨ AI
                  </div>
                  <FavoriteButton
                    listingId={listing.id}
                    userId={userId}
                    initialFavorited={favoritedIds.includes(listing.id)}
                  />
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col gap-1.5">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-light transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {listing.title}
                  </h3>

                  {listing.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {listing.description}
                    </p>
                  )}

                  {chips.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {chips.slice(0, 2).map((chip) => (
                        <span
                          key={chip.label}
                          className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {chip.icon} {chip.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-base font-black price-text">{formattedPrice}</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{listing.city}</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
