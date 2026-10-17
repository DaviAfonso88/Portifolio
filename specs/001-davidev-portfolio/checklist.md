# Requirements & Quality Checklist: DaviDev

**Feature ID:** `001-davidev-portfolio`  
**Phase:** Specification Quality Gate (`/speckit.checklist`)  
**Context:** `specs/001-davidev-portfolio/spec.md`, `specs/001-davidev-portfolio/plan.md`  
**Constitution:** `.specify/memory/constitution.md`  

Este checklist serve como **teste de unidade para a especificação de requisitos**. Antes de iniciar a execução das tarefas de código, todos os itens abaixo devem estar verificados e validados.

---

## 1. Completude e Cobertura de Requisitos

- [x] **Mapeamento Integral do PRD:** Todas as 22 histórias de usuário do `docs/prd.md` estão contempladas nos 6 épicos da especificação `spec.md`.
- [x] **Rastreabilidade de Regras de Negócio (BR-001 a BR-013):** Todas as 13 regras de negócio possuem tratamento de erro explícito com códigos HTTP e mensagens dedicadas catalogadas.
- [x] **Exclusão Explícita de Escopo:** Limites claros de não-escopo declarados (sem RBAC multi-tenant, sem diff/restore de versão visual, sem CMS para projetos/habilidades, sem busca full-text).
- [x] **Conexão com Design System:** As 18 telas definidas em `design/canvas.json` e a folha de tokens `design/Tokens.dc.html` estão referenciadas e contempladas na spec.

---

## 2. Conformidade Arquitetural e Fronteiras (Hexagonal)

- [x] **Isolamento de Domínio (DEP-1):** O pacote `packages/domain` possui zero dependências de bibliotecas externas ou frameworks HTTP/DB.
- [x] **Inversão de Dependências (DEP-2):** O pacote `packages/application` define portas (interfaces) abstratas sem conhecer implementações concretas de Drizzle, Resend ou Fastify.
- [x] **Enforcement Automatizado:** O `dependency-cruiser` está configurado para validar as regras DEP-1 a DEP-7 no pipeline de CI com quebra de build.
- [x] **Dois Driving Adapters:** O acesso de leitura in-process (RSC) e o acesso de mutação via Fastify REST utilizam estritamente os mesmos casos de uso de aplicação (`DEP-6`).

---

## 3. Integridade e Estratégia de Dados

- [x] **Unicidade e Redirecionamento de Slugs (BR-003, BR-004, BR-013):** Modelado fisicamente na tabela `post_slug` com `UNIQUE (slug, locale)`, dispensando triggers frágeis ou lógica ad-hoc.
- [x] **Integridade Referencial com ON DELETE Rules:**
  - `category` $\to$ `post`: **RESTRICT** (sustenta BR-009).
  - `tag` $\to$ `post_tag`: **RESTRICT** (sustenta BR-009).
  - `post` $\to$ `post_slug`: **CASCADE** (sustenta BR-007).
  - `post` $\to$ `post_version`: **CASCADE** (sustenta BR-007).
- [x] **Serverless Connection Proof:** Driver `@neondatabase/serverless` HTTP adotado para eliminar risco de esgotamento de conexões TCP.
- [x] **Política Forward-Only de Migrações:** Sem migrações de reversão (down-migrations); correções feitas por avanço de schema.

---

## 4. Segurança, Sessão e Resiliência Serverless

- [x] **Ausência de Estado em Memória:** Proibição de contadores ou caches em memória volátil. Tabela `rate_limit_counter` no PostgreSQL utilizada com upsert atômico.
- [x] **Segurança de Tokens:**
  - Access Token em memória volátil do cliente (15 min).
  - Refresh Token em cookie `httpOnly`, `Secure`, `SameSite=Strict` com rotação a cada uso (7 dias).
  - Revogação persistida no banco (`revoked_at`).
- [x] **Proteção de Senha:** Provisionamento com hash Argon2id a partir de variáveis de ambiente. Zero senha em texto claro.
- [x] **Prevenção de Abuso no Contato:** Cloudflare Turnstile obrigatório antes da persistência; rate limit estrito de 3 req/hora por IP hasheado.

---

## 5. Acessibilidade, Tema e i18n

- [x] **WCAG 2.1 AA nos Dois Temas:** Contraste mínimo de 4.5:1 para texto normal garantido e validado via `axe-core` em Light e Dark mode.
- [x] **Prevenção de Flash de Tema (FOUC):** Script inline síncrono no `head` para aplicar `.dark` antes da renderização.
- [x] **Internacionalização Completa da Vitrine:** Rotas `/pt-BR` e `/en` com metadados de SEO, OpenGraph e `hreflang` dedicados.
- [x] **Resiliência para Artigos Mono-idioma:** Exibição elegante com banner informativo em caso de ausência de tradução, sem 404 falso.

---

## 6. Qualidade e Cobertura de Testes

- [x] **Testabilidade sem Infraestrutura:** Casos de uso e entidades testáveis com dublês de teste (in-memory repositories) sem necessidade de PostgreSQL ou Fastify ativos.
- [x] **Meta de Cobertura:** $\ge 80\%$ de cobertura de testes unitários nas camadas `domain` e `application`.
- [x] **Caminhos Críticos E2E:** 7 fluxos end-to-end definidos para automação com Playwright.
