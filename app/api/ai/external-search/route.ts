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

const PLATFORM_CONFIG: Record<string, { emoji: string; site: string }> = {
  'Autovit.ro':     { emoji: '🚗', site: 'autovit.ro' },
  'OLX.ro':         { emoji: '🟠', site: 'olx.ro' },
  'AutoScout24':    { emoji: '🌐', site: 'autoscout24.ro' },
  'Publi24.ro':     { emoji: '📋', site: 'publi24.ro' },
  'Imobiliare.ro':  { emoji: '🏠', site: 'imobiliare.ro' },
  'Storia.ro':      { emoji: '🏡', site: 'storia.ro' },
  'eMag.ro':        { emoji: '🛍️', site: 'emag.ro' },
  'Okazii.ro':      { emoji: '🛒', site: 'okazii.ro' },
}

// ── AGENT 1: Caută pe DuckDuckGo pentru un site specific ──
async function searchOnSite(
  query: string,
  site: string,
  offset = 0,
): Promise<{ title: string; url: string; snippet: string }[]> {
  const q = `${query} site:${site}`
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}${offset > 0 ? `&s=${offset}` : ''}`

  try {
    const res = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return []
    const html = await res.text()

    const results: { title: string; url: string; snippet: string }[] = []

    // Extrage blocuri de rezultate
    const blocks = html.split('<div class="result ')
    for (const block of blocks.slice(1)) {
      // Extrage titlul și URL-ul din <a class="result__a"
      const titleMatch = block.match(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/)
      // Extrage snippet-ul
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/)

      if (!titleMatch) continue

      const rawUrl = titleMatch[1]
      const title = titleMatch[2].replace(/<[^>]+>/g, '').trim()
      const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : ''

      // Decodează URL-ul DuckDuckGo (redirect)
      let actualUrl = rawUrl
      try {
        if (rawUrl.includes('uddg=')) {
          const uddgParam = new URL('https://x.com' + rawUrl).searchParams.get('uddg')
          if (uddgParam) actualUrl = decodeURIComponent(uddgParam)
        }
      } catch {}

      // Filtrează doar URL-uri de pe site-ul dorit
      if (!actualUrl.includes(site)) continue

      results.push({ title, url: actualUrl, snippet })
      if (results.length >= 5) break
    }

    return results
  } catch {
    return []
  }
}

// ── AGENT 2: Groq extrage date structurate din rezultatele brute ──
async function enrichWithGroq(
  rawResults: { title: string; url: string; snippet: string; platform: string }[],
  query: string,
  groq: Groq,
): Promise<AIListing[]> {
  if (rawResults.length === 0) return []

  const inputText = rawResults.map((r, i) =>
    `[${i}] Platform: ${r.platform}\nTitlu: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`
  ).join('\n\n')

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Ești un expert în piața românească. Primești rezultate reale de pe platforme românești (Autovit, OLX, Imobiliare.ro, etc).

Extrage și structurează datele în JSON array cu exact ${rawResults.length} obiecte:
- "index": numărul [X] din input
- "title": titlul curat al anunțului (fără caractere HTML)
- "price": prețul extras din titlu/snippet (ex: "8.500 EUR", "185.000 RON") sau "Preț la cerere" dacă nu găsești
- "specs": array 2-4 specificații cheie extrase (ex: ["2019", "150.000 km", "Diesel"] pentru auto sau ["2 camere", "65 mp", "etaj 3"] pentru imobiliare sau ["128GB", "Negru", "Stare bună"] pentru electronice)
- "matchScore": 75-99 cât de bine se potrivește cu "${query}"
- "aiReason": max 8 cuvinte de ce e o alegere bună
- "location": orașul dacă apare în titlu/snippet sau ""

Returnează DOAR JSON array valid, fără text în plus.`,
      },
      { role: 'user', content: inputText },
    ],
    model: 'llama-3.3-70b-versatile',
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
    const cfg = PLATFORM_CONFIG[r.platform] || { emoji: '🔗', site: '' }
    return {
      id: `${i}-${Date.now()}`,
      title: e.title || r.title || 'Anunț',
      price: e.price || 'Preț la cerere',
      platform: r.platform,
      platformEmoji: cfg.emoji,
      url: r.url,
      specs: Array.isArray(e.specs) ? e.specs.slice(0, 4) : [],
      matchScore: Math.min(99, Math.max(75, e.matchScore || 82)),
      aiReason: e.aiReason || 'Potrivit pentru cerința ta',
      location: e.location || '',
    }
  })
}

function getPlatformsForCategory(categoryId: number | null): string[] {
  if (categoryId === 3) return ['Autovit.ro', 'OLX.ro', 'AutoScout24', 'Publi24.ro']
  if (categoryId === 2) return ['Imobiliare.ro', 'Storia.ro', 'OLX.ro', 'Publi24.ro']
  if (categoryId === 5) return ['OLX.ro', 'eMag.ro', 'Okazii.ro', 'Publi24.ro']
  return ['OLX.ro', 'Publi24.ro', 'Okazii.ro', 'eMag.ro']
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
    const platforms = getPlatformsForCategory(filters.categoryId)
    const searchQuery = buildSearchQuery(filters, query)
    const offset = batch * 10

    // ── Agent 1: Caută pe toate platformele în paralel ──
    const searchResults = await Promise.allSettled(
      platforms.map(platform =>
        searchOnSite(searchQuery, PLATFORM_CONFIG[platform]?.site || 'olx.ro', offset)
          .then(results => results.map(r => ({ ...r, platform })))
      )
    )

    // Combină toate rezultatele
    const allRaw: { title: string; url: string; snippet: string; platform: string }[] = []
    for (const result of searchResults) {
      if (result.status === 'fulfilled') {
        allRaw.push(...result.value)
      }
    }

    if (allRaw.length === 0) {
      return Response.json({
        results: [],
        batch,
        query,
        message: 'Nu am găsit rezultate reale. Încearcă o căutare diferită.',
      })
    }

    // Amestecă platformele (nu toate de pe același site) și ia max 10
    const shuffled = allRaw.sort(() => 0.1 - Math.random()).slice(0, 10)

    // ── Agent 2: Groq îmbogățește cu date structurate ──
    const enriched = await enrichWithGroq(shuffled, query, groq)

    return Response.json({ results: enriched, batch, query, total: allRaw.length })
  } catch (e: any) {
    console.error('external-search error:', e)
    return Response.json({ error: 'Failed', results: [] }, { status: 500 })
  }
}
