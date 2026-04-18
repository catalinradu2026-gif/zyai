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

type ParsedQuery = { keyword: string; city: string; maxPrice: number | null; variants: string[] }

async function parseQuery(query: string): Promise<ParsedQuery> {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })
    const res = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Ești un parser inteligent pentru un marketplace românesc. Query-ul poate veni din voce și poate conține greșeli fonetice sau transcrieri incorecte ale mărcilor.

Extrage:
- keyword: cuvântul cheie CORECT (corectează greșeli fonetice de mărci auto: "bemveu"/"be em ve"/"bm vu" → "BMW", "aude"/"audde"/"ode" → "Audi", "mertcedes"/"mersedes"/"mercedes benz" → "Mercedes", "datie"/"dacia" → "Dacia", "vw"/"folfsvagen" → "Volkswagen". Corectează și produse: "labtop"/"latop" → "laptop", "telefon"/"telepon" → "telefon"). Fără "caut/vreau/vand/găsesc". Forma de bază.
- city: orașul corect dacă e menționat (ex: "craiova" → "Craiova", "bucuresti" → "București") sau "" dacă nu
- maxPrice: prețul maxim ca număr dacă e menționat, altfel null
- variants: array cu variante de scris ale keyword-ului pentru căutare (ex: ["casa","casă","case","Case"] sau ["BMW","bmw"] sau ["laptop","Laptop"]). Max 4 variante.

Returnează DOAR JSON valid: {"keyword":"...","city":"...","maxPrice":null,"variants":["..."]}`,
        },
        { role: 'user', content: query },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
      max_tokens: 120,
    })
    const txt = (res.choices[0].message.content || '{}')
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(txt)
    return {
      keyword: parsed.keyword || query,
      city: parsed.city || '',
      maxPrice: parsed.maxPrice || null,
      variants: Array.isArray(parsed.variants) ? parsed.variants : [parsed.keyword || query],
    }
  } catch {
    return { keyword: query, city: '', maxPrice: null, variants: [query] }
  }
}


async function searchListings(query: string) {
  const { createSupabaseAdmin } = await import('@/lib/supabase-admin')
  const admin = createSupabaseAdmin()
  const parsed = await parseQuery(query)

  const kw = parsed.keyword.trim()
  const city = parsed.city || ''
  const maxPrice = parsed.maxPrice
  // Groq returnează variante cu/fără diacritice (ex: ["casa","casă"])
  const variants = [...new Set([kw, ...parsed.variants])].filter(Boolean)

  const SELECT = 'id, title, description, price, price_type, currency, city, images, category_id, metadata, status, updated_at'

  const buildBase = () => admin
    .from('listings')
    .select(SELECT, { count: 'exact' })
    .in('status', ['activ', 'bidding', 'vandut'])
    .order('updated_at', { ascending: false })
    .limit(40)

  const applyFilters = (q: any) => {
    if (city) q = q.ilike('city', `%${city}%`)
    if (maxPrice) q = q.lte('price', maxPrice)
    return q
  }

  // Încearcă fiecare variantă (keyword + diacritice + sinonime) în titlu
  for (const variant of variants) {
    const { data, count } = await applyFilters(buildBase().ilike('title', `%${variant}%`))
    if (data?.length) return { listings: data as any[], count: count || 0, usedKeyword: variant }
  }

  // Niciun rezultat — returnează gol (nu fallback agresiv "toate din oraș")
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
      {/* TEST BANNER — sterge dupa confirmare */}
      <div style={{ background: '#ef4444', color: 'white', fontWeight: 700, fontSize: '13px', padding: '8px 16px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
        🧪 v18apr-5 — Toate statusurile in search (activ/licitatie/vandut cu badge), sortare dupa cele mai noi modificari
      </div>
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
                      ? <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" style={{ opacity: listing.status === 'vandut' ? 0.45 : 1 }} />
                      : <span className="text-4xl opacity-40">📦</span>}
                    {listing.status === 'vandut' && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                        <span style={{ background: '#ef4444', color: 'white', fontWeight: 900, fontSize: '14px', padding: '5px 16px', borderRadius: '8px', letterSpacing: '2px', transform: 'rotate(-12deg)', border: '2px solid white' }}>VÂNDUT</span>
                      </div>
                    )}
                    {listing.status === 'bidding' && (
                      <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: 'white', fontWeight: 800, fontSize: '11px', padding: '3px 10px', borderRadius: '20px', letterSpacing: '1px', boxShadow: '0 0 12px rgba(245,158,11,0.6)' }}>
                        🔨 LICITAȚIE ACTIVĂ
                      </div>
                    )}
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
