import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminProductsAction, getAdminOrdersAction } from './actions'
import { AdminStoreManager } from '@/components/admin/AdminStoreManager'

export const instant = false

export default async function AdminLojaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/aluno')
  }

  const [products, orders] = await Promise.all([
    getAdminProductsAction(),
    getAdminOrdersAction(),
  ])

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
      <div className="section-header pb-2 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <h1 className="nkfs-h-m text-main font-bold">Gestão da Loja Oficial</h1>
          </div>
          <p className="nkfs-p-m text-muted mt-0.5">
            Gerencie o catálogo de uniformes e equipamentos, acompanhe as reservas dos alunos e confirme pagamentos.
          </p>
        </div>
      </div>

      <AdminStoreManager initialProducts={products} initialOrders={orders} />
    </main>
  )
}
