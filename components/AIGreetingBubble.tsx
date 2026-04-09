'use client'

import { useState, useEffect } from 'react'

const FULL_TEXT = 'Salut! 👋 Bun venit pe zyAI!'

export default function AIGreetingBubble() {
  const [displayed, setDisplayed] = useState('')
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // arată după 1.2s
    const t = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible) return

    let i = 0
    const iv = setInterval(() => {
      i++
      setDisplayed(FULL_TEXT.slice(0, i))
      if (i >= FULL_TEXT.length) {
        clearInterval(iv)
        setDone(true)
        setTimeout(() => setVisible(false), 5000)
      }
    }, 55)

    return () => clearInterval(iv)
  }, [visible])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '62px',
        left: '12px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {/* Bare vocale */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '18px' }}>
        {[8, 14, 10, 16, 7, 13, 16, 9].map((h, i) => (
          <span
            key={i}
            style={{
              display: 'block',
              width: '3px',
              borderRadius: '2px',
              backgroundColor: '#8B5CF6',
              height: done ? '3px' : `${h}px`,
              animation: done ? 'none' : `vbar 0.65s ease-in-out ${i * 0.08}s infinite alternate`,
              transition: 'height 0.5s ease',
            }}
          />
        ))}
      </div>

      {/* Bula cu text */}
      <div
        style={{
          padding: '8px 14px',
          borderRadius: '16px',
          borderTopLeftRadius: '3px',
          fontSize: '13px',
          fontWeight: 600,
          backgroundColor: '#0F1629',
          border: '1px solid rgba(139,92,246,0.4)',
          color: '#F8FAFC',
          boxShadow: '0 0 20px rgba(139,92,246,0.35)',
          whiteSpace: 'nowrap',
          animation: 'gpop 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {displayed}
        {!done && (
          <span
            style={{
              display: 'inline-block',
              width: '2px',
              height: '12px',
              marginLeft: '2px',
              verticalAlign: 'middle',
              backgroundColor: '#8B5CF6',
              borderRadius: '1px',
              animation: 'cblink 0.7s step-end infinite',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes gpop {
          from { opacity:0; transform:scale(0.85) translateY(-5px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes cblink {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }
        @keyframes vbar {
          from { transform:scaleY(0.2); } to { transform:scaleY(1); }
        }
      `}</style>
    </div>
  )
}
