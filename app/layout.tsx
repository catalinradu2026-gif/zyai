import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'zyAI - Platformă Națională de Anunțuri România',
    template: '%s | zyAI România',
  },
  description: 'zyAI este platforma națională de anunțuri din România. Găsește și postează anunțuri gratuite la auto, imobiliare, joburi și servicii. Căutare inteligentă cu AI.',
  keywords: [
    'anunțuri gratuite romania', 'anunturi auto romania', 'imobiliare romania',
    'joburi romania', 'servicii romania', 'platforma anunturi', 'olx romania alternativa',
    'anunturi online', 'vanzari auto second hand', 'apartamente de vanzare',
    'locuri de munca romania', 'zyai', 'zyai.ro',
  ],
  metadataBase: new URL('https://zyai.ro'),
  alternates: { canonical: 'https://zyai.ro' },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://zyai.ro',
    siteName: 'zyAI România',
    title: 'zyAI - Platforma Națională de Anunțuri România',
    description: 'Platforma națională de anunțuri din România cu AI integrat. Auto, imobiliare, joburi, servicii. Postează gratuit.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'zyAI - Platforma Națională de Anunțuri România' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'zyAI - Platforma Națională de Anunțuri România',
    description: 'Postează și caută anunțuri gratuit în România. Auto, imobiliare, joburi, servicii cu AI.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: {
    google: 'nQ4H6yFEmYYfJ1gm4EpB_bvAgQxrvnCvWphXNxx6B20',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Header />
        <main className="flex-1">{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
