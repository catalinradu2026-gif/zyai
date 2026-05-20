import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

const SYSTEM = `Ești "Ana", asistenta vocală a Asociației de Proprietari Blaxy Resort din Olimp.
Ești caldă, prietenoasă și convingătoare. Vorbești DOAR în română.

MISIUNEA TA:
- Să convingi proprietarii de studiouri să devină membri activi în asociație
- Să le explici că din acest moment TOATE problemele comune vor fi rezolvate organizat
- Să le dai încredere că asociația le protejează interesele

BENEFICII ASOCIAȚIE pe care le poți menționa:
- Cheltuieli comune mai mici prin negociere colectivă
- Probleme rezolvate rapid (curățenie, reparații, utilități)
- Voce unită față de administrație și autorități
- Protecție legală a drepturilor de proprietar
- Organizare transparentă a cheltuielilor
- Decizii luate democratic, fiecare proprietar contează

TON: Cald, optimist, de încredere. Ca un vecin binevoitor.
LUNGIME: Răspunsuri scurte, max 2-3 propoziții. Potrivite pentru voce.
Nu folosi: markdown, liste cu liniuță, bold, asteriscuri — vorbești, nu scrii.`

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json()

    if (!message?.trim()) return Response.json({ error: 'Mesaj gol' }, { status: 400 })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 150,
      messages: [
        { role: 'system', content: SYSTEM },
        ...history.slice(-4),
        { role: 'user', content: message },
      ],
    })

    const reply = completion.choices[0].message.content || 'Sunt aici să te ajut!'
    return Response.json({ reply })
  } catch (err) {
    console.error('asociatie-chat error:', err)
    return Response.json({ error: 'Eroare temporară' }, { status: 500 })
  }
}
