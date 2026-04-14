import Groq from 'groq-sdk'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCategoryIdBySlug } from '@/lib/constants/categories'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export type ChatListing = {
  id: string
  title: string
  price: number | null
  price_type: string
  currency: string
  city: string
  images: string[]
  created_at: string
}

type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatResponse = {
  type: 'search' | 'chat'
  message: string
  listings?: ChatListing[]
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, history = [] }: { message: string; history: HistoryMessage[] } = body

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Invalid message' }, { status: 400 })
    }
    if (message.length > 500) {
      return Response.json({ error: 'Mesaj prea lung (max 500 caractere)' }, { status: 400 })
    }
    // Validare history — previne prompt injection via history falsificat
    const validHistory = (history as HistoryMessage[]).filter(
      (m) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.length < 1000
    )

    // Fallback simple chat if GROQ_API_KEY is missing
    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not configured')
      return Response.json({
        type: 'chat',
        message: '🤖 Asistentul AI este în configurare. Încearcă din nou în câteva momente!',
      } satisfies ChatResponse)
    }

    // PASUL 1: Groq decide intent + extrage filtre (un singur apel)
    const systemPrompt = `Ești "zyAI", asistentul inteligent al platformei de anunțuri zyAI.ro din România. Ești prietenos, direct și util. Vorbești DOAR în română.

## Platforma zyAI
Marketplace românesc de anunțuri — ca OLX dar cu AI. Utilizatorii pot cumpăra, vinde, închiria, găsi joburi sau servicii.

## Categorii și subcategorii disponibile:
- **joburi**: it-telecom, contabilitate, vanzari, productie, transport, horeca, constructii, medicina, educatie, alte-joburi
- **imobiliare**: apartamente-inchiriere, apartamente-vanzare, case-vanzare, case-inchiriere, terenuri, spatii-comerciale
- **auto**: autoturisme, moto, camioane, piese-auto
- **servicii**: reparatii, curatenie, transport-servicii, it-servicii, alte-servicii
- **electronice**: telefoane, laptopuri, tv, gaming, alte-electronice
- **moda**: haine, incaltaminte, accesorii, copii
- **casa-gradina**: mobila, electrocasnice, gradina, decorare
- **sport**: echipament, biciclete, fitness, outdoor
- **animale**: caini, pisici, accesorii, alte-animale
- **mama-copilul**: haine, jucarii, carucior, mobilier, ingrijire-bebelusi, carti-jocuri, alte-mama-copilul

## Orașe principale România (normalizare):
- "cluj" / "cluj napoca" / "clujul" → Cluj-Napoca
- "buc" / "bucuresti" / "capitala" → București
- "tm" / "timis" / "timisoara" → Timișoara
- "iasi" → Iași
- "constanta" / "constanța" → Constanța
- "brasov" → Brașov
- "craiova" → Craiova
- "galati" → Galați
- "oradea" → Oradea
- "bacau" → Bacău
- "arad" → Arad
- "pitesti" → Pitești
- "sibiu" → Sibiu
- "targu mures" / "tg mures" → Târgu Mureș
- Returnează orașul cu diacritice corecte în "city"

## Cum înțelegi mesajele românești (informal → formal):
- "garsoniera" / "garso" → apartamente-inchiriere sau apartamente-vanzare
- "ap 2 camere" / "2 cam" / "doua camere" → apartamente
- "masina" / "auto" / "bolid" / "rabla" → autoturisme
- "job" / "munca" / "angajare" / "serviciu" / "lucru" → joburi
- "chirie" / "inchiriez" / "de inchiriat" → inchiriere
- "de vanzare" / "vand" / "cumpar" / "vrei sa cumperi" → vanzare
- "telefon" / "smartphone" / "iphone" / "samsung" → telefoane
- "laptop" / "PC" / "calculator" → laptopuri
- "bicicleta" / "bike" → biciclete
- numere cu "€" / "euro" / "eur" → EUR; "lei" / "ron" → RON
- "ieftin" → înseamnă maxPrice mic (relativ la categorie)
- "urgent" → utilizatorul vrea să cumpere/vândă rapid

## Reguli de comportament:
1. Dacă mesajul e CLAR ce caută → intent: "search", extrage filtrele
2. Dacă mesajul e VAGUE sau GENERAL (ex: "ceva ieftin", "vreau sa cumpar") → intent: "clarify", pune o singură întrebare concisă
3. Dacă mesajul e salut, mulțumire, întrebare despre platformă → intent: "chat"
4. Dacă utilizatorul rafineaza o cautare anterioara (ex: "mai ieftin", "in cluj", "doar apartamente") → combina cu contextul din history
5. Dacă mesajul cere PARERE / ANALIZA despre o mașină anume (ex: "ce parere ai despre Dacia Logan", "merită Golf 4", "e bun BMW X5", "analizează Skoda Octavia 2018", "ia iau sau nu", "merita cumparata") → intent: "auto_verdict"

## Ton și stil:
- **Profesional și concis** — ca un consultant imobiliar/auto care știe ce face
- Răspunsuri de 1-2 propoziții maxim pentru chat/clarify
- Nu folosi: "Cu plăcere!", "Desigur!", "Cu siguranță!", "Bineînțeles!" — fraze goale
- Nu folosi emoji excesiv
- Folosește forma de politețe ("Dumneavoastră" / "dvs.") pentru întrebări formale, "tu" pentru informal
- Când găsești → prezintă rezultatele scurt: "Am identificat X anunțuri potrivite..."
- Când nu găsești → sugerezi concret: "Nu am găsit în Cluj. Există 3 anunțuri similare în Brașov — doriți să vedeți?"
- Dacă utilizatorul spune mulțumesc → răspunzi scurt: "Cu plăcere! Mai am ce vă ajuta?"

## Format răspuns (JSON strict, fără markdown):
{
  "intent": "search" | "chat" | "clarify" | "auto_verdict",
  "message": "răspuns în română, scurt și direct",
  "filters": {
    "product": "ce cauta exact (null dacă chat/clarify)",
    "city": "orașul sau null",
    "maxPrice": număr sau null,
    "minPrice": număr sau null,
    "category": "slug-ul categoriei principale sau null",
    "subcategory": "slug-ul subcategoriei sau null",
    "listingType": "vanzare" | "inchiriere" | null,
    "keywords": ["cuvinte", "cheie", "relevante"]
  }
}

## Exemple:
User: "caut ap 2 camere in cluj pana in 400 euro"
→ {"intent":"search","message":"Caut apartamente 2 camere în Cluj până la 400€...","filters":{"product":"apartament 2 camere","city":"Cluj","maxPrice":400,"minPrice":null,"category":"imobiliare","subcategory":"apartamente-inchiriere","listingType":"inchiriere","keywords":["2 camere","apartament"]}}

User: "vreau o masina sub 5000 euro"
→ {"intent":"search","message":"Caut autoturisme sub 5000€...","filters":{"product":"autoturism","city":null,"maxPrice":5000,"minPrice":null,"category":"auto","subcategory":"autoturisme","listingType":"vanzare","keywords":["masina","auto"]}}

User: "ceva ieftin"
→ {"intent":"clarify","message":"Ce anume cauți? (apartament, mașină, job, telefon...)","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":null,"subcategory":null,"listingType":null,"keywords":[]}}

User: "salut"
→ {"intent":"chat","message":"Salut! Spune-mi ce cauți și găsim împreună cel mai bun anunț.","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":null,"subcategory":null,"listingType":null,"keywords":[]}}

User: "ce parere ai despre Dacia Logan 2015"
→ {"intent":"auto_verdict","message":"","filters":{"product":null,"city":null,"maxPrice":null,"minPrice":null,"category":null,"subcategory":null,"listingType":null,"keywords":[]}}`

    // Construieste mesajele cu history validat (max ultimele 6 pentru context)
    const recentHistory = validHistory.slice(-6)

    let rawText = ''
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentHistory,
          { role: 'user', content: message },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 400,
      })

      rawText = completion.choices[0].message.content || '{}'
    } catch (groqError) {
      console.error('Groq error:', groqError)
      // Fallback - just return simple chat
      return Response.json({
        type: 'chat',
        message: '🤖 Asistentul AI are o problemă temporară. Încearcă din nou în câteva secunde!',
      } satisfies ChatResponse)
    }

    // Parseaza raspunsul JSON de la Groq
    let parsed: {
      intent: 'search' | 'chat' | 'clarify' | 'auto_verdict'
      message: string
      filters: {
        product: string | null
        city: string | null
        maxPrice: number | null
        minPrice: number | null
        category: string | null
        subcategory: string | null
        listingType: 'vanzare' | 'inchiriere' | null
        keywords: string[]
      }
    }

    try {
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      // Extrage obiectul JSON chiar dacă modelul adaugă text înainte/după
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('no JSON found')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return Response.json({
        type: 'chat',
        message: 'Sunt aici să te ajut! Spune-mi ce cauți — apartament, mașină, job, telefon...',
      } satisfies ChatResponse)
    }

    // Intent "auto_verdict" — analiză expert mașină
    if (parsed.intent === 'auto_verdict') {
      const autoExpertPrompt = `Ești un expert auto profesionist, obiectiv și sincer, specializat pe piața românească second-hand.

Rolul tău este să analizezi mașini și să oferi un "AI VERDICT" clar, scurt și util.

Reguli stricte:
- Fii SPECIFIC la problemele REALE ale modelului respectiv (nu generic)
- Ține cont de piața românească: service, disponibilitate piese, prețuri uzuale OLX/autovit
- Dacă sunt mai mulți ani/versiuni cu diferențe importante, menționează-le scurt
- Maxim 280 cuvinte total
- Vorbești DOAR în română, fără markdown, fără bold, fără asteriscuri
- Folosește EXACT structura de mai jos, cu emoji-urile indicate

Structura răspunsului (respectă EXACT):

🔎 ANALIZĂ RAPIDĂ:
- Tip mașină: [sedan/suv/break/hatchback/monovolum]
- Puncte forte: [max 3, concret]
- Probleme cunoscute: [max 3, specific acestui model]

💸 COSTURI:
- Consum: [oraș/drum ex: 9/6 L/100km]
- Întreținere: [ieftină/medie/scumpă + motiv scurt]
- Piese: [ușor de găsit și ieftine / medii / scumpe și rare]

⚠️ RISCURI:
- [2-3 riscuri specifice, concrete]

🧠 AI VERDICT: [EXACT unul din: 🔥 MERITĂ / ⚖️ DEPINDE / ❌ NU MERITĂ]

📊 SCOR FINAL: [număr]/10

🗣 RECOMANDARE:
[2-3 propoziții directe, ca pentru un prieten care vrea să cumpere această mașină în România]`

      let verdictText = ''
      try {
        const verdictCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: autoExpertPrompt },
            { role: 'user', content: message },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 700,
        })
        verdictText = verdictCompletion.choices[0].message.content || ''
      } catch (e) {
        console.error('auto_verdict groq error:', e)
        verdictText = 'Nu am putut analiza mașina în acest moment. Încearcă din nou.'
      }

      return Response.json({
        type: 'chat',
        message: verdictText,
      } satisfies ChatResponse)
    }

    // Intent "clarify" — pune întrebare fără căutare
    if (parsed.intent === 'clarify') {
      return Response.json({
        type: 'chat',
        message: parsed.message || 'Ce anume cauți mai exact?',
      } satisfies ChatResponse)
    }

    // PASUL 2: Daca intent este "search", cauta in Supabase
    if (parsed.intent === 'search') {
      const supabase = await createSupabaseServerClient()
      const f = parsed.filters

      // Construieste query de baza
      const buildQuery = (strict: boolean) => {
        let q = supabase
          .from('listings')
          .select('id, title, price, price_type, currency, city, images, created_at')
          .eq('status', 'activ')
          .order('created_at', { ascending: false })
          .limit(6)

        // Filtru categorie
        if (f.category) {
          const categoryId = getCategoryIdBySlug(f.category)
          if (categoryId) q = q.eq('category_id', categoryId)
        }

        // Filtru oras — cautare flexibila (Cluj → Cluj-Napoca)
        if (f.city) {
          q = q.ilike('city', `%${f.city}%`)
        }

        // Filtru pret
        if (f.maxPrice && f.maxPrice > 0) q = q.lte('price', f.maxPrice)
        if (f.minPrice && f.minPrice > 0) q = q.gte('price', f.minPrice)

        // Filtru titlu — strict: product exact, relaxat: orice keyword
        if (strict && f.product) {
          q = q.ilike('title', `%${f.product}%`)
        } else if (!strict && f.keywords && f.keywords.length > 0) {
          // Incearca primul keyword
          q = q.ilike('title', `%${f.keywords[0]}%`)
        }

        return q
      }

      // Incercare 1: toate filtrele cu product
      let { data: listings, error } = await buildQuery(true)

      // Incercare 2: daca 0 rezultate, relaxeaza — scoate orasul
      if (!listings || listings.length === 0) {
        let q2 = supabase
          .from('listings')
          .select('id, title, price, price_type, currency, city, images, created_at')
          .eq('status', 'activ')
          .order('created_at', { ascending: false })
          .limit(6)

        if (f.category) {
          const categoryId = getCategoryIdBySlug(f.category)
          if (categoryId) q2 = q2.eq('category_id', categoryId)
        }
        if (f.maxPrice && f.maxPrice > 0) q2 = q2.lte('price', f.maxPrice)
        if (f.minPrice && f.minPrice > 0) q2 = q2.gte('price', f.minPrice)
        if (f.product) q2 = q2.ilike('title', `%${f.product}%`)

        const { data: r2 } = await q2
        listings = r2
      }

      // Incercare 3: doar categorie + pret (fara text search)
      if (!listings || listings.length === 0) {
        let q3 = supabase
          .from('listings')
          .select('id, title, price, price_type, currency, city, images, created_at')
          .eq('status', 'activ')
          .order('created_at', { ascending: false })
          .limit(6)

        if (f.category) {
          const categoryId = getCategoryIdBySlug(f.category)
          if (categoryId) q3 = q3.eq('category_id', categoryId)
        }
        if (f.maxPrice && f.maxPrice > 0) q3 = q3.lte('price', f.maxPrice)
        if (f.minPrice && f.minPrice > 0) q3 = q3.gte('price', f.minPrice)

        const { data: r3 } = await q3
        listings = r3
      }

      // Incercare 4: keyword fallback din lista keywords
      if ((!listings || listings.length === 0) && f.keywords && f.keywords.length > 1) {
        const { data: r4 } = await supabase
          .from('listings')
          .select('id, title, price, price_type, currency, city, images, created_at')
          .eq('status', 'activ')
          .ilike('title', `%${f.keywords[1]}%`)
          .order('created_at', { ascending: false })
          .limit(6)
        listings = r4
      }

      if (error) console.error('Supabase search error:', error)

      const count = listings?.length ?? 0
      const cityText = f.city ? ` în ${f.city}` : ''
      const priceText = f.maxPrice ? ` până la ${f.maxPrice}€` : ''

      const resultMessage =
        count > 0
          ? `${parsed.message || `Am găsit ${count} anunț${count !== 1 ? 'uri' : ''}${cityText}${priceText}.`} Apasă pe orice anunț pentru detalii.`
          : `Nu am găsit nimic pentru "${f.product || f.keywords?.[0] || 'căutarea ta'}"${cityText}. Încearcă fără filtru de oraș sau mărind bugetul.`

      return Response.json({
        type: 'search',
        message: resultMessage,
        listings: listings ?? [],
      } satisfies ChatResponse)
    }

    // PASUL 3: Raspuns conversational
    return Response.json({
      type: 'chat',
      message: parsed.message || 'Sunt aici să te ajut! Spune-mi ce cauți.',
    } satisfies ChatResponse)
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
