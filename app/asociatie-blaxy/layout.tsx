import type { Metadata } from 'next'
import ChatbotVocal from './ChatbotVocal'

export const metadata: Metadata = {
  title: 'Asociație Proprietari – Blaxy Resort',
  description: 'Centralizator proprietari studiouri Blaxy Resort',
  robots: { index: false, follow: false },
}

export default function AsociatieLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {children}
      <ChatbotVocal />
    </div>
  )
}
