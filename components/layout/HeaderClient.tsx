'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { signOut, updateProfile } from '@/lib/actions/auth'

interface User {
  id: string
  email: string
  full_name: string
}

export default function HeaderClient() {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Onboarding modal state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [obName, setObName] = useState('')
  const [obPhone, setObPhone] = useState('')
  const [obCity, setObCity] = useState('')
  const [obLoading, setObLoading] = useState(false)
  const [obError, setObError] = useState('')

  useEffect(() => {
    setMounted(true)
    const supabase = createSupabaseBrowserClient()

    async function checkUser(u: any) {
      if (!u) { setUser(null); return }

      setUser({
        id: u.id,
        email: u.email || '',
        full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Cont',
      })

      // Check if profile is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', u.id)
        .single()

      if (!profile?.phone?.trim() || !profile?.full_name?.trim()) {
        setObName(profile?.full_name || u.user_metadata?.full_name || '')
        setShowOnboarding(true)
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => checkUser(user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkUser(session.user)
      } else {
        setUser(null)
        setShowOnboarding(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleOnboardingSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!obName.trim()) { setObError('Numele este obligatoriu'); return }
    if (!obPhone.trim()) { setObError('Telefonul este obligatoriu'); return }
    setObLoading(true)
    setObError('')
    const result = await updateProfile({ full_name: obName.trim(), phone: obPhone.trim(), city: obCity.trim() })
    if (result.error) {
      setObError(result.error)
      setObLoading(false)
    } else {
      setShowOnboarding(false)
      setUser(prev => prev ? { ...prev, full_name: obName.trim() } : prev)
    }
    setObLoading(false)
  }

  if (!mounted) return null

  return (
    <>
      {/* Onboarding Modal */}
      {showOnboarding && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-8 space-y-5 my-auto"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

            <div className="text-center space-y-2">
              <div className="text-4xl">👋</div>
              <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Bine ai venit!</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Completează datele de contact ca vânzătorii să te poată găsi
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>👤 Nume complet *</label>
                <input
                  type="text"
                  value={obName}
                  onChange={(e) => setObName(e.target.value)}
                  placeholder="Ion Popescu"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>📞 Număr de telefon *</label>
                <input
                  type="tel"
                  value={obPhone}
                  onChange={(e) => setObPhone(e.target.value)}
                  placeholder="+40 723 123 456"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>📍 Orașul tău</label>
                <input
                  type="text"
                  value={obCity}
                  onChange={(e) => setObCity(e.target.value)}
                  placeholder="ex: București, Cluj, Timișoara..."
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              {obError && (
                <p className="text-xs font-semibold" style={{ color: '#f87171' }}>❌ {obError}</p>
              )}

              <button
                type="submit"
                disabled={obLoading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
              >
                {obLoading ? '⏳ Se salvează...' : '✓ Continuă'}
              </button>

              <button
                type="button"
                onClick={() => setShowOnboarding(false)}
                className="w-full py-2 text-xs transition"
                style={{ color: 'var(--text-secondary)' }}
              >
                Sari peste — completez mai târziu din Profil
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header user area */}
      {!user ? (
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          Conectare
        </Link>
      ) : (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {user.full_name[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[100px] truncate">
              {user.full_name}
            </span>
            <span className="text-gray-400 text-xs">▾</span>
          </button>

          {dropdownOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          )}

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>

              <div className="py-1">
                <Link href="/cont/anunturi" onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                  <span>📝</span> Anunțurile mele
                </Link>
                <Link href="/cont/favorite" onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                  <span>❤️</span> Favorite
                </Link>
                <Link href="/cont/mesaje" onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                  <span>💬</span> Mesaje
                </Link>
                <Link href="/cont/profil" onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                  <span>👤</span> Profilul meu
                </Link>
              </div>

              <div className="border-t border-gray-100 py-1">
                <form action={signOut}>
                  <button type="submit"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                    <span>🚪</span> Deconectare
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
