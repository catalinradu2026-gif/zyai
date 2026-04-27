import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { isR2Configured, uploadToR2 } from '@/lib/r2'

export const maxDuration = 60

function makeBgSvg(width: number, height: number, category: string): string {
  const isAuto = category === 'auto'
  const floorY = Math.round(height * 0.67)

  if (isAuto) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0d0d1a"/>
          <stop offset="55%" stop-color="#141428"/>
          <stop offset="100%" stop-color="#0a0a15"/>
        </linearGradient>
        <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1a1a38" stop-opacity="1"/>
          <stop offset="100%" stop-color="#05050f" stop-opacity="1"/>
        </linearGradient>
        <radialGradient id="spotlight" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stop-color="#5050c0" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#0d0d1a" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="floorglow" cx="50%" cy="0%" r="55%">
          <stop offset="0%" stop-color="#2525a0" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#05050f" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${floorY}" fill="url(#wall)"/>
      <rect y="${floorY}" width="${width}" height="${height - floorY}" fill="url(#floor)"/>
      <rect width="${width}" height="${floorY}" fill="url(#spotlight)"/>
      <rect y="${floorY}" width="${width}" height="${height - floorY}" fill="url(#floorglow)"/>
      <line x1="0" y1="${floorY}" x2="${width}" y2="${floorY}" stroke="#3535b0" stroke-width="1.5" stroke-opacity="0.35"/>
    </svg>`
  }

  // Studio curat pentru alte categorii
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="studio" cx="50%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="65%" stop-color="#f2f2f7"/>
        <stop offset="100%" stop-color="#e2e2ec"/>
      </radialGradient>
      <radialGradient id="shadow" cx="50%" cy="105%" r="50%">
        <stop offset="0%" stop-color="#c8c8d8" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#e8e8f2" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#studio)"/>
    <rect width="${width}" height="${height}" fill="url(#shadow)"/>
  </svg>`
}

export async function POST(req: Request) {
  try {
    const { imageUrl, category } = await req.json()
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })

    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'REMOVE_BG_API_KEY not set' }, { status: 500 })

    // Download original
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return NextResponse.json({ error: 'Cannot fetch image' }, { status: 400 })
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer())

    const meta = await sharp(imgBuffer).metadata()
    const width = meta.width || 1000
    const height = meta.height || 750

    // Remove background via remove.bg
    const form = new FormData()
    form.append('image_file', new Blob([imgBuffer], { type: 'image/webp' }), 'image.webp')
    form.append('size', 'auto')

    const rbgRes = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: form,
    })

    if (!rbgRes.ok) {
      const err = await rbgRes.text()
      console.error('[remove-bg]', err)
      return NextResponse.json({ error: 'remove.bg failed' }, { status: 500 })
    }

    const transparentPng = Buffer.from(await rbgRes.arrayBuffer())

    // Composite subject onto professional background
    const bgSvg = Buffer.from(makeBgSvg(width, height, category || 'general'))

    const result = await sharp(bgSvg)
      .composite([{ input: transparentPng, top: 0, left: 0 }])
      .webp({ quality: 85 })
      .toBuffer()

    // Upload
    const now = new Date()
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const path = `${folder}/${uid}_pro.webp`

    let url: string
    if (isR2Configured()) {
      url = await uploadToR2(result, path, 'image/webp')
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      const admin = createClient(supabaseUrl, serviceKey)
      const { error } = await admin.storage
        .from('listings')
        .upload(path, result, { contentType: 'image/webp', cacheControl: '31536000', upsert: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      url = `${supabaseUrl}/storage/v1/object/public/listings/${path}`
    }

    return NextResponse.json({ ok: true, url })
  } catch (err: any) {
    console.error('[remove-bg]', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
