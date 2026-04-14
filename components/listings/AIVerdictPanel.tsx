'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatMessage = {
  id: string
  text: string
  sender: 'user' | 'ai'
}

type ListingContext = {
  title: string
  price: number | null
  currency: string
  price_type: string
  city: string
  description: string
  category_id: number
  metadata: Record<string, any>
}

const BARS = [0.5, 1, 0.65, 1, 0.4, 0.9, 1, 0.55]

function prepareForSpeech(text: string): string {
  return text
    // Emojis
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27FF}]/gu, '')
    .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/[*_~`#]/g, '')
    // Consum: "8/5 L/100km" → "8 litri în oraș, 5 litri pe drum"
    .replace(/(\d+)\s*\/\s*(\d+)\s*[Ll]\/100\s*km/g, '$1 litri în oraș, $2 litri pe drum')
    // "X/10" → "X din zece"
    .replace(/(\d+)\s*\/\s*10/g, '$1 din zece')
    // "120.000 km" sau "120000 km" → "o sută douăzeci de mii de kilometri" e greu, păstrăm simplu
    .replace(/(\d{1,3}(?:[.,]\d{3})+)\s*km/g, (_, n) => n.replace(/[.,]/g, '') + ' kilometri')
    .replace(/(\d+)\s*km/g, '$1 kilometri')
    // "4.500 EUR" / "4500 EUR"
    .replace(/(\d{1,3}(?:[.,]\d{3})+)\s*(EUR|RON|€)/gi, (_, n, cur) => n.replace(/[.,]/g, '') + ' ' + (cur === '€' || cur.toUpperCase() === 'EUR' ? 'euro' : 'lei'))
    .replace(/(\d+)\s*€/g, '$1 euro')
    .replace(/(\d+)\s*EUR/gi, '$1 euro')
    .replace(/(\d+)\s*RON/gi, '$1 lei')
    // "CP" → "cai putere"
    .replace(/(\d+)\s*CP/g, '$1 cai putere')
    // "L/100km" rămas
    .replace(/[Ll]\/100\s*km/g, 'litri la sută')
    // Slash generic rămas
    .replace(/(\d+)\s*\/\s*(\d+)/g, '$1 din $2')
    // Liniuțe între cuvinte
    .replace(/(\w)-(\w)/g, '$1 $2')
    .trim()
}

function speak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const clean = prepareForSpeech(text)
  const utt = new SpeechSynthesisUtterance(clean)
  utt.lang = 'ro-RO'
  utt.rate = 0.9
  utt.pitch = 0.85
  utt.volume = 1
  const voices = window.speechSynthesis.getVoices()
  const voice = voices.find(v => v.lang.startsWith('ro'))
    || voices.find(v => v.lang.startsWith('en-GB'))
    || voices[0]
  if (voice) utt.voice = voice
  if (onEnd) utt.onend = onEnd
  window.speechSynthesis.speak(utt)
}

export default function AIVerdictPanel({ listing }: { listing: ListingContext }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [history, setHistory] = useState<HistoryMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [listening, setListening] = useState(false)
  const [mounted, setMounted] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const hasInitialized = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200)
      if (!hasInitialized.current) {
        hasInitialized.current = true
        triggerInitialAnalysis()
      }
    } else {
      window.speechSynthesis?.cancel()
      setSpeaking(false)
    }
  }, [open])

  function speakText(text: string) {
    if (!voiceOn) return
    setSpeaking(true)
    const trySpeak = () => {
      speak(text, () => setSpeaking(false))
      setTimeout(() => setSpeaking(false), 20000)
    }
    if (window.speechSynthesis.getVoices().length > 0) {
      trySpeak()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        trySpeak()
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }

  async function triggerInitialAnalysis() {
    const firstMessage = listing.category_id === 3
      ? `Analizează această mașină din anunț și dă-mi verdictul tău complet.`
      : `Analizează acest anunț și spune-mi dacă merită cumpărat la prețul cerut.`

    await sendMessage(firstMessage, true)
  }

  async function sendMessage(userText: string, isAuto = false) {
    if (!isAuto) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: userText,
        sender: 'user',
      }])
    }
    setLoading(true)

    try {
      const res = await fetch('/api/ai/verdict-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history,
          listing,
        }),
      })

      const data = await res.json()
      const aiText = data.message || 'Nu am putut genera un răspuns.'

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'ai',
      }])

      setHistory(prev => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'assistant', content: aiText },
      ])

      speakText(aiText)
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Eroare temporară. Încearcă din nou.',
        sender: 'ai',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    sendMessage(text)
  }

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Browserul tău nu suportă recunoașterea vocală.'); return }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const rec = new SR()
    rec.lang = 'ro-RO'
    rec.continuous = false
    rec.interimResults = false
    recognitionRef.current = rec

    rec.onstart = () => setListening(true)
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setListening(false)
      setTimeout(() => {
        setInput('')
        sendMessage(transcript)
      }, 300)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    rec.start()
  }

  function handleClose() {
    setOpen(false)
    window.speechSynthesis?.cancel()
  }

  const isAuto = listing.category_id === 3

  return (
    <>
      {/* Buton AI VERDICT */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          color: 'white',
          boxShadow: '0 0 20px rgba(124,58,237,0.35)',
          border: '1px solid rgba(139,92,246,0.4)',
        }}
      >
        <span style={{ fontSize: '18px' }}>🧠</span>
        <span>AI VERDICT</span>
        <span style={{ fontSize: '14px', opacity: 0.8 }}>🎤</span>
      </button>

      {/* Modal full-screen */}
      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col" style={{ background: 'rgba(5,8,18,0.97)', backdropFilter: 'blur(16px)' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(139,92,246,0.2)', background: '#0a0f1e' }}>
            {/* Logo + bare */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {BARS.map((h, i) => (
                  <span key={i} style={{
                    display: 'block', width: '3px', borderRadius: '2px',
                    background: 'linear-gradient(to top, #7c3aed, #3b82f6)',
                    height: speaking ? `${Math.round(h * 18)}px` : '8px',
                    transition: 'height 0.15s ease',
                    animation: speaking ? `vbar 0.6s ease-in-out ${i * 0.08}s infinite alternate` : 'none',
                  }} />
                ))}
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm" style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  🧠 AI VERDICT
                </p>
                <p className="text-xs truncate max-w-[200px]" style={{ color: 'rgba(148,163,184,0.6)' }}>
                  {listing.title}
                </p>
              </div>
            </div>

            {/* Listing info pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <span style={{ color: '#a78bfa' }}>
                {listing.price ? `${listing.price.toLocaleString('ro-RO')} ${listing.currency}` : listing.price_type}
              </span>
              <span style={{ color: 'rgba(148,163,184,0.4)' }}>•</span>
              <span style={{ color: 'rgba(148,163,184,0.7)' }}>📍 {listing.city}</span>
            </div>

            {/* Voice toggle */}
            <button
              onClick={() => { setVoiceOn(v => !v); if (voiceOn) { window.speechSynthesis?.cancel(); setSpeaking(false) } }}
              className="p-2 rounded-lg transition"
              style={{ color: voiceOn ? '#a78bfa' : 'rgba(148,163,184,0.3)', background: 'rgba(255,255,255,0.04)' }}
              title={voiceOn ? 'Oprește vocea' : 'Pornește vocea'}
            >
              {voiceOn ? '🔊' : '🔇'}
            </button>

            <button onClick={handleClose} className="p-2 rounded-lg transition hover:scale-110" style={{ color: 'rgba(148,163,184,0.6)', background: 'rgba(255,255,255,0.04)' }}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">

            {/* Loading initial */}
            {messages.length === 0 && loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>🧠</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none" style={{ background: '#131929', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <div className="flex gap-2">
                    {[0, 0.2, 0.4].map(d => (
                      <span key={d} className="w-2 h-2 rounded-full" style={{ background: '#7c3aed', animation: `bounce 1s ${d}s infinite` }} />
                    ))}
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'rgba(148,163,184,0.5)' }}>
                    {isAuto ? 'Analizez mașina...' : 'Analizez anunțul...'}
                  </p>
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'items-start gap-3'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm mt-0.5" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>🧠</div>
                )}
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap"
                  style={msg.sender === 'user'
                    ? { background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', borderBottomRightRadius: '4px' }
                    : { background: '#131929', border: '1px solid rgba(139,92,246,0.15)', color: '#e2e8f0', borderBottomLeftRadius: '4px' }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading follow-up */}
            {messages.length > 0 && loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>🧠</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none flex gap-2" style={{ background: '#131929', border: '1px solid rgba(139,92,246,0.15)' }}>
                  {[0, 0.2, 0.4].map(d => (
                    <span key={d} className="w-2 h-2 rounded-full" style={{ background: '#7c3aed', animation: `bounce 1s ${d}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-2 max-w-2xl w-full mx-auto">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {(isAuto ? [
                  'Ce probleme să caut la inspecție?',
                  'Prețul e corect față de piață?',
                  'Ce alternative similare există?',
                  'Cât costă întreținerea anuală?',
                ] : [
                  'Merită la prețul ăsta?',
                  'Ce să verific înainte să cumpăr?',
                  'Există alternative mai bune?',
                ]).map(q => (
                  <button
                    key={q}
                    onClick={() => { sendMessage(q) }}
                    disabled={loading}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition hover:scale-105 shrink-0"
                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-4 shrink-0" style={{ borderTop: '1px solid rgba(139,92,246,0.15)', background: '#0a0f1e' }}>
            <form onSubmit={handleSend} className="flex gap-2 max-w-2xl mx-auto">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={listening ? '🎤 Te ascult...' : 'Întreabă ceva despre acest anunț...'}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
                style={{
                  background: '#131929',
                  border: `1px solid ${listening ? '#7c3aed' : 'rgba(124,58,237,0.25)'}`,
                  color: '#f1f5f9',
                  boxShadow: listening ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                }}
              />
              <button
                type="button"
                onClick={startListening}
                disabled={loading}
                className="px-3 py-3 rounded-2xl transition hover:scale-105 active:scale-95"
                style={{
                  background: listening ? '#7c3aed' : 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  animation: listening ? 'micPulse 1s ease-in-out infinite' : 'none',
                  color: 'white',
                  fontSize: '16px',
                }}
                title={listening ? 'Oprește microfonul' : 'Vorbește'}
              >
                🎤
              </button>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-3 rounded-2xl font-semibold text-sm text-white transition hover:scale-105 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}
              >
                🔍
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes vbar { from { transform: scaleY(0.2) } to { transform: scaleY(1) } }
        @keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
        @keyframes micPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.6) } 50% { box-shadow: 0 0 0 8px rgba(124,58,237,0) } }
        .scrollbar-hide::-webkit-scrollbar { display: none }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
      `}</style>
    </>
  )
}
