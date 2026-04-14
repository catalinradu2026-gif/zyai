import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export const maxDuration = 30

type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ListingContext = {
  title: string
  price: number | null
  currency: string
  price_type: string
  city: string
  description: string
  category_id: number
  metadata: Record<string, any>
}

function buildSystemPrompt(listing: ListingContext): string {
  const isAuto = listing.category_id === 3
  const m = listing.metadata || {}

  const listingDetails = `
Anunț analizat:
- Titlu: ${listing.title}
- Preț: ${listing.price ? `${listing.price.toLocaleString('ro-RO')} ${listing.currency}` : listing.price_type}
- Oraș: ${listing.city}
- Descriere: ${listing.description?.substring(0, 400) || 'Nespecificată'}
${isAuto ? `- An: ${m.year || '?'} | Km: ${m.mileage ? Number(m.mileage).toLocaleString() + ' km' : '?'} | Combustibil: ${m.fuelType || '?'} | Cutie: ${m.gearbox || '?'} | Putere: ${m.power ? m.power + ' CP' : '?'} | Stare: ${m.condition || '?'} | Marcă/Model: ${m.brand || '?'} ${m.model || ''}` : ''}
`.trim()

  if (isAuto) {
    return `Ești un expert auto profesionist, obiectiv și sincer, specializat pe piața românească second-hand.

${listingDetails}

Rolul tău:
1. La PRIMA interacțiune → dai un verdict complet despre mașina din anunț
2. Apoi continui conversația ca un consultant auto prietenos
3. Poți recomanda alternative sau alte mașini similare dacă utilizatorul întreabă
4. Rămâi MEREU în contextul acestui anunț și al nevoilor cumpărătorului

Format PRIMA analiză (respectă exact):
🔎 ANALIZĂ RAPIDĂ:
- Tip mașină: [sedan/suv/break/hatchback]
- Puncte forte: [max 3, concret]
- Probleme cunoscute: [max 3, specific modelului]

💸 COSTURI:
- Consum: [oraș/drum ex: 9/6 L/100km]
- Întreținere: [ieftină/medie/scumpă + motiv]
- Piese: [ușor/mediu/scump]

⚠️ RISCURI:
- [2-3 riscuri specifice]

🧠 AI VERDICT: [🔥 MERITĂ / ⚖️ DEPINDE / ❌ NU MERITĂ]

📊 SCOR FINAL: X/10

🗣 RECOMANDARE:
[2-3 propoziții directe pentru cumpărătorul din România]

Reguli generale:
- Vorbești DOAR în română
- Fii specific, nu generic
- Ține cont de prețul din anunț la verdict
- Maxim 300 cuvinte la prima analiză
- La conversație continuată: răspunsuri scurte, directe, max 150 cuvinte`
  }

  return `Ești un expert marketplace profesionist, obiectiv și sincer, specializat pe piața românească.

${listingDetails}

Rolul tău:
1. La PRIMA interacțiune → dai o opinie sinceră despre anunț: merită prețul? e o ofertă bună?
2. Continui conversația ca un consultant prietenos
3. Poți sugera alte produse similare dacă utilizatorul întreabă

Format PRIMA analiză:
🔎 OPINIE RAPIDĂ:
- Ce este: [descriere scurtă]
- Punct forte: [cel mai bun aspect]
- Atenție la: [ce să verifice]

💰 PREȚUL:
- Față de piață: [ieftin / corect / scump]
- Concluzie: [merită sau nu la acest preț]

🧠 VERDICT: [🔥 CUMPĂRĂ / ⚖️ NEGOCIAZĂ / ❌ EVITĂ]

🗣 SFAT:
[1-2 propoziții directe]

Reguli:
- Vorbești DOAR în română
- Fii direct și util
- Maxim 200 cuvinte la prima analiză`
}

export async function POST(req: Request) {
  try {
    const { message, history = [], listing }: {
      message: string
      history: HistoryMessage[]
      listing: ListingContext
    } = await req.json()

    if (!message || !listing) {
      return Response.json({ message: 'Date lipsă.' }, { status: 400 })
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) {
      return Response.json({ message: 'AI indisponibil momentan.' })
    }

    const systemPrompt = buildSystemPrompt(listing)
    const validHistory = (history as HistoryMessage[])
      .filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
      .slice(-8)

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...validHistory,
        { role: 'user', content: message },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.35,
      max_tokens: 700,
    })

    const response = completion.choices[0].message.content || 'Nu am putut genera un răspuns.'
    return Response.json({ message: response })
  } catch (err) {
    console.error('[verdict-chat] error:', err)
    return Response.json({ message: 'Eroare temporară. Încearcă din nou.' }, { status: 500 })
  }
}
