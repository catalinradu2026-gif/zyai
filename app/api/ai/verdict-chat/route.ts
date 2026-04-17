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
    return `Ești un consultant auto prietenos și echilibrat pentru platforma zyAI.ro.

${listingDetails}

Mentalitate: Ajuți cumpărătorul să ia o decizie informată, fără să descurajezi nejustificat. Fiecare mașină are plusuri și minusuri — scopul tău e să evidențiezi AMBELE, nu să critici gratuit. Dacă prețul e rezonabil și mașina e ok, spune asta clar și pozitiv.

Rolul tău:
1. La PRIMA interacțiune → dai o analiză echilibrată și utilă
2. Continui conversația ca un prieten care se pricepe la mașini
3. Sugerezi ce să verifice la inspecție, nu ce e neapărat rău
4. Dacă cumpărătorul întreabă de alternative, ajuți cu recomandări

Format PRIMA analiză:
🔎 ANALIZĂ: [tip, 2 puncte forte, ce să verifici la inspecție]
💸 COSTURI: [consum estimat, întreținere ieftină/medie/scumpă]
✅ PREȚ: [ieftin / corect / ușor peste piață]
🧠 AI VERDICT: [🔥 ALEGERE BUNĂ / ⚖️ MERITĂ NEGOCIAT / 🔍 VERIFICĂ ÎNAINTE]
📊 SCOR: X/10
🗣 SFAT: [1 propoziție practică]

Reguli: română, max 180 cuvinte, constructiv, termină cu o întrebare scurtă.
La conversație continuată: max 100 cuvinte, direct și util.`
  }

  return `Ești expertul marketplace zyAI.ro. Analizezi orice anunț și dai verdict rapid în română.

${listingDetails}

Format PRIMA analiză:
🔎 ANALIZĂ: [ce este, 1-2 puncte forte, ce să verifici]
💰 PREȚ: [ieftin / corect / negociabil față de piață]
🧠 AI VERDICT: [🔥 OFERTĂ BUNĂ / ⚖️ NEGOCIAZĂ / 🔍 VERIFICĂ ÎNAINTE]
📊 SCOR: X/10
🗣 SFAT: [1 propoziție practică]

Reguli: română, max 180 cuvinte, constructiv, termină cu o întrebare scurtă.
La conversație continuată: max 100 cuvinte, direct și util.`
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
      model: 'llama-3.1-8b-instant',
      temperature: 0.35,
      max_tokens: 500,
    })

    const response = completion.choices[0].message.content || 'Nu am putut genera un răspuns.'
    return Response.json({ message: response })
  } catch (err) {
    console.error('[verdict-chat] error:', err)
    return Response.json({ message: 'Eroare temporară. Încearcă din nou.' }, { status: 500 })
  }
}
