import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Despre noi - zyAI',
  description: 'zyAI a fost creată pentru a schimba complet experiența de vânzare și cumpărare din România prin inteligență artificială.',
}

export default function DesprePage() {
  return (
    <main className="min-h-screen pt-24 pb-20 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <span className="text-sm font-semibold" style={{ color: '#A78BFA' }}>Marketplace cu AI din România</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            Despre <span className="gradient-main-text">zyAI</span>
          </h1>
        </div>

        {/* Misiunea */}
        <section className="rounded-2xl p-6 md:p-8 glass">
          <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            🎯 Misiunea noastră
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            zyAI a fost creată pentru a schimba complet experiența de vânzare și cumpărare din România.
          </p>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Ne-am săturat cu toții de orele pierdute cu redactarea anunțurilor, compararea manuală a prețurilor și căutarea pe zeci de site-uri. De aceea am construit o platformă unde inteligența artificială face munca grea în locul tău, ca tu să <strong style={{ color: 'var(--text-primary)' }}>vinzi mai rapid și să cumperi mai inteligent</strong>.
          </p>
        </section>

        {/* Ce ne face diferiti */}
        <section>
          <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
            ✨ Ce ne face diferiți
          </h2>
          <p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
            zyAI nu este un alt marketplace clasic cu AI adăugat ulterior. Inteligența artificială este integrată <strong style={{ color: 'var(--text-primary)' }}>nativ, profund și util</strong>:
          </p>

          <div className="space-y-4">
            {/* AI creează anunțul */}
            <div className="rounded-2xl p-5 md:p-6"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">📸</span>
                <div>
                  <h3 className="font-black text-base mb-1" style={{ color: 'var(--text-primary)' }}>AI creează anunțul</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Încarcă o singură poză și AI-ul generează instant un anunț complet: titlu atractiv, descriere detaliată, preț recomandat și optimizează automat imaginea. Totul în doar câteva secunde – zero efort, rezultat profesionist.
                  </p>
                </div>
              </div>
            </div>

            {/* Căutare vocală */}
            <div className="rounded-2xl p-5 md:p-6"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">🎤</span>
                <div>
                  <h3 className="font-black text-base mb-1" style={{ color: 'var(--text-primary)' }}>Căutare vocală inteligentă</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Prima funcție de acest tip din România. Vorbești natural — „Audi A6 sub 10.000 euro în Craiova" sau „canapea 3 locuri ieftină" — și AI-ul caută simultan pe OLX, Autovit, eMag și alte platforme românești. Îți aduce cele mai relevante rezultate într-un singur loc.
                  </p>
                </div>
              </div>
            </div>

            {/* Alte funcții */}
            <div className="rounded-2xl p-5 md:p-6"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Pe lângă acestea, platforma oferă:</p>
              <ul className="space-y-2">
                {[
                  { icon: '📊', text: 'AI Verdict – evaluare instantanee a prețului (bun, corect sau scump)' },
                  { icon: '🔥', text: 'Licitație automată pentru maximizarea prețului de vânzare' },
                  { icon: '🤝', text: 'Negociere asistată de AI' },
                  { icon: '🔔', text: 'Alerte de preț și detectarea oportunităților subevaluate' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
            📈 Stadiul actual <span className="text-base font-normal" style={{ color: 'var(--text-secondary)' }}>(aprilie 2026)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { number: '3.200+', label: 'anunțuri publicate pe platformă', icon: '📋' },
              { number: '~1.000', label: 'utilizatori activi zilnic', icon: '👥' },
              { number: 'Zeci/zi', label: 'anunțuri noi în fiecare zi', icon: '⚡' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-black gradient-main-text mb-1">{s.number}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Platforma crește rapid și se extinde continuu la nivel național, cu accent pe categoriile cele mai căutate: <strong style={{ color: 'var(--text-primary)' }}>auto, imobiliare, electronice și servicii</strong>.
          </p>
        </section>

        {/* Viziunea */}
        <section className="rounded-3xl p-6 md:p-10 text-center relative overflow-hidden"
          style={{ background: 'var(--gradient-main)', boxShadow: 'var(--glow-purple)' }}>
          <div className="absolute inset-0 opacity-20"
            style={{ background: 'radial-gradient(circle at 30% 0%, rgba(255,255,255,0.4), transparent 60%)' }} />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">🚀 Viziunea noastră</h2>
            <p className="text-white/90 text-base md:text-lg leading-relaxed mb-4">
              Vrem să devenim cel mai inteligent marketplace din România — un loc unde vânzarea și cumpărarea devin simple, rapide și mult mai eficiente datorită AI-ului.
            </p>
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6">
              Totul rămâne <strong className="text-white">gratuit pentru utilizatorii individuali</strong>, iar feedback-ul vostru ne ghidează în fiecare pas al dezvoltării.
            </p>
            <p className="text-white font-bold text-base">Echipa zyAI</p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-base transition-transform hover:scale-105"
            style={{ background: 'var(--gradient-main)' }}>
            ← Înapoi la marketplace
          </Link>
        </div>

      </div>
    </main>
  )
}
