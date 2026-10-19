export interface TechnicalItem {
  id: string
  label: string
  maxReps: number
  type?: 'repetition' | 'exam_check' | 'exam_eval'
}

export interface TechnicalCategory {
  id: string
  title: string
  column: 'left' | 'right'
  items: TechnicalItem[]
}

export interface TechnicalSheetSchema {
  beltSlug: string
  beltName: string
  headerSubtitle: string
  chineseTitle: string
  categories: TechnicalCategory[]
}

export interface TechnicalCardState {
  version: number
  beltSlug: string
  cardNumber?: string
  startDate?: string
  vistoDate?: string
  program?: string
  repetitions: Record<string, number> // technique_id -> count (0 to 6)
  examEvaluations?: {
    avaliacaoExame?: boolean
    liberacaoExame?: boolean
  }
  notes?: string
  updatedAt?: string
  updatedByName?: string
}

// ── SCHEMA DA FAIXA LARANJA (Conforme documento oficial) ──────
export const FAIXA_LARANJA_SCHEMA: TechnicalSheetSchema = {
  beltSlug: 'faixa-laranja',
  beltName: 'FAIXA LARANJA',
  headerSubtitle: 'ACOMPANHAMENTO TÉCNICO',
  chineseTitle: '少林功夫学院',
  categories: [
    // ── COLUNA ESQUERDA ───────────────────────────────────────
    {
      id: 'posturas',
      title: 'POSTURAS',
      column: 'left',
      items: [
        { id: 'postura_so_geuk', label: 'So Geuk', maxReps: 6 },
        { id: 'postura_gato_girando', label: 'Gato / Girando', maxReps: 6 },
        { id: 'postura_cavalo_garca', label: 'Cavalo / Garça', maxReps: 6 },
      ],
    },
    {
      id: 'bloqueios_ataques',
      title: 'BLOQUEIOS E ATAQUES',
      column: 'left',
      items: [
        { id: 'bloq_pak_choi', label: 'Pak Choi', maxReps: 6 },
        { id: 'bloq_cotovelo_4_dir', label: 'Cotovelo 4 Dir.', maxReps: 6 },
        { id: 'bloq_gum_jean', label: 'Gum Jean', maxReps: 6 },
      ],
    },
    {
      id: 'chutes_frente',
      title: 'CHUTES PERNA DA FRENTE',
      column: 'left',
      items: [
        { id: 'chute_frente_frontal', label: 'Frontal', maxReps: 6 },
        { id: 'chute_frente_faca_pe_1', label: 'Faca do Pé', maxReps: 6 },
        { id: 'chute_frente_faca_pe_2', label: 'Faca do Pé (Lateral)', maxReps: 6 },
      ],
    },
    {
      id: 'chutes_duplos',
      title: 'CHUTES DUPLOS (PERNA DE TRÁS)',
      column: 'left',
      items: [
        { id: 'chute_duplo_frontal', label: 'Frontal', maxReps: 6 },
        { id: 'chute_duplo_faca_pe_1', label: 'Faca do Pé', maxReps: 6 },
        { id: 'chute_duplo_faca_pe_2', label: 'Faca do Pé', maxReps: 6 },
      ],
    },
    {
      id: 'aplicacoes',
      title: 'APLICAÇÕES',
      column: 'left',
      items: [
        { id: 'aplic_numero_1', label: 'NÚMERO I', maxReps: 6 },
        { id: 'aplic_numero_2', label: 'NÚMERO II', maxReps: 6 },
        { id: 'aplic_numero_3', label: 'NÚMERO III', maxReps: 6 },
      ],
    },
    {
      id: 'basicos',
      title: 'BÁSICOS',
      column: 'left',
      items: [
        { id: 'basico_1', label: 'Bás. I', maxReps: 6 },
        { id: 'basico_2', label: 'Bás. II', maxReps: 6 },
        { id: 'basico_3', label: 'Bás. III', maxReps: 6 },
        { id: 'basico_4', label: 'Bás. IV', maxReps: 6 },
        { id: 'basico_5', label: 'Bás. V', maxReps: 6 },
      ],
    },
    {
      id: 'kati',
      title: 'Kati - NG LUN CHOI (Porto das Doze Rodas)',
      column: 'left',
      items: [
        { id: 'kati_p1', label: 'P. I', maxReps: 6 },
        { id: 'kati_p2', label: 'P. II', maxReps: 6 },
        { id: 'kati_p3', label: 'P. III', maxReps: 6 },
        { id: 'kati_p4', label: 'P. IV', maxReps: 6 },
      ],
    },
    {
      id: 'combate',
      title: 'COMBATE',
      column: 'left',
      items: [
        { id: 'combate_mov_luta', label: 'Mov. de Luta (Diagonais Recuando)', maxReps: 6 },
        { id: 'combate_aplic_bas_1', label: 'Aplic. Bás. 1', maxReps: 6 },
        { id: 'combate_aplic_bas_2', label: 'Aplic. Bás. 2', maxReps: 6 },
        { id: 'combate_aplic_bas_3', label: 'Aplic. Bás. 3', maxReps: 6 },
        { id: 'combate_aplic_bas_4', label: 'Aplic. Bás. 4', maxReps: 6 },
      ],
    },
    {
      id: 'rolamento',
      title: 'ROLAMENTO',
      column: 'left',
      items: [
        { id: 'rolamento_feto', label: 'Feto', maxReps: 6 },
        { id: 'rolamento_costas', label: 'Pelas Costas', maxReps: 6 },
        { id: 'rolamento_frente', label: 'Pela Frente', maxReps: 6 },
      ],
    },
    {
      id: 'parte_interna',
      title: 'PARTE INTERNA',
      column: 'left',
      items: [
        { id: 'interna_juventude', label: 'Juventude', maxReps: 6 },
        { id: 'interna_resp_2_tempos', label: 'Resp. 2 Tempos', maxReps: 6 },
        { id: 'interna_resp_4_tempos', label: 'Resp. 4 Tempos', maxReps: 6 },
        { id: 'interna_chun_ten', label: "Ch'un/Ten (1 Min)", maxReps: 6 },
      ],
    },
    {
      id: 'cursos',
      title: 'CURSOS',
      column: 'left',
      items: [
        { id: 'curso_lim_jien_kuan', label: 'Lim Jien Kuan', maxReps: 6 },
        { id: 'curso_acrobacias', label: 'Acrobacias', maxReps: 6 },
        { id: 'curso_bastao', label: 'Bastão', maxReps: 6 },
        { id: 'curso_louva_deus', label: 'Louva-Deus', maxReps: 6 },
      ],
    },

    // ── COLUNA DIREITA (PREPARAÇÃO PARA EXAME) ────────────────
    {
      id: 'exame_fisica',
      title: 'PARTE FÍSICA',
      column: 'right',
      items: [
        { id: 'exame_flex_palma', label: '15 Flexões Palma da Mão', maxReps: 6, type: 'exam_check' },
        { id: 'exame_flex_punho', label: '20 Flexões Punho', maxReps: 6, type: 'exam_check' },
        { id: 'exame_abs_curtas', label: '35 ABS Curtas', maxReps: 6, type: 'exam_check' },
        { id: 'exame_abs_longas', label: '38 ABS Longas', maxReps: 6, type: 'exam_check' },
        { id: 'exame_frontal_10x', label: 'Frontal P. Frente (10x)', maxReps: 6, type: 'exam_check' },
        { id: 'exame_perto_pe_10x', label: 'Perto do Pé P. Frente (10x)', maxReps: 6, type: 'exam_check' },
        { id: 'exame_faca_10x', label: 'Faca P. Frente (10x)', maxReps: 6, type: 'exam_check' },
      ],
    },
    {
      id: 'exame_mental',
      title: 'PARTE MENTAL',
      column: 'right',
      items: [
        { id: 'exame_cavalo_65s', label: 'Cavalo (65 seg)', maxReps: 6, type: 'exam_check' },
        { id: 'exame_crucifixo_65s', label: 'Crucifixo (65 seg)', maxReps: 6, type: 'exam_check' },
      ],
    },
    {
      id: 'exame_tecnica',
      title: 'PARTE TÉCNICA',
      column: 'right',
      items: [
        { id: 'exame_chutes_fase', label: 'Chutes da Fase', maxReps: 6, type: 'exam_check' },
        { id: 'exame_defesa_pessoal', label: 'Defesa Pessoal (3 Fases)', maxReps: 6, type: 'exam_check' },
        { id: 'exame_kati_formas', label: 'KATI (1" x 2" Formas)', maxReps: 6, type: 'exam_check' },
      ],
    },
    {
      id: 'exame_teorica',
      title: 'PARTE TEÓRICA',
      column: 'right',
      items: [
        { id: 'exame_teorica_significado', label: 'Kati - Significado', maxReps: 6, type: 'exam_check' },
        { id: 'exame_teorica_animais', label: 'Animais (Chinês)', maxReps: 6, type: 'exam_check' },
        { id: 'exame_teorica_nomes', label: 'Nomes (Equipe)', maxReps: 6, type: 'exam_check' },
      ],
    },
  ],
}

