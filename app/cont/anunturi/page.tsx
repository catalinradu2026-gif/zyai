import { getUser } from '@/lib/actions/auth'
import { getUserListings } from '@/lib/queries/listings'
import Link from 'next/link'
import Image from 'next/image'

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
    <div>
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📝 Anunțurile mele</h2>
            <p className="text-gray-600">
              {listings?.length || 0} anunț{listings && listings.length !== 1 ? 'uri' : ''}
            </p>
          </div>
          <Link
            href="/anunt/nou"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            ➕ Nou anunț
          </Link>
        </div>
      </div>

      {listings && listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map((listing: any) => (
            <div
              key={listing.id}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition flex gap-4"
            >
              {/* Image */}
              {listing.images && listing.images.length > 0 ? (
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400 text-2xl">📷</span>
                </div>
              )}

              {/* Content */}
              <div className="flex-1">
                <Link
                  href={`/anunt/${listing.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
                >
                  {listing.title}
                </Link>
                <p className="text-green-600 font-bold mb-2">
                  {listing.price ? `${listing.price} ${listing.currency}` : 'Gratuit'}
                </p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>📍 {listing.city}</span>
                  <span>👁️ {listing.views} vizualizări</span>
                  <span
                    className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${
                        listing.status === 'activ'
                          ? 'bg-green-100 text-green-700'
                          : listing.status === 'vandut'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }
                    `}
                  >
                    {listing.status === 'activ'
                      ? '✓ Activ'
                      : listing.status === 'vandut'
                        ? '✓ Vândut'
                        : 'Inactiv'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/anunt/${listing.id}`}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition text-center"
                >
                  Detalii
                </Link>
                {/* Edit si Delete buttons - TODO */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 shadow-sm text-center">
          <p className="text-gray-600 text-lg mb-4">Nu ai postat niciun anunț încă</p>
          <Link
            href="/anunt/nou"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Postează-ți primul anunț →
          </Link>
        </div>
      )}
    </div>
  )
}
