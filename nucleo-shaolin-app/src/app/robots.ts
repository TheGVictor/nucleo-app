import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://nucleo-app-iota.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/cadastro',
          '/aguardando',
          '/llms.txt',
          '/llms-full.txt',
          '/.well-known/agents.json',
        ],
        disallow: ['/admin/', '/aluno/', '/auth/', '/api/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'PerplexityBot',
          'Applebot',
          'Applebot-Extended',
          'Google-Extended',
          'Googlebot',
          'Bingbot',
        ],
        allow: [
          '/',
          '/login',
          '/cadastro',
          '/llms.txt',
          '/llms-full.txt',
          '/.well-known/agents.json',
        ],
        disallow: ['/admin/', '/aluno/', '/auth/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
