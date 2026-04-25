import Link from 'next/link'
import type { Metadata } from 'next'
import Groq from 'groq-sdk'
import FavoriteButton from '@/components/listings/FavoriteButton'
import SearchInline from '@/components/SearchInline'
import SearchVoice from '@/components/SearchVoice'
import BuyerAlertSetup from '@/components/listings/BuyerAlertSetup'
import { getUser } from '@/lib/actions/auth'
import { getFavoritedIds } from '@/lib/queries/favorites'

type Props = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `"${q}" - Căutare zyAI` : 'Căutare - zyAI' }
}

// categoryId map: auto=3, imobiliare=2, joburi=1, servicii=4, electronice=5, moda=6, casa-gradina=7, sport=8, animale=9, mama-copilul=10
type ParsedQuery = { keyword: string; city: string; maxPrice: number | null; variants: string[]; categoryId: number | null }

async function parseQuery(query: string): Promise<ParsedQuery> {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })
    const res = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Ești un parser pentru un marketplace românesc. Query-ul poate fi din voce sau text, în română informală.

Extrage:
- keyword: cuvântul cheie specific CORECT. Corectează greșeli fonetice de mărci: "bemveu/be em ve/bm vu"→"BMW", "aude/audde/ode"→"Audi", "mersedes/mertcedes"→"Mercedes", "datie"→"Dacia", "vw/folfsvagen"→"Volkswagen". Corectează produse: "labtop/latop"→"laptop", "telepon"→"telefon". Scoate cuvinte de umplutură: "caut/vreau/vand/găsesc/un/o/de". Dacă nu există keyword specific (ex: "caut masina") → keyword="".
- city: orașul corect (ex: "craiova"→"Craiova", "bucuresti"→"București", "cluj"→"Cluj-Napoca") sau "" dacă nu e menționat.
- maxPrice: prețul maxim ca număr sau null.
- variants: variante de scris ale keyword-ului dacă keyword nu e gol (ex: ["BMW","bmw"], ["laptop","Laptop"], ["apartament","Apartament","ap"]). Max 4. Dacă keyword e gol → [].
- categoryId: numărul categoriei detectate din context:
  1=joburi (job/muncă/angajare/salariat/lucru)
  2=imobiliare (apartament/casă/teren/garsonieră/chirie/imobil/bloc/vilă/ap/camere)
  3=auto (mașină/masina/auto/BMW/Audi/Dacia/Volkswagen/Mercedes/Ford/Toyota/Opel/Renault/motocicletă/moto/camion/vehicul/bolid/rabla/autoturism/autoturisme)
  4=servicii (service/reparații/curățenie/transport/IT/instalator/electrician/zugrav/meșter)
  5=electronice (telefon/smartphone/iPhone/Samsung/laptop/PC/calculator/tabletă/TV/gaming/console)
  6=moda (haine/îmbrăcăminte/pantofi/geantă/rochie/blugi/tricou/jachetă/bluză)
  7=casa-gradina (mobilă/electrocasnic/frigider/aragaz/canapea/decoratiuni/unelte/grădină)
  8=sport (bicicletă/fitness/fotbal/tenis/ski/echipament sportiv)
  9=animale (câine/pisică/papagal/pești/hamster/animal)
  10=mama-copilul (căruciор/jucărie/haine copii/mobilier copii/bebeluș)
  null=dacă nu e clar

