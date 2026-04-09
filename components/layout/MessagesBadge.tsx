'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function MessagesBadge() {
  const [count, setCount] = useState(0)

  async function fetchUnread() {
    try {
      const res = await fetch('/api/messages/unread')
      if (res.ok) {
        const data = await res.json()
        setCount(data.count || 0)
      }
    } catch {}
  }

  useEffect(() => {
    fetchUnread()
    // Poll la fiecare 30 secunde
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link
      href="/cont/mesaje"
      className="relative p-2.5 rounded-lg transition-all duration-200 hover:glow-purple"
      style={{
        color: 'var(--text-secondary)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
      title="Mesaje"
    >
      💬
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            minWidth: '16px',
            height: '16px',
            padding: '0 4px',
            borderRadius: '8px',
            backgroundColor: '#ef4444',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
