'use client'

import { Suspense, useState } from 'react'
import { updateProfile } from '@/lib/actions/auth'
import { useRouter, useSearchParams } from 'next/navigation'

function SetupProfileForm() {
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) { setError('Numărul de telefon este obligatoriu'); return }
    setLoading(true)
    setError('')
    const result = await updateProfile({ phone: phone.trim(), city: city.trim() })
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(next)
    }
  }

  function handleSkip() {
    router.push(next)
  }

  return (
    /* Overlay întunecat ca un modal */
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-8 space-y-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl">👋</div>
          <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
            Bine ai venit!
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Completează datele de contact ca vânzătorii să te poată găsi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Telefon */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              📞 Număr de telefon *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+40 723 123 456"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Oraș */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              📍 Orașul tău
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="ex: București, Cluj, Timișoara..."
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {error && (
            <p className="text-xs font-semibold" style={{ color: '#f87171' }}>❌ {error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white text-sm transition hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
          >
            {loading ? '⏳ Se salvează...' : '✓ Continuă'}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-2 text-xs transition"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sari peste — completez mai târziu din Profil
          </button>
        </form>

      </div>
    </div>
  )
}

export default function SetupProfilePage() {
  return (
    <Suspense>
      <SetupProfileForm />
    </Suspense>
  )
}
