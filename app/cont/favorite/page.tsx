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
  const favoritedIds = favorites?.map((l: any) => l.id) || []

  return (
    <div>
      <div className="rounded-lg p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderLeft: '4px solid #8B5CF6' }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>❤️ Anunțurile mele favorite</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {favorites?.length || 0} anunț{favorites && favorites.length !== 1 ? 'uri' : ''}
        </p>
      </div>

      {favorites && favorites.length > 0 ? (
        <div className="rounded-lg p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <ListingGrid
            listings={favorites.map((listing: any) => {
              const CATEGORY_SLUGS: Record<number, string> = { 1: 'joburi', 2: 'imobiliare', 3: 'auto', 4: 'servicii', 5: 'electronice', 6: 'moda', 7: 'casa-gradina', 8: 'sport', 9: 'animale', 10: 'mama-copilul' }
              return {
                id: listing.id,
                title: listing.title,
                description: listing.description ?? undefined,
                price: listing.price,
                price_type: listing.price_type ?? 'fix',
                currency: listing.currency ?? 'RON',
                city: listing.city,
                images: listing.images ?? [],
                created_at: listing.created_at,
                category: listing.category ?? CATEGORY_SLUGS[listing.category_id] ?? undefined,
                metadata: listing.metadata ?? null,
              }
            })}
            userId={user.id}
            favoritedIds={favoritedIds}
          />
        </div>
      ) : (
        <div className="rounded-lg p-12 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
            Nu ai salvat încă niciun anunț
          </p>
          <Link href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            Explorează anunțuri →
          </Link>
        </div>
      )}
    </div>
  )
}
