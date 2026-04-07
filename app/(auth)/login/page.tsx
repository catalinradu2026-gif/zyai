'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { signUpUser, updateProfile, getEmailByPhone } from '@/lib/actions/auth'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [identifier, setIdentifier] = useState('') // email sau telefon
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    setError('')
    setSuccess('')

    if (!identifier || !password) {
      setError('Completează email/telefon și parola!')
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

    try {
      const supabase = createSupabaseBrowserClient()

      if (mode === 'register') {
        // La register, identifier trebuie să fie email
        if (!identifier.includes('@')) {
          setError('La înregistrare folosește adresa de email!')
          setLoading(false)
          return
        }
        const result = await signUpUser(identifier, password, fullName)
        if (result.error) {
          setError(result.error)
          setLoading(false)
          return
        }

        // Auto-login
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: identifier, password })
        if (signInError) {
          setSuccess('Cont creat! Conectează-te acum.')
          setLoading(false)
          return
        }

        // Salvează telefonul dacă a fost completat
        if (phone) {
          await updateProfile({ phone })
        }

        window.location.href = '/'
      } else {
        // Detectează dacă e email sau telefon
        let loginEmail = identifier
        if (!identifier.includes('@')) {
          const result = await getEmailByPhone(identifier)
          if (result.error) {
            setError(result.error)
            setLoading(false)
            return
          }
          loginEmail = result.email!
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({ email: loginEmail, password })

        if (signInError) {
          if (signInError.message.toLowerCase().includes('email not confirmed')) {
            setError('Emailul nu a fost confirmat. Verifică inbox-ul.')
          } else if (signInError.message.toLowerCase().includes('invalid login')) {
            setError('Email sau parolă greșite!')
          } else {
            setError(signInError.message)
          }
          setLoading(false)
          return
        }

        window.location.href = '/'
      }
    } catch (err) {
      setError('Eroare de conexiune. Încearcă din nou.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-2">zyAI</h1>
          <p className="text-center text-gray-600 mb-6">Platformă de anunțuri</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 px-4 font-medium rounded-lg transition ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔓 Conectare
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 px-4 font-medium rounded-lg transition ${
                mode === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ✏️ Înregistrare
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Nume complet *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ion Popescu"
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                {mode === 'register' ? 'Email *' : 'Email sau telefon *'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={mode === 'register' ? 'email@exemplu.com' : 'email@exemplu.com sau +40723...'}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Număr de telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+40 723 123 456"
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <p className="text-xs text-gray-400 mt-1">Opțional — pentru contact direct</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-black">Parolă *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              {mode === 'register' && (
                <p className="text-xs text-gray-400 mt-1">Minim 6 caractere</p>
              )}
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
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading
                ? '⏳ Se procesează...'
                : mode === 'login'
                ? '✓ Conectare'
                : '✓ Creare cont'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
