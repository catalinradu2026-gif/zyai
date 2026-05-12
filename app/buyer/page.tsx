import type { Metadata } from 'next'
import BuyerForm from './BuyerForm'

export const metadata: Metadata = {
  title: 'Buyer AI — Verifică dacă merită să cumperi | zyAI',
  description: 'Pune linkul sau detaliile unui anunț. AI îți spune dacă merită, prețul corect și riscul de scam.',
}

export default function BuyerPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <section className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block mb-3 px-4 py-1.5 rounded-full glass">
            <span className="text-sm font-semibold gradient-main-text">🟦 BUYER AI</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            Verifică dacă merită să cumperi
          </h1>
          <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Pune detaliile anunțului — AI îți dă scor 0-100, verdict preț și risc scam.
          </p>
        </div>
        <BuyerForm />
      </section>
    </main>
  )
}
