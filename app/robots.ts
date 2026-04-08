import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/cont/', '/login', '/setup-profile'],
    },
    sitemap: 'https://zyai.ro/sitemap.xml',
  }
}
