'use client'

import { useState, useEffect, useRef } from 'react'
import { sendMessage } from '@/lib/actions/messages'
import { createSupabaseBrowserClient } from '@/lib/supabase'
const supabase = createSupabaseBrowserClient()
import Image from 'next/image'

interface Message {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  created_at: string
  read: boolean
}

interface MessageThreadProps {
  listingId: string
  currentUserId: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  initialMessages: Message[]
}

export default function MessageThread({
  listingId,
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Subscribe to real-time messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${listingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [listingId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || sending) return

    setSending(true)
    setErrorMsg('')
    const result = await sendMessage(listingId, otherUserId, content)

    if (result.success && result.data) {
      setMessages((prev) => [...prev, result.data])
      setContent('')
    } else if (result.error) {
      setErrorMsg('Eroare: ' + result.error)
    }
    setSending(false)
  }

  return (
    <div className="rounded-lg shadow-lg flex flex-col h-screen max-h-[600px]" style={{ background: 'var(--bg-card)' }}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {otherUserAvatar && (
          <Image
            src={otherUserAvatar}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{otherUserName}</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Activ recent</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            <p>Niciun mesaj încă. Fii primul!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'rounded-bl-none'
                  }`}
                  style={isOwn ? undefined : { background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1`}
                    style={isOwn ? { color: 'rgba(255,255,255,0.7)' } : { color: 'var(--text-secondary)' }}
                  >
                    {new Date(msg.created_at).toLocaleTimeString('ro-RO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {errorMsg && (
          <p className="text-xs mb-2" style={{ color: '#f87171' }}>❌ {errorMsg}</p>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Scrie mesaj..."
            disabled={sending}
            className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
          >
            {sending ? '...' : 'Trimite'}
          </button>
        </form>
      </div>
    </div>
  )
}
