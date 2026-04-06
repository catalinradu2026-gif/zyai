'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ROMANIAN_CITIES } from '@/lib/constants/cities'
import { useState } from 'react'

interface ListingFiltersProps {
  category: string
}

export default function ListingFilters({ category }: ListingFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [city, setCity] = useState(searchParams.get('city') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [query, setQuery] = useState(searchParams.get('q') || '')

  function handleFilter() {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (query) params.set('q', query)

    router.push(`/marketplace/${category}?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg p-4 h-fit sticky top-24 shadow-sm">
      <h3 className="font-semibold mb-4 text-lg">Filtre</h3>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2">Cauta</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cauta..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-2">Oras</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toate orasele</option>
            {ROMANIAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-2">Pret (RON)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleFilter}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Aplica Filtre
        </button>
      </div>
    </div>
  )
}
