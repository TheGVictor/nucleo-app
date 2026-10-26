'use client'

import { useState, useTransition } from 'react'
import type { ProductOrder, OrderPaymentMethod } from '@/types/database'
import {
  updateStudentOrderAction,
  deleteStudentOrderAction,
  confirmStudentPixPaymentAction,
} from '@/app/aluno/loja/actions'
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
    .replace(/\s*\[PIX confirmado[^\]]+\]\s*/g, '')
    .trim()

  const [quantity, setQuantity] = useState<number>(order.quantity || 1)
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(
    order.payment_method || 'reception'
  )
  const [notes, setNotes] = useState(initialNotes)
  const [step, setStep] = useState<'edit' | 'pix_screen' | 'paid_success'>('edit')
  const [copiedPix, setCopiedPix] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const currentTotal = unitPrice * quantity
  const productName = order.product?.name || order.notes || 'Produto Reservado'

  // Código PIX Copia e Cola formatado com o valor atualizado
  const simulatedPixCode = `00020126580014br.gov.bcb.pix0136loja@nucleoshaolin.com.br520400005303986540${currentTotal.toFixed(2).replace('.', '')}5802BR5925NUCLEO DE KUNG FU SHAOLIN6009SAO PAULO62070503***6304ABCD`

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
        if (paymentMethod === 'pix') {
          // Se escolheu PIX, avança para a tela do QR Code!
          setStep('pix_screen')
        } else {
          onClose()
        }
      } else {
        setErrorMsg(res.error || 'Erro ao atualizar a reserva.')
      }
    })
  }

  function handleConfirmPixPayment() {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await confirmStudentPixPaymentAction(order.id)
      if (res.success) {
        onSuccess()
        setStep('paid_success')
      } else {
        setErrorMsg(res.error || 'Erro ao registrar pagamento PIX.')
      }
    })
  }

  function handleCopyPix() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(simulatedPixCode)
        .then(() => {
          setCopiedPix(true)
          setTimeout(() => setCopiedPix(false), 2500)
        })
        .catch(() => {
          setCopiedPix(true)
        })
    } else {
      setCopiedPix(true)
    }
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
          className="absolute top-4 right-4 text-muted hover:text-main p-1 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors focus:outline-none cursor-pointer"
          title="Fechar"
        >
          ✕
        </button>

        {/* ── ETAPA 1: EDIÇÃO DOS DADOS DA RESERVA ──────────────── */}
        {step === 'edit' && (
          <>
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
                ⚠️ {errorMsg}
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
                        ? 'border-emerald-500 bg-emerald-500/15 shadow-xs'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="text-base mb-0.5">💠</div>
                    <div className="text-xs font-bold text-main leading-tight">Via PIX</div>
                    <div className="text-[10px] text-muted leading-tight mt-0.5">Gera QR Code imediato</div>
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
                  className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-semibold p-1 transition-colors cursor-pointer"
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
                    ) : paymentMethod === 'pix' ? (
                      <span>Salvar e Ver QR Code →</span>
                    ) : (
                      <span>Salvar Alterações</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

        {/* ── ETAPA 2: TELA DO QR CODE PIX ─────────────────────── */}
        {step === 'pix_screen' && (
          <div className="flex flex-col items-center gap-3 text-center py-1 animate-fade-in">
            <div className="flex items-center justify-between w-full pb-2 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-sm">💠 Pagamento via PIX</span>
              </div>
              <span className="text-sm font-black text-gold">
                {currentTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            {errorMsg && (
              <div className="w-full p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-400 font-semibold text-left">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Simulação do QR Code PIX */}
            <div className="p-3 bg-white rounded-xl shadow-md border-2 border-emerald-500/30 flex flex-col items-center justify-center">
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                className="w-40 h-40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="160" height="160" fill="white" />
                <rect x="15" y="15" width="40" height="40" fill="#0A1128" rx="4" />
                <rect x="23" y="23" width="24" height="24" fill="white" />
                <rect x="29" y="29" width="12" height="12" fill="#059669" rx="2" />

                <rect x="105" y="15" width="40" height="40" fill="#0A1128" rx="4" />
                <rect x="113" y="23" width="24" height="24" fill="white" />
                <rect x="119" y="29" width="12" height="12" fill="#059669" rx="2" />

                <rect x="15" y="105" width="40" height="40" fill="#0A1128" rx="4" />
                <rect x="23" y="113" width="24" height="24" fill="white" />
                <rect x="29" y="119" width="12" height="12" fill="#059669" rx="2" />

                <rect x="65" y="20" width="10" height="10" fill="#0A1128" />
                <rect x="85" y="25" width="10" height="10" fill="#0A1128" />
                <rect x="65" y="45" width="30" height="10" fill="#0A1128" />
                <rect x="65" y="65" width="10" height="30" fill="#059669" />
                <rect x="85" y="65" width="10" height="10" fill="#0A1128" />
                <rect x="105" y="65" width="20" height="10" fill="#0A1128" />
                <rect x="135" y="65" width="10" height="30" fill="#0A1128" />
                <rect x="65" y="105" width="15" height="15" fill="#0A1128" />
                <rect x="90" y="105" width="20" height="10" fill="#059669" />
                <rect x="120" y="105" width="15" height="15" fill="#0A1128" />
                <rect x="85" y="125" width="10" height="20" fill="#0A1128" />
                <rect x="105" y="130" width="35" height="15" fill="#0A1128" />
              </svg>
              <span className="text-[10px] text-gray-500 font-bold mt-1">
                Núcleo de Kung Fu Shaolin
              </span>
            </div>

            <p className="text-xs text-muted leading-tight">
              Aponte a câmera do aplicativo do seu banco ou copie o código abaixo:
            </p>

            {/* Código PIX Copia e Cola */}
            <div className="w-full flex items-center gap-2 bg-[var(--color-bg-elevated)] p-2 rounded-xl border border-[var(--color-border)]">
              <input
                type="text"
                readOnly
                value={simulatedPixCode}
                className="bg-transparent text-[11px] text-muted font-mono truncate flex-1 outline-none px-1"
              />
              <button
                type="button"
                onClick={handleCopyPix}
                className="btn btn-gold btn-sm px-3 py-1.5 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>{copiedPix ? '✓ Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {/* BOTÃO PROEMINENTE: JÁ FIZ O PAGAMENTO VIA PIX */}
            <button
              type="button"
              onClick={handleConfirmPixPayment}
              disabled={isPending}
              className="btn btn-full min-h-[46px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md mt-1"
            >
              {isPending ? (
                <>
                  <Spinner size="sm" />
                  <span>Notificando administração...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Já fiz o pagamento via PIX</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="text-xs text-muted hover:text-main hover:underline py-1"
            >
              Pagar mais tarde / Fechar
            </button>
          </div>
        )}

        {/* ── ETAPA 3: CONFIRMAÇÃO DE PAGAMENTO PIX CONCLUÍDO ─── */}
        {step === 'paid_success' && (
          <div className="flex flex-col items-center gap-3.5 text-center py-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-3xl flex items-center justify-center text-emerald-400">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-black text-main">Pagamento Informado!</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Seu pagamento de <strong>{productName}</strong> foi registrado com sucesso.
              </p>
            </div>

            <div className="w-full bg-[var(--color-bg-elevated)] border border-emerald-500/30 rounded-xl p-3.5 text-left flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border)]">
                <span className="text-muted">Status no Admin:</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <span>✓</span> Pago via PIX
                </span>
              </div>
              <p className="text-muted leading-relaxed">
                📍 O sistema já marcou seu pedido como <strong>Pago</strong> no painel de controle da escola. O item será preparado pelo seu Sifu ou Instrutor para entrega.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onSuccess()
                onClose()
              }}
              className="btn btn-gold w-full min-h-[44px] font-bold text-xs sm:text-sm mt-2"
            >
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
