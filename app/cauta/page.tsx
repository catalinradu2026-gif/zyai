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

async function searchListings(query: string) {
  const { createSupabaseAdmin } = await import('@/lib/supabase-admin')
  const admin = createSupabaseAdmin()
  const parsed = await parseQuery(query)

  const kw = parsed.keyword || query
  const city = parsed.city || ''
  const maxPrice = parsed.maxPrice

  // Construiește filtrul OR: caută în titlu SAU descriere (activ + bidding)
  let q = admin
    .from('listings')
    .select('id, title, description, price, price_type, currency, city, images, category_id, metadata, status', { count: 'exact' })
    .in('status', ['activ', 'bidding'])
    .or(`title.ilike.%${kw}%,description.ilike.%${kw}%`)
    .order('created_at', { ascending: false })
    .limit(40)

  if (city) q = q.ilike('city', `%${city}%`)
  if (maxPrice) q = q.lte('price', maxPrice)

  const { data, count } = await q

  // Fallback: dacă nu găsește nimic, caută fiecare cuvânt din keyword
  if (!data?.length) {
    const words = kw.split(/\s+/).filter((w: string) => w.length > 2)
    for (const word of words) {
      const { data: d2, count: c2 } = await admin
        .from('listings')
        .select('id, title, description, price, price_type, currency, city, images, category_id, metadata, status', { count: 'exact' })
        .in('status', ['activ', 'bidding'])
        .or(`title.ilike.%${word}%,description.ilike.%${word}%`)
        .order('created_at', { ascending: false })
        .limit(40)
      if (d2?.length) return { listings: d2 as any[], count: c2 || 0, usedKeyword: word }
    }
  }

  return { listings: data || [], count: count || 0, usedKeyword: kw }
}

function getVerdict(price: number | null, allPrices: number[]): { emoji: string; label: string; color: string; bg: string } | null {
  if (!price || allPrices.length < 3) return null
  const sorted = [...allPrices].sort((a, b) => a - b)
  const p33 = sorted[Math.floor(sorted.length * 0.33)]
  const p66 = sorted[Math.floor(sorted.length * 0.66)]
  if (price <= p33) return { emoji: '🟢', label: 'bun', color: '#4ADE80', bg: 'rgba(34,197,94,0.1)' }
  if (price <= p66) return { emoji: '🟡', label: 'ok', color: '#FDE047', bg: 'rgba(234,179,8,0.1)' }
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

  const allPrices = listings.filter((l: any) => l.price).map((l: any) => l.price)

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
                      const v = getVerdict(listing.price, allPrices)
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
