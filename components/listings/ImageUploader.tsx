'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface ImageUploaderProps {
  onImagesChange: (urls: string[]) => void
  initialImages?: string[]
}

export default function ImageUploader({
  onImagesChange,
  initialImages = [],
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (images.length + files.length > 10) {
        alert('Maxim 10 imagini permise')
        return
      }

      setUploading(true)
      const newUrls: string[] = []

      for (const file of files) {
        try {
          const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const { data, error } = await supabase.storage
            .from('listings')
            .upload(`listings/${filename}`, file)

          if (error) throw error

          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${data.path}`
          newUrls.push(url)
        } catch (error) {
          console.error('Upload error:', error)
          // Nu bloca formularul dacă imagini nu se uploadează
        }
      }

      const updatedImages = [...images, ...newUrls]
      setImages(updatedImages)
      onImagesChange(updatedImages)
      setUploading(false)
    },
    [images, onImagesChange]
  )

  function removeImage(url: string) {
    const updated = images.filter((img) => img !== url)
    setImages(updated)
    onImagesChange(updated)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Imagini ({images.length}/10)
        </label>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition">
          <span className="text-gray-600">
            {uploading ? 'Se încarcă...' : '📸 Click sau drag imagini'}
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading || images.length >= 10}
            className="hidden"
          />
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url) => (
            <div key={url} className="relative group">
              <Image
                src={url}
                alt="preview"
                width={200}
                height={200}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg"
              >
                <span className="text-white text-2xl">🗑️</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
