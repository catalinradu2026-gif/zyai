import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { phone, fullName, password } = await req.json()

    if (!phone || !fullName || !password) {
      return NextResponse.json(
        { error: 'Completează toate câmpurile!' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Parola trebuie să aibă cel puțin 6 caractere!' },
        { status: 400 }
      )
    }

    // Generate simple user ID
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    // Set httpOnly cookie with user ID
    const response = NextResponse.json({
      userId,
      phone,
      fullName,
    })

    response.cookies.set('user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
