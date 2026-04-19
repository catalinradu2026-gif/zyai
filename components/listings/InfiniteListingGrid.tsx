'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import ListingCard from './ListingCard'
import { CompareProvider } from '@/components/compare/CompareContext'
import CompareBar from '@/components/compare/CompareBar'

interface Listing {
  id: string
  title: string
  description?: string
  price?: number
  price_type: string
  currency: string
  city: string
  images: string[]
  created_at: string
  category?: string
  category_id?: number
  metadata?: Record<string, any> | null
  status?: string
}

const CATEGORY_SLUGS: Record<number, string> = {
  1: 'joburi', 2: 'imobiliare', 3: 'auto', 4: 'servicii',
  5: 'electronice', 6: 'moda', 7: 'casa-gradina', 8: 'sport',
  9: 'animale', 10: 'mama-copilul',
}

interface Props {
  initialListings: Listing[]
  initialCount: number
  category: string
  userId?: string
  favoritedIds?: string[]
}

export default function InfiniteListingGrid({
  initialListings,
  initialCount,
  category,
  userId,
  favoritedIds = [],
}: Props) {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialListings.length < initialCount)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadedPages = useRef<Set<number>>(new Set([1]))

  // Reset când se schimbă filtrele (searchParams)
  useEffect(() => {
    setListings(initialListings)
    setPage(1)
    loadedPages.current = new Set([1])
    setHasMore(initialListings.length < initialCount)
  }, [searchParams.toString(), initialListings, initialCount])

  const loadMore = useCallback(async () => {
    const nextPage = page + 1
    if (loading || !hasMore || loadedPages.current.has(nextPage)) return
    loadedPages.current.add(nextPage)
    setLoading(true)

    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set('category', category)
      params.set('page', String(nextPage))

      const res = await fetch(`/api/listings?${params.toString()}`)
      const json = await res.json()
      const newListings: Listing[] = (json.data || []).map((l: any) => ({
        ...l,
        category: l.category ?? CATEGORY_SLUGS[l.category_id] ?? undefined,
        metadata: l.metadata ?? null,
      }))

      if (newListings.length === 0) {
        setHasMore(false)
      } else {
        setListings(prev => {
          const existingIds = new Set(prev.map(l => l.id))
          const deduped = newListings.filter(l => !existingIds.has(l.id))
          return [...prev, ...deduped]
        })
        setPage(nextPage)
        setHasMore(listings.length + newListings.length < (json.count || 0))
      }
    } catch {
      loadedPages.current.delete(nextPage)
    } finally {
      setLoading(false)
    }
  }, [page, loading, hasMore, searchParams, category, listings.length])

  // IntersectionObserver — declanșează loadMore când sentinelul devine vizibil
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '300px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  if (listings.length === 0 && !loading) return null

  return (
    <CompareProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            id={listing.id}
            title={listing.title}
            description={listing.description}
            price={listing.price}
            priceType={listing.price_type}
            currency={listing.currency}
            city={listing.city}
            images={listing.images}
            createdAt={listing.created_at}
            category={listing.category}
            metadata={listing.metadata}
            userId={userId}
            isFavorited={favoritedIds.includes(listing.id)}
            status={listing.status}
            biddingEndTime={listing.metadata?.bidding_end_time}
            currentHighestBid={listing.metadata?.current_highest_bid}
          />
        ))}
      </div>

      {/* Sentinel + loading indicator */}
      <div ref={sentinelRef} style={{ height: '1px', marginTop: '32px' }} />
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl h-64 animate-pulse" style={{ background: 'var(--bg-card)' }} />
          ))}
        </div>
      )}
      {!hasMore && listings.length > 0 && (
        <div className="text-center py-8 pb-24" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          ✓ Toate cele {listings.length} anunțuri au fost încărcate
        </div>
      )}

      <CompareBar />
    </CompareProvider>
  )
}
