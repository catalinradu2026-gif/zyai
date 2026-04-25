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
  is_system?: boolean
}

interface MessageThreadProps {
  listingId: string
  currentUserId: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  initialMessages: Message[]
  listingTitle?: string
  listingPrice?: number
  listingCurrency?: string
  isSellerView?: boolean
}

export default function MessageThread({
  listingId,
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  initialMessages,
  listingTitle,
  listingPrice,
  listingCurrency = 'EUR',
  isSellerView = false,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [minPrice, setMinPrice] = useState(listingPrice ? String(Math.round(listingPrice * 0.9)) : '')
  const [showMinPrice, setShowMinPrice] = useState(false)
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

  async function handleAiReply() {
    const lastBuyerMsg = [...messages].reverse().find(m => m.sender_id !== currentUserId)
    if (!lastBuyerMsg || !listingTitle) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingTitle,
          askPrice: listingPrice,
          minPrice: minPrice ? Number(minPrice) : listingPrice,
          buyerMessage: lastBuyerMsg.content,
          currency: listingCurrency,
        }),
      })
      const data = await res.json()
      if (data.ok && data.result?.reply) {
        setContent(data.result.reply)
      }
    } catch {}
    setAiLoading(false)
  }

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
            const isOwn = msg.sender_id === currentUserId && !msg.is_system
            const isSystem = msg.is_system

            if (isSystem) {
              const urlMatch = msg.content.match(/https?:\/\/[^\s]+/)
              const url = urlMatch?.[0]
              const textWithoutUrl = url ? msg.content.replace(url, '').replace(/\s{2,}/g, ' ').trim() : msg.content
              return (
                <div key={msg.id} className="flex justify-start gap-2 items-start">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                    style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', color: 'white' }}>
                    Z
                  </div>
                  <div style={{ maxWidth: '280px' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#A78BFA' }}>Echipa zyai.ro</p>
                    <div className="px-4 py-3 rounded-lg rounded-bl-none space-y-2"
                      style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: 'var(--text-primary)' }}>
                      <p className="text-sm">{textWithoutUrl}</p>
                      {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold transition hover:scale-[1.02]"
                          style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', color: 'white', textDecoration: 'none' }}>
                          👁️ {listingTitle ? `Vezi „${listingTitle}"` : 'Vezi anunțul pe zyai.ro'}
                        </a>
                      )}
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(msg.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            }

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
      <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {/* AI Negotiator toolbar — seller only */}
        {isSellerView && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAiReply}
              disabled={aiLoading || !messages.some(m => m.sender_id !== currentUserId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(59,130,246,0.15))', border: '1px solid rgba(139,92,246,0.4)', color: '#A78BFA' }}
            >
              {aiLoading
                ? <><span className="w-3 h-3 rounded-full border border-purple-400 border-t-transparent animate-spin" /> Generez...</>
                : <>🤖 Sugestie AI</>
              }
            </button>
            <button
              type="button"
              onClick={() => setShowMinPrice(p => !p)}
              className="text-xs px-2 py-1.5 rounded-lg transition"
              style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }}
            >
              ⚙️ Preț min
            </button>
            {showMinPrice && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder="ex: 4500"
                  className="w-24 px-2 py-1 rounded-lg text-xs focus:outline-none"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{listingCurrency}</span>
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <p className="text-xs" style={{ color: '#f87171' }}>❌ {errorMsg}</p>
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
