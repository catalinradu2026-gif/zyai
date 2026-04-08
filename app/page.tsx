import Link from 'next/link'
import CategoriesBrowser from '@/components/CategoriesBrowser'
import HeroSearch from '@/components/HeroSearch'
import SearchButton from '@/components/SearchButton'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'zyAI - Marketplace cu AI | Anunțuri Gratuite România',
  description: 'Postezi o dată. AI-ul îți găsește cumpărător. Platforma de anunțuri în România cu inteligență artificială. Auto, imobiliare, joburi, servicii.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'zyAI',
  url: 'https://zyai.ro',
  description: 'Marketplace cu AI integrat',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://zyai.ro?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
}

// Mock listings pentru preview
const MOCK_LISTINGS = [
  { id: 'a1b2c3d4-0001-0000-0000-000000000001', title: 'iPhone 15 Pro Max negru, 256GB', price: 4500, currency: 'RON', city: 'București', images: [], status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000002', title: 'Apartament 2 camere, Dorobanți', price: 250000, currency: 'EUR', city: 'București', images: [], status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000003', title: 'BMW 320d 2015, 180.000 km', price: 12000, currency: 'EUR', city: 'Cluj', images: [], status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000004', title: 'React Developer - Senior Level', price: 5000, currency: 'RON', city: 'Remote', images: [], status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000005', title: 'Laptop Gaming ASUS ROG, RTX 4070', price: 6500, currency: 'RON', city: 'Timișoara', images: [], status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000006', title: 'Apartament de inchiriat, Obor', price: 800, currency: 'RON', city: 'București', images: [], status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000007', title: 'Mercedes-Benz E-Class 2020', price: 35000, currency: 'EUR', city: 'Brașov', images: [], status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000008', title: 'UI/UX Designer freelance', price: 3000, currency: 'RON', city: 'Cluj', images: [], status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
]

export default async function Home() {
  const listings = MOCK_LISTINGS

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4">
        {/* ========== HERO SECTION ========== */}
        <section className="relative mb-24">
          {/* Glow background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ background: 'var(--gradient-main)' }}
            />
            <div
              className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ background: 'linear-gradient(to top right, #3B82F6, #8B5CF6)' }}
            />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block mb-6 px-4 py-2 rounded-full glass">
              <span className="text-sm font-medium">⚡ AI-Powered Marketplace 2026</span>
            </div>

            {/* Main Title - Gradient animated */}
            <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
              <span className="gradient-main-text">Marketplace cu AI.</span>
              <br />
              <span style={{ color: 'var(--text-primary)' }}>Gratuit.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl mb-8" style={{ color: 'var(--text-secondary)' }}>
              Postezi o dată. AI-ul îți găsește cumpărător.
            </p>

            {/* Search Box */}
            <div className="mb-12 max-w-2xl mx-auto">
              <HeroSearch />
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 justify-center">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-main-text">1,200+</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>utilizatori azi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-main-text">45</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>anunțuri noi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-main-text">3.2K</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>pe platformă</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== CATEGORIES ========== */}
        <section className="max-w-6xl mx-auto mb-24">
          <h2 className="text-3xl font-bold mb-8 text-center">Categorii</h2>
          <CategoriesBrowser />
        </section>

        {/* ========== RECENT LISTINGS ========== */}
        <section className="max-w-6xl mx-auto mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Cele mai noi anunțuri</h2>
            <Link href="/marketplace/auto" className="text-blue-light hover:text-purple-light transition">
              Vezi toate →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.slice(0, 8).map((listing: any) => (
              <Link key={listing.id} href={`/anunt/${listing.id}`}>
                <div
                  className="group rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer h-full"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Image Placeholder */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center group-hover:shadow-lg transition">
                    <span className="text-white text-4xl opacity-60">📦</span>
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold rounded-full">
                      ✨ AI
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-blue-light transition">
                      {listing.title}
                    </h3>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold gradient-main-text">
                        {listing.price?.toLocaleString('ro-RO')} {listing.currency}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {listing.city}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== CTA BANNER ========== */}
        <section className="max-w-4xl mx-auto mb-16">
          <div
            className="rounded-2xl p-8 md:p-12 text-center gradient-main"
            style={{ boxShadow: 'var(--glow-purple)' }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Postează primul tău anunț</h2>
            <p className="text-white/80 mb-6 text-lg">100% gratuit. AI-ul se ocupă de restul.</p>
            <Link href="/anunt/nou">
              <Button variant="secondary" size="lg">
                Crează anunț acum →
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
