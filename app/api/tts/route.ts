// TTS gratuit via Google Translate — voce românească, fără API key
export async function POST(req: Request) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) return new Response('No text', { status: 400 })

    // Limităm la 200 caractere (limita Google Translate TTS)
    const chunk = text.trim().slice(0, 200)
    const encoded = encodeURIComponent(chunk)

    const res = await fetch(
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=ro&client=tw-ob&ttsspeed=0.9`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://translate.google.com/',
        },
      }
    )

    if (!res.ok) {
      console.error('Google TTS error:', res.status)
      return new Response('TTS failed', { status: 502 })
    }

    const audio = await res.arrayBuffer()
    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('TTS route error:', err)
    return new Response('TTS failed', { status: 500 })
  }
}
