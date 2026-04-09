import { getUser } from '@/lib/actions/auth'
import { getUserFavorites } from '@/lib/queries/favorites'
import ListingGrid from '@/components/listings/ListingGrid'
import Link from 'next/link'

export const metadata = {
  title: 'Favorite - zyAI',
}

export default async function FavoritesPage() {
  const user = await getUser()

  if (!user) {
    return null
  }

  const { data: favorites } = await getUserFavorites(user.id)

  // Toate anunțurile favorite sunt deja favorite — favoritedIds = toate ID-urile
  const favoritedIds = favorites?.map((l: any) => l.id) || []

  return (
    <div>
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-2xl font-bold mb-2">❤️ Anunțurile mele favorite</h2>
        <p className="text-gray-600">
          {favorites?.length || 0} anunț{favorites && favorites.length !== 1 ? 'uri' : ''}
        </p>
      </div>

      {favorites && favorites.length > 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <ListingGrid
            listings={favorites.map((listing: any) => ({
              id: listing.id,
              title: listing.title,
              description: listing.description ?? undefined,
              price: listing.price,
              price_type: listing.price_type ?? 'fix',
              currency: listing.currency ?? 'RON',
              city: listing.city,
              images: listing.images ?? [],
              created_at: listing.created_at,
              category: undefined,
              metadata: listing.metadata ?? null,
            }))}
            userId={user.id}
            favoritedIds={favoritedIds}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 shadow-sm text-center">
          <p className="text-gray-600 text-lg mb-4">
            Nu ai salvat încă niciun anunț
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Explorează anunțuri →
          </Link>
        </div>
      )}
    </div>
  )
}
