'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
  title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-400 text-6xl">📷</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={images[selectedIndex]}
          alt={`${title} - ${selectedIndex + 1}`}
          fill
          priority
          className="object-cover"
        />
        {/* Image Count Badge */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </div>
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
