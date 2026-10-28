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
  NumberFormat,
} = require('docx');

// Cores Oficiais da Identidade Visual do Núcleo Shaolin
const COLORS = {
  NAVY_PRIMARY: '0A1128',
  BLUE_BRAND: '1361C8',
  GOLD_ACCENT: 'D97706',
  DARK_GRAY: '1E293B',
  TEXT_MUTED: '475569',
  BG_LIGHT: 'F8FAFC',
  BORDER_COLOR: 'CBD5E1',
  WHITE: 'FFFFFF',
};

// Funções Utilitárias para criar elementos formatados com consistência
function createTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 52, // 26pt
        color: COLORS.NAVY_PRIMARY,
        font: 'Segoe UI',
      }),
    ],
  });
}

function createSubtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 360 },
    children: [
      new TextRun({
        text,
        size: 26, // 13pt
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
    spacing: { before: 400, after: 140 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 34, // 17pt
        color: COLORS.NAVY_PRIMARY,
        font: 'Segoe UI',
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
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
    spacing: { before: 200, after: 80 },
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
    spacing: { before: options.before || 60, after: options.after || 120, line: 280 },
    alignment: options.alignment || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        size: 21, // ~10.5pt
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
    spacing: { before: options.before || 60, after: options.after || 120, line: 280 },
    children: runs.map(r => new TextRun({
      text: r.text,
      bold: r.bold || false,
      italics: r.italics || false,
      size: r.size || 21,
      color: r.color || COLORS.DARK_GRAY,
      font: 'Segoe UI',
    })),
  });
}

function createBullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({
      text: boldPrefix + ' ',
      bold: true,
      size: 21,
      color: COLORS.NAVY_PRIMARY,
      font: 'Segoe UI',
    }));
  }
  children.push(new TextRun({
    text,
    size: 21,
    color: COLORS.DARK_GRAY,
    font: 'Segoe UI',
  }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60, line: 260 },
    children,
  });
}

function createCallout(text, title = 'NOTA TÉCNICA') {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 24, color: COLORS.GOLD_ACCENT },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'FFFBEB', type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: `💡 ${title}`,
                    bold: true,
                    size: 20,
                    color: COLORS.GOLD_ACCENT,
                    font: 'Segoe UI',
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text,
                    size: 20,
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

