'use client'

import { useState, useRef, useEffect } from 'react'

type ChatListing = {
  id: string
  title: string
  price: number | null
  price_type: string
  currency: string
  city: string
  images: string[]
  created_at: string
}

type Message = {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  listings?: ChatListing[]
  type?: 'search' | 'chat'
}

type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

const initialMessage: Message = {
  id: '1',
  text: 'Salut! 👋 Sunt zyAI, asistentul tău.\n\nSpune-mi ce cauți și îți găsesc instant anunțuri:\n• "apartament 2 camere Cluj"\n• "job programator"\n• "Dacia Logan sub 5000 lei"',
  sender: 'bot',
  timestamp: new Date(),
}

function WidgetListingCard({ listing }: { listing: ChatListing }) {
  const price =
    listing.price && listing.price_type !== 'gratuit'
      ? `${listing.price.toLocaleString('ro-RO')} ${listing.currency}`
      : listing.price_type === 'negociabil'
        ? 'Negociabil'
        : 'Gratuit'

  const firstImage = listing.images?.[0]

  return (
    <a
      href={`/anunt/${listing.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-400 transition-all duration-200 group"
    >
      {/* Imagine */}
      {firstImage ? (
        <div className="relative w-full h-20 bg-gray-100">
          <img
            src={firstImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:brightness-110 transition-all"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full h-20 bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-xl">📷</span>
        </div>
      )}

      {/* Continut */}
      <div className="p-2">
        <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
          {listing.title}
        </p>
        <p className="text-sm font-bold text-green-600">{price}</p>
        <p className="text-xs text-gray-500">📍 {listing.city}</p>
      </div>
    </a>
  )
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Extracted send logic
  const sendMessage = async (userQuery: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userQuery,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery, history }),
      })

      if (!response.ok) throw new Error('Chat failed')

      const data: { type: 'search' | 'chat'; message: string; listings?: ChatListing[] } =
        await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
        listings: data.listings,
        type: data.type,
      }

      setMessages((prev) => [...prev, botMessage])
      setHistory((prev) => [...prev, { role: 'user', content: userQuery }, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Scuze, am o problemă temporară. Încearcă din nou.',
        sender: 'bot',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  // Auto-open after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Listen for hero search query
  useEffect(() => {
    function handleOpenChat(e: Event) {
      const customEvent = e as CustomEvent<string>
      const query = customEvent.detail
      setIsOpen(true)

      // Send message directly
      setTimeout(() => {
        sendMessage(query)
      }, 300)
    }

    window.addEventListener('openChatWithQuery', handleOpenChat)
    return () => window.removeEventListener('openChatWithQuery', handleOpenChat)
  }, [sendMessage])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userQuery = input.trim()
    setInput('')
    sendMessage(userQuery)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-10 left-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 backdrop-blur-md border border-white/20 ${
          isOpen ? 'bg-blue-600/80' : 'bg-blue-500/70 hover:scale-110 animate-pulse'
        } text-white text-3xl`}
        title={isOpen ? 'Închide' : 'Deschide chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-32 left-6 w-[420px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col h-[600px] z-50 animate-in fade-in slide-in-from-bottom-4 border border-white/30">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold text-base">zyAI Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
                    <span className="text-xs text-blue-100">Online • Powered by AI</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white text-xl transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                  {/* Bubble text */}
                  <div
                    className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString('ro-RO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Carduri listings (doar pentru mesaje bot cu listings) */}
                  {msg.listings && msg.listings.length > 0 && (
                    <div className="w-full grid grid-cols-2 gap-2 mt-1">
                      {msg.listings.map((listing) => (
                        <WidgetListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/50 backdrop-blur-md rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ce cauți?"
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-white/30 bg-white/80 rounded-full focus:outline-none focus:border-blue-400 focus:bg-white text-sm disabled:opacity-50 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-blue-600/90 hover:bg-blue-700/90 text-white rounded-full transition disabled:opacity-50 font-medium backdrop-blur-sm"
              >
                🔍
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce {
          animation: bounce 1.4s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-in {
          animation: slideInUp 0.3s ease-out;
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .slide-in-from-bottom-4 {
          animation: slideInUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
