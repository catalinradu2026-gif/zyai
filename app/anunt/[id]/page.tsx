import { use } from 'react'
import { getListing } from '@/lib/queries/listings'
import { getUser } from '@/lib/actions/auth'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const { data: listing } = await getListing(id)
  return {
    title: listing ? `${listing.title} - zyAI` : 'zyAI',
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const { data: listing, error } = await getListing(id)
  const user = await getUser()

  if (error || !listing) {
    notFound()
  }

  const formattedPrice =
    listing.price && listing.price_type !== 'gratuit'
      ? `${listing.price.toLocaleString('ro-RO')} ${listing.currency}`
      : listing.price_type === 'negociabil'
        ? 'Preț negociabil'
        : 'Gratuit'

  return (
    <main className="pt-24 pb-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/marketplace/joburi" className="text-blue-600 hover:underline mb-6">
          ← Înapoi la anunțuri
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-8">
              {listing.images && listing.images.length > 0 ? (
                <div className="relative w-full h-96 bg-gray-100">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">📷</span>
                </div>
              )}

              {/* Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="p-4 grid grid-cols-6 gap-2">
                  {listing.images.slice(0, 6).map((img, i) => (
                    <Image
                      key={i}
                      src={img}
                      alt="thumbnail"
                      width={100}
                      height={100}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>

              <div className="flex gap-4 mb-6 pb-6 border-b">
                <div>
                  <p className="text-gray-600 text-sm">Locație</p>
                  <p className="text-lg font-semibold">📍 {listing.city}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Categorie</p>
                  <p className="text-lg font-semibold">{listing.categories?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Vizualizări</p>
                  <p className="text-lg font-semibold">{listing.views}</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">Descriere</h2>
              <p className="text-gray-700 whitespace-pre-wrap mb-6">{listing.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Price Card */}
            <div className="bg-white rounded-lg p-8 shadow-lg sticky top-24 mb-6">
              <p className="text-4xl font-bold text-green-600 mb-6">{formattedPrice}</p>

              {/* Contact Info */}
              <div className="mb-6 pb-6 border-b">
                <p className="text-sm text-gray-600 mb-2">Vânzător</p>
                <div className="flex items-center gap-3">
                  {listing.profiles?.avatar_url && (
                    <Image
                      src={listing.profiles.avatar_url}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{listing.profiles?.full_name}</p>
                    <p className="text-sm text-gray-600">{listing.profiles?.city}</p>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              {user && user.id !== listing.user_id ? (
                <div className="space-y-3">
                  <Link
                    href={`/cont/mesaje/${listing.id}`}
                    className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
                  >
                    💬 Trimite mesaj
                  </Link>
                  {listing.profiles?.phone && (
                    <a
                      href={`https://wa.me/${listing.profiles.phone.replace(/\D/g, '')}?text=Sunt interesat de: ${encodeURIComponent(listing.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-center"
                    >
                      📱 WhatsApp
                    </a>
                  )}
                </div>
              ) : user && user.id === listing.user_id ? (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-900 font-medium">Acesta este anunțul tău</p>
                  <p className="text-sm text-blue-700">Editor: {listing.created_at}</p>
                </div>
              ) : (
                <Link
                  href={`/login?next=/anunt/${id}`}
                  className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
                >
                  Conectare pentru contact
                </Link>
              )}
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Protejează-te</p>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• Plătește după primire</li>
                <li>• Verifică bunul înainte</li>
                <li>• Intâlnește-te într-un loc sigur</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
