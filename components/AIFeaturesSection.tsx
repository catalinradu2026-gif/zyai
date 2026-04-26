'use client'

import { useState, useRef, useEffect } from 'react'

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
  {
    icon: '⚖️',
    title: 'AI Comparare anunțuri',
    short: 'Compară până la 3 anunțuri simultan',
    tooltip: 'Selectezi până la 3 anunțuri și AI generează un raport complet de comparație cu tabel, scoruri din 10 pentru fiecare produs, pro & contra detaliate și o recomandare clară cu preț de negociere. Nu mai alegi la noroc.',
  },
  {
    icon: '🛡️',
    title: 'AI Detectare fraudă',
    short: 'Scor de încredere pentru fiecare anunț',
    tooltip: 'AI analizează fiecare anunț după semnale de risc: preț prea mic față de piață, descriere suspectă, cont nou, poze generice sau lips ă detalii. Primești un scor de încredere și avertismente clare înainte să trimiți banii.',
  },
]

function FeatureCard({ f }: { f: typeof features[0] }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const showTooltip = open || hovered

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [open])

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
      ref={cardRef}
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

      {/* Cum folosești zyAI — 2 carduri cu tooltip */}
      <div>
        <h3 className="text-lg md:text-xl font-black mb-5 text-center" style={{ color: 'var(--text-primary)' }}>
          Cum folosești zyAI
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RoleCard
            icon="🏷️"
            role="Vânzător"
            accent="#8B5CF6"
            accentBg="rgba(139,92,246,0.1)"
            accentBorder="rgba(139,92,246,0.35)"
            tooltip={[
              { icon: '📸', title: 'Faci o poză', text: 'Încarci o singură poză din telefon sau calculator.' },
              { icon: '🤖', title: 'AI face anunțul', text: 'AI-ul generează automat titlu profesional, descriere completă și preț recomandat bazat pe piață. Zero efort din partea ta.' },
              { icon: '✨', title: 'Poze mai frumoase', text: 'AI îmbunătățește luminozitatea, contrastul și claritatea pozelor tale. Produsul arată mai atractiv în rezultate.' },
              { icon: '🔥', title: 'Licitație automată', text: 'Activezi licitația cu un click. Cumpărătorii concurează între ei, prețul crește automat — tu vinzi mai scump fără să negociezi.' },
              { icon: '📊', title: 'AI Verdict preț', text: 'AI compară prețul tău cu sute de anunțuri similare și îți spune dacă ești competitiv sau poți cere mai mult.' },
            ]}
          />
          <RoleCard
            icon="🛒"
            role="Cumpărător"
            accent="#3B82F6"
            accentBg="rgba(59,130,246,0.1)"
            accentBorder="rgba(59,130,246,0.35)"
            tooltip={[
              { icon: '🎤', title: 'Caută vocal', text: 'Spui ce vrei — „Audi A6 sub 10.000 EUR în Craiova" — și AI înțelege tot: marcă, model, preț, oraș.' },
              { icon: '🔍', title: 'Căutare pe toate platformele', text: 'AI caută simultan pe zyAI, OLX, Autovit, Imobiliare.ro, eMag și alte platforme românești. Toate rezultatele într-un singur loc.' },
              { icon: '📊', title: 'AI Verdict', text: 'La fiecare anunț văd dacă prețul e ieftin, corect sau scump față de piață. Iei decizii informate, nu ghicite.' },
              { icon: '🤝', title: 'AI negociază pentru tine', text: 'Îi spui bugetul maxim și AI trimite oferte progresive vânzătorului. Obții prețul cel mai mic posibil fără stres.' },
              { icon: '🔔', title: 'Alertă preț', text: 'Setezi produsul și prețul dorit. Când apare un anunț nou la acel preț sau mai mic, primești notificare instant.' },
            ]}
          />
        </div>
      </div>
    </section>
  )
}

function RoleCard({
  icon, role, accent, accentBg, accentBorder, tooltip,
}: {
  icon: string
  role: string
  accent: string
  accentBg: string
  accentBorder: string
  tooltip: { icon: string; title: string; text: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const showTooltip = open || hovered

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [open])

  function handleMouseEnter() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setHovered(true)
  }
  function handleMouseLeave() {
    timerRef.current = setTimeout(() => setHovered(false), 200)
  }

  return (
    <div
      ref={cardRef}
      className="relative rounded-2xl p-5 cursor-pointer transition-all"
      style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setOpen(p => !p)}
    >
      <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
        <span className="text-5xl">{icon}</span>
        <p className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>{role}</p>
        <p className="text-sm" style={{ color: accent }}>atinge pentru a vedea cum te ajută AI</p>
      </div>

      {showTooltip && (
        <div
          className="absolute z-50 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-80 bottom-[calc(100%+12px)] rounded-2xl p-5 shadow-2xl"
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${accentBorder}`,
            boxShadow: `0 0 32px ${accentBg}`,
          }}
          onClick={e => e.stopPropagation()}
        >
          <p className="font-black text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            {icon} Cum funcționează — {role}
          </p>
          <div className="space-y-3">
            {tooltip.map((t, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-lg flex-shrink-0">{t.icon}</span>
                <div>
                  <p className="font-semibold text-xs mb-0.5" style={{ color: accent }}>{t.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 rotate-45"
            style={{
              background: 'var(--bg-card)',
              borderRight: `1px solid ${accentBorder}`,
              borderBottom: `1px solid ${accentBorder}`,
              marginTop: '-6px',
            }}
          />
        </div>
      )}
    </div>
  )
}
