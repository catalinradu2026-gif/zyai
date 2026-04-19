'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleListingStatus } from '@/lib/actions/listings'

export default function ToggleStatusButton({ listingId, currentStatus }: { listingId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isActive = currentStatus === 'activ'

  async function handle() {
    setLoading(true)
    await toggleListingStatus(listingId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition hover:scale-105 active:scale-95 disabled:opacity-60 w-full"
      style={isActive ? {
        background: 'rgba(234,179,8,0.1)',
        border: '1px solid rgba(234,179,8,0.4)',
        color: '#facc15',
      } : {
        background: 'rgba(34,197,94,0.1)',
        border: '1px solid rgba(34,197,94,0.4)',
        color: '#4ade80',
      }}
    >
      {loading ? '⏳' : isActive ? '⏸ Dezactivează' : '▶ Activează'}
    </button>
  )
}
