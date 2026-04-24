'use client'

import { useEffect } from 'react'

type Props = {
  listingId: string
  userId: string
  sellerId: string
  listingTitle: string
}

export default function ViewNotifier({ listingId, userId, sellerId, listingTitle }: Props) {
  useEffect(() => {
    fetch('/api/listings/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, userId, sellerId, listingTitle }),
    }).catch(() => {})
  }, [listingId])

  return null
}
