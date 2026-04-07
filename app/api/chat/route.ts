import Groq from 'groq-sdk'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCategoryIdBySlug } from '@/lib/constants/categories'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export type ChatListing = {
  id: string
  title: string
  price: number | null
  price_type: string
  currency: string
  city: string
  images: string[]
  created_at: string
}

type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatResponse = {
  type: 'search' | 'chat'
  message: string
  listings?: ChatListing[]
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, history = [] }: { message: string; history: HistoryMessage[] } = body

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Invalid message' }, { status: 400 })
    }

    // PASUL 1: Groq decide intent + extrage filtre (un singur apel)
    const systemPrompt = `Ești "zyAI", asistentul inteligent al platformei de anunțuri zyAI din România.

Platforma are 4 categorii: joburi (id:1), imobiliare (id:2), auto (id:3), servicii (id:4).

Sarcina ta: analizează mesajul utilizatorului și returnează EXCLUSIV JSON valid, fără text suplimentar.

Reguli de clasificare:
- "search": utilizatorul caută un anunț (apartament, job, mașină, serviciu, etc.)
- "chat": salut, mulțumire, întrebare despre platformă, altceva

Format JSON obligatoriu:
{
  "intent": "search" | "chat",
  "message": "răspunsul tău conversațional în română (1-3 propoziții, prietenos)",
  "filters": {
    "product": "ce caută (null dacă nu e search)",
    "city": "orașului menționat sau null",
    "maxPrice": număr sau null,
    "minPrice": număr sau null,
    "category": "joburi" | "imobiliare" | "auto" | "servicii" | null,
    "keywords": ["cuvinte", "cheie"]
  }
}

Exemple:
- "apartament 2 camere cluj 500 euro" → intent:"search", category:"imobiliare", city:"Cluj", maxPrice:500
- "caut job programator" → intent:"search", category:"joburi", product:"job programator"
- "salut, cum funcționează?" → intent:"chat", message:"Bună! Sunt zyAI..."
- "dacia logan 2018 sub 5000" → intent:"search", category:"auto", product:"dacia logan 2018", maxPrice:5000`

    // Construieste mesajele cu history (max ultimele 6 pentru context)
    const recentHistory = history.slice(-6)

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentHistory,
        { role: 'user', content: message },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 400,
    })

    // Parseaza raspunsul JSON de la Groq
    const rawText = completion.choices[0].message.content || '{}'
    let parsed: {
      intent: 'search' | 'chat'
      message: string
      filters: {
        product: string | null
        city: string | null
        maxPrice: number | null
        minPrice: number | null
        category: string | null
        keywords: string[]
      }
    }

    try {
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleanJson)
    } catch {
      // Fallback: raspuns conversational simplu
      return Response.json({
        type: 'chat',
        message: rawText || 'Scuze, am o problemă. Încearcă din nou.',
      } satisfies ChatResponse)
    }

    // PASUL 2: Daca intent este "search", cauta in Supabase
    if (parsed.intent === 'search' && parsed.filters?.product) {
      const supabase = await createSupabaseServerClient()

      let q = supabase
        .from('listings')
        .select('id, title, price, price_type, currency, city, images, created_at', {
          count: 'exact',
        })
        .eq('status', 'activ')
        .order('created_at', { ascending: false })
        .limit(6)

      // Aplica filtrele extrase
      if (parsed.filters.city) {
        q = q.ilike('city', `%${parsed.filters.city}%`)
      }
      if (parsed.filters.maxPrice && parsed.filters.maxPrice > 0) {
        q = q.lte('price', parsed.filters.maxPrice)
      }
      if (parsed.filters.minPrice && parsed.filters.minPrice > 0) {
        q = q.gte('price', parsed.filters.minPrice)
      }
      if (parsed.filters.category) {
        const categoryId = getCategoryIdBySlug(parsed.filters.category)
        q = q.eq('category_id', categoryId)
      }

      let { data: listings, error } = await q

      // Daca nu da rezultate, incearca fallback ilike pe title
      if ((!listings || listings.length === 0) && parsed.filters.product) {
        const { data: fallbackListings } = await supabase
          .from('listings')
          .select('id, title, price, price_type, currency, city, images, created_at')
          .eq('status', 'activ')
          .ilike('title', `%${parsed.filters.product}%`)
          .order('created_at', { ascending: false })
          .limit(6)

        listings = fallbackListings
      }

      if (error && (!listings || listings.length === 0)) {
        console.error('Supabase search error:', error)
        return Response.json({
          type: 'chat',
          message: 'Am întâmpinat o problemă la căutare. Încearcă din nou.',
        } satisfies ChatResponse)
      }

      const count = listings?.length ?? 0

      // Mesaj contextual bazat pe rezultate
      const resultMessage =
        count > 0
          ? `Am găsit ${count} anunț${count !== 1 ? 'uri' : ''} pentru tine${parsed.filters.city ? ` în ${parsed.filters.city}` : ''}. Apasă pe orice anunț pentru detalii complete.`
          : `Nu am găsit anunțuri pentru "${parsed.filters.product}"${parsed.filters.city ? ` în ${parsed.filters.city}` : ''}. Încearcă cu alte cuvinte cheie, o altă locație sau o plajă de preț mai mare.`

      return Response.json({
        type: 'search',
        message: resultMessage,
        listings: listings ?? [],
      } satisfies ChatResponse)
    }

    // PASUL 3: Raspuns conversational simplu
    return Response.json({
      type: 'chat',
      message: parsed.message || 'Sunt aici să te ajut! Spune-mi ce cauți.',
    } satisfies ChatResponse)
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
