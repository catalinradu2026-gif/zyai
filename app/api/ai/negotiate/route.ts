import { NextResponse } from 'next/server'

export const maxDuration = 20

export async function POST(req: Request) {
  try {
    const { listingTitle, askPrice, minPrice, buyerMessage, currency = 'EUR', sellerName } = await req.json()
    if (!listingTitle || !askPrice || !buyerMessage) {
      return NextResponse.json({ error: 'listingTitle, askPrice, buyerMessage required' }, { status: 400 })
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    const prompt = `Ești un asistent de negociere AI pentru vânzătorul "${sellerName || 'vânzătorul'}" pe marketplace-ul zyAI.ro.
Răspunde în numele vânzătorului la mesajul cumpărătorului. Fii natural, politicos și persuasiv.

Anunț: "${listingTitle}"
Preț cerut: ${askPrice} ${currency}
Preț minim acceptat de vânzător: ${minPrice || askPrice} ${currency}
Mesajul cumpărătorului: "${buyerMessage}"

Reguli STRICTE:
- Nu accepta NICIODATĂ sub prețul minim (${minPrice || askPrice} ${currency})
- Fii prietenos și uman, ca un vânzător real din România
- Dacă oferta e aproape de minim, poți accepta sau contra-oferta cu minimul
- Dacă oferta e mult sub minim, refuză politicos și explică valoarea produsului
- Maxim 3 propoziții
- Nu folosi semnătura sau formule robotice
- Scrie în română

Returnează DOAR JSON valid:
{
  "reply": "mesajul de răspuns în română",
  "action": "accept" | "counter" | "decline",
  "counterPrice": număr_sau_null
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 250,
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
    console.error('[negotiate]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
