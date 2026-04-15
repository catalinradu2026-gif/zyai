import { getUser } from '@/lib/actions/auth'
import { getUserListings } from '@/lib/queries/listings'
import { deleteListing } from '@/lib/actions/listings'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import DeleteListingButton from '@/components/listings/DeleteListingButton'
import MarkAsSoldButton from '@/components/listings/MarkAsSoldButton'
import ReactivateButton from '@/components/listings/ReactivateButton'
import ActivateBiddingButton from '@/components/listings/ActivateBiddingButton'

export const metadata = {
  title: 'Anunțurile mele - zyAI',
}

export default async function MyListingsPage() {
  const user = await getUser()

  if (!user) {
    return null
  }

  const { data: listings } = await getUserListings(user.id)

  // Calculăm numărul de favorite și phone_views pentru fiecare anunț
  const favCountMap: Record<string, number> = {}
  const phoneViewsMap: Record<string, number> = {}
  if (listings && listings.length > 0) {
    const listingIds = listings.map((l: any) => l.id)
    const admin = createSupabaseAdmin()

    const { data: favData } = await admin
      .from('favorites')
      .select('listing_id')
      .in('listing_id', listingIds)
    if (favData) {
      for (const row of favData) {
        favCountMap[row.listing_id] = (favCountMap[row.listing_id] || 0) + 1
      }
    }

    // phone_views — separat cu try/catch în caz că coloana nu există
    try {
      const { data: pvData } = await admin
        .from('listings')
        .select('id, phone_views')
        .in('id', listingIds)
      if (pvData) {
        for (const row of pvData) {
          phoneViewsMap[row.id] = (row as any).phone_views ?? 0
        }
      }
    } catch { /* coloana nu există încă */ }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-lg p-6 border-l-4 border-purple-500" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderLeft: '4px solid #8B5CF6' }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>📝 Anunțurile mele</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {listings?.length || 0} anunț{listings && listings.length !== 1 ? 'uri' : ''} active
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href="/cont/vandute">
              <Button variant="secondary" size="lg">
                🔴 Vândute
              </Button>
            </Link>
            <Link href="/anunt/nou">
              <Button variant="primary" size="lg">
                ➕ Nou anunț
              </Button>
            </Link>
          </div>
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
                className="rounded-lg p-4 transition flex flex-col lg:flex-row lg:gap-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                {/* Top row on mobile: image + title/price side by side */}
                <div className="flex gap-3 lg:contents">
                  {/* Thumbnail Image */}
                  <div className="flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-lg overflow-hidden">
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card-hover)' }}>
                        <span className="text-3xl">📷</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/anunt/${listing.id}`}
                      className="text-base lg:text-xl font-bold transition line-clamp-2 block mb-1" style={{ color: 'var(--text-primary)' }}
                    >
                      {listing.title}
                    </Link>

                    <p className="text-xl lg:text-2xl font-bold text-green-600 mb-2">{formattedPrice}</p>

                    {/* Stats: 2-col grid on mobile, flex-wrap on desktop */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 lg:flex lg:flex-wrap lg:gap-4 text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1 truncate">📍 {listing.city}</span>
                      <span className="flex items-center gap-1">👁️ {listing.views} viz.</span>
                      <span className="flex items-center gap-1">❤️ {favCountMap[listing.id] || 0} fav.</span>
                      <span className="flex items-center gap-1">📞 {phoneViewsMap[listing.id] || 0} tel</span>
                      <span
                        className={`col-span-2 lg:col-span-1 w-fit px-3 py-0.5 rounded-full text-xs font-semibold ${
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

                    <p className="text-xs hidden lg:block" style={{ color: 'var(--text-secondary)' }}>
                      Creat: {new Date(listing.created_at).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row gap-2 mt-3 lg:mt-0 lg:flex-col lg:flex-shrink-0 lg:justify-start">
                  <Link href={`/anunt/${listing.id}`} className="flex-1 lg:flex-none lg:w-full">
                    <Button variant="secondary" size="md" fullWidth>👁️ Vezi</Button>
                  </Link>

                  {listing.status === 'vandut' ? (
                    // SOLD — Licitație + Reactivează + Șterge
                    <>
                      <ActivateBiddingButton listingId={listing.id} categoryId={listing.category_id} fromSold />
                      <ReactivateButton listingId={listing.id} />
                      <DeleteListingButton id={listing.id} />
                    </>
                  ) : (
                    // ACTIV/BIDDING — Edit + SOLD + Licitație + Șterge
                    <>
                      <Link href={`/anunt/${listing.id}/edit`} className="flex-1 lg:flex-none lg:w-full">
                        <Button variant="secondary" size="md" fullWidth>✏️ Editează</Button>
                      </Link>
                      <MarkAsSoldButton
                        listingId={listing.id}
                        categoryId={listing.category_id}
                        currentStatus={listing.status}
                      />
                      <ActivateBiddingButton listingId={listing.id} categoryId={listing.category_id} />
                      <DeleteListingButton id={listing.id} />
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg p-16 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <span className="text-6xl mb-4 block">📋</span>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Nu ai postat niciun anunț</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
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
