import { NextResponse } from 'next/server'

export const maxDuration = 45

async function toBase64DataUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`fetch image failed: ${res.status}`)
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const buffer = await res.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return `data:${contentType};base64,${base64}`
}

// Two-pass approach: first free-form description, then structured extraction
const PASS1_PROMPT = `Ești un expert în identificarea produselor. Uită-te FOARTE ATENT la această imagine.

Descrie tot ce vezi în detaliu:
1. Ce tip de produs este? (mașină, telefon, laptop, mobilă, haină etc.)
2. Există text, logo-uri, embleme, mărci vizibile? Citește-le EXACT.
3. Pentru mașini: ce logo/emblemă are pe grătarul față sau pe portbagaj? Ce formă are caroseria?
4. Pentru electronice: ce scrie pe dispozitiv? Ce model pare a fi?
5. Ce culoare are? Ce stare (nou/vechi/uzat)?
6. Orice alte detalii relevante (an estimat, accesorii, defecte vizibile).

Răspunde în română, liber, 3-5 propoziții.`

const PASS2_PROMPT = (description: string) => `Pe baza acestei descrieri a unei imagini de produs:

"${description}"

Returnează DOAR un JSON valid (fără text, fără markdown, fără backticks) în exact acest format:
{
  "title": "titlu SPECIFIC max 60 caractere — ex: 'VW Golf 7 2016 Diesel Gri' sau 'iPhone 14 Pro 256GB Negru', NU titluri generice",
  "description": "descriere vânzător profesionist în română, 150-250 caractere, menționează starea și caracteristici cheie",
  "category": "auto | imobiliare | electronice | moda | casa-gradina | sport | animale | mama-copilul | servicii | joburi",
  "subcategory": "auto→autoturisme/autoutilitare/motociclete/piese; electronice→telefoane/laptopuri/tablete/tv-audio/desktop; moda→haine/incaltaminte/genti/bijuterii; altele→slug simplu",
  "condition": "Nou | Ca nou | Bun | Acceptabil | Necesită reparații",
  "brand": "marca exactă sau null",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.0,
  "details": {
    "auto": {
      "model": "model exact (ex: Golf 7, Logan, Focus) sau null",
      "year": null,
      "mileage": null,
      "fuel": "benzina | diesel | hibrid | electric | gaz | null",
      "transmission": "manuala | automata | null",
      "bodyType": "sedan | suv | hatchback | combi | mpv | coupe | cabrio | pickup | null",
      "damage": "neaccidentat | accident-minor | accident-major | null",
      "color": "culoarea exactă sau null"
    },
    "imobiliare": {
      "propertyType": "apartament | casa | teren | spatiu-comercial | birou | garaj | null",
      "rooms": null,
      "area": null,
      "floor": null,
      "furnishing": "neamenajat | partial | complet | null",
      "transactionType": "inchiriere | vanzare | null"
    },
    "electronice": {
      "model": "model exact sau null",
      "storage": null,
      "color": null,
      "accessories": null
    },
    "general": {
      "size": null,
      "material": null,
      "quantity": null
    }
  }
}`

async function callGroq(model: string, messages: any[], maxTokens: number): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) throw new Error('no_groq_key')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.1,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`groq_error: ${err.slice(0, 200)}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

const VISION_MODELS = [
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'meta-llama/llama-4-scout-17b-16e-instruct',
]

const TEXT_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
]

export async function POST(req: Request) {
  try {
    const { imageUrl, imageBase64 } = await req.json()
    if (!imageUrl && !imageBase64) {
      return NextResponse.json({ error: 'imageUrl or imageBase64 required' }, { status: 400 })
    }

    let imageData: string
    if (imageBase64) {
      imageData = imageBase64
    } else {
      try {
        imageData = await toBase64DataUrl(imageUrl)
      } catch (e: any) {
        return NextResponse.json({ error: 'cannot_fetch_image', detail: e?.message }, { status: 400 })
      }
    }

    // Pass 1: free-form visual description with vision model
    let description = ''
    for (const model of VISION_MODELS) {
      try {
        description = await callGroq(model, [
          {
            role: 'user',
            content: [
              { type: 'text', text: PASS1_PROMPT },
              { type: 'image_url', image_url: { url: imageData } },
            ],
          },
        ], 400)
        if (description.trim()) break
      } catch (e: any) {
        console.error(`[analyze-image] pass1 ${model}:`, e?.message)
      }
    }

    if (!description.trim()) {
      return NextResponse.json({ error: 'vision_failed' }, { status: 500 })
    }

    // Pass 2: structured JSON extraction with text model (more reliable JSON output)
    let parsed: any = null

    // First try text model for better JSON reliability
    for (const model of TEXT_MODELS) {
      try {
        const raw = await callGroq(model, [
          {
            role: 'user',
            content: PASS2_PROMPT(description),
          },
        ], 700)
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
          break
        }
      } catch (e: any) {
        console.error(`[analyze-image] pass2 text ${model}:`, e?.message)
      }
    }

    // Fallback: vision model for pass2 if text models fail
    if (!parsed) {
      for (const model of VISION_MODELS) {
        try {
          const raw = await callGroq(model, [
            {
              role: 'user',
              content: [
                { type: 'text', text: PASS2_PROMPT(description) },
                { type: 'image_url', image_url: { url: imageData } },
              ],
            },
          ], 700)
          const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0])
            break
          }
        } catch (e: any) {
          console.error(`[analyze-image] pass2 vision ${model}:`, e?.message)
        }
      }
    }

    if (!parsed) {
      return NextResponse.json({ error: 'all_models_failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, result: parsed })
  } catch (err) {
    console.error('[analyze-image] unexpected:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
