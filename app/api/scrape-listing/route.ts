import { NextRequest, NextResponse } from 'next/server'

// ─── Category detection ────────────────────────────────────────────────────

function detectCategoryFromUrl(url: string) {
  const u = url.toLowerCase()
  if (u.includes('autovit') || u.includes('/auto/') || u.includes('/autoturisme') || u.includes('/masini')) return { category: 'auto', categoryId: 3 }
  if (u.includes('storia.ro') || u.includes('imobiliare.ro') || u.includes('/imobiliare') || u.includes('/apartament') || u.includes('/casa') || u.includes('/teren')) return { category: 'imobiliare', categoryId: 2 }
  if (u.includes('/electronice') || u.includes('/telefoane') || u.includes('/laptopuri') || u.includes('emag') || u.includes('altex')) return { category: 'electronice', categoryId: 5 }
  if (u.includes('/joburi') || u.includes('/locuri-de-munca') || u.includes('ejobs') || u.includes('bestjobs') || u.includes('hipo')) return { category: 'joburi', categoryId: 1 }
  if (u.includes('/moda') || u.includes('/haine') || u.includes('/incaltaminte')) return { category: 'moda', categoryId: 6 }
  if (u.includes('/animale') || u.includes('/caini') || u.includes('/pisici')) return { category: 'animale', categoryId: 9 }
  if (u.includes('/sport') || u.includes('/biciclete') || u.includes('/fitness')) return { category: 'sport', categoryId: 8 }
  if (u.includes('/casa-gradina') || u.includes('/mobilier') || u.includes('/electrocasnice')) return { category: 'casa-gradina', categoryId: 7 }
  if (u.includes('/mama') || u.includes('/copii') || u.includes('/jucarii')) return { category: 'mama-copilul', categoryId: 10 }
  if (u.includes('/servicii')) return { category: 'servicii', categoryId: 4 }
  return null
}

function detectCategoryFromContent(title: string, description: string) {
  const t = (title + ' ' + description).toLowerCase()
  // Auto
  if (/\b(vw|bmw|audi|dacia|opel|ford|toyota|mercedes|skoda|renault|honda|volkswagen|hyundai|kia|seat|fiat|peugeot|mazda|volvo|nissan|suzuki|mitsubishi|jeep|porsche|tesla|mini cooper|subaru|lexus|alfa romeo|citroen|chevrolet)\b/.test(t)) return { category: 'auto', categoryId: 3 }
  if (/\b(apartament|garsoniera|vila|casa\s|teren\s|spatiu comercial|birou|imobil|suprafata|etaj|camere|dormitor|living)\b/.test(t)) return { category: 'imobiliare', categoryId: 2 }
  if (/\b(iphone|samsung|laptop|telefon mobil|pc|tableta|monitor|playstation|xbox|camera foto|smartwatch|tv\s|televizor)\b/.test(t)) return { category: 'electronice', categoryId: 5 }
  if (/\b(angajam|angajare|job|salariu|program lucru|experienta|cv|candidat|post vacant)\b/.test(t)) return { category: 'joburi', categoryId: 1 }
  if (/\b(rochie|pantofi|geanta|haina|tricou|jacheta|palton|blugi|adidasi|marime)\b/.test(t)) return { category: 'moda', categoryId: 6 }
  if (/\b(caine|pisica|papagal|acvariu|hamster|iepure|rasa|vaccin|pasaport animal)\b/.test(t)) return { category: 'animale', categoryId: 9 }
  if (/\b(bicicleta|fitness|trotineta|ski|snowboard|gantere|sala de sport)\b/.test(t)) return { category: 'sport', categoryId: 8 }
  if (/\b(canapea|masa|scaun|dulap|frigider|masina de spalat|aragaz|mobilier)\b/.test(t)) return { category: 'casa-gradina', categoryId: 7 }
  return { category: 'auto', categoryId: 3 } // fallback
}

// ─── Auto metadata ─────────────────────────────────────────────────────────

