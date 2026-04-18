import Link from 'next/link'
import type { Metadata } from 'next'
import Groq from 'groq-sdk'
import FavoriteButton from '@/components/listings/FavoriteButton'
import SearchInline from '@/components/SearchInline'
import SearchVoice from '@/components/SearchVoice'
import { getUser } from '@/lib/actions/auth'
import { getFavoritedIds } from '@/lib/queries/favorites'

type Props = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `"${q}" - Căutare zyAI` : 'Căutare - zyAI' }
}

async function parseQuery(query: string) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })
    const res = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Ești un parser pentru un marketplace românesc. Din query-ul utilizatorului extrage:
- keyword: cuvântul cheie principal de căutat (forma de bază, singular, fără "caut", "vreau", "găsește" etc.). Ex: "caut electricieni" → "electrician", "vreau iPhone ieftin" → "iPhone"
- city: orașul dacă e menționat (ex: "Craiova", "București") sau "" dacă nu
- maxPrice: numărul dacă e menționat un preț maxim, altfel null

Returnează DOAR JSON valid fără explicații: {"keyword":"...","city":"...","maxPrice":null}`,
        },
        { role: 'user', content: query },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
      max_tokens: 80,
    })
    const txt = (res.choices[0].message.content || '{}')
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(txt) as { keyword: string; city: string; maxPrice: number | null }
  } catch {
    return { keyword: query, city: '', maxPrice: null }
  }
}

const AUTO_BRANDS = ['audi','bmw','mercedes','volkswagen','vw','dacia','ford','opel','renault','mazda','porsche','volvo','skoda','seat','toyota','honda','nissan','hyundai','kia','peugeot','citroen','fiat','suzuki','subaru','alfa','jeep','land rover','mini','mitsubishi','lexus','tesla','chevrolet','dodge']

const STOP_WORDS = new Set(['caut','vreau','vand','vind','cumpar','gaseste','gasesc','afla','am','un','una','cel','mai','bun','buna','ieftin','ieftina','si','in','la','pe','de','cu','sau','din'])

async function searchListings(query: string) {
  const { createSupabaseAdmin } = await import('@/lib/supabase-admin')
  const admin = createSupabaseAdmin()
  const parsed = await parseQuery(query)

  const kw = (parsed.keyword || query).trim()
  const city = parsed.city || ''
  const maxPrice = parsed.maxPrice

  const kwLower = kw.toLowerCase()
  const kwWords = kwLower.split(/\s+/)
  const isAutoBrand = AUTO_BRANDS.includes(kwLower) || kwWords.some(w => AUTO_BRANDS.includes(w))

  const SELECT = 'id, title, description, price, price_type, currency, city, images, category_id, metadata, status'

  const buildBase = () => admin
    .from('listings')
    .select(SELECT, { count: 'exact' })
    .in('status', ['activ', 'bidding'])
    .order('created_at', { ascending: false })
    .limit(40)

  // Căutare principală
  let q = buildBase()
  if (isAutoBrand) {
    const brand = kwWords.find(w => AUTO_BRANDS.includes(w)) || kw
    q = q.or(`metadata->>brand.ilike.%${brand}%,title.ilike.%${brand}%`)
  } else {
    q = q.ilike('title', `%${kw}%`)
  }
  if (city) q = q.ilike('city', `%${city}%`)
  if (maxPrice) q = q.lte('price', maxPrice)

  const { data, count } = await q
  if (data?.length) return { listings: data as any[], count: count || 0, usedKeyword: kw }

  // Fallback: încearcă fiecare cuvânt semnificativ din keyword (fără stop words)
  const meaningful = kwWords.filter(w => w.length > 2 && !STOP_WORDS.has(w))
  for (const word of meaningful) {
    const q2 = buildBase().ilike('title', `%${word}%`)
    const qf = city ? q2.ilike('city', `%${city}%`) : q2
    const { data: d2, count: c2 } = await qf
    if (d2?.length) return { listings: d2 as any[], count: c2 || 0, usedKeyword: word }
  }

  // Fallback final: dacă are oraș, toate anunțurile din acel oraș
  if (city) {
    const { data: d3, count: c3 } = await buildBase().ilike('city', `%${city}%`)
    if (d3?.length) return { listings: d3 as any[], count: c3 || 0, usedKeyword: city }
  }

  return { listings: [], count: 0, usedKeyword: kw }
}

type PriceStats = { p25: number; p75: number }

async function getCategoryPriceStats(categoryIds: number[]): Promise<Record<number, PriceStats>> {
  const { createSupabaseAdmin } = await import('@/lib/supabase-admin')
  const admin = createSupabaseAdmin()
  const stats: Record<number, PriceStats> = {}
  await Promise.all(categoryIds.map(async (catId) => {
    const { data } = await admin
      .from('listings')
      .select('price')
      .eq('category_id', catId)
      .in('status', ['activ', 'bidding'])
      .not('price', 'is', null)
      .gt('price', 0)
      .order('price', { ascending: true })
    if (data && data.length >= 5) {
      const prices = data.map((d: any) => Number(d.price))
      stats[catId] = {
        p25: prices[Math.floor(prices.length * 0.25)],
        p75: prices[Math.floor(prices.length * 0.75)],
      }
    }
  }))
  return stats
}

function getVerdict(price: number | null, categoryId: number, stats: Record<number, PriceStats>): { emoji: string; label: string; color: string; bg: string } | null {
  if (!price || !stats[categoryId]) return null
  const { p25, p75 } = stats[categoryId]
  if (price <= p25) return { emoji: '🟢', label: 'ieftin', color: '#4ADE80', bg: 'rgba(34,197,94,0.1)' }
  if (price <= p75) return { emoji: '🟡', label: 'ok', color: '#FDE047', bg: 'rgba(234,179,8,0.1)' }
  return { emoji: '🔴', label: 'scump', color: '#F87171', bg: 'rgba(239,68,68,0.1)' }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  let listings: any[] = []
  let count = 0

  if (query) {
    try {
      const result = await searchListings(query)
      listings = result.listings
      count = result.count
    } catch {}
  }

  // User + favorite IDs pentru butonul inimă
  const user = await getUser()
  let favoritedIds: string[] = []
  if (user) {
    const { data: fav } = await getFavoritedIds(user.id)
    favoritedIds = fav || []
  }

  const uniqueCategoryIds = [...new Set(listings.map((l: any) => l.category_id).filter(Boolean))]
  const priceStats = listings.length > 0 ? await getCategoryPriceStats(uniqueCategoryIds) : {}

  return (
    <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 16px 48px' }}>
      {/* Voice response — vorbește rezultatele când vine de la mic */}
      <SearchVoice
        query={query}
        count={count}
        firstTitle={listings[0]?.title}
        firstPrice={listings[0]?.price ? `${listings[0].price.toLocaleString('ro-RO')} ${listings[0].currency}` : undefined}
        firstCity={listings[0]?.city}
      />

      {/* Search bar reîncercare */}
      <div style={{ marginBottom: '32px' }}>
        <SearchInline defaultValue={query} />
        <div style={{ marginTop: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Rezultate căutare AI</p>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            <span style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              "{query}"
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {count > 0
              ? `${count} anunț${count !== 1 ? 'uri' : ''} găsit${count !== 1 ? 'e' : ''}`
              : query ? 'Niciun rezultat găsit' : ''}
          </p>
        </div>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing: any, index: number) => {
            const CATEGORY_SLUGS: Record<number, string> = { 3: 'auto', 2: 'imobiliare', 1: 'joburi', 4: 'servicii' }
            const catSlug = CATEGORY_SLUGS[listing.category_id] ?? ''
            const isAuto = catSlug === 'auto'
            const meta = listing.metadata ?? null
            const chips: { icon: string; label: string }[] = []
            if (isAuto && meta) {
              if (meta.year) chips.push({ icon: '📅', label: meta.year })
              if (meta.mileage) chips.push({ icon: '🛣️', label: `${Number(meta.mileage).toLocaleString('ro-RO')} km` })
              if (meta.fuelType) chips.push({ icon: '⛽', label: meta.fuelType })
              if (meta.gearbox) chips.push({ icon: '⚙️', label: meta.gearbox })
            }
            const price = listing.price && listing.price_type !== 'gratuit'
              ? `${listing.price.toLocaleString('ro-RO')} ${listing.currency}`
              : listing.price_type === 'negociabil' ? 'Negociabil' : 'Gratuit'
            return (
              <Link key={listing.id} href={`/anunt/${listing.id}`} className="block group">
                {index === 0 && listings.length > 1 && (
                  <div style={{
                    padding: '6px 12px', borderRadius: '8px 8px 0 0', fontSize: '12px', fontWeight: 700,
                    background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', color: 'white', textAlign: 'center'
                  }}>
                    ⭐ Cea mai bună alegere
                  </div>
                )}
                <div className="rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: index === 0 && listings.length > 1 ? '0 0 12px 12px' : undefined
                  }}>
                  <div className="h-40 flex items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#4c1d95,#1e3a8a)' }}>
                    {listing.images?.[0]
                      ? <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      : <span className="text-4xl opacity-40">📦</span>}
                    <div className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)' }}>✨ AI</div>
                    {(() => {
                      const v = getVerdict(listing.price, listing.category_id, priceStats)
                      return v ? (
                        <div style={{
                          position: 'absolute', bottom: '8px', left: '8px',
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                          background: v.bg, color: v.color, backdropFilter: 'blur(8px)',
                          border: `1px solid ${v.color}40`
                        }}>
                          {v.emoji} AI: {v.label}
                        </div>
                      ) : null
                    })()}
                    <FavoriteButton
                      listingId={listing.id}
                      userId={user?.id}
                      initialFavorited={favoritedIds.includes(listing.id)}
                    />
                  </div>
                  <div className="p-3 flex flex-col gap-1.5">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors"
                      style={{ color: 'var(--text-primary)' }}>{listing.title}</h3>
                    {listing.description && (
                      <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{listing.description}</p>
                    )}
                    {chips.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {chips.map((chip) => (
                          <span key={chip.label} className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                            {chip.icon} {chip.label}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-base" style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{price}</span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{listing.city}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : query ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>Nu am găsit anunțuri pentru "{query}"</p>
          <Link href="/" className="text-sm" style={{ color: '#8B5CF6' }}>← Înapoi la categorii</Link>
        </div>
      ) : null}
    </main>
  )
}
