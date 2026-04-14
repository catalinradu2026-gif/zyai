import { getUser } from '@/lib/actions/auth'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import Image from 'next/image'
import ReactivateButton from '@/components/listings/ReactivateButton'

export const metadata = {
  title: 'Produse vândute - zyAI',
}

export default async function SoldListingsPage() {
  const user = await getUser()
  if (!user) return null

  const admin = createSupabaseAdmin()
  const { data: listings } = await admin
    .from('listings')
    .select('id, title, price, price_type, currency, city, images, created_at, category_id, metadata')
    .eq('user_id', user.id)
    .eq('status', 'vandut')
    .order('metadata->>sold_at', { ascending: false })

  const CATEGORY_NAMES: Record<number, string> = {
    1: 'Joburi', 2: 'Imobiliare', 3: 'Auto', 4: 'Servicii',
    5: 'Electronice', 6: 'Modă', 7: 'Casă & Grădină', 8: 'Sport',
    9: 'Animale', 10: 'Mamă & Copil',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderLeft: '4px solid #dc2626' }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>🔴 Produse vândute</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {listings?.length || 0} produs{listings && listings.length !== 1 ? 'e' : ''} marcat{listings && listings.length !== 1 ? 'e' : ''} ca vândut
            </p>
          </div>
          <Link href="/cont/anunturi" className="text-sm px-4 py-2 rounded-xl transition"
            style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            ← Anunțurile mele
          </Link>
        </div>
      </div>

      {listings && listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map((listing: any) => {
            const m = listing.metadata || {}
            const soldAt = m.sold_at ? new Date(m.sold_at) : null
            const formattedPrice = listing.price && listing.price_type !== 'gratuit'
              ? `${listing.price.toLocaleString('ro-RO')} ${listing.currency}`
              : listing.price_type === 'negociabil' ? 'Negociabil' : 'Gratuit'

            return (
              <div key={listing.id} className="rounded-xl p-4 flex gap-4 items-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>

                {/* Thumbnail */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0"
                  style={{ background: 'var(--bg-card-hover)' }}>
                  {listing.images?.[0] ? (
                    <Image src={listing.images[0]} alt={listing.title} fill className="object-cover brightness-75" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">📷</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black text-white bg-red-600/90 px-1.5 py-0.5 rounded rotate-[-12deg]">SOLD</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/anunt/${listing.id}`}
                    className="font-bold text-base line-clamp-1 hover:underline"
                    style={{ color: 'var(--text-primary)' }}>
                    {listing.title}
                  </Link>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-bold text-green-500">{formattedPrice}</span>
                    <span>📍 {listing.city}</span>
                    <span>{CATEGORY_NAMES[listing.category_id] || 'Altele'}</span>
                  </div>
                  <div className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {soldAt
                      ? `Vândut: ${soldAt.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                      : `Publicat: ${new Date(listing.created_at).toLocaleDateString('ro-RO')}`
                    }
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex flex-col gap-2 min-w-[130px]">
                  <div className="px-3 py-1.5 rounded-full text-xs font-bold text-center"
                    style={{ background: 'rgba(220,38,38,0.12)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)' }}>
                    🔴 VÂNDUT
                  </div>
                  <ReactivateButton listingId={listing.id} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl p-16 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <span className="text-5xl mb-4 block">🎉</span>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Niciun produs vândut încă</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Când vinzi ceva, apasă butonul <strong>SOLD</strong> din anunțurile tale.
          </p>
        </div>
      )}
    </div>
  )
}
