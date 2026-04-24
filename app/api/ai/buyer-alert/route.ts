import { NextResponse } from 'next/server'

export const maxDuration = 15

export async function POST(req: Request) {
  try {
    const { listingTitle, price, currency = 'EUR', city, category, listingId, buyerName } = await req.json()
    if (!listingTitle || !price) return NextResponse.json({ error: 'listingTitle and price required' }, { status: 400 })

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    const baseUrl = 'https://zyai.ro'
    const listingUrl = listingId ? `${baseUrl}/anunt/${listingId}` : baseUrl

    const prompt = `Generează un mesaj scurt de alertă WhatsApp pentru un cumpărător care a salvat o căutare pe zyAI.ro.
Am găsit un anunț care se potrivește cu ce căuta.

Date anunț:
- Titlu: "${listingTitle}"
- Preț: ${price} ${currency}
- Oraș: ${city || 'România'}
- Categorie: ${category || 'diverse'}
- Link: ${listingUrl}
- Destinatar: ${buyerName || 'utilizator'}

Reguli:
- Maxim 4 rânduri
- Emoji relevant la început
- Prețul și linkul să apară clar
- Ton ușor urgent dar nu agresiv
- Scrie în română
- Nu folosi "Bună ziua" formal

Returnează DOAR JSON valid:
{
  "message": "mesajul WhatsApp complet cu emoji și link"
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
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
    console.error('[buyer-alert]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
