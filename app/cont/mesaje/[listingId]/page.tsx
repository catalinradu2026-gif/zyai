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

  // Get other user info
  const { data: otherUser } = await fetch(
    // This is a workaround - in real app you'd query profiles table
    new Request(new URL('/_next/data/static.json', 'http://localhost:3000'))
  )
    .then(() => ({ data: null }))
    .catch(() => ({ data: null }))

  // Get messages
  const { data: messages } = await getMessageThread(listingId, user.id, otherUserId)

  return (
    <main className="pt-24 pb-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Link href="/cont/mesaje" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Înapoi la mesaje
        </Link>

        <div className="mb-6">
          <p className="text-gray-600 text-sm">Despre anunț:</p>
          <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
        </div>

        <MessageThread
          listingId={listingId}
          currentUserId={user.id}
          otherUserId={otherUserId}
          otherUserName={(listing.profiles as any)?.full_name || (Array.isArray(listing.profiles) ? (listing.profiles as any[])[0]?.full_name : null) || 'Utilizator'}
          otherUserAvatar={(listing.profiles as any)?.avatar_url || (Array.isArray(listing.profiles) ? (listing.profiles as any[])[0]?.avatar_url : null)}
          initialMessages={messages || []}
        />
      </div>
    </main>
  )
}
