'use client'

import { useState } from 'react'

type Props = {
  listingId: string
  userId?: string
}

export default function PhoneRevealButton({ listingId, userId }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [phone, setPhone] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (!userId) {
      window.location.href = '/login'
      return
    }
    if (revealed) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/listings/phone-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })

      if (res.status === 401) {
        window.location.href = '/login'
        return
      }

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error === 'listing not found' ? 'Anunț negăsit' : 'Eroare server. Încearcă din nou.')
        return
      }

      if (!data.phone) {
        setPhone('Număr necompletat')
      } else {
        setPhone(data.phone)
      }
      setRevealed(true)
    } catch {
      setError('Eroare de rețea. Verifică conexiunea.')
    } finally {
      setLoading(false)
    }
  }

  if (revealed && phone) {
    return (
      <a
        href={phone !== 'Număr necompletat' ? `tel:${phone.replace(/\s/g, '')}` : undefined}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-green-600 bg-green-50 text-green-700 font-semibold text-base hover:bg-green-100 transition"
      >
        📞 {phone}
      </a>
    )
  }

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold text-base hover:bg-blue-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="animate-pulse">Se încarcă...</span>
        ) : (
          <>📞 Arată numărul</>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1 text-center">{error}</p>
      )}
    </div>
  )
}
