import { use } from 'react'
import { getListing } from '@/lib/queries/listings'
import { getUser } from '@/lib/actions/auth'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Button from '@/components/ui/Button'
import DeleteListingButton from '@/components/listings/DeleteListingButton'
import ImageGallery from '@/components/listings/ImageGallery'
import FavoriteButton from '@/components/favorites/FavoriteButton'
import ShareButtons from '@/components/listings/ShareButtons'
import { isFavorited as checkIsFavorited } from '@/lib/queries/favorites'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const { data: listing } = await getListing(id)
  return {
    title: listing ? `${listing.title} - zyAI` : 'zyAI',
    description: listing?.description?.substring(0, 160),
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const { data: listing, error } = await getListing(id)
  const user = await getUser()

  if (error || !listing) {
    notFound()
  }

  // Verifică dacă anunțul este deja favorit
  let listingIsFavorited = false
  if (user) {
    const { isFavorited: fav } = await checkIsFavorited(user.id, id)
    listingIsFavorited = fav
  }

  // profiles poate fi array sau obiect în funcție de join
  const profileRaw = listing.profiles as any
  const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw

  const formattedPrice =
    listing.price && listing.price_type !== 'gratuit'
      ? `${listing.price.toLocaleString('ro-RO')} ${listing.currency}`
      : listing.price_type === 'negociabil'
        ? 'Preț negociabil'
        : 'Gratuit'

  const createdDate = new Date(listing.created_at)
  const formattedDate = createdDate.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const isOwner = user && user.id === listing.user_id
  const canContact = user && !isOwner
  const needsLogin = !user && !isOwner

  const l = listing as any
  const isAuto = l.category_id === 3
  const N = 'Nespecificat'
  // Citim din metadata (JSONB) — cu fallback pe coloanele auto_ dacă există
  const m = (l.metadata || {}) as Record<string, any>
  const autoDetails = isAuto ? [
    { icon: '📅', label: 'An fabricație', value: m.year || N },
    { icon: '🛣️', label: 'Kilometraj', value: m.mileage ? `${Number(m.mileage).toLocaleString('ro-RO')} km` : N },
    { icon: '⚙️', label: 'Cutie viteze', value: m.gearbox || N },
    { icon: '⛽', label: 'Combustibil', value: m.fuelType || N },
    { icon: '💪', label: 'Putere', value: m.power ? `${m.power} CP` : N },
    { icon: '✅', label: 'Stare', value: m.condition || N },
    { icon: '🏷️', label: 'Marcă/Model', value: m.brand ? `${m.brand}${m.model ? ' ' + m.model : ''}` : N },
  ] : []

  return (
    <main className="pt-24 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Înapoi
          </Link>
          <span className="text-gray-400">|</span>
          <span className="text-sm text-gray-600">{listing.city}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6 p-6">
              <ImageGallery images={listing.images || []} title={listing.title} />
            </div>

            {/* Listing Info */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{listing.title}</h1>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 pb-6 border-b border-gray-200 mb-6">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Locație</p>
                  <p className="text-lg font-semibold text-gray-900">📍 {listing.city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Categorie</p>
                  <p className="text-lg font-semibold text-gray-900">{'Nespecificată'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Vizualizări</p>
                  <p className="text-lg font-semibold text-gray-900">👁️ {listing.views}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Publicat</p>
                  <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
                </div>
              </div>

              {/* Auto Details */}
              {isAuto && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Caracteristici vehicul</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(autoDetails as any[]).map((d) => (
                      <div key={d.label} className="rounded-xl p-3 text-center" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                        <div className="text-2xl mb-1">{d.icon}</div>
                        <div className="text-xs text-gray-500 font-medium mb-0.5">{d.label}</div>
                        <div className="text-sm font-bold text-gray-900">{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Descriere</h2>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Safety Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">🛡️ Protejează-te în tranzacții sigure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">💰</span>
                  <div>
                    <p className="font-semibold text-yellow-900">Plătește sigur</p>
                    <p className="text-sm text-yellow-800">Plătește după primire și verificare</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">🔍</span>
                  <div>
                    <p className="font-semibold text-yellow-900">Verifică bunul</p>
                    <p className="text-sm text-yellow-800">Inspectează produsul înainte de plată</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">📍</span>
                  <div>
                    <p className="font-semibold text-yellow-900">Loc sigur</p>
                    <p className="text-sm text-yellow-800">Intâlnește-te în locuri publice</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Price Card - Sticky */}
            <div className="sticky top-24 space-y-4">
              {/* Favorite Button */}
              <div className="flex gap-2">
                <FavoriteButton listingId={id} userId={user?.id} initialFavorited={listingIsFavorited} showLabel />
              </div>

              {/* Price */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-lg">
                <p className="text-sm text-blue-100 mb-2">PREȚ</p>
                <h2 className="text-4xl font-bold mb-2">{formattedPrice}</h2>
                <p className="text-sm text-blue-100">
                  {listing.price_type === 'negociabil'
                    ? 'Negociabil'
                    : listing.price_type === 'gratuit'
                      ? 'Ofertă gratuită'
                      : 'Preț fix'}
                </p>
              </div>

              {/* Contact Section */}
              <div className="bg-white rounded-lg p-6 shadow-md space-y-3">
                {/* Seller Card */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-3">Vânzător</p>
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile?.avatar_url}
                        alt={profile?.full_name || 'Seller'}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {(profile?.full_name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{profile?.full_name || 'Utilizator'}</p>
                      <p className="text-sm text-gray-600">📍 {profile?.city || listing.city}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isOwner ? (
                  <div className="space-y-3 py-4 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-sm font-semibold text-blue-900">✓ Acesta este anunțul tău</p>
                      <p className="text-xs text-blue-700">Publicat pe {formattedDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/anunt/${id}/edit`} className="flex-1">
                        <Button variant="secondary" size="md" fullWidth>
                          ✏️ Editează
                        </Button>
                      </Link>
                      <DeleteListingButton id={id} />
                    </div>
                  </div>
                ) : canContact ? (
                  <div className="space-y-2 pt-2">
                    <Link href={`/cont/mesaje/${listing.id}?user=${listing.user_id}`} className="w-full block">
                      <Button variant="primary" size="lg" fullWidth icon="💬">
                        Trimite mesaj
                      </Button>
                    </Link>
                    {profile?.phone && (
                      <a
                        href={`https://wa.me/${profile?.phone.replace(/\D/g, '')}?text=Sunt%20interesat%20de:%20${encodeURIComponent(listing.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block"
                      >
                        <Button
                          variant="ghost"
                          size="lg"
                          fullWidth
                          icon="📱"
                          className="border-2 border-green-600 text-green-600 hover:bg-green-50"
                        >
                          WhatsApp
                        </Button>
                      </a>
                    )}
                  </div>
                ) : needsLogin ? (
                  <Link href={`/login?next=/anunt/${id}`} className="w-full block">
                    <Button variant="primary" size="lg" fullWidth>
                      Conectare pentru contact
                    </Button>
                  </Link>
                ) : null}
              </div>

              {/* Share Card */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-xs text-gray-600 uppercase font-semibold mb-3">Distribuie</p>
                <ShareButtons listingId={id} listingTitle={listing.title} />
              </div>

              {/* Report Card */}
              <div className="bg-white rounded-lg p-4 shadow-md text-center">
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  ⚠️ Raportează anunț
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
