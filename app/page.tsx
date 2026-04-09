import Link from 'next/link'
import CategoriesBrowser from '@/components/CategoriesBrowser'
import HeroSearch from '@/components/HeroSearch'
import LiveStats from '@/components/LiveStats'
import SwipeableRow from '@/components/listings/SwipeableRow'
import PersonalizedSection from '@/components/listings/PersonalizedSection'
import Button from '@/components/ui/Button'
import type { Metadata } from 'next'
import { getListings } from '@/lib/queries/listings'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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
  // Sugestii reale din anunțurile active
  let suggestions: string[] = []
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('listings')
      .select('title')
      .eq('status', 'activ')
      .order('created_at', { ascending: false })
      .limit(6)
    if (data && data.length > 0) {
      suggestions = data.map((l: any) => l.title as string)
    }
  } catch {}

  const CATEGORY_SLUGS: Record<number, string> = { 3: 'auto', 2: 'imobiliare', 1: 'joburi', 4: 'servicii' }
  const { data: dbListings } = await getListings({ page: 1 })
  const dbMapped = (dbListings ?? []).map((l: any) => ({
    id: l.id,
    title: l.title,
    description: l.description ?? undefined,
    price: l.price,
    currency: l.currency ?? 'RON',
    city: l.city,
    images: l.images ?? [],
    category: CATEGORY_SLUGS[l.category_id] ?? undefined,
    metadata: l.metadata ?? null,
  }))
  // Folosește doar anunțuri reale din DB — mock-urile cauzau 404 la click
  const listings = dbMapped.length > 0 ? dbMapped : []

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4">
        {/* ========== HERO SECTION ========== */}
        <section className="relative mb-24">
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
            <div className="inline-block mb-6 px-4 py-2 rounded-full glass">
              <span className="text-sm font-medium">⚡ AI-Powered Marketplace 2026</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
              <span className="gradient-main-text">Marketplace cu AI.</span>
              <br />
              <span style={{ color: 'var(--text-primary)' }}>Gratuit.</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8" style={{ color: 'var(--text-secondary)' }}>
              Postezi o dată. AI-ul îți găsește cumpărător.
            </p>

            <div className="mb-8 max-w-2xl mx-auto">
              <HeroSearch suggestions={suggestions} />
            </div>
          </div>
        </section>

        {/* ========== CATEGORIES ========== */}
        <section className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Categorii</h2>
          <CategoriesBrowser />
        </section>

        {/* ========== LIVE STATS ========== */}
        <LiveStats />

        {/* ========== CELE MAI NOI ANUNȚURI (swipeable) ========== */}
        <SwipeableRow
          listings={listings}
          title="Cele mai noi anunțuri"
          subtitle="Adăugate recent pe platformă"
        />

        {/* ========== OFERTE PENTRU TINE (personalizat) ========== */}
        <PersonalizedSection allListings={listings} />

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
