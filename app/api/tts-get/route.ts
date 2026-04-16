// TTS via GET — pentru <audio src="/api/tts-get?text=..."> pe mobile
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const text = url.searchParams.get('text')?.trim()
    if (!text) return new Response('No text', { status: 400 })

    const chunk = text.slice(0, 200)
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

    if (!res.ok) return new Response('TTS failed', { status: 502 })

    const audio = await res.arrayBuffer()
    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new Response('TTS failed', { status: 500 })
  }
}
