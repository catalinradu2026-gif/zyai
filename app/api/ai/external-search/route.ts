import Groq from 'groq-sdk'

export const runtime = 'nodejs'

const CITY_SLUGS: Record<string, string> = {
  'București': 'bucuresti', 'Craiova': 'craiova', 'Cluj-Napoca': 'cluj-napoca',
  'Timișoara': 'timisoara', 'Iași': 'iasi', 'Brașov': 'brasov',
  'Constanța': 'constanta', 'Galați': 'galati', 'Ploiești': 'ploiesti',
  'Oradea': 'oradea', 'Sibiu': 'sibiu', 'Bacău': 'bacau', 'Arad': 'arad',
  'Pitești': 'pitesti', 'Brăila': 'braila', 'Târgu Mureș': 'targu-mures',
}

const BRAND_SLUGS: Record<string, string> = {
  'BMW': 'bmw', 'Audi': 'audi', 'Dacia': 'dacia', 'Volkswagen': 'volkswagen',
  'Mercedes': 'mercedes-benz', 'Ford': 'ford', 'Toyota': 'toyota', 'Opel': 'opel',
  'Renault': 'renault', 'Skoda': 'skoda', 'Seat': 'seat', 'Hyundai': 'hyundai',
  'Kia': 'kia', 'Peugeot': 'peugeot', 'Fiat': 'fiat', 'Nissan': 'nissan',
  'Honda': 'honda', 'Mazda': 'mazda', 'Volvo': 'volvo', 'Jeep': 'jeep',
  'Porsche': 'porsche', 'Subaru': 'subaru', 'Tesla': 'tesla', 'Citroen': 'citroen',
}

export type AIListing = {
  id: string
  title: string
  price: string
  platform: string
  platformEmoji: string
  platformUrl: string
  specs: string[]
  matchScore: number
  aiReason: string
  location: string
}

function buildPlatformUrl(platform: string, filters: any, listing: any): string {
  const { brand, model, maxPrice, minPrice, city, categoryId, subcategory, nrCamere } = filters
  const citySlug = city ? (CITY_SLUGS[city] || city.toLowerCase().replace(/\s+/g, '-')) : ''
  const brandSlug = brand ? (BRAND_SLUGS[brand] || brand.toLowerCase()) : ''
  const modelSlug = model ? model.toLowerCase().replace(/\s+/g, '-') : ''

  const isAuto = categoryId === 3
  const isImobiliare = categoryId === 2

  if (platform === 'Autovit.ro' && isAuto) {
    let url = 'https://www.autovit.ro/autoturisme'
    if (brandSlug) url += `/${brandSlug}`
    if (modelSlug) url += `/${modelSlug.replace(/-/g, '_')}`
    const p = new URLSearchParams()
    if (maxPrice) { p.set('search[filter_float_price:to]', String(maxPrice)); p.set('search[filter_enum_currency]', 'EUR') }
    if (listing.year) p.set('search[filter_float_year:from]', String(listing.year - 2))
    return url + (p.toString() ? '?' + p : '')
  }
  if (platform === 'OLX.ro' && isAuto) {
    const q = [brand, model].filter(Boolean).join(' ') || filters.keyword
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (maxPrice) p.set('search[filter_float_price:to]', String(maxPrice))
    return `https://www.olx.ro/auto-masini-moto-ambarcatiuni/autoturisme/${citySlug ? citySlug + '/' : ''}` + (p.toString() ? '?' + p : '')
  }
  if (platform === 'AutoScout24' && isAuto) {
    let url = 'https://www.autoscout24.ro/lst'
    if (brandSlug) url += `/${brandSlug}`
    const p = new URLSearchParams()
    if (maxPrice) p.set('priceto', String(maxPrice))
    return url + (p.toString() ? '?' + p : '')
  }
  if (platform === 'AutoUncle.ro' && isAuto) {
    const p = new URLSearchParams()
    if (brand) p.set('makes[]', brand)
    if (model) p.set('models[]', model)
    if (maxPrice) p.set('price_to', String(maxPrice))
    return 'https://www.autouncle.ro/ro/masini-second-hand' + (p.toString() ? '?' + p : '')
  }
  if (platform === 'Publi24.ro' && isAuto) {
    return `https://www.publi24.ro/anunturi/auto-moto-barci/masini/${citySlug ? citySlug + '/' : ''}`
  }
  if (platform === 'Imobiliare.ro' && isImobiliare) {
    const action = subcategory === 'cazare' ? 'inchiriere' : 'vanzare'
    const type = subcategory === 'case' ? 'case' : nrCamere === '1' ? 'garsoniere' : 'apartamente'
    const p = new URLSearchParams()
    if (nrCamere && nrCamere !== '1') p.set('camere', nrCamere === '4+' ? '4' : nrCamere)
    if (maxPrice) p.set('pret_max', String(maxPrice))
    return `https://www.imobiliare.ro/${action}-${type}/${citySlug || 'romania'}/` + (p.toString() ? '?' + p : '')
  }
  if (platform === 'Storia.ro' && isImobiliare) {
    const action = subcategory === 'cazare' ? 'inchiriere' : 'vanzare'
    const type = subcategory === 'case' ? 'casa' : nrCamere === '1' ? 'garsoniera' : 'apartament'
    return `https://www.storia.ro/ro/rezultate/${action}/${type}${citySlug ? '/' + citySlug : ''}`
  }
  if (platform === 'OLX.ro' && isImobiliare) {
    const isRent = subcategory === 'cazare'
    const type = isRent ? 'inchirieri-apartamente' : subcategory === 'case' ? 'vanzare-case-vile' : 'vanzare-apartamente'
    return `https://www.olx.ro/imobiliare/${type}/${citySlug ? citySlug + '/' : ''}`
  }
  // Generic fallback
  const q = encodeURIComponent(filters.keyword || '')
  const genericPlatforms: Record<string, string> = {
    'OLX.ro': `https://www.olx.ro/oferte/?q=${q}`,
    'Publi24.ro': `https://www.publi24.ro/cauta/?cauta=${q}`,
    'Okazii.ro': `https://www.okazii.ro/cautare.html?searchFor=${q}`,
    'eMag.ro': `https://www.emag.ro/search/${q}`,
  }
  return genericPlatforms[platform] || `https://www.olx.ro/oferte/?q=${q}`
}

