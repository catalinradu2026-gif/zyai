'use client'

import { useState, useRef, useEffect } from 'react'

// WAV silențios minim — folosit pentru a "debloca" elementul <audio> pe iOS Safari
// iOS blochează .play() dacă nu a fost apelat anterior dintr-un user gesture
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

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
  imageBase64?: string
  speechText?: string  // Textul pregătit pentru speech (setat la trimitere)
}

type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME = 'Salut! Sunt zyAI 👋 Spune-mi ce cauți și îți găsesc instant cele mai bune anunțuri.'

// Stochează dacă speechSynthesis a fost deblocat în această sesiune de browser
// Chrome permite speak() doar după un user gesture — odată deblocat, rămâne deblocat pe tab
let speechUnlocked = false

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
    .replace(/[\u{2600}-\u{27FF}]/gu, '')
    .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/[*_~`#]/g, '')
    .trim()
}

function getBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  return voices.find(v => v.lang.startsWith('ro') && v.name.toLowerCase().includes('female'))
    || voices.find(v => v.lang.startsWith('ro') && (v.name.includes('Ioana') || v.name.includes('Carmen') || v.name.includes('Maria')))
    || voices.find(v => v.lang.startsWith('ro'))
    || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
    || voices.find(v => v.lang.startsWith('en-GB'))
    || voices.find(v => ['Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria'].some(n => v.name.includes(n)))
    || voices[0]
}

function speakNow(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const clean = prepareForSpeech(text)
  if (!clean) return
  const utt = new SpeechSynthesisUtterance(clean)
  utt.lang = 'ro-RO'
  utt.rate = 0.9
  utt.pitch = 0.85
  utt.volume = 1
  const voice = getBestVoice()
  if (voice) utt.voice = voice
  window.speechSynthesis.speak(utt)
  // iOS Safari fix: speechSynthesis se oprește singur după ~15s fără resume()
  window.speechSynthesis.resume()
}

// Încearcă să deblocheze speechSynthesis în contextul unui user gesture
// Returnează true dacă a reușit (sau era deja deblocat)
function tryUnlockSpeech(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false
  if (speechUnlocked) return true
  try {
    // Un utterance cu spațiu (nu gol) — Chrome ignoră string-urile complet goale
    const unlock = new SpeechSynthesisUtterance(' ')
    unlock.volume = 0
    unlock.rate = 10  // Cât mai rapid posibil
    window.speechSynthesis.speak(unlock)
    speechUnlocked = true
    return true
  } catch {
    return false
  }
}

// speak() cu fallback: dacă vocea e disponibilă imediat → vorbește, altfel așteaptă vocile
function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    speakNow(text)
  } else {
    // Vocile nu sunt încă încărcate — așteptăm onvoiceschanged
    const handler = () => {
      window.speechSynthesis.onvoiceschanged = null
      speakNow(text)
    }
    window.speechSynthesis.onvoiceschanged = handler
    // Safety timeout — dacă onvoiceschanged nu vine, vorbim oricum după 500ms
    setTimeout(() => {
      if (window.speechSynthesis.onvoiceschanged === handler) {
        window.speechSynthesis.onvoiceschanged = null
        speakNow(text)
      }
    }, 500)
  }
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
  const [listening, setListening] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const sendMessageRef = useRef<(q: string) => Promise<void>>(async () => {})
  const voiceOnRef = useRef(true)
  const pendingHeroQueryRef = useRef<string | null>(null)
  const micVoiceReadyRef = useRef(false)
  // Audio element pentru TTS real (Groq Orpheus) — funcționează pe mobile fără restricții
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUnlockedRef = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Inițializăm elementul <audio> o singură dată
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.preload = 'auto'
    return () => { audioRef.current?.pause() }
  }, [])

  // Deblochează elementul audio pe iOS — trebuie apelat dintr-un user gesture
  function unlockAudio() {
    if (audioUnlockedRef.current || !audioRef.current) return
    audioRef.current.src = SILENT_WAV
    audioRef.current.play().then(() => {
      audioUnlockedRef.current = true
    }).catch(() => {})
  }

  // Redă textul via Groq TTS — funcționează pe mobile fără restricții de autoplay
  async function playTTS(text: string) {
    if (!voiceOnRef.current || !audioRef.current) return
    try {
      setSpeaking(true)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) { setSpeaking(false); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      audioRef.current.src = url
      audioRef.current.onended = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      audioRef.current.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      await audioRef.current.play()
    } catch {
      setSpeaking(false)
    }
  }

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

  // Ține refs la zi după fiecare render
  useEffect(() => { voiceOnRef.current = voiceOn }, [voiceOn])

  // Listen for hero search query — folosim ref ca să evităm stale closure
  useEffect(() => {
    function handleOpenChat(e: Event) {
      const customEvent = e as CustomEvent<string>
      const query = customEvent.detail
      // dispatchEvent() este sincron — suntem în același call stack cu gestul utilizatorului
      // Deci putem debloca ACUM atât speech synthesis cât și elementul audio
      tryUnlockSpeech()
      unlockAudio()
      pendingHeroQueryRef.current = query
      setOpen(true)
      setUserInteracted(true)
    }
    window.addEventListener('openChatWithQuery', handleOpenChat)
    return () => window.removeEventListener('openChatWithQuery', handleOpenChat)
  }, [])

  // Când widgetul se deschide și există un query pending din hero search, îl trimitem
  // Acest effect rulează după render, deci sendMessageRef e deja actualizat
  useEffect(() => {
    if (open && pendingHeroQueryRef.current) {
      const query = pendingHeroQueryRef.current
      pendingHeroQueryRef.current = null
      // Mic delay ca să fie siguri că widgetul e vizibil și ref-ul e fresh
      setTimeout(() => sendMessageRef.current(query), 150)
    }
  }, [open])

  function speakText(text: string) {
    if (!voiceOnRef.current) return
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    setSpeaking(true)
    speak(text)
    // Monitorizăm sfârșitul vorbirii
    const interval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeaking(false)
        clearInterval(interval)
      }
    }, 200)
    // Safety timeout 15s
    setTimeout(() => { setSpeaking(false); clearInterval(interval) }, 15000)
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

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    setUserInteracted(true)
    unlockAudio()  // deblocăm audio element în contextul direct al tap-ului
    micVoiceReadyRef.current = true

    const rec = new SR()
    rec.lang = 'ro-RO'
    rec.interimResults = false
    rec.maxAlternatives = 1
    recognitionRef.current = rec
    setListening(true)
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setListening(false)
      setTimeout(() => sendMessage(transcript), 100)
    }
    rec.onerror = () => { setListening(false); micVoiceReadyRef.current = false }
    rec.onend = () => setListening(false)
    rec.start()
  }

  // Image analysis flow
  const analyzeImage = async (base64: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text: '📷 Am trimis o poză pentru evaluare preț',
      sender: 'user',
      timestamp: new Date(),
      imageBase64: base64,
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setShowGuide(false)

    try {
      // Pasul 1: analizează imaginea
      const analyzeRes = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })
      if (!analyzeRes.ok) throw new Error('analyze failed')
      const { result: product } = await analyzeRes.json()

      // Pasul 2: estimează prețul (cu detalii specifice categoriei)
      const priceRes = await fetch('/api/ai/suggest-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory,
          condition: product.condition,
          brand: product.brand,
          details: product.details,
        }),
      })
      if (!priceRes.ok) throw new Error('price failed')
      const { result: price } = await priceRes.json()

      const botText = [
        `📸 ${product.title}`,
        `Stare: ${product.condition}${product.brand ? ` • ${product.brand}` : ''}`,
        '',
        `💰 Preț recomandat: ${price.suggested} ${price.currency}`,
        `📊 Interval: ${price.min}–${price.max} ${price.currency}`,
        `💡 ${price.reasoning}`,
        price.tips?.length ? `\n🎯 ${price.tips.join(' • ')}` : '',
      ].filter(Boolean).join('\n')

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'chat',
      }])
      speakText(`Am analizat imaginea. ${product.title}. Preț recomandat: ${price.suggested} ${price.currency}.`)
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Nu am putut analiza imaginea. Încearcă din nou cu o poză mai clară.',
        sender: 'bot',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Imaginea e prea mare (max 5MB). Încearcă o altă poză.',
        sender: 'bot',
        timestamp: new Date(),
      }])
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      analyzeImage(base64)
    }
    reader.readAsDataURL(file)
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

      // Text vocal natural, scurt, ca un asistent expert în marketplace
      let voiceLine = ''
      if (data.type === 'search' && data.listings && data.listings.length > 0) {
        const n = data.listings.length
        const first = data.listings[0]
        const priceStr = first.price
          ? `${first.price.toLocaleString('ro-RO')} ${first.currency}`
          : 'negociabil'
        const city = first.city ? `, în ${first.city}` : ''
        if (n === 1) {
          voiceLine = `Am găsit un anunț: ${first.title}, la ${priceStr}${city}.`
        } else {
          voiceLine = `Am găsit ${n} anunțuri. Cel mai bun: ${first.title}, la ${priceStr}${city}.`
        }
      } else if (data.type === 'search') {
        voiceLine = 'Nu am găsit nimic pentru această căutare. Încearcă alte cuvinte.'
      } else {
        // Pentru chat, limităm la primul propoziție ca să fie scurt
        voiceLine = data.message.split('.')[0] + '.'
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
        listings: data.listings,
        type: data.type,
        speechText: voiceLine,  // Stocat pentru butonul 🔊 fallback
      }

      setMessages((prev) => [...prev, botMessage])
      setHistory((prev) => [...prev, { role: 'user', content: userQuery }, { role: 'assistant', content: data.message }])

      micVoiceReadyRef.current = false
      playTTS(voiceLine)
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

  // Ține sendMessageRef la zi după fiecare render (fără deps = runs every render)
  useEffect(() => { sendMessageRef.current = sendMessage })

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    unlockAudio()
    const userQuery = input.trim()
    sendMessage(userQuery)
  }

  return (
    <>
      {/* Toggle button - fixed bottom-right */}
      <button
        onClick={() => {
          unlockAudio()
          setOpen(o => !o)
          setBubble(false)
        }}
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
                  {/* Imagine preview (user) */}
                  {msg.imageBase64 && (
                    <img
                      src={msg.imageBase64}
                      alt="Poză trimisă"
                      className="w-40 h-28 object-cover rounded-xl border border-blue-200 mb-1"
                    />
                  )}

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

                  {/* Buton Ascultă — apare MEREU sub orice mesaj bot */}
                  {msg.sender === 'bot' && msg.speechText && (
                    <button
                      type="button"
                      onClick={() => {
                        unlockAudio()
                        playTTS(msg.speechText!)
                      }}
                      className="flex items-center gap-2 font-semibold active:scale-95"
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '10px 20px',
                        fontSize: '15px',
                        minHeight: '44px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                      }}
                    >
                      🔊 Atinge pentru a asculta
                    </button>
                  )}

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
                type="button"
                onClick={startListening}
                disabled={loading}
                title={listening ? 'Ascult...' : 'Vorbește'}
                className={`px-3 py-2.5 border rounded-full transition disabled:opacity-50 ${
                  listening
                    ? 'bg-red-500 border-red-500 text-white animate-pulse'
                    : 'border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-400'
                }`}
              >
                🎤
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Trimite o poză pentru estimare preț"
                className="px-3 py-2.5 border border-gray-300 rounded-full text-gray-500 hover:text-blue-600 hover:border-blue-400 transition disabled:opacity-50"
              >
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
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
