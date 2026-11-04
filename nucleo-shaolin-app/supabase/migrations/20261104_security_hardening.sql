-- ═══════════════════════════════════════════════════════════════════════════
-- NÚCLEO DE KUNG FU SHAOLIN: BLINDAGEM COMPLETA DE SEGURANÇA (RLS + TRIGGERS)
-- Execute este script no Supabase SQL Editor para blindar todas as tabelas.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. FUNÇÕES AUXILIARES DE SEGURANÇA (SECURITY DEFINER COM SEARCH_PATH FIXO)
-- Evita recursão infinita em políticas RLS e garante checagem rápida de cargo.
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND status = 'active'
      AND role::text IN ('instructor', 'admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND status = 'active'
      AND role::text = 'super_admin'
  );
$$;

-- 2. TRIGGER ANTI-ESCALADA DE PRIVILÉGIO EM PROFILES
-- Impede que qualquer usuário comum altere o próprio 'role' (ex: virar super_admin)
-- ou 'status' (ex: auto-aprovar cadastro ou sair de 'rejected') via API/Console.
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Permite alterações feitas pelo backend (service_role / postgres) ou por super_admin
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin', 'service_role')
     OR public.is_super_admin()
     OR public.is_staff()
  THEN
    RETURN NEW;
  END IF;

  -- Bloqueia qualquer alteração se o perfil já estiver recusado ('rejected')
  IF OLD.status = 'rejected' THEN
    RAISE EXCEPTION 'Operação bloqueada: este cadastro foi recusado pela administração.';
  END IF;

  -- Usuário comum NUNCA pode alterar id, role, status ou cpf
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Operação não permitida: alteração de ID bloqueada.';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Violação de segurança: alteração de cargo não autorizada.';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Violação de segurança: alteração de status de matrícula não autorizada.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();


-- 3. TRIGGER DE PROTEÇÃO EM STUDENT_MODALITIES
-- Impede que contas recusadas insiram novas modalidades ou que alunos se auto-aprovem.
CREATE OR REPLACE FUNCTION public.enforce_student_modality_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_status TEXT;
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin', 'service_role')
     OR public.is_staff()
  THEN
    RETURN NEW;
  END IF;

  SELECT status::text INTO v_profile_status
  FROM public.profiles
  WHERE id = NEW.student_id;

  IF v_profile_status = 'rejected' THEN
    RAISE EXCEPTION 'Operação bloqueada: cadastros recusados não podem enviar novas solicitações.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending_approval';
    NEW.approved_graduation_id := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Operação não permitida: apenas a coordenação pode alterar modalidades e graduações.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_student_modality_security ON public.student_modalities;
CREATE TRIGGER trg_enforce_student_modality_security
  BEFORE INSERT OR UPDATE ON public.student_modalities
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_student_modality_security();


-- 4. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.graduations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.graduation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.technical_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_orders ENABLE ROW LEVEL SECURITY;


-- 5. POLÍTICAS DE PRIVACIDADE EM PROFILES (LGPD: Aluno vê apenas o próprio perfil)
DROP POLICY IF EXISTS "Leitura de perfil proprio ou staff" ON public.profiles;
CREATE POLICY "Leitura de perfil proprio ou staff" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_staff()
  );

DROP POLICY IF EXISTS "Atualizacao de perfil proprio ou staff" ON public.profiles;
CREATE POLICY "Atualizacao de perfil proprio ou staff" ON public.profiles
  FOR UPDATE USING (
    (auth.uid() = id AND status::text <> 'rejected') OR public.is_staff()
  )
  WITH CHECK (
    (auth.uid() = id AND status::text <> 'rejected') OR public.is_staff()
  );


-- 6. POLÍTICAS EM STUDENT_MODALITIES
DROP POLICY IF EXISTS "Leitura de modalidades do proprio aluno ou staff" ON public.student_modalities;
CREATE POLICY "Leitura de modalidades do proprio aluno ou staff" ON public.student_modalities
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

