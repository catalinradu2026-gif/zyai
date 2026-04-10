'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface CompareItem {
  id: string
  title: string
  price?: number
  priceType: string
  currency: string
  city: string
  image?: string
  category?: string
}

interface CompareContextType {
  items: CompareItem[]
  add: (item: CompareItem) => void
  remove: (id: string) => void
  has: (id: string) => boolean
  clear: () => void
  count: number
}

const CompareContext = createContext<CompareContextType>({
  items: [], add: () => {}, remove: () => {}, has: () => false, clear: () => {}, count: 0,
})

const LS_KEY = 'zyai_compare'
const MAX = 3

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
      if (Array.isArray(saved)) setItems(saved.slice(0, MAX))
    } catch {}
  }, [])

  const save = (next: CompareItem[]) => {
    setItems(next)
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
  }

  const add = useCallback((item: CompareItem) => {
    setItems(prev => {
      if (prev.length >= MAX || prev.find(i => i.id === item.id)) return prev
      const next = [...prev, item]
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const has = useCallback((id: string) => items.some(i => i.id === id), [items])

  const clear = useCallback(() => save([]), [])

  return (
    <CompareContext.Provider value={{ items, add, remove, has, clear, count: items.length }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  return useContext(CompareContext)
}
