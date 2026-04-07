import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { phone, name } = await req.json()

    if (!phone || !name) {
      return NextResponse.json({ error: 'Phone and name required' }, { status: 400 })
    }

    // Generate simple user ID
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    return NextResponse.json({
      userId,
      phone,
      name,
      method: 'phone',
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
