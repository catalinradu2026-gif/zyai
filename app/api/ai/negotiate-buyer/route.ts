import { NextResponse } from 'next/server'

export const maxDuration = 20

export async function POST(req: Request) {
  try {
    const { listingTitle, price, currency, sellerName } = await req.json()

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    const prompt = `Ești un asistent care ajută cumpărătorii să negocieze prețul unui produs pe un marketplace din România.

Detalii anunț:
- Titlu: ${listingTitle}
- Preț cerut: ${price ? `${price} ${currency || 'EUR'}` : 'nespecificat'}
- Vânzător: ${sellerName || 'Vânzător'}

Scrie un mesaj WhatsApp scurt, politicos și natural în română, din partea cumpărătorului către vânzător.
Mesajul trebuie să:
- Salute vânzătorul
- Menționeze că e interesat de produs
- Propună un preț mai mic (10-15% reducere) sau întrebe dacă e negociabil
- Fie prietenos și să nu pară agresiv
- Fie scurt (max 4-5 rânduri)
- NU includă ghilimele sau formatare specială

Returnează DOAR mesajul, fără explicații.`

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
    const message = data.choices?.[0]?.message?.content?.trim() || ''

    return NextResponse.json({ ok: true, message })
  } catch (err) {
    console.error('[negotiate-buyer]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
