import Groq from 'groq-sdk'

export const runtime = 'nodejs'

export type AIListing = {
  id: string
  title: string
  price: string
  platform: string
  platformEmoji: string
  url: string
  specs: string[]
  matchScore: number
  aiReason: string
  location: string
}

const PLATFORM_EMOJIS: Record<string, string> = {
  'autovit.ro': '🚗',
  'olx.ro': '🟠',
  'autoscout24.ro': '🌐',
  'publi24.ro': '📋',
  'autouncle.ro': '🔍',
  'imobiliare.ro': '🏠',
  'storia.ro': '🏡',
  'anuntul.ro': '📰',
  'emag.ro': '🛍️',
  'okazii.ro': '🛒',
  'cel.ro': '💻',
}

function getPlatformFromUrl(url: string): { name: string; emoji: string } {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    const emoji = PLATFORM_EMOJIS[hostname] || '🔗'
    const name = hostname.split('.')[0]
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1) + '.' + hostname.split('.').slice(1).join('.'),
      emoji,
    }
  } catch {
    return { name: 'Site extern', emoji: '🔗' }
  }
}

function getSiteList(categoryId: number | null, hasPrice: boolean): string {
  if (categoryId === 3) {
    // Cu preț — caută direct în anunțuri individuale pe autovit
    if (hasPrice) {
      return 'site:autovit.ro/autoturisme/anunt OR site:olx.ro/d/oferta OR site:autoscout24.ro/lst OR site:publi24.ro/anunturi/auto'
    }
    return 'site:autovit.ro OR site:olx.ro OR site:autoscout24.ro OR site:publi24.ro OR site:autouncle.ro'
  }
  if (categoryId === 2) {
    if (hasPrice) {
      return 'site:imobiliare.ro/vanzare OR site:storia.ro/ro/rezultate OR site:olx.ro/d/oferta OR site:publi24.ro/anunturi/imobiliare'
    }
    return 'site:imobiliare.ro OR site:storia.ro OR site:olx.ro OR site:publi24.ro OR site:anuntul.ro'
  }
  if (categoryId === 5) {
    return 'site:olx.ro OR site:emag.ro OR site:okazii.ro OR site:publi24.ro OR site:cel.ro'
  }
  return 'site:olx.ro OR site:publi24.ro OR site:okazii.ro OR site:emag.ro'
}

function buildSearchQuery(filters: any, rawQuery: string): string {
  const parts: string[] = []
  if (filters.brand) parts.push(filters.brand)
  if (filters.model) parts.push(filters.model)
  if (filters.telefonBrand) parts.push(filters.telefonBrand)
  if (filters.laptopBrand) parts.push(filters.laptopBrand)
  if (parts.length === 0 && filters.keyword) parts.push(filters.keyword)
  if (parts.length === 0) parts.push(rawQuery)
  // Nu adăugăm prețul în query — Google nu filtrează după el, confuzie
  if (filters.city) parts.push(filters.city)
  return parts.join(' ')
}

