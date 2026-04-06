'use client'

import { useState } from 'react'
import { toggleFavorite } from '@/lib/actions/favorites'
import Link from 'next/link'

interface FavoriteButtonProps {
  listingId: string
  initialIsFavorited?: boolean
  userId?: string
  showLabel?: boolean
}

export default function FavoriteButton({
  listingId,
  initialIsFavorited = false,
  userId,
  showLabel = false,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!userId) {
      // Redirect to login
      window.location.href = `/login?next=/anunt/${listingId}`
      return
    }

    setLoading(true)
    const result = await toggleFavorite(listingId)

    if (result.success) {
      setIsFavorited(result.isFavorited)
    } else if (result.error) {
      alert('Eroare: ' + result.error)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all
        ${
          isFavorited
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      style={{
        animation: isFavorited && !loading ? 'heartBeat 0.3s' : 'none',
      }}
    >
      <style>{`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>

      <span className="text-lg">{isFavorited ? '❤️' : '🤍'}</span>
      {showLabel && <span className="text-sm font-medium">Favorite</span>}
    </button>
  )
}
