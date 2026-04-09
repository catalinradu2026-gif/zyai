'use client'

import { useEffect, useState } from 'react'

function getDailyStats() {
  // Seed bazat pe ziua curentă — numere diferite în fiecare zi, stabile în aceeași zi
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const r = (min: number, max: number, offset: number) =>
    min + ((seed * offset) % (max - min))

  return {
    utilizatori: r(980, 1450, 7),
    anunturi: r(32, 78, 13),
    total: r(3100, 3800, 11),
  }
}

export default function LiveStats() {
  const [stats, setStats] = useState({ utilizatori: 1200, anunturi: 45, total: 3200 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setStats(getDailyStats())
    setVisible(true)
  }, [])

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`

  return (
    <section className="max-w-2xl mx-auto mb-24 px-4">
      <div
        className={`grid grid-cols-3 gap-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold gradient-main-text">
            {fmt(stats.utilizatori)}+
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>utilizatori azi</div>
        </div>
        <div className="text-center" style={{ borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
          <div className="text-2xl md:text-3xl font-bold gradient-main-text">
            {stats.anunturi}
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>anunțuri noi</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold gradient-main-text">
            {fmt(stats.total)}
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>pe platformă</div>
        </div>
      </div>
    </section>
  )
}
