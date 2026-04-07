'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SUBCATEGORIES } from '@/lib/constants/subcategories'

interface CategorySubsBarProps {
  category: string
}

export default function CategorySubsBar({ category }: CategorySubsBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSub = searchParams.get('sub') || ''

  const subs = SUBCATEGORIES[category]
  if (!subs || subs.length === 0) return null

  function handleSub(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeSub === slug) {
      params.delete('sub')
    } else {
      params.set('sub', slug)
    }
    router.push(`/marketplace/${category}?${params.toString()}`)
  }

  function handleAll() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('sub')
    router.push(`/marketplace/${category}?${params.toString()}`)
  }

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        <button
          onClick={handleAll}
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap ${
            !activeSub
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
          }`}
        >
          <span className="text-2xl">🔍</span>
          <span className="text-xs font-semibold">Toate</span>
        </button>

        {subs.map((sub) => (
          <button
            key={sub.slug}
            onClick={() => handleSub(sub.slug)}
            className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap ${
              activeSub === sub.slug
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
            }`}
          >
            <span className="text-2xl">{sub.icon}</span>
            <span className="text-xs font-semibold">{sub.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
