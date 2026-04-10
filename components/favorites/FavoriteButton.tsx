'use client'

import { useState } from 'react'
import { toggleFavorite } from '@/lib/actions/favorites'

interface FavoriteButtonProps {
  listingId: string
  initialFavorited?: boolean
  userId?: string
  showLabel?: boolean
  overlay?: boolean
}

export default function FavoriteButton({
  listingId,
  initialFavorited = false,
  userId,
  showLabel = false,
  overlay = false,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
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

  if (overlay) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        title={isFavorited ? 'Elimină din favorite' : 'Adaugă la favorite'}
        className="transition-all duration-200 disabled:opacity-50"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isFavorited
            ? 'rgba(239,68,68,0.9)'
            : 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          border: isFavorited ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(255,255,255,0.15)',
          boxShadow: isFavorited ? '0 0 12px rgba(239,68,68,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
          transform: loading ? 'scale(0.9)' : 'scale(1)',
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        <style>{`
          @keyframes heartPop {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.35); }
          }
        `}</style>
        <span style={{
          fontSize: '16px',
          lineHeight: 1,
          animation: isFavorited && !loading ? 'heartPop 0.3s ease' : 'none',
        }}>
          {isFavorited ? '❤️' : '🤍'}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold disabled:opacity-50"
      style={{
        background: isFavorited ? 'rgba(239,68,68,0.15)' : 'var(--bg-card-hover)',
        border: isFavorited ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border-subtle)',
        color: isFavorited ? '#f87171' : 'var(--text-secondary)',
        animation: isFavorited && !loading ? 'heartPop 0.3s ease' : 'none',
      }}
    >
      <style>{`
        @keyframes heartPop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>
      <span className="text-lg">{isFavorited ? '❤️' : '🤍'}</span>
      {showLabel && <span className="text-sm">{isFavorited ? 'Salvat' : 'Favorite'}</span>}
    </button>
  )
}
