import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  return {
    rules: [
      // Standard crawlers — full access
      { userAgent: '*', allow: '/', disallow: ['/api/', '/opti-admin/'] },

      // AI answer engines — explicitly permitted for GEO discoverability
      { userAgent: 'GPTBot',           allow: '/' },
      { userAgent: 'ChatGPT-User',     allow: '/' },
      { userAgent: 'ClaudeBot',        allow: '/' },
      { userAgent: 'Claude-Web',       allow: '/' },
      { userAgent: 'PerplexityBot',    allow: '/' },
      { userAgent: 'GoogleOther',      allow: '/' },
      { userAgent: 'Google-Extended',  allow: '/' },
      { userAgent: 'cohere-ai',        allow: '/' },
      { userAgent: 'anthropic-ai',     allow: '/' },
    ],
    sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined,
  }
}
