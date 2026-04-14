'use client'

import { useEffect, useState } from 'react'

interface BidTimerProps {
  endTime: string // ISO string
  onExpire?: () => void
  large?: boolean
}

function calcRemaining(endTime: string) {
  const diff = Math.max(0, new Date(endTime).getTime() - Date.now())
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { h, m, s, total: diff }
}

export default function BidTimer({ endTime, onExpire, large = false }: BidTimerProps) {
  const [remaining, setRemaining] = useState(() => calcRemaining(endTime))

  useEffect(() => {
    if (remaining.total <= 0) {
      onExpire?.()
      return
    }
    const interval = setInterval(() => {
      const r = calcRemaining(endTime)
      setRemaining(r)
      if (r.total <= 0) {
        clearInterval(interval)
        onExpire?.()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [endTime, onExpire])

  const expired = remaining.total <= 0
  const urgent = remaining.total < 30 * 60 * 1000 // < 30 min

  if (large) {
    return (
      <div className="text-center">
        {expired ? (
          <p className="text-lg font-black" style={{ color: '#f87171' }}>Licitație încheiată</p>
        ) : (
          <>
            <p className="text-xs uppercase font-semibold mb-2" style={{ color: urgent ? '#fb923c' : 'var(--text-secondary)' }}>
              {urgent ? '🔥 Se termină curând!' : '⏳ Timp rămas'}
            </p>
            <div className="flex items-center justify-center gap-2">
              {remaining.h > 0 && (
                <>
                  <div className="rounded-xl px-3 py-2 text-center min-w-[56px]"
                    style={{ background: urgent ? 'rgba(251,146,60,0.15)' : 'rgba(139,92,246,0.15)', border: `1px solid ${urgent ? 'rgba(251,146,60,0.4)' : 'rgba(139,92,246,0.4)'}` }}>
                    <p className="text-2xl font-black" style={{ color: urgent ? '#fb923c' : '#A78BFA' }}>{String(remaining.h).padStart(2, '0')}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>ore</p>
                  </div>
                  <span className="text-xl font-black" style={{ color: 'var(--text-secondary)' }}>:</span>
                </>
              )}
              <div className="rounded-xl px-3 py-2 text-center min-w-[56px]"
                style={{ background: urgent ? 'rgba(251,146,60,0.15)' : 'rgba(139,92,246,0.15)', border: `1px solid ${urgent ? 'rgba(251,146,60,0.4)' : 'rgba(139,92,246,0.4)'}` }}>
                <p className="text-2xl font-black" style={{ color: urgent ? '#fb923c' : '#A78BFA' }}>{String(remaining.m).padStart(2, '0')}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>min</p>
              </div>
              <span className="text-xl font-black" style={{ color: 'var(--text-secondary)' }}>:</span>
              <div className="rounded-xl px-3 py-2 text-center min-w-[56px]"
                style={{ background: urgent ? 'rgba(251,146,60,0.15)' : 'rgba(139,92,246,0.15)', border: `1px solid ${urgent ? 'rgba(251,146,60,0.4)' : 'rgba(139,92,246,0.4)'}` }}>
                <p className="text-2xl font-black" style={{ color: urgent ? '#fb923c' : '#A78BFA' }}>{String(remaining.s).padStart(2, '0')}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>sec</p>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Compact version for cards
  if (expired) return <span className="text-xs font-bold" style={{ color: '#f87171' }}>Încheiată</span>
  const label = remaining.h > 0
    ? `${remaining.h}h ${String(remaining.m).padStart(2, '0')}m`
    : `${remaining.m}m ${String(remaining.s).padStart(2, '0')}s`

  return (
    <span className="text-xs font-bold" style={{ color: urgent ? '#fb923c' : '#A78BFA' }}>
      ⏳ {label}
    </span>
  )
}
