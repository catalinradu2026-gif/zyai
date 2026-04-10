'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { signOut } from '@/lib/actions/auth'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
  })
  const [message, setMessage] = useState('')

  // Load existing profile data on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setMessage('Trebuie să fii autentificat')
          return
        }

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setFormData({
            fullName: data.full_name || '',
            phone: data.phone || '',
            city: data.city || '',
          })
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }

    loadProfile()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setMessage('Trebuie să fii autentificat')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
        })
        .eq('id', user.id)

      if (error) {
        setMessage('Eroare: ' + error.message)
      } else {
        setMessage('✓ Profil actualizat cu succes!')
      }
    } catch (err) {
      setMessage('Eroare: ' + (err instanceof Error ? err.message : 'Unknown'))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '8px 16px',
    width: '100%',
    fontSize: '16px',
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-lg p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>👤 Profilul meu</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Nume complet</label>
            <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Nume..." style={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Telefon</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0760..." style={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Oraș</label>
            <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="București..." style={inputStyle} />
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${message.startsWith('✓') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
            {loading ? 'Se salvează...' : '✓ Salvează'}
          </button>
        </form>

        <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Securitate</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Poți să te deconectezi din aplicație.
          </p>
          <form action={signOut}>
            <button type="submit" className="px-4 py-2 rounded-lg transition text-sm font-medium" style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)' }}>
              🚪 Deconectare
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