function getPlatformEmoji(platform: string): string {
  const map: Record<string, string> = {
    'Autovit.ro': '🚗', 'OLX.ro': '🟠', 'AutoScout24': '🌐',
    'AutoUncle.ro': '🔍', 'Publi24.ro': '📋', 'Imobiliare.ro': '🏠',
    'Storia.ro': '🏡', 'Okazii.ro': '🛒', 'eMag.ro': '🛍️',
  }
  return map[platform] || '🔗'
}

function getSystemPrompt(filters: any, query: string, batch: number): string {
  const isAuto = filters.categoryId === 3
  const isImobiliare = filters.categoryId === 2
  const batchNote = batch > 0 ? `Acesta este batch-ul ${batch + 1} — generează ALTE 10 rezultate DIFERITE față de cele anterioare, cu alte prețuri și specificații.` : ''

  const isElectronice = filters.categoryId === 5
  const autoPlatforms = ['Autovit.ro', 'OLX.ro', 'AutoScout24', 'AutoUncle.ro', 'Publi24.ro']
  const imobPlatforms = ['Imobiliare.ro', 'Storia.ro', 'OLX.ro', 'Publi24.ro', 'Anuntul.ro']
  const electronicePlatforms = ['OLX.ro', 'eMag.ro', 'Okazii.ro', 'Publi24.ro', 'eMag.ro']
  const genericPlatforms = ['OLX.ro', 'Publi24.ro', 'Okazii.ro', 'eMag.ro', 'Okazii.ro']

  const platforms = isAuto ? autoPlatforms : isImobiliare ? imobPlatforms : isElectronice ? electronicePlatforms : genericPlatforms

  const baseInstructions = `Ești un agent AI expert în piața românească. ${batchNote}

Generează exact 10 rezultate REALISTE de anunțuri românești pentru căutarea: "${query}".
Bazează-te pe cunoștințele tale despre prețurile reale din România în 2024-2025.

Returnează DOAR un JSON array cu exact 10 obiecte, fiecare cu:
- "title": titlul anunțului (specific, cu detalii reale)
- "price": prețul realist (ex: "8.500 EUR" sau "185.000 RON")
- "platform": una din: ${platforms.join(', ')}
- "specs": array de 2-4 specificații cheie (ex: ["2019", "150.000 km", "Diesel", "Automată"])
- "matchScore": scor 70-99 (cât de bine se potrivește cu cerința)
- "aiReason": motiv scurt (max 10 cuvinte) de ce e o alegere bună
- "location": orașul (din România)
- "year": anul (număr, doar dacă e relevant)`

  if (isAuto) {
    const brand = filters.brand || ''
    const model = filters.model || ''
    const maxPrice = filters.maxPrice ? `sub ${filters.maxPrice} EUR` : ''
    return `${baseInstructions}

Tipul de căutare: MAȘINI
${brand ? `Marcă: ${brand}` : ''}
${model ? `Model: ${model}` : ''}
${maxPrice ? `Buget: ${maxPrice}` : ''}
${filters.city ? `Oraș: ${filters.city}` : ''}

Specs pentru mașini: an fabricație, km, combustibil, cutie viteze, putere motor.
Prețuri realiste pentru piața românească 2024. Variază platformele uniform între cele 5.`
  }

  if (isImobiliare) {
    return `${baseInstructions}

Tipul de căutare: IMOBILIARE
${filters.nrCamere ? `Camere: ${filters.nrCamere}` : ''}
${filters.subcategory ? `Tip: ${filters.subcategory}` : ''}
${filters.maxPrice ? `Buget max: ${filters.maxPrice}` : ''}
${filters.city ? `Oraș: ${filters.city}` : ''}

Specs pentru imobiliare: suprafață mp, etaj, an construcție, dotări cheie.
Prețuri realiste pentru piața imobiliară românească 2024-2025. Variază platformele.`
  }

  if (isElectronice) {
    const phoneBrand = filters.telefonBrand || ''
    const laptopBrand = filters.laptopBrand || ''
    return `${baseInstructions}

Tipul de căutare: ELECTRONICE & TELEFOANE
${phoneBrand ? `Brand telefon: ${phoneBrand}` : ''}
${laptopBrand ? `Brand laptop: ${laptopBrand}` : ''}
${filters.subcategory ? `Subcategorie: ${filters.subcategory}` : ''}
${filters.maxPrice ? `Buget max: ${filters.maxPrice} RON` : ''}
${filters.city ? `Oraș: ${filters.city}` : ''}

Specs pentru telefoane: stocare, RAM, culoare, stare (nou/folosit).
Specs pentru laptopuri: procesor, RAM, SSD, display, stare.
Prețuri realiste pentru piața electronică românească 2024-2025 (RON și EUR). Variază platformele.`
  }

  return `${baseInstructions}

Tipul de căutare: GENERAL
Prețuri realiste pentru piața românească. Produse second-hand și noi. Variază platformele: OLX, Publi24, Okazii, eMag.`
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

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: getSystemPrompt(filters, query, batch) },
        { role: 'user', content: `Generează 10 rezultate pentru: "${query}"${batch > 0 ? ` (batch ${batch + 1}, rezultate noi diferite)` : ''}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4 + batch * 0.15,
      max_tokens: 2000,
      seed: batch * 137,
    })

    const raw = (completion.choices[0].message.content || '[]')
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let aiListings: any[] = []
    try {
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) aiListings = JSON.parse(match[0])
    } catch {
      aiListings = []
    }

    const results: AIListing[] = aiListings.slice(0, 10).map((item: any, i: number) => ({
      id: `${batch}-${i}-${Date.now()}`,
      title: item.title || 'Anunț',
      price: item.price || 'Preț la cerere',
      platform: item.platform || 'OLX.ro',
      platformEmoji: getPlatformEmoji(item.platform || 'OLX.ro'),
      platformUrl: buildPlatformUrl(item.platform || 'OLX.ro', filters, item),
      specs: Array.isArray(item.specs) ? item.specs.slice(0, 4) : [],
      matchScore: Math.min(99, Math.max(70, item.matchScore || 85)),
      aiReason: item.aiReason || 'Potrivit pentru cerința ta',
      location: item.location || filters.city || 'România',
    }))

    return Response.json({ results, batch, query })
  } catch (e: any) {
    console.error('external-search error:', e)
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
