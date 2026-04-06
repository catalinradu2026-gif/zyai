'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
  })
  const [message, setMessage] = useState('')

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
            <label className="block text-sm font-medium mb-2">Nume complet</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Nume..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0760..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Oraș</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="București..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            Ți-ai conectat cu magic link pe email. Poți rămâne logat sau iți poți reseta sesiunea.
          </p>
          {/* Logout button in Header */}
        </div>
      </div>
    </div>
  )
}
