'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { signUpUser } from '@/lib/actions/auth'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    if (!email || !password) {
      setError('Completează email și parola!')
      return
    }
    if (mode === 'register' && !fullName) {
      setError('Completează numele complet!')
      return
    }
    if (password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere!')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const supabase = createSupabaseBrowserClient()

    if (mode === 'register') {
      const result = await signUpUser(email, password, fullName)
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
      // Auto-login după înregistrare
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setSuccess('Cont creat! Te poți conecta acum.')
        setLoading(false)
        return
      }
      window.location.href = '/'
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message.toLowerCase().includes('email not confirmed')) {
          setError('Emailul nu a fost confirmat. Verifică inbox-ul și dă click pe link-ul de confirmare.')
        } else {
          setError(signInError.message || 'Email sau parolă greșite!')
        }
        setLoading(false)
        return
      }

      window.location.href = '/'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-2">zyAI</h1>
          <p className="text-center text-gray-600 mb-2">Platformă de anunțuri</p>
          <p className="text-center text-sm text-gray-500 mb-6">Autentificare cu email</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 px-4 font-medium rounded-lg transition ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔓 Conectare
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
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
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplu.com"
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

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading
                ? 'Se procesează...'
                : mode === 'login'
                ? '✓ Conectare'
                : '✓ Creare cont'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-8">
            Prin conectare accepți termenii și condițiile platformei.
          </p>
        </div>
      </div>
    </main>
  )
}
