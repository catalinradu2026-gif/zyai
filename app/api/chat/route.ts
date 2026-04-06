import { Groq } from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Invalid message' }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Ești "zyAI", un asistent inteligent pentru platforma de anunțuri zyAI.

Sarcina ta:
- Ajută utilizatorii să caute și să găsească anunțuri
- Răspunde la întrebări despre platformă
- Fii amical și util
- Răspunde în limba română

Informații despre zyAI:
- Platformă de anunțuri (OLX-style)
- Categorii: Joburi, Imobiliare, Auto, Servicii
- Utilizatori pot posta anunțuri gratuit
- Sistem de messaging pentru contact între utilizatori
- Magic link authentication

Răspunde scurt și concis (max 2-3 propoziții). Dacă utilizatorul cere ceva pe care nu-l poți ajuta, spune-i să navigheze pe platformă.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 256,
      temperature: 0.7,
    })

    const assistantMessage =
      completion.choices[0].message.content || 'Scuze, nu am putut genera un răspuns.'

    return Response.json({ message: assistantMessage })
  } catch (error) {
    console.error('Chat error:', error)
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
