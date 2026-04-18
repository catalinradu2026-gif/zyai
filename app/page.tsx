import Link from 'next/link'
import AIGreetingBubble from '@/components/AIGreetingBubble'
import CategoriesBrowser from '@/components/CategoriesBrowser'
import HeroSearch from '@/components/HeroSearch'
import HeroActions from '@/components/HeroActions'
import LiveStats from '@/components/LiveStats'
import SwipeableRow from '@/components/listings/SwipeableRow'
import PersonalizedSection from '@/components/listings/PersonalizedSection'
import Button from '@/components/ui/Button'
import type { Metadata } from 'next'
import { getListings } from '@/lib/queries/listings'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getUser } from '@/lib/actions/auth'
import { getFavoritedIds } from '@/lib/queries/favorites'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'zyAI - Marketplace cu AI | Anunțuri Gratuite România',
  description: 'Ai ceva de vândut? Zi hai pe zyAi. Faci o poză, AI-ul face restul. Marketplace românesc cu AI — auto, imobiliare, joburi, servicii.',
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

const MOCK_LISTINGS = [
  { id: 'a1b2c3d4-0001-0000-0000-000000000001', title: 'iPhone 15 Pro Max negru, 256GB', description: 'Stare impecabilă, folosit 3 luni, toate accesoriile originale incluse. Garanție Apple până în 2026.', price: 4500, currency: 'RON', city: 'București', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop'], category: 'electronice', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000002', title: 'Apartament 2 camere, Dorobanți', description: 'Apartament modern renovat complet în 2023, zonă liniștită, metrou la 5 minute. Etaj 4 din 8.', price: 250000, currency: 'EUR', city: 'București', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'], category: 'imobiliare', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000003', title: 'BMW 320d 2015, 180.000 km', description: 'Motor 2.0 diesel 184CP, automat 8 viteze, full options. ITP valabil, fără accidente.', price: 12000, currency: 'EUR', city: 'Cluj', images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop'], category: 'auto', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z', metadata: { year: '2015', mileage: '180000', fuelType: 'Diesel', gearbox: 'Automată' } },
  { id: 'a1b2c3d4-0001-0000-0000-000000000004', title: 'React Developer - Senior Level', description: 'Căutăm Senior React Developer pentru echipa noastră de produs. Remote full-time, salariu competitiv.', price: 5000, currency: 'RON', city: 'Remote', images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'], category: 'joburi', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000005', title: 'Laptop Gaming ASUS ROG, RTX 4070', description: 'Procesor Intel i9-13900H, 32GB RAM DDR5, SSD 1TB NVMe. Ecran 165Hz QHD. Ca nou, cutie originală.', price: 6500, currency: 'RON', city: 'Timișoara', images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop'], category: 'electronice', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000006', title: 'Apartament de închiriat, Obor', description: '2 camere decomandate, mobilat modern, toate utilitățile incluse. Disponibil din 1 mai.', price: 800, currency: 'RON', city: 'București', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'], category: 'imobiliare', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000007', title: 'Mercedes-Benz E-Class 2020', description: 'E220d AMG Line, 194CP, pachet premium, scaune din piele, head-up display. Prima înmatriculare RO.', price: 35000, currency: 'EUR', city: 'Brașov', images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop'], category: 'auto', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z', metadata: { year: '2020', mileage: '55000', fuelType: 'Diesel', gearbox: 'Automată' } },
  { id: 'a1b2c3d4-0001-0000-0000-000000000008', title: 'UI/UX Designer freelance', description: 'Designer cu 6 ani experiență în Figma, disponibil pentru proiecte web și mobile. Portofoliu la cerere.', price: 3000, currency: 'RON', city: 'Cluj', images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'], category: 'joburi', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000009', title: 'Samsung Galaxy S24 Ultra, 512GB', description: 'Titanium Black, S Pen inclus, 200MP camera, stare perfectă. Cumpărat în ianuarie 2024.', price: 5200, currency: 'RON', city: 'Iași', images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop'], category: 'electronice', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000010', title: 'Dacia Duster 2022, 4x4, 45.000 km', description: 'Motor 1.5 dCi 115CP, tracțiune integrală, navigație, senzori parcare. Stare excelentă.', price: 18500, currency: 'EUR', city: 'Timișoara', images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop'], category: 'auto', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z', metadata: { year: '2022', mileage: '45000', fuelType: 'Diesel', gearbox: 'Manuală' } },
  { id: 'a1b2c3d4-0001-0000-0000-000000000011', title: 'Casă cu 4 camere, curte 500mp', description: 'Casă individuală P+1, 4 camere, 2 băi, garaj, grădină amenajată. Zona liniștită, acces rapid la centru.', price: 120000, currency: 'EUR', city: 'Cluj', images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'], category: 'imobiliare', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000012', title: 'Cărucior Bugaboo Fox 5 complet', description: 'Cărucior premium cu scoică, landou și toate accesoriile. Culoare albastru închis, stare foarte bună.', price: 2800, currency: 'RON', city: 'București', images: ['https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=400&h=300&fit=crop'], category: 'mama-copilul', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000013', title: 'Set jucării educative Montessori 3-6 ani', description: 'Set complet de 20 jucării din lemn natural, netoxice, certificate CE. Perfecte pentru dezvoltare cognitivă.', price: 350, currency: 'RON', city: 'Cluj', images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop'], category: 'mama-copilul', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000014', title: 'Bicicletă MTB Trek Marlin 7, 2023', description: 'Cadru aluminiu, furca SR Suntour 100mm, 12 viteze Shimano. Roți 29", stare impecabilă.', price: 3200, currency: 'RON', city: 'Brașov', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'], category: 'sport', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000015', title: 'Canapea extensibilă piele naturală', description: 'Canapea 3 locuri, piele naturală maro cognac, mecanism extensibil. Dimensiuni 230x90cm. Folosită 1 an.', price: 4500, currency: 'RON', city: 'București', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop'], category: 'casa-gradina', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000016', title: 'Golden Retriever pui 2 luni, vaccinați', description: 'Pui superbi din părinți cu pedigree, vaccinați și deparazitați. Se vând cu carnet de sănătate.', price: 1200, currency: 'RON', city: 'Iași', images: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=300&fit=crop'], category: 'animale', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000017', title: 'Nike Air Max 270 mărimea 42, nou', description: 'Sigilați, cutie originală, colorway Triple Black. Cumpărați din Nike Store, nu s-au purtat niciodată.', price: 480, currency: 'RON', city: 'Timișoara', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'], category: 'moda', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000018', title: 'Servicii reparații electrocasnice', description: 'Reparăm mașini de spălat, frigidere, congelatoare, aragazuri. Deplasare la domiciliu, garanție 12 luni.', price: 150, currency: 'RON', city: 'București', images: ['https://images.unsplash.com/photo-1581092160607-ee22731c9c86?w=400&h=300&fit=crop'], category: 'servicii', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
  { id: 'a1b2c3d4-0001-0000-0000-000000000019', title: 'Volkswagen Golf 8 2021, 60.000 km', description: 'Motor 2.0 TDI 150CP, DSG 7 viteze, Digital Cockpit Pro, ACC, Lane Assist. Service la dealer VW.', price: 22000, currency: 'EUR', city: 'București', images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=300&fit=crop'], category: 'auto', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z', metadata: { year: '2021', mileage: '60000', fuelType: 'Diesel', gearbox: 'Automată' } },
  { id: 'a1b2c3d4-0001-0000-0000-000000000020', title: 'MacBook Pro M3, 16GB RAM, 512GB', description: 'MacBook Pro 14", chip M3 Pro, Space Black, baterie 90%. Garanție AppleCare până în 2026.', price: 9800, currency: 'RON', city: 'Cluj', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'], category: 'electronice', status: 'activ', createdAt: '2026-04-08T20:00:00.000Z' },
]

export default async function Home() {
  // Utilizator curent + favorite IDs (paralel)
  const [userResult, suggestionsResult, dbListingsResult, soldListingsResult, biddingListingsResult] = await Promise.allSettled([
    getUser(),
    (async () => {
      const supabase = await createSupabaseServerClient()
      const { data } = await supabase
        .from('listings')
        .select('title')
        .eq('status', 'activ')
        .order('created_at', { ascending: false })
        .limit(6)
      return data?.map((l: any) => l.title as string) ?? []
    })(),
    getListings({ page: 1 }),
    // Toate anunțurile vandute — apar cu badge VÂNDUT
    (async () => {
      const admin = createSupabaseAdmin()
      const { data } = await admin
        .from('listings')
        .select('id, title, description, price, price_type, currency, city, images, created_at, status, category_id, metadata')
        .eq('status', 'vandut')
        .order('created_at', { ascending: false })
        .limit(10)
      return data ?? []
    })(),
    // Toate licitațiile active — apar cu badge LICITAȚIE
    (async () => {
      const admin = createSupabaseAdmin()
      const { data } = await admin
        .from('listings')
        .select('id, title, description, price, price_type, currency, city, images, created_at, status, category_id, metadata')
        .eq('status', 'bidding')
        .order('created_at', { ascending: false })
        .limit(10)
      return data ?? []
    })(),
  ])

  const user = userResult.status === 'fulfilled' ? userResult.value : null
  const suggestions: string[] = suggestionsResult.status === 'fulfilled' ? suggestionsResult.value : []
  const dbListings = dbListingsResult.status === 'fulfilled' ? dbListingsResult.value.data : null
  const soldListings = soldListingsResult.status === 'fulfilled' ? soldListingsResult.value : []
  const biddingListings = biddingListingsResult.status === 'fulfilled' ? biddingListingsResult.value : []

  // Fetch favorite IDs dacă userul e logat
  let favoritedIds: string[] = []
  if (user) {
    const { data: fav } = await getFavoritedIds(user.id)
    favoritedIds = fav || []
  }

  const CATEGORY_SLUGS: Record<number, string> = { 1: 'joburi', 2: 'imobiliare', 3: 'auto', 4: 'servicii', 5: 'electronice', 6: 'moda', 7: 'casa-gradina', 8: 'sport', 9: 'animale', 10: 'mama-copilul' }

  const mapListing = (l: any) => ({
    id: l.id,
    title: l.title,
    description: l.description ?? undefined,
    price: l.price,
    price_type: l.price_type ?? 'fix',
    currency: l.currency ?? 'RON',
    city: l.city,
    images: l.images ?? [],
    status: l.status ?? 'activ',
    category: CATEGORY_SLUGS[l.category_id] ?? undefined,
    metadata: l.metadata ?? null,
    created_at: l.created_at,
    bidding_end_time: l.metadata?.bidding_end_time ?? l.bidding_end_time ?? undefined,
    current_highest_bid: l.metadata?.current_highest_bid ?? l.current_highest_bid ?? undefined,
  })

  const activeListings = (dbListings ?? []).map(mapListing)
  const soldMapped = soldListings.map(mapListing)
  const biddingMapped = biddingListings.map(mapListing)

  // Deduplicare globală
  const seenIds = new Set<string>()
  const dedupe = (arr: any[]) => arr.filter((l: any) => {
    if (seenIds.has(l.id)) return false
    seenIds.add(l.id)
    return true
  })

  // "Cele mai noi" = licitații active + vandute + cele mai noi active (max 12)
  const recentListings = dedupe([...biddingMapped, ...soldMapped, ...activeListings]).slice(0, 12)

  // "Oferte pentru tine" = restul anunțurilor active (fără cele deja afișate în "cele mai noi")
  const recentIds = new Set(recentListings.map((l: any) => l.id))
  const oferteListing = activeListings.filter((l: any) => !recentIds.has(l.id))

  // Selectează primele 6 anunțuri cu imagine pentru secțiunea "Produse subevaluate"
  const undervalued = recentListings.filter((l: any) => l.images && l.images.length > 0 && l.status === 'activ').slice(0, 6)

  return (
    <>
      <AIGreetingBubble />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4">
{/* ========== HERO ========== */}
        <section className="relative mb-10 md:mb-14">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: 'var(--gradient-main)' }} />
            <div className="absolute -bottom-20 -right-40 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: 'linear-gradient(to top right,#3B82F6,#8B5CF6)' }} />
          </div>
          <div className="relative max-w-2xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass">
              <span className="text-sm font-semibold gradient-main-text">Zi hai pe zyAi! ⚡</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
              Vinde și cumpără<br />
              <span className="gradient-main-text">mai inteligent cu AI</span>
            </h1>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Fă o poză sau spune ce cauți. AI face restul.
            </p>
            <HeroActions />
          </div>
        </section>

        {/* ========== AI FEATURES 3 CARDURI ========== */}
        <section className="max-w-4xl mx-auto mb-10 md:mb-14">
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            {[
              { icon: '🤖', title: 'AI creează anunțul', text: 'Încarci o poză și AI face tot' },
              { icon: '📊', title: 'AI Verdict', text: 'Bun, ok sau scump — instant' },
              { icon: '🔥', title: 'Licitație automată', text: 'Mai mulți cumpărători → preț mai mare' },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl p-4 md:p-5 text-center glass glass-hover transition-all">
                <div className="text-3xl md:text-4xl mb-2">{f.icon}</div>
                <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                <p className="text-xs hidden md:block" style={{ color: 'var(--text-secondary)' }}>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========== CATEGORIES (existent, funcțional) ========== */}
        <section className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Categorii</h2>
          <CategoriesBrowser />
        </section>

        {/* ========== LIVE STATS (existent, funcțional) ========== */}
        <LiveStats />

        {/* ========== PRODUSE SUBEVALUATE ========== */}
        {undervalued.length > 0 && (
          <section className="max-w-6xl mx-auto mb-16 md:mb-24">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <span className="text-sm font-bold" style={{ color: '#F87171' }}>
                  🔥 DETECTATE DE AI AZI
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                Produse subevaluate
              </h2>
              <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
                AI a identificat aceste anunțuri ca având preț sub piață
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {undervalued.map((l: any) => (
                <Link
                  key={l.id}
                  href={`/anunt/${l.id}`}
                  className="group relative rounded-2xl overflow-hidden glass glass-hover transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={l.images[0]}
                      alt={l.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur"
                      style={{ background: 'rgba(239,68,68,0.85)' }}>
                      🤖 AI: subevaluat
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm md:text-base line-clamp-2 mb-2"
                      style={{ color: 'var(--text-primary)' }}>
                      {l.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black gradient-main-text">
                        {l.price ? `${l.price.toLocaleString('ro-RO')} ${l.currency}` : 'Negociabil'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {l.city}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}


        {/* ========== CELE MAI NOI ANUNȚURI ========== */}
        <SwipeableRow
          listings={recentListings}
          title="Cele mai noi anunțuri"
          subtitle="Licitații active, vânzări recente și anunțuri noi"
          userId={user?.id}
          favoritedIds={favoritedIds}
        />

        {/* ========== OFERTE PENTRU TINE ========== */}
        <PersonalizedSection allListings={oferteListing.length >= 4 ? oferteListing : activeListings} />

        {/* ========== DIFERENȚIERE ========== */}
        <section className="max-w-5xl mx-auto mb-16 md:mb-24">
          <div
            className="rounded-3xl p-8 md:p-12 glass relative overflow-hidden"
            style={{ boxShadow: 'var(--glow-purple)' }}
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: 'var(--gradient-main)' }} />
            <div className="relative">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-black mb-3">
                  <span className="gradient-main-text">Nu e doar un site de anunțuri</span>
                </h2>
                <p className="text-lg md:text-xl" style={{ color: 'var(--text-secondary)' }}>
                  zyAI este un marketplace inteligent unde AI te ajută să vinzi mai rapid și să cumperi mai bine.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: '✨', text: 'AI generează anunțurile automat din poză' },
                  { icon: '🎯', text: 'AI oferă verdict de preț la fiecare anunț' },
                  { icon: '🎤', text: 'Căutare vocală inteligentă în limba română' },
                  { icon: '⚡', text: 'Licitații automate între cumpărători' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-base md:text-lg pt-1" style={{ color: 'var(--text-primary)' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== EXEMPLE / WOW ========== */}
        <section className="max-w-6xl mx-auto mb-16 md:mb-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
              Ce poate face AI pentru tine
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                quote: 'Am făcut o poză și AI mi-a creat anunțul în 10 secunde',
                icon: '⚡',
                accent: '#8B5CF6',
              },
              {
                quote: 'AI mi-a spus că produsul e prea scump și am negociat mai bine',
                icon: '💡',
                accent: '#3B82F6',
              },
              {
                quote: 'Am vândut mai scump datorită licitației automate',
                icon: '🚀',
                accent: '#8B5CF6',
              },
            ].map((ex, i) => (
              <div
                key={i}
                className="relative rounded-2xl p-6 glass glass-hover transition-all duration-300"
              >
                <div
                  className="absolute top-0 left-6 -translate-y-1/2 px-3 py-1 rounded-full text-2xl"
                  style={{ background: ex.accent }}
                >
                  {ex.icon}
                </div>
                <p className="text-lg leading-relaxed pt-4" style={{ color: 'var(--text-primary)' }}>
                  „{ex.quote}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========== CTA FINAL ========== */}
        <section className="max-w-4xl mx-auto mb-16">
          <div
            className="rounded-3xl p-8 md:p-14 text-center relative overflow-hidden"
            style={{ background: 'var(--gradient-main)', boxShadow: 'var(--glow-purple)' }}
          >
            <div className="absolute inset-0 opacity-30"
              style={{ background: 'radial-gradient(circle at 30% 0%, rgba(255,255,255,0.3), transparent 50%)' }} />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-3">Încearcă zyAI acum</h2>
              <p className="text-white/90 text-lg md:text-xl mb-8">
                Gratuit. Rapid. Mai inteligent decât marketplace-urile clasice.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/anunt/nou"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:scale-105 transition-transform"
                >
                  📸 Vinde acum
                </Link>
                <Link
                  href="#search-ai"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-white hover:scale-105 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  🎤 Caută produs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========== FOOTER SIMPLU ========== */}
        <footer className="max-w-6xl mx-auto pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
            style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <span className="font-black text-base gradient-main-text">zyAI</span>
              <span className="opacity-60">© 2026</span>
            </div>
            <div className="flex gap-6">
              <Link href="/despre" className="hover:opacity-80 transition-opacity">Despre noi</Link>
              <Link href="/termeni" className="hover:opacity-80 transition-opacity">Termeni și condiții</Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity">Contact</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
