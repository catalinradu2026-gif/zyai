import { NextRequest, NextResponse } from 'next/server'

const CATEGORY_MAP: Record<string, { category: string; categoryId: number }> = {
  auto: { category: 'auto', categoryId: 3 },
  autoturisme: { category: 'auto', categoryId: 3 },
  'autoutilitare-vehicule-comerciale': { category: 'auto', categoryId: 3 },
  imobiliare: { category: 'imobiliare', categoryId: 2 },
  apartamente: { category: 'imobiliare', categoryId: 2 },
  case: { category: 'imobiliare', categoryId: 2 },
  electronice: { category: 'electronice', categoryId: 5 },
  telefoane: { category: 'electronice', categoryId: 5 },
  joburi: { category: 'joburi', categoryId: 1 },
  moda: { category: 'moda', categoryId: 6 },
  haine: { category: 'moda', categoryId: 6 },
  sport: { category: 'sport', categoryId: 8 },
  animale: { category: 'animale', categoryId: 9 },
}

function detectCategory(url: string, data: any) {
  const u = url.toLowerCase()
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (u.includes(key)) return val
  }
  const title = (data.title || '').toLowerCase()
  if (/\b(vw|bmw|audi|dacia|opel|ford|toyota|mercedes|skoda|renault|honda|volkswagen|hyundai|kia|seat|fiat|peugeot|mazda|volvo|nissan|suzuki|mitsubishi|jeep|land rover|porsche|ferrari|lamborghini|maserati|bentley|rolls|alfa romeo|lancia|chrysler|dodge|tesla|mini cooper|subaru|lexus)\b/.test(title)) return { category: 'auto', categoryId: 3 }
  if (/\b(apartament|casa|teren|garsoniera|vila|spatiu comercial|birou)\b/.test(title)) return { category: 'imobiliare', categoryId: 2 }
  if (/\b(iphone|samsung|laptop|telefon|pc|tableta|tv)\b/.test(title)) return { category: 'electronice', categoryId: 5 }
  return { category: 'auto', categoryId: 3 }
}

async function scrapeOLX(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ro-RO,ro;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  })
  const html = await res.text()

  // Extract __NEXT_DATA__
  const ndMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!ndMatch) throw new Error('Nu am putut citi datele paginii OLX')

  const nd = JSON.parse(ndMatch[1])
  const ad = nd?.props?.pageProps?.ad || nd?.props?.pageProps?.data?.ad
  if (!ad) throw new Error('Anunț negăsit pe OLX')

  const title = ad.title || ''
  const description = ad.description || ''
  const price = ad.price?.regularPrice?.value ? parseInt(ad.price.regularPrice.value) : null
  const currency = ad.price?.regularPrice?.currency || 'EUR'
  const city = ad.location?.cityName || ad.location?.city?.name || ''

  // Photos
  const photos: string[] = []
  if (ad.photos) {
    for (const p of ad.photos) {
      const imgUrl = p.link?.replace('{width}', '800').replace('{height}', '600') || p.url || ''
      if (imgUrl) photos.push(imgUrl)
    }
  }

  // Params
  const params: Record<string, string> = {}
  if (ad.params) {
    for (const p of ad.params) {
      params[p.key] = p.value?.label || p.normalizedValue || ''
    }
  }

  const metadata: Record<string, any> = {}
  const paramMap: Record<string, string> = {
    brand: 'brand', make: 'brand', model: 'model',
    year: 'year', fabrication_year: 'year',
    mileage: 'mileage', milage: 'mileage',
    fuel_type: 'fuelType', combustibil: 'fuelType',
    gearbox: 'gearbox', transmission: 'gearbox',
    engine_power: 'power',
  }
  for (const [k, v] of Object.entries(params)) {
    if (paramMap[k]) metadata[paramMap[k]] = v
  }

  // Fallback from title
  const t = title.toLowerCase()
  if (!metadata.brand) {
    const brands = ['VW','Volkswagen','Skoda','Opel','Audi','BMW','Mercedes','Renault','Dacia','Mini','Ford','Peugeot','Seat','Fiat','Toyota','Hyundai','Kia','Subaru','Volvo','Mazda','Honda','Nissan','Suzuki','Mitsubishi','Jeep','Porsche','Tesla','Alfa Romeo']
    for (const b of brands) { if (t.includes(b.toLowerCase())) { metadata.brand = b; break } }
  }
  if (!metadata.year) { const m = title.match(/\b(200[0-9]|201[0-9]|202[0-5])\b/); if (m) metadata.year = m[0] }
  if (!metadata.fuelType) {
    if (t.includes('diesel') || t.includes('tdi') || t.includes('cdi') || t.includes('cdti')) metadata.fuelType = 'Diesel'
    else if (t.includes('benzin') || t.includes('tsi') || t.includes('gsi')) metadata.fuelType = 'Benzina'
    else if (t.includes('hybrid')) metadata.fuelType = 'Hibrid'
    else if (t.includes('electric')) metadata.fuelType = 'Electric'
  }
  if (!metadata.gearbox) {
    if (t.includes('automat')) metadata.gearbox = 'Automata'
    else if (t.includes('manual')) metadata.gearbox = 'Manuala'
  }

  const catInfo = detectCategory(url, { title })

  return { title, description, price, currency, city, photos: photos.slice(0, 8), metadata, ...catInfo, sourceUrl: url, platform: 'OLX' }
}

