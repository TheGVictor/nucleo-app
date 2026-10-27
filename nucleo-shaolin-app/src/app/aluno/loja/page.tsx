import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStoreProductsAction, getStudentOrdersAction } from './actions'
import { StudentStore } from '@/components/loja/StudentStore'

export const instant = false

export default async function AlunoLojaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [products, orders] = await Promise.all([
    getStoreProductsAction(),
    getStudentOrdersAction(),
  ])

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
      {/* Cabeçalho da Loja */}
      <div className="section-header pb-2 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <h1 className="nkfs-h-m text-main font-bold">Loja Oficial da Escola</h1>
          </div>
          <p className="nkfs-p-m text-muted mt-0.5">
            Adquira uniformes oficiais, faixas de graduação, armas tradicionais e equipamentos com retirada no Núcleo Shaolin.
          </p>
        </div>
      </div>

      <StudentStore initialProducts={products} initialOrders={orders} />
    </main>
  )
}
