'use client'

import Button from '@/components/ui/Button'

export default function SearchButton() {
  const handleSearch = () => {
    const searchBox = document.querySelector('input[placeholder*="cauți"]') as HTMLInputElement
    searchBox?.focus()
  }

  return (
    <Button variant="secondary" size="lg" className="min-w-48" onClick={handleSearch}>
      🔍 Caută cu AI
    </Button>
  )
}
