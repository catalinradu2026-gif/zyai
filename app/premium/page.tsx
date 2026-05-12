import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Broker AI Premium — Negociază pentru tine | zyAI',
  description: 'Broker AI premium: negociere automată, alternative mai bune, recomandare finală. Pentru auto și imobiliare.',
}

const FEATURES = [
  { icon: '🤖', title: 'Negociere automată', text: 'AI-ul deschide conversația cu vânzătorul și negociază prețul în numele tău.' },
  { icon: '🔍', title: 'Alternative mai bune', text: 'Scanează piața în timp real și îți arată variante mai bune la același buget.' },
  { icon: '📊', title: 'Verdict final', text: 'Raport complet: scor, riscuri, preț corect, recomandare „cumpără / pasează".' },
  { icon: '🔔', title: 'Follow-up automat', text: 'Te anunță când apar oferte noi care se potrivesc cu criteriile tale.' },
]

export default function PremiumPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <section className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-block mb-3 px-4 py-1.5 rounded-full glass">
          <span className="text-sm font-semibold gradient-main-text">🤖 BROKER AI PREMIUM</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
          Lasă AI-ul să <span className="gradient-main-text">negocieze pentru tine</span>
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Premium pentru cumpărători serioși de auto și imobiliare.
        </p>
      </section>

      <section className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4 mb-12">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 glass"
            style={{ borderLeft: '3px solid #8B5CF6' }}
          >
            <div className="text-3xl mb-2">{f.icon}</div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto mb-12">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-3xl p-7 glass" style={{ borderTop: '3px solid #64748b' }}>
            <div className="text-sm font-bold opacity-70 mb-1" style={{ color: 'var(--text-secondary)' }}>FREE</div>
            <div className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>0 RON</div>
            <div className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Pentru oricine</div>
            <ul className="space-y-2 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              <li>✓ Buyer AI — verdict, scor, scam check</li>
              <li>✓ Seller AI — listing din poze</li>
              <li>✓ Quick Sell — anunț instant</li>
            </ul>
            <Link
              href="/buyer"
              className="block w-full text-center px-5 py-3 rounded-xl font-bold glass glass-hover"
              style={{ color: 'var(--text-primary)' }}
            >
              Folosește gratuit
            </Link>
          </div>

          <div
            className="rounded-3xl p-7 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.10))',
              border: '1px solid rgba(139,92,246,0.4)',
              boxShadow: 'var(--glow-purple)',
            }}
          >
            <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(to right,#8B5CF6,#EC4899)' }}>
              POPULAR
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: '#C4B5FD' }}>PREMIUM</div>
            <div className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
              49 RON<span className="text-base font-normal opacity-70"> / lună</span>
            </div>
            <div className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Pentru cumpărători activi</div>
            <ul className="space-y-2 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              <li>✓ Tot ce e în Free</li>
              <li>✓ Negociere automată</li>
              <li>✓ Alternative găsite de AI</li>
              <li>✓ Follow-up și alerte</li>
              <li>✓ Suport prioritar</li>
            </ul>
            <Link
              href="/cont"
              className="block w-full text-center px-5 py-3 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(to right,#8B5CF6,#EC4899)' }}
            >
              Activează Premium →
            </Link>
          </div>
        </div>
        <p className="text-center text-xs mt-6 opacity-70" style={{ color: 'var(--text-secondary)' }}>
          Poți anula oricând. Fără card pentru perioada de test.
        </p>
      </section>
    </main>
  )
}