function extractAutoMeta(title: string, description: string, rawParams: Record<string, string>) {
  const t = (title + ' ' + description).toLowerCase()
  const meta: Record<string, string> = {}

  // From raw params (OLX, AutoVit)
  const paramMap: Record<string, string> = {
    brand: 'brand', make: 'brand', 'marca': 'brand',
    model: 'model',
    year: 'year', fabrication_year: 'year', 'an fabricatie': 'year', 'an': 'year',
    mileage: 'mileage', milage: 'mileage', 'rulaj': 'mileage', 'km': 'mileage',
    fuel_type: 'fuelType', combustibil: 'fuelType', 'tip combustibil': 'fuelType',
    gearbox: 'gearbox', transmission: 'gearbox', 'cutie de viteze': 'gearbox',
    engine_power: 'power', 'putere motor': 'power', 'putere': 'power',
    'capacitate cilindrica': 'engineSize', 'capacitate motor': 'engineSize',
    'culoare': 'color', 'numar usi': 'doors', 'caroserie': 'bodyType',
    'norma de poluare': 'emissionStandard', 'euro': 'emissionStandard',
  }
  for (const [k, v] of Object.entries(rawParams)) {
    const kl = k.toLowerCase()
    if (paramMap[kl]) meta[paramMap[kl]] = v
    else {
      // partial match
      for (const [pk, pm] of Object.entries(paramMap)) {
        if (kl.includes(pk) && !meta[pm]) { meta[pm] = v; break }
      }
    }
  }

  // Fallback from title/description
  if (!meta.brand) {
    const brands = ['Volkswagen','VW','Skoda','Opel','Audi','BMW','Mercedes-Benz','Mercedes','Renault','Dacia','Mini','Ford','Peugeot','Seat','Fiat','Toyota','Hyundai','Kia','Subaru','Volvo','Mazda','Honda','Nissan','Suzuki','Mitsubishi','Jeep','Porsche','Tesla','Alfa Romeo','Citroën','Citroen','Chevrolet','Chrysler','Dodge','Lexus','Infiniti','Lamborghini','Ferrari','Bentley','Rolls-Royce','Maserati','Land Rover','Jaguar','Range Rover']
    for (const b of brands) { if (t.includes(b.toLowerCase())) { meta.brand = b; break } }
  }
  if (!meta.year) { const m = title.match(/\b(19[89]\d|20[012]\d)\b/); if (m) meta.year = m[0] }
  if (!meta.fuelType) {
    if (/\b(diesel|motorina|tdi|cdi|cdti|dci|hdi|d5|2\.0d)\b/.test(t)) meta.fuelType = 'Diesel'
    else if (/\b(benzina|benzin|tsi|gsi|mpi|tfsi|turbo benzina)\b/.test(t)) meta.fuelType = 'Benzina'
    else if (/\b(hybrid|hibrid|phev|hev)\b/.test(t)) meta.fuelType = 'Hibrid'
    else if (/\b(electric|ev|kwh|kwh)\b/.test(t)) meta.fuelType = 'Electric'
    else if (/\b(gpl|gaz|lpg|cng)\b/.test(t)) meta.fuelType = 'GPL'
  }
  if (!meta.gearbox) {
    if (/\b(automat|automata|automatic|dsg|cvt|pdk|s-tronic)\b/.test(t)) meta.gearbox = 'Automata'
    else if (/\b(manual|manuala|cutie manuala)\b/.test(t)) meta.gearbox = 'Manuala'
  }
  if (!meta.mileage) { const m = title.match(/(\d[\d\.]{2,8})\s*km/i); if (m) meta.mileage = m[1].replace(/\./g, '') }

  return meta
}

// ─── Imobiliare metadata ──────────────────────────────────────────────────