async function scrapeAutoVit(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ro-RO,ro;q=0.9',
    },
    signal: AbortSignal.timeout(15000),
  })
  const html = await res.text()

  // Title
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  const title = titleMatch ? titleMatch[1].trim() : ''

  // Price
  const priceMatch = html.match(/(\d[\d\s]{2,8})\s*€/) || html.match(/"price"\s*:\s*(\d+)/)
  const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, '')) : null

  // Description
  const descMatch = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
  const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 800) : ''

  // Photos from og:image
  const photos: string[] = []
  const imgMatches = html.matchAll(/<meta property="og:image" content="([^"]+)"/g)
  for (const m of imgMatches) photos.push(m[1])
  if (photos.length === 0) {
    const srcMatches = html.matchAll(/https:\/\/[^"'\s]*autovit[^"'\s]*(?:800|large|big)[^"'\s]*/g)
    for (const m of srcMatches) { if (!photos.includes(m[0])) photos.push(m[0]) }
  }

  // City
  const cityMatch = html.match(/["']city["']\s*:\s*["']([^"']+)["']/) || html.match(/Localitate[^:]*:\s*([A-ZĂÂÎȘȚ][a-zăâîșț]+)/)
  const city = cityMatch ? cityMatch[1] : ''

  const t = title.toLowerCase()
  const metadata: Record<string, any> = {}
  const brands = ['VW','Volkswagen','Skoda','Opel','Audi','BMW','Mercedes','Renault','Dacia','Mini','Ford','Peugeot','Seat','Fiat','Toyota','Hyundai','Kia']
  for (const b of brands) { if (t.includes(b.toLowerCase())) { metadata.brand = b; break } }
  const yearM = title.match(/\b(200[0-9]|201[0-9]|202[0-5])\b/)
  if (yearM) metadata.year = yearM[0]
  if (t.includes('diesel') || t.includes('tdi')) metadata.fuelType = 'Diesel'
  else if (t.includes('benzin') || t.includes('tsi')) metadata.fuelType = 'Benzina'
  if (t.includes('automat')) metadata.gearbox = 'Automata'

  return { title, description, price, currency: 'EUR', city, photos: photos.slice(0, 8), metadata, category: 'auto', categoryId: 3, sourceUrl: url, platform: 'AutoVit' }
}

async function scrapeGeneric(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(15000),
  })
  const html = await res.text()

  // og:title
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/)
  const title = titleMatch ? titleMatch[1].split(/[•|–\-]/)[0].trim() : ''

  // og:description
  const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/) || html.match(/<meta name="description" content="([^"]+)"/)
  const description = descMatch ? descMatch[1].substring(0, 800) : ''

  // Price
  const priceMatch = html.match(/(\d[\d\s]{2,8})\s*(EUR|€|RON|lei)/i)
  const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, '')) : null
  const currency = priceMatch ? (priceMatch[2].toUpperCase().includes('RON') || priceMatch[2].toLowerCase() === 'lei' ? 'RON' : 'EUR') : 'EUR'

  // og:image
  const photos: string[] = []
  const imgMatches = html.matchAll(/<meta property="og:image" content="([^"]+)"/g)
  for (const m of imgMatches) photos.push(m[1])

  const catInfo = detectCategory(url, { title })

  return { title, description, price, currency, city: '', photos: photos.slice(0, 8), metadata: {}, ...catInfo, sourceUrl: url, platform: 'Altă platformă' }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') return NextResponse.json({ error: 'URL lipsă' }, { status: 400 })

    let data
    if (url.includes('olx.ro')) {
      data = await scrapeOLX(url)
    } else if (url.includes('autovit.ro')) {
      data = await scrapeAutoVit(url)
    } else {
      data = await scrapeGeneric(url)
    }

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Eroare la scraping' }, { status: 500 })
  }
}
