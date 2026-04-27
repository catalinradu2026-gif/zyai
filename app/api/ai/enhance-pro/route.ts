import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { isR2Configured, uploadToR2 } from '@/lib/r2'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { imageUrl, category } = await req.json()
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })

    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return NextResponse.json({ error: 'Cannot fetch image' }, { status: 400 })
    const inputBuffer = Buffer.from(await imgRes.arrayBuffer())

    const meta = await sharp(inputBuffer).metadata()
    const w = meta.width || 900
    const h = meta.height || 900
    const isAuto = (category || '').toLowerCase() === 'auto'

    // ── Fundal profesional generat cu SVG ──────────────────────────
    const floorY = Math.round(h * 0.67)
    const bgSvg = isAuto
      ? `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wall" x1="0" y1="0" x2="0" y2="${floorY}" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#0d0d1a"/>
              <stop offset="55%" stop-color="#141428"/>
              <stop offset="100%" stop-color="#0a0a15"/>
            </linearGradient>
            <linearGradient id="floor" x1="0" y1="${floorY}" x2="0" y2="${h}" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#1a1a38"/>
              <stop offset="100%" stop-color="#05050f"/>
            </linearGradient>
            <radialGradient id="spot" cx="50%" cy="0%" r="70%">
              <stop offset="0%" stop-color="#5050c0" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="#0d0d1a" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="${w}" height="${floorY}" fill="url(#wall)"/>
          <rect y="${floorY}" width="${w}" height="${h - floorY}" fill="url(#floor)"/>
          <rect width="${w}" height="${floorY}" fill="url(#spot)"/>
          <line x1="0" y1="${floorY}" x2="${w}" y2="${floorY}" stroke="#3535b0" stroke-width="1.5" stroke-opacity="0.3"/>
        </svg>`
      : `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="studio" cx="50%" cy="30%" r="65%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="65%" stop-color="#f0f0f5"/>
              <stop offset="100%" stop-color="#e0e0ea"/>
            </radialGradient>
          </defs>
          <rect width="${w}" height="${h}" fill="url(#studio)"/>
        </svg>`

    const bgBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer()

    // ── Optimizare imagine originală ───────────────────────────────
    const enhanced = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
      .normalize()
      .modulate({ saturation: 1.12, brightness: 1.03 })
      .sharpen({ sigma: 0.8 })
      .toBuffer()

    const enhancedMeta = await sharp(enhanced).metadata()
    const ew = enhancedMeta.width || w
    const eh = enhancedMeta.height || h

    // ── Compune: centrăm produsul pe fundal ────────────────────────
    // Fundal redimensionat la dimensiunea produsului
    const bgResized = await sharp(bgBuffer)
      .resize(ew, eh, { fit: 'cover' })
      .toBuffer()

    const result = await sharp(bgResized)
      .composite([{ input: enhanced, blend: 'over', gravity: 'centre' }])
      .webp({ quality: 60, effort: 6, smartSubsample: true })
      .toBuffer()

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
    console.error('[enhance-pro]', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
