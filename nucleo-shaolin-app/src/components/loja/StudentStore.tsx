'use client'

import { useState, useMemo } from 'react'
import type { Product, ProductOrder } from '@/types/database'
import { ProductModal } from './ProductModal'
import { EditOrderModal } from './EditOrderModal'
import { Badge } from '@/components/ui/Badge'
import { getStudentOrdersAction, deleteStudentOrderAction } from '@/app/aluno/loja/actions'
import {
  STORE_SUBCATEGORIES,
  getProductSubcategory,
  getSubcategoryIcon,
} from '@/lib/store-defaults'

interface StudentStoreProps {
  initialProducts: Product[]
  initialOrders: ProductOrder[]
}

export function StudentStore({ initialProducts, initialOrders }: StudentStoreProps) {
  const [products] = useState<Product[]>(initialProducts)
  const [orders, setOrders] = useState<ProductOrder[]>(initialOrders)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingOrder, setEditingOrder] = useState<ProductOrder | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [viewTab, setViewTab] = useState<'catalog' | 'orders'>('catalog')

  // Menu de Subcategorias Oficiais: Todos, CLF, Sanda, Tai Chi, Equipamentos
  const categories = useMemo(() => {
    return ['Todos', ...STORE_SUBCATEGORIES]
  }, [])

  // Filtragem ultra-rápida no cliente por subcategoria e busca
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim()
    return products.filter((p) => {
      const sub = getProductSubcategory(p)
      const matchCat = selectedCategory === 'Todos' || sub === selectedCategory
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        sub.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [products, search, selectedCategory])

  async function refreshOrders() {
    const updated = await getStudentOrdersAction()
    setOrders(updated)
  }

  async function handleDeleteOrder(ord: ProductOrder) {
    const productName = ord.product?.name || ord.notes || 'esta reserva'
    if (
      !window.confirm(
        `Tem certeza que deseja cancelar e excluir sua reserva de "${productName}"?`
      )
    ) {
      return
    }

    setDeletingOrderId(ord.id)
    try {
      const res = await deleteStudentOrderAction(ord.id)
      if (res.success) {
        await refreshOrders()
      } else {
        alert(res.error || 'Não foi possível excluir a reserva.')
      }
    } finally {
      setDeletingOrderId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── SELETOR DE ABA (CATÁLOGO vs MEUS PEDIDOS) ──────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl">
          <button
            type="button"
            onClick={() => setViewTab('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewTab === 'catalog'
                ? 'bg-[var(--color-gold)] text-black shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>🛍️</span>
            <span>Catálogo</span>
          </button>
          <button
            type="button"
            onClick={() => setViewTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewTab === 'orders'
                ? 'bg-[var(--color-gold)] text-black shadow-xs'
                : 'text-muted hover:text-main'
            }`}
          >
            <span>📋</span>
            <span>Minhas Reservas</span>
            {orders.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>
        </div>

        <span className="text-xs text-muted hidden sm:inline">
          Retirada oficial na escola Núcleo Shaolin
        </span>
      </div>

      {/* ── ABA 1: CATÁLOGO DE PRODUTOS ────────────────────────── */}
      {viewTab === 'catalog' && (
        <div className="flex flex-col gap-4">
          {/* Barra de Pesquisa & Filtros de Categoria */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por uniforme, faixa, arma ou equipamento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input text-xs py-2.5 pl-9 w-full bg-[var(--color-bg-card)]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                🔍
              </span>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-main"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Chips de Categoria */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'border-[var(--color-gold)] bg-gold/15 text-gold font-bold'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-muted hover:text-main'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Cards de Produtos */}
          {filteredProducts.length === 0 ? (
            <div className="card p-8 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">🔍</span>
              <p className="nkfs-h-p font-bold text-main">Nenhum produto encontrado</p>
              <p className="text-xs text-muted">
                Tente buscar por outro termo ou selecione a categoria &quot;Todos&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredProducts.map((p) => {
                const sub = getProductSubcategory(p)
                const icon = getSubcategoryIcon(sub)

                const isOut = p.stock !== null && p.stock <= 0
                const isLow = p.stock !== null && p.stock > 0 && p.stock <= 3

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`card p-3.5 sm:p-4 flex flex-col justify-between gap-3 hover:border-[var(--color-gold)] transition-all group cursor-pointer shadow-sm hover:shadow-md ${
                      isOut ? 'opacity-85' : ''
                    }`}
                  >
                    <div>
                      {/* Imagem ou Ícone Temático */}
                      <div className="w-full h-28 sm:h-36 rounded-xl bg-gradient-to-br from-[var(--color-bg-elevated)] to-amber-500/10 border border-[var(--color-border)] flex items-center justify-center text-4xl sm:text-5xl group-hover:scale-105 transition-transform overflow-hidden relative">
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
                        <span className="absolute top-2 left-2 nkfs-tag-p text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                          {sub}
                        </span>

                        {isOut && (
                          <span className="absolute inset-x-0 bottom-0 py-1 bg-red-600/90 text-white text-[11px] font-black uppercase text-center tracking-wider backdrop-blur-xs">
                            Esgotado
                          </span>
                        )}
                        {!isOut && isLow && (
                          <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-xs">
                            Restam {p.stock}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-main group-hover:text-gold transition-colors mt-2.5 leading-snug line-clamp-2">
                        {p.name}
                      </h3>

                      {p.description && (
                        <p className="text-[11px] text-muted line-clamp-2 mt-1 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-muted uppercase font-bold block leading-none">
                          Preço
                        </span>
                        <span className="text-sm sm:text-base font-black text-gold leading-tight">
                          {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>

                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-muted bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shrink-0">
                          Esgotado
                        </span>
                      ) : (
                        <span className="btn btn-gold btn-sm py-1 px-2.5 text-xs font-bold shrink-0 group-hover:shadow-xs">
                          Comprar
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ABA 2: MINHAS RESERVAS / PEDIDOS ───────────────────── */}
      {viewTab === 'orders' && (
        <div className="flex flex-col gap-3">
          {orders.length === 0 ? (
            <div className="card p-8 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">📋</span>
              <p className="nkfs-h-p font-bold text-main">Você ainda não possui pedidos</p>
              <p className="text-xs text-muted max-w-sm">
                Navegue pelo catálogo e reserve uniformes, faixas ou equipamentos para pagar e retirar na recepção.
              </p>
              <button
                type="button"
                onClick={() => setViewTab('catalog')}
                className="btn btn-gold btn-sm mt-2 font-bold"
              >
                Explorar Catálogo →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {orders.map((ord) => {
                const isPix = ord.payment_method === 'pix'
                const statusBadge =
                  ord.status === 'delivered' ? (
                    <Badge variant="success">Entregue</Badge>
                  ) : ord.status === 'paid' ? (
                    <Badge variant="gold">Pago</Badge>
                  ) : ord.status === 'cancelled' ? (
                    <Badge variant="error">Cancelado</Badge>
                  ) : (
                    <Badge variant="warning">
                      {isPix ? 'Aguardando PIX' : 'Reservado na Recepção'}
                    </Badge>
                  )

                const dateStr = new Date(ord.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })

                const cleanNotes = (ord.notes || '')
                  .replace(/\s*\[Produto:[^\]]+\]\s*/g, '')
                  .trim()

                const canEdit = ord.status !== 'delivered'

                return (
                  <div
                    key={ord.id}
                    className="card p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border border-[var(--color-border)] shadow-xs hover:border-[var(--color-border-gold)] transition-all"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                        {isPix ? '💠' : '🏢'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-main truncate">
                            {ord.product?.name || ord.notes?.match(/\[Produto:\s*([^\]]+)\]/)?.[1] || 'Produto Reservado'}
                          </h4>
                          {statusBadge}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5 flex-wrap">
                          <span>Qtd: <strong>{ord.quantity}</strong></span>
                          <span>•</span>
                          <span>{isPix ? 'Via PIX' : 'Pagamento na Recepção'}</span>
                          <span>•</span>
                          <span>{dateStr}</span>
                        </div>
                        {cleanNotes && (
                          <p className="text-[11px] text-amber-500/90 font-medium mt-1">
                            💬 Obs: {cleanNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2.5 md:pt-0 w-full md:w-auto">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-muted uppercase font-bold block leading-none md:hidden">
                          Total
                        </span>
                        <span className="text-sm sm:text-base font-black text-gold">
                          {ord.total_price.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </div>

                      {/* Botões de Ação: Editar e Excluir */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {isPix && ord.status === 'reserved' && (
                          <button
                            type="button"
                            onClick={() => setEditingOrder(ord)}
                            className="btn btn-sm py-1 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Abrir QR Code e pagar via PIX"
                          >
                            <span>💠</span>
                            <span>Pagar PIX</span>
                          </button>
                        )}

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => setEditingOrder(ord)}
                            className="btn btn-secondary btn-sm py-1 px-2.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Editar quantidade, pagamento ou observações"
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(ord)}
                          disabled={deletingOrderId === ord.id}
                          className="btn btn-secondary btn-sm py-1 px-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Cancelar e excluir reserva"
                        >
                          {deletingOrderId === ord.id ? (
                            <span className="text-[10px]">...</span>
                          ) : (
                            <>
                              <span>🗑️</span>
                              <span>Excluir</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL DE COMPRA / RESERVA ──────────────────────────── */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOrderSuccess={() => {
            refreshOrders()
          }}
        />
      )}

      {/* ── MODAL DE EDIÇÃO DE RESERVA ─────────────────────────── */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSuccess={() => {
            refreshOrders()
          }}
        />
      )}
    </div>
  )
}
