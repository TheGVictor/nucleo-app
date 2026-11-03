import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Matrícula em Análise',
  description:
    'Sua solicitação de matrícula na Núcleo de Kung Fu Shaolin foi enviada e está sob avaliação da coordenação.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AguardandoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
