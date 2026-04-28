import { NextResponse } from 'next/server'

export const maxDuration = 45

const SYSTEM_PROMPT = `Ești un vânzător de mașini profesionist cu 15 ani experiență în piața auto din România. Scrii anunțuri premium, orientate spre vânzare rapidă. Ton profesionist dar natural. Nu folosi emoji.

REGULI ABSOLUTE:
- Nu inventa NICIO informație care nu ți-a fost furnizată explicit
- Nu scrie NICIODATĂ fraze negative despre mașină: "posibil uzat", "probabil obosit", "ar putea avea probleme", "uzură normală" — acestea sunt INTERZISE
- Dacă nu știi km, starea, dotările → scrie "Detalii la contact", nu inventa
- Ești un vânzător, nu un auditor — prezinți avantajele, nu speculezi defecte
- "Stare bună" este banală — descrie CONCRET ce știi sau nu menționa starea deloc`

function buildPrompt(d: {
  brand?: string | null
  model?: string | null
  year?: number | null
  fuel?: string | null
  transmission?: string | null
  bodyType?: string | null
  color?: string | null
  mileage?: number | null
  damage?: string | null
  condition?: string | null
  visualDescription?: string
}): string {
  const fields = [
    d.brand && `Marcă: ${d.brand}`,
    d.model && `Model: ${d.model}`,
    d.year && `An fabricație: ${d.year}`,
    d.fuel && `Combustibil: ${d.fuel}`,
    d.transmission && `Cutie viteze: ${d.transmission}`,
    d.bodyType && `Caroserie: ${d.bodyType}`,
    d.color && `Culoare: ${d.color}`,
    d.mileage && `Kilometraj: ${d.mileage.toLocaleString('ro-RO')} km`,
    d.damage && `Stare daune: ${d.damage}`,
    d.condition && `Condiție generală: ${d.condition}`,
    d.visualDescription && `Descriere vizuală: ${d.visualDescription}`,
  ].filter(Boolean).join('\n')

  return `Date mașină detectate din imagine:
${fields || 'Informații vizuale disponibile în descriere'}

Generează un anunț auto profesional, premium, orientat spre vânzare.

STRUCTURĂ OBLIGATORIE:

1. TITLU (max 12 cuvinte)
- atractiv, clar, fără clickbait
- include marcă, model, an și un avantaj cheie

2. DESCRIERE (2-3 paragrafe)
- ton profesionist, dar natural
- scoate în evidență avantajele reale
- subliniază starea mașinii și utilizarea
- creează încredere (întreținere, istoric, seriozitate)

3. PUNCTE CHEIE (bullet points)
- an fabricație
- motorizare
- km (dacă necunoscut → "Detalii la contact")
- dotări importante
- consum (dacă relevant)

4. BENEFICII
- de ce merită cumpărată
- pentru cine e potrivită (oraș, familie, drum lung)

5. CALL TO ACTION
- invită la contact / vizionare
- ton prietenos, fără presiune

REGULI ABSOLUTE:
- NU inventa informații — folosești DOAR ce ți s-a furnizat
- NU folosi expresii banale fără context: "stare bună", "posibil uzat", "uzură normală"
- NU specula niciodată defecte sau probleme
- Scrie ca un vânzător profesionist real, nu ca un robot
- Evită emoji

Returnează DOAR JSON valid, fără markdown:
{
  "title": "titlul anunțului",
  "description": "anunțul complet: DESCRIERE + PUNCTE CHEIE + BENEFICII + CALL TO ACTION, cu linii goale între secțiuni"
}`
}

function tryParse(raw: string) {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) return null
  try { const p = JSON.parse(match[0]); return p.title && p.description ? p : null } catch { return null }
}

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GOOGLE_API_KEY
  if (!key) throw new Error('no_google_key')
  for (const model of ['gemini-2.0-flash', 'gemini-2.0-flash-lite']) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }] }],
            generationConfig: { maxOutputTokens: 900, temperature: 0.35 },
          }),
        }
      )
      if (res.status === 429) { await new Promise(r => setTimeout(r, 3000)); continue }
      if (!res.ok) continue
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (text.trim()) return text
    } catch { continue }
  }
  throw new Error('gemini_failed')
}

async function callGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('no_groq_key')
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.35,
      max_tokens: 900,
    }),
  })
  if (!res.ok) throw new Error(`groq ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const prompt = buildPrompt(body)
    let parsed: any = null

    // Primary: Gemini (Groq e deja folosit de analyze-image, evităm rate limit)
    try {
      parsed = tryParse(await callGemini(prompt))
    } catch { }

    // Fallback: Groq
    if (!parsed) {
      try {
        parsed = tryParse(await callGroq(prompt))
      } catch { }
    }

    if (!parsed) return NextResponse.json({ error: 'all_models_failed' }, { status: 500 })
    return NextResponse.json({ ok: true, title: parsed.title, description: parsed.description })
  } catch (err: any) {
    console.error('[generate-listing]', err)
    return NextResponse.json({ error: err.message || 'server_error' }, { status: 500 })
  }
}
