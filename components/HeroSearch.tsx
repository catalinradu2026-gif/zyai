'use client'

import { useState } from 'react'

export default function HeroSearch() {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return

    const event = new CustomEvent('openChatWithQuery', { detail: search })
    window.dispatchEvent(event)
    setSearch('')
  }

  function handleExampleClick(example: string) {
    const event = new CustomEvent('openChatWithQuery', { detail: example })
    window.dispatchEvent(event)
  }

  return (
    <div className="w-full">
      <form className="flex gap-3 max-w-3xl mx-auto flex-col sm:flex-row" onSubmit={handleSearch}>
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Spune ce cauți… ex: iPhone ieftin sau BMW sub 5000€"
            className="w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-300"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: focused ? 'var(--purple)' : 'var(--border-subtle)',
              boxShadow: focused ? 'var(--glow-purple)' : 'none',
            }}
          />
          {focused && (
            <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 animate-fade-up" style={{ boxShadow: 'var(--glow-purple)' }} />
          )}
        </div>
        <button
          type="submit"
          className="px-8 py-4 font-semibold rounded-2xl text-white whitespace-nowrap gradient-main transition-all duration-200 transform hover:scale-105 shadow-lg"
          style={{ boxShadow: 'var(--glow-purple)' }}
        >
          🔍 Caută
        </button>
      </form>

      {/* Suggested Queries */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          💡 Sugestii:
        </span>
        {[
          'iPhone 15 ieftin',
          'Apartament 2 camere București',
          'BMW sub 5000€',
          'Frontend Developer remote',
        ].map((example) => (
          <button
            key={example}
            onClick={() => handleExampleClick(example)}
            className="px-4 py-2 rounded-full text-sm transition-all duration-200 transform hover:scale-105 glass glass-hover"
            style={{ color: 'var(--text-secondary)' }}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}
