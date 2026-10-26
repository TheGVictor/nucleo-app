'use client'

import { useState, useTransition } from 'react'
import type { Product } from '@/types/database'
import { createProductOrderAction, confirmStudentPixPaymentAction } from '@/app/aluno/loja/actions'
import { Spinner } from '@/components/ui/Spinner'

interface ProductModalProps {
  product: Product
  onClose: () => void
  onOrderSuccess: () => void
}

export function ProductModal({ product, onClose, onOrderSuccess }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<'details' | 'success_reception' | 'pix_screen' | 'paid_success'>('details')
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const totalPrice = product.price * quantity

  // Código PIX Copia e Cola fictício/simulado bem formatado no padrão EMV
  const simulatedPixCode = `00020126580014br.gov.bcb.pix0136loja@nucleoshaolin.com.br520400005303986540${totalPrice.toFixed(2).replace('.', '')}5802BR5925NUCLEO DE KUNG FU SHAOLIN6009SAO PAULO62070503***6304ABCD`

  function handleOrder(paymentMethod: 'reception' | 'pix') {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await createProductOrderAction({
        productId: product.id,
        quantity,
        paymentMethod,
        notes: notes.trim() || undefined,
      })

      if (res.success) {
        setCreatedOrderId(res.orderId || null)
        onOrderSuccess()
        if (paymentMethod === 'reception') {
          setStep('success_reception')
        } else {
          setStep('pix_screen')
        }
      } else {
        setErrorMsg(res.error || 'Não foi possível processar a reserva.')
      }
    })
  }

  function handleConfirmPixPayment() {
    if (!createdOrderId) {
      onOrderSuccess()
      onClose()
      return
    }
    setErrorMsg(null)
    startTransition(async () => {
      const res = await confirmStudentPixPaymentAction(createdOrderId)
      if (res.success) {
        onOrderSuccess()
        setStep('paid_success')
      } else {
        setErrorMsg(res.error || 'Erro ao registrar pagamento PIX.')
      }
    })
  }

  function handleCopyPix() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(simulatedPixCode).then(() => {
        setCopiedPix(true)
        setTimeout(() => setCopiedPix(false), 2500)
      }).catch(() => {
        // Fallback
        setCopiedPix(true)
      })
    } else {
      setCopiedPix(true)
    }
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
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* ── ETAPA 1: DETALHES DO PRODUTO & ESCOLHA DE PAGAMENTO ── */}
        {step === 'details' && (
          <>
            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-14 h-14 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-3xl shrink-0 shadow-xs">
                {product.category === 'Uniformes'
                  ? '🥋'
                  : product.category === 'Faixas'
                  ? '🎗️'
                  : product.category === 'Vestuário'
                  ? '👕'
                  : product.category === 'Equipamentos'
                  ? '🥊'
                  : '🛍️'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="nkfs-tag-p text-gold uppercase tracking-wider font-bold block mb-0.5">
                  {product.category}
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-main leading-tight truncate">
                  {product.name}
                </h2>
                <p className="text-lg font-black text-gold mt-1">
                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>

            {product.description && (
              <p className="text-xs sm:text-sm text-muted leading-relaxed bg-[var(--color-bg-elevated)] p-3 rounded-xl border border-[var(--color-border)]">
                {product.description}
              </p>
            )}

            {/* Quantidade e Tamanho/Observações */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-main" htmlFor="qtd">
                  Quantidade:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isPending}
                    className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-main font-bold flex items-center justify-center hover:bg-[var(--color-surface-hover)] disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span id="qtd" className="w-8 text-center text-sm font-extrabold text-main">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={isPending}
                    className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-main font-bold flex items-center justify-center hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted" htmlFor="notes">
                  Tamanho ou Observações (opcional):
                </label>
                <input
                  id="notes"
                  type="text"
                  placeholder="Ex: Tamanho M, cor preta..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isPending}
                  className="input text-xs py-2"
                />
              </div>

              {/* Totalizador */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 mt-1">
                <span className="text-xs text-muted font-bold">Total da Reserva:</span>
                <span className="text-base font-black text-gold">
                  {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-400 font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Opções de Ação Direta */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs text-muted font-semibold text-center">
                Selecione como deseja retirar e pagar:
              </span>

              {/* Opção 1: Reservar e Pagar na Recepção */}
              <button
                type="button"
                onClick={() => handleOrder('reception')}
                disabled={isPending}
                className="min-h-[46px] px-4 py-2.5 rounded-xl border border-[var(--color-border-gold)] bg-[var(--color-bg-elevated)] hover:bg-gold/15 text-main hover:text-gold font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <span>🏢</span>
                    <span>Reservar e pagar na recepção</span>
                  </>
                )}
              </button>

              {/* Opção 2: Pagar com PIX */}
              <button
                type="button"
                onClick={() => handleOrder('pix')}
                disabled={isPending}
                className="min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <span>💠</span>
                    <span>Pagar com PIX (QR Code)</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* ── ETAPA 2A: CONFIRMAÇÃO DE RESERVA NA RECEPÇÃO ── */}
        {step === 'success_reception' && (
          <div className="flex flex-col items-center gap-3.5 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-3xl flex items-center justify-center text-emerald-400">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-black text-main">Reserva Confirmada!</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Seu pedido de <strong>{quantity}x {product.name}</strong> foi registrado no sistema da escola.
              </p>
            </div>

            <div className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-3.5 text-left flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border)]">
                <span className="text-muted">Valor a pagar:</span>
                <strong className="text-gold font-black text-sm">
                  {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </div>
              <p className="text-muted leading-relaxed">
                📍 O produto será separado para você. Realize o pagamento diretamente na <strong>recepção do Núcleo Shaolin</strong> no seu próximo treino.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-gold w-full min-h-[44px] font-bold text-xs sm:text-sm mt-2"
            >
              Concluir
            </button>
          </div>
        )}

        {/* ── ETAPA 2B: TELA PIX (QR CODE + COPIA E COLA) ── */}
        {step === 'pix_screen' && (
          <div className="flex flex-col items-center gap-3 text-center py-1">
            <div className="flex items-center justify-between w-full pb-1 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-sm">💠 Pagamento via PIX</span>
              </div>
              <span className="text-xs font-bold text-gold">
                {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            {/* Simulação do QR Code PIX em SVG nítido */}
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
                {/* Cantos superiores e inferior esquerdo do QR Code */}
                <rect x="15" y="15" width="40" height="40" fill="#0A1128" rx="4" />
                <rect x="23" y="23" width="24" height="24" fill="white" />
                <rect x="29" y="29" width="12" height="12" fill="#059669" rx="2" />

                <rect x="105" y="15" width="40" height="40" fill="#0A1128" rx="4" />
                <rect x="113" y="23" width="24" height="24" fill="white" />
                <rect x="119" y="29" width="12" height="12" fill="#059669" rx="2" />

                <rect x="15" y="105" width="40" height="40" fill="#0A1128" rx="4" />
                <rect x="23" y="113" width="24" height="24" fill="white" />
                <rect x="29" y="119" width="12" height="12" fill="#059669" rx="2" />

                {/* Padrões centrais representando dados marciais */}
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

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-left text-[11px] text-muted leading-relaxed">
              💡 <strong>Instrução:</strong> Após a transferência, o seu produto ficará separado pelo Sifu/Instrutor e poderá ser retirado na recepção.
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
              className="text-xs text-muted hover:text-main hover:underline py-1 cursor-pointer"
            >
              Pagar mais tarde / Fechar
            </button>
          </div>
        )}

        {/* ── ETAPA 2C: CONFIRMAÇÃO DE PAGAMENTO PIX CONCLUÍDO ─── */}
        {step === 'paid_success' && (
          <div className="flex flex-col items-center gap-3.5 text-center py-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-3xl flex items-center justify-center text-emerald-400">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-black text-main">Pagamento Informado!</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Seu pagamento de <strong>{quantity}x {product.name}</strong> foi registrado com sucesso.
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
                onOrderSuccess()
                onClose()
              }}
              className="btn btn-gold w-full min-h-[44px] font-bold text-xs sm:text-sm mt-2 cursor-pointer"
            >
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