function extractImobMeta(title: string, description: string, rawParams: Record<string, string>) {
  const t = (title + ' ' + description).toLowerCase()
  const meta: Record<string, string> = {}

  const paramMap: Record<string, string> = {
    'tip tranzactie': 'tipTranzactie', 'tranzactie': 'tipTranzactie',
    'nr camere': 'nrCamere', 'camere': 'nrCamere', 'numar camere': 'nrCamere',
    'suprafata': 'suprafata', 'suprafata utila': 'suprafata', 'suprafata totala': 'suprafata',
    'etaj': 'etaj', 'nr etaje': 'etaj',
    'an constructie': 'anConstructie', 'an construire': 'anConstructie',
    'compartimentare': 'compartimentare',
    'tip imobil': 'tipImobil',
  }
  for (const [k, v] of Object.entries(rawParams)) {
    const kl = k.toLowerCase()
    for (const [pk, pm] of Object.entries(paramMap)) {
      if (kl.includes(pk) && !meta[pm]) { meta[pm] = v; break }
    }
  }

  if (!meta.tipTranzactie) {
    if (/\b(vanzare|vand|de vanzare|vanzari)\b/.test(t)) meta.tipTranzactie = 'Vanzare'
    else if (/\b(inchiriere|inchiriez|de inchiriat|chirie)\b/.test(t)) meta.tipTranzactie = 'Inchiriere'
  }
  if (!meta.nrCamere) {
    const m = t.match(/(\d+)\s*(?:camere|cam\.?)/)
    if (m) meta.nrCamere = m[1]
    else if (t.includes('garsoniera') || t.includes('garsonieră')) meta.nrCamere = '1'
  }
  if (!meta.suprafata) {
    const m = title.match(/(\d+)\s*mp/) || description.match(/(\d+)\s*(?:mp|m²|metri patrati)/i)
    if (m) meta.suprafata = m[1]
  }

  return meta
}

// ─── Generic metadata by category ────────────────────────────────────────

function extractMetaByCategory(category: string, title: string, description: string, rawParams: Record<string, string>) {
  if (category === 'auto') return extractAutoMeta(title, description, rawParams)
  if (category === 'imobiliare') return extractImobMeta(title, description, rawParams)

  // Generic: return whatever params we have
  const meta: Record<string, string> = {}
  for (const [k, v] of Object.entries(rawParams)) {
    if (k && v && k.length < 40 && v.length < 100) meta[k] = v
  }
  return meta
}

// ─── HTML helpers ─────────────────────────────────────────────────────────

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractNextData(html: string) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

// ─── Platform scrapers ────────────────────────────────────────────────────

