'use client'

import { useState, useTransition } from 'react'
import type { ProductOrder, OrderPaymentMethod } from '@/types/database'
import { updateStudentOrderAction, deleteStudentOrderAction } from '@/app/aluno/loja/actions'
import { Spinner } from '@/components/ui/Spinner'

interface EditOrderModalProps {
  order: ProductOrder
  onClose: () => void
  onSuccess: () => void
}

export function EditOrderModal({ order, onClose, onSuccess }: EditOrderModalProps) {
  const unitPrice =
    order.product?.price != null
      ? Number(order.product.price)
      : Number(order.total_price) / Math.max(1, order.quantity || 1)

  // Remove tag do nome do produto se estiver embutida na string de notas
  const initialNotes = (order.notes || '')
    .replace(/\s*\[Produto:[^\]]+\]\s*/g, '')
    .trim()

  const [quantity, setQuantity] = useState<number>(order.quantity || 1)
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(
    order.payment_method || 'reception'
  )
  const [notes, setNotes] = useState(initialNotes)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const currentTotal = unitPrice * quantity
  const productName = order.product?.name || order.notes || 'Produto Reservado'

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    startTransition(async () => {
      const res = await updateStudentOrderAction({
        orderId: order.id,
        quantity,
        paymentMethod,
        notes: notes.trim() || undefined,
      })

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setErrorMsg(res.error || 'Erro ao atualizar a reserva.')
      }
    })
  }

  function handleDelete() {
    if (
      !window.confirm(
        `Tem certeza que deseja cancelar e excluir esta reserva de "${productName}"?`
      )
    ) {
      return
    }

    setErrorMsg(null)
    startTransition(async () => {
      const res = await deleteStudentOrderAction(order.id)
      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setErrorMsg(res.error || 'Erro ao excluir a reserva.')
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose()
      }}
    >
      <div className="w-full max-w-md bg-[var(--color-bg)] border border-[var(--color-border-gold)] rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-left my-auto animate-scale-up relative">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-muted hover:text-main p-1 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors focus:outline-none"
          title="Fechar"
        >
          ✕
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
            ✏️
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-main leading-tight">
              Editar Reserva
            </h2>
            <p className="text-xs text-muted">Ajuste quantidade, pagamento ou observações</p>
          </div>
        </div>

        {/* Produto Resumo */}
        <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-muted block leading-none">
              Produto
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-main truncate mt-0.5">
              {productName}
            </p>
            <span className="text-[11px] text-gold font-bold">
              {unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} un.
            </span>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-muted block leading-none">
              Novo Total
            </span>
            <span className="text-sm sm:text-base font-black text-gold">
              {currentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Seletor de Quantidade */}
          <div>
            <label className="text-xs font-bold text-main block mb-1.5">Quantidade:</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isPending}
                className="w-10 h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-main font-bold hover:border-[var(--color-gold)] disabled:opacity-40 transition-colors flex items-center justify-center text-lg cursor-pointer"
              >
                -
              </button>
              <span className="w-12 text-center text-base font-black text-main">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={isPending}
                className="w-10 h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-main font-bold hover:border-[var(--color-gold)] transition-colors flex items-center justify-center text-lg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="text-xs font-bold text-main block mb-1.5">
              Forma de Pagamento:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('reception')}
                disabled={isPending}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'reception'
                    ? 'border-[var(--color-gold)] bg-amber-500/15 shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="text-base mb-0.5">🏢</div>
                <div className="text-xs font-bold text-main leading-tight">Na Recepção</div>
                <div className="text-[10px] text-muted leading-tight mt-0.5">Pagar e retirar no balcão</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                disabled={isPending}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'border-[var(--color-gold)] bg-amber-500/15 shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="text-base mb-0.5">💠</div>
                <div className="text-xs font-bold text-main leading-tight">Via PIX</div>
                <div className="text-[10px] text-muted leading-tight mt-0.5">Pagamento antecipado</div>
              </button>
            </div>
          </div>

          {/* Observações / Tamanho */}
          <div>
            <label className="text-xs font-bold text-main block mb-1">
              Observações ou Tamanho (opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              placeholder="Ex: Tamanho G, calça preta tamanho M"
              className="input w-full text-xs"
              maxLength={120}
            />
          </div>

          {/* Rodapé: Cancelar/Excluir vs Salvar */}
          <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-semibold p-1 transition-colors"
            >
              <span>🗑️</span>
              <span>Excluir Reserva</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="btn btn-secondary btn-sm text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-gold btn-sm text-xs font-bold flex items-center gap-1.5"
              >
                {isPending ? (
                  <>
                    <Spinner size="sm" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Alterações</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
