import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Asociație Proprietari – Blaxy Resort',
  description: 'Centralizator proprietari studiouri Blaxy Resort',
  robots: { index: false, follow: false },
}

export default function AsociatieLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <style>{`.asociatie-row:hover { background: var(--bg-card-hover); transition: background 0.15s; }`}</style>
      {children}
    </div>
  )
}
