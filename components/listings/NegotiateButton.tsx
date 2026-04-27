'use client'

import { useState, useTransition } from 'react'
import { sendMessage } from '@/lib/actions/messages'

type Props = {
  listingTitle: string
  price: number | null
  currency: string
  sellerPhone: string
  sellerName: string
  listingId?: string
  sellerId?: string
}

export default function NegotiateButton({ listingTitle, price, currency, sellerPhone, sellerName, listingId, sellerId }: Props) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState<'whatsapp' | 'zyai' | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function generate() {
    setLoading(true)
    setMessage('')
    setError('')
    setSent(null)
    try {
      const res = await fetch('/api/ai/negotiate-buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingTitle, price, currency, sellerName }),
      })
      const data = await res.json()
      if (data.ok && data.message) setMessage(data.message)
      else setError('Nu am putut genera mesajul')
    } catch {
      setError('Eroare de conexiune')
    }
    setLoading(false)
  }

  function sendWhatsApp() {
    const phone = sellerPhone.replace(/\D/g, '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    setSent('whatsapp')
  }

  function sendZyAI() {
    if (!listingId || !sellerId || !message.trim()) return
    startTransition(async () => {
      const result = await sendMessage(listingId, sellerId, message.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setSent('zyai')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); generate() }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition hover:scale-105"
        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)', color: '#A78BFA' }}
      >
        🤖 Negociază cu AI
      </button>
    )
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.25)' }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase" style={{ color: '#A78BFA' }}>🤖 Mesaj negociere AI</p>
        <button onClick={() => setOpen(false)} className="text-xs" style={{ color: 'var(--text-secondary)' }}>✕</button>
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-purple-400 border-t-transparent animate-spin" />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Generez mesaj...</span>
        </div>
      )}

      {message && (
        <>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none resize-none"
            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          />
          <div className="flex gap-2">
            {listingId && sellerId && (
              <button
                onClick={sendZyAI}
                disabled={isPending || sent === 'zyai'}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-60"
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.5)', color: '#A78BFA' }}
              >
                {isPending ? '⏳ Se trimite...' : sent === 'zyai' ? '✅ Trimis pe zyAI!' : '💬 Trimite pe zyAI'}
              </button>
            )}
            <button
              onClick={sendWhatsApp}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ADE80' }}
            >
              {sent === 'whatsapp' ? '✅ WhatsApp deschis!' : '📱 WhatsApp'}
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="px-3 py-2 rounded-lg text-xs font-semibold transition"
              style={{ border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA', background: 'rgba(139,92,246,0.1)' }}
            >
              🔄
            </button>
          </div>
        </>
      )}

      {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
      <p className="text-xs text-center pt-1" style={{ color: 'rgba(167,139,250,0.4)', letterSpacing: '0.05em' }}>⚡ powered by Ai Craiova</p>
    </div>
  )
}
