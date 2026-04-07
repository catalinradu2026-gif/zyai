import { getUser } from '@/lib/actions/auth'
import { getUserListings } from '@/lib/queries/listings'
import { deleteListing } from '@/lib/actions/listings'
import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import DeleteListingButton from '@/components/listings/DeleteListingButton'

export const metadata = {
  title: 'Anunțurile mele - zyAI',
}

export default async function MyListingsPage() {
  const user = await getUser()

  if (!user) {
    return null
  }

  const { data: listings } = await getUserListings(user.id)

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-600">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">📝 Anunțurile mele</h1>
            <p className="text-gray-600">
              {listings?.length || 0} anunț{listings && listings.length !== 1 ? 'uri' : ''} active
            </p>
          </div>
          <Link href="/anunt/nou" className="flex-shrink-0">
            <Button variant="primary" size="lg">
              ➕ Nou anunț
            </Button>
          </Link>
        </div>
      </div>

      {/* Listings List */}
      {listings && listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map((listing: any) => {
            const formattedPrice =
              listing.price && listing.price_type !== 'gratuit'
                ? `${listing.price.toLocaleString('ro-RO')} ${listing.currency}`
                : listing.price_type === 'negociabil'
                  ? 'Negociabil'
                  : 'Gratuit'

            const statusColors: Record<string, string> = {
              activ: 'bg-green-100 text-green-700',
              vandut: 'bg-gray-100 text-gray-700',
              inactiv: 'bg-yellow-100 text-yellow-700',
            }

            const statusEmojis: Record<string, string> = {
              activ: '✓',
              vandut: '✓',
              inactiv: '⚠️',
            }

            return (
              <div
                key={listing.id}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition flex gap-4 border border-gray-100"
              >
                {/* Thumbnail Image */}
                <div className="flex-shrink-0">
                  {listing.images && listing.images.length > 0 ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-3xl">📷</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/anunt/${listing.id}`}
                    className="text-xl font-bold text-gray-900 hover:text-blue-600 transition line-clamp-2 block mb-2"
                  >
                    {listing.title}
                  </Link>

                  <p className="text-2xl font-bold text-green-600 mb-3">{formattedPrice}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">📍 {listing.city}</span>
                    <span className="flex items-center gap-1">👁️ {listing.views} vizualizări</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[listing.status] || statusColors.inactiv
                      }`}
                    >
                      {statusEmojis[listing.status]}{' '}
                      {listing.status === 'activ'
                        ? 'Activ'
                        : listing.status === 'vandut'
                          ? 'Vândut'
                          : 'Inactiv'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Creat: {new Date(listing.created_at).toLocaleDateString('ro-RO')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link href={`/anunt/${listing.id}`} className="w-full">
                    <Button variant="secondary" size="md" fullWidth>
                      👁️ Vezi
                    </Button>
                  </Link>

                  <Link href={`/anunt/${listing.id}/edit`} className="w-full">
                    <Button variant="secondary" size="md" fullWidth>
                      ✏️ Editează
                    </Button>
                  </Link>

                  <DeleteListingButton listingId={listing.id} listingTitle={listing.title} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-16 shadow-md text-center border border-gray-100">
          <span className="text-6xl mb-4 block">📋</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nu ai postat niciun anunț</h2>
          <p className="text-gray-600 mb-6">
            Postează-ți primul anunț și ajunge la mii de potențiali cumpărători
          </p>
          <Link href="/anunt/nou">
            <Button variant="primary" size="lg">
              Postează-ți primul anunț →
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
