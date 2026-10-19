'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import {
  type TechnicalSheetSchema,
  type TechnicalCardState,
  getTechnicalSheetSchema,
  getTallyDisplay,
} from '@/lib/technicalSheetData'
import { saveStudentTechnicalSheetAction } from '@/app/admin/attendance/technicalActions'

interface TechnicalSheetProps {
  student: {
    id: string
    full_name: string
    birth_date?: string
    created_at?: string
    photo_url?: string | null
  }
  initialState: TechnicalCardState
  isInstructor?: boolean
  modalityName?: string
  graduationName?: string
  graduationColor?: string
  onSaved?: () => void
}

export function TechnicalSheet({
  student,
  initialState,
  isInstructor = false,
  modalityName = 'Kung Fu Shaolin',
  graduationName = 'Faixa Laranja',
  graduationColor = '#FF8C00',
  onSaved,
}: TechnicalSheetProps) {
  const schema: TechnicalSheetSchema = getTechnicalSheetSchema(initialState.beltSlug)

  const [state, setState] = useState<TechnicalCardState>(initialState)
  const [history, setHistory] = useState<TechnicalCardState[]>([])
  const [isPending, startTransition] = useTransition()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showOriginalModal, setShowOriginalModal] = useState(false)

  // ── MANIPULAÇÃO DE REPETIÇÕES (0 a 6) ─────────────────────────
  function handleIncrement(itemId: string) {
    if (!isInstructor) return

    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(state))])
    setSaveSuccess(false)
    setSaveError(null)

    setState((prev) => {
      const current = prev.repetitions[itemId] || 0
      const next = current >= 6 ? 0 : current + 1
      return {
        ...prev,
        repetitions: {
          ...prev.repetitions,
          [itemId]: next,
        },
      }
    })
  }

  function handleDecrement(itemId: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation()
    if (!isInstructor) return

    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(state))])
    setSaveSuccess(false)

    setState((prev) => {
      const current = prev.repetitions[itemId] || 0
      const next = Math.max(0, current - 1)
      return {
        ...prev,
        repetitions: {
          ...prev.repetitions,
          [itemId]: next,
        },
      }
    })
  }

  function handleReset(itemId: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation()
    if (!isInstructor) return

    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(state))])
    setSaveSuccess(false)

    setState((prev) => {
      const updated = { ...prev.repetitions }
      delete updated[itemId]
      return {
        ...prev,
        repetitions: updated,
      }
    })
  }

  function handleToggleExamEval(key: 'avaliacaoExame' | 'liberacaoExame') {
    if (!isInstructor) return

    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(state))])
    setSaveSuccess(false)

    setState((prev) => ({
      ...prev,
      examEvaluations: {
        ...prev.examEvaluations,
        [key]: !prev.examEvaluations?.[key],
      },
    }))
  }

  // ── DESFAZER ÚLTIMA AÇÃO (UNDO) ──────────────────────────────
  function handleUndo() {
    if (history.length === 0) return
    const previous = history[history.length - 1]
    setHistory((prev) => prev.slice(0, prev.length - 1))
    setState(previous)
    setSaveSuccess(false)
  }

  // ── SALVAR FICHA NO BANCO (SUPABASE) ─────────────────────────
  function handleSave() {
    if (!isInstructor) return
    setSaveError(null)

    startTransition(async () => {
      const res = await saveStudentTechnicalSheetAction(student.id, state)
      if (res.success) {
        setSaveSuccess(true)
        setHistory([])
        if (onSaved) onSaved()
        setTimeout(() => setSaveSuccess(false), 4000)
      } else {
        setSaveError(res.error || 'Erro ao salvar ficha técnica')
      }
    })
  }

  // Contadores globais de progresso da ficha
  const totalItems = schema.categories.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  )
  const completedItems = Object.values(state.repetitions).filter(
    (count) => count >= 6
  ).length
  const progressPercent = Math.round((completedItems / (totalItems || 1)) * 100)

  const leftCategories = schema.categories.filter((c) => c.column === 'left')
  const rightCategories = schema.categories.filter((c) => c.column === 'right')

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      {/* ── BARRA DE FERRAMENTAS SUPERIOR (TOOLBAR) ──────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 rounded-[var(--radius-lg)] shadow-sm">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge variant={isInstructor ? 'gold' : 'muted'}>
            {isInstructor ? '🥋 Modo Edição do Instrutor' : '👤 Vista do Aluno'}
          </Badge>
          <span className="text-xs text-muted">
            Progresso Geral:{' '}
            <strong className="text-main font-bold">
              {completedItems}/{totalItems} técnicas ({progressPercent}%)
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Botão de Comparação / Ver Imagem Original */}
          <button
            type="button"
            onClick={() => setShowOriginalModal(true)}
            className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5"
            title="Ver a fotografia da ficha original de papel"
          >
            <span>📸</span>
            <span>Ver Foto da Ficha</span>
          </button>

          {/* Botão de Desfazer (Undo) para o instrutor */}
          {isInstructor && (
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 disabled:opacity-40"
              title="Desfazer última alteração de repetição"
            >
              <span>↩</span>
              <span>Desfazer</span>
            </button>
          )}

          {/* Botão de Salvar para o instrutor */}
          {isInstructor && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="btn btn-gold btn-sm text-xs flex items-center gap-1.5 font-bold shadow-sm"
            >
              {isPending ? (
                <>
                  <Spinner size="sm" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Salvar Ficha</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Alertas de Sucesso / Erro */}
      {saveSuccess && (
        <div className="p-3 rounded-[var(--radius-md)] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>Ficha técnica atualizada com sucesso! O aluno já pode visualizá-la.</span>
        </div>
      )}
      {saveError && (
        <div className="p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span>⚠️</span>
          <span>{saveError}</span>
        </div>
      )}

      {/* ── DOCUMENTO DA FICHA TÉCNICA (SEMPRE BRANCA COMO A FOLHA A4 FÍSICA) ── */}
      <div className="bg-white text-black border border-neutral-300 p-5 sm:p-8 rounded-sm shadow-2xl font-sans relative overflow-hidden select-none">
        
        {/* ── 1. CABEÇALHO PRETO CONFORME DOCUMENTO ORIGINAL ────────── */}
        <div className="bg-[#1C1C1C] text-white p-3 sm:p-4 rounded-t-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Brasão circular do Praticante de Kung Fu */}
            <div className="w-12 h-12 rounded-full border-2 border-white bg-white flex items-center justify-center shrink-0 text-2xl shadow-sm">
              🥋
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wider uppercase font-serif leading-tight">
                Núcleo de Kung Fu Shaolin
              </h1>
              <p className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-neutral-300 mt-0.5">
                {schema.headerSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-serif text-sm tracking-widest font-bold text-neutral-300 hidden sm:inline">
              {schema.chineseTitle}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-serif font-bold text-neutral-300">Nº</span>
              <div className="bg-white text-black px-3 py-1 rounded text-xs font-mono font-black border border-neutral-400 min-w-[70px] text-center shadow-inner">
                {state.cardNumber || student.id.slice(0, 4).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. FAIXA CINZA CLARO COM DADOS DO PRATICANTE ─────────── */}
        <div className="bg-[#ECECEC] border-x border-b border-neutral-300 p-2 sm:p-3 text-xs flex flex-col gap-1.5 mb-4 font-sans text-neutral-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* PRATICANTE */}
            <div className="flex items-center gap-2 flex-1">
              <span className="bg-[#666] text-white font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-xs shrink-0">
                Praticante
              </span>
              <span className="font-bold text-sm tracking-tight text-black border-b border-neutral-400 flex-1 px-1">
                {student.full_name}
              </span>
            </div>

            {/* DATA INÍCIO */}
            <div className="flex items-center gap-2">
              <span className="bg-[#666] text-white font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-xs shrink-0">
                Data Início
              </span>
              <span className="font-mono font-semibold text-xs border-b border-neutral-400 px-1 min-w-[85px] text-center">
                {state.startDate || '—'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-neutral-300">
            {/* PROGRAMA */}
            <div className="flex items-center gap-2 flex-1">
              <span className="bg-[#666] text-white font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-xs shrink-0">
                Programa
              </span>
              <span className="font-bold text-xs tracking-tight text-neutral-800 border-b border-neutral-400 flex-1 px-1">
                {modalityName}
              </span>
            </div>

            {/* DATA VISTO */}
            <div className="flex items-center gap-2">
              <span className="bg-[#666] text-white font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-xs shrink-0">
                Data Visto
              </span>
              <span className="font-mono font-bold text-xs border-b border-neutral-400 px-1 min-w-[85px] text-center text-emerald-800">
                {state.vistoDate || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. CORPO DA FICHA EM 2 COLUNAS CONFORME DOCUMENTO ORIGINAL ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-black">
          
          {/* ════════ COLUNA ESQUERDA: TÉCNICAS E REPETIÇÕES ════════ */}
          <div className="flex flex-col gap-4">
            {/* Header da Faixa */}
            <div className="border-b-2 border-black pb-0.5 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider font-serif text-black">
                {schema.beltName}
              </h2>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-2xs"
                style={{ backgroundColor: graduationColor }}
              >
                {graduationName}
              </span>
            </div>

            {leftCategories.map((category) => (
              <div key={category.id} className="flex flex-col gap-1">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-800 border-b border-neutral-300 pb-0.5">
                  {category.title}
                </h3>

                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {category.items.map((item) => {
                    const count = state.repetitions[item.id] || 0
                    const tally = getTallyDisplay(count)

                    return (
                      <div
                        key={item.id}
                        className="group relative flex items-center gap-1.5 text-xs py-0.5 px-0.5 rounded hover:bg-neutral-100 transition-colors"
                      >
                        {/* Checkbox Quadrado Estilo Ficha Física */}
                        <button
                          type="button"
                          disabled={!isInstructor}
                          onClick={() => handleIncrement(item.id)}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            handleDecrement(item.id)
                          }}
                          className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-xs border flex items-center justify-center font-mono font-bold transition-all relative ${
                            tally.isComplete
                              ? 'bg-neutral-900 text-white border-black'
                              : count > 0
                              ? 'bg-neutral-100 border-black text-black'
                              : 'bg-white border-neutral-600 text-transparent'
                          } ${isInstructor ? 'cursor-pointer hover:border-black hover:scale-105 active:scale-95' : 'cursor-default'}`}
                          title={
                            isInstructor
                              ? `${item.label} — ${tally.label}. Clique para adicionar repetição (ou botão direito para subtrair)`
                              : `${item.label} — ${tally.label}`
                          }
                        >
                          {/* Traços Nanquim / Tally Marks */}
                          <span className="text-[10px] sm:text-xs tracking-tighter leading-none font-bold">
                            {tally.strokes}
                          </span>
                        </button>

                        {/* Rótulo da Técnica */}
                        <span
                          onClick={() => isInstructor && handleIncrement(item.id)}
                          className={`text-xs ${
                            tally.isComplete
                              ? 'font-black text-black'
                              : count > 0
                              ? 'font-semibold text-neutral-900'
                              : 'text-neutral-800'
                          } ${isInstructor ? 'cursor-pointer' : ''}`}
                        >
                          {item.label}
                        </span>

                        {/* Mini Toolbar de Correção Rápida para o Instrutor */}
                        {isInstructor && count > 0 && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1 bg-white border border-neutral-400 rounded px-1 py-0.2 shadow-sm text-[9px]">
                            <button
                              type="button"
                              onClick={(e) => handleDecrement(item.id, e)}
                              className="px-1 hover:text-red-600 font-bold text-neutral-700"
                              title="Subtrair 1 repetição (-1)"
                            >
                              -
                            </button>
                            <span className="font-mono text-neutral-600 font-bold">{count}/6</span>
                            <button
                              type="button"
                              onClick={(e) => handleReset(item.id, e)}
                              className="px-1 hover:text-red-600 text-neutral-500"
                              title="Zerar técnica"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ════════ COLUNA DIREITA: PREPARAÇÃO PARA EXAME & NOTAS ════════ */}
          <div className="flex flex-col gap-4">
            <div className="border-b-2 border-black pb-0.5">
              <h2 className="text-sm font-black uppercase tracking-wider font-serif text-black">
                Preparação para Exame
              </h2>
            </div>

            {rightCategories.map((category) => (
              <div key={category.id} className="flex flex-col gap-1">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-800 border-b border-neutral-300 pb-0.5">
                  {category.title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                  {category.items.map((item) => {
                    const count = state.repetitions[item.id] || 0
                    const tally = getTallyDisplay(count)

                    return (
                      <div
                        key={item.id}
                        onClick={() => isInstructor && handleIncrement(item.id)}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          handleDecrement(item.id)
                        }}
                        className={`group flex items-center gap-1.5 text-xs py-0.5 px-1 rounded hover:bg-neutral-100 transition-colors select-none ${
                          isInstructor ? 'cursor-pointer' : ''
                        }`}
                      >
                        {/* Triângulo Preto (▲) idêntico ao documento original */}
                        <div
                          className={`w-4 h-4 shrink-0 flex items-center justify-center font-bold text-[10px] transition-transform ${
                            tally.isComplete
                              ? 'text-black scale-110'
                              : count > 0
                              ? 'text-neutral-700'
                              : 'text-neutral-400'
                          }`}
                        >
                          ▲
                        </div>

                        {/* Rótulo da Exigência Física/Mental */}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`block truncate text-xs ${
                              tally.isComplete
                                ? 'font-black text-black'
                                : count > 0
                                ? 'font-semibold text-neutral-900'
                                : 'text-neutral-800'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>

                        {/* Badge de Repetições */}
                        <span
                          className={`font-mono text-[10px] px-1 py-0.2 rounded shrink-0 border ${
                            tally.isComplete
                              ? 'bg-black text-white font-bold border-black'
                              : count > 0
                              ? 'bg-neutral-100 text-black font-semibold border-neutral-400'
                              : 'text-neutral-400 border-transparent'
                          }`}
                        >
                          {tally.label}
                        </span>

                        {/* Botão de exclusão rápida para o instrutor */}
                        {isInstructor && count > 0 && (
                          <button
                            type="button"
                            onClick={(e) => handleDecrement(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 px-1 font-bold text-xs"
                            title="Subtrair 1 repetição (-1)"
                          >
                            -
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* ── CÍRCULOS DE AVALIAÇÃO E LIBERAÇÃO DE EXAME ───────── */}
            <div className="border-t border-black pt-2 flex flex-col gap-1.5">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-800">
                Avaliação & Liberação
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Avaliação EXAME */}
                <button
                  type="button"
                  disabled={!isInstructor}
                  onClick={() => handleToggleExamEval('avaliacaoExame')}
                  className={`p-2 rounded border text-center flex items-center gap-2.5 transition-all ${
                    state.examEvaluations?.avaliacaoExame
                      ? 'bg-neutral-100 border-black text-black font-bold'
                      : 'bg-white border-neutral-300 text-neutral-600'
                  } ${isInstructor ? 'cursor-pointer hover:border-black' : 'cursor-default'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                      state.examEvaluations?.avaliacaoExame
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-400 text-neutral-400'
                    }`}
                  >
                    ●
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] uppercase tracking-wider font-bold block leading-tight">
                      Avaliação EXAME
                    </span>
                    <span className="text-[9px] text-neutral-500 block">
                      {state.examEvaluations?.avaliacaoExame ? '✓ Avaliado' : 'Pendente'}
                    </span>
                  </div>
                </button>

                {/* Liberação EXAME */}
                <button
                  type="button"
                  disabled={!isInstructor}
                  onClick={() => handleToggleExamEval('liberacaoExame')}
                  className={`p-2 rounded border text-center flex items-center gap-2.5 transition-all ${
                    state.examEvaluations?.liberacaoExame
                      ? 'bg-neutral-100 border-black text-black font-bold'
                      : 'bg-white border-neutral-300 text-neutral-600'
                  } ${isInstructor ? 'cursor-pointer hover:border-black' : 'cursor-default'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                      state.examEvaluations?.liberacaoExame
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-400 text-neutral-400'
                    }`}
                  >
                    ●
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] uppercase tracking-wider font-bold block leading-tight">
                      Liberação EXAME
                    </span>
                    <span className="text-[9px] text-neutral-500 block">
                      {state.examEvaluations?.liberacaoExame ? '✓ Liberado para Faixa' : 'Aguardando'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* ── CAMPO DE ANOTAÇÕES COM LINHAS PAUTADAS (CADERNO FÍSICO) ── */}
            <div className="border border-neutral-400 p-2.5 rounded-xs flex flex-col gap-1 bg-white">
              <label
                htmlFor="instructor-notes"
                className="text-[10px] font-black uppercase tracking-wider text-black flex items-center justify-between"
              >
                <span>Anotações:</span>
                {state.updatedByName && (
                  <span className="text-[9px] text-neutral-500 font-normal">
                    Por {state.updatedByName} em{' '}
                    {state.updatedAt ? new Date(state.updatedAt).toLocaleDateString('pt-BR') : ''}
                  </span>
                )}
              </label>

              {isInstructor ? (
                <textarea
                  id="instructor-notes"
                  rows={4}
                  value={state.notes || ''}
                  onChange={(e) => {
                    setSaveSuccess(false)
                    setState((prev) => ({ ...prev, notes: e.target.value }))
                  }}
                  placeholder="Escreva correções de base, detalhes de respiração, postura do cavalo, ou observações..."
                  className="w-full text-xs p-2 text-black bg-transparent focus:outline-none leading-6 font-sans resize-y"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #D1D5DB 23px, #D1D5DB 24px)',
                    lineHeight: '24px',
                  }}
                />
              ) : (
                <div
                  className="min-h-[80px] p-2 text-xs text-neutral-900 leading-6 font-sans"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #D1D5DB 23px, #D1D5DB 24px)',
                    lineHeight: '24px',
                  }}
                >
                  {state.notes ? (
                    state.notes
                  ) : (
                    <span className="text-neutral-400 italic">Nenhuma anotação registrada ainda.</span>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── MODAL: FOTOGRAFIA DA FICHA ORIGINAL DE PAPEL ────────── */}
      {showOriginalModal && (
        <div
          onClick={() => setShowOriginalModal(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-2xl border border-white/20 overflow-hidden flex flex-col"
          >
            <div className="p-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
              <div className="flex items-center gap-2">
                <span className="text-lg">📸</span>
                <span className="text-xs font-bold">
                  Fotografia da Ficha Original (Documento de Papel)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowOriginalModal(false)}
                className="text-xs font-bold text-neutral-400 hover:text-white px-2 py-1"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="overflow-auto p-2 bg-black flex items-center justify-center">
              <Image
                src="/fichas/faixa-laranja.png"
                alt="Ficha de Acompanhamento Técnico Original - Faixa Laranja"
                width={800}
                height={1100}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
