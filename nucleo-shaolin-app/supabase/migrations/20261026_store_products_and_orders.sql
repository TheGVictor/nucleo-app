-- ═══════════════════════════════════════════════════════════════
-- NÚCLEO DE KUNG FU SHAOLIN: MIGRATION LOJA OFICIAL & PEDIDOS
-- ═══════════════════════════════════════════════════════════════

-- 1. Tabela de Produtos da Loja
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'Geral',
  image_url TEXT,
  stock INT DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Pedidos / Reservas de Produtos
CREATE TABLE IF NOT EXISTS public.product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('reception', 'pix')),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'paid', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para Produtos
DROP POLICY IF EXISTS "Todos autenticados podem ver produtos ativos" ON public.products;
CREATE POLICY "Todos autenticados podem ver produtos ativos" ON public.products
  FOR SELECT USING (
    active = true OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('instructor', 'admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Admins podem gerenciar produtos" ON public.products;
CREATE POLICY "Admins podem gerenciar produtos" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('instructor', 'admin', 'super_admin'))
  );

-- 5. Políticas para Pedidos
DROP POLICY IF EXISTS "Alunos podem ver seus proprios pedidos" ON public.product_orders;
CREATE POLICY "Alunos podem ver seus proprios pedidos" ON public.product_orders
  FOR SELECT USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('instructor', 'admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Alunos podem criar pedidos" ON public.product_orders;
CREATE POLICY "Alunos podem criar pedidos" ON public.product_orders
  FOR INSERT WITH CHECK (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('instructor', 'admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Alunos e admins podem atualizar pedidos" ON public.product_orders;
CREATE POLICY "Alunos e admins podem atualizar pedidos" ON public.product_orders
  FOR UPDATE USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('instructor', 'admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Alunos e admins podem excluir pedidos" ON public.product_orders;
CREATE POLICY "Alunos e admins podem excluir pedidos" ON public.product_orders
  FOR DELETE USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('instructor', 'admin', 'super_admin'))
  );

-- 6. Seed de Produtos Iniciais Oficiais
INSERT INTO public.products (name, description, price, category, stock, active)
VALUES 
  ('Uniforme Oficial Choy Lay Fut', 'Conjunto oficial de treino tradicional do Núcleo Shaolin com camisa de botões chineses e calça preta ajustada.', 180.00, 'Uniformes', 15, true),
  ('Faixa de Graduação Bordada', 'Faixa oficial de algodão reforçado com bordado e insígnia tradicional da escola.', 45.00, 'Faixas', 25, true),
  ('Camiseta de Treino DryFit Shaolin', 'Camiseta técnica de treino de alta respirabilidade com estampa nas costas e peito.', 65.00, 'Vestuário', 30, true),
  ('Bastão Tradicional de Madeira (Gun)', 'Bastão de madeira tratada para treino e formas (katis) de armas clássicas.', 85.00, 'Equipamentos', 10, true),
  ('Luva de Sanda / Boxe Chinês', 'Par de luvas reforçadas de alto impacto para combate, sparring e treinos de saco.', 140.00, 'Equipamentos', 12, true),
  ('Bandagem Elástica de Proteção (Par)', 'Par de bandagens profissionais de 3m para proteção de punhos e articulações.', 35.00, 'Equipamentos', 40, true)
ON CONFLICT DO NOTHING;
