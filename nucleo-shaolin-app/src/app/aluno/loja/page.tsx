import { redirect } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { getRequestAuthUser } from '@/lib/user-cache'
import { getStoreProductsAction, getStudentOrdersAction } from './actions'
import { StudentStore } from '@/components/loja/StudentStore'

export const instant = false

export default async function AlunoLojaPage() {
  const user = await getRequestAuthUser()
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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-gold shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="nkfs-h-m text-main font-bold">Loja Oficial da Escola</h1>
          </div>
          <p className="nkfs-p-m text-muted mt-1">
            Adquira uniformes oficiais, faixas de graduação, armas tradicionais e equipamentos com retirada na Núcleo Shaolin.
          </p>
        </div>
      </div>

      <StudentStore initialProducts={products} initialOrders={orders} />
    </main>
  )
}
