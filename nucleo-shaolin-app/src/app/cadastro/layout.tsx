import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solicitar Matrícula e Aula Experimental',
  description:
    'Cadastre-se no Núcleo de Kung Fu Shaolin. Agende sua aula experimental gratuita e inicie seus treinos de Kung Fu, Tai Chi Chuan ou Sanda.',
  alternates: {
    canonical: '/cadastro',
  },
}

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
