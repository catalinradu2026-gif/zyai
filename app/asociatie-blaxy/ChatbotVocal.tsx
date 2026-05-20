'use client'

import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

const SALUT = 'Bună ziua! Sunt Ana, asistenta asociației Blaxy Resort. Cum vă pot ajuta astăzi?'

export default function ChatbotVocal() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: SALUT }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Redă text prin TTS
  async function speak(text: string) {
    if (!audioEnabled) return
    try {
      setSpeaking(true)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 200) }),
      })
      if (!res.ok) { setSpeaking(false); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src) }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setSpeaking(false)
      audio.onerror = () => setSpeaking(false)
      audio.play()
    } catch { setSpeaking(false) }
  }

  // Trimite mesaj
  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')

    const userMsg: Msg = { role: 'user', content: trimmed }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      const res = await fetch('/api/asociatie-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const reply = data.reply || 'Scuze, am o problemă. Încearcă din nou.'
      setMessages([...history, { role: 'assistant', content: reply }])
      speak(reply)
    } catch {
      const err = 'Conexiune întreruptă. Încearcă din nou.'
      setMessages([...history, { role: 'assistant', content: err }])
    }
    setLoading(false)
  }

  // Recunoaștere vocală
  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Browserul tău nu suportă recunoaștere vocală.'); return }
    if (recognitionRef.current) { recognitionRef.current.abort() }
    const rec = new SR()
    rec.lang = 'ro-RO'
    rec.interimResults = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      send(t)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }

  function stopAudio() {
    if (audioRef.current) { audioRef.current.pause(); setSpeaking(false) }
    recognitionRef.current?.abort()
    setListening(false)
  }

  // Deschide și salută vocal
  function toggleOpen() {
    if (!open) speak(SALUT)
    else stopAudio()
    setOpen(v => !v)
  }

  return (
    <>
      {/* Buton floating */}
      <button
        onClick={toggleOpen}
        title="Asistentă vocală asociație"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-105"
        style={{
          background: 'var(--gradient-main)',
          boxShadow: open ? 'var(--glow-purple)' : '0 4px 20px rgba(139,92,246,0.5)',
        }}
      >
        <span style={{ fontSize: 24 }}>{open ? '✕' : '🎙️'}</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            maxHeight: '70vh',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ background: 'var(--gradient-main)' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(255,255,255,0.2)' }}>
              🏢
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-white">Ana</div>
              <div className="text-xs text-white opacity-80">Asistentă Blaxy Resort</div>
            </div>
            <button
              onClick={() => { setAudioEnabled(v => !v); stopAudio() }}
              className="text-white opacity-70 hover:opacity-100 cursor-pointer text-lg"
              title={audioEnabled ? 'Oprește vocea' : 'Activează vocea'}
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>
          </div>

          {/* Mesaje */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 200 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="px-3 py-2 rounded-xl text-sm max-w-[85%]"
                  style={m.role === 'user'
                    ? { background: 'var(--gradient-main)', color: '#fff' }
                    : { background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>Ana scrie...</span>
                </div>
              </div>
            )}
            {speaking && (
              <div className="text-center text-xs" style={{ color: 'var(--purple-light)' }}>🔊 vorbește...</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input) }}
              placeholder="Scrie un mesaj..."
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-40"
              style={{ background: 'var(--gradient-main)' }}
            >
              <span style={{ fontSize: 16 }}>➤</span>
            </button>
            <button
              onClick={listening ? () => { recognitionRef.current?.abort(); setListening(false) } : startListening}
              disabled={loading}
              className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-40"
              style={{
                background: listening ? '#ef4444' : 'var(--bg-input)',
                border: '1px solid var(--border-light)',
              }}
              title={listening ? 'Oprește' : 'Vorbește'}
            >
              <span style={{ fontSize: 16 }}>{listening ? '⏹' : '🎤'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