function createTable(headers, rowsData) {
  const tableRows = [];

  // Linha de Cabeçalho
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map(
        h =>
          new TableCell({
            shading: { fill: COLORS.NAVY_PRIMARY, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: h,
                    bold: true,
                    size: 20,
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

  // Linhas de Dados
  rowsData.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    tableRows.push(
      new TableRow({
        children: row.map(
          cellText =>
            new TableCell({
              shading: {
                fill: isEven ? COLORS.WHITE : COLORS.BG_LIGHT,
                type: ShadingType.CLEAR,
              },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER_COLOR },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER_COLOR },
                left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER_COLOR },
                right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER_COLOR },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cellText,
                      size: 19,
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

async function generateDocx() {
  const doc = new Document({
    creator: 'Núcleo de Kung Fu Shaolin - Coordenação Técnica',
    title: 'Documentação do Sistema Núcleo Shaolin App',
    description: 'Manual técnico, arquitetura de software, dicionário de dados e fluxos funcionais',
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
                    text: 'Núcleo Shaolin App — Documentação Técnica Oficial',
                    size: 16,
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
                    size: 16,
                    color: COLORS.TEXT_MUTED,
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: COLORS.TEXT_MUTED,
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    text: ' de ',
                    size: 16,
                    color: COLORS.TEXT_MUTED,
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
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
          new Paragraph({ spacing: { before: 720 } }),
          createTitle('NÚCLEO DE KUNG FU SHAOLIN'),
          createSubtitle('Documentação Técnica, Arquitetural e Funcional do Sistema'),
          
          createRichParagraph([
            { text: 'Versão do Sistema: ', bold: true, color: COLORS.NAVY_PRIMARY },
            { text: '1.0.0 (Produção)\n' },
            { text: 'Tecnologia Principal: ', bold: true, color: COLORS.NAVY_PRIMARY },
            { text: 'Next.js 16 + React 19 + Supabase + Tailwind CSS v4\n' },
            { text: 'Coordenação Técnica: ', bold: true, color: COLORS.NAVY_PRIMARY },
            { text: 'Sifu Guilherme\n' },
            { text: 'Data de Emissão: ', bold: true, color: COLORS.NAVY_PRIMARY },
            { text: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) + '\n' },
            { text: 'Status do Ambiente: ', bold: true, color: COLORS.NAVY_PRIMARY },
            { text: 'Ativo e Homologado (99 Testes Automatizados Aprovados)\n' },
          ], { alignment: AlignmentType.CENTER, before: 200, after: 400 }),

          createCallout(
            'Este documento consolida a arquitetura completa do sistema, a modelagem de dados no PostgreSQL/Supabase, os módulos de alunos e administradores, as políticas de segurança (RLS), o design system marcial acessível e os procedimentos de implantação contínua.',
            'PROPÓSITO DESTE MANUAL'
          ),

          new Paragraph({ spacing: { before: 400 } }),

          // ── SEÇÃO 1: VISÃO GERAL DO PROJETO ──────────────────────
          createHeading1('1. Visão Geral do Projeto'),
          createParagraph(
            'O Núcleo Shaolin App é uma plataforma web progressiva (PWA) moderna desenvolvida sob medida para a Escola Núcleo de Kung Fu Shaolin. A escola oferece treinamentos nas artes marciais chinesas tradicionais: Kung Fu Shaolin (estilo Choy Lay Fut), Tai Chi Chuan (estilo Yang) e Sanda (Boxe Chinês), sob a liderança do Mestre e Coordenador Técnico Sifu Guilherme.'
          ),
          createParagraph(
            'Historicamente, as escolas tradicionais de artes marciais controlam o progresso dos alunos por fichas físicas de papel (que sofrem com desgaste, perda e rasuras), cadernos de presença manuais e comunicação descentralizada via grupos de mensagens. O Núcleo Shaolin App resolve essas dores digitalizando todo o ciclo de vida do aluno, preservando integralmente o respeito à tradição e à marcialidade.'
          ),

          createHeading2('1.1 Objetivos Estratégicos'),
          createBullet('Digitalizar e preservar a Ficha de Acompanhamento Técnico oficial com contagem fiel de repetições por técnica (socos, chutes, posturas, katis e defesas).', 'Ficha Técnica Sem Papel:'),
          createBullet('Oferecer aos alunos vídeos didáticos gravados pelo Sifu e instrutores, liberados de acordo com a graduação oficial do praticante.', 'Treino Guiado em Casa:'),
          createBullet('Eliminar ruídos visuais, apresentando para cada aluno apenas as aulas da sua modalidade e faixa etária (Kids, Adulto Iniciante, Geral).', 'Grade de Horários Contextual:'),
          createBullet('Centralizar a aquisição de camisetas oficiais, calças de treino, faixas marciais, proteções e acessórios da escola.', 'Loja e Uniformes:'),
          createBullet('Substituir a lista de papel por um fluxo automatizado de candidatos, histórico de graduações e aprovações pelo Sifu.', 'Gestão de Exames de Faixa:'),
          createBullet('Garantir experiência fluida e nativa em iPhones e Androids com suporte robusto à Safe Area (Notch / Dynamic Island).', 'Mobile-First e PWA:'),

          // ── SEÇÃO 2: STACK TECNOLÓGICO & DECISÕES DE ENGENHARIA ────
          createHeading1('2. Stack Tecnológico e Arquitetura'),
          createParagraph(
            'O projeto adota uma arquitetura full-stack moderna, com renderização híbrida no servidor (SSR), Server Actions com validação de tipos, políticas rígidas de segurança a nível de linha no banco de dados (Row Level Security) e testes unitários automatizados.'
          ),

          createTable(
            ['Camada / Tecnologia', 'Versão', 'Justificativa e Responsabilidade'],
            [
              ['Next.js (App Router)', '16.4.3', 'Framework React com suporte a Turbopack, Partial Prerendering (PPR) e Server Actions com zero boilerplate de API.'],
              ['React & React DOM', '19.3.0', 'Biblioteca de interface com React Server Components (RSC) nativos e hooks de transição assíncrona.'],
              ['Supabase / PostgreSQL', '15 (Cloud)', 'Backend as a Service fornecendo banco relacional com Row Level Security (RLS), autenticação SSR segura e Storage.'],
              ['TypeScript', '5.x', 'Tipagem estática estrita em 100% dos arquivos do projeto, garantindo contratos confiáveis entre banco e front-end.'],
              ['Tailwind CSS', 'v4', 'Motor de estilização atômica de alta performance, integrado com tokens semânticos no globals.css.'],
              ['Vitest & Testing Library', '5.0.5', 'Suite ultrarrápida de testes unitários executada diretamente no runtime de desenvolvimento (99 testes ativos).'],
              ['Vercel Platform', 'Edge/Serverless', 'Hospedagem global de alta disponibilidade com CDN, compressão Brotli e Vercel Analytics integrado.'],
            ]
          ),

          new Paragraph({ spacing: { before: 200 } }),
          createHeading2('2.1 Padrões de Arquitetura de Software'),
          createBullet('Todas as mutações de dados (salvar ficha técnica, realizar pedido na loja, cadastrar vídeo, aprovar exames) são executadas através de Server Actions protegidas com verificação de sessão e permissões RBAC.', 'Server Actions Seguras:'),
          createBullet('Utilização de cache com React cache() em src/lib/user-cache.ts para que múltiplas leituras do perfil do usuário em um mesmo ciclo de renderização não gerem consultas redundantes ao banco.', 'Deduplicação de Consultas:'),
          createBullet('Aplicação de fallback e schemas resilientes que asseguram renderização estável mesmo durante eventuais oscilações de rede.', 'Tolerância a Falhas:'),
          createBullet('O tema adapta-se automaticamente à preferência do sistema operacional do aluno ou alternador manual, mantendo contraste WCAG AAA.', 'Design System Agnóstico ao Tema:'),

          // ── SEÇÃO 3: MÓDULOS FUNCIONAIS DO SISTEMA ─────────────────
          createHeading1('3. Módulos Funcionais do Sistema'),
          createParagraph(
            'O sistema está estruturado em dois universos de experiência complementares: a Área do Aluno (focada em evolução marcial, simplicidade e treino) e o Painel do Sifu / Instrutores (focado em gestão de turmas, controle técnico e homologações).'
          ),

          createHeading2('3.1 Módulo do Aluno (/aluno)'),
          createBullet('Exibe saudação personalizada de acordo com o horário do dia, modalidades ativas e badge marcial com cor autêntica da graduação.', 'Home / Dashboard:'),
          createBullet('Filtra e apresenta estritamente os horários correspondentes ao perfil do aluno logado (ex: alunos Kids visualizam somente turmas infantis; iniciantes visualizam turmas iniciantes).', 'Aulas e Horários Filtrados:'),
          createBullet('Digitalização da ficha oficial de papel com número de registro, modalidade e tabela de repetições por técnica. Remove botões desnecessários para visualização limpa.', 'Ficha Técnica Oficial:'),
          createBullet('Catálogo de vídeos didáticos oficiais divididos por categoria. Conta com a Regra Especial Marcial: praticantes de Faixa Preta em diante visualizam exclusivamente vídeos de Katis (formas tradicionais), enquanto faixas coloridas estudam Básicos, Chutes e Aplicações.', 'Vídeos de Treino por Faixa:'),
          createBullet('Catálogo de uniformes, faixas e proteções. Permite ao aluno realizar reservas, escolher forma de pagamento (Recepção ou PIX) e editar/cancelar pedidos ainda não faturados.', 'Loja Oficial da Escola:'),
          createBullet('Exibição de histórico marcial de graduações, dados cadastrais, alternância de modo escuro e atalho de instalação do PWA no dispositivo.', 'Perfil do Aluno:'),

          createHeading2('3.2 Módulo de Gestão Administrativa (/admin)'),
          createBullet('Busca instantânea e simplificada por nome ou e-mail, sem poluição de tags, facilitando a localização rápida de alunos durante o expediente da escola.', 'Hub de Alunos:'),
          createBullet('Permite ao instrutor ou Sifu lançar repetições na ficha do praticante (0 a 6), realizar undo de cliques acidentais e salvar alterações de forma segura.', 'Gerenciador da Ficha Técnica:'),
          createBullet('Montagem de listas de exame de graduação, checagem de elegibilidade por frequência e tempo de prática, homologação de notas e promoção automática de faixa.', 'Gestão de Exames de Faixa:'),
          createBullet('Criação e edição de horários de treinos por modalidade, faixa etária e dias da semana.', 'Gestão de Turmas e Horários:'),
          createBullet('Upload de vídeos no formato .mp4 ou links externos, associando a graduação mínima necessária e categoria com validação marcial.', 'Gerenciador de Vídeos:'),
          createBullet('Cadastro de produtos com upload de foto real, controle de estoque, definição de valores e acompanhamento de pedidos recebidos.', 'Gestão da Loja:'),
          createBullet('Publicação de avisos e comunicados técnicos com suporte a formatação rica, links úteis e segmentação por modalidade.', 'Mural de Avisos:'),

          // ── SEÇÃO 4: HIERARQUIA MARCIAL E ACESSIBILIDADE VISUAL ───
          createHeading1('4. Hierarquia Marcial e Sistema de Contraste'),
          createParagraph(
            'A Escola Núcleo de Kung Fu Shaolin adota uma hierarquia tradicional rigorosa de 10 faixas oficiais. Um dos maiores desafios de design em aplicativos com faixas marciais é a variação extrema de cores (do branco claro ao preto escuro), que frequentemente quebra a legibilidade de textos quando implementada de forma ingênua.'
          ),
          createParagraph(
            'Para solucionar definitivamente essa questão, o Núcleo Shaolin App conta com um utilitário centralizado de tema em src/lib/beltTheme.ts, validado por testes unitários automatizados.'
          ),

          createTable(
            ['Nível / Ordem', 'Nome Oficial da Faixa', 'Cor Hex', 'Tratamento Visual no Sistema'],
            [
              ['1º Nível', 'Faixa Branca', '#E2E8F0', 'Badge com fundo elevado e borda visível para não desaparecer em fundo claro.'],
              ['2º Nível', 'Faixa Amarela', '#FFD700', 'Tom de âmbar equilibrado (#F59E0B) com contraste testado contra fundos claros e escuros.'],
              ['3º Nível', 'Faixa Laranja', '#FF8C00', 'Destaque vibrante com pílula translúcida e ponto indicador sólido.'],
              ['4º Nível', 'Faixa Verde-Jade', '#00A86B', 'Verde tradicional de alta nitidez com borda semi-transparente.'],
              ['5º Nível', 'Faixa Verde Escura', '#006400', 'Verde floresta nobre com indicador sólido de graduação.'],
              ['6º Nível', 'Faixa Roxa', '#800080', 'Roxo imperial de destaque com texto de alto contraste.'],
              ['7º Nível', 'Faixa Vermelha', '#DC143C', 'Vermelho marcial tradicional com contorno delimitador.'],
              ['8º Nível', 'Faixa Marrom-Clara', '#C4A35A', 'Tom ocre suave com borda lateral na ficha técnica.'],
              ['9º Nível', 'Faixa Marrom-Avançada', '#8B4513', 'Marrom escuro encorpado com alta legibilidade.'],
              ['10º Nível', 'Faixa Preta (e Graus)', '#1A1A1A', 'Tratamento de honra marcial: pílula preto ônix (#141414) com borda e texto em dourado marcial (#D4AF37 / #FDE047) e avatar com aro de ouro.'],
            ]
          ),

          new Paragraph({ spacing: { before: 200 } }),
          createCallout(
            'O nome do aluno no cabeçalho da ficha nunca utiliza cores aleatórias sobrepostas; ele reside sobre um card com fundo adaptativo (var(--color-bg-card)) e uma faixa lateral (border-left: 6px solid) na cor da graduação, eliminando 100% dos conflitos visuais de contraste.',
            'REGRA DE OURO DE ACESSIBILIDADE MARCIAL'
          ),

          // ── SEÇÃO 5: MODELO DE DADOS & DICIONÁRIO SUPABASE ────────
          createHeading1('5. Modelo de Dados (PostgreSQL / Supabase)'),
          createParagraph(
            'O banco de dados relacional foi modelado com integridade referencial estrita e índices estratégicos para responder com latência inferior a 50ms.'
          ),

          createHeading2('5.1 Principais Tabelas do Sistema'),
          createBullet('Armazena os dados cadastrais do usuário (nome, CPF, data de nascimento, telefone, foto, aceite de termos legais de saúde e imagem) e seu papel no sistema (student, instructor, admin, super_admin).', 'profiles:'),
          createBullet('Cadastro das artes marciais ensinadas na escola (Kung Fu Choy Lay Fut, Tai Chi Chuan, Sanda).', 'modalities:'),
          createBullet('Níveis de faixa associados a cada modalidade, ordem hierárquica e código hexadecimal oficial.', 'graduations:'),
          createBullet('Vínculo entre o aluno e suas modalidades de treino, guardando a faixa homologada atual e status da matrícula.', 'student_modalities:'),
          createBullet('Grade horária das turmas com dia da semana, horário de início e término e modalidade.', 'class_schedules:'),
          createBullet('Registro das presenças dos alunos em cada aula realizada na escola.', 'attendance:'),
          createBullet('Acervo de vídeos de treinamento com categoria, graduação mínima e URL de mídia.', 'videos:'),
          createBullet('Listas de exame de graduação criadas pelos instrutores e aprovadas pelo Sifu.', 'exam_lists:'),
          createBullet('Alunos vinculados a uma lista de exame com a faixa-alvo pretendida e anotações técnicas.', 'exam_list_candidates:'),
          createBullet('Catálogo de uniformes, calças, faixas e proteções com preço, imagem e controle de estoque.', 'products:'),
          createBullet('Registro de pedidos de compra realizados pelos alunos com forma de pagamento e status da entrega.', 'product_orders:'),
          createBullet('Histórico imutável de todas as promoções de faixa recebidas pelo aluno ao longo dos anos.', 'graduation_history:'),

          // ── SEÇÃO 6: SEGURANÇA E POLÍTICAS DE ACESSO (RLS) ────────
          createHeading1('6. Segurança, Permissões e Safe Area iOS'),
          createParagraph(
            'A segurança do sistema é estruturada em três camadas independentes: Row Level Security no PostgreSQL, Server Actions com verificação de papéis no Next.js e sanitização de dados de entrada.'
          ),

          createHeading2('6.1 Perfis de Usuário (RBAC)'),
          createBullet('Acesso exclusivo aos seus próprios treinos, ficha técnica, vídeos da sua graduação, grade de horários compatível e loja oficial.', 'Aluno (student):'),
          createBullet('Acesso de edição à ficha técnica dos alunos nas aulas, lançamento de frequências e indicação de candidatos a exame.', 'Instrutor (instructor / admin):'),
          createBullet('Acesso irrestrito a todas as turmas, homologação final de exames de faixa, cadastro de produtos na loja, publicação de avisos gerais e gestão de instrutores.', 'Sifu / Administrador Geral (super_admin):'),

          createHeading2('6.2 Tratamento Especial para Telas de iPhone (Safe Area)'),
          createParagraph(
            'Em smartphones iPhone modernos dotados de Notch ou Dynamic Island, a barra de status nativa do sistema sobrepõe elementos fixos no topo caso o aplicativo declare viewport-fit=cover sem resguardo adequado. O Núcleo Shaolin App implementa um motor CSS de Safe Area que calcula dinamicamente:'
          ),
          createBullet('Aplica padding-top de 54px a 64px garantindo que a logo e os botões de ação fiquem 100% livres de qualquer sobreposição pelo relógio ou indicadores da operadora.', 'TopBar com Respiro Dinâmico:'),
          createBullet('Eleva a barra de navegação inferior respeitando a linha de gestos do iOS (home bar), garantindo toques confortáveis.', 'BottomNav com Safe Area Inferior:'),

          // ── SEÇÃO 7: GUIA DE INSTALAÇÃO E EXECUÇÃO ────────────────
          createHeading1('7. Guia de Instalação, Testes e Implantação'),
          createParagraph(
            'O projeto é totalmente reprodutível em ambientes Linux, macOS e Windows (WSL2), necessitando apenas de Node.js 20+ e um projeto configurado no Supabase.'
          ),

          createHeading2('7.1 Variáveis de Ambiente (.env.local)'),
          createBullet('URL do projeto no Supabase (ex: https://xyz.supabase.co)', 'NEXT_PUBLIC_SUPABASE_URL:'),
          createBullet('Chave anônima pública do cliente Supabase para consultas no navegador.', 'NEXT_PUBLIC_SUPABASE_ANON_KEY:'),
          createBullet('Chave de serviço administrativo para operações privilegiadas executadas no servidor.', 'SUPABASE_SERVICE_ROLE_KEY:'),

          createHeading2('7.2 Comandos Principais'),
          createTable(
            ['Comando', 'Descrição do Efeito'],
            [
              ['npm run dev', 'Inicia o servidor de desenvolvimento com Turbopack em http://localhost:3000.'],
              ['npm run build', 'Compila a aplicação para produção, gerando páginas estáticas otimizadas.'],
              ['npm run test', 'Executa os 99 testes unitários automatizados com Vitest de forma instantânea.'],
              ['npm run lint', 'Executa a checagem estática de código com o ESLint 9.'],
            ]
          ),

          new Paragraph({ spacing: { before: 300 } }),
          createCallout(
            'Todos os 99 testes unitários da aplicação estão aprovados com 100% de sucesso, cobrindo utilitários de contraste de faixas marciais, formatação de avisos técnicos, schemas de repetição e lógica de visualização de horários.',
            'QUALIDADE ASSEGURADA'
          ),

          new Paragraph({ spacing: { before: 400 } }),
          createParagraph(
            'Núcleo de Kung Fu Shaolin — Tradição Marcial e Tecnologia em Harmonia.',
            { alignment: AlignmentType.CENTER, italics: true, color: COLORS.TEXT_MUTED }
          ),
        ],
      },
    ],
  });

  const outputPath = path.join(process.cwd(), 'DOCUMENTACAO_SISTEMA_NUCLEO_SHAOLIN.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Documento DOCX gerado com sucesso em: ${outputPath}`);
  console.log(`Tamanho do arquivo: ${(buffer.length / 1024).toFixed(2)} KB`);
}

generateDocx().catch((err) => {
  console.error('Erro ao gerar DOCX:', err);
  process.exit(1);
});