Returnează DOAR JSON valid: {"keyword":"...","city":"...","maxPrice":null,"variants":[...],"categoryId":null}`,
        },
        { role: 'user', content: query },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
      max_tokens: 150,
    })
    const txt = (res.choices[0].message.content || '{}')
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(txt)
    return {
      keyword: parsed.keyword || '',
      city: parsed.city || '',
      maxPrice: parsed.maxPrice || null,
      variants: Array.isArray(parsed.variants) ? parsed.variants : (parsed.keyword ? [parsed.keyword] : []),
      categoryId: parsed.categoryId || null,
    }
  } catch {
    return { keyword: query, city: '', maxPrice: null, variants: [query], categoryId: null }
  }
}


async function searchListings(query: string) {
  const { createSupabaseAdmin } = await import('@/lib/supabase-admin')
  const admin = createSupabaseAdmin()
  const parsed = await parseQuery(query)

  const kw = parsed.keyword.trim()
  const city = parsed.city || ''
  const maxPrice = parsed.maxPrice
  const catId = parsed.categoryId
  const variants = [...new Set([kw, ...parsed.variants])].filter(Boolean)

  const SELECT = 'id, title, description, price, price_type, currency, city, images, category_id, metadata, status'

  const buildBase = () => {
    let q = admin
      .from('listings')
      .select(SELECT, { count: 'exact' })
      .in('status', ['activ', 'bidding', 'vandut'])
      .order('created_at', { ascending: false })
      .limit(40)
    if (maxPrice) q = q.lte('price', maxPrice)
    return q
  }

  // 1. Keyword în titlu + oraș
  if (variants.length > 0) {
    for (const v of variants) {
      let q = buildBase().ilike('title', `%${v}%`)
      if (city) q = q.ilike('city', `%${city}%`)
      const { data, count } = await q
      if (data?.length) return { listings: data as any[], count: count || 0, usedKeyword: v }
    }
  }

  // 2. Keyword în descriere + oraș
  if (variants.length > 0) {
    for (const v of variants) {
      let q = buildBase().ilike('description', `%${v}%`)
      if (city) q = q.ilike('city', `%${city}%`)
      const { data, count } = await q
      if (data?.length) return { listings: data as any[], count: count || 0, usedKeyword: v }
    }
  }

  // 3. Keyword în titlu fără restricție de oraș
  if (variants.length > 0 && city) {
    for (const v of variants) {
      const { data, count } = await buildBase().ilike('title', `%${v}%`)
      if (data?.length) return { listings: data as any[], count: count || 0, usedKeyword: v }
    }
  }

  // 4. Categorie + oraș (pentru "caut masina in craiova", "caut apartament in cluj")
  if (catId) {
    let q = buildBase().eq('category_id', catId)
    if (city) q = q.ilike('city', `%${city}%`)
    const { data, count } = await q
    if (data?.length) return { listings: data as any[], count: count || 0, usedKeyword: kw || query }
  }

  // 5. Categorie fără restricție de oraș
  if (catId) {
    const { data, count } = await buildBase().eq('category_id', catId)
    if (data?.length) return { listings: data as any[], count: count || 0, usedKeyword: kw || query }
  }

  return { listings: [], count: 0, usedKeyword: kw || query }
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

  // AI Matchmaking — scor potrivire per anunț (direct Groq, fără self-fetch)
  const matchScores: Record<string, { score: number; reason: string }> = {}
  if (query && listings.length > 0) {
    try {
      const groq2 = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })
      const listingsSummary = listings.slice(0, 20).map((l: any, i: number) =>
        `[${i}] ID:${l.id} | "${l.title}" | ${l.price || '?'}${l.currency || 'EUR'} | ${l.city || ''}`
      ).join('\n')
      const matchRes = await groq2.chat.completions.create({
        messages: [{
          role: 'user',
          content: `Utilizatorul caută: "${query}"\n\nAnunțuri:\n${listingsSummary}\n\nReturnează DOAR JSON: {"matches":[{"id":"listing_id","score":număr_0_100,"reason":"de ce se potrivește (max 30 caractere)"}]}\nPrimele 5, sortate descrescător după score.`,
        }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 400,
      })
      const raw = (matchRes.choices[0].message.content || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        for (const m of (parsed.matches || [])) matchScores[m.id] = { score: m.score, reason: m.reason }
      }
    } catch {}
  }

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
        <div style={{ marginTop: '12px' }}>
          <BuyerAlertSetup query={query} />
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
                {matchScores[listing.id] && (
                  <div style={{
                    padding: '5px 12px', borderRadius: '8px 8px 0 0', fontSize: '12px', fontWeight: 700,
                    background: matchScores[listing.id].score >= 80
                      ? 'linear-gradient(135deg,#8B5CF6,#3B82F6)'
                      : 'rgba(139,92,246,0.15)',
                    color: matchScores[listing.id].score >= 80 ? 'white' : '#A78BFA',
                    textAlign: 'center',
                    border: matchScores[listing.id].score >= 80 ? 'none' : '1px solid rgba(139,92,246,0.3)',
                  }}>
                    🎯 {matchScores[listing.id].score}% potrivire
                  </div>
                )}
                {!matchScores[listing.id] && index === 0 && listings.length > 1 && (
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
                    borderRadius: (matchScores[listing.id] || (index === 0 && listings.length > 1)) ? '0 0 12px 12px' : undefined
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
