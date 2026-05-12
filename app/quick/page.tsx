import type { Metadata } from 'next'
import QuickForm from './QuickForm'

export const metadata: Metadata = {
  title: 'Fă o poză → Anunț instant | zyAI',
  description: 'Vrei să vinzi orice din casă? Fă o poză, AI îți generează titlul, descrierea și prețul în 10 secunde.',
}

export default function QuickPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <section className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block mb-3 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)' }}>
            <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>📸 QUICK SELL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            Fă o poză → AI face anunțul
          </h1>
          <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Orice obiect din casă. Gratuit, fără cont.
          </p>
        </div>
        <QuickForm />
      </section>
    </main>
  )
}
