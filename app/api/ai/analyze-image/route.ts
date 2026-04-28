import { NextResponse } from 'next/server'

export const maxDuration = 45

async function fetchImageBase64(imageUrl: string): Promise<{ b64: string; mimeType: string }> {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`img_fetch: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  // Resize to max 1024px to avoid token limit issues with Gemini
  try {
    const sharp = (await import('sharp')).default
    const resized = await sharp(buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
    return { b64: resized.toString('base64'), mimeType: 'image/jpeg' }
  } catch {
    return { b64: buffer.toString('base64'), mimeType: res.headers.get('content-type') || 'image/jpeg' }
  }
}

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash-preview-05-20']

async function callGeminiText(prompt: string): Promise<string> {
  const key = process.env.GOOGLE_API_KEY
  if (!key) throw new Error('no_google_key')
  const errors: string[] = []

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 900, temperature: 0.1 },
          }),
        }
      )
      if (res.status === 429) { await new Promise(r => setTimeout(r, 3000)); continue }
      if (!res.ok) { errors.push(`${model}: ${res.status}`); continue }
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (text.trim()) return text
    } catch (e: any) {
      errors.push(`${model}: ${e?.message?.slice(0, 60)}`)
    }
  }
  throw new Error('gemini_text_failed: ' + errors.join(' | '))
}

async function callGeminiVision(imageUrl: string, prompt: string): Promise<string> {
  const key = process.env.GOOGLE_API_KEY
  if (!key) throw new Error('no_google_key')
  const { b64, mimeType } = await fetchImageBase64(imageUrl)
  const errors: string[] = []

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inlineData: { data: b64, mimeType } }] }],
            generationConfig: { maxOutputTokens: 600, temperature: 0.1 },
          }),
        }
      )
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 4000))
        // retry same model once
        const res2 = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }, { inlineData: { data: b64, mimeType } }] }],
              generationConfig: { maxOutputTokens: 600, temperature: 0.1 },
            }),
          }
        )
        if (!res2.ok) { errors.push(`${model}: ${res2.status}`); continue }
        const data2 = await res2.json()
        const text2 = data2.candidates?.[0]?.content?.parts?.[0]?.text || ''
        if (text2.trim()) return text2
        continue
      }
      if (!res.ok) { errors.push(`gemini_error(${model}): ${(await res.text()).slice(0, 100)}`); continue }
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (text.trim()) return text
    } catch (e: any) {
      errors.push(`${model}: ${e?.message?.slice(0, 60)}`)
    }
  }
  throw new Error(errors.join(' | '))
}

function buildImageContent(imageData: string, prompt: string) {
  return [
    { type: 'text', text: prompt },
    { type: 'image_url', image_url: { url: imageData } },
  ]
}

// Two-pass approach: first free-form description, then structured extraction
const PASS1_PROMPT = `Ești un expert inspector auto și evaluator cu 20 ani experiență. Analizează EXTREM DE ATENT această imagine.

Dacă este o MAȘINĂ, identifică obligatoriu:
1. MARCA EXACTĂ — citește emblema/logo-ul de pe grila față sau portbagaj (BMW, Mercedes-Benz, Audi, Volkswagen, Dacia, Renault etc.)
2. MODELUL SPECIFIC — nu doar "sedan", ci BMW Seria 5, Mercedes Clasa C, Audi A4, VW Passat, Dacia Logan etc. Analizează forma farurilor, grilei, silueta caroseriei.
3. GENERAȚIA/ANUL ESTIMAT — din designul farurilor și grilei: ex. BMW F10 (2010-2016), BMW G30 (2017-2023), Mercedes W213 (2016-prezent)
4. CULOAREA EXACTĂ — negru, albastru navy, gri antracit, alb perlat etc. Nu specula, descrie ce vezi.
5. CAROSERIA — sedan, SUV, hatchback, break, coupé, monovolum
6. DOTĂRI VIZIBILE — jante aliaj (dimensiune estimată), faruri LED/xenon/adaptive, trapa panoramică, bare de protecție sport, oglinzi rabatabile electric, spoiler
7. STAREA CAROSERIEI — descrie CONCRET ce observi: vopsea lucioasă, zgârieturi vizibile, deformări, sau nimic observabil
8. PLĂCUȚA — citește dacă e vizibilă

Pentru ALTE PRODUSE: identifică marca, modelul, culoarea, starea și orice detalii vizibile.

Răspunde în română, 5-7 propoziții specifice și detaliate. Fii precis, nu specula.`

const PASS2_PROMPT = (description: string) => `Ești expert evaluator auto și vânzător profesionist. Bazat pe această descriere vizuală:
"${description.replace(/"/g, "'")}"