// Generează linkuri directe cu filtre de preț pentru fiecare platformă
function buildPriceFilteredLinks(filters: any): AIListing[] {
  const { brand, model, minPrice, maxPrice, categoryId } = filters
  if (!minPrice && !maxPrice) return []

  const BRAND_SLUGS: Record<string, string> = {
    'BMW': 'bmw', 'Audi': 'audi', 'Dacia': 'dacia', 'Volkswagen': 'volkswagen',
    'Mercedes': 'mercedes-benz', 'Ford': 'ford', 'Toyota': 'toyota', 'Opel': 'opel',
    'Renault': 'renault', 'Skoda': 'skoda', 'Seat': 'seat', 'Hyundai': 'hyundai',
    'Kia': 'kia', 'Peugeot': 'peugeot', 'Fiat': 'fiat', 'Nissan': 'nissan',
  }

  const results: AIListing[] = []
  const brandSlug = brand ? (BRAND_SLUGS[brand] || brand.toLowerCase()) : ''
  const modelSlug = model ? model.toLowerCase().replace(/\s+/g, '-') : ''
  const priceLabel = minPrice && maxPrice
    ? `${minPrice.toLocaleString('ro-RO')}–${maxPrice.toLocaleString('ro-RO')} EUR`
    : maxPrice ? `sub ${maxPrice.toLocaleString('ro-RO')} EUR`
    : `de la ${minPrice?.toLocaleString('ro-RO')} EUR`

  if (categoryId === 3) {
    // Autovit cu preț
    let autovitUrl = `https://www.autovit.ro/autoturisme`
    if (brandSlug) autovitUrl += `/${brandSlug}`
    if (modelSlug) autovitUrl += `/${modelSlug.replace(/-/g, '_')}`
    const av = new URLSearchParams()
    if (minPrice) { av.set('search[filter_float_price:from]', String(minPrice)); av.set('search[filter_enum_currency]', 'EUR') }
    if (maxPrice) { av.set('search[filter_float_price:to]', String(maxPrice)); av.set('search[filter_enum_currency]', 'EUR') }
    results.push({
      id: `direct-autovit-${Date.now()}`,
      title: `${brand || ''} ${model || ''} — filtre preț ${priceLabel}`.trim(),
      price: priceLabel,
      platform: 'Autovit.ro',
      platformEmoji: '🚗',
      url: autovitUrl + (av.toString() ? '?' + av : ''),
      specs: ['Filtrat după preț', 'Toate rezultatele', 'Sortare: relevanță'],
      matchScore: 99,
      aiReason: `Caută direct cu filtru ${priceLabel}`,
      location: filters.city || 'România',
    })

    // OLX cu preț
    const olxQ = [brand, model].filter(Boolean).join(' ')
    const olxP = new URLSearchParams()
    if (olxQ) olxP.set('q', olxQ)
    if (minPrice) olxP.set('search[filter_float_price:from]', String(minPrice))
    if (maxPrice) olxP.set('search[filter_float_price:to]', String(maxPrice))
    results.push({
      id: `direct-olx-${Date.now()}`,
      title: `${brand || ''} ${model || ''} pe OLX — ${priceLabel}`.trim(),
      price: priceLabel,
      platform: 'OLX.ro',
      platformEmoji: '🟠',
      url: `https://www.olx.ro/auto-masini-moto-ambarcatiuni/autoturisme/` + (olxP.toString() ? '?' + olxP : ''),
      specs: ['Filtrat după preț', 'Anunțuri particulari', 'Fără comision'],
      matchScore: 97,
      aiReason: `Filtru exact ${priceLabel} aplicat`,
      location: filters.city || 'România',
    })
  }

  if (categoryId === 2) {
    const { subcategory, nrCamere, city } = filters
    const CITY_SLUGS: Record<string, string> = {
      'București': 'bucuresti', 'Craiova': 'craiova', 'Cluj-Napoca': 'cluj-napoca',
      'Timișoara': 'timisoara', 'Iași': 'iasi', 'Brașov': 'brasov',
      'Constanța': 'constanta', 'Galați': 'galati', 'Ploiești': 'ploiesti', 'Oradea': 'oradea',
    }
    const citySlug = city ? (CITY_SLUGS[city] || city.toLowerCase().replace(/[^a-z0-9]/g, '-')) : 'romania'
    const action = subcategory === 'cazare' ? 'inchiriere' : 'vanzare'
    const type = subcategory === 'case' ? 'case' : nrCamere === '1' ? 'garsoniere' : 'apartamente'
    const camereLabel = nrCamere === '1' ? 'garsonieră' : nrCamere ? `${nrCamere} camere` : ''
    const titleBase = [camereLabel, city].filter(Boolean).join(' în ')

    const imobP = new URLSearchParams()
    if (nrCamere && nrCamere !== '1') imobP.set('camere', nrCamere === '4+' ? '4' : nrCamere)
    if (maxPrice) imobP.set('pret_max', String(maxPrice))
    if (minPrice) imobP.set('pret_min', String(minPrice))
    results.push({
      id: `direct-imobiliare-${Date.now()}`,
      title: `${titleBase || 'Imobil'} — filtrat ${priceLabel}`,
      price: priceLabel,
      platform: 'Imobiliare.ro',
      platformEmoji: '🏠',
      url: `https://www.imobiliare.ro/${action}-${type}/${citySlug}/` + (imobP.toString() ? '?' + imobP : ''),
      specs: [camereLabel || type, city || 'România', 'Filtrat după preț'].filter(Boolean),
      matchScore: 99,
      aiReason: `Filtru exact aplicat — ${priceLabel}`,
      location: city || 'România',
    })

    results.push({
      id: `direct-storia-${Date.now()}`,
      title: `${titleBase || 'Apartament'} pe Storia — ${priceLabel}`,
      price: priceLabel,
      platform: 'Storia.ro',
      platformEmoji: '🏡',
      url: `https://www.storia.ro/ro/rezultate/${action}/${type === 'case' ? 'casa' : type === 'garsoniere' ? 'garsoniera' : 'apartament'}/${citySlug}`,
      specs: [camereLabel || type, city || 'România', 'Poze HD + tur virtual'].filter(Boolean),
      matchScore: 96,
      aiReason: 'Căutare directă cu filtre aplicate',
      location: city || 'România',
    })
  }

  // Electronice (categoryId 5) sau general
  if (categoryId === 5 || (!categoryId && (filters.telefonBrand || filters.laptopBrand || filters.keyword))) {
    const q = encodeURIComponent([filters.telefonBrand, filters.laptopBrand, filters.keyword, brand, model].filter(Boolean).join(' '))
    const olxP = new URLSearchParams()
    if (q) olxP.set('q', decodeURIComponent(q))
    if (minPrice) olxP.set('search[filter_float_price:from]', String(minPrice))
    if (maxPrice) olxP.set('search[filter_float_price:to]', String(maxPrice))
    results.push({
      id: `direct-olx-el-${Date.now()}`,
      title: `${filters.telefonBrand || filters.laptopBrand || filters.keyword || 'Electronice'} — ${priceLabel}`,
      price: priceLabel,
      platform: 'OLX.ro',
      platformEmoji: '🟠',
      url: `https://www.olx.ro/electronice-electrocasnice/` + (olxP.toString() ? '?' + olxP : ''),
      specs: ['Filtrat după preț', 'Nou și second-hand', 'Toată România'],
      matchScore: 96,
      aiReason: `Filtru ${priceLabel} aplicat pe OLX`,
      location: filters.city || 'România',
    })

    const emagQ = encodeURIComponent([filters.telefonBrand, filters.laptopBrand, filters.keyword].filter(Boolean).join(' '))
    const emagP = new URLSearchParams()
    if (maxPrice) emagP.set('price_filter_max', String(maxPrice))
    if (minPrice) emagP.set('price_filter_min', String(minPrice))
    results.push({
      id: `direct-emag-${Date.now()}`,
      title: `${filters.telefonBrand || filters.laptopBrand || 'Electronice'} pe eMag — ${priceLabel}`,
      price: priceLabel,
      platform: 'eMag.ro',
      platformEmoji: '🛍️',
      url: `https://www.emag.ro/search/${emagQ}` + (emagP.toString() ? '?' + emagP : ''),
      specs: ['Produse noi', 'Garanție oficială', 'Livrare rapidă'],
      matchScore: 94,
      aiReason: 'Produse noi cu garanție la preț filtrat',
      location: 'România',
    })
  }

  // General / Servicii
  if (!categoryId || categoryId === 4) {
    const q = encodeURIComponent(filters.keyword || brand || '')
    const olxP = new URLSearchParams()
    if (q) olxP.set('q', decodeURIComponent(q))
    if (minPrice) olxP.set('search[filter_float_price:from]', String(minPrice))
    if (maxPrice) olxP.set('search[filter_float_price:to]', String(maxPrice))
    results.push({
      id: `direct-olx-gen-${Date.now()}`,
      title: `${filters.keyword || 'Căutare'} — ${priceLabel}`,
      price: priceLabel,
      platform: 'OLX.ro',
      platformEmoji: '🟠',
      url: `https://www.olx.ro/oferte/` + (olxP.toString() ? '?' + olxP : ''),
      specs: ['Filtrat după preț', 'Toată România'],
      matchScore: 95,
      aiReason: `Filtru ${priceLabel} pe OLX`,
      location: filters.city || 'România',
    })
  }

  return results
}

