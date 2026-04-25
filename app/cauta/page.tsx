import Link from 'next/link'
import type { Metadata } from 'next'
import Groq from 'groq-sdk'
import FavoriteButton from '@/components/listings/FavoriteButton'
import SearchInline from '@/components/SearchInline'
import SearchVoice from '@/components/SearchVoice'
import BuyerAlertSetup from '@/components/listings/BuyerAlertSetup'
import ExternalSearchPanel from '@/components/ExternalSearchPanel'
import { getUser } from '@/lib/actions/auth'
import { getFavoritedIds } from '@/lib/queries/favorites'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `"${q}" - Căutare zyAI` : 'Căutare - zyAI' }
}

type ParsedQuery = {
  keyword: string
  city: string
  maxPrice: number | null
  minPrice: number | null
  variants: string[]
  categoryId: number | null
  subcategory: string | null  // metadata->>subcategory
  brand: string | null        // metadata->>brand (auto)
  model: string | null        // metadata->>model (auto)
  telefonBrand: string | null // metadata->>telefonBrand (electronice)
  laptopBrand: string | null  // metadata->>laptopBrand (electronice)
  nrCamere: string | null     // metadata->>nrCamere (imobiliare)
}

async function parseQuery(query: string): Promise<ParsedQuery> {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })
    const res = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Ești un parser precis pentru un marketplace românesc. Input-ul poate fi voce sau text informal.

Returnează DOAR JSON valid cu aceste câmpuri:

- keyword: brand/model/produs concret. Generic (masina/casa/apartament/laptop/telefon/bicicleta) → "". Corectează voce: "bemveu/be em ve/bm vu"→"BMW", "aude/ode"→"Audi", "mersedes"→"Mercedes", "datie"→"Dacia", "vw/folfsvagen/golf/passat"→păstrează modelul, "labtop/latop"→"laptop", "telepon/aifor/aifon"→"telefon"/"iPhone". Scoate: "caut/vreau/găsesc/un/o/de/pe/cauta".

- city: "Craiova"|"București"|"Cluj-Napoca"|"Timișoara"|"Iași"|"Brașov"|"Constanța"|"Galați"|"Ploiești"|"Oradea" sau "" dacă lipsește.

- maxPrice: număr sau null. "sub X"/"pana la X"→maxPrice=X.
- minPrice: număr sau null. "de la X"/"minim X"→minPrice=X.

- variants: max 3 variante ale keyword (cu/fără diacritice). [] dacă keyword="".

- categoryId: 1=joburi|2=imobiliare|3=auto|4=servicii|5=electronice|6=moda|7=casa-gradina|8=sport|9=animale|10=mama-copilul|null

- subcategory (slug EXACT):
  imobiliare→ "apartamente"|"case"|"terenuri"|"spatii-comerciale"|"birouri"|"garaje"|"cazare"
  auto→ "autoturisme"|"autoutilitare"|"camioane"|"microbuze"|"rulote"|"motociclete"|"remorci"|"piese"|"agricole"|"barci"
  electronice→ "telefoane"|"laptopuri"|"tablete"|"desktop"|"tv-audio"|"gaming"|"foto-video"|"componente-pc"
  joburi→ "it"|"marketing"|"vanzari"|"contabilitate"|"transport"|"horeca"|"medical"|"educatie"|"constructii"|"muncitori"
  servicii→ "reparatii"|"curatenie"|"transport-serviciu"|"it-serviciu"|"auto-service"|"frumusete"|"meditatii"
  sport→ "fitness"|"biciclete"|"outdoor"|"running"|"tenis"|"sporturi-apa"|"sporturi-iarna"
  animale→ "caini"|"pisici"|"pesti"|"pasari"|"rozatoare"
  moda→ "haine-femei"|"haine-barbati"|"incaltaminte-femei"|"incaltaminte-barbati"|"genti-accesorii"|"bijuterii"
  casa-gradina→ "mobila"|"electrocasnice"|"decoratiuni"|"gradina"|"unelte"|"bucatarie"
  mama-copilul→ "carucioare"|"mobilier-copii"|"haine-bebe"|"jucarii"|"ingrijire"

- brand: BMW|Audi|Dacia|Volkswagen|Mercedes|Ford|Toyota|Opel|Renault|Skoda|Seat|Hyundai|Kia|Peugeot|Fiat|Nissan|Honda|Mazda|Volvo|Jeep|Porsche|Subaru|Tesla sau null

- model: modelul exact (X5/A4/A6/Logan/Golf/Octavia/Focus/Clio/308/Sandero/Passat/Tiguan/Duster/Corsa/Astra/Mokka/Seria3/Seria5/520d/320d etc.) sau null

- telefonBrand: Apple|Samsung|Huawei|Xiaomi|OnePlus|Oppo|Realme|Nokia|LG sau null. "iPhone/iphone/aifor/aifon"→Apple.

