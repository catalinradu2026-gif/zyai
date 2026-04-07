'use client'

import { useState } from 'react'
import Link from 'next/link'

const MAIN_CATEGORIES = [
  { icon: '🏠', name: 'Imobiliare', slug: 'imobiliare' },
  { icon: '🚗', name: 'Auto', slug: 'auto' },
  { icon: '💼', name: 'Joburi', slug: 'joburi' },
  { icon: '🔧', name: 'Servicii', slug: 'servicii' },
]

const ALL_CATEGORIES = [
  {
    icon: '🏠',
    name: 'Imobiliare',
    slug: 'imobiliare',
    subs: ['Apartamente', 'Case', 'Terenuri', 'Spații comerciale'],
  },
  {
    icon: '🚗',
    name: 'Auto',
    slug: 'auto',
    subs: ['Autoturisme', 'Moto', 'Camioane', 'Piese'],
  },
  {
    icon: '💼',
    name: 'Joburi',
    slug: 'joburi',
    subs: ['IT', 'Vânzări', 'HoReCa', 'Construcții'],
  },
  {
    icon: '🔧',
    name: 'Servicii',
    slug: 'servicii',
    subs: ['Reparații', 'Curățenie', 'Transport', 'IT'],
  },
  {
    icon: '📱',
    name: 'Electronice',
    slug: 'electronice',
    subs: ['Telefoane', 'Laptop', 'TV', 'Gaming'],
  },
  {
    icon: '👗',
    name: 'Modă',
    slug: 'moda',
    subs: ['Haine', 'Încălțăminte', 'Accesorii', 'Copii'],
  },
  {
    icon: '🏡',
    name: 'Casă & Grădină',
    slug: 'casa-gradina',
    subs: ['Mobilă', 'Electrocasnice', 'Grădină', 'Decorare'],
  },
  {
    icon: '⚽',
    name: 'Sport',
    slug: 'sport',
    subs: ['Echipament', 'Biciclete', 'Fitness', 'Outdoor'],
  },
  {
    icon: '🐾',
    name: 'Animale',
    slug: 'animale',
    subs: ['Câini', 'Pisici', 'Accesorii', 'Alte animale'],
  },
]

export default function CategoriesBrowser() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header mic */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-500">Categorii</span>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xl text-gray-600 hover:text-gray-900 transition-colors font-bold"
          aria-label="Toggle categories"
        >
          {expanded ? '✕' : '•••'}
        </button>
      </div>

      {/* Mod simplu: 4 butoane mari */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          expanded ? 'opacity-0 h-0' : 'opacity-100'
        }`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          {MAIN_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/marketplace/${cat.slug}`}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 group"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </span>
              <span className="font-bold text-gray-900 group-hover:text-blue-600 text-center transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mod extins: toate categoriile compact */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          expanded ? 'opacity-100' : 'opacity-0 h-0'
        }`}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
          {ALL_CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              className="border border-gray-100 rounded-xl p-3 hover:border-blue-200 hover:bg-blue-50/20 transition-all duration-200"
            >
              <Link
                href={`/marketplace/${cat.slug}`}
                className="flex items-center gap-2 mb-2 hover:text-blue-600 transition-colors"
              >
                <span className="text-xl shrink-0">{cat.icon}</span>
                <span className="font-semibold text-sm text-gray-900 truncate">
                  {cat.name}
                </span>
              </Link>
              <div className="flex flex-wrap gap-1">
                {cat.subs.map((sub) => (
                  <span
                    key={sub}
                    className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 hover:bg-blue-100 cursor-pointer transition-colors"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