// ── REGISTRO DE TODAS AS FAIXAS (EXTENSÍVEL) ──────────────────
export const BELT_SCHEMAS: Record<string, TechnicalSheetSchema> = {
  'faixa-laranja': FAIXA_LARANJA_SCHEMA,
}

// Função auxiliar para obter o schema da faixa correspondente
export function getTechnicalSheetSchema(beltSlugOrName?: string | null): TechnicalSheetSchema {
  if (!beltSlugOrName) return FAIXA_LARANJA_SCHEMA
  const slug = beltSlugOrName.toLowerCase().trim().replace(/\s+/g, '-')
  return BELT_SCHEMAS[slug] || FAIXA_LARANJA_SCHEMA
}

// Representação visual dos traços de repetição (Tally Marks marciais)
export function getTallyDisplay(count: number): {
  strokes: string
  isComplete: boolean
  label: string
} {
  const safeCount = Math.max(0, Math.min(6, count))
  switch (safeCount) {
    case 0:
      return { strokes: '', isComplete: false, label: '0/6' }
    case 1:
      return { strokes: '│', isComplete: false, label: '1/6' }
    case 2:
      return { strokes: '││', isComplete: false, label: '2/6' }
    case 3:
      return { strokes: '│││', isComplete: false, label: '3/6' }
    case 4:
      return { strokes: '││││', isComplete: false, label: '4/6' }
    case 5:
      return { strokes: '卌', isComplete: false, label: '5/6' }
    case 6:
      return { strokes: '✓ 6', isComplete: true, label: '6/6' }
    default:
      return { strokes: `${safeCount}`, isComplete: safeCount >= 6, label: `${safeCount}/6` }
  }
}
