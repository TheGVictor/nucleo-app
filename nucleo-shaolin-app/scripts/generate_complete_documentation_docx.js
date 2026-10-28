const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  convertInchesToTwip,
  Header,
  Footer,
  PageNumber,
} = require('docx');

// Paleta de Cores Marcial
const COLORS = {
  NAVY_PRIMARY: '0A1128',
  BLUE_BRAND: '1361C8',
  GOLD_ACCENT: 'D97706',
  DARK_GRAY: '1E293B',
  TEXT_MUTED: '475569',
  BG_LIGHT: 'F8FAFC',
  BG_ALT: 'F1F5F9',
  BORDER_COLOR: 'CBD5E1',
  WHITE: 'FFFFFF',
  GREEN_SUCCESS: '16A34A',
  RED_ALERT: 'DC2626',
};

// Funções Auxiliares de Formatação
function createTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 48, // 24pt
        color: COLORS.NAVY_PRIMARY,
        font: 'Segoe UI',
      }),
    ],
  });
}

function createSubtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 280 },
    children: [
      new TextRun({
        text,
        size: 24, // 12pt
        color: COLORS.GOLD_ACCENT,
        bold: true,
        font: 'Segoe UI',
      }),
    ],
  });
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32, // 16pt
        color: COLORS.NAVY_PRIMARY,
        font: 'Segoe UI',
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 90 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26, // 13pt
        color: COLORS.BLUE_BRAND,
        font: 'Segoe UI',
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 70 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22, // 11pt
        color: COLORS.GOLD_ACCENT,
        font: 'Segoe UI',
      }),
    ],
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    spacing: { before: options.before || 50, after: options.after || 100, line: 270 },
    alignment: options.alignment || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        size: 20, // 10pt
        color: options.color || COLORS.DARK_GRAY,
        font: 'Segoe UI',
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
  });
}

function createRichParagraph(runs, options = {}) {
  return new Paragraph({
    spacing: { before: options.before || 50, after: options.after || 100, line: 270 },
    alignment: options.alignment || AlignmentType.LEFT,
    children: runs.map(r => new TextRun({
      text: r.text,
      bold: r.bold || false,
      italics: r.italics || false,
      size: r.size || 20,
      color: r.color || COLORS.DARK_GRAY,
      font: 'Segoe UI',
    })),
  });
}

function createBullet(text, boldPrefix = '', level = 0) {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({
      text: boldPrefix + ' ',
      bold: true,
      size: 20,
      color: COLORS.NAVY_PRIMARY,
      font: 'Segoe UI',
    }));
  }
  children.push(new TextRun({
    text,
    size: 20,
    color: COLORS.DARK_GRAY,
    font: 'Segoe UI',
  }));

  return new Paragraph({
    bullet: { level },
    spacing: { before: 30, after: 50, line: 250 },
    children,
  });
}

