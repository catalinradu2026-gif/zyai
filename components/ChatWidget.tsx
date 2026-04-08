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

const WELCOME = 'Salut! Sunt zyAI 👋 Spune-mi ce cauți și îți găsesc instant cele mai bune anunțuri.'

function prepareForSpeech(text: string): string {
  return text
    // Engleza pronuntata romaneste
    .replace(/WhatsApp/gi, 'uotsap')
    // Unitati
    .replace(/(\d+)\s*lei\/noapte/gi, '$1 lei pe noapte')
    .replace(/(\d+)\s*lei\/zi/gi, '$1 lei pe zi')
    .replace(/(\d+)%/g, '$1 procente')
    // Sarita cratima si slash din cuvinte
    .replace(/(\w)-(\w)/g, '$1 $2')
    .replace(/(\w)\/(\w)/g, '$1 $2')
    // Emojis si markdown
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .replace(/[*_~`#]/g, '')
    .trim()
}

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const clean = prepareForSpeech(text)
  const utt = new SpeechSynthesisUtterance(clean)
  utt.lang = 'ro-RO'
  utt.rate = 0.9
  utt.pitch = 0.85
  utt.volume = 1
  const voices = window.speechSynthesis.getVoices()
  // Prefer voce feminina romana, apoi feminina engleza, apoi orice
  const roFem = voices.find(v => v.lang.startsWith('ro') && v.name.toLowerCase().includes('female'))
    || voices.find(v => v.lang.startsWith('ro') && (v.name.includes('Ioana') || v.name.includes('Carmen') || v.name.includes('Maria')))
    || voices.find(v => v.lang.startsWith('ro'))
    || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
    || voices.find(v => v.lang.startsWith('en-GB'))
    || voices.find(v => ['Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria'].some(n => v.name.includes(n)))
    || voices[0]
  if (roFem) utt.voice = roFem
  window.speechSynthesis.speak(utt)
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
      className="block bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-400 hover:bg-white/90 transition-all duration-200 group"
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
        <div className="w-full h-20 bg-gradient-to-br from-blue-50/70 to-gray-100/70 backdrop-blur-sm flex items-center justify-center">
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
  const [open, setOpen] = useState(false)
  const [bubble, setBubble] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: WELCOME,
      sender: 'bot',
      timestamp: new Date('2026-04-08T20:00:00.000Z'),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryMessage[]>([])
  const [voiceOn, setVoiceOn] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Bubble apare dupa 2 secunde
  useEffect(() => {
    const t = setTimeout(() => setBubble(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // La deschidere: ascunde bubble, focus input
  useEffect(() => {
    if (open) {
      setBubble(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Stop voice la inchidere
  useEffect(() => {
    if (!open && typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }, [open])

  // Listen for hero search query
  useEffect(() => {
    function handleOpenChat(e: Event) {
      const customEvent = e as CustomEvent<string>
      const query = customEvent.detail
      setOpen(true)

      // Send message directly
      setTimeout(() => {
        sendMessage(query)
      }, 300)
    }

    window.addEventListener('openChatWithQuery', handleOpenChat)
    return () => window.removeEventListener('openChatWithQuery', handleOpenChat)
  }, [])

  function speakText(text: string) {
    if (!voiceOn) return
    setSpeaking(true)
    const trySpeak = () => {
      speak(text)
      const interval = setInterval(() => {
        if (!window.speechSynthesis.speaking) { setSpeaking(false); clearInterval(interval) }
      }, 200)
      setTimeout(() => { setSpeaking(false); clearInterval(interval) }, 15000)
    }
    if (window.speechSynthesis.getVoices().length > 0) {
      trySpeak()
    } else {
      window.speechSynthesis.onvoiceschanged = () => { trySpeak(); window.speechSynthesis.onvoiceschanged = null }
    }
  }

  function handleFirstInteraction() {
    if (!userInteracted) {
      setUserInteracted(true)
      speakText(WELCOME)
    }
  }

  function toggleVoice() {
    if (voiceOn) window.speechSynthesis?.cancel()
    setVoiceOn(v => !v)
    setSpeaking(false)
  }

  // Extracted send logic
  const sendMessage = async (userQuery: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userQuery,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setShowGuide(false)

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
      speakText(data.message)
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

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userQuery = input.trim()
    sendMessage(userQuery)
  }

  return (
    <>
      {/* Toggle button - fixed bottom-right */}
      <button
        onClick={() => { setOpen(o => !o); setBubble(false) }}
        className="fixed bottom-8 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        title="zyAI Chat"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}
      </button>

      {/* Bubble notification */}
      {bubble && !open && (
        <div
          className="fixed bottom-8 left-4 z-50 bg-white rounded-2xl rounded-bl-none shadow-xl border border-gray-100 px-4 py-3 max-w-[220px] cursor-pointer"
          onClick={() => { setOpen(true); setBubble(false) }}
        >
          <button
            className="absolute -top-2 -left-2 bg-gray-200 rounded-full w-5 h-5 text-xs flex items-center justify-center text-gray-500 hover:bg-gray-300"
            onClick={e => { e.stopPropagation(); setBubble(false) }}
          >×</button>
          <p className="text-sm text-gray-800">Salut! Sunt zyAI. Te ajut să găsești anunțuri. Scrie ce cauți!</p>
        </div>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-4 left-4 md:left-auto z-50 md:w-[340px] bg-white rounded-2xl shadow-2xl flex flex-col h-[480px] max-h-[70dvh] border border-gray-100">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl border-b border-gray-100 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm shrink-0">💬</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">zyAI Assistant</p>
              <div className="flex items-center gap-1.5">
                {speaking ? (
                  <>
                    <span className="flex gap-0.5">
                      <span className="w-0.5 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-0.5 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                      <span className="w-0.5 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    </span>
                    <p className="text-white/80 text-xs">Vorbesc...</p>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    <p className="text-white/60 text-xs">Online • Powered by AI</p>
                  </>
                )}
              </div>
            </div>

            {/* Voice toggle button */}
            <button onClick={toggleVoice} title={voiceOn ? 'Oprește vocea' : 'Pornește vocea'}
              className={`p-1.5 rounded-full transition-colors ${voiceOn ? 'text-white hover:bg-white/20' : 'text-white/30 hover:bg-white/10'}`}>
              {voiceOn ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M9 12H3m18 0h-6" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-xl transition"
            >
              ✕
            </button>
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

            {/* Ghid microfon */}
            {showGuide && messages.length === 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 w-full text-center cursor-pointer mt-1"
                onClick={handleFirstInteraction}>
                <p className="text-blue-700 font-semibold text-sm mb-1">🎤 Vorbește cu mine!</p>
                <p className="text-blue-500 text-xs leading-relaxed">Apasă pe câmpul de text de jos,<br/>apoi apasă <strong>🎤</strong> de pe tastatură</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={handleFirstInteraction}
                placeholder="Ce cauți?"
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50"
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
    </>
  )
}
