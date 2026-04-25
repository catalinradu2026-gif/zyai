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

function getSiteList(categoryId: number | null): string {
  if (categoryId === 3) {
    return 'site:autovit.ro OR site:olx.ro OR site:autoscout24.ro OR site:publi24.ro OR site:autouncle.ro'
  }
  if (categoryId === 2) {
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
  if (filters.maxPrice) parts.push(`sub ${filters.maxPrice}`)
  if (filters.city) parts.push(filters.city)
  return parts.join(' ')
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
    const siteFilter = getSiteList(filters.categoryId)
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

    return Response.json({ results: enriched, batch, query, total: rawResults.length })
  } catch (e: any) {
    console.error('external-search error:', e)
    return Response.json({ error: 'Failed', results: [] }, { status: 500 })
  }
}