async function fetchPage(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

async function scrapeOLX(url: string) {
  const html = await fetchPage(url)

  // OLX removed __NEXT_DATA__ — parse using og: tags + regex

  // Title: og:title, strip " • OLX.ro" suffix
  const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || ''
  const titleRaw = ogTitle.replace(/\s*[•·]\s*OLX\.ro\s*$/i, '').trim()

  // City: last segment before " • " in og:title e.g. "VW Golf ... Craiova • OLX.ro"
  const cityMatch = ogTitle.match(/[•·]\s*([A-ZĂÂÎȘȚ][a-zăâîșțA-ZĂÂÎȘȚ\s\-]+?)\s*[•·]\s*OLX/i)
  const city = cityMatch ? cityMatch[1].trim() : ''

  // Title without city suffix
  const title = city ? titleRaw.replace(new RegExp('\\s+' + city + '\\s*$', 'i'), '').trim() : titleRaw

  // Description: try JSON "description":"..." pattern in HTML
  let description = ''
  const descJsonMatch = html.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  if (descJsonMatch) {
    try { description = JSON.parse('"' + descJsonMatch[1] + '"') } catch { description = descJsonMatch[1].replace(/\\n/g, '\n') }
  }
  if (!description) description = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] || ''

  // Price + currency
  let price: number | null = null
  let currency = 'EUR'
  const priceEur = html.match(/(\d[\d\s]{1,8})\s*(?:EUR|€)/i)
  const priceRon = html.match(/(\d[\d\s]{1,8})\s*(?:RON|lei)/i)
  if (priceEur) { price = parseInt(priceEur[1].replace(/\s/g, '')); currency = 'EUR' }
  else if (priceRon) { price = parseInt(priceRon[1].replace(/\s/g, '')); currency = 'RON' }

  // Photos: collect apollo.olxcdn.com URLs from HTML (deduplicated)
  const photos: string[] = []
  const cdnPattern = /https:\/\/[a-z]+\.apollo\.olxcdn\.com\/v1\/files\/[a-zA-Z0-9\-]+[^"'\s]*/g
  const cdnMatches = html.matchAll(cdnPattern)
  const seen = new Set<string>()
  for (const m of cdnMatches) {
    // Normalize — strip size suffix and use a consistent size
    const base = m[0].split(';')[0].split('?')[0]
    if (!seen.has(base)) {
      seen.add(base)
      photos.push(base + ';s=800x600')
    }
  }
  // Fallback: og:image
  if (photos.length === 0) {
    const ogImg = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]
    if (ogImg) photos.push(ogImg)
  }

  // Params: OLX embeds params as JSON like {"key":"brand","value":{"label":"VW"}}
  const rawParams: Record<string, string> = {}
  const paramPattern = /"key"\s*:\s*"([^"]+)"[^}]*"value"\s*:\s*\{[^}]*"label"\s*:\s*"([^"]+)"/g
  for (const m of html.matchAll(paramPattern)) {
    rawParams[m[1]] = m[2]
  }
  // Also try {"name":"...","value":"..."} pattern
  const paramPattern2 = /"name"\s*:\s*"([^"]+)"[^}]*"value"\s*:\s*"([^"]+)"/g
  for (const m of html.matchAll(paramPattern2)) {
    if (!rawParams[m[1]]) rawParams[m[1]] = m[2]
  }

  if (!title) return scrapeGeneric(url, html)

  const catFromUrl = detectCategoryFromUrl(url)
  const catFromContent = detectCategoryFromContent(title, description)
  const { category, categoryId } = catFromUrl || catFromContent

  const metadata = extractMetaByCategory(category, title, description, rawParams)

  return { title, description: description.substring(0, 1000), price, currency, city, photos: photos.slice(0, 8), metadata, category, categoryId, sourceUrl: url, platform: 'OLX' }
}

async function scrapeStoria(url: string) {
  const html = await fetchPage(url)
  const nd = extractNextData(html)

  const ad = nd?.props?.pageProps?.ad || nd?.props?.pageProps?.advert || nd?.props?.pageProps?.data

  const title = ad?.title || html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || ''
  const description = ad?.description || html.match(/<meta name="description" content="([^"]+)"/)?.[1] || ''
  const price = ad?.price?.value || ad?.totalPrice?.value || null
  const currency = ad?.price?.currency || 'EUR'
  const city = ad?.location?.cityName || ad?.location?.name || ''

  const photos: string[] = []
  if (ad?.images) {
    for (const img of ad.images) {
      const src = img.large || img.medium || img.url || ''
      if (src) photos.push(src)
    }
  }
  if (photos.length === 0) {
    const matches = html.matchAll(/https:\/\/[^"'\s]*(?:storia|imobiliare)[^"'\s]*(?:large|800|600)[^"'\s]*/g)
    for (const m of matches) { if (!photos.includes(m[0])) photos.push(m[0]) }
  }

  const rawParams: Record<string, string> = {}
  if (ad?.characteristics) {
    for (const c of ad.characteristics) rawParams[c.label || c.key || ''] = c.value || ''
  }

  const metadata = extractImobMeta(title, description, rawParams)
  return { title, description: description.substring(0, 1000), price, currency, city, photos: photos.slice(0, 8), metadata, category: 'imobiliare', categoryId: 2, sourceUrl: url, platform: 'Storia/Imobiliare' }
}

async function scrapeAutoVit(url: string) {
  const html = await fetchPage(url)
  const nd = extractNextData(html)

  const ad = nd?.props?.pageProps?.advert || nd?.props?.pageProps?.ad || nd?.props?.pageProps?.data?.advert

  const title = ad?.title || html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || ''
  const description = ad?.description || ''
  const price = ad?.price?.amount || null
  const currency = 'EUR'
  const city = ad?.location?.city?.name || ad?.seller?.address?.city?.name || ''

  const photos: string[] = []
  if (ad?.photos) {
    for (const p of ad.photos) {
      const src = p.url?.replace('{width}', '800') || p.large || p.medium || ''
      if (src) photos.push(src)
    }
  }
  if (photos.length === 0) {
    const matches = html.matchAll(/https:\/\/[^"'\s]*autovit[^"'\s]*(?:800|large|big|medium)[^"'\s]*/g)
    for (const m of matches) { if (!photos.includes(m[0])) photos.push(m[0]) }
  }

  const rawParams: Record<string, string> = {}
  if (ad?.params) {
    for (const p of ad.params) rawParams[p.key || ''] = p.value?.label || p.displayValue || ''
  }
  if (ad?.parameters) {
    for (const [k, v] of Object.entries(ad.parameters as any)) rawParams[k] = String(v)
  }

  const metadata = extractAutoMeta(title, description, rawParams)
  return { title, description: description.substring(0, 1000), price, currency, city, photos: photos.slice(0, 8), metadata, category: 'auto', categoryId: 3, sourceUrl: url, platform: 'AutoVit' }
}

