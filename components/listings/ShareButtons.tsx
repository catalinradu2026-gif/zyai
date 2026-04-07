'use client'

interface ShareButtonsProps {
  listingId: string
  listingTitle: string
}

export default function ShareButtons({ listingId, listingTitle }: ShareButtonsProps) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zyai-sable.vercel.app'}/anunt/${listingId}`

  function copyLink() {
    navigator.clipboard.writeText(url)
    alert('Link copiat!')
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={copyLink}
        className="flex-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
      >
        🔗 Copiere link
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium text-sm text-center"
      >
        f Facebook
      </a>
    </div>
  )
}
