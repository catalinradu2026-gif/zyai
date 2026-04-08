import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const body = await req.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
    }

    // Extract filename from URL
    const urlParts = imageUrl.split('/storage/v1/object/public/listings/')
    if (urlParts.length !== 2) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }

    const filename = urlParts[1]

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { error } = await admin.storage
      .from('listings')
      .remove([filename])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: `Delete failed: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete handler error:', err)
    return NextResponse.json({ error: `Server error: ${String(err)}` }, { status: 500 })
  }
}
