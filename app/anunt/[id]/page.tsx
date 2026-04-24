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
import PhoneRevealButton from '@/components/listings/PhoneRevealButton'
import { isFavorited as checkIsFavorited } from '@/lib/queries/favorites'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import CompareButton from '@/components/compare/CompareButton'
import AIVerdictPanel from '@/components/listings/AIVerdictPanel'
import ScamDetectorPanel from '@/components/listings/ScamDetectorPanel'
import FomoSignals from '@/components/listings/FomoSignals'
import TrustScoreWidget from '@/components/listings/TrustScoreWidget'
import BuyerAlertButton from '@/components/listings/BuyerAlertButton'
import NegotiateButton from '@/components/listings/NegotiateButton'
import ViewNotifier from '@/components/listings/ViewNotifier'
import MarkAsSoldButton from '@/components/listings/MarkAsSoldButton'
import ReactivateButton from '@/components/listings/ReactivateButton'
import BidPanel from '@/components/listings/BidPanel'
import BidTimer from '@/components/listings/BidTimer'
import ActivateBiddingButton from '@/components/listings/ActivateBiddingButton'
import StopBiddingButton from '@/components/listings/StopBiddingButton'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const { data: listing } = await getListing(id)

  const title = listing ? `${listing.title} - zyAI` : 'zyAI'
  const description = listing?.description?.substring(0, 160) ?? 'Anunț pe zyAI'
  const images = (listing?.images as string[] | null | undefined) ?? []
  const ogImage = images[0] ?? 'https://zyai.ro/og-default.png'
  const url = `https://zyai.ro/anunt/${id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'zyAI',
      images: [{ url: ogImage, width: 1200, height: 630, alt: listing?.title ?? 'zyAI' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const { data: listing, error } = await getListing(id)
  const user = await getUser()

  if (error || !listing) {
    notFound()
  }

  let listingIsFavorited = false
  if (user) {
    const { isFavorited: fav } = await checkIsFavorited(user.id, id)
    listingIsFavorited = fav
  }

  let phoneViews = 0
  const isOwnerCheck = user && user.id === listing!.user_id
  if (isOwnerCheck) {
    try {
      const admin = createSupabaseAdmin()
      const { data: pvData } = await admin
        .from('listings')
        .select('phone_views')
        .eq('id', id)
        .single()
      phoneViews = (pvData as any)?.phone_views ?? 0
    } catch { phoneViews = 0 }
  }

  const profileRaw = listing.profiles as any
  const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw

  // Seller stats for TrustScore
  let sellerListingCount = 0
  let sellerJoinedDaysAgo = 0
  let sellerAvgImages = 0
  try {
    const admin2 = createSupabaseAdmin()
    const { data: sellerListings } = await admin2
      .from('listings')
      .select('id, images, created_at')
      .eq('user_id', listing.user_id)
      .in('status', ['activ', 'vandut', 'bidding'])
    if (sellerListings?.length) {
      sellerListingCount = sellerListings.length
      const oldest = sellerListings.reduce((a: any, b: any) => new Date(a.created_at) < new Date(b.created_at) ? a : b)
      sellerJoinedDaysAgo = Math.floor((Date.now() - new Date(oldest.created_at).getTime()) / 86400000)
      const totalImages = sellerListings.reduce((sum: number, l: any) => sum + ((l.images as any[] | null)?.length || 0), 0)
      sellerAvgImages = Math.round(totalImages / sellerListings.length)
    }
  } catch {}

  const listingMetadata = (listing.metadata as any) || {}
  const contactPhone: string | null = listingMetadata.contactPhone || profile?.phone || null

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

  const CATEGORY_SLUGS_MAP: Record<number, string> = {
    1: 'joburi', 2: 'imobiliare', 3: 'auto', 4: 'servicii',
    5: 'electronice', 6: 'moda', 7: 'casa-gradina', 8: 'sport',
    9: 'animale', 10: 'mama-copilul'
  }

  const CATEGORY_NAMES: Record<number, string> = {
    1: 'Joburi', 2: 'Imobiliare', 3: 'Auto', 4: 'Servicii',
    5: 'Electronice', 6: 'Modă', 7: 'Casă & Grădină', 8: 'Sport',
    9: 'Animale', 10: 'Mamă & Copil',
  }
  const categoryName = (() => {
    const meta = (listing.metadata as any) || {}
    if (meta.subcategory) return meta.subcategory.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    return CATEGORY_NAMES[listing.category_id] || 'Nespecificată'
  })()

  return (
    <main className="pt-24 pb-20 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {user && !isOwner && (
        <ViewNotifier listingId={id} userId={user.id} sellerId={listing.user_id} listingTitle={listing.title} />
      )}
      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 text-sm">
          <Link href="/" className="breadcrumb-link">
            Acasă
          </Link>
          <span style={{ color: 'var(--border-light)' }}>›</span>
          <Link href={'/marketplace/' + (CATEGORY_SLUGS_MAP[l.category_id] || 'electronice')}
            className="transition-colors" style={{ color: 'var(--text-secondary)' }}>
            {categoryName}
          </Link>
          <span style={{ color: 'var(--border-light)' }}>›</span>
          <span className="truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{listing.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bidding banner — visible on all devices ABOVE images */}
            {listing.status === 'bidding' && m.bidding_end_time && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '2px solid rgba(251,146,60,0.6)', boxShadow: '0 0 24px rgba(251,146,60,0.2)' }}>
                <div className="px-5 py-3 flex items-center gap-3"
                  style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
                  <span className="text-white text-xl">🔥</span>
                  <div>
                    <p className="text-white font-black text-sm tracking-wide">LICITAȚIE FINALĂ ÎN CURS</p>
                    <p className="text-white/80 text-xs">Vânzătorul a acceptat o ofertă — poți depăși cu mai mult</p>
                  </div>
                </div>
                <div className="px-5 py-4 flex flex-wrap items-center gap-4"
                  style={{ background: 'rgba(251,146,60,0.08)' }}>
                  <div>
                    <p className="text-xs uppercase font-semibold mb-0.5" style={{ color: '#fb923c' }}>Ofertă acceptată</p>
                    <p className="text-2xl font-black" style={{ color: '#f97316' }}>
                      {(m.current_highest_bid || listing.price || 0).toLocaleString('ro-RO')} {listing.currency}
                    </p>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs uppercase font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>Timp rămas</p>
                    <BidTimer endTime={m.bidding_end_time} />
                  </div>
                  <a href="#bid-panel"
                    className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl font-bold text-sm text-white transition hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
                    🔥 Oferă mai mult ↓
                  </a>
                </div>
              </div>
            )}

            {/* Image Gallery */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="p-4">
                <ImageGallery
                  images={listing.images || []}
                  title={listing.title}
                  overlay={<>
                    {/* Fav — top right */}
                    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                      <FavoriteButton
                        listingId={id}
                        initialFavorited={listingIsFavorited}
                        userId={user?.id}
                        overlay
                      />
                    </div>
                    {/* Compare — bottom left */}
                    <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 10 }}>
                      <CompareButton item={{
                        id,
                        title: listing.title,
                        price: listing.price ?? undefined,
                        priceType: listing.price_type,
                        currency: listing.currency,
                        city: listing.city,
                        image: (listing.images as string[])?.[0],
                        category: CATEGORY_SLUGS_MAP[listing.category_id],
                      }} />
                    </div>
                  </>}
                />
              </div>
              <div className="px-4 pb-4">
                <ShareButtons listingId={id} listingTitle={listing.title} />
              </div>
            </div>

            {/* Title + Meta */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <h1 className="text-2xl md:text-3xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
                {listing.title}
              </h1>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {[
                  { label: 'Locație', value: `📍 ${listing.city}` },
                  { label: 'Categorie', value: categoryName },
                  { label: 'Vizualizări', value: `👁️ ${listing.views}` },
                  { label: 'Publicat', value: formattedDate },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* FOMO Signals */}
              <FomoSignals
                listingId={id}
                views={listing.views ?? 0}
                category={CATEGORY_SLUGS_MAP[listing.category_id] || ''}
                createdAt={listing.created_at}
              />

              {/* Auto Details */}
              {isAuto && (
                <div className="mt-5 mb-5">
                  <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Caracteristici vehicul</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(autoDetails as any[]).map((d) => (
                      <div key={d.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                        <div className="text-2xl mb-1">{d.icon}</div>
                        <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{d.label}</div>
                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mt-5">
                <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Descriere</h2>
                <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Safety Section */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(234,179,8,0.3)', boxShadow: '0 0 20px rgba(234,179,8,0.08)' }}>
              <h3 className="text-base font-bold mb-4" style={{ color: '#FDE68A' }}>🛡️ Protejează-te în tranzacții sigure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: '💰', title: 'Plătește sigur', desc: 'Plătește după primire și verificare' },
                  { icon: '🔍', title: 'Verifică bunul', desc: 'Inspectează produsul înainte de plată' },
                  { icon: '📍', title: 'Loc sigur', desc: 'Întâlnește-te în locuri publice' },
                ].map(tip => (
                  <div key={tip.title} className="flex gap-3">
                    <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#FDE68A' }}>{tip.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(253,230,138,0.7)' }}>{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div>
            <div className="sticky top-24 space-y-4">

              {/* AI Verdict */}
              <AIVerdictPanel listing={{
                title: listing.title,
                price: listing.price,
                currency: listing.currency || 'RON',
                price_type: listing.price_type || '',
                city: listing.city || '',
                description: listing.description || '',
                category_id: listing.category_id,
                metadata: (listing.metadata as any) || {},
              }} />

              {/* Scam Detector */}
              <ScamDetectorPanel
                title={listing.title}
                description={listing.description || ''}
                price={listing.price}
                category={CATEGORY_SLUGS_MAP[listing.category_id] || ''}
                city={listing.city || ''}
                imageCount={(listing.images as string[] | null)?.length || 0}
              />

              {/* Favorite */}
              <FavoriteButton listingId={id} userId={user?.id} initialFavorited={listingIsFavorited} showLabel />

              {/* Price Card */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 0 24px rgba(139,92,246,0.1)' }}>
                <p className="text-xs uppercase font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>PREȚ</p>
                <h2 className="text-4xl font-black mb-1 price-text">{formattedPrice}</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {listing.price_type === 'negociabil' ? 'Negociabil' : listing.price_type === 'gratuit' ? 'Ofertă gratuită' : 'Preț fix'}
                </p>
              </div>

              {/* Contact Card */}
              <div id="bid-panel" className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                {/* Seller */}
                <div className="pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <p className="text-xs uppercase font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Vânzător</p>
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt={profile.full_name || 'Seller'} width={44} height={44} className="rounded-full" />
                    ) : (
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)' }}>
                        {(profile?.full_name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{profile?.full_name || 'Utilizator'}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>📍 {profile?.city || listing.city}</p>
                    </div>
                  </div>
                  <TrustScoreWidget
                    sellerName={profile?.full_name || 'Utilizator'}
                    hasPhone={!!profile?.phone}
                    city={profile?.city || listing.city || ''}
                    hasAvatar={!!profile?.avatar_url}
                    listingCount={sellerListingCount}
                    joinedDaysAgo={sellerJoinedDaysAgo}
                    avgImages={sellerAvgImages}
                  />
                </div>

                {/* Actions */}
                {listing.status === 'bidding' ? (
                  // LICITAȚIE — BidPanel + contact vânzător pentru cumpărători
                  <div className="space-y-3">
                    <BidPanel
                      listingId={id}
                      currentHighestBid={m.current_highest_bid || listing.price || 0}
                      biddingEndTime={m.bidding_end_time}
                      currency={listing.currency ?? 'EUR'}
                      isOwner={!!isOwner}
                      userId={user?.id}
                    />
                    {isOwner && (
                      <div className="pt-2 space-y-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <StopBiddingButton listingId={id} />
                        <MarkAsSoldButton listingId={id} categoryId={listing.category_id} currentStatus={listing.status} />
                      </div>
                    )}
                    {!isOwner && (
                      <div className="pt-2 space-y-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Contact vânzător</p>
                        {canContact && (
                          <>
                            <Link href={`/cont/mesaje/${listing.id}?user=${listing.user_id}`} className="w-full block">
                              <Button variant="primary" size="lg" fullWidth icon="💬">Trimite mesaj</Button>
                            </Link>
                            {contactPhone && (
                              <a href={`https://wa.me/${contactPhone.replace(/\D/g, '')}?text=Sunt%20interesat%20de:%20${encodeURIComponent(listing.title)}`}
                                target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition hover:scale-105"
                                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ADE80' }}>
                                📱 WhatsApp
                              </a>
                            )}
                            {contactPhone && (
                              <NegotiateButton
                                listingTitle={listing.title}
                                price={listing.price}
                                currency={listing.currency || 'EUR'}
                                sellerPhone={contactPhone}
                                sellerName={profile?.full_name || 'Vânzător'}
                              />
                            )}
                            {contactPhone && <PhoneRevealButton listingId={id} userId={user?.id} />}
                          </>
                        )}
                        {needsLogin && (
                          <Link href={`/login?next=/anunt/${id}`} className="w-full block">
                            <Button variant="primary" size="lg" fullWidth>Conectare pentru contact</Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ) : listing.status === 'vandut' && !isOwner ? (
                  // VÂNDUT — cumpărătorul vede datele de contact normale ale vânzătorului
                  <div className="space-y-2">
                    <div className="rounded-xl px-4 py-2 text-center" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)' }}>
                      <p className="text-sm font-bold" style={{ color: '#f87171' }}>🔴 Produs vândut — vânzătorul poate accepta alte oferte</p>
                    </div>
                    {canContact && (
                      <>
                        <Link href={`/cont/mesaje/${listing.id}?user=${listing.user_id}`} className="w-full block">
                          <Button variant="primary" size="lg" fullWidth icon="💬">Trimite mesaj</Button>
                        </Link>
                        {contactPhone && (
                          <a href={`https://wa.me/${contactPhone.replace(/\D/g, '')}?text=Sunt%20interesat%20de:%20${encodeURIComponent(listing.title)}`}
                            target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition hover:scale-105"
                            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ADE80' }}>
                            📱 WhatsApp
                          </a>
                        )}
                        {contactPhone && (
                          <NegotiateButton
                            listingTitle={listing.title}
                            price={listing.price}
                            currency={listing.currency || 'EUR'}
                            sellerPhone={contactPhone}
                            sellerName={profile?.full_name || 'Vânzător'}
                          />
                        )}
                        {contactPhone && <PhoneRevealButton listingId={id} userId={user?.id} />}
                      </>
                    )}
                    {needsLogin && (
                      <Link href={`/login?next=/anunt/${id}`} className="w-full block">
                        <Button variant="primary" size="lg" fullWidth>Conectare pentru contact</Button>
                      </Link>
                    )}
                  </div>
                ) : isOwner ? (
                  <div className="space-y-3">
                    <div className="rounded-xl p-4 text-center"
                      style={{
                        background: listing.status === 'vandut' ? 'rgba(220,38,38,0.1)' : 'rgba(139,92,246,0.1)',
                        border: `1px solid ${listing.status === 'vandut' ? 'rgba(220,38,38,0.3)' : 'rgba(139,92,246,0.3)'}`,
                      }}>
                      <p className="text-sm font-semibold" style={{ color: listing.status === 'vandut' ? '#f87171' : '#A78BFA' }}>
                        {listing.status === 'vandut' ? '🔴 Anunț vândut' : '✓ Acesta este anunțul tău'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Publicat pe {formattedDate}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>👁️ {listing.views ?? 0}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>vizualizări</p>
                      </div>
                      <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>📞 {phoneViews}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>nr. tel văzut</p>
                      </div>
                    </div>
                    {listing.status === 'vandut' ? (
                      <>
                        {/* Contact câștigător licitație */}
                        {m.sold_via === 'bidding' && (m.winner_phone || m.winner_name || m.winner_id) && (
                          <div className="rounded-xl p-4 space-y-3"
                            style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.3)' }}>
                            <p className="text-xs font-bold uppercase" style={{ color: '#fb923c' }}>
                              🏆 Câștigător licitație
                            </p>
                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                              {m.winner_name || 'Utilizator'}
                            </p>
                            {m.winner_phone && (
                              <a href={`tel:${m.winner_phone}`}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm text-white w-full justify-center transition hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                                📞 Sună: {m.winner_phone}
                              </a>
                            )}
                            {m.winner_phone && (
                              <a href={`https://wa.me/${m.winner_phone.replace(/\D/g, '')}?text=Bună! Am văzut că ai licitat pentru anunțul meu. Hai să stabilim o vizionare.`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm w-full justify-center transition hover:scale-105"
                                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80' }}>
                                💬 WhatsApp
                              </a>
                            )}
                            {m.winner_id && (
                              <a href={`/cont/mesaje/${id}?user=${m.winner_id}`}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm w-full justify-center transition hover:scale-105"
                                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#A78BFA' }}>
                                ✉️ Mesaj în platformă
                              </a>
                            )}
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Ofertă câștigătoare: <strong style={{ color: '#fb923c' }}>{(m.winning_bid || 0).toLocaleString('ro-RO')} {listing.currency}</strong>
                            </p>
                          </div>
                        )}
                        <ActivateBiddingButton listingId={id} categoryId={listing.category_id} fromSold />
                        <div className="flex gap-2">
                          <ReactivateButton listingId={id} />
                          <DeleteListingButton id={id} />
                        </div>
                      </>
                    ) : (
                      <>
                        <MarkAsSoldButton listingId={id} categoryId={listing.category_id} currentStatus={listing.status} />
                        <ActivateBiddingButton listingId={id} categoryId={listing.category_id} />
                        <div className="flex gap-2">
                          <Link href={`/anunt/${id}/edit`} className="flex-1">
                            <Button variant="secondary" size="md" fullWidth>✏️ Editează</Button>
                          </Link>
                          <DeleteListingButton id={id} />
                        </div>
                      </>
                    )}
                  </div>
                ) : canContact ? (
                  <div className="space-y-2">
                    <Link href={`/cont/mesaje/${listing.id}?user=${listing.user_id}`} className="w-full block">
                      <Button variant="primary" size="lg" fullWidth icon="💬">Trimite mesaj</Button>
                    </Link>
                    {contactPhone && (
                      <a href={`https://wa.me/${contactPhone.replace(/\D/g, '')}?text=Sunt%20interesat%20de:%20${encodeURIComponent(listing.title)}`}
                        target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition hover:scale-105"
                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ADE80' }}>
                        📱 WhatsApp
                      </a>
                    )}
                    <NegotiateButton
                      listingTitle={listing.title}
                      price={listing.price}
                      currency={listing.currency || 'EUR'}
                      sellerPhone={contactPhone || ''}
                      sellerName={profile?.full_name || 'Vânzător'}
                    />
                    {contactPhone && <PhoneRevealButton listingId={id} userId={user?.id} />}
                  </div>
                ) : needsLogin ? (
                  <div className="space-y-2">
                    <Link href={`/login?next=/anunt/${id}`} className="w-full block">
                      <Button variant="primary" size="lg" fullWidth>Conectare pentru contact</Button>
                    </Link>
                    {contactPhone && <PhoneRevealButton listingId={id} userId={undefined} />}
                  </div>
                ) : null}
              </div>

              {/* Share Card */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-xs uppercase font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Distribuie</p>
                <ShareButtons listingId={id} listingTitle={listing.title} />
              </div>

              {/* Report */}
              <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <button className="text-sm font-medium transition hover:opacity-80" style={{ color: 'rgba(239,68,68,0.7)' }}>
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
