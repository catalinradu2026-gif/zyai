'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
  title: string
  overlay?: React.ReactNode
}

export default function ImageGallery({ images, title, overlay }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-400 text-6xl">📷</span>
      </div>
    )
  }

  const prev = () => setSelectedIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setSelectedIndex(i => (i + 1) % images.length)

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative w-full h-96 rounded-lg overflow-hidden select-none"
        style={{ background: '#0a0e1a' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={images[selectedIndex]}
          alt={`${title} - ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
        />

        {/* Overlay slot (fav, compare, etc.) */}
        {overlay}

        {/* Image count badge */}
        {images.length > 1 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Left arrow */}
        {images.length > 1 && (
          <button
            onClick={prev}
            aria-label="Poza anterioară"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition hover:scale-110 active:scale-95"
            style={{
              width: 36, height: 36,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              color: '#fff',
              zIndex: 5,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {images.length > 1 && (
          <button
            onClick={next}
            aria-label="Poza următoare"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition hover:scale-110 active:scale-95"
            style={{
              width: 36, height: 36,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              color: '#fff',
              zIndex: 5,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="grid grid-cols-6 gap-2 max-h-24 overflow-y-auto">
            {images.slice(0, 12).map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`relative w-full h-20 bg-gray-200 rounded-lg overflow-hidden transition ${
                  i === selectedIndex
                    ? 'ring-2 ring-blue-500'
                    : 'hover:ring-2 hover:ring-blue-400'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img}
                  alt={`thumbnail-${i}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
