'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { signOut } from '@/lib/actions/auth'

export default function HeaderClient() {
  const [userId, setUserId] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id')
    if (storedUserId) {
      setUserId(storedUserId)
      setPhone(storedUserId.slice(0, 8) + '...') // Mostra doar primii caractere
    }
  }, [])

  if (userId) {
    return (
      <>
        <Link
          href="/anunt/nou"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ➕ Postează
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/cont/anunturi" className="text-gray-700 hover:text-gray-900">
            Cont
          </Link>
          <button
            onClick={async () => {
              localStorage.removeItem('user_id')
              await signOut()
            }}
            className="text-gray-700 hover:text-gray-900 text-sm"
          >
            Deconectare
          </button>
        </div>
      </>
    )
  }

  return (
    <Link
      href="/login"
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      Conectare
    </Link>
  )
}
