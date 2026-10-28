'use client'

import { useState, useTransition, useMemo } from 'react'
import type { Product, ProductOrder, OrderStatus } from '@/types/database'
import {
  saveProductAction,
  toggleProductActiveAction,
  deleteProductAction,
  updateOrderStatusAction,
  getAdminProductsAction,
  getAdminOrdersAction,
  deleteOrderAction,
  uploadProductImageAction,
  updateProductStockAction,
} from '@/app/admin/loja/actions'
import {
  STORE_SUBCATEGORIES,
  type StoreSubcategory,
  getProductSubcategory,
  getSubcategoryIcon,
} from '@/lib/store-defaults'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

interface AdminStoreManagerProps {
  initialProducts: Product[]
  initialOrders: ProductOrder[]
}

export function AdminStoreManager({
  initialProducts,
  initialOrders,
}: AdminStoreManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [orders, setOrders] = useState<ProductOrder[]>(initialOrders)
  const [tab, setTab] = useState<'orders' | 'inventory' | 'products'>('orders')
  const [orderFilter, setOrderFilter] = useState<'all' | 'reserved' | 'paid' | 'delivered' | 'cancelled'>('all')
  const [orderSearch, setOrderSearch] = useState('')

  // Estado da Aba de Estoque & Menu de Subcategorias
  const [inventorySearch, setInventorySearch] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<'Todos' | StoreSubcategory>('Todos')
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({})
  const [savingStockId, setSavingStockId] = useState<string | null>(null)
  const [stockFeedback, setStockFeedback] = useState<Record<string, string>>({})

  // Estado do Modal de Produto (Novo / Edição)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<string>('CLF')
  const [formPrice, setFormPrice] = useState('')
  const [formStock, setFormStock] = useState('10')
  const [formDescription, setFormDescription] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [isPending, startTransition] = useTransition()

  async function reloadAll() {
    const [prods, ords] = await Promise.all([
      getAdminProductsAction(),
      getAdminOrdersAction(),
    ])
    setProducts(prods)
    setOrders(ords)
  }

  function handleOpenNewProduct() {
    setEditingProduct({})
    setFormName('')
    setFormCategory('CLF')
    setFormPrice('')
    setFormStock('10')
    setFormDescription('')
    setFormImageUrl('')
    setModalError(null)
  }

  function handleOpenEditProduct(p: Product) {
    setEditingProduct(p)
    setFormName(p.name)
    setFormCategory(getProductSubcategory(p))
    setFormPrice(p.price.toString())
    setFormStock(p.stock !== null ? p.stock.toString() : '10')
    setFormDescription(p.description || '')
    setFormImageUrl(p.image_url || '')
    setModalError(null)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    setModalError(null)

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await uploadProductImageAction(fd)
      if (res.success && res.url) {
        setFormImageUrl(res.url)
      } else {
        setModalError(res.error || 'Erro no upload da imagem')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar foto'
      setModalError(msg)
    } finally {
      setIsUploadingImage(false)
    }
  }

  function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault()
    setModalError(null)

    const numPrice = parseFloat(formPrice.replace(',', '.'))
    if (isNaN(numPrice) || numPrice <= 0) {
      setModalError('Informe um preço válido maior que zero.')
      return
    }

    startTransition(async () => {
      const res = await saveProductAction({
        id: editingProduct?.id,
        name: formName.trim(),
        category: formCategory.trim() || 'Geral',
        price: numPrice,
        stock: parseInt(formStock, 10) || 10,
        description: formDescription.trim() || undefined,
        image_url: formImageUrl.trim() || undefined,
      })

      if (res.success) {
        setEditingProduct(null)
        await reloadAll()
      } else {
        setModalError(res.error || 'Erro ao salvar produto.')
      }
    })
  }

  function handleToggleActive(p: Product) {
    startTransition(async () => {
      await toggleProductActiveAction(p.id, p.active)
      await reloadAll()
    })
  }

  function handleDeleteProduct(p: Product) {
    if (!confirm(`Deseja excluir permanentemente o produto "${p.name}"?`)) return
    startTransition(async () => {
      await deleteProductAction(p.id)
      await reloadAll()
    })
  }

  function handleUpdateStatus(orderId: string, status: OrderStatus) {
    startTransition(async () => {
      await updateOrderStatusAction(orderId, status)
      await reloadAll()
    })
  }

  function handleDeleteOrder(orderId: string, studentName: string) {
    if (!confirm(`Deseja excluir permanentemente o pedido de "${studentName}"?`)) return
    startTransition(async () => {
      await deleteOrderAction(orderId)
      await reloadAll()
    })
  }

  // Filtragem de Pedidos
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderFilter === 'all' || o.status === orderFilter
    const q = orderSearch.toLowerCase().trim()
    const matchSearch =
      !q ||
      (o.student?.full_name && o.student.full_name.toLowerCase().includes(q)) ||
      (o.product?.name && o.product.name.toLowerCase().includes(q)) ||
      (o.notes && o.notes.toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  // Estatísticas e contadores de estoque em tempo real
  const stockStats = useMemo(() => {
    let totalStockUnits = 0
    let totalReservedUnits = 0
    let outOfStockCount = 0
    let lowStockCount = 0
    let okCount = 0

    const ordersByProduct: Record<string, { reserved: number; delivered: number }> = {}

    orders.forEach((o) => {
      const pid = o.product_id
      if (!ordersByProduct[pid]) {
        ordersByProduct[pid] = { reserved: 0, delivered: 0 }
      }
      const q = Number(o.quantity) || 1
      if (o.status === 'reserved' || o.status === 'paid') {
        ordersByProduct[pid].reserved += q
        totalReservedUnits += q
      } else if (o.status === 'delivered') {
        ordersByProduct[pid].delivered += q
      }
    })

    products.forEach((p) => {
      const s = p.stock ?? 0
      totalStockUnits += s
      if (s === 0) {
        outOfStockCount++
      } else if (s <= 3) {
        lowStockCount++
      } else {
        okCount++
      }
    })

    return {
      totalStockUnits,
      totalReservedUnits,
      outOfStockCount,
      lowStockCount,
      okCount,
      ordersByProduct,
    }
  }, [products, orders])

  // Contagem de itens por subcategoria (CLF, Sanda, Tai Chi, Equipamentos)
  const subcategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { CLF: 0, Sanda: 0, 'Tai Chi': 0, Equipamentos: 0 }
    products.forEach((p) => {
      const sub = getProductSubcategory(p)
      counts[sub] = (counts[sub] || 0) + 1
    })
    return counts
  }, [products])

  // Filtragem e busca de itens do estoque por subcategoria e texto
  const filteredInventory = useMemo(() => {
    const q = inventorySearch.toLowerCase().trim()
    return products.filter((p) => {
      const sub = getProductSubcategory(p)
      const matchSub = selectedSubcategory === 'Todos' || sub === selectedSubcategory
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      return matchSub && matchSearch
    })
  }, [products, inventorySearch, selectedSubcategory])

  function handleStockChange(productId: string, newValue: number) {
    const safe = Math.max(0, Math.floor(newValue))
    setStockDrafts((prev) => ({ ...prev, [productId]: safe }))
  }

  async function handleQuickStockSave(productId: string, newStock: number) {
    setSavingStockId(productId)
    try {
      const res = await updateProductStockAction(productId, newStock)
      if (res.success) {
        setStockFeedback((prev) => ({ ...prev, [productId]: '✓ Salvo!' }))
        setTimeout(() => {
          setStockFeedback((prev) => {
            const next = { ...prev }
            delete next[productId]
            return next
          })
        }, 2000)
        await reloadAll()
      } else {
        alert(res.error || 'Erro ao atualizar estoque')
      }
    } finally {
      setSavingStockId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── SELETOR DE ABAS DO ADMIN ───────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl flex-wrap">
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              tab === 'orders'
                ? 'bg-[var(--color-gold)] text-black shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>📋</span>
            <span>Pedidos & Reservas</span>
            <span className="w-5 h-5 rounded-full bg-black/80 text-gold text-[10px] font-black flex items-center justify-center">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('inventory')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'inventory'
                ? 'bg-[var(--color-gold)] text-black shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>📦</span>
            <span>Estoque ({products.length})</span>
            {stockStats.outOfStockCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500" title="Itens esgotados" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab('products')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              tab === 'products'
                ? 'bg-[var(--color-gold)] text-black shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>🏷️</span>
            <span>Catálogo ({products.length})</span>
          </button>
        </div>

        {(tab === 'products' || tab === 'inventory') && (
          <button
            type="button"
            onClick={handleOpenNewProduct}
            className="btn btn-gold btn-sm px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>➕</span>
            <span>Novo Produto</span>
          </button>
        )}
      </div>

      {/* ── ABA 1: PEDIDOS & RESERVAS DOS ALUNOS ────────────────── */}
      {tab === 'orders' && (
        <div className="flex flex-col gap-4">
          {/* Barra de Pesquisa e Filtros de Status */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por aluno, produto ou observação..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="input text-xs py-2.5 pl-9 w-full bg-[var(--color-bg-card)]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                🔍
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'reserved', label: 'Aguardando' },
                { id: 'paid', label: 'Pagos' },
                { id: 'delivered', label: 'Entregues' },
                { id: 'cancelled', label: 'Cancelados' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setOrderFilter(f.id as typeof orderFilter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    orderFilter === f.id
                      ? 'border-[var(--color-gold)] bg-gold/15 text-gold font-bold'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-muted hover:text-main'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Pedidos */}
          {filteredOrders.length === 0 ? (
            <div className="card p-8 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">📦</span>
              <p className="nkfs-h-p font-bold text-main">Nenhum pedido encontrado</p>
              <p className="text-xs text-muted">
                Quando os alunos reservarem uniformes ou equipamentos na loja, os pedidos aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredOrders.map((ord) => {
                const isPix = ord.payment_method === 'pix'
                const dateStr = new Date(ord.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div
                    key={ord.id}
                    className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[var(--color-border)] shadow-xs hover:border-[var(--color-border-gold)] transition-all"
                  >
                    {/* Aluno e Produto */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                        {isPix ? '💠' : '🏢'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-main truncate">
                            {ord.student?.full_name || 'Aluno'}
                          </h4>
                          {ord.student?.phone && (
                            <a
                              href={`https://wa.me/55${ord.student.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                              title="Conversar no WhatsApp"
                            >
                              <span>📱</span>
                              <span>{ord.student.phone}</span>
                            </a>
                          )}
                          <span className="text-[11px] text-faint">• {dateStr}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-muted flex-wrap">
                          <span className="font-bold text-main">
                            {ord.quantity}x {ord.product?.name || ord.notes || 'Produto'}
                          </span>
                          <span>•</span>
                          <span className="text-gold font-extrabold">
                            {ord.total_price.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                          <span>•</span>
                          <span className={isPix && ord.status === 'paid' ? 'text-emerald-400 font-bold' : 'text-muted'}>
                            {isPix
                              ? ord.status === 'paid'
                                ? '✓ Pago via PIX'
                                : 'Aguardando PIX'
                              : ord.status === 'paid'
                              ? '✓ Pago na Recepção'
                              : 'Pagar na Recepção'}
                          </span>
                          {ord.notes?.includes('[PIX confirmado pelo aluno') && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              📱 PIX Confirmado pelo Aluno
                            </span>
                          )}
                        </div>

                        {ord.notes && !ord.notes.startsWith('[Produto:') && (
                          <p className="text-[11px] text-amber-500/90 font-medium mt-1">
                            💬 Obs: {ord.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Ações de Status do Pedido */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {ord.status === 'reserved' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(ord.id, 'paid')}
                            disabled={isPending}
                            className="btn btn-secondary btn-sm py-1 px-2.5 text-xs font-bold text-emerald-400"
                            title="Confirmar pagamento"
                          >
                            ✓ Pago
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(ord.id, 'delivered')}
                            disabled={isPending}
                            className="btn btn-gold btn-sm py-1 px-2.5 text-xs font-bold"
                            title="Marcar como entregue ao aluno"
                          >
                            📦 Entregue
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(ord.id, 'cancelled')}
                            disabled={isPending}
                            className="text-xs text-muted hover:text-red-400 p-1"
                            title="Cancelar pedido"
                          >
                            ✕
                          </button>
                        </>
                      )}

                      {ord.status === 'paid' && (
                        <>
                          <Badge variant={isPix ? 'success' : 'gold'}>
                            {isPix ? '✓ Pago (PIX)' : '✓ Pago'}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(ord.id, 'delivered')}
                            disabled={isPending}
                            className="btn btn-gold btn-sm py-1 px-2.5 text-xs font-bold"
                          >
                            📦 Entregar
                          </button>
                        </>
                      )}

                      {ord.status === 'delivered' && (
                        <Badge variant="success">Entregue</Badge>
                      )}

                      {ord.status === 'cancelled' && (
                        <Badge variant="error">Cancelado</Badge>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteOrder(
                            ord.id,
                            ord.student?.full_name || ord.product?.name || 'este aluno'
                          )
                        }
                        disabled={isPending}
                        className="text-muted hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-xs ml-0.5 cursor-pointer"
                        title="Excluir registro deste pedido"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ABA 2: CONTAGEM DE ESTOQUE (LIMPO, COMPACTO E COM SUBCATEGORIAS) ── */}
      {tab === 'inventory' && (
        <div className="flex flex-col gap-3">
          {/* Barra Superior Compacta: Resumo + Busca */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📦</span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-main">
                  Contagem de Estoque
                </span>
                <span className="text-xs text-muted">
                  • <strong className="text-gold font-bold">{stockStats.totalStockUnits}</strong> unidades no total
                  {stockStats.outOfStockCount > 0 && (
                    <span className="text-red-400 font-semibold ml-1.5">
                      ({stockStats.outOfStockCount} esgotado{stockStats.outOfStockCount > 1 ? 's' : ''})
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar item..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="input text-xs py-1.5 pl-8 pr-7 w-full bg-[var(--color-bg-elevated)]"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
                🔍
              </span>
              {inventorySearch && (
                <button
                  type="button"
                  onClick={() => setInventorySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-main"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Menu de Subcategorias: CLF | Sanda | Tai Chi | Equipamentos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {(['Todos', 'CLF', 'Sanda', 'Tai Chi', 'Equipamentos'] as const).map((sub) => {
              const isSelected = selectedSubcategory === sub
              const count = sub === 'Todos' ? products.length : subcategoryCounts[sub] || 0

              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--color-gold)] text-black shadow-xs font-black'
                      : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-muted hover:text-main'
                  }`}
                >
                  <span>{sub === 'Todos' ? '🏷️' : getSubcategoryIcon(sub)}</span>
                  <span>{sub}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-black/80 text-gold' : 'bg-[var(--color-bg-elevated)] text-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Lista Compacta de Cada Item */}
          {filteredInventory.length === 0 ? (
            <div className="card p-6 text-center text-xs text-muted">
              Nenhum produto encontrado nesta subcategoria.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden shadow-xs">
              {filteredInventory.map((p) => {
                const stockVal = stockDrafts[p.id] !== undefined ? stockDrafts[p.id] : (p.stock ?? 0)
                const isDifferent = stockDrafts[p.id] !== undefined && stockDrafts[p.id] !== (p.stock ?? 0)
                const isSaving = savingStockId === p.id
                const feedback = stockFeedback[p.id]

                const isOut = (p.stock ?? 0) === 0
                const isLow = (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 3
                const sub = getProductSubcategory(p)
                const icon = getSubcategoryIcon(sub)

                return (
                  <div
                    key={p.id}
                    className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
                  >
                    {/* Item: Foto/Ícone + Nome + Subcategoria / Preço */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center text-lg shrink-0">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{icon}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-main truncate">
                            {p.name}
                          </h4>
                          {isOut ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 shrink-0">
                              Esgotado
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                              Baixo ({p.stock})
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-muted truncate">
                          <span className="text-gold font-bold">{sub}</span> • <span className="text-main font-semibold">{p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </p>
                      </div>
                    </div>

                    {/* Controle Direto de Estoque: [-] [ QTD ] [+] [Salvar] */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-elevated)] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleStockChange(p.id, stockVal - 1)}
                          disabled={stockVal <= 0 || isSaving}
                          className="w-7 h-7 flex items-center justify-center text-main font-bold hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-colors"
                          title="Diminuir"
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={stockVal}
                          onChange={(e) => handleStockChange(p.id, parseInt(e.target.value, 10) || 0)}
                          disabled={isSaving}
                          className="w-12 text-center text-xs font-bold text-main bg-transparent py-1 border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          type="button"
                          onClick={() => handleStockChange(p.id, stockVal + 1)}
                          disabled={isSaving}
                          className="w-7 h-7 flex items-center justify-center text-main font-bold hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-colors"
                          title="Aumentar"
                        >
                          +
                        </button>
                      </div>

                      {feedback ? (
                        <span className="text-[11px] font-bold text-emerald-400 px-2 py-1">
                          {feedback}
                        </span>
                      ) : isDifferent ? (
                        <button
                          type="button"
                          onClick={() => handleQuickStockSave(p.id, stockVal)}
                          disabled={isSaving}
                          className="btn btn-gold btn-sm px-2.5 py-1 text-xs font-bold shrink-0 shadow-xs"
                        >
                          {isSaving ? <Spinner size="sm" /> : 'Salvar'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ABA 3: CATÁLOGO DE PRODUTOS (GESTÃO) ────────────────── */}
      {tab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className={`card p-4 flex flex-col justify-between gap-3 border transition-all ${
                p.active
                  ? 'border-[var(--color-border)] hover:border-[var(--color-border-gold)]'
                  : 'border-red-500/20 opacity-60 bg-red-500/5'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="nkfs-tag-p text-gold font-bold uppercase">
                    {getProductSubcategory(p)}
                  </span>
                  <Badge variant={p.active ? 'success' : 'error'}>
                    {p.active ? 'Ativo' : 'Pausado'}
                  </Badge>
                </div>

                <h3 className="text-sm font-extrabold text-main mt-1 line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                  {p.description || 'Sem descrição cadastrada.'}
                </p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--color-border)]/50">
                  <span className="text-base font-black text-gold">
                    {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-xs text-muted">
                    Estoque: <strong>{p.stock ?? '∞'}</strong>
                  </span>
                </div>
              </div>

              {/* Botões de Ação do Produto */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => handleToggleActive(p)}
                  disabled={isPending}
                  className="btn btn-secondary btn-sm py-1 px-2.5 text-xs font-semibold"
                >
                  {p.active ? 'Pausar' : 'Ativar'}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditProduct(p)}
                  disabled={isPending}
                  className="btn btn-gold btn-sm py-1 px-2.5 text-xs font-bold"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(p)}
                  disabled={isPending}
                  className="p-1.5 text-muted hover:text-red-400 transition-colors"
                  title="Excluir produto"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: ADICIONAR / EDITAR PRODUTO ──────────────────── */}
      {editingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
        >
          <div className="w-full max-w-lg bg-[var(--color-bg)] border border-[var(--color-border-gold)] rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-left my-auto animate-scale-up relative">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <h3 className="text-base sm:text-lg font-bold text-main">
                {editingProduct.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-muted hover:text-main p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-3">
              <div className="field">
                <label className="label text-xs font-bold text-muted">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Uniforme Tradicional Shaolin"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="field">
                  <label className="label text-xs font-bold text-muted">Subcategoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="select text-xs"
                  >
                    <option value="CLF">🥋 CLF (Choy Lay Fut)</option>
                    <option value="Sanda">🥊 Sanda (Boxe Chinês)</option>
                    <option value="Tai Chi">☯️ Tai Chi</option>
                    <option value="Equipamentos">🛡️ Equipamentos</option>
                  </select>
                </div>

                <div className="field">
                  <label className="label text-xs font-bold text-muted">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div className="field">
                  <label className="label text-xs font-bold text-muted">Estoque</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label text-xs font-bold text-muted">Descrição</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes sobre tecido, medidas, indicação de uso..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="textarea text-xs"
                />
              </div>

              {/* Upload de Foto do Produto */}
              <div className="field">
                <label className="label text-xs font-bold text-muted">Foto do Produto (Upload ou Link)</label>

                <div className="flex flex-col gap-2 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                  {formImageUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg bg-black border border-[var(--color-border)] overflow-hidden shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formImageUrl}
                          alt="Pré-visualização"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-green-500 truncate">
                          ✓ Foto carregada
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-gold hover:underline cursor-pointer font-semibold">
                            Trocar foto
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              disabled={isUploadingImage}
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-muted text-xs">•</span>
                          <button
                            type="button"
                            onClick={() => setFormImageUrl('')}
                            className="text-[11px] text-red-400 hover:underline font-semibold"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[var(--color-border)] rounded-lg text-center gap-1.5">
                      <span className="text-2xl">📸</span>
                      <p className="text-xs font-bold text-main">Selecione uma foto do seu dispositivo</p>
                      <p className="text-[10px] text-muted">JPG, PNG ou WEBP (máx. 5MB)</p>
                      <label className="btn btn-outline btn-sm text-xs font-bold mt-1 cursor-pointer">
                        {isUploadingImage ? (
                          <>
                            <Spinner size="sm" />
                            <span>Enviando foto...</span>
                          </>
                        ) : (
                          <span>📁 Escolher Arquivo</span>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          disabled={isUploadingImage}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  <input
                    type="url"
                    placeholder="Ou cole a URL da imagem aqui: https://..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="input text-xs font-mono"
                  />
                </div>
              </div>

              {modalError && (
                <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-400 font-semibold">
                  ⚠️ {modalError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)] mt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  disabled={isPending}
                  className="btn btn-secondary btn-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-gold btn-sm px-4"
                >
                  {isPending ? <Spinner size="sm" /> : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
