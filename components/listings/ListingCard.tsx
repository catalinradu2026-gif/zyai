'use client'

import Link from 'next/link'
import Image from 'next/image'
import FavoriteButton from './FavoriteButton'
import CompareButton from '@/components/compare/CompareButton'
import ShareButton from './ShareButton'
import BidTimer from './BidTimer'

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
  status?: string
  biddingEndTime?: string
  currentHighestBid?: number
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
  status,
  biddingEndTime,
  currentHighestBid,
}: ListingCardProps) {
  const isSold = status === 'vandut'
  const isBidding = status === 'bidding'
  const firstImage = images?.[0]
  const displayPrice = isBidding && currentHighestBid ? currentHighestBid : price
  const formattedPrice =
    displayPrice && priceType !== 'gratuit'
      ? `${displayPrice.toLocaleString('ro-RO')} ${currency}`
      : priceType === 'negociabil'
        ? 'Preț negociabil'
        : 'Gratuit'

  const timeAgo = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - timeAgo.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const isNew = diffDays === 0
  const timeLabel = isNew ? 'Astăzi' : diffDays === 1 ? 'Ieri' : `${diffDays} zile`

  const isAuto = category === 'auto' || category?.startsWith('auto')
  const meta = metadata as AutoMeta | null | undefined

  const chips: { icon: string; label: string }[] = []
  if (isAuto && meta) {
    if (meta.year) chips.push({ icon: '📅', label: meta.year })
    if (meta.mileage) chips.push({ icon: '🛣️', label: `${Number(meta.mileage).toLocaleString('ro-RO')} km` })
    if (meta.fuelType) chips.push({ icon: '⛽', label: meta.fuelType })
    if (meta.gearbox) chips.push({ icon: '⚙️', label: meta.gearbox })
  }

  const compareItem = {
    id, title, price, priceType, currency, city,
    image: firstImage,
    category,
  }

  return (
    <Link href={`/anunt/${id}`}>
      <div
        className="group rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] h-full cursor-pointer"
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
        <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={title}
              fill
              className={`object-cover group-hover:scale-110 transition-transform duration-300 ${isSold ? 'brightness-50' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-4xl opacity-50">📷</span>
            </div>
          )}

          {/* SOLD overlay */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-4 py-2 rounded-xl text-white font-black text-xl tracking-widest rotate-[-15deg]"
                style={{ background: 'rgba(220,38,38,0.92)', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                VÂNDUT
              </div>
            </div>
          )}

          {/* Bidding badge + timer — top left */}
          {status === 'bidding' && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <div className="px-2 py-0.5 rounded-lg text-white font-black text-xs"
                style={{ background: 'rgba(234,88,12,0.92)', border: '1px solid rgba(255,255,255,0.3)' }}>
                🔥 LICITAȚIE
              </div>
              {biddingEndTime && (
                <div className="px-2 py-0.5 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#fb923c' }}>
                  <BidTimer endTime={biddingEndTime} />
                </div>
              )}
            </div>
          )}

          {/* New badge — top left */}
          {isNew && !isSold && status !== 'bidding' && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full">
              Nou
            </div>
          )}

          {/* Favorite heart — top right */}
          <span onClick={e => e.preventDefault()}>
            <FavoriteButton listingId={id} userId={userId} initialFavorited={isFavorited} top="8px" bottom={undefined} />
          </span>

          {/* Compare button — bottom left overlay */}
          <div className="absolute bottom-2 left-2" onClick={e => e.preventDefault()}>
            <CompareButton item={compareItem} />
          </div>

          {/* Share button — bottom right (separate from favorite) */}
          <ShareButton url={`/anunt/${id}`} title={title} />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2">
          <h3 className="text-base font-bold line-clamp-2 group-hover:text-blue-light transition-colors">
            {title}
          </h3>

          {description && (
            <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}

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

          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-xl font-black price-text">{formattedPrice}</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{city}</span>
          </div>

          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {timeLabel}
          </div>
        </div>
      </div>
    </Link>
  )
}
