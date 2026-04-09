import Groq from 'groq-sdk'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

/**
 * POST /api/search
 * Natural language search for listings
 * Accepts: { query: string }
 * Returns: { results: Listing[], parsed: ParsedQuery }
 */
export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query is required' }, { status: 400 })
    }

    // Parse query with Groq AI
    let parsed = {
      product: query,
      city: '',
      maxPrice: null as number | null,
      keywords: [] as string[],
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Ești parser de interogări pentru zyAI marketplace.
Extrage din query:
- product: ce cauta utilizatorul (ex: apartament)
- city: orașul (ex: București)
- maxPrice: preț maxim dacă e menționat
- keywords: termeni cheie

Returnează DOAR valid JSON fără explicații:
{"product": "...", "city": "...", "maxPrice": null|number, "keywords": [...]}`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        max_tokens: 150,
      })

      const responseText = completion.choices[0].message.content || '{}'
      const cleanJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      parsed = JSON.parse(cleanJson)
    } catch (parseError) {
      console.error('Groq parse error:', parseError)
      // Fallback: use raw query
    }

    // Search Supabase
    const supabase = await createSupabaseServerClient()

    let q = supabase
      .from('listings')
      .select('id, title, description, price, price_type, currency, city, images, created_at', {
        count: 'exact',
      })
      .eq('status', 'activ')
      .limit(10)

    // Filter by city if found
    if (parsed.city) {
      q = q.ilike('city', `%${parsed.city}%`)
    }

    // Filter by max price if found
    if (parsed.maxPrice && parsed.maxPrice > 0) {
      q = q.lte('price', parsed.maxPrice)
    }

    // Search by text — ilike pe titlu SAU descriere (compatibil fără search_vector)
    if (parsed.product) {
      const kw = parsed.product.trim()
      q = q.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`)
    }

    const { data: listings, error, count } = await q

    if (error) {
      console.error('Supabase error:', error)
      return Response.json(
        { results: [], parsed, error: 'Database search failed' },
        { status: 500 }
      )
    }

    // Format results with relevance score
    const results = (listings || []).map((listing: any) => ({
      ...listing,
      score: calculateRelevance(listing, parsed),
    }))

    // Sort by relevance
    results.sort((a: any, b: any) => b.score - a.score)

    return Response.json({
      results: results.slice(0, 5), // Top 5
      parsed,
      total: count || 0,
    })
  } catch (error) {
    console.error('Search error:', error)
    return Response.json({ error: 'Search failed', results: [] }, { status: 500 })
  }
}

/**
 * Calculate relevance score (0-100)
 */
function calculateRelevance(listing: any, parsed: any): number {
  let score = 50 // Base score

  // Price relevance
  if (parsed.maxPrice && listing.price) {
    if (listing.price <= parsed.maxPrice) {
      score += 30
    } else {
      score -= 20
    }
  }

  // City relevance
  if (parsed.city && listing.city) {
    if (listing.city.toLowerCase().includes(parsed.city.toLowerCase())) {
      score += 20
    }
  }

  // Title/description match
  const text = `${listing.title} ${listing.description}`.toLowerCase()
  const keywordMatches = (parsed.keywords || []).filter((k: string) =>
    text.includes(k.toLowerCase())
  ).length
  score += keywordMatches * 5

  return Math.min(100, Math.max(0, score))
}
