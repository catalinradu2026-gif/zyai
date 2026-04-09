import { getUser } from '@/lib/actions/auth'
import { getConversations, getUnreadCount } from '@/lib/queries/messages'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Mesaje - zyAI',
}

export default async function MessagesPage() {
  const user = await getUser()

  if (!user) {
    return null
  }

  const { data: conversations } = await getConversations(user.id)
  const { count: unreadCount } = await getUnreadCount(user.id)

  return (
    <div>
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-2xl font-bold mb-2">💬 Mesajele mele</h2>
        {unreadCount > 0 && (
          <p className="text-blue-600 font-medium">
            {unreadCount} mesaj{unreadCount !== 1 ? 'e' : ''} necitit{unreadCount !== 1 ? 'e' : ''}
          </p>
        )}
      </div>

      {conversations && conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conv: any) => {
            const otherUser = conv.sender_id === user.id ? conv.receiver : conv.sender
            const otherUserId = conv.sender_id === user.id ? conv.receiver_id : conv.sender_id
            const isUnread = conv.receiver_id === user.id && !conv.read

            return (
              <Link
                key={conv.id}
                href={`/cont/mesaje/${conv.listing_id}?user=${otherUser?.id ?? otherUserId}`}
                className={`
                  block p-4 rounded-lg border transition
                  ${
                    isUnread
                      ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  {otherUser?.avatar_url && (
                    <Image
                      src={otherUser.avatar_url}
                      alt="avatar"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${isUnread ? 'text-blue-900' : 'text-gray-900'}`}>
                        {otherUser?.full_name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conv.created_at).toLocaleDateString('ro-RO')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{conv.listings?.title}</p>
                    <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {conv.content}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {isUnread && (
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-1" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 shadow-sm text-center">
          <p className="text-gray-600 text-lg mb-4">
            Niciun mesaj încă
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Explorează anunțuri →
          </Link>
        </div>
      )}
    </div>
  )
}
