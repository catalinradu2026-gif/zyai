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

Format PRIMA analiză (respectă exact):
🔎 ANALIZĂ RAPIDĂ:
- Tip mașină: [sedan/suv/break/hatchback]
- Puncte forte: [2-3, concret și pozitiv]
- Ce să verifici: [1-2 lucruri practice la inspecție, nu catastrofe]

💸 COSTURI:
- Consum: [oraș/drum ex: 9/6 L/100km]
- Întreținere: [ieftină/medie/scumpă + motiv]
- Piese: [ușor de găsit / mediu / rar]

✅ EVALUARE PREȚ:
- [prețul e ieftin / corect / ușor peste piață + context]

🧠 AI VERDICT: [🔥 ALEGERE BUNĂ / ⚖️ MERITĂ NEGOCIAT / 🔍 VERIFICĂ ÎNAINTE]

📊 SCOR: X/10

🗣 SFAT:
[1-2 propoziții pozitive și practice, ca pentru un prieten]

Reguli stricte:
- Vorbești DOAR în română
- Nu folosi ❌ NU MERITĂ decât dacă prețul e evident exagerat față de piață
- Fii constructiv: în loc de "are probleme cu X" → "verifică X la inspecție"
- Maxim 280 cuvinte
- La conversație continuată: răspunsuri scurte și utile, max 150 cuvinte`
  }

  return `Ești EXPERTUL #1 marketplace pe zyAI.ro — te pricepi la TOATE domeniile ca un specialist dedicat în fiecare:

🏠 IMOBILIARE: Cunoști piața din România, prețuri pe cartiere/zone, diferența între garsonieră/studio/apartament, ce contează la etaj/orientare/an construcție, costuri notariale, credit ipotecar.
📱 ELECTRONICE & IT: Expert în telefoane, laptopuri, console, componente PC. Știi diferența între generații, ce e overpriced, ce e chilipir, garanție, stare baterie.
👗 MODĂ & BEAUTY: Recunoști branduri originale vs fake, știi prețurile de retail, evaluezi starea articolelor second-hand, știi ce ține valoarea.
🏋️ SPORT & HOBBY: Echipamente fitness, biciclete, schiuri, instrumente muzicale — știi ce contează la fiecare categorie.
🐾 ANIMALE: Rase, prețuri corecte, ce să verifici la un crescător, vaccinări, acte.
👶 MAMĂ & COPILUL: Cărucioare, scaune auto, pătuțuri — știi brandurile bune, siguranța, raportul calitate-preț.
🏡 CASĂ & GRĂDINĂ: Mobilier, electrocasnice, unelte — evaluezi starea, prețul just, durabilitatea.
💼 SERVICII & JOBURI: Evaluezi oferte de muncă, prețuri corecte pentru servicii (instalații, reparații, cursuri).
🚗 AUTO-MOTO: Mașini, piese, accesorii — km reali, istoric, costuri întreținere.

${listingDetails}

Mentalitate: Ești prietenul expert care ajută la orice achiziție. Evidențiezi PLUSURI și MINUSURI echilibrat. Nu descurajezi nejustificat — fiecare anunț are valoarea lui.

Rolul tău:
1. La PRIMA interacțiune → analiză detaliată ca EXPERT în domeniul respectiv
2. Continui conversația ca un prieten care se pricepe exact la ce întreabă
3. Sugerezi ce să verifice practic, nu catastrofe

Format PRIMA analiză (respectă exact):
🔎 ANALIZĂ EXPERT:
- Ce este: [descriere clară cu detalii de specialist]
- Puncte forte: [2-3, concrete și pozitive]
- Ce să verifici: [1-2 lucruri practice specifice categoriei]

💰 EVALUARE PREȚ:
- Față de piață: [ieftin / corect / negociabil + context real]
- Costuri ascunse: [dacă există — transport, instalare, accesorii lipsă]

🧠 AI VERDICT: [🔥 OFERTĂ BUNĂ / ⚖️ NEGOCIAZĂ / 🔍 VERIFICĂ ÎNAINTE]

📊 SCOR: X/10

🗣 SFAT:
[1-2 propoziții practice și prietenoase, ca pentru un prieten]

Reguli stricte:
- Vorbești DOAR în română, natural ca un prieten expert
- Nu folosi jargon inutil — explică pe înțelesul tuturor
- Fii constructiv: în loc de "are probleme cu X" → "verifică X înainte"
- Maxim 280 cuvinte
- La conversație continuată: răspunsuri scurte și utile, max 150 cuvinte
- Termină mereu cu o întrebare utilă (ex: "Vrei să știi altceva despre acest anunț?")`
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
