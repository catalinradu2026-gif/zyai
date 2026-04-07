import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Niciun fișier primit' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `listings/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`

    const buffer = await file.arrayBuffer()
    const { data, error } = await admin.storage
      .from('listings')
      .upload(filename, buffer, { contentType: file.type })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${data.path}`
    return NextResponse.json({ url })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
