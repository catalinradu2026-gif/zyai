'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import BidTimer from './BidTimer'

interface Bid {
  id: string
  amount: number
  user_name: string
  user_id: string
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

const INCREMENTS = [100, 200, 300, 500]

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

  const msLeft = Math.max(0, new Date(biddingEndTime).getTime() - Date.now())
  const hoursLeft = Math.ceil(msLeft / 3600000)

  const fetchBids = useCallback(async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}/bid`)
      if (res.ok) {
        const data = await res.json()
        setBids(data.bids ?? [])
        if (data.bids?.[0]) setTopBid(data.bids[0].amount)
      }
    } catch { /* ignore */ }
  }, [listingId])

  useEffect(() => {
    fetchBids()
    const interval = setInterval(fetchBids, 15000)
    return () => clearInterval(interval)
  }, [fetchBids])

  async function handleBid(customAmount?: number) {
    const bidAmount = customAmount ?? Number(amount)
    if (!bidAmount || isNaN(bidAmount)) {
      setError('Introdu o sumă validă')
      return
    }
    const minBid = topBid + 1
    if (bidAmount < minBid) {
      setError(`Oferta minimă este ${minBid.toLocaleString('ro-RO')} ${currency}`)
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/listings/${listingId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bidAmount }),
      })
      const data = await res.json()
      if (data.ok) {
        setSuccess(`✅ Oferta de ${bidAmount.toLocaleString('ro-RO')} ${currency} a fost plasată! Vânzătorul a primit un mesaj — verificați secțiunea Mesaje pentru a vorbi direct cu el și a stabili vizionarea.`)
        setTopBid(bidAmount)
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
  const showBidding = !expired && !isEndTimePast

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

        {/* Seller accepted message */}
        {showBidding && (
          <div className="rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <p className="font-semibold" style={{ color: '#fb923c' }}>
              ✅ Vânzătorul a acceptat o ofertă de{' '}
              <span className="font-black">{currentHighestBid.toLocaleString('ro-RO')} {currency}</span>
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Mai {hoursLeft <= 1 ? 'e mai puțin de 1 oră' : `sunt ~${hoursLeft} ore`} în care poți depăși oferta
            </p>
          </div>
        )}

        {/* Timer */}
        {showBidding ? (
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
            {bids.length > 0 ? 'Cea mai mare ofertă' : 'Preț acceptat'}
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
        {!isOwner && userId && showBidding && (
          <div className="space-y-3">
            {/* Quick increment buttons */}
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Ofertă rapidă (peste{' '}
              <span style={{ color: '#fb923c', fontWeight: 700 }}>{topBid.toLocaleString('ro-RO')} {currency}</span>):
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {INCREMENTS.map(inc => (
                <button
                  key={inc}
                  onClick={() => handleBid(topBid + inc)}
                  disabled={loading}
                  className="py-2 rounded-xl text-xs font-black transition hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{
                    background: 'rgba(251,146,60,0.12)',
                    border: '1px solid rgba(251,146,60,0.35)',
                    color: '#fb923c',
                  }}
                >
                  +{inc}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Sau introdu suma (min.{' '}
                <span style={{ color: '#fb923c', fontWeight: 700 }}>{minBid.toLocaleString('ro-RO')} {currency}</span>):
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
                  onClick={() => handleBid()}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', minWidth: '90px' }}
                >
                  {loading ? '⏳' : '🔥 Oferă'}
                </button>
              </div>
            </div>

            {error && <p className="text-xs font-semibold" style={{ color: '#f87171' }}>❌ {error}</p>}
            {success && (
              <div className="rounded-xl p-3 text-xs font-semibold"
                style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
                ✓ {success}
              </div>
            )}
          </div>
        )}

        {/* Not logged in */}
        {!isOwner && !userId && showBidding && (
          <a href="/login"
            className="block w-full text-center py-3 rounded-xl font-bold text-sm text-white transition hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
            🔥 Autentifică-te pentru a licita
          </a>
        )}

        {/* Owner view — cine a licitat + contact direct */}
        {isOwner && showBidding && (
          <div className="space-y-2">
            <div className="rounded-xl px-4 py-3"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <p className="text-sm font-bold mb-1" style={{ color: '#A78BFA' }}>
                👤 Licitatori — contactează-i pentru vizionare
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Prețul final îl stabilești tu față în față, după vizionare.
              </p>
            </div>
            {bids.length > 0 && (
              <div className="space-y-1.5">
                {bids.map((bid, i) => (
                  <div key={bid.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl"
                    style={{
                      background: i === 0 ? 'rgba(251,146,60,0.1)' : 'var(--bg-card-hover)',
                      border: `1px solid ${i === 0 ? 'rgba(251,146,60,0.4)' : 'var(--border-subtle)'}`,
                    }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: i === 0 ? '#fb923c' : 'var(--text-primary)' }}>
                        {i === 0 ? '🥇 ' : `#${i + 1} `}{bid.user_name}
                      </p>
                      <p className="text-sm font-black" style={{ color: i === 0 ? '#f97316' : 'var(--text-primary)' }}>
                        {bid.amount.toLocaleString('ro-RO')} {currency}
                      </p>
                    </div>
                    <a
                      href={`/cont/mesaje/${listingId}?user=${bid.user_id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0 transition hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                    >
                      💬 Scrie
                    </a>
                  </div>
                ))}
              </div>
            )}
            {bids.length === 0 && (
              <p className="text-xs text-center py-2" style={{ color: 'var(--text-secondary)' }}>
                Nicio ofertă încă — licitația e activă
              </p>
            )}
          </div>
        )}

        {/* Bids history — doar pentru cumpărători */}
        {!isOwner && bids.length > 0 && (
          <div>
            <p className="text-xs uppercase font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Istoricul ofertelor</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {bids.map((bid, i) => (
                <div key={bid.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                  style={{
                    background: i === 0 ? 'rgba(251,146,60,0.1)' : 'var(--bg-card-hover)',
                    border: `1px solid ${i === 0 ? 'rgba(251,146,60,0.3)' : 'var(--border-subtle)'}`,
                  }}>
                  <span className="text-xs font-semibold" style={{ color: i === 0 ? '#fb923c' : 'var(--text-primary)' }}>
                    {i === 0 ? '🥇 ' : `#${i + 1} `}{bid.user_name}
                  </span>
                  <span className="text-sm font-black" style={{ color: i === 0 ? '#f97316' : 'var(--text-primary)' }}>
                    {bid.amount.toLocaleString('ro-RO')} {currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {bids.length === 0 && showBidding && !isOwner && (
          <p className="text-xs text-center py-1" style={{ color: 'var(--text-secondary)' }}>
            Fii primul care depășește oferta!
          </p>
        )}
      </div>
    </div>
  )
}
