-- ═══════════════════════════════════════════════════════════════
-- NÚCLEO DE KUNG FU SHAOLIN: MIGRATION LISTAS DE EXAME E INSTRUTORES
-- ═══════════════════════════════════════════════════════════════

-- NOTA IMPORTANTE DO POSTGRESQL:
-- O Postgres exige que a adição de um novo valor a um ENUM ('instructor') seja
-- executada e commitada separadamente antes de ser usada em transações posteriores.

-- ─────────────────────────────────────────────────────────────
-- PASSO 1: Execute APENAS esta linha primeiro e clique em RUN:
-- ─────────────────────────────────────────────────────────────
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'instructor';


-- ─────────────────────────────────────────────────────────────
-- PASSO 2: Em seguida, selecione e execute o bloco abaixo:
-- ─────────────────────────────────────────────────────────────

-- 1. Tabela de Listas de Exame (criadas por instrutores e enviadas ao Sifu)
CREATE TABLE IF NOT EXISTS public.exam_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  modality_id UUID REFERENCES public.modalities(id) ON DELETE SET NULL,
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'reviewed', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

-- 2. Tabela de Candidatos de cada Lista de Exame
CREATE TABLE IF NOT EXISTS public.exam_list_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_list_id UUID NOT NULL REFERENCES public.exam_lists(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_graduation_id UUID REFERENCES public.graduations(id) ON DELETE SET NULL,
  instructor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Habilitar RLS
ALTER TABLE public.exam_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_list_candidates ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (usando role::text para evitar lock de enum)
DROP POLICY IF EXISTS "Instrutores e Admins podem ler listas de exame" ON public.exam_lists;
CREATE POLICY "Instrutores e Admins podem ler listas de exame" ON public.exam_lists
  FOR SELECT USING (
    auth.uid() = instructor_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('instructor', 'admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Instrutores e Admins podem criar listas de exame" ON public.exam_lists;
CREATE POLICY "Instrutores e Admins podem criar listas de exame" ON public.exam_lists
  FOR INSERT WITH CHECK (
    auth.uid() = instructor_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('instructor', 'admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Admins e Sifu podem atualizar listas de exame" ON public.exam_lists;
CREATE POLICY "Admins e Sifu podem atualizar listas de exame" ON public.exam_lists
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('instructor', 'admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Acesso a candidatos de listas de exame" ON public.exam_list_candidates;
CREATE POLICY "Acesso a candidatos de listas de exame" ON public.exam_list_candidates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('instructor', 'admin', 'super_admin'))
  );
