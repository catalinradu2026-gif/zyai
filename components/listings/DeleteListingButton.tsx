'use client'

import { useState } from 'react'
import { deleteListing } from '@/lib/actions/listings'
import { useRouter } from 'next/navigation'

interface DeleteListingButtonProps {
  listingId: string
  listingTitle: string
}

export default function DeleteListingButton({ listingId, listingTitle }: DeleteListingButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    const confirmed = confirm(
      `Sigur vrei să ștergi anunțul "${listingTitle}"?\n\nAceastă acțiune nu poate fi anulată.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const result = await deleteListing(listingId)
      if (result.error) {
        alert('Eroare: ' + result.error)
      } else {
        router.refresh()
      }
    } catch (error) {
      alert('Eroare la ștergere. Încercați din nou.')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? '⏳ Se șterge...' : '🗑️ Șterge'}
    </button>
  )
}
