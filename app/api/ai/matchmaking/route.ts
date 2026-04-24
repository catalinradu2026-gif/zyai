import { NextResponse } from 'next/server'

export const maxDuration = 20

export async function POST(req: Request) {
  try {
    const { userQuery, listings } = await req.json()
    if (!userQuery || !listings?.length) {
      return NextResponse.json({ error: 'userQuery and listings required' }, { status: 400 })
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    const listingsSummary = listings.slice(0, 20).map((l: any, i: number) =>
      `[${i}] ID:${l.id} | "${l.title}" | ${l.price}${l.currency || 'EUR'} | ${l.city || ''}`
    ).join('\n')

    const prompt = `Ești un motor de potrivire AI pentru marketplace-ul zyAI.ro din România.
Utilizatorul caută: "${userQuery}"

Anunțuri disponibile:
${listingsSummary}

Analizează fiecare anunț și calculează un scor de potrivire 0-100% față de cererea utilizatorului.
Ține cont de: titlu, preț, locație, caracteristici.

Returnează DOAR JSON valid cu primele 5 potriviri:
{
  "matches": [
    { "id": "listing_id", "score": număr_0_100, "reason": "de ce se potrivește (max 40 caractere)" }
  ],
  "summary": "rezumat scurt al căutării (max 60 caractere)"
}
Sortează descrescător după score.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
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
    console.error('[matchmaking]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
