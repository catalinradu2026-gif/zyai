import { NextResponse } from 'next/server'

export const maxDuration = 20

export async function POST(req: Request) {
  try {
    const { title, description, category, subcategory, condition, brand, city } = await req.json()
    if (!title || !category) return NextResponse.json({ error: 'title and category required' }, { status: 400 })

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    const prompt = `Ești un expert în prețuri pentru piața românească de second-hand și marketplace (similar OLX Romania).
Estimează prețul corect pentru acest produs bazat pe piața din România în 2025.

Produs: ${title}
Categorie: ${category}${subcategory ? ` / ${subcategory}` : ''}
Descriere: ${description || 'N/A'}
Stare: ${condition || 'N/A'}
Marcă: ${brand || 'N/A'}
Oraș: ${city || 'România'}

Returnează DOAR un JSON valid, fără text suplimentar:
{
  "currency": "EUR sau RON (EUR pentru electronice/auto/imobiliare, RON pentru haine/diverse)",
  "min": număr_minim,
  "max": număr_maxim,
  "suggested": număr_recomandat,
  "reasoning": "explicație scurtă în română (max 80 caractere) de ce acest preț",
  "tips": ["sfat scurt vânzare 1", "sfat scurt vânzare 2"]
}

Reguli:
- Prețuri realiste pentru piața românească (nu prețuri de retail nou)
- Dacă e second-hand, scade 30-60% față de prețul nou
- Dacă e Nou/Ca nou, scade 10-25%
- Bazează-te pe prețuri reale OLX/marketplace România`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 400,
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
    console.error('[suggest-price] unexpected:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
