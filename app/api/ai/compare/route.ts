import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const maxDuration = 45

const SYSTEM_PROMPT = `Tu ești Comparison Expert zyai.ro – un AI imparțial, obiectiv și extrem de util pentru piața second-hand din România. Rolul tău este să ajuți cumpărătorii să compare anunțuri rapid și să ia decizii inteligente, fără bias către anunțurile din zyai.ro.

Răspunde doar în română naturală, prietenoasă, ca un consultant de încredere care vorbește cu un prieten. Folosește emoji cu moderație (✅ ⚠️ 📍 💰 🔥) pentru claritate. Fii transparent: dacă datele sunt insuficiente, spune clar.

Nu inventa informații. Nu face reclamă exagerată la zyai.ro. Fii onest și practic.

Generează ÎNTOTDEAUNA:
1. Titlu clar al raportului
2. Tabel Markdown de comparație cu coloane: Anunț, Preț, Locație, Verdict preț AI, Scor general AI (din 10) + coloane adaptive pe categorie (auto: an/km/combustibil; imobiliare: camere/suprafață; electronice: capacitate/stare)
3. Analiză detaliată per anunț: 3-4 pro și contra scurte
4. Concluzie clară: cel mai bun overall + recomandări practice (ce verifici la vizionare, preț de negociere)
5. Footer: "Raport generat de AI-ul zyai.ro • [data]. Recomandăm verificarea fizică înainte de orice achiziție."`

type Listing = {
  id: string
  title: string
  price: number | null
  currency: string
  price_type: string
  city: string
  description: string
  category: string
  source: string
  url?: string
  metadata?: Record<string, any>
}

function buildUserPrompt(listings: Listing[], date: string): string {
  const catName = listings[0]?.category || 'General'

  const listingsText = listings.map((l, i) => {
    const m = l.metadata || {}
    const price = l.price ? `${l.price.toLocaleString('ro-RO')} ${l.currency}` : l.price_type || 'Nespecificat'
    const extras: string[] = []
    if (m.year) extras.push(`An: ${m.year}`)
    if (m.mileage) extras.push(`Km: ${Number(m.mileage).toLocaleString('ro-RO')} km`)
    if (m.fuelType) extras.push(`Combustibil: ${m.fuelType}`)
    if (m.gearbox) extras.push(`Cutie: ${m.gearbox}`)
    if (m.power) extras.push(`Putere: ${m.power} CP`)
    if (m.brand) extras.push(`Marcă: ${m.brand}${m.model ? ' ' + m.model : ''}`)
    if (m.condition) extras.push(`Stare: ${m.condition}`)
    if (m.nrCamere) extras.push(`Camere: ${m.nrCamere}`)
    if (m.suprafata) extras.push(`Suprafață: ${m.suprafata} mp`)
    if (m.etaj) extras.push(`Etaj: ${m.etaj}`)
    if (m.tipTranzactie) extras.push(`Tip: ${m.tipTranzactie}`)

    return `Anunț ${i + 1} (${l.source}):
Titlu: ${l.title}
Preț: ${price}
Locație: ${l.city}
Descriere: ${(l.description || '').slice(0, 200)}
${extras.length ? 'Detalii: ' + extras.join(', ') : ''}
${l.url ? 'Link: ' + l.url : ''}`
  }).join('\n\n')

  return `Generează un raport complet de comparație pentru:

Categoria: ${catName}

${listingsText}

Data raportului: ${date}

Instrucțiuni:
- Scorul general AI (din 10) să aibă ponderi vizibile: 40% preț vs piață • 30% stare/detalii • 20% locație • 10% descriere/risc
- Dacă un anunț nu are suficiente date pentru o coloană, pune "—"
- Fii obiectiv, nu favoriza niciun anunț
- La concluzie oferă un preț concret de negociere`
}

export async function POST(req: Request) {
  try {
    const { listings } = await req.json() as { listings: Listing[] }
    if (!listings || listings.length < 2) {
      return NextResponse.json({ error: 'Minim 2 anunțuri necesare' }, { status: 400 })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })
    const date = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(listings, date) },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    })

    const report = completion.choices[0]?.message?.content || ''
    return NextResponse.json({ report })
  } catch (err: any) {
    console.error('Compare AI error:', err)
    return NextResponse.json({ error: err.message || 'Eroare AI' }, { status: 500 })
  }
}
