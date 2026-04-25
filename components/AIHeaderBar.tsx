'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

// WAV silențios minim — deblochează <audio> pe iOS Safari dintr-un user gesture
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
  listings?: ChatListing[]
}

type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME = 'Salut! Sunt zyAI 👋 Spune-mi ce cauți și îți găsesc instant cele mai bune anunțuri.'
const PLACEHOLDERS = [
  'Spune-mi ce cauți...',
  'ex: iPhone ieftin București',
  'ex: BMW sub 10.000€',
  'ex: Apartament 2 camere Cluj',
  'ex: Frontend Developer remote',
]

const BARS = [0.5, 1, 0.65, 1, 0.4, 0.9, 1, 0.55]

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[*_~`#]/g, '').trim()
  const utt = new SpeechSynthesisUtterance(clean)
  utt.lang = 'ro-RO'
  utt.rate = 0.9
  utt.pitch = 0.85
  const voices = window.speechSynthesis.getVoices()
  const voice = voices.find(v => v.lang.startsWith('ro')) || voices.find(v => v.lang.startsWith('en-GB')) || voices[0]
  if (voice) utt.voice = voice
  window.speechSynthesis.speak(utt)
}

export default function AIHeaderBar() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([{ id: '0', text: WELCOME, sender: 'bot' }])
  const [history, setHistory] = useState<HistoryMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [listening, setListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [pendingTranscript, setPendingTranscript] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUnlockedRef = useRef(false)
  const voiceOnRef = useRef(true)
  const router = useRouter()

  // Inițializăm elementul <audio> o singură dată
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.preload = 'auto'
    return () => { audioRef.current?.pause() }
  }, [])

  // Ține voiceOnRef la zi
  useEffect(() => { voiceOnRef.current = voiceOn }, [voiceOn])

  function unlockAudio() {
    if (audioUnlockedRef.current || !audioRef.current) return
    audioRef.current.src = SILENT_WAV
    audioRef.current.play().then(() => { audioUnlockedRef.current = true }).catch(() => {})
  }

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
    } catch { setSpeaking(false) }
  }

  // Rotatie placeholder
  useEffect(() => {
    const iv = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 3000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
    else window.speechSynthesis?.cancel()
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for hero search
  useEffect(() => {
    function onQuery(e: Event) {
      const q = (e as CustomEvent<string>).detail
      navigateToSearch(q)
    }
    window.addEventListener('openChatWithQuery', onQuery)
    return () => window.removeEventListener('openChatWithQuery', onQuery)
  }, [])

  function speakText(text: string) {
    if (!voiceOn) return
    setSpeaking(true)
    const trySpeak = () => {
      speak(text)
      const iv = setInterval(() => {
        if (!window.speechSynthesis.speaking) { setSpeaking(false); clearInterval(iv) }
      }, 200)
      setTimeout(() => { setSpeaking(false); clearInterval(iv) }, 15000)
    }
    if (window.speechSynthesis.getVoices().length > 0) trySpeak()
    else { window.speechSynthesis.onvoiceschanged = () => { trySpeak(); window.speechSynthesis.onvoiceschanged = null } }
  }

  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Browserul tău nu suportă recunoașterea vocală.'); return }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      setInterimText('')
      return
    }

    unlockAudio()
    setPendingTranscript('')
    setInterimText('')

    const rec = new SpeechRecognition()
    rec.lang = 'ro-RO'
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 3
    recognitionRef.current = rec

    rec.onstart = () => setListening(true)
    rec.onresult = (e: any) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript
        if (e.results[i].isFinal) final += text
        else interim += text
      }
      if (interim) setInterimText(interim)
      if (final) {
        setInterimText('')
        setPendingTranscript(final.trim())
        setInput(final.trim())
      }
    }
    rec.onerror = () => { setListening(false); setInterimText('') }
    rec.onend = () => { setListening(false); setInterimText('') }
    rec.start()
  }

  function confirmVoiceSearch() {
    const q = pendingTranscript || input
    if (!q.trim()) return
    setPendingTranscript('')
    sendMessage(q.trim())
  }

  function navigateToSearch(query: string) {
    const q = query.trim()
    if (!q) return
    // Vorbește înainte de navigare
    if (voiceOn) {
      speakText(`Caut anunțuri pentru ${q}`)
      setTimeout(() => {
        setOpen(false)
        router.push(`/cauta?q=${encodeURIComponent(q)}`)
      }, 1200)
    } else {
      setOpen(false)
      router.push(`/cauta?q=${encodeURIComponent(q)}`)
    }
  }

  async function sendMessage(query: string) {
    const userMsg: Message = { id: Date.now().toString(), text: query, sender: 'user' }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history }),
      })
      const data: { type: string; message: string; listings?: ChatListing[] } = await res.json()
      const botMsg: Message = { id: (Date.now() + 1).toString(), text: data.message, sender: 'bot', listings: data.listings }
      setMessages(prev => [...prev, botMsg])
      setHistory(prev => [...prev, { role: 'user', content: query }, { role: 'assistant', content: data.message }])

      // Text vocal natural și scurt
      let voiceLine = ''
      if (data.listings && data.listings.length > 0) {
        const n = data.listings.length
        const first = data.listings[0]
        const priceStr = first.price ? `${first.price.toLocaleString('ro-RO')} ${first.currency}` : 'negociabil'
        const city = first.city ? `, în ${first.city}` : ''
        voiceLine = n === 1
          ? `Am găsit un anunț: ${first.title}, la ${priceStr}${city}.`
          : `Am găsit ${n} anunțuri. Cel mai bun: ${first.title}, la ${priceStr}${city}.`
      } else if (data.type === 'search') {
        voiceLine = 'Nu am găsit nimic. Încearcă alte cuvinte.'
      } else {
        voiceLine = data.message.split('.')[0] + '.'
      }

      playTTS(voiceLine)
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: 'Scuze, am o problemă temporară. Încearcă din nou.', sender: 'bot' }])
    } finally {
      setLoading(false)
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    navigateToSearch(input.trim())
  }

  return (
    <>
      {/* ── AI BAR în header ── */}
      <div
        className="flex items-center gap-2 transition-all duration-300"
        style={{
          flex: '1',
          maxWidth: '440px',
          gap: '6px',
        }}
      >
        {/* Search pill */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 transition-all duration-300"
          style={{
            background: 'rgba(15,22,41,0.85)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: '100px',
            flex: '1',
            cursor: 'text',
            padding: '8px 14px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.55)'
            e.currentTarget.style.boxShadow = '0 0 18px rgba(139,92,246,0.15)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Bare vocale */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            {BARS.map((h, i) => (
              <span key={i} style={{
                display: 'block', width: '2.5px', borderRadius: '99px',
                background: 'linear-gradient(to top, #8B5CF6, #60a5fa)',
                height: speaking ? `${Math.round(h * 16)}px` : '5px',
                animation: speaking ? `vbar 0.65s ease-in-out ${i * 0.08}s infinite alternate` : `vbarIdle 2s ease-in-out ${i * 0.15}s infinite alternate`,
                transition: 'height 0.3s ease',
              }} />
            ))}
          </div>
          <span className="hidden sm:block text-sm flex-1 text-left truncate" style={{ color: 'rgba(148,163,184,0.55)' }}>
            {PLACEHOLDERS[placeholderIdx]}
          </span>
        </button>

        {/* Mic button — separat, proeminent */}
        <button
          type="button"
          onClick={() => { unlockAudio(); setOpen(true); setTimeout(() => startListening(), 350) }}
          className="flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95"
          title="Vorbește cu zyAI"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: listening
              ? 'linear-gradient(135deg,#8B5CF6,#3B82F6)'
              : 'rgba(139,92,246,0.15)',
            border: `1.5px solid ${listening ? 'rgba(139,92,246,0.8)' : 'rgba(139,92,246,0.3)'}`,
            boxShadow: listening ? '0 0 18px rgba(139,92,246,0.6)' : '0 0 8px rgba(139,92,246,0.1)',
            animation: listening ? 'micPulse 1s ease-in-out infinite' : 'none',
            fontSize: '16px',
          }}
        >
          🎤
        </button>
      </div>

      {/* ── MODAL FULL-SCREEN (portal → body) ── */}
      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: 'rgba(8,11,20,0.92)', backdropFilter: 'blur(12px)' }}
        >
          {/* Header modal */}
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0F1629' }}>
            <div className="flex items-center gap-2 flex-1">
              {/* Bare vocale animate */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {BARS.map((h, i) => (
                  <span key={i} style={{
                    display: 'block', width: '3px', borderRadius: '2px',
                    background: 'linear-gradient(to top,#8B5CF6,#3B82F6)',
                    height: speaking ? `${Math.round(h * 18)}px` : '14px',
                    animation: speaking ? `vbar 0.65s ease-in-out ${i * 0.08}s infinite alternate` : `vbarIdle 1.8s ease-in-out ${i * 0.2}s infinite alternate`,
                    transition: 'height 0.3s ease',
                  }} />
                ))}
              </div>
              <span className="font-black text-lg" style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                zyAI
              </span>
              <span className="text-xs" style={{ color: 'rgba(148,163,184,0.7)' }}>
                {speaking ? '● Vorbesc...' : '● Online'}
              </span>
            </div>

            <button onClick={() => setVoiceOn(v => !v)}
              className="p-2 rounded-lg transition"
              style={{ color: voiceOn ? '#8B5CF6' : 'rgba(148,163,184,0.4)', background: 'rgba(255,255,255,0.05)' }}
              title={voiceOn ? 'Oprește vocea' : 'Pornește vocea'}>
              🔊
            </button>

            <button onClick={() => setOpen(false)}
              className="p-2 rounded-lg text-lg transition hover:scale-110"
              style={{ color: 'rgba(148,163,184,0.7)', background: 'rgba(255,255,255,0.05)' }}>
              ✕
            </button>
          </div>

          {/* Mesaje */}
          <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={msg.sender === 'user'
                      ? { background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', color: '#fff', borderBottomRightRadius: '4px' }
                      : { background: '#141B35', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', borderBottomLeftRadius: '4px' }}>
                    {msg.text}
                  </div>
                  {msg.listings && msg.listings.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {msg.listings.slice(0, 4).map(l => (
                        <a key={l.id} href={`/anunt/${l.id}`} target="_blank" rel="noopener noreferrer"
                          className="block rounded-xl overflow-hidden transition hover:scale-[1.02]"
                          style={{ background: '#141B35', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="h-20 bg-gradient-to-br from-purple-700 to-blue-600 flex items-center justify-center">
                            {l.images?.[0] ? <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" /> : <span className="text-2xl opacity-50">📦</span>}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-semibold line-clamp-2" style={{ color: '#F8FAFC' }}>{l.title}</p>
                            <p className="text-xs font-bold mt-1" style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                              {l.price ? `${l.price.toLocaleString('ro-RO')} ${l.currency}` : 'Negociabil'}
                            </p>
                            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.7)' }}>📍 {l.city}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl flex gap-2" style={{ background: '#141B35', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[0, 0.2, 0.4].map(d => (
                    <span key={d} className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6', animation: `bounce 1s ${d}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0F1629' }}>
            {/* Feedback vocal în timp real */}
            {(listening || interimText || pendingTranscript) && (
              <div className="max-w-2xl mx-auto mb-3 px-4 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#C4B5FD' }}>
                {listening && !interimText && !pendingTranscript && (
                  <span style={{ opacity: 0.7 }}>🎤 Te ascult...</span>
                )}
                {interimText && (
                  <span style={{ opacity: 0.7 }}>🎤 {interimText}</span>
                )}
                {pendingTranscript && !listening && (
                  <div className="flex items-center justify-between gap-2">
                    <span>🎤 &ldquo;{pendingTranscript}&rdquo;</span>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={confirmVoiceSearch}
                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: 'rgba(139,92,246,0.3)', color: '#E9D5FF' }}>
                        ✓ Caută
                      </button>
                      <button onClick={() => { setPendingTranscript(''); setInput('') }}
                        className="px-3 py-1 rounded-lg text-xs"
                        style={{ color: 'rgba(255,255,255,0.4)' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-3 max-w-2xl mx-auto">
              <input
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); setPendingTranscript('') }}
                placeholder={listening ? '🎤 Te ascult...' : 'Ce cauți?'}
                disabled={loading}
                className="flex-1 px-5 py-3 rounded-2xl text-sm outline-none"
                style={{
                  background: '#141B35',
                  border: `1px solid ${listening ? '#8B5CF6' : 'rgba(139,92,246,0.3)'}`,
                  color: '#F8FAFC',
                  boxShadow: listening ? '0 0 20px rgba(139,92,246,0.4)' : 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 16px rgba(139,92,246,0.25)' }}
                onBlur={e => { if (!listening) { e.target.style.borderColor = 'rgba(139,92,246,0.3)'; e.target.style.boxShadow = 'none' } }}
              />
              {/* Microfon */}
              <button type="button" onClick={startListening}
                className="px-4 py-3 rounded-2xl font-semibold text-white transition hover:scale-105"
                style={{
                  background: listening ? '#8B5CF6' : 'rgba(139,92,246,0.2)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  animation: listening ? 'micPulse 1s ease-in-out infinite' : 'none',
                }}
                title={listening ? 'Oprește microfonul' : 'Caută cu vocea'}>
                🎤
              </button>
              <button type="submit" disabled={loading || !input.trim()}
                className="px-5 py-3 rounded-2xl font-semibold text-white transition hover:scale-105 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
                🔍
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes vbar { from{transform:scaleY(0.2)} to{transform:scaleY(1)} }
        @keyframes vbarIdle { from{height:4px} to{height:16px} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes micPulse { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.6)} 50%{box-shadow:0 0 0 8px rgba(139,92,246,0)} }
      `}</style>
    </>
  )
}
