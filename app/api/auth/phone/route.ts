import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

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

    // Generează user ID stabil bazat pe phone
    // Hash-ul asigură că același number dă același ID
    const hash = crypto.createHash('sha256')
    hash.update(phone + ':' + (new Date().getFullYear() * 12 + new Date().getMonth()))
    const userId = 'user_' + hash.digest('hex').substring(0, 16)

    const response = NextResponse.json({
      userId,
      phone,
      fullName,
    })

    // Setează cookie non-httpOnly (accesibil din JS)
    response.cookies.set('user_id', userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
