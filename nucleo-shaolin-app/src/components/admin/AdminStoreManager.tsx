'use client'

import { useState, useTransition } from 'react'
import type { Product, ProductOrder, OrderStatus } from '@/types/database'
import {
  saveProductAction,
  toggleProductActiveAction,
  deleteProductAction,
  updateOrderStatusAction,
  getAdminProductsAction,
  getAdminOrdersAction,
  deleteOrderAction,
} from '@/app/admin/loja/actions'
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
  const [tab, setTab] = useState<'orders' | 'products'>('orders')
  const [orderFilter, setOrderFilter] = useState<'all' | 'reserved' | 'paid' | 'delivered' | 'cancelled'>('all')
  const [orderSearch, setOrderSearch] = useState('')

  // Estado do Modal de Produto (Novo / Edição)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('Uniformes')
  const [formPrice, setFormPrice] = useState('')
  const [formStock, setFormStock] = useState('10')
  const [formDescription, setFormDescription] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)

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
    setFormCategory('Uniformes')
    setFormPrice('')
    setFormStock('10')
    setFormDescription('')
    setFormImageUrl('')
    setModalError(null)
  }

  function handleOpenEditProduct(p: Product) {
    setEditingProduct(p)
    setFormName(p.name)
    setFormCategory(p.category || 'Uniformes')
    setFormPrice(p.price.toString())
    setFormStock(p.stock !== null ? p.stock.toString() : '10')
    setFormDescription(p.description || '')
    setFormImageUrl(p.image_url || '')
    setModalError(null)
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

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── SELETOR DE ABAS DO ADMIN ───────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl">
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

        {tab === 'products' && (
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
                          <span className="text-muted">
                            {isPix ? 'Pagamento via PIX' : 'Pagar na Recepção'}
                          </span>
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
                          <Badge variant="gold">Pago</Badge>
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

      {/* ── ABA 2: CATÁLOGO DE PRODUTOS (GESTÃO) ────────────────── */}
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
                    {p.category}
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
                  <label className="label text-xs font-bold text-muted">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="select text-xs"
                  >
                    <option value="Uniformes">Uniformes</option>
                    <option value="Faixas">Faixas</option>
                    <option value="Equipamentos">Equipamentos</option>
                    <option value="Vestuário">Vestuário</option>
                    <option value="Acessórios">Acessórios</option>
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

              <div className="field">
                <label className="label text-xs font-bold text-muted">URL da Imagem (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto-produto.jpg"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="input text-xs"
                />
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
