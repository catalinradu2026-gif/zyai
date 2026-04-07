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

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">👤 Profilul meu</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Nume complet</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Nume..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0760..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Oraș</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="București..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.startsWith('✓')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Se salvează...' : '✓ Salvează'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold mb-4">Securitate</h3>
          <p className="text-sm text-gray-600 mb-4">
            Poți să te deconectezi din aplicație.
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
            >
              🚪 Deconectare
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
