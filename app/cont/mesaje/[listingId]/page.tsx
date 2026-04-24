import { getUser } from '@/lib/actions/auth'
import { getMessageThread } from '@/lib/queries/messages'
import { getListing } from '@/lib/queries/listings'
import MessageThread from '@/components/messaging/MessageThread'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = {
  params: Promise<{ listingId: string }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: Props) {
  const { listingId } = await params
  const { data: listing } = await getListing(listingId)
  return {
    title: listing ? `Chat despre ${listing.title} - zyAI` : 'zyAI',
  }
}

export default async function ConversationPage({ params, searchParams }: Props) {
  const { listingId } = await params
  const sp = await searchParams
  const user = await getUser()

  if (!user) {
    return null
  }

  // Get the other user ID from query params (passed from listing detail page)
  const otherUserId = sp.user
  if (!otherUserId) {
    notFound()
  }

  // Get listing info
  const { data: listing } = await getListing(listingId)
  if (!listing) {
    notFound()
  }

  // Get other user profile
  const supabase = (await import('@/lib/supabase-server')).createSupabaseServerClient
  const sb = await supabase()
  const { data: otherProfile } = await sb
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', otherUserId)
    .single()

  // Get messages
  const { data: messages } = await getMessageThread(listingId, user.id, otherUserId)

  // Determine otherUserName: prefer fetched profile, fallback to listing owner profile
  const listingProfileSingle = !Array.isArray(listing.profiles) ? listing.profiles as any : null
  const listingProfileArr = Array.isArray(listing.profiles) ? (listing.profiles as any[])[0] : null
  const otherUserName =
    otherProfile?.full_name ||
    (listing.user_id !== user.id ? (listingProfileSingle?.full_name || listingProfileArr?.full_name) : null) ||
    'Utilizator'
  const otherUserAvatar =
    otherProfile?.avatar_url ||
    (listing.user_id !== user.id ? (listingProfileSingle?.avatar_url || listingProfileArr?.avatar_url) : undefined)

  return (
    <main className="pt-24 pb-20 px-4 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/cont/mesaje" className="inline-block mb-6 text-sm font-medium transition-colors"
          style={{ color: '#A78BFA' }}>
          ← Înapoi la mesaje
        </Link>

        <div className="mb-6">
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Despre anunț:</p>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{listing.title}</h1>
        </div>

        <MessageThread
          listingId={listingId}
          currentUserId={user.id}
          otherUserId={otherUserId}
          otherUserName={otherUserName}
          otherUserAvatar={otherUserAvatar}
          initialMessages={messages || []}
          listingTitle={listing.title}
          listingPrice={listing.price ?? undefined}
          listingCurrency={listing.currency ?? 'EUR'}
          isSellerView={listing.user_id === user.id}
        />
      </div>
    </main>
  )
}
