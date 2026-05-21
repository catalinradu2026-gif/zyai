import type { Metadata } from 'next'
import ChatbotVocal from './ChatbotVocal'

export const metadata: Metadata = {
  title: 'Asociație Proprietari – Blaxy Resort',
  description: 'Centralizator proprietari studiouri Blaxy Resort',
  robots: { index: false, follow: false },
}

export default function AsociatieLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body > header,
        body > div > header,
        header.fixed { display: none !important; }
        body > main { padding-top: 0 !important; }
      `}</style>
      <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
        {children}
        <ChatbotVocal />
      </div>
    </>
  )
}