function createRuleCallout(ruleTitle, ruleDescription, isWarning = false) {
  const accentColor = isWarning ? COLORS.RED_ALERT : COLORS.GOLD_ACCENT;
  const bgColor = isWarning ? 'FEF2F2' : 'FFFBEB';

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 28, color: accentColor },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: [
              new Paragraph({
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: `📌 REGRA DE NEGÓCIO: ${ruleTitle}`,
                    bold: true,
                    size: 20,
                    color: accentColor,
                    font: 'Segoe UI',
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 0, line: 260 },
                children: [
                  new TextRun({
                    text: ruleDescription,
                    size: 19,
                    color: COLORS.DARK_GRAY,
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createTable(headers, rowsData, widths = null) {
  const tableRows = [];

  // Header Row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) =>
        new TableCell({
          width: widths && widths[i] ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
          shading: { fill: COLORS.NAVY_PRIMARY, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: h,
                  bold: true,
                  size: 19,
                  color: COLORS.WHITE,
                  font: 'Segoe UI',
                }),
              ],
            }),
          ],
        })
      ),
    })
  );

  // Data Rows
  rowsData.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    tableRows.push(
      new TableRow({
        children: row.map((cellText, i) =>
          new TableCell({
            width: widths && widths[i] ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
            shading: {
              fill: isEven ? COLORS.WHITE : COLORS.BG_LIGHT,
              type: ShadingType.CLEAR,
            },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER_COLOR },
              left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER_COLOR },
              right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER_COLOR },
            },
            children: [
              new Paragraph({
                spacing: { line: 240 },
                children: [
                  new TextRun({
                    text: cellText,
                    size: 18,
                    color: COLORS.DARK_GRAY,
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          })
        ),
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
}

async function generateCompleteDocx() {
  const doc = new Document({
    creator: 'Núcleo de Kung Fu Shaolin - Coordenação Técnica',
    title: 'Manual Completo e Regras de Negócio — Núcleo Shaolin App',
    description: 'Documentação exaustiva com todas as regras de negócio, arquitetura técnica e modelagem de dados.',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Núcleo Shaolin App — Manual Completo de Regras de Negócio',
                    size: 15,
                    color: COLORS.TEXT_MUTED,
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Página ',
                    size: 15,
                    color: COLORS.TEXT_MUTED,
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 15,
                    color: COLORS.TEXT_MUTED,
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    text: ' de ',
                    size: 15,
                    color: COLORS.TEXT_MUTED,
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 15,
                    color: COLORS.TEXT_MUTED,
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ── CAPA DO DOCUMENTO ────────────────────────────────────
          new Paragraph({ spacing: { before: 600 } }),
          createTitle('ESCOLA NÚCLEO DE KUNG FU SHAOLIN'),
          createSubtitle('Manual Completo de Regras de Negócio, Arquitetura e Engenharia de Software'),
          
          createRichParagraph([
            { text: 'Sistema: ', bold: true, color: COLORS.NAVY_PRIMARY },
            { text: 'Núcleo Shaolin App — Portal do Aluno & Gestão Marcial\n' },
            { text: 'Coordenação Técnica: ', bold: true, color: COLORS.NAVY_PRIMARY },
            { text: 'Mestre e Coordenador Técnico Sifu Guilherme\n' },
            { text: 'Versão do Software: ', bold: true, color: COLORS.NAVY_PRIMARY },
            { text: '1.0.0 (Produção Homologada com 99 Testes Automatizados)\n' },
            { text: 'Ambiente de Hospedagem: ', bold: true, color: COLORS.NAVY_PRIMARY },
            { text: 'Vercel Edge / Serverless + Supabase Cloud PostgreSQL 15\n' },
            { text: 'Data da Última Atualização: ', bold: true, color: COLORS.NAVY_PRIMARY },
            { text: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) + '\n' },
          ], { alignment: AlignmentType.CENTER, before: 180, after: 300 }),

          createRuleCallout(
            'DIRETRIZ DE TERMINOLOGIA E TRADIÇÃO',
            'É terminantemente proibido o uso da palavra japonesa "dojo" em qualquer parte do sistema, documentação ou comunicações com alunos. A instituição é uma escola tradicional chinesa de artes marciais; deve-se utilizar estritamente os termos "escola", "academia" ou "espaço de treino", preservando o respeito à linhagem Shaolin Choy Lay Fut.'
          ),

          new Paragraph({ spacing: { before: 300 } }),

          // ── CAPÍTULO 1: VISÃO GERAL & LINHAGEM MARCIAL ───────────
          createHeading1('1. Visão Geral da Instituição e Propósito do Sistema'),
          createParagraph(
            'A Escola Núcleo de Kung Fu Shaolin é uma instituição de ensino dedicada à transmissão das artes marciais chinesas tradicionais. Sob coordenação técnica do Sifu Guilherme, a escola ensina três modalidades marciais complementares:'
          ),
          createBullet('Estilo tradicional do sul e do norte da China, fundado por Chan Heung em 1836. Combina a agilidade e o trabalho de pernas do norte com o poder dos punhos e defesas curtas do sul. Possui um vasto currículo de posturas, katis (formas), armas clássicas e defesa pessoal.', 'Kung Fu Shaolin (Choy Lay Fut):'),
          createBullet('Arte marcial interna chinesa conhecida pelo cultivo da energia vital (Chi), equilíbrio, respiração diafragmática, harmonia corporal e formas de punho e espada reta.', 'Tai Chi Chuan (Estilo Yang):'),
          createBullet('Sistema moderno de combate esportivo e de defesa pessoal chinês, integrando socos, chutes e projeções/quedas rápidas.', 'Sanda (Boxe Chinês):'),

          createParagraph(
            'O Núcleo Shaolin App nasceu da necessidade de modernizar a gestão operacional e o acompanhamento pedagógico-marcial dos alunos, eliminando de forma definitiva o uso de fichas físicas de papel (sujeitas a rasuras, perda e degradação física) e automatizando a elegibilidade para exames de graduação.'
          ),

          // ── CAPÍTULO 2: ARQUITETURA TÉCNICA E ENGENHARIA ─────────
          createHeading1('2. Arquitetura Técnica e Engenharia de Software'),
          createParagraph(
            'O sistema adota os mais modernos padrões de desenvolvimento web com o ecossistema Next.js 16 (Turbopack) e Supabase:'
          ),

          createTable(
            ['Camada de Software', 'Tecnologia Empregada', 'Decisão Arquitetural e Responsabilidade Técnica'],
            [
              ['Framework Full-Stack', 'Next.js 16.4.3', 'App Router, Turbopack, React Server Components (RSC), Partial Prerendering (PPR) e Server Actions tipadas.'],
              ['Biblioteca de Interface', 'React 19.3.0', 'Uso intensivo de transições assíncronas (useTransition), hooks modernos e compilação otimizada.'],
              ['Banco de Dados Relacional', 'PostgreSQL 15 (Supabase)', 'Estrutura relacional estrita com índices em chaves estrangeiras e JSONB para fichas técnicas complexas.'],
              ['Segurança e Autenticação', 'Supabase Auth + SSR', 'Sessão gerenciada por cookies HTTPOnly seguros via @supabase/ssr, com políticas RLS no banco.'],
              ['Armazenamento de Mídia', 'Supabase Storage', 'Buckets privados e públicos para fotos de perfil, imagens de produtos da loja e vídeos de treino.'],
              ['Estilização e Design System', 'Tailwind CSS v4 + Vanilla CSS', 'Tokens semânticos em globals.css com variáveis HSL, suporte a modo claro/escuro e safe-area iOS.'],
              ['Garantia de Qualidade', 'Vitest 5.0.5', '99 testes unitários automatizados validando contratos de dados, regras de faixa e lógica de horários.'],
            ],
            [22, 23, 55]
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // ── CAPÍTULO 3: REGRAS DE NEGÓCIO DE CADASTRO E MATRÍCULA ──
          createHeading1('3. Regras de Negócio de Matrícula e Cadastro (/cadastro)'),
          createParagraph(
            'O processo de auto-matrícula de novos alunos é dividido em três etapas sequenciais estritas, garantindo conformidade jurídica e médica antes do primeiro treino:'
          ),

          createHeading2('3.1 Etapa 1: Dados Pessoais e Validação de Idade'),
          createBullet('Nome completo, data de nascimento, e-mail institucional/pessoal e senha com no mínimo 6 caracteres.', 'Campos Obrigatórios:'),
          createRuleCallout(
            'OBRIGATORIEDADE DE RESPONSÁVEL LEGAL PARA MENORES',
            'Se a data de nascimento indicar que o praticante tem menos de 18 anos, ou se for preenchido o campo de responsável, o sistema torna OBRIGATÓRIO o fornecimento do Nome do Responsável, CPF do Responsável e Telefone do Responsável. Menores de idade não podem assinar termos legais de forma autônoma.'
          ),

          new Paragraph({ spacing: { before: 150 } }),
          createHeading2('3.2 Etapa 2: Seleção de Modalidades e Nível Declarado'),
          createParagraph(
            'O aluno pode se matricular em uma ou múltiplas modalidades simultaneamente (ex: Kung Fu + Tai Chi Chuan). Para cada modalidade selecionada, o aluno declara seu nível inicial:'
          ),
          createBullet('Faixa Branca a Faixa Preta (e 1º ao 5º Grau).', 'Choy Lay Fut:'),
          createBullet('Wu Hao de 8, Wu Hao de 13, Wu Hao de 24, Wu Hao de 35, Espada Reta, Wu Hao de 38.', 'Tai Chi Chuan:'),
          createBullet('Branco, Amarelo, Amarelo Ponta Verde, Verde, Verde Ponta Azul, Azul, Azul Ponta Vermelha, Vermelho, Vermelho Ponta Preta, Preto.', 'Sanda (Boxe Chinês):'),
          createRuleCallout(
            'NÍVEL AUTO-DECLARADO VERSUS HOMOLOGADO',
            'O nível selecionado no cadastro é salvo provisoriamente em student_modalities.self_reported_level. Ele NUNCA concede permissões automáticas nem aprovação oficial até que o Sifu ou instrutor faça a validação presencial e homoloque a faixa correspondente em approved_graduation_id.'
          ),

          new Paragraph({ spacing: { before: 150 } }),
          createHeading2('3.3 Etapa 3: Termos Legais Obrigatórios e Aprovação Pendente'),
          createParagraph(
            'O formulário exige a confirmação explícita de três checkboxes indispensáveis:'
          ),
          createBullet('Declara ciência do regulamento interno da escola, respeito aos instrutores e pontualidade nos treinos.', 'Termos de Matrícula (terms_accepted):'),
          createBullet('Autoriza a escola a veicular fotos e vídeos de treinos e exames em seus canais oficiais e redes sociais.', 'Direitos de Imagem (image_rights_accepted):'),
          createBullet('Declara estar em perfeitas condições de saúde física e mental para a prática de artes marciais intensas.', 'Aptidão de Saúde (health_declaration_accepted):'),
          createRuleCallout(
            'BLOQUEIO DE ACESSO ATÉ HOMOLOGAÇÃO (STATUS PENDING_APPROVAL)',
            'Após submissão do formulário, a conta é criada com status "pending_approval". O aluno é imediatamente redirecionado para a rota /aguardando. O acesso à Área do Aluno (/aluno) é completamente bloqueado pelo middleware até que a equipe da escola aprove a matrícula na fila de aprovação (ApprovalQueue).'
          ),

          // ── CAPÍTULO 4: REGRAS DE NEGÓCIO DE PERFIS E RBAC ────────
          createHeading1('4. Controle de Acesso Baseado em Papéis (RBAC) e Alternância de Visão'),
          createParagraph(
            'O Núcleo Shaolin App possui 4 níveis hierárquicos de acesso, definidos na coluna role da tabela profiles:'
          ),

          createTable(
            ['Papel (Role)', 'Nível de Permissão', 'Direitos de Acesso e Restrições'],
            [
              ['student', 'Nível 1 (Aluno)', 'Acesso estrito à sua própria área: dashboard, sua própria ficha técnica, vídeos da sua faixa e loja. Sem permissão de mutação em turmas, notas ou alunos.'],
              ['instructor', 'Nível 2 (Instrutor)', 'Acesso à gestão de turmas, lançamento de presenças, edição e salvamento de repetições na ficha técnica dos alunos e criação de listas de exame de faixa.'],
              ['admin', 'Nível 3 (Administrador)', 'Poderes de instrutor acrescidos de gestão completa de produtos da loja, controle de estoque, criação de horários de aulas e envio de comunicados gerais.'],
              ['super_admin', 'Nível 4 (Sifu Guilherme)', 'Autoridade marcial máxima. Exclusividade para homologar listas de exames, conceder promoções oficiais de faixa, alterar papéis de instrutores e gerenciar finanças.'],
            ],
            [18, 22, 60]
          ),

          new Paragraph({ spacing: { before: 150 } }),
          createRuleCallout(
            'ALTERNÂNCIA RÁPIDA DE VISÃO ALUNO <-> INSTRUTOR (TOPBAR)',
            'Na tradição das artes marciais chinesas, todo instrutor continua sendo um eterno praticante e aluno do Sifu. Usuários com papéis "instructor", "admin" e "super_admin" possuem um botão permanente no TopBar para alternar entre "/aluno" e "/admin" com um clique, sem necessidade de logout ou troca de credenciais.'
          ),

          // ── CAPÍTULO 5: REGRAS DA FICHA TÉCNICA MARCIAL ───────────
          createHeading1('5. Ficha Técnica Digital de Acompanhamento Marcial'),
          createParagraph(
            'A ficha técnica é o coração pedagógico do Núcleo Shaolin. Ela digitaliza a ficha física oficial da escola com fidelidade milimétrica, eliminando o papel e preservando a seriedade do treino tradicional.'
          ),

          createHeading2('5.1 A Regra das 6 Repetições por Técnica (Tally Marks Chineses)'),
          createParagraph(
            'Cada técnica cadastrada no currículo da faixa (socos, chutes, katis, posturas, defesas) possui uma meta estrita de 6 repetições validadas pelo instrutor. O progresso é representado graficamente por traços marciais:'
          ),
          createBullet('Técnica ainda não praticada na presença do instrutor.', '0/6 (Vazio):'),
          createBullet('Primeiro traço vertical (│) assinado.', '1/6 (│):'),
          createBullet('Segundo traço vertical (││) assinado.', '2/6 (││):'),
          createBullet('Terceiro traço vertical (│││) assinado.', '3/6 (│││):'),
          createBullet('Quarto traço vertical (││││) assinado.', '4/6 (││││):'),
          createBullet('Quinto traço transversal (││││/) completando a matriz clássica.', '5/6 (││││/):'),
          createBullet('Técnica completamente dominada e validada pelo instrutor para composição da nota de exame.', '6/6 (Completo):'),

          createHeading2('5.2 Estrutura Oficial de Categorias da Ficha'),
          createParagraph(
            'A ficha oficial é organizada em duas colunas estruturais correspondentes à grade de ensino:'
          ),
          createTable(
            ['Coluna', 'Grupo de Técnicas', 'Exemplos de Técnicas Avaliadas'],
            [
              ['Esquerda', 'Posturas', 'So Geuk, Gato / Girando, Cavalo / Garça.'],
              ['Esquerda', 'Bloqueios e Ataques', 'Pak Choi, Cotovelo 4 Direções, Gum Jean.'],
              ['Esquerda', 'Chutes Perna da Frente', 'Frontal, Faca do Pé, Faca do Pé (Lateral).'],
              ['Esquerda', 'Chutes Duplos (Perna de Trás)', 'Frontal Duplo, Faca do Pé Duplo.'],
              ['Esquerda', 'Aplicações Marciais', 'Aplicações Práticas Número I, Número II e Número III.'],
              ['Esquerda', 'Básicos de Kung Fu', 'Básico I, Básico II, Básico III, Básico IV, Básico V.'],
              ['Esquerda', 'Kati (Formas Tradicionais)', 'Ng Lun Choi (Porto das Doze Rodas) Parte I, II, III e IV.'],
              ['Esquerda', 'Combate e Movimentação', 'Movimentação de Luta (Diagonais Recuando), Aplicações Básicas 1 a 4.'],
              ['Esquerda', 'Rolamentos e Quedas', 'Rolamento Feto, Rolamento Pelas Costas, Rolamento Pela Frente.'],
              ['Esquerda', 'Parte Interna (Chi Kung)', 'Juventude, Respiração em 2 Tempos, Respiração em 4 Tempos, Ch\'un/Ten (1 Min).'],
              ['Esquerda', 'Cursos e Armas Clássicas', 'Lim Jien Kuan, Acrobacias, Bastão Tradicional, Louva-Deus.'],
              ['Direita', 'Exame: Parte Física', '15 Flexões Palma da Mão, 20 Flexões Punho, 35 Abdominais Curtas, 38 Longas, Chutes 10x.'],
              ['Direita', 'Exame: Parte Mental', 'Isometria de Cavalo sustentada por 65 seg, Crucifixo por 65 seg.'],
              ['Direita', 'Exame: Parte Técnica', 'Chutes da Fase, Defesa Pessoal em 3 Fases, Kati 1" x 2" Formas.'],
              ['Direita', 'Exame: Parte Teórica', 'Significado do Kati, Nomes dos Animais em Chinês, Nomes da Linhagem e Equipe.'],
            ],
            [15, 25, 60]
          ),

          new Paragraph({ spacing: { before: 150 } }),
          createRuleCallout(
            'VISÃO DO ALUNO LIMPA DE POLUIÇÃO VISUAL',
            'Na rota /aluno/ficha, todo e qualquer botão de edição, botão "Atualizar Ficha" e barra de progresso geral foram completamente removidos da interface. A ficha carrega automaticamente com os dados mais recentes do banco. O aluno contempla exclusivamente a simulação oficial da sua ficha física com o número de registro (ex: Nº 07E9), data de matrícula e visto técnico.'
          ),

          new Paragraph({ spacing: { before: 150 } }),
          createRuleCallout(
            'PERSISTÊNCIA E AUDITORIA DA FICHA PELO INSTRUTOR',
            'No painel administrativo (/admin/attendance), o instrutor possui a barra de ferramentas com botões de incremento/decremento, botão Desfazer (Undo para reverter cliques acidentais) e Salvar Ficha. Todas as repetições e notas são serializadas em JSON e gravadas na tabela technical_progress, registrando o ID do instrutor avaliador e carimbo de data/hora (updatedAt).'
          ),

          // ── CAPÍTULO 6: REGRAS DE VÍDEOS DE TREINO ────────────────
          createHeading1('6. Catálogo de Vídeos de Treino e a Regra dos Katis'),
          createParagraph(
            'O acervo de vídeos didáticos serve como biblioteca de referência para os alunos treinarem com exatidão em suas residências entre as aulas presenciais.'
          ),

          createRuleCallout(
            'REGRA MARCIAL EXCLUSIVA DA FAIXA PRETA (APENAS KATIS)',
            'Praticantes que alcançam a Faixa Preta (ou graus posteriores) possuem um currículo focado exclusivamente nas formas tradicionais completas da linhagem. No Núcleo Shaolin App, Faixas Pretas visualizam UNICAMENTE vídeos da categoria "Katis". Vídeos de Básicos, Chutes ou Aplicações são ocultados. Da mesma forma, no painel administrativo (/admin/videos), ao vincular um vídeo à Faixa Preta, o sistema bloqueia qualquer categoria que não seja Katis.'
          ),

          new Paragraph({ spacing: { before: 150 } }),
          createRuleCallout(
            'REGRA DE CONHECIMENTO CUMULATIVO PARA FAIXAS COLORIDAS',
            'Alunos de faixas coloridas (Branca a Marrom-Avançada) têm acesso aos vídeos da sua faixa atual e de todas as faixas anteriores já superadas. Um aluno de Faixa Laranja tem acesso aos vídeos de Faixa Branca, Faixa Amarela e Faixa Laranja, estimulando a revisão constante dos fundamentos.'
          ),

          // ── CAPÍTULO 7: REGRAS DE HORÁRIOS E TURMAS ──────────────
          createHeading1('7. Grade de Horários e Filtro Contextual de Aluno'),
          createParagraph(
            'A escola atende crianças, jovens e adultos em diferentes momentos do dia. Para evitar confusão e atrasos, a grade de horários conta com filtragem estrita contextual:'
          ),

          createTable(
            ['Categoria do Aluno', 'Critério de Determinação no Sistema', 'Turmas Apresentadas no Front-End do Aluno'],
            [
              ['Turma Kids (Infantil)', 'Praticante com menos de 14 anos OU com responsável legal cadastrado.', 'Visualiza EXCLUSIVAMENTE turmas cujo título contenha "Kids", "Criança" ou "Siu Lung". Todas as turmas adultas são filtradas.'],
              ['Adulto Iniciante', 'Praticante com 14 anos ou mais, graduado entre Faixa Branca e Faixa Roxa.', 'Visualiza turmas com indicação de "Iniciante" ou "Intermediário".'],
              ['Adulto Avançado', 'Praticante de Faixa Vermelha a Faixa Marrom-Avançada.', 'Visualiza turmas avançadas de Kung Fu.'],
              ['Adulto Faixa Preta', 'Praticante com Faixa Preta ou Graus superiores homologados.', 'Visualiza turmas de Faixa Preta e treinos avançados da equipe.'],
              ['Tai Chi Chuan / Sanda', 'Aluno matriculado ativamente na modalidade correspondente.', 'Aulas de Tai Chi e Sanda só aparecem se o aluno possuir a modalidade ativa em seu perfil.'],
              ['Aulas Especiais da Escola', 'Treinos gerais, seminários ou workshops do Sifu.', 'Aparecem para todos os alunos independente de modalidade ou idade.'],
            ],
            [20, 30, 50]
          ),

          // ── CAPÍTULO 8: REGRAS DA LOJA OFICIAL E PEDIDOS ───────────
          createHeading1('8. Loja Oficial de Artigos Marciais e Ciclo de Pedidos'),
          createParagraph(
            'A loja oficial centraliza a aquisição de artigos de treino, camisetas comemorativas, calças tradicionais, faixas e proteções:'
          ),

          createHeading2('8.1 Nomenclatura Marcial Estrita de Produtos'),
          createRuleCallout(
            'PROIBIÇÃO DE "NÍVEL X" NA LOJA E SELETORES',
            'É proibido exibir nomenclaturas no padrão de computação como "Nível 5" ou "Nível 10". Os produtos e opções de faixa devem seguir exclusivamente a nomenclatura marcial tradicional: "Faixa Branca", "Faixa Amarela", "Faixa Laranja", "Faixa Verde-Jade", "Faixa Verde Escura", "Faixa Roxa", "Faixa Vermelha", "Faixa Marrom-Clara", "Faixa Marrom-Avançada" e "Faixa Preta".'
          ),

          new Paragraph({ spacing: { before: 150 } }),
          createHeading2('8.2 Upload de Fotos Reais no Cadastro do Produto'),
          createParagraph(
            'Ao cadastrar um novo item no painel do administrador (/admin/loja), o sistema permite o upload direto da fotografia oficial do artigo para o Supabase Storage. A URL da imagem é gravada no registro do produto, garantindo que o aluno veja a foto exata do uniforme ou equipamento.'
          ),

          createHeading2('8.3 Ciclo de Vida do Pedido e Regra de Edição pelo Aluno'),
          createTable(
            ['Status do Pedido', 'Significado Operacional', 'Ações Permitidas ao Aluno'],
            [
              ['reserved', 'Pedido de reserva realizado pelo aluno. Aguarda quitação na recepção ou via PIX.', 'O aluno PODE alterar a quantidade ou cancelar a reserva. Tela de edição simplificada sem poluição.'],
              ['paid', 'Pagamento confirmado pelo administrador da escola.', 'Bloqueado para edição ou cancelamento pelo aluno. Status imutável pelo front-end.'],
              ['delivered', 'Uniforme ou equipamento entregue presencialmente ao aluno na escola.', 'Pedido concluído com sucesso e arquivado no histórico de compras.'],
              ['cancelled', 'Pedido cancelado pelo aluno antes da confirmação ou pela administração.', 'Registro mantido para auditoria de histórico.'],
            ],
            [18, 42, 40]
          ),

          // ── CAPÍTULO 9: REGRAS DE EXAMES DE FAIXA E PROMOÇÕES ──────
          createHeading1('9. Exames de Faixa, Elegibilidade e Promoções Oficiais'),
          createParagraph(
            'A promoção de faixa no Kung Fu Shaolin é um rito solene que exige comprovação de disciplina, frequência e domínio técnico:'
          ),

          createHeading2('9.1 O Fluxo em 5 Etapas do Exame de Graduação'),
          createBullet('O instrutor consulta a lista de alunos da turma e analisa o tempo de permanência na faixa atual e a frequência nas aulas.', '1. Levantamento Técnico:'),
          createBullet('O instrutor cria uma Lista de Exame (/admin/exames) selecionando os candidatos, anotando a faixa-alvo pretendida (target_graduation_id) e observações técnicas.', '2. Criação da Lista de Exame:'),
          createBullet('A lista entra no sistema com status "pending". Apenas o Sifu Guilherme (super_admin) possui permissão para homologar a lista e alterar o status para "approved".', '3. Homologação Exclusiva pelo Sifu:'),
          createBullet('No dia do exame presencial, os alunos são avaliados em Postura, Técnica, Força Física, Foco Mental e Katis. As notas são registradas no sistema.', '4. Avaliação Técnica Presencial:'),
          createBullet('O Sifu marca a lista como "completed". O sistema insere automaticamente os registros de promoção em graduation_history e atualiza a graduação ativa em student_modalities.', '5. Promoção Automática e Histórico:'),

          // ── CAPÍTULO 10: DESIGN SYSTEM, CONTRASTE E SAFE AREA ─────
          createHeading1('10. Design System, Contraste Marcial Universal e iOS Safe Area'),
          createParagraph(
            'O Núcleo Shaolin App adota diretrizes estritas de acessibilidade visual WCAG AAA e adaptação ergonômica para dispositivos móveis de última geração:'
          ),

          createHeading2('10.1 A Regra de Ouro do Contraste Universal (beltTheme.ts)'),
          createParagraph(
            'Com 10 faixas que variam do branco absoluto (#FFFFFF) ao preto absoluto (#1A1A1A), o sistema implementa um motor de cores em src/lib/beltTheme.ts que calcula as cores sem jamais permitir texto invisível:'
          ),

          createTable(
            ['Graduação Marcial', 'Cor Oficial', 'Tratamento do Card de Identificação', 'Badge de Graduação Oficial'],
            [
              ['Faixa Branca', '#E2E8F0', 'Borda lateral marcial cinza (#CBD5E1) e fundo var(--color-bg-card).', 'Pílula com fundo elevado e contorno nítido para nunca sumir no modo claro.'],
              ['Faixa Amarela', '#FFD700', 'Borda lateral âmbar (#F59E0B) e fundo com 10% de matiz.', 'Contraste calibrado em tom âmbar legível, sem ofuscar a visão.'],
              ['Faixa Laranja', '#FF8C00', 'Borda lateral laranja vibrante e fundo translúcido suave.', 'Pílula laranja com ponto indicador sólido de alta nitidez.'],
              ['Faixa Verde-Jade', '#00A86B', 'Borda lateral verde-jade autêntico do kung fu tradicional.', 'Pílula verde suave com texto de alta legibilidade.'],
              ['Faixa Verde Escura', '#006400', 'Borda lateral verde floresta encorpado.', 'Pílula com indicador sólido de faixa verde escura.'],
              ['Faixa Roxa', '#800080', 'Borda lateral roxa nobre.', 'Pílula roxa equilibrada em ambos os temas.'],
              ['Faixa Vermelha', '#DC143C', 'Borda lateral vermelha marcial chinesa.', 'Pílula vermelha com contorno delimitador nítido.'],
              ['Faixa Marrom-Clara', '#C4A35A', 'Borda lateral marrom ocre tradicional.', 'Pílula ocre de alta densidade visual.'],
              ['Faixa Marrom-Avançada', '#8B4513', 'Borda lateral marrom escuro marcial.', 'Pílula marrom clássica com texto de alto contraste.'],
              ['Faixa Preta (e Graus)', '#1A1A1A', 'Borda lateral em dourado de honra (#D4AF37), card em var(--color-bg-card) com gradiente dourado suave a 8% e NOME DO ALUNO EM TEXT-MAIN (100% legível).', 'Pílula preto ônix (#141414) com borda dourada (#D4AF37), texto em ouro (#FDE047) e avatar com anel de ouro.'],
            ],
            [18, 14, 38, 30]
          ),

          new Paragraph({ spacing: { before: 150 } }),
          createHeading2('10.2 Engenharia de Safe Area para iPhone com Notch e Dynamic Island'),
          createParagraph(
            'Nos iPhones modernos em modo PWA standalone ou Safari WebKit, o cabeçalho superior ficava sob a barra de status nativa (relógio 10:01, bateria e sinal de rede), gerando efeito embaçado sobre a logo e o nome do aluno. A solução implementada em globals.css aplica:'
          ),
          createBullet('Cálculo dinâmico com respiro: calc(max(env(safe-area-inset-top, 0px), 14px) + 8px). Em modo standalone PWA, aplica max(calc(env + 12px), 54px). A logo e os botões começam sempre abaixo do relógio e da Dynamic Island.', 'TopBar com Safe Area Superior:'),
          createBullet('Elevação dinâmica da barra fixa: min-height: calc(58px + env(safe-area-inset-bottom, 0px)), posicionando os ícones acima da linha de gestos (home bar) do iOS.', 'BottomNav com Safe Area Inferior:'),

          // ── CAPÍTULO 11: DICIONÁRIO DE DADOS COMPLETO ─────────────
          createHeading1('11. Dicionário de Dados do Banco PostgreSQL (Supabase)'),
          createParagraph(
            'Relação completa de tabelas, chaves primárias e relacionamentos existentes na base de dados:'
          ),

          createTable(
            ['Tabela', 'Chave Primária', 'Chaves Estrangeiras (FK)', 'Finalidade Operacional'],
            [
              ['profiles', 'id (UUID)', 'auth.users.id', 'Perfil do usuário com dados pessoais, CPF, telefone, papel (role) e status.'],
              ['modalities', 'id (UUID)', 'Nenhuma', 'Modalidades marciais da escola (Kung Fu Choy Lay Fut, Tai Chi Chuan, Sanda).'],
              ['graduations', 'id (UUID)', 'modality_id -> modalities.id', 'Faixas e graduações hierárquicas com nome, ordem e código de cor hex.'],
              ['student_modalities', 'id (UUID)', 'student_id -> profiles.id, modality_id, approved_graduation_id', 'Vínculo do aluno com a modalidade, faixa aprovada atual e status da matrícula.'],
              ['class_schedules', 'id (UUID)', 'modality_id -> modalities.id', 'Grade semanal de horários com dia da semana, horário de início e término.'],
              ['attendance', 'id (UUID)', 'student_id, class_schedule_id, recorded_by', 'Registro de presença e frequência dos alunos nas aulas presenciais.'],
              ['technical_progress', 'id (UUID)', 'student_id, modality_id, instructor_id', 'Estado completo serializado em JSON da ficha técnica com as repetições (0 a 6).'],
              ['videos', 'id (UUID)', 'modality_id, min_graduation_id', 'Vídeos de treinamento com URL de mídia, categoria e graduação mínima exigida.'],
              ['exam_lists', 'id (UUID)', 'modality_id, instructor_id, reviewed_by', 'Listas de exame de graduação com título, status, instrutor e homologação do Sifu.'],
              ['exam_list_candidates', 'id (UUID)', 'exam_list_id, student_id, target_graduation_id', 'Alunos indicados para exame com anotações e graduação pretendida.'],
              ['products', 'id (UUID)', 'Nenhuma', 'Catálogo de produtos da loja com nome, preço, estoque, foto real e categoria.'],
              ['product_orders', 'id (UUID)', 'student_id, product_id', 'Pedidos de compras dos alunos com quantidade, valor total, pagamento e status.'],
              ['graduation_history', 'id (UUID)', 'student_id, modality_id, graduation_id', 'Histórico imutável de todas as promoções de faixa recebidas pelo praticante.'],
              ['announcements', 'id (UUID)', 'modality_id, author_id', 'Comunicados e avisos oficiais publicados para a escola.'],
            ],
            [18, 16, 28, 38]
          ),

          // ── CAPÍTULO 12: QUALIDADE, TESTES E CI/CD ────────────────
          createHeading1('12. Testes Automatizados, Qualidade de Código e CI/CD'),
          createParagraph(
            'Para assegurar que nenhuma alteração futura viole regras de negócio ou degrade o design, o projeto conta com uma suíte de 99 testes unitários em Vitest:'
          ),

          createTable(
            ['Arquivo de Teste', 'Testes Ativos', 'Regras de Negócio Validadas'],
            [
              ['src/lib/__tests__/beltTheme.test.ts', '6 testes', 'Garante contraste da Faixa Preta com ouro/ônix, Faixa Branca com borda, Faixa Amarela em tom âmbar e todas as faixas coloridas sem conflito.'],
              ['src/components/aluno/__tests__/StudentScheduleView.test.ts', '12 testes', 'Garante que alunos Kids só vejam turmas infantis, adultos iniciantes só vejam iniciantes e alunos de Tai Chi vejam suas aulas.'],
              ['src/components/aluno/__tests__/VideosExplorer.test.tsx', '8 testes', 'Garante que a hierarquia marcial tenha 10 faixas oficiais e que Faixa Preta veja exclusivamente Katis.'],
              ['src/app/admin/videos/__tests__/actions.test.ts', '11 testes', 'Garante que o backend valide permissões staff e bloqueie categorias não autorizadas.'],
              ['src/lib/__tests__/technicalSheetData.test.ts', '14 testes', 'Garante a integridade do schema da ficha técnica oficial, divisão de colunas e contagem de repetições (0 a 6).'],
              ['src/lib/__tests__/announcements.test.ts', '10 testes', 'Valida o parser de avisos com imagens estruturadas, JSON e links externos.'],
              ['src/lib/__tests__/video-utils.test.ts', '17 testes', 'Valida URLs de embed de vídeos, sanitização e durações.'],
              ['src/lib/__tests__/store-defaults.test.ts', '4 testes', 'Garante que os produtos padrão de fallback contenham preços, descrições e categorias válidas.'],
              ['Componentes de UI (Avatar, Badge, Logo, Spinner)', '17 testes', 'Valida a renderização e temas dos elementos atômicos da interface.'],
            ],
            [30, 15, 55]
          ),

          new Paragraph({ spacing: { before: 200 } }),
          createRuleCallout(
            'HOMOLOGAÇÃO TÉCNICA APROVADA',
            'A suíte de testes pode ser executada a qualquer momento através do comando "npm run test". Todos os 99 testes foram executados com 100% de sucesso sem falhas.'
          ),

          new Paragraph({ spacing: { before: 400 } }),
          createParagraph(
            '© Escola Núcleo de Kung Fu Shaolin — Coordenação Técnica Sifu Guilherme. Todos os direitos reservados.',
            { alignment: AlignmentType.CENTER, italics: true, color: COLORS.TEXT_MUTED }
          ),
        ],
      },
    ],
  });

  const outputPath = path.join(process.cwd(), 'DOCUMENTACAO_SISTEMA_NUCLEO_SHAOLIN.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Documentação completa DOCX gerada com sucesso em: ${outputPath}`);
  console.log(`Tamanho final do arquivo: ${(buffer.length / 1024).toFixed(2)} KB`);
}

generateCompleteDocx().catch((err) => {
  console.error('Erro ao gerar DOCX completo:', err);
  process.exit(1);
});