Răspunde NUMAI cu JSON valid, fără markdown, fără text în afara JSON-ului.

Pentru categoria AUTO, câmpul "description" trebuie să fie anunțul complet profesional structurat astfel:
[2-3 paragrafe despre mașină: ce este, dotări vizibile, pentru cine e potrivită]

PUNCTE CHEIE:
- An fabricație: [valoare sau Detalii la contact]
- Motor: [combustibil, transmisie]
- Km: Detalii la contact
- Dotări: [ce se vede: jante aliaj, faruri LED/xenon, trapă, etc.]

BENEFICII:
- [motiv concret 1]
- [motiv concret 2]

Contactați-mă pentru detalii și o vizionare fără obligații.

Format JSON exact (description e string cu \\n pentru linii noi):
{"title":"BMW Seria 5 520d 2014 Albastru Navy","description":"Audi Q7 3.0 TDI quattro, unul dintre cele mai capabile SUV-uri premium de pe piata. Caroseria neagra lucioasa este impecabila vizual, cu jante aliaj de dimensiuni generoase si faruri full-LED ce confera un aspect autoritar si modern.\\n\\nMasina este echipata cu tractiune integrala quattro, cutie automata si motor diesel puternic, potrivita atat pentru drumuri lungi cat si pentru traficul urban.\\n\\nPUNCTE CHEIE:\\n- An fabricatie: Detalii la contact\\n- Motor: 3.0 TDI, automata, quattro\\n- Km: Detalii la contact\\n- Dotari: Jante aliaj, faruri LED, SUV 7 locuri\\n\\nBENEFICII:\\n- Spatiu generos pentru familie sau bagaje\\n- Tractiune integrala pentru siguranta in orice conditii\\n\\nContactati-ma pentru detalii si o vizionare fara obligatii. Raspund rapid.","category":"auto","subcategory":"autoturisme","condition":"Ca nou","brand":"Audi","tags":["audi","q7","diesel","suv"],"confidence":0.9,"details":{"auto":{"model":"Q7","year":null,"mileage":null,"fuel":"diesel","transmission":"automata","bodyType":"suv","damage":"neaccidentat","color":"negru"},"imobiliare":{"propertyType":null,"rooms":null,"area":null,"floor":null,"furnishing":null,"transactionType":null},"electronice":{"model":null,"storage":null,"color":null,"accessories":null},"general":{"size":null,"material":null,"quantity":null}}}

Reguli:
- title: marca + model specific + an (daca se stie) + culoare, max 60 caractere
- Pentru AUTO description: anunt complet profesional ca in exemplu, cu \\n intre sectiuni
- Pentru alte categorii description: 150-250 caractere cu dotari concrete
- INTERZIS: "stare buna", "posibil uzat", "fara defecte" — descrie CE VEZI concret
- null pentru valorile necunoscute, nu inventa niciodata
- category: auto, imobiliare, electronice, moda, casa-gradina, sport, animale, mama-copilul, servicii, joburi
- condition: Nou, Ca nou, Bun, Acceptabil, Necesita reparatii`

async function callGroq(model: string, messages: any[], maxTokens: number, retries = 1): Promise<string> {
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

  if (response.status === 429) {
    throw new Error(`rate_limit`)
  }

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`groq_error: ${err.slice(0, 200)}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

