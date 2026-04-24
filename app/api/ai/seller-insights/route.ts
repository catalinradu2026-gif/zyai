import { NextResponse } from 'next/server'

export const maxDuration = 20

export async function POST(req: Request) {
  try {
    const { listings } = await req.json()
    if (!listings?.length) return NextResponse.json({ error: 'listings required' }, { status: 400 })

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    const summary = listings.map((l: any) =>
      `"${l.title}" | ${l.price}€ | ${l.views || 0} vizualizări | Status: ${l.status}`
    ).join('\n')

    const prompt = `Ești un consultant de vânzări AI pentru marketplace-ul zyAI.ro.
Analizează performanța anunțurilor acestui vânzător și oferă sfaturi concrete.

Anunțuri:
${summary}

Returnează DOAR JSON valid:
{
  "totalViews": număr_total_vizualizări,
  "insights": [
    { "listingTitle": "titlu scurt", "type": "warning"|"tip"|"success", "message": "mesaj scurt în română (max 70 car)" }
  ],
  "topTip": "cel mai important sfat general în română (max 100 caractere)",
  "overallScore": număr_0_100
}

Tipuri de insights:
- warning: anunț cu vizualizări multe dar fără contacte (preț prea mare?)
- tip: anunț nou fără poze suficiente
- success: anunț cu performanță bună`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
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
    console.error('[seller-insights]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
