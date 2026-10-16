# 🥋 Núcleo de Kung Fu Shaolin — Portal & App do Aluno

> Plataforma web oficial do **Núcleo de Kung Fu Shaolin**, sob supervisão técnica do **Sifu Guilherme**. Une a tradição marcial milenar chinesa à tecnologia moderna para acompanhamento técnico, graduações e gestão do dojô (*Kwoon*).

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-gold?style=for-the-badge)](#)

---

## 🌟 Visão Geral

O sistema atende a três frentes principais:
1. **Página Institucional**: Apresentação minimalista, elegante e de alto impacto das modalidades (Kung Fu Shaolin Choy Lay Fut, Tai Chi Chuan Yang e Sanda / Boxe Chinês), história do dojô e esclarecimento de dúvidas frequentes.
2. **Área do Aluno**: Ambiente autenticado onde cada praticante acompanha sua trilha marcial, critérios de avaliação, vídeos técnicos autorizados pelo mestre e avisos da escola.
3. **Painel do Sifu (Admin)**: Gestão operacional, fila de homologação de novas matrículas, métricas em tempo real e publicação de comunicados com suporte a cartazes e imagens.

---

## ✨ Principais Funcionalidades

### 🏛️ Página Institucional & UX
* **Navbar Minimalista & Responsiva**: Identidade visual refinada com logotipo oficial, alternador de modo escuro/claro e botões diretos de acesso e matrícula.
* **Apresentação Objetiva de Modalidades**: Cards com benefícios, armas clássicas e orientações pedagógicas para todas as idades (de crianças a adultos).
* **FAQ Interativo**: Esclarecimentos imediatos sobre início dos treinos, vestimenta e aula experimental.

### 🥋 Área do Aluno
* **Dashboard Marcial**: Saudação contextualizada, faixa marcial dinâmica estilizada e indicador da próxima graduação.
* **Ficha Técnica & Critérios do Sifu**:
  * Avaliações periódicas em 3 pilares: **Postura** (*Bases Ma Bu / Gong Bu*), **Técnica** (*Formas / Katis*) e **Foco / Wu De** (*Respiração e conduta*).
  * Pareceres e observações personalizadas do Sifu Guilherme.
* **Histórico Oficial de Graduações**: Certificados e registro permanente das promoções de faixa.
* **Biblioteca de Vídeos**: Katis e sequências homologadas pelo mestre com dicas técnicas e categorização por nível de aprendizado.
* **Grade Semanal & Presenças**: Horários de treino e controle de frequência.

### 📢 Mural de Avisos com Suporte a Cartazes Visuais
* **Formato Cartaz (Flyer em vez de descrição)**: Permite enviar comunicados visuais (seminários, torneios, trocas de faixa) diretamente como imagem.
* **Upload Seguro**: Armazenamento no bucket público `announcements` do Supabase Storage com suporte a JPG, PNG, WEBP e GIF até 5MB.
* **Leitor Modal Responsivo**: Visualização em alta definição para o aluno com badge de destaque.

### 🛡️ Painel do Sifu (Administração)
* **Fila de Homologação**: Aprovação ou recusa de novos cadastros com análise de dados de saúde, autorização de imagem e modalidade solicitada.
* **CRUD Completo de Avisos**: Publicação, edição, ativação/desativação e segmentação por modalidade ou comunicado geral.
* **Métricas Operacionais**: Contadores em tempo real de alunos matriculados, solicitações pendentes e turmas do dia.

---

## 🎨 NKFS Design System

A interface segue uma identidade visual inspirada no templo Shaolin:
* **Cores Principais**:
  * `Azul Noturno`: `#0A1128` (Profundidade e serenidade)
  * `Dourado Shaolin`: `#FFC800` (Modo escuro) / `#D97706` (Modo claro)
  * `Azul Primário`: `#1361C8` (Ações e contrastes)
* **Tipografia Padronizada**:
  * `nkfs-p-m` (`1rem` / 16px): Padrão de leitura para corpos de texto e formulários.
  * `nkfs-tag-p` (`0.6875rem` / 11px): Metadados, badges, status e categorias.
  * `nkfs-h-g` / `nkfs-h-m` / `nkfs-h-p`: Escalas de títulos hierárquicos.
* **Temas**: Modo claro nativo como padrão com alternador instantâneo para modo escuro via CSS tokens.

---

## 🚀 Tecnologias

* **Framework**: [Next.js 16.4.0](https://nextjs.org/) (Turbopack, App Router, Partial Prefetching, Cache Components)
* **Linguagem**: [TypeScript 5](https://www.typescriptlang.org/)
* **Estilização**: Vanilla CSS com Tokens do Design System (`globals.css`) e utilitários modernos
* **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/)
  * Auth com cookies seguros via `@supabase/ssr`
  * PostgreSQL com Row Level Security (RLS)
  * Storage para uploads de mídia e cartazes de avisos
* **Qualidade de Código**: ESLint 9 com Flat Config

---

## 🛠️ Instalação e Execução Local

### Pré-requisitos
* Node.js 20+ ou superior
* npm, yarn ou pnpm
* Projeto configurado no Supabase

### 1. Clonar o repositório
```bash
git clone https://github.com/TheGVictor/nucleo-app.git
cd nucleo-app/nucleo-shaolin-app
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env.local` na pasta `nucleo-shaolin-app/` com as credenciais do seu projeto Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-supabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 4. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

### 5. Build de produção
```bash
npm run build
npm run start
```

---

## 📁 Estrutura de Pastas

```text
nucleo-shaolin-app/
├── public/                 # Favicons, logo oficial e manifest PWA
├── src/
│   ├── app/                # Rotas do Next.js App Router
│   │   ├── admin/          # Painel operacional do Sifu e CRUD de avisos
│   │   ├── aluno/          # Dashboard, Ficha Técnica, Vídeos e Perfil
│   │   ├── cadastro/       # Fluxo de matrícula e pré-cadastro
│   │   ├── login/          # Autenticação segura de alunos e administradores
│   │   ├── globals.css     # Design System com tokens, variáveis e temas
│   │   ├── layout.tsx      # Root Layout com viewport, fontes e metadata
│   │   └── page.tsx        # Landing Page institucional despoluída
│   ├── components/
│   │   ├── admin/          # Gestores de homologação e avisos
│   │   ├── aluno/          # Lista de comunicados, player de vídeos e ficha
│   │   ├── layout/         # TopBar e BottomNav responsivos
│   │   └── ui/             # Botões, Badges, Avatar, Logo e ThemeToggle
│   ├── lib/
│   │   ├── announcements.ts # Parser e builder de comunicados e cartazes
│   │   └── supabase/       # Clientes Supabase (Server, Client, Middleware, Admin)
│   ├── middleware.ts       # Controle de rotas protegidas e sessão
│   └── types/              # Definições de tipagem TypeScript do banco
└── next.config.ts          # Configurações do Next.js e Turbopack
```

---

## 📜 Licença e Direitos

Projeto desenvolvido com exclusividade para o **Núcleo de Kung Fu Shaolin**. Todos os direitos reservados.
