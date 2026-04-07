'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants/categories'

// Extra categories for UI (not in backend)
const EXTRA_CATEGORIES = [
  { slug: 'electronice', name: 'Electronice', icon: '📱' },
  { slug: 'moda', name: 'Modă', icon: '👗' },
  { slug: 'casa', name: 'Casă & Grădină', icon: '🏡' },
  { slug: 'sport', name: 'Sport', icon: '⚽' },
  { slug: 'animale', name: 'Animale', icon: '🐾' },
  { slug: 'gaming', name: 'Gaming', icon: '🎮' },
]

export default function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const mainCategories = Object.values(CATEGORIES)
  const allCategories = [...mainCategories, ...EXTRA_CATEGORIES]

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-gray-900 font-bold text-xl px-2 py-2 rounded hover:bg-gray-100 transition"
        title="Arată toate categoriile"
      >
        •••
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel - Categorii Extins */}
      <div
        className={`absolute top-full left-0 right-0 bg-white border-b border-gray-100 z-50 transition-all duration-300 origin-top ${
          isOpen
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Grid - 3 coloane pe desktop, 2 pe tablet, 1 pe mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allCategories.map((category) => {
              const hasSubcategories = 'subcategories' in category
              const subcategories = hasSubcategories
                ? Object.values((category as typeof mainCategories[0]).subcategories)
                : []

              return (
                <div key={category.slug} className="space-y-3">
                  {/* Category Header */}
                  <Link
                    href={`/marketplace/${category.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition">
                      {category.icon}
                    </span>
                    {category.name}
                  </Link>

                  {/* Subcategories */}
                  {hasSubcategories && (
                    <ul className="pl-8 space-y-2">
                      {subcategories.map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={`/marketplace/${category.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-gray-600 hover:text-blue-600 transition"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
