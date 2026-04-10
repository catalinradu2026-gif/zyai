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
      <div className="rounded-lg p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderLeft: '4px solid #8B5CF6' }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>💬 Mesajele mele</h2>
        {unreadCount > 0 && (
          <p className="text-blue-400 font-medium">
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
                className="block p-4 rounded-lg transition"
                style={{
                  background: isUnread ? 'rgba(59,130,246,0.1)' : 'var(--bg-card)',
                  border: isUnread ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border-subtle)',
                }}
              >
                <div className="flex gap-4">
                  {otherUser?.avatar_url && (
                    <Image src={otherUser.avatar_url} alt="avatar" width={48} height={48} className="rounded-full" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {otherUser?.full_name}
                      </h3>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(conv.created_at).toLocaleDateString('ro-RO')}
                      </span>
                    </div>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{conv.listings?.title}</p>
                    <p className={`text-sm truncate ${isUnread ? 'font-semibold' : ''}`} style={{ color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {conv.content}
                    </p>
                  </div>
                  {isUnread && <div className="w-3 h-3 bg-blue-500 rounded-full mt-1" />}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg p-12 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
            Niciun mesaj încă
          </p>
          <Link href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            Explorează anunțuri →
          </Link>
        </div>
      )}
    </div>
  )
}
