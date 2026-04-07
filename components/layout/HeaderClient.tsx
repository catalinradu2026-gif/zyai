'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HeaderClient() {
  const [userId, setUserId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedUserId = localStorage.getItem('user_id')
    setUserId(storedUserId)
  }, [])

  if (!mounted) return null

  if (userId) {
    return (
      <Link href="/cont/anunturi" className="text-gray-600 hover:text-gray-900 text-lg transition" title="Contul meu">
        👤
      </Link>
    )
  }

  return (
    <Link
      href="/login"
      className="text-gray-600 hover:text-gray-900 text-sm font-medium transition"
    >
      Conectare
    </Link>
  )
}
