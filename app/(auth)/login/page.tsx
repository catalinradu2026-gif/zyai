'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { signUpUser, updateProfile, getEmailByPhone } from '@/lib/actions/auth'
import type { Provider } from '@supabase/supabase-js'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [identifier, setIdentifier] = useState('') // email sau telefon
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<Provider | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleOAuth(provider: Provider) {
    setOauthLoading(provider)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setError(error.message)
    } catch {
      setError('Eroare la conectare. Încearcă din nou.')
    } finally {
      setOauthLoading(null)
    }
  }

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
    if (password.length < 5) {
      setError('Parola trebuie să aibă cel puțin 5 caractere!')
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
    <main className="min-h-screen pt-24 pb-20 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 0 40px rgba(139,92,246,0.1)' }}>
          <h1 className="text-4xl font-black text-center mb-1 gradient-main-text">zyAI</h1>
          <p className="text-center mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>Platformă de anunțuri</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-input)' }}>
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className="flex-1 py-2 px-4 font-semibold rounded-lg transition text-sm"
              style={mode === 'login' ? { background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', color: '#fff' } : { color: 'var(--text-secondary)' }}
            >
              🔓 Conectare
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className="flex-1 py-2 px-4 font-semibold rounded-lg transition text-sm"
              style={mode === 'register' ? { background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', color: '#fff' } : { color: 'var(--text-secondary)' }}
            >
              ✏️ Înregistrare
            </button>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition disabled:opacity-50 font-medium text-sm"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              {oauthLoading === 'google' ? (
                <span className="animate-pulse text-sm">Se conectează...</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continuă cu Google
                </>
              )}
            </button>
            <button
              onClick={() => handleOAuth('facebook')}
              disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition disabled:opacity-50 font-medium text-sm"
              style={{ backgroundColor: '#1877F2', color: '#fff' }}
            >
              {oauthLoading === 'facebook' ? (
                <span className="animate-pulse text-sm">Se conectează...</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Continuă cu Facebook
                </>
              )}
            </button>
            <button
              onClick={() => handleOAuth('apple')}
              disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition disabled:opacity-50 font-medium text-sm"
              style={{ backgroundColor: '#000', color: '#fff' }}
            >
              {oauthLoading === 'apple' ? (
                <span className="animate-pulse text-sm">Se conectează...</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.46 2.208 3.09 3.792 3.029 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
                  Continuă cu Apple
                </>
              )}
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: '1px solid var(--border-subtle)' }} /></div>
              <div className="relative flex justify-center text-sm"><span className="px-3 text-xs" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}>sau</span></div>
            </div>
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Nume complet *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ion Popescu"
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none disabled:opacity-50"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {mode === 'register' ? 'Email *' : 'Email sau telefon *'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={mode === 'register' ? 'email@exemplu.com' : 'email@exemplu.com sau +40723...'}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none disabled:opacity-50"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Număr de telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+40 723 123 456"
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none disabled:opacity-50"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Opțional — pentru contact direct</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Parolă *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none disabled:opacity-50"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              {mode === 'register' && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Minim 6 caractere</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="text-sm" style={{ color: '#FCA5A5' }}>{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <p className="text-sm" style={{ color: '#86EFAC' }}>{success}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 px-4 text-white font-semibold rounded-xl transition hover:scale-[1.02] disabled:opacity-50 text-sm"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
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
