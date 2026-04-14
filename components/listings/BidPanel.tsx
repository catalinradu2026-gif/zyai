'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import BidTimer from './BidTimer'

interface Bid {
  id: string
  amount: number
  user_name: string
  created_at: string
}

interface BidPanelProps {
  listingId: string
  currentHighestBid: number
  biddingEndTime: string
  currency: string
  isOwner: boolean
  userId?: string
}

export default function BidPanel({
  listingId,
  currentHighestBid,
  biddingEndTime,
  currency,
  isOwner,
  userId,
}: BidPanelProps) {
  const router = useRouter()
  const [bids, setBids] = useState<Bid[]>([])
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expired, setExpired] = useState(false)
  const [topBid, setTopBid] = useState(currentHighestBid)

  const fetchBids = useCallback(async () => {
    const res = await fetch(`/api/listings/${listingId}/bid`)
    if (res.ok) {
      const data = await res.json()
      setBids(data.bids ?? [])
      if (data.bids?.[0]) setTopBid(data.bids[0].amount)
    }
  }, [listingId])

  useEffect(() => {
    fetchBids()
    const interval = setInterval(fetchBids, 15000) // refresh every 15s
    return () => clearInterval(interval)
  }, [fetchBids])

  async function handleBid() {
    if (!amount || isNaN(Number(amount))) {
      setError('Introdu o sumă validă')
      return
    }
    const minBid = topBid + 1
    if (Number(amount) < minBid) {
      setError(`Oferta minimă este ${minBid} ${currency}`)
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/listings/${listingId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) }),
      })
      const data = await res.json()
      if (data.ok) {
        setSuccess(`Oferta de ${Number(amount).toLocaleString('ro-RO')} ${currency} a fost plasată!`)
        setTopBid(Number(amount))
        setAmount('')
        fetchBids()
      } else {
        setError(data.error || 'Eroare la plasare ofertă')
      }
    } catch {
      setError('Eroare de conexiune')
    } finally {
      setLoading(false)
    }
  }

  function handleExpire() {
    setExpired(true)
    setTimeout(() => router.refresh(), 2000)
  }

  const minBid = topBid + 1
  const isEndTimePast = new Date(biddingEndTime).getTime() <= Date.now()

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: '2px solid rgba(251,146,60,0.5)', boxShadow: '0 0 30px rgba(251,146,60,0.15)' }}>

      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
        <div className="flex items-center gap-2">
          <span className="text-white text-lg">🔥</span>
          <span className="text-white font-black text-sm tracking-wide">LICITAȚIE FINALĂ</span>
        </div>
        <div className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold">
          {bids.length} {bids.length === 1 ? 'ofertă' : 'oferte'}
        </div>
      </div>

      <div className="p-5 space-y-4" style={{ background: 'var(--bg-card)' }}>

        {/* Timer */}
        {!isEndTimePast && !expired ? (
          <BidTimer endTime={biddingEndTime} onExpire={handleExpire} large />
        ) : (
          <div className="text-center py-2">
            <p className="font-black text-lg" style={{ color: '#f87171' }}>Licitație încheiată</p>
          </div>
        )}

        {/* Current highest bid */}
        <div className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)' }}>
          <p className="text-xs uppercase font-semibold mb-1" style={{ color: '#fb923c' }}>
            {bids.length > 0 ? 'Cea mai mare ofertă' : 'Preț de pornire'}
          </p>
          <p className="text-3xl font-black" style={{ color: '#f97316' }}>
            {topBid.toLocaleString('ro-RO')} {currency}
          </p>
          {bids[0] && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              de {bids[0].user_name}
            </p>
          )}
        </div>

        {/* Bid form — only for non-owners, logged in, not expired */}
        {!isOwner && userId && !expired && !isEndTimePast && (
          <div className="space-y-2">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Ofertă minimă: <span style={{ color: '#fb923c', fontWeight: 700 }}>{minBid.toLocaleString('ro-RO')} {currency}</span>
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`min. ${minBid}`}
                min={minBid}
                step="1"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <button
                onClick={handleBid}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', minWidth: '100px' }}
              >
                {loading ? '⏳...' : '🔥 Oferă'}
              </button>
            </div>
            {error && <p className="text-xs font-semibold" style={{ color: '#f87171' }}>❌ {error}</p>}
            {success && <p className="text-xs font-semibold" style={{ color: '#4ade80' }}>✓ {success}</p>}
          </div>
        )}

        {/* Not logged in */}
        {!isOwner && !userId && !expired && !isEndTimePast && (
          <a href="/login"
            className="block w-full text-center py-3 rounded-xl font-bold text-sm text-white transition hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
            🔥 Autentifică-te pentru a licita
          </a>
        )}

        {/* Owner message */}
        {isOwner && !expired && !isEndTimePast && (
          <div className="text-center py-1">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Ești proprietarul. Câștigătorul va fi notificat la final.
            </p>
          </div>
        )}

        {/* Bids history */}
        {bids.length > 0 && (
          <div>
            <p className="text-xs uppercase font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Istoricul ofertelor</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {bids.map((bid, i) => (
                <div key={bid.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                  style={{ background: i === 0 ? 'rgba(251,146,60,0.1)' : 'var(--bg-card-hover)', border: `1px solid ${i === 0 ? 'rgba(251,146,60,0.3)' : 'var(--border-subtle)'}` }}>
                  <span className="text-xs font-semibold" style={{ color: i === 0 ? '#fb923c' : 'var(--text-primary)' }}>
                    {i === 0 ? '🥇 ' : ''}{bid.user_name}
                  </span>
                  <span className="text-sm font-black" style={{ color: i === 0 ? '#f97316' : 'var(--text-primary)' }}>
                    {bid.amount.toLocaleString('ro-RO')} {currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {bids.length === 0 && (
          <p className="text-xs text-center py-1" style={{ color: 'var(--text-secondary)' }}>
            Fii primul care face o ofertă!
          </p>
        )}
      </div>
    </div>
  )
}