async function scrapeGeneric(url: string, html?: string) {
  if (!html) html = await fetchPage(url)

  // Try __NEXT_DATA__ first
  const nd = extractNextData(html)
  const ad = nd?.props?.pageProps?.ad || nd?.props?.pageProps?.data?.ad || nd?.props?.pageProps?.advert

  const title = ad?.title
    || html.match(/<meta property="og:title" content="([^"]+)"/)?.[1]?.split(/[•|–]/)[0].trim()
    || html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim()
    || html.match(/<title>([^<]+)<\/title>/)?.[1]?.split(/[•|–|]/)[0].trim()
    || ''

  const description = ad?.description
    || html.match(/<meta property="og:description" content="([^"]+)"/)?.[1]
    || html.match(/<meta name="description" content="([^"]+)"/)?.[1]
    || ''

  // Price — multiple patterns
  let price: number | null = null
  let currency = 'EUR'
  const pricePatterns = [
    /["']price["']\s*:\s*(\d+)/,
    /(\d[\d\s\.]{2,10})\s*€/,
    /(\d[\d\s\.]{2,10})\s*EUR/i,
    /(\d[\d\s\.]{2,10})\s*(?:RON|lei)/i,
  ]
  for (const pat of pricePatterns) {
    const m = html.match(pat)
    if (m) {
      price = parseInt(m[1].replace(/[\s\.]/g, ''))
      if (pat.source.includes('RON') || pat.source.includes('lei')) currency = 'RON'
      if (price > 0 && price < 10000000) break
      else price = null
    }
  }

  // Photos
  const photos: string[] = []
  const ogImgs = html.matchAll(/<meta property="og:image(?::[^"]*)?"\s*content="([^"]+)"/g)
  for (const m of ogImgs) { if (!photos.includes(m[1]) && m[1].startsWith('http')) photos.push(m[1]) }

  if (photos.length === 0) {
    // Try structured data
    const ldMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
    for (const m of ldMatches) {
      try {
        const ld = JSON.parse(m[1])
        const img = ld.image || ld.photo
        if (typeof img === 'string' && img.startsWith('http')) photos.push(img)
        else if (Array.isArray(img)) photos.push(...img.filter((i: string) => typeof i === 'string' && i.startsWith('http')))
      } catch { /* skip */ }
    }
  }

  // City
  const cityMatch = html.match(/"cityName"\s*:\s*"([^"]+)"/)
    || html.match(/"city"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/)
    || html.match(/Localitate[^:]*:\s*([A-ZĂÂÎȘȚ][a-zăâîșț\-]+)/)
  const city = cityMatch ? cityMatch[1] : ''

  const catFromUrl = detectCategoryFromUrl(url)
  const catFromContent = detectCategoryFromContent(title, description)
  const { category, categoryId } = catFromUrl || catFromContent

  const metadata = extractMetaByCategory(category, title, description, {})

  // Detect platform name from hostname
  let platform = 'Altă platformă'
  try { platform = new URL(url).hostname.replace('www.', '') } catch { /* */ }

  return { title, description: description.substring(0, 1000), price, currency, city, photos: photos.slice(0, 8), metadata, category, categoryId, sourceUrl: url, platform }
}

// ─── Route handler ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') return NextResponse.json({ error: 'URL lipsă' }, { status: 400 })

    let data
    if (url.includes('olx.ro')) data = await scrapeOLX(url)
    else if (url.includes('autovit.ro')) data = await scrapeAutoVit(url)
    else if (url.includes('storia.ro') || url.includes('imobiliare.ro')) data = await scrapeStoria(url)
    else data = await scrapeGeneric(url)

    if (!data.title) return NextResponse.json({ error: 'Nu am putut citi datele anunțului. Încearcă un alt link.' }, { status: 422 })

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Eroare la citirea anunțului' }, { status: 500 })
  }
}
