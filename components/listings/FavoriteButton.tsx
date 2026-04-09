'use client'

import { useState, useEffect } from 'react'

function getLocalFavs(): string[] {
  try { return JSON.parse(localStorage.getItem('zyai_favs') || '[]') } catch { return [] }
}
function saveLocalFav(id: string, add: boolean) {
  try {
    const favs = getLocalFavs()
    const next = add ? [...new Set([...favs, id])] : favs.filter(f => f !== id)
    localStorage.setItem('zyai_favs', JSON.stringify(next))
  } catch {}
}

export default function FavoriteButton({ listingId, initialFavorited = false }: { listingId: string; initialFavorited?: boolean }) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (getLocalFavs().includes(listingId)) setFavorited(true)
  }, [listingId])

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const next = !favorited
    setFavorited(next)
    saveLocalFav(listingId, next)

    if (next) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 400)
    }

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      const data = await res.json()

      if (res.status === 401) {
        // Neautentificat — lasă starea din localStorage, redirecționează la login
        window.location.href = '/login'
        return
      }

      if (!res.ok) {
        console.error('favorite error:', data)
        // Nu reveni — starea rămâne cum a setat userul
      }
    } catch (err) {
      console.error('favorite fetch error:', err)
      // Offline sau eroare — starea localStorage e salvată deja
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={favorited ? 'Elimină din favorite' : 'Adaugă la favorite'}
      style={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        border: 'none',
        background: favorited ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
        transform: animating ? 'scale(1.4)' : 'scale(1)',
        zIndex: 2,
        boxShadow: favorited ? '0 0 14px rgba(239,68,68,0.6)' : 'none',
      }}
    >
      <svg
        width="16" height="16" viewBox="0 0 24 24"
        fill={favorited ? '#fff' : 'none'}
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'fill 0.2s ease' }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
