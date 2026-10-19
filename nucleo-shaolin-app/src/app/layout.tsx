import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import '@/lib/performance-patch'
import './globals.css'

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Núcleo de Kung Fu Shaolin',
  description: 'Área do Aluno e Portal — Núcleo de Kung Fu Shaolin',
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
}

export const viewport: Viewport = {
  themeColor: '#0A1128',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
      </body>
    </html>
  )
}