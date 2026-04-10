'use client'

import Link from 'next/link'
import Image from 'next/image'
import FavoriteButton from './FavoriteButton'

interface AutoMeta {
  year?: string | null
  mileage?: string | null
  fuelType?: string | null
  gearbox?: string | null
  power?: string | null
  condition?: string | null
}

interface ListingCardProps {
  id: string
  title: string
  description?: string
  price?: number
  priceType: string
  currency: string
  city: string
  images: string[]
  createdAt: string
  metadata?: AutoMeta | null
  category?: string
  userId?: string
  isFavorited?: boolean
}

export default function ListingCard({
  id,
  title,
  description,
  price,
  priceType,
  currency,
  city,
  images,
  createdAt,
  metadata,
  category,
  userId,
  isFavorited = false,
}: ListingCardProps) {
  const firstImage = images?.[0]
  const formattedPrice =
    price && priceType !== 'gratuit'
      ? `${price.toLocaleString('ro-RO')} ${currency}`
      : priceType === 'negociabil'
        ? 'Preț negociabil'
        : 'Gratuit'

  const timeAgo = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - timeAgo.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const isNew = diffDays === 0
  const timeLabel = isNew ? 'Astazi' : diffDays === 1 ? 'Ieri' : `${diffDays} zile`

  const isAuto = category === 'auto' || category?.startsWith('auto')
  const meta = metadata as AutoMeta | null | undefined

  // Build detail chips for auto listings
  const chips: { icon: string; label: string }[] = []
  if (isAuto && meta) {
    if (meta.year) chips.push({ icon: '📅', label: meta.year })
    if (meta.mileage) chips.push({ icon: '🛣️', label: `${Number(meta.mileage).toLocaleString('ro-RO')} km` })
    if (meta.fuelType) chips.push({ icon: '⛽', label: meta.fuelType })
    if (meta.gearbox) chips.push({ icon: '⚙️', label: meta.gearbox })
  }

  return (
    <Link href={`/anunt/${id}`}>
      <div
        className="group rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 h-full cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'initial',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'var(--glow-blue)'
          e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'initial'
          e.currentTarget.style.backgroundColor = 'var(--bg-card)'
        }}
      >
        {/* Image Container */}
        <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-4xl opacity-50">📷</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex gap-2">
            {isNew && (
              <div className="px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full">
                🆕 Nou
              </div>
            )}
            <div className="px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold rounded-full">
              ✨ AI
            </div>
          </div>
          <FavoriteButton listingId={id} userId={userId} initialFavorited={isFavorited} />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2">
          <h3 className="text-base font-bold line-clamp-2 group-hover:text-blue-light transition-colors">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}

          {/* AutoScout24-style detail chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className="text-xl font-black price-text">
              {formattedPrice}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {city}
            </span>
          </div>

          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {timeLabel}
          </div>
        </div>
      </div>
    </Link>
  )
}
