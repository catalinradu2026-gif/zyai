'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const nextUrl = searchParams?.get('next') || '/'
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    try {
      // Will redirect to Google OAuth
      window.location.href = '/api/auth/google'
    } catch (err) {
      setError('Eroare la conectare cu Google')
      setLoading(false)
    }
  }

  async function handlePhoneSignIn() {
    if (!phone || !fullName || !password) {
      setError('Completează toate câmpurile!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, fullName, password }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        // Salvează user în localStorage
        localStorage.setItem('user_id', data.userId)
        localStorage.setItem('user_phone', phone)
        localStorage.setItem('user_name', fullName)
        // Redirect to original page or home
        window.location.href = nextUrl
      }
    } catch (err) {
      setError('Eroare la conectare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-2">zyAI</h1>
          <p className="text-center text-gray-600 mb-2">Platformă de anunțuri</p>
          <p className="text-center text-sm text-gray-500 mb-8">One-click login, fără verificări</p>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-800 font-medium rounded-lg transition flex items-center justify-center gap-3 disabled:opacity-50 mb-4"
          >
            <span className="text-2xl">🔵</span>
            {loading ? 'Se conectează...' : 'Conectează cu Google'}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">sau</span>
            </div>
          </div>

          {/* Phone Quick Registration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nume complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Catalin Radu"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Număr de telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+40 723 123 456"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parolă</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handlePhoneSignIn}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Se conectează...' : '✓ Conectare'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-8">
            Prin conectare, accepți <Link href="#" className="text-blue-600 hover:underline">termenii și condițiile</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
