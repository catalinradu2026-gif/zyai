'use client'

import { useState } from 'react'

type Props = {
  listingId: string
  listingTitle: string
  price: number | null
  currency: string
  city: string
  category: string
}

export default function BuyerAlertButton({ listingId, listingTitle, price, currency, city, category }: Props) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/ai/buyer-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, listingTitle, price, currency, city, category }),
      })
      const data = await res.json()
      if (data.ok && data.result?.message) setMessage(data.result.message)
    } catch {}
    setLoading(false)
  }

  async function sendViaWhatsApp() {
    if (!phone.trim() || !message) return
    setError('')
    try {
      const bridgeUrl = process.env.NEXT_PUBLIC_WHATSAPP_BRIDGE_URL || 'http://localhost:3001'
      const res = await fetch(`${bridgeUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: phone.replace(/\D/g, ''),
          message,
        }),
      })
      if (res.ok) { setSent(true); setTimeout(() => setSent(false), 3000) }
      else setError('Bridge offline — copiază mesajul manual')
    } catch {
      setError('Bridge offline — copiază mesajul manual')
    }
  }

  function copyMessage() {
    navigator.clipboard.writeText(message)
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); generate() }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition hover:scale-[1.02]"
        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80' }}
      >
        📱 Trimite alertă cumpărători
      </button>
    )
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase" style={{ color: '#4ADE80' }}>📱 Alertă WhatsApp AI</p>
        <button onClick={() => setOpen(false)} className="text-xs" style={{ color: 'var(--text-secondary)' }}>✕</button>
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-green-400 border-t-transparent animate-spin" />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Generez mesaj...</span>
        </div>
      )}

      {message && (
        <>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none resize-none"
            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          />
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Nr. telefon destinatar (ex: 0740123456)"
            className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          />
          <div className="flex gap-2">
            <button onClick={sendViaWhatsApp}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ADE80' }}>
              📤 Trimite via bridge
            </button>
            <button onClick={copyMessage}
              className="px-3 py-2 rounded-lg text-xs font-semibold transition"
              style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }}>
              📋 Copiază
            </button>
          </div>
          {sent && <p className="text-xs text-center" style={{ color: '#4ADE80' }}>✅ Mesaj trimis!</p>}
          {error && <p className="text-xs" style={{ color: '#F87171' }}>⚠️ {error}</p>}
        </>
      )}
      <p className="text-xs text-center pt-1" style={{ color: 'rgba(167,139,250,0.4)', letterSpacing: '0.05em' }}>⚡ powered by Ai Craiova</p>
    </div>
  )
}
