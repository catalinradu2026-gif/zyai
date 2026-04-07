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
  const timeLabel =
    diffDays === 0
      ? 'Astazi'
      : diffDays === 1
        ? 'Ieri'
        : `${diffDays} zile în urmă`

  return (
    <Link href={`/anunt/${id}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition h-full">
        {/* Image */}
        {firstImage ? (
          <div className="relative w-full h-48 bg-gray-100">
            <Image
              src={firstImage}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-4xl">📷</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
            {title}
          </h3>
          <p className="text-2xl font-bold text-green-600 mb-2">{formattedPrice}</p>
          <div className="flex justify-between text-sm text-gray-600">
            <span>📍 {city}</span>
            <span>{timeLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
