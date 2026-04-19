'use client'

import { CompareProvider } from '@/components/compare/CompareContext'
import CompareBar from '@/components/compare/CompareBar'

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompareProvider>
      {children}
      <CompareBar />
    </CompareProvider>
  )
}
