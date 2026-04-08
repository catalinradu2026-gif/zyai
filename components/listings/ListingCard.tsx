import Link from 'next/link'
import Image from 'next/image'

interface ListingCardProps {
  id: string
  title: string
  price?: number
  priceType: string
  currency: string
  city: string
  images: string[]
  createdAt: string
}

export default function ListingCard({
  id,
  title,
  price,
  priceType,
  currency,
  city,
  images,
  createdAt,
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
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3">
          <h3 className="text-base font-bold line-clamp-2 group-hover:text-blue-light transition-colors">
            {title}
          </h3>

          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-black gradient-main-text">
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
