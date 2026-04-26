'use client'

import { useState, useRef } from 'react'

const features = [
  {
    icon: '🤖',
    title: 'AI creează anunțul',
    short: 'Încarci o poză și AI face tot',
    tooltip: 'Faci o poză produsului și o încarci. AI-ul generează automat titlul, descrierea și prețul recomandat pe baza imaginii. Nu trebuie să scrii nimic — anunțul tău e gata în 10 secunde.',
  },
  {
    icon: '📊',
    title: 'AI Verdict',
    short: 'Bun, corect sau scump — instant',
    tooltip: 'La fiecare anunț, AI-ul compară prețul cu sute de anunțuri similare din piață și îți spune dacă e ieftin, corect sau scump. Știi exact dacă faci o afacere bună înainte să cumperi.',
  },
  {
    icon: '🔥',
    title: 'Licitație automată',
    short: 'Mai mulți cumpărători → preț mai mare',
    tooltip: 'Când activezi licitația pe anunțul tău, mai mulți cumpărători concurează între ei. Prețul crește automat la fiecare ofertă nouă. Tu stai și aștepți — vinzi mai scump fără să negociezi.',
  },
  {
    icon: '🤝',
    title: 'AI negociază prețul',
    short: 'AI obține cel mai bun preț pentru tine',
    tooltip: 'Îi spui AI-ului bugetul maxim și el negociază în locul tău cu vânzătorul. AI-ul trimite oferte progresive și încearcă să obțină prețul cel mai mic posibil, fără stres pentru tine.',
  },
  {
    icon: '🔍',
    title: 'AI caută pe toate platformele',
    short: 'Caută vocal pe OLX, Autovit, eMag și altele',
    tooltip: 'Spui vocal sau în text ce cauți — de exemplu „Audi A6 sub 10.000 EUR în Craiova". AI-ul caută simultan pe zyAI, OLX, Autovit, Imobiliare.ro, eMag și alte platforme românești și îți aduce cele mai bune rezultate.',
  },
  {
    icon: '✨',
    title: 'AI optimizează imagini',
    short: 'Pozele tale arată mai bine automat',
    tooltip: 'AI-ul îmbunătățește automat pozele anunțului tău — luminozitate, contrast, claritate. Produsul tău arată mai bine în rezultate, atragi mai mulți cumpărători și vinzi mai repede.',
  },
  {
    icon: '🔔',
    title: 'AI alertă preț',
    short: 'Te anunță când apare prețul dorit',
    tooltip: 'Setezi un produs și prețul maxim pe care ești dispus să-l plătești. Când apare un anunț nou la acel preț sau mai mic, primești notificare instant. Nu mai trebuie să verifici manual în fiecare zi.',
  },
]

function FeatureCard({ f }: { f: typeof features[0] }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showTooltip = open || hovered

  function handleMouseEnter() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setHovered(true)
  }
  function handleMouseLeave() {
    timerRef.current = setTimeout(() => setHovered(false), 150)
  }
  function handleClick() {
    setOpen(prev => !prev)
  }

  return (
    <div
      className="relative rounded-2xl p-4 md:p-5 text-center glass glass-hover transition-all cursor-pointer select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="text-3xl md:text-4xl mb-2">{f.icon}</div>
      <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{f.short}</p>
      <p className="text-xs mt-1 hidden md:block" style={{ color: 'rgba(139,92,246,0.7)' }}>hover pentru detalii</p>
      <p className="text-xs mt-1 md:hidden" style={{ color: 'rgba(139,92,246,0.7)' }}>atinge pentru detalii</p>

      {showTooltip && (
        <div
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] w-64 rounded-xl p-4 text-left shadow-2xl"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(139,92,246,0.4)',
            boxShadow: '0 0 24px rgba(139,92,246,0.25)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{f.icon}</span>
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{f.title}</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.tooltip}</p>
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 rotate-45"
            style={{
              background: 'var(--bg-card)',
              borderRight: '1px solid rgba(139,92,246,0.4)',
              borderBottom: '1px solid rgba(139,92,246,0.4)',
              marginTop: '-6px',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default function AIFeaturesSection() {
  return (
    <section className="max-w-5xl mx-auto mb-12 md:mb-16">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-block mb-3 px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <span className="text-sm font-semibold" style={{ color: '#A78BFA' }}>Inteligență artificială integrată</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          🤖 Ce poate face AI pe zyAI
        </h2>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Apasă pe orice funcție pentru a înțelege cum te ajută
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mb-10">
        {features.map((f, i) => (
          <FeatureCard key={i} f={f} />
        ))}
      </div>

      {/* Cum folosești zyAI */}
      <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="text-lg md:text-xl font-black mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
          Cum folosești zyAI
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { step: '1', icon: '📸', text: 'Faci o poză sau cauți vocal ce vrei' },
            { step: '2', icon: '🤖', text: 'AI generează anunțul sau găsește ofertele' },
            { step: '3', icon: '👆', text: 'Alegi oferta potrivită cu ajutorul AI' },
            { step: '4', icon: '🎉', text: 'Vinzi sau cumperi mai inteligent' },
          ].map(s => (
            <div key={s.step} className="flex flex-col items-center text-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                style={{ background: 'var(--gradient-main)' }}>
                {s.step}
              </div>
              <span className="text-2xl">{s.icon}</span>
              <p className="text-xs md:text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