// ── AGENT 1: Google Search via Serper.dev ──
async function searchSerper(
  query: string,
  siteFilter: string,
  page = 1,
): Promise<{ title: string; url: string; snippet: string }[]> {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: `${query} ${siteFilter}`,
        gl: 'ro',
        hl: 'ro',
        num: 10,
        page,
      }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
    })

    if (!res.ok) return []
    const data = await res.json()

    return (data.organic || []).map((item: any) => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.snippet || '',
    }))
  } catch {
    return []
  }
}

// ── AGENT 2: Groq extrage date structurate din rezultatele reale ──
async function enrichWithGroq(
  rawResults: { title: string; url: string; snippet: string }[],
  query: string,
  categoryId: number | null,
  groq: Groq,
): Promise<AIListing[]> {
  if (rawResults.length === 0) return []

  const categoryHint =
    categoryId === 3 ? 'AUTO — extrage an, km, combustibil, cutie viteze' :
    categoryId === 2 ? 'IMOBILIARE — extrage suprafață mp, nr camere, etaj, tip' :
    categoryId === 5 ? 'ELECTRONICE — extrage stocare, RAM, culoare, stare' :
    'GENERAL — extrage specificații relevante'

  const inputText = rawResults.map((r, i) =>
    `[${i}] Titlu: ${r.title}\nURL: ${r.url}\nDescriere: ${r.snippet}`
  ).join('\n\n')

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Ești expert în piața românească. Primești rezultate REALE de căutare Google.
Categorie: ${categoryHint}

Returnează DOAR JSON array cu ${rawResults.length} obiecte:
- "index": numărul [X]
- "title": titlu curat (fără site name, fără "- Autovit" etc la final)
- "price": prețul din titlu/descriere (ex: "8.500 EUR") sau "Preț la cerere"
- "specs": 2-4 specificații cheie extrase din titlu/descriere
- "matchScore": 75-98 cât de relevant e pentru "${query}"
- "aiReason": max 8 cuvinte de ce merită văzut
- "location": orașul dacă apare, altfel ""`,
      },
      { role: 'user', content: inputText },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.1,
    max_tokens: 1500,
  })

  let enriched: any[] = []
  try {
    const raw = (completion.choices[0].message.content || '[]')
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = raw.match(/\[[\s\S]*\]/)
    if (match) enriched = JSON.parse(match[0])
  } catch {}

  return rawResults.map((r, i) => {
    const e = enriched.find((x: any) => x.index === i) || enriched[i] || {}
    const { name, emoji } = getPlatformFromUrl(r.url)
    return {
      id: `${i}-${Date.now()}`,
      title: e.title || r.title,
      price: e.price || 'Preț la cerere',
      platform: name,
      platformEmoji: emoji,
      url: r.url,
      specs: Array.isArray(e.specs) ? e.specs.slice(0, 4) : [],
      matchScore: Math.min(98, Math.max(75, e.matchScore || 82)),
      aiReason: e.aiReason || 'Relevant pentru căutarea ta',
      location: e.location || '',
    }
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { query, filters, batch = 0 } = body as {
      query: string
      filters: any
      batch: number
    }

    if (!query) return Response.json({ error: 'Query required' }, { status: 400 })

    // Verifică dacă există API key
    if (!process.env.SERPER_API_KEY) {
      return Response.json({
        results: [],
        error: 'no_api_key',
        message: 'Lipsește SERPER_API_KEY. Adaugă-l în .env.local sau Vercel Environment Variables.',
      })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })
    const searchQuery = buildSearchQuery(filters, query)
    const hasPrice = !!(filters.minPrice || filters.maxPrice)
    const siteFilter = getSiteList(filters.categoryId, hasPrice)
    const page = batch + 1

    // ── Agent 1: Google Search real ──
    const rawResults = await searchSerper(searchQuery, siteFilter, page)

    if (rawResults.length === 0) {
      return Response.json({
        results: [],
        batch,
        query,
        message: 'Nu am găsit rezultate. Încearcă o căutare diferită.',
      })
    }

    // Linkuri directe cu filtre de preț (puse primele)
    const priceLinks = buildPriceFilteredLinks(filters)

    // ── Agent 2: Groq structurează datele reale (cu fallback direct) ──
    let enriched: AIListing[]
    try {
      enriched = await enrichWithGroq(rawResults, query, filters.categoryId, groq)
    } catch {
      // Groq rate limit sau eroare — returnăm direct rezultatele Serper
      enriched = rawResults.map((r, i) => {
        const { name, emoji } = getPlatformFromUrl(r.url)
        return {
          id: `${i}-${Date.now()}`,
          title: r.title.replace(/\s*[-|]\s*(Autovit|OLX|Imobiliare|Storia|Publi24|eMag|Okazii).*$/i, '').trim(),
          price: r.snippet.match(/[\d\s.,]+\s*(EUR|RON|€|lei)/i)?.[0]?.trim() || 'Preț la cerere',
          platform: name,
          platformEmoji: emoji,
          url: r.url,
          specs: [],
          matchScore: 82,
          aiReason: 'Găsit pe Google',
          location: '',
        }
      })
    }

    // Combină: linkuri cu preț filtrat (primele) + rezultate Serper îmbogățite
    const combined = [...priceLinks, ...enriched].slice(0, 10)
    return Response.json({ results: combined, batch, query, total: combined.length })
  } catch (e: any) {
    console.error('external-search error:', e)
    return Response.json({ error: 'Failed', results: [] }, { status: 500 })
  }
}
