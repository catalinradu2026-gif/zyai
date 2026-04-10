import { NextResponse } from 'next/server'

export const maxDuration = 30

async function toBase64DataUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`fetch image failed: ${res.status}`)
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const buffer = await res.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return `data:${contentType};base64,${base64}`
}

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) return NextResponse.json({ error: 'no api key' }, { status: 500 })

    // Convert to base64 so Groq doesn't need to fetch the URL directly
    let imageData: string
    try {
      imageData = await toBase64DataUrl(imageUrl)
    } catch (e: any) {
      console.error('[analyze-image] could not fetch image:', e?.message)
      return NextResponse.json({ error: 'cannot_fetch_image', detail: e?.message }, { status: 400 })
    }

    const prompt = `Ești un expert în evaluarea produselor pentru marketplace românesc.
Analizează această imagine și returnează DOAR un JSON valid, fără text suplimentar, fără markdown, fără backticks.

Returnează exact acest format JSON:
{
  "title": "titlu scurt și clar al produsului (max 60 caractere)",
  "description": "descriere detaliată și atractivă în română (150-250 caractere), menționează starea vizibilă, caracteristici principale",
  "category": "una din: auto | imobiliare | electronice | moda | casa-gradina | sport | animale | mama-copilul | servicii | joburi",
  "subcategory": "subcategoria cea mai potrivită (slug simplu, ex: telefoane, laptopuri, mobila, haine-femei, caini, etc.)",
  "condition": "Nou | Ca nou | Bun | Acceptabil | Necesită reparații",
  "brand": "marca produsului dacă e vizibilă, altfel null",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.9
}

Reguli stricte:
- title: fii specific (ex: "iPhone 14 Pro 256GB Space Black" nu "Telefon mobil")
- description: scrie ca un vânzător profesionist, menționează ce se vede în imagine
- category: alege STRICT una din lista de mai sus
- confidence: 0-1 cât de sigur ești de analiză`

    // Only vision-capable models available on Groq
    const models = [
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'meta-llama/llama-4-maverick-17b-128e-instruct',
    ]

    let parsed: any = null
    let lastError = ''

    for (const model of models) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: imageData } },
                ],
              },
            ],
            temperature: 0.2,
            max_tokens: 600,
          }),
        })

        if (!response.ok) {
          const errText = await response.text()
          console.error(`[analyze-image] ${model} error:`, errText)
          lastError = errText
          continue
        }

        const data = await response.json()
        const raw = data.choices?.[0]?.message?.content || ''

        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
          break
        }
      } catch (e: any) {
        console.error(`[analyze-image] ${model} threw:`, e?.message)
        lastError = e?.message || 'unknown'
        continue
      }
    }

    if (!parsed) {
      console.error('[analyze-image] all models failed, last error:', lastError)
      return NextResponse.json({ error: 'all_models_failed', detail: lastError }, { status: 500 })
    }

    return NextResponse.json({ ok: true, result: parsed })
  } catch (err) {
    console.error('[analyze-image] unexpected:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
