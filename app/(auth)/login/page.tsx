'use client'

import { useState } from 'react'
import { signInWithMagicLink } from '@/lib/actions/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const result = await signInWithMagicLink(email)

    if (result.error) {
      setError(result.error)
    } else {
      setMessage(result.message)
      setEmail('')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">zyAI</h1>
          <p className="text-center text-gray-600 mb-8">Platformă de anunțuri</p>

          {message ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-800 font-semibold">✅ {message}</p>
              <p className="text-sm text-green-700 mt-2">
                Deschide emailul și click pe link-ul magic pentru a te conecta.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplu@email.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Se trimite...' : '🔗 Conectează-te cu magic link'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-600 mt-8">
            Prima dată aici?{' '}
            <Link href="/cont/profil" className="text-blue-600 hover:underline">
              Completează profilul
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
