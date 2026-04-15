'use client'

import { Suspense, useState } from 'react'
import { updateProfile } from '@/lib/actions/auth'
import { useRouter, useSearchParams } from 'next/navigation'

function SetupProfileForm() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await updateProfile({ phone })
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
    <div className="rounded-2xl p-8 space-y-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <div className="text-center">
        <div className="text-5xl mb-3">📞</div>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Adaugă numărul de telefon</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Vânzătorii te vor putea contacta direct când licitezi sau trimiți un mesaj
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Număr de telefon
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+40 723 123 456"
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {error && (
          <p className="text-sm font-semibold" style={{ color: '#f87171' }}>❌ {error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !phone.trim()}
          className="w-full py-3 rounded-xl font-bold text-white text-sm transition hover:scale-105 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
        >
          {loading ? '⏳ Se salvează...' : '✓ Salvează și continuă'}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="w-full py-2 rounded-xl text-sm transition"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', background: 'transparent' }}
        >
          Sari peste — adaugă mai târziu din Profil
        </button>
      </form>
    </div>
  )
}

export default function SetupProfilePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)' }} />}>
          <SetupProfileForm />
        </Suspense>
      </div>
    </main>
  )
}