- laptopBrand: Dell|HP|Lenovo|Asus|Acer|Apple|MSI|Toshiba|Samsung sau null.

- nrCamere (EXACT):
  "garsoniera/garsonieră/studio/1 camera/1c" → "1"
  "2 camere/2c/doua camere" → "2"
  "3 camere/3c/trei camere" → "3"
  "4 camere/4c/patru camere/5 camere/5c/6 camere" → "4+"
  fără mențiune camere → null

Exemple:
"cauta casa in craiova" → {"keyword":"","city":"Craiova","maxPrice":null,"minPrice":null,"variants":[],"categoryId":2,"subcategory":"case","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":null}
"apartament 2 camere" → {"keyword":"","city":"","maxPrice":null,"minPrice":null,"variants":[],"categoryId":2,"subcategory":"apartamente","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":"2"}
"apartament 3 camere bucuresti sub 500 euro" → {"keyword":"","city":"București","maxPrice":500,"minPrice":null,"variants":[],"categoryId":2,"subcategory":"apartamente","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":"3"}
"garsoniera craiova" → {"keyword":"","city":"Craiova","maxPrice":null,"minPrice":null,"variants":[],"categoryId":2,"subcategory":"apartamente","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":"1"}
"BMW X5" → {"keyword":"BMW X5","city":"","maxPrice":null,"minPrice":null,"variants":["BMW X5","bmw x5"],"categoryId":3,"subcategory":"autoturisme","brand":"BMW","model":"X5","telefonBrand":null,"laptopBrand":null,"nrCamere":null}
"audi a6 craiova sub 20000" → {"keyword":"Audi A6","city":"Craiova","maxPrice":20000,"minPrice":null,"variants":["Audi A6","audi a6"],"categoryId":3,"subcategory":"autoturisme","brand":"Audi","model":"A6","telefonBrand":null,"laptopBrand":null,"nrCamere":null}
"laptop Dell sub 3000" → {"keyword":"Dell","city":"","maxPrice":3000,"minPrice":null,"variants":["Dell","dell"],"categoryId":5,"subcategory":"laptopuri","brand":null,"model":null,"telefonBrand":null,"laptopBrand":"Dell","nrCamere":null}
"iPhone 15" → {"keyword":"iPhone 15","city":"","maxPrice":null,"minPrice":null,"variants":["iPhone 15","iphone 15"],"categoryId":5,"subcategory":"telefoane","brand":null,"model":null,"telefonBrand":"Apple","laptopBrand":null,"nrCamere":null}
"masina sub 5000 craiova" → {"keyword":"","city":"Craiova","maxPrice":5000,"minPrice":null,"variants":[],"categoryId":3,"subcategory":"autoturisme","brand":null,"model":null,"telefonBrand":null,"laptopBrand":null,"nrCamere":null}
"golf 7" → {"keyword":"Golf 7","city":"","maxPrice":null,"minPrice":null,"variants":["Golf 7","VW Golf 7","golf 7"],"categoryId":3,"subcategory":"autoturisme","brand":"Volkswagen","model":"Golf 7","telefonBrand":null,"laptopBrand":null,"nrCamere":null}`,
        },
        { role: 'user', content: query },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
      max_tokens: 200,
    })
    const txt = (res.choices[0].message.content || '{}')
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = txt.match(/\{[\s\S]*\}/)
    const p = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    return {
      keyword: p.keyword || '',
      city: p.city || '',
      maxPrice: p.maxPrice || null,
      minPrice: p.minPrice || null,
      variants: Array.isArray(p.variants) ? p.variants : (p.keyword ? [p.keyword] : []),
      categoryId: p.categoryId || null,
      subcategory: p.subcategory || null,
      brand: p.brand || null,
      model: p.model || null,
      telefonBrand: p.telefonBrand || null,
      laptopBrand: p.laptopBrand || null,
      nrCamere: p.nrCamere || null,
    }
  } catch {
    return { keyword: query, city: '', maxPrice: null, minPrice: null, variants: [query], categoryId: null, subcategory: null, brand: null, model: null, telefonBrand: null, laptopBrand: null, nrCamere: null }
  }
}


async function searchListings(query: string) {
  const { createSupabaseAdmin } = await import('@/lib/supabase-admin')
  const admin = createSupabaseAdmin()
  const p = await parseQuery(query)
  const parsedFilters = p

  const variants = [...new Set([p.keyword, ...p.variants])].filter(Boolean)
  const SELECT = 'id, title, price, price_type, currency, city, images, category_id, metadata, status'

  const base = () => admin
    .from('listings')
    .select(SELECT, { count: 'exact' })
    .in('status', ['activ', 'bidding', 'vandut'])
    .order('created_at', { ascending: false })
    .limit(20)

  // Aplică filtrele în funcție de ce avem
  const applyMeta = (q: any, opts: { city?: boolean; subcategory?: boolean; brand?: boolean; nrCamere?: boolean } = {}) => {
    if (p.maxPrice) q = q.lte('price', p.maxPrice)
    if (p.minPrice) q = q.gte('price', p.minPrice)
    if (p.categoryId) q = q.eq('category_id', p.categoryId)
    if (opts.subcategory && p.subcategory) q = q.eq('metadata->>subcategory', p.subcategory)
    if (opts.brand) {
      if (p.brand) q = q.ilike('metadata->>brand', p.brand)
      if (p.model) q = q.ilike('metadata->>model', `%${p.model}%`)
      if (p.telefonBrand) q = q.ilike('metadata->>telefonBrand', p.telefonBrand)
      if (p.laptopBrand) q = q.ilike('metadata->>laptopBrand', p.laptopBrand)
    }
    if (opts.nrCamere && p.nrCamere) q = q.eq('metadata->>nrCamere', p.nrCamere)
    if (opts.city && p.city) q = q.ilike('city', `%${p.city}%`)
    return q
  }

  const run = async (opts: Parameters<typeof applyMeta>[1], kw?: string) => {
    let q = applyMeta(base(), opts)
    if (kw) q = q.ilike('title', `%${kw}%`)
    const { data, count } = await q
    return { data: (data || []) as any[], count: count || 0 }
  }

  // ── Cu keyword (brand/model specific: "BMW X5", "iPhone 15", "laptop Dell") ──
  if (variants.length > 0) {
    for (const v of variants) {
      // 1. keyword + toți filtrii + oraș
      const r1 = await run({ city: true, subcategory: true, brand: true, nrCamere: true }, v)
      if (r1.data.length) return { listings: r1.data, count: r1.count, parsedFilters }
    }
    for (const v of variants) {
      // 2. keyword + categorie + brand, fără subcategorie și fără restricție de oraș
      const r2 = await run({ city: false, subcategory: false, brand: true, nrCamere: true }, v)
      if (r2.data.length) return { listings: r2.data, count: r2.count, parsedFilters }
    }
    for (const v of variants) {
      // 3. keyword + categorie + oraș, fără brand/model
      const r3 = await run({ city: true, subcategory: false, brand: false, nrCamere: false }, v)
      if (r3.data.length) return { listings: r3.data, count: r3.count, parsedFilters }
    }
    for (const v of variants) {
      // 4. keyword în titlu, fără niciun filtru
      const r4 = await run({}, v)
      if (r4.data.length) return { listings: r4.data, count: r4.count, parsedFilters }
    }
  }

  // ── Fără keyword (termin generic: "casa", "masina", "laptop") ──
  if (p.categoryId) {
    // 5. categorie + subcategorie + brand + nrCamere + oraș
    const r5 = await run({ city: true, subcategory: true, brand: true, nrCamere: true })
    if (r5.data.length) return { listings: r5.data, count: r5.count, parsedFilters }

    // 6. categorie + brand + nrCamere + oraș (fără subcategorie — poate nu e salvată)
    const r6 = await run({ city: true, subcategory: false, brand: true, nrCamere: true })
    if (r6.data.length) return { listings: r6.data, count: r6.count, parsedFilters }

    // 7. categorie + nrCamere + oraș (fără brand)
    const r7 = await run({ city: true, subcategory: false, brand: false, nrCamere: true })
    if (r7.data.length) return { listings: r7.data, count: r7.count, parsedFilters }

    // 8. categorie + oraș (cel mai relaxat cu orașul)
    const r8 = await run({ city: true, subcategory: false, brand: false, nrCamere: false })
    if (r8.data.length) return { listings: r8.data, count: r8.count, parsedFilters }

    // 9. doar categorie, fără restricție de oraș
    const r9 = await run({ city: false, subcategory: false, brand: false, nrCamere: false })
    if (r9.data.length) return { listings: r9.data, count: r9.count, parsedFilters }
  }

  return { listings: [], count: 0, parsedFilters }
}


export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  let listings: any[] = []
  let count = 0
  let parsedFilters: any = { categoryId: null, brand: null, model: null, maxPrice: null, minPrice: null, city: null, subcategory: null, nrCamere: null, keyword: query }

  if (query) {
    try {
      const result = await searchListings(query)
      listings = result.listings
      count = result.count
      if (result.parsedFilters) parsedFilters = { ...result.parsedFilters, keyword: result.parsedFilters.keyword || query }
    } catch {}
  }

  // User + favorite IDs pentru butonul inimă
  const user = await getUser()
  let favoritedIds: string[] = []
  if (user) {
    const { data: fav } = await getFavoritedIds(user.id)
    favoritedIds = fav || []
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
                <div className="rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
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

      {/* Caută pe platforme externe românești */}
      {query && (
        <ExternalSearchPanel query={query} filters={parsedFilters} />
      )}
    </main>
  )
}
