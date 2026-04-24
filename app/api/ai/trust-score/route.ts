import { NextResponse } from 'next/server'

export const maxDuration = 20

export async function POST(req: Request) {
  try {
    const { sellerName, phone, city, listingCount, avgImages, hasAvatar, joinedDaysAgo, avgDescription } = await req.json()

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    const prompt = `Ești un sistem de evaluare a credibilității vânzătorilor pe un marketplace din România.
Evaluează acest profil de vânzător și returnează un scor de încredere.

Date vânzător:
- Nume: ${sellerName || 'necompletat'}
- Telefon verificat: ${phone ? 'da' : 'nu'}
- Oraș: ${city || 'nespecificat'}
- Număr anunțuri publicate: ${listingCount || 0}
- Are poză de profil: ${hasAvatar ? 'da' : 'nu'}
- Zile de când e pe platformă: ${joinedDaysAgo || 0}
- Medie poze per anunț: ${avgImages || 0}
- Calitate descrieri: ${avgDescription || 'necunoscută'}

Criterii de evaluare:
- Profil complet (avatar, telefon, oraș) → +25p
- Anunțuri multiple și consistente → +20p
- Vechime pe platformă (>30 zile) → +15p
- Poze suficiente (>3 per anunț) → +20p
- Descrieri detaliate → +20p

Returnează DOAR JSON valid:
{
  "score": număr_între_0_și_100,
  "level": "Nou" | "De Încredere" | "Verificat" | "Expert",
  "badge": "🆕" | "✅" | "🔵" | "⭐",
  "summary": "explicație scurtă în română (max 80 caractere)",
  "tips": ["sfat 1 pentru vânzător să crească scorul", "sfat 2"]
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
    console.error('[trust-score]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
