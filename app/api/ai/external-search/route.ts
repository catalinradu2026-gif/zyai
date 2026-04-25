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
  'Mitsubishi': 'mitsubishi', 'Land Rover': 'land-rover',
}

export type ExternalResult = {
  platform: string
  emoji: string
  url: string
  tagline: string
  aiNote: string
}

function buildLinks(filters: {
  categoryId: number | null
  brand: string | null
  model: string | null
  maxPrice: number | null
  minPrice: number | null
  city: string | null
  subcategory: string | null
  nrCamere: string | null
  keyword: string
}): Omit<ExternalResult, 'aiNote'>[] {
  const { categoryId, brand, model, maxPrice, minPrice, city, subcategory, nrCamere, keyword } = filters

  const citySlug = city ? (CITY_SLUGS[city] || city.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, '-')) : ''
  const brandSlug = brand ? (BRAND_SLUGS[brand] || brand.toLowerCase()) : ''
  const modelSlug = model ? model.toLowerCase().replace(/\s+/g, '-') : ''

  const isAuto = categoryId === 3
  const isImobiliare = categoryId === 2

  if (isAuto) {
    const results: Omit<ExternalResult, 'aiNote'>[] = []

    // Autovit.ro
    let autovitUrl = 'https://www.autovit.ro/autoturisme'
    if (brandSlug) autovitUrl += `/${brandSlug}`
    if (modelSlug) autovitUrl += `/${modelSlug.replace(/-/g, '_')}`
    const av = new URLSearchParams()
    if (maxPrice) { av.set('search[filter_float_price:to]', String(maxPrice)); av.set('search[filter_enum_currency]', 'EUR') }
    if (minPrice) av.set('search[filter_float_price:from]', String(minPrice))
    results.push({ platform: 'Autovit.ro', emoji: '🚗', url: autovitUrl + (av.toString() ? '?' + av : ''), tagline: 'Cel mai mare site de mașini din România' })

    // OLX auto
    const olxQ = [brand, model].filter(Boolean).join(' ') || keyword
    const olxParams = new URLSearchParams()
    if (olxQ) olxParams.set('q', olxQ)
    if (maxPrice) olxParams.set('search[filter_float_price:to]', String(maxPrice))
    const olxBase = `https://www.olx.ro/auto-masini-moto-ambarcatiuni/autoturisme/${citySlug ? citySlug + '/' : ''}`
    results.push({ platform: 'OLX.ro', emoji: '🟠', url: olxBase + (olxParams.toString() ? '?' + olxParams : ''), tagline: 'Anunțuri auto de la particulari, fără comision' })

    // AutoUncle
    const uncle = new URLSearchParams()
    if (brand) uncle.set('makes[]', brand)
    if (model) uncle.set('models[]', model)
    if (maxPrice) uncle.set('price_to', String(maxPrice))
    if (minPrice) uncle.set('price_from', String(minPrice))
    results.push({ platform: 'AutoUncle.ro', emoji: '🔍', url: 'https://www.autouncle.ro/ro/masini-second-hand' + (uncle.toString() ? '?' + uncle : ''), tagline: 'Analiză de piață + prețul corect pentru orice mașină' })

    // AutoScout24
    let scout = 'https://www.autoscout24.ro/lst'
    if (brandSlug) scout += `/${brandSlug}`
    if (modelSlug) scout += `/${modelSlug}`
    const scoutP = new URLSearchParams()
    if (maxPrice) scoutP.set('priceto', String(maxPrice))
    if (minPrice) scoutP.set('pricefrom', String(minPrice))
    results.push({ platform: 'AutoScout24.ro', emoji: '🌐', url: scout + (scoutP.toString() ? '?' + scoutP : ''), tagline: 'Platformă europeană — mașini verificate și dealeri autorizați' })

    // Publi24
    results.push({ platform: 'Publi24.ro', emoji: '📋', url: `https://www.publi24.ro/anunturi/auto-moto-barci/masini/${citySlug ? citySlug + '/' : ''}`, tagline: 'Mii de anunțuri auto la prețuri negociabile' })

    return results

  } else if (isImobiliare) {
    const isRent = subcategory === 'cazare'
    const action = isRent ? 'inchiriere' : 'vanzare'
    const results: Omit<ExternalResult, 'aiNote'>[] = []

    const imobSubSlug = subcategory === 'case' ? 'case' :
      subcategory === 'terenuri' ? 'terenuri' :
      nrCamere === '1' ? 'garsoniere' : 'apartamente'

    // Imobiliare.ro
    const imobP = new URLSearchParams()
    if (nrCamere && nrCamere !== '1') imobP.set('camere', nrCamere === '4+' ? '4' : nrCamere)
    if (maxPrice) imobP.set('pret_max', String(maxPrice))
    results.push({ platform: 'Imobiliare.ro', emoji: '🏠', url: `https://www.imobiliare.ro/${action}-${imobSubSlug}/${citySlug || 'romania'}/` + (imobP.toString() ? '?' + imobP : ''), tagline: 'Cel mai mare portal imobiliar — agenții și particulari' })

    // Storia.ro
    const storiaType = imobSubSlug === 'case' ? 'casa' : imobSubSlug === 'garsoniere' ? 'garsoniera' : 'apartament'
    results.push({ platform: 'Storia.ro', emoji: '🏡', url: `https://www.storia.ro/ro/rezultate/${action}/${storiaType}${citySlug ? '/' + citySlug : ''}`, tagline: 'Anunțuri cu poze HD, tur virtual 3D și hărți detaliate' })

    // OLX imobiliare
    const olxType = isRent ? 'inchirieri-apartamente' : imobSubSlug === 'case' ? 'vanzare-case-vile' : 'vanzare-apartamente'
    results.push({ platform: 'OLX.ro Imobiliare', emoji: '🟠', url: `https://www.olx.ro/imobiliare/${olxType}/${citySlug ? citySlug + '/' : ''}`, tagline: 'Anunțuri directe de la proprietari, 0% comision' })

    // Publi24
    const publiType = isRent ? 'inchirieri' : 'vanzare'
    results.push({ platform: 'Publi24.ro', emoji: '📋', url: `https://www.publi24.ro/anunturi/imobiliare/${publiType}/apartamente/${citySlug ? citySlug + '/' : ''}`, tagline: 'Negociere directă cu proprietarul' })

    // Anuntul.ro
    results.push({ platform: 'Anuntul.ro', emoji: '📰', url: `https://www.anuntul.ro/imobiliare/${citySlug || ''}`, tagline: 'Portal clasic cu mii de anunțuri imobiliare din toată țara' })

    return results

  } else {
    // Generic search — OLX + alte platforme generale
    const q = encodeURIComponent(keyword || '')
    return [
      { platform: 'OLX.ro', emoji: '🟠', url: `https://www.olx.ro/oferte/?q=${q}`, tagline: 'Cel mai popular marketplace din România' },
      { platform: 'Publi24.ro', emoji: '📋', url: `https://www.publi24.ro/cauta/?cauta=${q}`, tagline: 'Milioane de anunțuri la prețuri mici' },
      { platform: 'Okazii.ro', emoji: '🛒', url: `https://www.okazii.ro/cautare.html?searchFor=${q}`, tagline: 'Licitații online și produse la preț fix' },
      { platform: 'eMag.ro', emoji: '🛍️', url: `https://www.emag.ro/search/${keyword || ''}`, tagline: 'Cel mai mare retailer online din România' },
      { platform: 'Elefant.ro', emoji: '🐘', url: `https://www.elefant.ro/search#k=${q}`, tagline: 'Produse noi la prețuri competitive' },
    ]
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { query, filters } = body as {
      query: string
      filters: {
        categoryId: number | null
        brand: string | null
        model: string | null
        maxPrice: number | null
        minPrice: number | null
        city: string | null
        subcategory: string | null
        nrCamere: string | null
        keyword: string
      }
    }

    if (!query) return Response.json({ error: 'Query required' }, { status: 400 })

    const links = buildLinks(filters)

    // Groq generează un scurt sfat AI pentru fiecare platformă (în paralel)
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

    const platformList = links.map(l => l.platform).join(', ')
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Ești asistentul AI al zyAI.ro. Generează câte un sfat scurt (max 12 cuvinte) pentru fiecare platformă listată, specific pentru căutarea "${query}". Returnează DOAR JSON array cu exact ${links.length} stringuri, în ordinea platformelor.`,
        },
        {
          role: 'user',
          content: `Platforme: ${platformList}\nCăutare: "${query}"\nGenerează ${links.length} sfaturi scurte și utile în română.`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 300,
    })

    let aiNotes: string[] = []
    try {
      const raw = (completion.choices[0].message.content || '[]')
        .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) aiNotes = JSON.parse(match[0])
    } catch {}

    const results: ExternalResult[] = links.map((link, i) => ({
      ...link,
      aiNote: aiNotes[i] || 'Explorează anunțurile disponibile.',
    }))

    return Response.json({ results, query })
  } catch (e: any) {
    console.error('external-search error:', e)
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
