import ListingCard from './ListingCard'

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
  metadata?: Record<string, any> | null
}

interface ListingGridProps {
  listings: Listing[]
  loading?: boolean
}

export default function ListingGrid({ listings, loading }: ListingGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Nu au fost găsite anunțuri</p>
      </div>
    )
  }

  return (
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
        />
      ))}
    </div>
  )
}
