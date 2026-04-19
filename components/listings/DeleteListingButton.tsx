'use client'

import { useState } from 'react'
import { deleteListing } from '@/lib/actions/listings'

export default function DeleteListingButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Sigur vrei să ștergi anunțul? Acțiunea nu poate fi anulată.')) return
    setLoading(true)
    const result = await deleteListing(id)
    if (result.error) {
      alert('Eroare la ștergere: ' + result.error)
      setLoading(false)
    } else {
      window.location.href = '/cont/anunturi'
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm whitespace-nowrap disabled:opacity-50"
    >
      {loading ? '⏳' : '🗑️'}
    </button>
  )
}
