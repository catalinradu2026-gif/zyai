'use client'

import { deleteListing } from '@/lib/actions/listings'

export default function DeleteListingButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm('Sigur vrei să ștergi anunțul?')) return
    const result = await deleteListing(id)
    if (!result.error) {
      window.location.href = '/cont/anunturi'
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm whitespace-nowrap"
    >
      🗑️
    </button>
  )
}
