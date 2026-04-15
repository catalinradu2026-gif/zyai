import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import sharp from 'sharp'

export const maxDuration = 60

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const FULL_MAX_WIDTH = 1000
const FULL_QUALITY = 70
const THUMB_WIDTH = 300
const THUMB_QUALITY = 65

export async function POST(req: NextRequest) {
  try {
    // Autentificare
    const supabaseAuth = await createSupabaseServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Configurare lipsă' }, { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'Niciun fișier primit' }, { status: 400 })
    }

    // Validare tip
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format neacceptat. Folosește JPG sau PNG.' }, { status: 400 })
    }

    // Validare dimensiune originală (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fișier prea mare (max 5MB)' }, { status: 400 })
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer())

    // Generează un ID unic pentru ambele variante
    const now = new Date()
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    // ── Procesare imagine full (1000px, WebP, q70) ──
    const fullBuffer = await sharp(inputBuffer)
      .resize({ width: FULL_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: FULL_QUALITY })
      .toBuffer()

    // ── Procesare thumbnail (300px, WebP, q65) ──
    const thumbBuffer = await sharp(inputBuffer)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer()

    const fullPath = `${folder}/${uid}.webp`
    const thumbPath = `${folder}/${uid}_thumb.webp`

    // Upload imagine full
    const { error: fullErr } = await admin.storage
      .from('listings')
      .upload(fullPath, fullBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 an cache
        upsert: false,
      })
    if (fullErr) {
      console.error('Upload full error:', fullErr)
      return NextResponse.json({ error: `Upload eșuat: ${fullErr.message}` }, { status: 500 })
    }

    // Upload thumbnail
    const { error: thumbErr } = await admin.storage
      .from('listings')
      .upload(thumbPath, thumbBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      })
    if (thumbErr) {
      console.error('Upload thumb error:', thumbErr)
      // Thumbnail opțional — nu blocăm dacă eșuează
    }

    const baseUrl = `${supabaseUrl}/storage/v1/object/public/listings`
    const url = `${baseUrl}/${fullPath}`
    const thumbUrl = thumbErr ? null : `${baseUrl}/${thumbPath}`

    return NextResponse.json({ url, thumbUrl, path: fullPath })
  } catch (err) {
    console.error('Upload handler error:', err)
    return NextResponse.json({ error: 'Eroare internă server' }, { status: 500 })
  }
}
