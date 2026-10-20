import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Núcleo de Kung Fu Shaolin',
    short_name: 'Núcleo Shaolin',
    description: 'Portal e Área do Aluno do Núcleo de Kung Fu Shaolin',
    start_url: '/aluno',
    scope: '/',
    display: 'standalone',
    background_color: '#0A1128',
    theme_color: '#0A1128',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
