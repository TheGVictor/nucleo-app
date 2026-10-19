import { Spinner } from '@/components/ui/Spinner'

export default function AdminLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center min-h-[40vh] gap-3 animate-fade-in">
      <Spinner size="lg" />
      <p className="nkfs-p-m text-muted font-medium">Carregando painel do instrutor...</p>
    </div>
  )
}
