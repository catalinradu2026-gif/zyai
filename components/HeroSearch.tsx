'use client'

import { useState } from 'react'

export default function HeroSearch() {
  const [search, setSearch] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return

    // Trigger chat widget with search query
    const event = new CustomEvent('openChatWithQuery', { detail: search })
    window.dispatchEvent(event)

    setSearch('')
  }

  function handleExampleClick(example: string) {
    // Trigger chat widget with example
    const event = new CustomEvent('openChatWithQuery', { detail: example })
    window.dispatchEvent(event)
  }

  return (
    <div className="mb-12">
      <form className="flex gap-3 max-w-2xl mx-auto" onSubmit={handleSearch}>
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ex: iPhone 13 sub 2000 lei în Craiova"
            className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
        >
          Caută cu AI
        </button>
      </form>

      {/* Examples */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <span className="text-gray-500 text-sm">Exemple:</span>
        {[
          'iPhone 13 ieftin Craiova',
          'garsonieră de închiriat',
          'BMW sub 10.000€',
        ].map((example) => (
          <button
            key={example}
            onClick={() => handleExampleClick(example)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition border border-gray-200"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}
