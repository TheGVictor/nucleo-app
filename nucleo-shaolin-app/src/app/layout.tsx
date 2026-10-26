import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import '@/lib/performance-patch'
import './globals.css'
import { InstallPwa } from '@/components/pwa/InstallPwa'
import { Analytics } from '@vercel/analytics/next'

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'SportsClub'],
      '@id': 'https://nucleo-app-iota.vercel.app/#organization',
      name: 'Núcleo de Kung Fu Shaolin',
      alternateName: ['Núcleo Shaolin', 'Escola Núcleo de Kung Fu Shaolin'],
      url: 'https://nucleo-app-iota.vercel.app',
      logo: 'https://nucleo-app-iota.vercel.app/icon-512.png',
      image: 'https://nucleo-app-iota.vercel.app/icon-512.png',
      description:
        'Escola tradicional de Kung Fu Shaolin (Choy Lay Fut), Tai Chi Chuan estilo Yang e Sanda (Boxe Chinês), sob coordenação técnica do Sifu Guilherme.',
      sameAs: [
        'https://www.instagram.com/nucleokungfushaolin/',
        'https://www.facebook.com/nucleokungfushaolin/',
        'https://www.wikidata.org/wiki/Q1143825',
      ],
      founder: {
        '@type': 'Person',
        name: 'Sifu Guilherme',
        jobTitle: 'Mestre e Coordenador Técnico',
      },
      sport: ['Kung Fu', 'Tai Chi Chuan', 'Sanda', 'Boxe Chinês'],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'BR',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://nucleo-app-iota.vercel.app/#website',
      url: 'https://nucleo-app-iota.vercel.app',
      name: 'Núcleo de Kung Fu Shaolin',
      description:
        'Aprenda Kung Fu Shaolin tradicional, Tai Chi Chuan e Boxe Chinês. Acompanhe sua evolução marcial, histórico de graduações e ficha técnica no Núcleo Shaolin.',
      publisher: {
        '@id': 'https://nucleo-app-iota.vercel.app/#organization',
      },
      inLanguage: 'pt-BR',
      datePublished: '2024-01-01T00:00:00Z',
      dateModified: '2026-10-21T00:00:00Z',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://nucleo-app-iota.vercel.app/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: 'https://nucleo-app-iota.vercel.app/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Matrícula',
          item: 'https://nucleo-app-iota.vercel.app/cadastro',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Área do Aluno',
          item: 'https://nucleo-app-iota.vercel.app/login',
        },
      ],
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://nucleo-app-iota.vercel.app'),
  title: {
    default: 'Núcleo de Kung Fu Shaolin | Escola Tradicional e Portal',
    template: '%s | Núcleo de Kung Fu Shaolin',
  },
  description:
    'Aprenda Kung Fu Shaolin tradicional, Tai Chi Chuan e Boxe Chinês. Acompanhe sua evolução marcial, histórico de graduações e ficha técnica no Núcleo Shaolin.',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Núcleo Shaolin',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://nucleo-app-iota.vercel.app',
    siteName: 'Núcleo de Kung Fu Shaolin',
    title: 'Núcleo de Kung Fu Shaolin | Escola Tradicional e Portal',
    description:
      'Aprenda Kung Fu Shaolin tradicional, Tai Chi Chuan e Boxe Chinês. Acompanhe sua evolução marcial, histórico de graduações e ficha técnica no Núcleo Shaolin.',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Núcleo de Kung Fu Shaolin',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Núcleo de Kung Fu Shaolin | Escola Tradicional e Portal',
    description:
      'Aprenda Kung Fu Shaolin tradicional, Tai Chi Chuan e Boxe Chinês. Acompanhe sua evolução marcial e ficha técnica no Núcleo Shaolin.',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#0A1128',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suprime bug de timestamp negativo no performance.measure em dev
              if (typeof window !== 'undefined' && window.Performance) {
                try {
                  var origMeasure = Performance.prototype.measure;
                  Performance.prototype.measure = function(name, startOrOptions, end) {
                    try {
                      if (startOrOptions && typeof startOrOptions === 'object') {
                        if (typeof startOrOptions.start === 'number' && startOrOptions.start < 0) startOrOptions.start = 0;
                        if (typeof startOrOptions.end === 'number' && startOrOptions.end < 0) startOrOptions.end = 0;
                      }
                      return origMeasure.apply(this, arguments);
                    } catch (e) {
                      return;
                    }
                  };
                } catch (e) {}
              }
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${fontSans.className} antialiased selection:bg-[#1361C8]/20 selection:text-[var(--color-primary)]`}
        suppressHydrationWarning
      >
        {children}
        <InstallPwa />
        <Analytics />
      </body>
    </html>
  )
}