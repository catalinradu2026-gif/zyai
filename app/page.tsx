import Link from 'next/link'
import Button from '@/components/ui/Button'
import HeroSearch from '@/components/HeroSearch'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Startup Style */}
      <section className="pt-40 pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Găsești exact ce vrei.{' '}
            <span className="text-blue-600">Fără să mai cauți.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 font-light">
            Scrii ce vrei, iar AI-ul găsește cele mai bune anunțuri pentru tine.
          </p>

          {/* AI Search Bar - Main Feature */}
          <HeroSearch />

          {/* CTA */}
          <Link href="/anunt/nou">
            <button className="px-8 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition inline-block">
              Postează anunț gratuit →
            </button>
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gray-200 max-w-3xl mx-auto mb-24" />

      {/* How It Works - 3 Steps */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center">
            Cum funcționează
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Scrii ce vrei', description: 'Descrie ce cauți în orice detaliu' },
              { step: '02', title: 'AI caută pentru tine', description: 'Algoritm inteligent găsește cele mai relevante anunțuri' },
              { step: '03', title: 'Primești rezultatele', description: 'Descoperă exact ce-ai căutat, rapid și ușor' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-4">
                <div className="text-4xl font-bold text-gray-200">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gray-200 max-w-3xl mx-auto mb-24" />

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center">
            De ce zyAI?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Căutare inteligentă',
                description: 'Powered by AI - înțelege cu exactitate ce cauți',
              },
              {
                icon: '🎯',
                title: 'Rezultate relevante',
                description: 'Doar anunțuri care se potrivesc exact cu cerințele tale',
              },
              {
                icon: '✨',
                title: 'Fără complicații',
                description: 'Nicio filtru greu - AI face tot pentru tine',
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition space-y-4">
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gray-200 max-w-3xl mx-auto mb-24" />

      {/* CTA Section - Final */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Gata să postezi?
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Postează anunțul tău gratuit și ajunge la mii de potențiali cumpărători în câteva secunde.
          </p>

          <Link href="/anunt/nou">
            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl inline-block">
              Postează acum gratuit →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer - Minimal */}
      <div className="h-px bg-gray-200 max-w-3xl mx-auto mt-24 mb-16" />
      <footer className="py-12 px-4 text-center text-gray-500 text-sm">
        <p>© 2026 zyAI. Built with AI for humans who value their time.</p>
      </footer>
    </main>
  )
}
