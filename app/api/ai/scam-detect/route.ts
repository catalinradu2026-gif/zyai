import { NextResponse } from 'next/server'

export const maxDuration = 20

export async function POST(req: Request) {
  try {
    const { title, description, price, category, city, images } = await req.json()
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    const prompt = `Ești un expert anti-fraudă pentru marketplace-uri din România. Analizează obiectiv acest anunț.

IMPORTANT: Platforma permite maxim 3 poze — nu penaliza pentru număr mic de poze.

Anunț:
- Titlu: ${title}
- Categorie: ${category || 'necunoscută'}
- Preț: ${price ? price + ' EUR' : 'nespecificat'}
- Oraș: ${city || 'nespecificat'}
- Descriere: ${description ? description.substring(0, 400) : 'lipsă'}

REGULI DE SCORING (aplică strict):

RISC SCĂZUT (score 0-30) — dacă:
- Prețul e realist pentru categorie
- Descrierea e detaliată și specifică
- Orașul e specificat
- Nu există cuvinte de alertă
- Anunț obișnuit de vânzare

RISC MEDIU (score 31-65) — dacă există 1-2 din:
- Descriere scurtă sau vagă (sub 20 cuvinte)
- Preț ușor sub piață (20-40% mai ieftin)
- Lipsă detalii contact sau oraș

RISC RIDICAT (score 66-100) — dacă există oricare din:
- Preț aberant de mic (50%+ sub piață): ex telefon nou sub 100€, mașină sub 800€
- Cuvinte: "urgent", "plecare în străinătate", "șansa vieții", "transfer bancar", "plată în avans"
- Descriere generată sau copiată
- Promisiuni nerealiste de livrare rapidă

Returnează DOAR JSON valid, fără text înainte sau după:
{
  "risk": "LOW" sau "MEDIUM" sau "HIGH",
  "score": număr_între_0_și_100,
  "flags": ["maxim 3 semnale concrete și scurte, sau array gol dacă nu există"],
  "summary": "concluzie scurtă în română (max 80 caractere)",
  "tip": "sfat practic pentru cumpărător (max 70 caractere)"
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
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
