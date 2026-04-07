'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePhoneAuth() {
    if (!phone || !password) {
      setError('Completează telefon și parolă!')
      return
    }

    if (mode === 'register' && !fullName) {
      setError('Completează numele complet!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          fullName: mode === 'register' ? fullName : phone,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || 'Eroare la autentificare')
      } else {
        // Salvează în localStorage
        localStorage.setItem('user_id', data.userId)
        localStorage.setItem('user_phone', phone)
        localStorage.setItem('user_name', data.fullName)
        // Redirect to home
        window.location.href = '/'
      }
    } catch (err) {
      setError('Eroare la conectare. Încercați din nou.')
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
          <p className="text-center text-sm text-gray-500 mb-6">Autentificare cu telefon</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 font-medium rounded-lg transition ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔓 Conectare
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 font-medium rounded-lg transition ${
                mode === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ✏️ Înregistrare
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {mode === 'register' && (
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
            )}

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
              onClick={handlePhoneAuth}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Se procesează...' : mode === 'login' ? '✓ Conectare' : '✓ Înregistrare'}
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
