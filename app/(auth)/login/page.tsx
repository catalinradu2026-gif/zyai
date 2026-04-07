'use client'

import { useState } from 'react'
import { signInWithPhone, signUpWithPhone } from '@/lib/actions/auth'

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLoginClick() {
    if (!phone || !password) {
      setError('Completează toate câmpurile!')
      return
    }

    setLoading(true)
    setError('')

    const result = await signInWithPhone(phone, password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Salvează user ID în localStorage
      localStorage.setItem('user_id', result.userId || '')
      window.location.href = '/'
    }
  }

  async function handleSignUpClick() {
    if (!phone || !password) {
      setError('Completează toate câmpurile!')
      return
    }

    setLoading(true)
    setError('')

    const result = await signUpWithPhone(phone, password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Salvează user ID în localStorage
      localStorage.setItem('user_id', result.userId || '')
      window.location.href = '/'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">zyAI</h1>
          <p className="text-center text-gray-600 mb-8">Platformă de anunțuri</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setTab('login')
                setError('')
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                tab === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Conectare
            </button>
            <button
              onClick={() => {
                setTab('signup')
                setError('')
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                tab === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Înregistrare
            </button>
          </div>

          <div className="space-y-4">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {tab === 'login' && (
              <button
                onClick={handleLoginClick}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Se conectează...' : '🔓 Conectare'}
              </button>
            )}

            {tab === 'signup' && (
              <button
                onClick={handleSignUpClick}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Se înregistrează...' : '✓ Înregistrare'}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-8">
            Prin conectare, accepți termenii și condițiile noastre
          </p>
        </div>
      </div>
    </main>
  )
}
