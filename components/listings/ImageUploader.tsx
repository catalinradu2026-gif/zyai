'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

const FREE_LIMIT = 3
const MAX_IMAGES = 8

interface ImageUploaderProps {
  onImagesChange: (urls: string[]) => void
  initialImages?: string[]
  category?: string
}


export default function ImageUploader({ onImagesChange, initialImages = [], category }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [rotatingIdx, setRotatingIdx] = useState<number | null>(null)
  const [proIdx, setProIdx] = useState<number | null>(null)
  const [proStatus, setProStatus] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (!files.length) return

      if (images.length >= FREE_LIMIT) {
        setUploadError(`Poți adăuga maxim ${FREE_LIMIT} poze gratuit. Upgrade pentru mai multe.`)
        e.target.value = ''
        return
      }

      if (images.length + files.length > FREE_LIMIT) {
        setUploadError(`Planul gratuit permite doar ${FREE_LIMIT} imagine. Upgrade pentru mai multe.`)
        e.target.value = ''
        return
      }

      const MAX_FILE_SIZE = 5 * 1024 * 1024
      const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE)
      if (oversizedFiles.length > 0) {
        setUploadError(`${oversizedFiles.length} fișier(e) prea mare(i). Max 5MB per imagine.`)
        e.target.value = ''
        return
      }

      setUploading(true)
      setUploadError('')
      const newUrls: string[] = []
      let errorCount = 0

      const filesToUpload = files.slice(0, FREE_LIMIT - images.length)

      for (let i = 0; i < filesToUpload.length; i++) {
        let file = filesToUpload[i]

        // Convertim HEIC/HEIF (poze directe iOS) la JPEG via canvas
        const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
          (file.type === '' && file.name.toLowerCase().match(/\.(heic|heif)$/))
        if (isHeic || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          try {
            const bmp = await createImageBitmap(file)
            const cvs = document.createElement('canvas')
            cvs.width = bmp.width
            cvs.height = bmp.height
            cvs.getContext('2d')!.drawImage(bmp, 0, 0)
            const blob = await new Promise<Blob>((res, rej) =>
              cvs.toBlob(b => b ? res(b) : rej(new Error('toBlob')), 'image/jpeg', 0.92)
            )
            file = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
          } catch {
            errorCount++
            continue
          }
        }

        let retries = 3

        while (retries > 0) {
          try {
            const fd = new FormData()
            fd.append('file', file)

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)

            const res = await fetch('/api/upload', {
              method: 'POST',
              body: fd,
              signal: controller.signal,
            })

            clearTimeout(timeoutId)
            const data = await res.json()

            if (!res.ok || data.error) {
              throw new Error(data.error || 'Upload failed')
            }

            newUrls.push(data.url)
            retries = 0
          } catch (err) {
            retries--
            if (retries === 0) {
              errorCount++
              console.error(`Failed to upload ${file.name}:`, err)
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
      }

      if (errorCount > 0) {
        setUploadError(`Imaginea nu s-a putut încărca. Încearcă din nou.`)
      }

      const updated = [...images, ...newUrls]
      setImages(updated)
      onImagesChange(updated)
      setUploading(false)
      e.target.value = ''
    },
    [images, onImagesChange]
  )

  function deleteStoredImage(url: string) {
    fetch('/api/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: url }),
    }).catch(() => {})
  }

  async function rotateImage(url: string, idx: number) {
    setRotatingIdx(idx)
    setUploadError('')
    try {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now()
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalHeight
      canvas.height = img.naturalWidth
      const ctx = canvas.getContext('2d')!
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(Math.PI / 2)
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), 'image/jpeg', 0.9)
      )

      const fd = new FormData()
      fd.append('file', new File([blob], 'rotated.jpg', { type: 'image/jpeg' }))
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Upload failed')

      deleteStoredImage(url)

      const updated = images.map((u, i) => i === idx ? data.url : u)
      setImages(updated)
      onImagesChange(updated)
    } catch (err) {
      console.error('Rotate error:', err)
      setUploadError('Nu s-a putut roti imaginea. Încearcă din nou.')
    } finally {
      setRotatingIdx(null)
    }
  }

  async function professionalizeImage(url: string, idx: number) {
    setProIdx(idx)
    setUploadError('')
    setProStatus('Se procesează...')
    try {
      const REMBG = process.env.NEXT_PUBLIC_REMBG_URL || 'https://rembg-service-fqko.onrender.com'
      const cleanUrl = url.replace(/[\x00-\x1f\x7f]/g, '').trim()
      const res = await fetch(`${REMBG}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: cleanUrl, category: category || 'general' }),
      })
      const rawText = await res.text()
      let data: any
      try { data = JSON.parse(rawText) } catch { throw new Error(`Eroare server: ${rawText.slice(0, 100)}`) }
      if (!res.ok || data.error) throw new Error(data.error || 'Server error')

      deleteStoredImage(url)
      const newUrl = data.url + '?t=' + Date.now()
      const updated = images.map((u, i) => i === idx ? newUrl : u)
      setImages(updated)
      onImagesChange(updated)
      setSuccessMsg('✅ Imagine procesată Pro!')
      setTimeout(() => setSuccessMsg(''), 3000)
      console.log('[Pro] done, new url:', data.url)
    } catch (err: any) {
      console.error('[Pro] error:', err)
      setUploadError('❌ Pro eroare: ' + (err.message || 'necunoscută'))
    } finally {
      setProIdx(null)
      setProStatus('')
    }
  }

  async function removeImage(url: string) {
    try {
      deleteStoredImage(url)

      const updated = images.filter((img) => img !== url)
      setImages(updated)
      onImagesChange(updated)
    } catch (err) {
      console.error('Error removing image:', err)
      setUploadError('Eroare la ștergerea imaginii')
    }
  }

  const atFreeLimit = images.length >= FREE_LIMIT

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Imagini ({images.length}/{FREE_LIMIT} gratuit)
        </label>

        {atFreeLimit ? (
          <div className="rounded-xl p-5 text-center space-y-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.12))',
              border: '1px dashed rgba(139,92,246,0.5)',
            }}>
            <div className="text-2xl">🔒</div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Poze suplimentare — funcție Premium
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Planul gratuit include {FREE_LIMIT} poze. Upgrade pentru până la {MAX_IMAGES} imagini și mai multă vizibilitate.
            </p>
            <button
              type="button"
              disabled
              className="mt-1 px-4 py-2 rounded-lg text-xs font-bold text-white opacity-60 cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
            >
              ⭐ Upgrade (în curând)
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition cursor-pointer hover:border-purple-500"
            style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-3xl mb-2">📸</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {uploading ? 'Se încarcă...' : 'Click pentru a adăuga o imagine'}
            </span>
            {!uploading && (
              <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                JPG, PNG, WebP — {FREE_LIMIT} imagini gratuite
              </span>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {uploadError && (
        <p className="text-sm font-semibold" style={{ color: '#f87171' }}>{uploadError}</p>
      )}
      {successMsg && (
        <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>{successMsg}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={url} className="flex flex-col gap-1">
              {/* Image + top-right buttons overlay */}
              <div className="relative group">
                {i === 0 && (
                  <span className="absolute top-1 left-1 z-10 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    Principală
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`imagine ${i + 1}`}
                  className="w-full h-28 object-cover rounded-lg"
                />
                {/* Overlay Pro processing */}
                {proIdx === i && (
                  <div className="absolute inset-0 rounded-lg flex flex-col items-center justify-center gap-1"
                    style={{ background: 'rgba(139,92,246,0.75)' }}>
                    <span className="text-white text-2xl animate-spin inline-block">✦</span>
                    <span className="text-white text-xs font-bold">Se procesează...</span>
                  </div>
                )}
                {/* Overlay hover: rotire + ștergere */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition rounded-lg">
                  <button
                    type="button"
                    onClick={() => rotateImage(url, i)}
                    disabled={rotatingIdx === i}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition"
                    title="Rotește 90°"
                  >
                    {rotatingIdx === i
                      ? <span className="text-white text-xs animate-spin inline-block">↻</span>
                      : <span className="text-white text-lg">↻</span>
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-red-500/70 flex items-center justify-center transition"
                    title="Șterge"
                  >
                    <span className="text-white text-base">🗑️</span>
                  </button>
                </div>
              </div>

              {/* Buton Prezintă Pro — mereu vizibil sub imagine */}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); professionalizeImage(url, i) }}
                disabled={proIdx !== null}
                className="w-full py-1.5 rounded-lg text-xs font-bold transition"
                style={{
                  background: proIdx === i
                    ? 'rgba(139,92,246,0.4)'
                    : 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.45)',
                  color: '#C4B5FD',
                  opacity: proIdx !== null && proIdx !== i ? 0.5 : 1,
                }}
              >
                {proIdx === i
                  ? proStatus || '⏳ Se procesează...'
                  : '✨ Prezintă Pro [R]'
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