const VISION_MODELS = [
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
]

const TEXT_MODELS = [
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
  'llama3-8b-8192',
]

export async function POST(req: Request) {
  try {
    const { imageUrl, imageBase64 } = await req.json()
    if (!imageUrl && !imageBase64) {
      return NextResponse.json({ error: 'imageUrl or imageBase64 required' }, { status: 400 })
    }

    // Prefer passing URL directly to Groq (avoids large base64 payloads).
    // Fall back to base64 only if explicitly provided or URL-mode fails.
    const directUrl = imageBase64 ? null : (imageUrl || '').replace(/[\x00-\x1f\x7f]/g, '').trim()
    let imageData: string = imageBase64 || directUrl || ''

    // Pass 1: free-form visual description — Gemini first, Groq fallback
    let description = ''
    const pass1Errors: string[] = []

    // Primary: Groq vision (rapid, cheia nouă)
    for (const model of VISION_MODELS) {
      try {
        description = await callGroq(model, [
          { role: 'user', content: buildImageContent(imageData, PASS1_PROMPT) },
        ], 500)
        if (description.trim()) break
      } catch (e: any) {
        pass1Errors.push(`${model}: ${e?.message?.slice(0, 80)}`)
      }
    }

    // Fallback: Gemini vision
    if (!description.trim() && directUrl) {
      try {
        description = await callGeminiVision(directUrl, PASS1_PROMPT)
      } catch (e: any) {
        pass1Errors.push(`gemini: ${e?.message?.slice(0, 80)}`)
      }
    }

    if (!description.trim()) {
      return NextResponse.json({ error: 'vision_failed', detail: pass1Errors.join(' || ') }, { status: 500 })
    }

    // Pass 2: structured JSON extraction — Gemini first, Groq fallback
    let parsed: any = null
    const pass2Errors: string[] = []

    function tryParseJson(raw: string): any | null {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) return null
      try { return JSON.parse(match[0]) } catch { return null }
    }

    // Primary: Gemini text (generous free tier, no rate limit issues)
    try {
      const raw = await callGeminiText(PASS2_PROMPT(description))
      parsed = tryParseJson(raw)
      if (!parsed) pass2Errors.push(`gemini_text: no JSON`)
    } catch (e: any) {
      pass2Errors.push(`gemini_text: ${e?.message?.slice(0, 80)}`)
    }

    // Fallback: Groq text
    if (!parsed) {
      for (const model of TEXT_MODELS) {
        try {
          const raw = await callGroq(model, [{ role: 'user', content: PASS2_PROMPT(description) }], 800)
          parsed = tryParseJson(raw)
          if (parsed) break
          pass2Errors.push(`${model}: no JSON`)
        } catch (e: any) {
          pass2Errors.push(`${model}: ${e?.message?.slice(0, 60)}`)
        }
      }
    }

    // Last resort: basic template so user can continue
    if (!parsed) {
      const isAuto = (description || '').toLowerCase().includes('maș') ||
        (description || '').toLowerCase().includes('auto') ||
        (description || '').toLowerCase().includes('car')
      parsed = {
        title: isAuto ? 'Autoturism de vânzare' : 'Produs de vânzare',
        description: description?.slice(0, 300) || '',
        category: isAuto ? 'auto' : 'general',
        subcategory: null, condition: 'Bun', brand: null, tags: [],
        confidence: 0.3,
        details: { auto: { model: null, year: null, mileage: null, fuel: null, transmission: null, bodyType: null, damage: null, color: null }, imobiliare: { propertyType: null, rooms: null, area: null, floor: null, furnishing: null, transactionType: null }, electronice: { model: null, storage: null, color: null, accessories: null }, general: { size: null, material: null, quantity: null } }
      }
    }

    return NextResponse.json({ ok: true, result: { ...parsed, _visualDescription: description } })
  } catch (err) {
    console.error('[analyze-image] unexpected:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
