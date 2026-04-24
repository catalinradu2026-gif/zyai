import { NextResponse } from 'next/server'

export const maxDuration = 20

export async function POST(req: Request) {
  try {
    const { title, description, price, category, city, images } = await req.json()
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    const prompt = `Ești un expert anti-fraudă pentru marketplace-uri din România (similar OLX, autovit).
Analizează acest anunț și detectează potențialele riscuri de înșelătorie.

Anunț:
- Titlu: ${title}
- Categorie: ${category || 'necunoscută'}
- Preț: ${price ? price + ' EUR' : 'nespecificat'}
- Oraș: ${city || 'nespecificat'}
- Descriere: ${description || 'fără descriere'}
- Număr poze: ${images?.length || 0}

Semnale de alertă comune în România:
- Preț mult sub piață (telefon nou la 50€, mașină la 500€)
- Descriere foarte scurtă sau generică
- Fără poze sau puține poze
- Promite livrare rapidă fără verificare
- Cere plată în avans sau transfer bancar
- Produs "de vânzare urgent din cauza plecării în străinătate"
- Cuvinte cheie: "urgent", "plecare", "șansa vieții", "unic pret"

Returnează DOAR JSON valid:
{
  "risk": "LOW" | "MEDIUM" | "HIGH",
  "score": număr_între_0_și_100,
  "flags": ["semnal 1 scurt", "semnal 2 scurt"],
  "summary": "explicație scurtă în română (max 100 caractere)",
  "tip": "sfat scurt pentru cumpărător (max 80 caractere)"
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 300,
      }),
    })

    if (!response.ok) return NextResponse.json({ error: 'groq_error' }, { status: 500 })

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content || ''
    let parsed: any = null
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ error: 'parse_error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, result: parsed })
  } catch (err) {
    console.error('[scam-detect]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
