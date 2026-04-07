'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Salut! 👋\n\nSpune-mi ce cauți și eu îți găsesc pe zyAI.\n\nExemplu: "apartament 2 camere cluj", "job IT bucuresti", "masina dacia"',
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-open after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userQuery = input.trim()

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userQuery,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call AI search API
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const { results, parsed } = await response.json()

      // Build response
      let botText = ''

      if (results && results.length > 0) {
        botText = `Excellent! Am găsit ${results.length} anunț${results.length !== 1 ? 'uri' : ''} potrivite:\n\n`

        results.forEach((listing: any, idx: number) => {
          const price =
            listing.price && listing.price_type !== 'gratuit'
              ? `${listing.price} ${listing.currency}`
              : listing.price_type === 'gratuit'
                ? 'Gratuit'
                : 'Negociabil'

          botText += `${idx + 1}. ${listing.title}\n`
          botText += `   📍 ${listing.city} | 💰 ${price}\n\n`
        })

        botText += '👉 Deschide aplicația pentru detalii complete și pentru a contacta vânzătorul!'
      } else {
        botText = `Din păcate, nu am găsit anunțuri pentru "${parsed.product || userQuery}".\n\nIncearcă cu:\n• Alte cuvinte cheie\n• O locație diferită\n• O plajă de preț mai mare`
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Scuze, am o problemă. Încearcă din nou sau descrie mai bine ce cauți.',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-40 backdrop-blur-md border border-white/20 ${
          isOpen
            ? 'bg-blue-600/80'
            : 'bg-blue-500/70 hover:scale-110 animate-pulse'
        } text-white text-xl`}
        title={isOpen ? 'Închide' : 'Deschide chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col h-96 z-40 animate-in fade-in slide-in-from-bottom-4 border border-white/30">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-md text-white p-5 rounded-t-2xl border-b border-white/10">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🔍</span>
              <h3 className="font-bold text-lg">zyAI Search</h3>
            </div>
            <p className="text-xs text-blue-50">Găseste ce vrei instant</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-xs mt-1.5 ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString('ro-RO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
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
404: NOT_FOUND Code: DEPLOYMENT_NOT_FOUND ID: fra1::jvvlr-1775527566947-e9461f720bde
This deployment cannot be found. For more information and troubleshooting, see our documentation.        }
      `}</style>
    </>
  )
}