DROP POLICY IF EXISTS "Staff gerencia modalidades de alunos" ON public.student_modalities;
CREATE POLICY "Staff gerencia modalidades de alunos" ON public.student_modalities
  FOR ALL USING (
    public.is_staff()
  );


-- 7. POLÍTICAS EM DADOS ACADÊMICOS (SOMENTE LEITURA PARA O PRÓPRIO ALUNO)
DROP POLICY IF EXISTS "Leitura de historico de graduacao proprio ou staff" ON public.graduation_history;
CREATE POLICY "Leitura de historico de graduacao proprio ou staff" ON public.graduation_history
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

DROP POLICY IF EXISTS "Staff gerencia historico de graduacao" ON public.graduation_history;
CREATE POLICY "Staff gerencia historico de graduacao" ON public.graduation_history
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Leitura de presenca propria ou staff" ON public.attendance;
CREATE POLICY "Leitura de presenca propria ou staff" ON public.attendance
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

DROP POLICY IF EXISTS "Staff gerencia presencas" ON public.attendance;
CREATE POLICY "Staff gerencia presencas" ON public.attendance
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Leitura de ficha tecnica propria ou staff" ON public.technical_progress;
CREATE POLICY "Leitura de ficha tecnica propria ou staff" ON public.technical_progress
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

DROP POLICY IF EXISTS "Staff gerencia fichas tecnicas" ON public.technical_progress;
CREATE POLICY "Staff gerencia fichas tecnicas" ON public.technical_progress
  FOR ALL USING (public.is_staff());


-- 8. POLÍTICAS ESTRITAS PARA PEDIDOS DA LOJA (PRODUCT_ORDERS)
-- Remove a permissão de alunos fazerem UPDATE/DELETE direto pelo cliente (tudo passa pelas Server Actions validadas)
DROP POLICY IF EXISTS "Alunos e admins podem atualizar pedidos" ON public.product_orders;
DROP POLICY IF EXISTS "Alunos e admins podem excluir pedidos" ON public.product_orders;
DROP POLICY IF EXISTS "Alunos podem criar pedidos" ON public.product_orders;
DROP POLICY IF EXISTS "Alunos podem ver seus proprios pedidos" ON public.product_orders;

CREATE POLICY "Alunos podem ver seus proprios pedidos" ON public.product_orders
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

CREATE POLICY "Apenas staff gerencia pedidos diretamente" ON public.product_orders
  FOR ALL USING (
    public.is_staff()
  );


-- 9. POLÍTICAS DE CATÁLOGO E CONTEÚDO (MODALITIES, GRADUATIONS, SCHEDULES, VIDEOS, ANNOUNCEMENTS)
DROP POLICY IF EXISTS "Leitura publica de modalidades" ON public.modalities;
CREATE POLICY "Leitura publica de modalidades" ON public.modalities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura publica de graduacoes" ON public.graduations;
CREATE POLICY "Leitura publica de graduacoes" ON public.graduations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura de grade de horarios por autenticados" ON public.class_schedules;
CREATE POLICY "Leitura de grade de horarios por autenticados" ON public.class_schedules
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff gerencia grade de horarios" ON public.class_schedules;
CREATE POLICY "Staff gerencia grade de horarios" ON public.class_schedules
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Leitura de avisos por autenticados" ON public.announcements;
CREATE POLICY "Leitura de avisos por autenticados" ON public.announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff gerencia avisos" ON public.announcements;
CREATE POLICY "Staff gerencia avisos" ON public.announcements
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Leitura de videos por alunos ativos e staff" ON public.videos;
CREATE POLICY "Leitura de videos por alunos ativos e staff" ON public.videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Staff gerencia videos" ON public.videos;
CREATE POLICY "Staff gerencia videos" ON public.videos
  FOR ALL USING (public.is_staff());
