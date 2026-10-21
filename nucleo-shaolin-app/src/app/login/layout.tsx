import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Área do Aluno | Login',
  description:
    'Acesse o portal do aluno do Núcleo de Kung Fu Shaolin para acompanhar presenças, graduações, avisos e ficha técnica oficial.',
  alternates: {
    canonical: '/login',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
