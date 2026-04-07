'use client'

import { useState } from 'react'

export default function HeaderSearchBar() {
  const [search, setSearch] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return

    // Trigger chat widget with search query
    const event = new CustomEvent('openChatWithQuery', { detail: search })
    window.dispatchEvent(event)

    setSearch('')
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Caută cu AI…"
          className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        />
      </form>
      <p className="text-xs text-gray-400 mt-2">Caută cu AI în header</p>
    </div>
  )
}
