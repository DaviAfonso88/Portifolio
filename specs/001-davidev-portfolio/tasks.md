# Task Breakdown: DaviDev Portfolio, Blog & CMS

**Feature ID:** `001-davidev-portfolio`  
**Status:** Ready for Implementation (`/speckit.tasks`)  
**Context:** `specs/001-davidev-portfolio/plan.md`, `specs/001-davidev-portfolio/data-model.md`  
**Constitution:** `.specify/memory/constitution.md`  

---

## Legenda de Execução
*   `[P]`: Tarefa executável em paralelo (não possui dependência direta de tarefas no mesmo nível).
*   `[DoD]`: Critério de Aceite e Definição de Pronto da tarefa.

---

## Fase 1: Fundação & Infraestrutura Base

- [x] **T01.01 [P] — Configuração do Monorepo e Workspace pnpm**
  - **Contexto:** Inicializar raiz do projeto com `pnpm-workspace.yaml`, `.npmrc`, `package.json` raiz e scripts comuns (`build`, `lint`, `typecheck`, `test`).
  - **Arquivos:** `pnpm-workspace.yaml`, `package.json`, `tsconfig.base.json`.
  - **[DoD]:** `pnpm install` executa com sucesso vinculando os workspaces `apps/*` e `packages/*`.

- [x] **T01.02 [P] — Configuração das Regras de Arquitetura (`dependency-cruiser`)**
  - **Contexto:** Configurar enforcement estrito das regras de isolamento arquitetural DEP-1 a DEP-7.
  - **Arquivos:** `dependency-cruiser.config.js`.
  - **[DoD]:** `pnpm arch:check` executa e quebra o build caso um pacote acople indevidamente.

- [x] **T01.03 [P] — Pacote de Domínio (`packages/domain`) — Núcleo Base**
  - **Contexto:** Definir Enums (`PostStatus`, `PostLocale`), Value Objects (`Slug`, `Locale`, `Email`, `MarkdownContent`) e interfaces de Domain Events.
  - **Arquivos:** `packages/domain/src/enums/*`, `packages/domain/src/value-objects/*`, `packages/domain/src/events/*`.
  - **[DoD]:** TypeScript compila sem qualquer dependência externa (`DEP-1`).

- [x] **T01.04 — Pacote de Infraestrutura (`packages/infrastructure`) — Schema Drizzle e Conexão Neon**
  - **Contexto:** Implementar schema relacional com Drizzle ORM e cliente stateless `@neondatabase/serverless` (HTTP).
  - **Arquivos:** `packages/infrastructure/src/db/schema.ts`, `packages/infrastructure/src/db/client.ts`, `drizzle.config.ts`.
  - **[DoD]:** `pnpm db:generate` gera arquivos SQL válidos na pasta de migrações.

- [x] **T01.05 — Setup do Frontend Next.js (`apps/web`) com Tokens Editoriais e shadcn/ui**
  - **Contexto:** Inicializar app Next.js 15+ com App Router, Tailwind CSS configurado com os tokens de `design/Tokens.dc.html`, componentes shadcn/ui base e script anti-FOUC de tema.
  - **Arquivos:** `apps/web/package.json`, `apps/web/tailwind.config.ts`, `apps/web/app/globals.css`, `apps/web/components/theme-provider.tsx`.
  - **[DoD]:** Aplicação Next.js inicializa em `localhost:3000` suportando alternância de tema sem flash visual.

- [x] **T01.06 — Roteamento Bilíngue Base (`[locale]`)**
  - **Contexto:** Configurar estrutura de rotas com suporte aos prefixos `/pt-BR` e `/en` e persistência de preferência de idioma.
  - **Arquivos:** `apps/web/app/[locale]/layout.tsx`, `apps/web/middleware.ts`.
  - **[DoD]:** Acessar `/` redireciona para o locale adequado preservando a navegação.

- [x] **T01.07 — Host Serverless da API Fastify (`packages/http`)**
  - **Contexto:** Inicializar Fastify com `@fastify/swagger`, plugins de segurança e rota catch-all no Next.js para delegar requisições `/api/v1/*`.
  - **Arquivos:** `packages/http/src/app.ts`, `apps/web/app/api/[...path]/route.ts`.
  - **[DoD]:** `GET http://localhost:3000/api/v1/health` responde `{ status: "ok" }`.

- [x] **T01.08 — Pipeline de Integração Contínua (CI com 10 Gates)**
  - **Contexto:** Configurar workflow GitHub Actions rodando os 10 gates obrigatórios.
  - **Arquivos:** `.github/workflows/ci.yml`.
  - **[DoD]:** Execução de `pnpm ci` passa limpa em todos os steps.

- [x] **T01.09 — Validação e Testes da Fase 1 via TestSprite MCP**
  - **Contexto:** Acionar o MCP TestSprite para gerar e executar testes automatizados sobre a fundação do monorepo, schema Drizzle/Neon, roteamento base Next.js e endpoint `/api/v1/health`.
  - **Ferramentas:** TestSprite MCP (`testsprite_generate_backend_test_plan`, `testsprite_generate_code_and_execute`).
  - **[DoD]:** Bateria de testes do TestSprite executada com sucesso, validando a integridade da infraestrutura base.

---

## Fase 2: Portfólio Institucional & Vitrine Pública

- [x] **T02.01 [P] — Cabeçalho, Navegação e Colofão (Layout Público)**
  - **Contexto:** Construir Header responsivo com seletor de idioma, toggle de tema e Footer técnico estilo colofão (`design/Main.dc.html`).
  - **Arquivos:** `apps/web/components/public/header.tsx`, `apps/web/components/public/footer.tsx`.
  - **[DoD]:** Cabeçalho e rodapé exibidos com contraste AA e navegação funcional por teclado.

- [x] **T02.02 [P] — Página Home (`US-01`)**
  - **Contexto:** Implementar apresentação profissional, frase de impacto, cards de projetos em destaque e artigos recentes.
  - **Arquivos:** `apps/web/app/[locale]/page.tsx`, `apps/web/components/public/project-highlight-card.tsx`.
  - **[DoD]:** Home atende a todos os critérios da `US-01` e renderiza em resoluções de 320px a 1920px.

- [x] **T02.03 [P] — Páginas Sobre Mim, Habilidades e Conhecimentos (`US-02`)**
  - **Contexto:** Implementar páginas institucionais com foto e biografia (Sobre), habilidades com contexto prático real (sem barras percentuais) e fundamentos arquiteturais (Conhecimentos).
  - **Arquivos:** `apps/web/app/[locale]/sobre/page.tsx`, `apps/web/app/[locale]/habilidades/page.tsx`, `apps/web/app/[locale]/conhecimentos/page.tsx`.
  - **[DoD]:** Conteúdo 100% tipado e traduzido nos dois idiomas (`pt-BR` e `en`).

- [x] **T02.04 [P] — Páginas de Experiências e Projetos (`US-03`)**
  - **Contexto:** Listagem cronológica de experiências e catálogo de projetos com página de detalhe em duas camadas (negócio e engenharia técnica).
  - **Arquivos:** `apps/web/app/[locale]/experiencias/page.tsx`, `apps/web/app/[locale]/projetos/page.tsx`, `apps/web/app/[locale]/projetos/[slug]/page.tsx`.
  - **[DoD]:** Detalhe de projeto expõe desafios de engenharia e impacto de negócio.

- [x] **T02.05 — Caso de Uso e Adaptadores de Contato (`US-04`, `BR-012`)**
  - **Contexto:** Implementar caso de uso `SubmitContactMessageUseCase`, adaptador Drizzle para `contact_message`, adaptador Turnstile e adaptador Resend.
  - **Arquivos:** `packages/application/src/use-cases/submit-contact-message.ts`, `packages/infrastructure/src/services/turnstile.ts`, `packages/infrastructure/src/services/resend.ts`.
  - **[DoD]:** Mensagem persistida no banco mesmo se a API de e-mail falhar. Testes unitários com dublês passando.

- [x] **T02.06 — Endpoint e Formulário de Contato (`US-04`)**
  - **Contexto:** Endpoint `POST /api/v1/contact` no Fastify com validação Zod e rate limit de 3/hora por IP. Formulário React com feedback de sucesso/erro e widget Cloudflare Turnstile.
  - **Arquivos:** `packages/http/src/routes/contact.ts`, `apps/web/app/[locale]/contato/page.tsx`, `apps/web/components/public/contact-form.tsx`.
  - **[DoD]:** Formulário envia mensagem com sucesso, valida captcha e impede disparos abusivos.

- [x] **T02.07 [P] — Página de Política de Privacidade e SEO Base**
  - **Contexto:** Página `/privacidade` em conformidade LGPD/GDPR declarando retenção de 24 meses das mensagens de contato e ausência de cookies de terceiros.
  - **Arquivos:** `apps/web/app/[locale]/privacidade/page.tsx`, `apps/web/app/[locale]/opengraph-image.tsx`.
  - **[DoD]:** Metadados OpenGraph e canonical links presentes.

- [x] **T02.08 — Publicação do Domínio (`davidev.net.br`) — Marco Obrigatório**
  - **Contexto:** Deploy na Vercel e apontamento DNS do domínio oficial.
  - **[DoD]:** Vitrine do portfólio acessível publicamente em `davidev.net.br` nos dois idiomas.

- [x] **T02.09 — Validação e Testes da Fase 2 via TestSprite MCP**
  - **Contexto:** Acionar o MCP TestSprite para gerar e executar planos de testes frontend e backend cobrindo as páginas institucionais (Home, Sobre, Habilidades, Conhecimentos, Experiências, Projetos) e o fluxo do formulário de contato (`POST /api/v1/contact`).
  - **Ferramentas:** TestSprite MCP (`testsprite_generate_frontend_test_plan`, `testsprite_generate_backend_test_plan`, `testsprite_generate_code_and_execute`).
  - **[DoD]:** Testes de UI e API executados e aprovados no TestSprite, assegurando responsividade, envio de contato e ausência de regressões na vitrine.

---

## Fase 3: Blog Público & Motor Editorial

- [x] **T03.01 — Entidades de Domínio e Casos de Uso de Leitura do Blog**
  - **Contexto:** Entidade `Post`, `PostSlug` e casos de uso `ListPublishedPostsUseCase` e `GetPostBySlugUseCase` garantindo `BR-006` (invisibilidade de rascunhos).
  - **Arquivos:** `packages/domain/src/entities/post.ts`, `packages/application/src/use-cases/list-published-posts.ts`, `packages/application/src/use-cases/get-post-by-slug.ts`.
  - **[DoD]:** Testes unitários comprovam que rascunhos nunca são retornados e consultas por slug histórico resolvem para o post correto.

- [x] **T03.02 — Endpoints Públicos de Leitura no Fastify e Swagger**
  - **Contexto:** Implementar rotas `GET /api/v1/posts`, `GET /api/v1/posts/{locale}/{slug}`, `GET /api/v1/categories`, `GET /api/v1/tags`.
  - **Arquivos:** `packages/http/src/routes/posts.ts`, `packages/http/src/routes/taxonomies.ts`.
  - **[DoD]:** Endpoints documentados na Swagger UI em `/api/docs`.

- [x] **T03.03 — Componente de Renderização e Sanitização Markdown (`<ArticleRenderer />`)**
  - **Contexto:** Pipeline `remark`/`rehype` com sanitização contra XSS, tabelas GFM e realce de código sintático com suporte a tema claro e escuro.
  - **Arquivos:** `apps/web/components/blog/article-renderer.tsx`.
  - **[DoD]:** Renderiza Markdown seguro com realce de sintaxe sem executar scripts maliciosos.

- [x] **T03.04 — Listagem do Blog com Filtros Dinâmicos (`US-05`)**
  - **Contexto:** Página `/blog` com RSC consumindo caso de uso in-process, filtros por categoria e tag, suporte a paginação e aviso explícito de artigos mono-idioma.
  - **Arquivos:** `apps/web/app/[locale]/blog/page.tsx`, `apps/web/components/blog/post-card.tsx`, `apps/web/components/blog/taxonomy-filter.tsx`.
  - **[DoD]:** Filtros refletem na URL (`?category=x&tag=y`) e preservam histórico de navegação.

- [x] **T03.05 — Página de Leitura do Artigo com ISR e Redirecionamento 301 (`US-06`, `BR-004`)**
  - **Contexto:** Rota `/blog/[slug]` com geração estática e revalidação sob demanda (`revalidateTag`). Responde HTTP 301 caso o slug acessado seja histórico.
  - **Arquivos:** `apps/web/app/[locale]/blog/[slug]/page.tsx`.
  - **[DoD]:** Acesso a slug histórico redireciona com 301 para o slug atual; slug inexistente retorna 404 tratado.

- [x] **T03.06 — Sitemap Dinâmico e Metadados Estruturados de SEO**
  - **Contexto:** Gerador de `sitemap.xml` cobrindo rotas públicas e posts publicados em ambos os locales com tags `hreflang`.
  - **Arquivos:** `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`.
  - **[DoD]:** `sitemap.xml` gerado automaticamente sem incluir rotas administrativas.

- [x] **T03.07 — Validação e Testes da Fase 3 via TestSprite MCP**
  - **Contexto:** Acionar o MCP TestSprite para gerar e executar testes sobre as rotas de leitura do blog (`GET /api/v1/posts`, `/api/v1/posts/{locale}/{slug}`, categorias/tags), renderizador `<ArticleRenderer />`, filtros dinâmicos e redirecionamento 301 de slugs.
  - **Ferramentas:** TestSprite MCP (`testsprite_generate_frontend_test_plan`, `testsprite_generate_backend_test_plan`, `testsprite_generate_code_and_execute`).
  - **[DoD]:** Planos de testes do TestSprite executados com sucesso validando invisibilidade de rascunhos, integridade do markdown e SEO/sitemap.

---

## Fase 4: Painel Administrativo (CMS)

- [x] **T04.01 — Autenticação Administrativa JWT e Gestão de Sessão (`US-07`)**
  - **Contexto:** Casos de uso de autenticação, geração de JWT (Access Token 15m), gravação de Refresh Token rotacionado no banco com cookie HttpOnly SameSite=Strict e logout com revogação.
  - **Arquivos:** `packages/application/src/use-cases/auth/*`, `packages/http/src/routes/auth.ts`, `packages/infrastructure/src/security/hasher.ts`.
  - **[DoD]:** Rotação de refresh token testada; tokens revogados não renovam sessão.

- [x] **T04.02 — Geração Automatizada do Cliente da API (`packages/api-client`)**
  - **Contexto:** Configurar Orval para gerar cliente TypeScript a partir do OpenAPI emitido pelo Fastify.
  - **Arquivos:** `orval.config.ts`, `packages/api-client/src/*`.
  - **[DoD]:** `pnpm api:generate` executa e `pnpm api:contract:check` passa sem diff no git.

- [x] **T04.03 — Telas de Login e Layout Administrativo**
  - **Contexto:** Tela de login `/admin/login` e layout do painel com guarda de autenticação client-side e renovação automática de token.
  - **Arquivos:** `apps/web/app/admin/login/page.tsx`, `apps/web/app/admin/layout.tsx`, `apps/web/app/admin/components/sidebar.tsx`.
  - **[DoD]:** Acesso anônimo a `/admin` redireciona para login; sessão expira com segurança.

- [x] **T04.04 — Gestão de Categorias e Tags no CMS (`BR-009`)**
  - **Contexto:** Telas de listagem, criação e edição de taxonomia com campos em `pt-BR` e `en`. Bloqueio de exclusão de itens em uso.
  - **Arquivos:** `apps/web/app/admin/taxonomia/page.tsx`, `packages/application/src/use-cases/taxonomies/*`, `packages/http/src/routes/admin-taxonomies.ts`.
  - **[DoD]:** Excluir categoria ou tag em uso retorna HTTP 409 `RESOURCE_IN_USE` com mensagem clara.

- [x] **T04.05 — Casos de Uso de Mutações de Posts (`BR-001`, `BR-002`, `BR-003`, `BR-010`, `BR-011`)**
  - **Contexto:** Implementar casos de uso `CreatePost`, `UpdatePost`, `PublishPost`, `UnpublishPost`, `MovePostToTrash`, `RestorePostFromTrash` e `DeletePostPermanently`.
  - **Arquivos:** `packages/application/src/use-cases/posts/*`.
  - **[DoD]:** Validação de regras de negócio coberta por testes unitários exaustivos.

- [x] **T04.06 — Rotas Administrativas Fastify `/api/v1/admin/posts/*`**
  - **Contexto:** Implementar endpoints protegidos por Bearer token para operações de posts e transições de estado.
  - **Arquivos:** `packages/http/src/routes/admin-posts.ts`.
  - **[DoD]:** Endpoints de mutação requerem autenticação e emitem eventos de domínio ao comitar.

- [x] **T04.07 — Listagem de Posts e Visualização da Lixeira (`US-11`)**
  - **Contexto:** Tabela administrativa com filtros por status (`rascunho`, `publicado`), busca e aba dedicada de Lixeira com opção de restauração (`BR-008`) e exclusão definitiva (`BR-007`).
  - **Arquivos:** `apps/web/app/admin/posts/page.tsx`, `apps/web/app/admin/posts/lixeira/page.tsx`.
  - **[DoD]:** Posts na lixeira podem ser restaurados ou excluídos fisicamente com aviso de confirmação irreversível.

- [x] **T04.08 — Editor de Posts com Split View (`US-09`, `US-10`)**
  - **Contexto:** Interface de edição com modos Editor / Preview / Split View compartilhando `<ArticleRenderer />`, validação de formulário com Zod e diálogo de confirmação para alteração de slug.
  - **Arquivos:** `apps/web/app/admin/posts/editor/page.tsx`, `apps/web/app/admin/posts/editor/components/split-editor.tsx`.
  - **[DoD]:** Renderização do preview idêntica à página pública do artigo.

- [x] **T04.09 — Painel de Consulta a Mensagens de Contato**
  - **Contexto:** Tela administrativa para leitura das mensagens enviadas com filtro de pendência de notificação por e-mail.
  - **Arquivos:** `apps/web/app/admin/mensagens/page.tsx`.
  - **[DoD]:** Administrador consulta mensagens com paginação e status de notificação.

- [x] **T04.10 — Validação e Testes da Fase 4 via TestSprite MCP**
  - **Contexto:** Acionar o MCP TestSprite para cobrir fluxos administrativos: autenticação JWT, rotação de refresh token, rotas `/api/v1/admin/*`, CRUD de taxonomia com bloqueio de exclusão (`BR-009`), ciclo de vida de posts (rascunho, publicado, lixeira) e preview no split editor.
  - **Ferramentas:** TestSprite MCP (`testsprite_generate_frontend_test_plan`, `testsprite_generate_backend_test_plan`, `testsprite_generate_code_and_execute`).
  - **[DoD]:** Fluxos do painel administrativo validados e aprovados pelo TestSprite com autorização estrita e integridade de dados.

---

## Fase 5: Versionamento Editorial

- [ ] **T05.01 — Entidade `PostVersion` e Lógica de Hash SHA-256 (`BR-005`)**
  - **Contexto:** Gerar nova versão de post apenas sob alteração real do corpo textual pós-publicação comparando `content_hash`.
  - **Arquivos:** `packages/domain/src/entities/post-version.ts`, `packages/application/src/use-cases/posts/update-post.ts`.
  - **[DoD]:** Salvar post publicado alterando apenas tags ou imagem de capa não cria versão duplicada.

- [ ] **T05.02 — Rota de Histórico de Versões no CMS**
  - **Contexto:** Endpoint `GET /api/v1/admin/posts/{id}/versions` retornando histórico sumário (sem corpo longo) e listagem no painel.
  - **Arquivos:** `packages/http/src/routes/admin-post-versions.ts`, `apps/web/app/admin/posts/editor/components/version-history-drawer.tsx`.
  - **[DoD]:** Administrador visualiza lista de versões com numeração e data de alteração.

- [ ] **T05.03 — Sinalização Pública de Atualização (`US-12`)**
  - **Contexto:** Exibição da data de publicação e de última atualização na página do artigo (`/blog/[slug]`) quando divergentes.
  - **Arquivos:** `apps/web/app/[locale]/blog/[slug]/page.tsx`.
  - **[DoD]:** Artigo com edição posterior exibe *"Publicado em DD/MM/AAAA · Atualizado em DD/MM/AAAA"*.

- [ ] **T05.04 — Validação e Testes da Fase 5 via TestSprite MCP**
  - **Contexto:** Acionar o MCP TestSprite para testar o versionamento editorial: geração de versão condicionada a alteração textual (`BR-005`), recuperação do histórico de versões e sinalização pública de última atualização.
  - **Ferramentas:** TestSprite MCP (`testsprite_generate_backend_test_plan`, `testsprite_generate_frontend_test_plan`, `testsprite_generate_code_and_execute`).
  - **[DoD]:** Testes do TestSprite aprovados confirmando hash SHA-256 e exibição correta de versões.

---

## Fase 6: Endurecimento de Segurança

- [ ] **T06.01 — Store de Rate Limiting Atômico no PostgreSQL (`rate_limit_counter`)**
  - **Contexto:** Implementar adaptador `PostgresRateLimiter` com upsert SQL atômico em janela fixa e hash SHA-256 de IPs.
  - **Arquivos:** `packages/infrastructure/src/security/postgres-rate-limiter.ts`.
  - **[DoD]:** Rate limiting funciona consistentemente sem perda de contagem entre instâncias.

- [ ] **T06.02 — Teste de Concorrência em Ambiente Serverless Simulado**
  - **Contexto:** Criar teste de integração disparando requisições paralelas simultâneas validando que o limite de requisições não é ultrapassado.
  - **Arquivos:** `packages/infrastructure/src/security/__tests__/postgres-rate-limiter.spec.ts`.
  - **[DoD]:** Teste concorrente atesta bloqueio exato no limiar especificado.

- [ ] **T06.03 — Content Security Policy (CSP) com Nonce e Headers de Proteção**
  - **Contexto:** Injetar cabeçalhos CSP estritos (`script-src`, `connect-src` para Plausible/Turnstile), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
  - **Arquivos:** `apps/web/next.config.ts`, `apps/web/middleware.ts`.
  - **[DoD]:** Respostas HTTP incluem cabeçalhos de segurança validados por scanner.

- [ ] **T06.04 — Endurecimento de Rotação de Refresh Token**
  - **Contexto:** Detecção de reuso de refresh token revogado invalidando toda a família de sessões do usuário.
  - **Arquivos:** `packages/application/src/use-cases/auth/refresh-session.ts`.
  - **[DoD]:** Uso de token revogado bloqueia a sessão imediatamente.

- [ ] **T06.05 — Validação e Testes da Fase 6 via TestSprite MCP**
  - **Contexto:** Acionar o MCP TestSprite para testar os mecanismos de segurança: rate limiting atômico no PostgreSQL, detecção de reuso de refresh token, headers de proteção HTTP e conformidade de CSP.
  - **Ferramentas:** TestSprite MCP (`testsprite_generate_backend_test_plan`, `testsprite_generate_code_and_execute`).
  - **[DoD]:** Testes de segurança e concorrência executados e aprovados pelo TestSprite sem vulnerabilidades identificadas.

---

## Fase 7: Qualidade, Cobertura e Acessibilidade

- [ ] **T07.01 — Bateria de Testes Unitários de Domínio e Casos de Uso ($\ge 80\%$)**
  - **Contexto:** Cobrir todas as regras de negócio `BR-001` a `BR-013` com testes unitários puros usando repositórios em memória.
  - **Arquivos:** `packages/domain/**/*.spec.ts`, `packages/application/**/*.spec.ts`.
  - **[DoD]:** Relatório de cobertura do Vitest atinge $\ge 80\%$ nas duas camadas.

- [ ] **T07.02 — Testes de Integração de Repositórios Drizzle**
  - **Contexto:** Validar integridade de constraints de banco, exclusões em cascata e transações com instância PostgreSQL de teste.
  - **Arquivos:** `packages/infrastructure/**/*.spec.ts`.
  - **[DoD]:** Testes de repositório passam sem erros de migração ou chave estrangeira.

- [ ] **T07.03 — Testes End-to-End com Playwright (7 Caminhos Críticos)**
  - **Contexto:** Automatizar testes E2E cobrindo: Leitura de Home, Navegação no Blog com filtros, Leitura de artigo, Envio de contato, Login no CMS, Criação/Publicação de post e Exclusão via Lixeira.
  - **Arquivos:** `apps/web/e2e/*.spec.ts`.
  - **[DoD]:** Suite Playwright executada com 100% de sucesso.

- [ ] **T07.04 — Auditoria Automatizada de Acessibilidade (`axe-core`)**
  - **Contexto:** Executar auditoria de acessibilidade automatizada em todas as páginas públicas nos modos Light e Dark.
  - **Arquivos:** `apps/web/e2e/a11y.spec.ts`.
  - **[DoD]:** Zero violações críticas ou sérias de WCAG 2.1 AA em ambos os temas.

- [ ] **T07.05 — Testes de Contrato da API**
  - **Contexto:** Verificar que os endpoints REST Fastify emitem payloads em conformidade estrita com o contrato `openapi.yaml`.
  - **Arquivos:** `packages/http/**/*.contract.spec.ts`.
  - **[DoD]:** Validador de schema OpenAPI confirma compatibilidade de 100% dos payloads.

- [ ] **T07.06 — Validação e Testes da Fase 7 via TestSprite MCP**
  - **Contexto:** Acionar o MCP TestSprite para consolidar a suíte global de testes, correlacionando os resultados dos testes unitários ($\ge 80\%$), integração Drizzle, Playwright E2E (7 fluxos críticos), acessibilidade `axe-core` e conformidade de contrato OpenAPI.
  - **Ferramentas:** TestSprite MCP (`testsprite_generate_frontend_test_plan`, `testsprite_generate_backend_test_plan`, `testsprite_generate_code_and_execute`).
  - **[DoD]:** Relatório final de testes do TestSprite aprovado com 100% dos testes e critérios de qualidade atendidos.

---

## Fase 8: Publicação & Go-Live Final

- [ ] **T08.01 — Verificação de DNS, Registros de E-mail e SSL**
  - **Contexto:** Configurar e testar registros SPF, DKIM e DMARC no Resend para garantia de entregabilidade dos alertas de contato.
  - **[DoD]:** E-mails de notificação chegam à caixa postal sem cair em spam.

- [ ] **T08.02 — Configuração de Metas Customizadas no Plausible Analytics**
  - **Contexto:** Instrumentar eventos customizados para rastreio da métrica primária (taxa de aprofundamento qualificado de 30% em Projetos / Como foi construído).
  - **Arquivos:** `apps/web/lib/analytics.ts`.
  - **[DoD]:** Eventos de visualização qualificada registrados no dashboard do Plausible.

- [ ] **T08.03 — Vercel Cron de Manutenção Diária**
  - **Contexto:** Configurar rota de cron job protegida para expurgo automático de mensagens de contato com mais de 24 meses (`P-003`).
  - **Arquivos:** `apps/web/app/api/cron/maintenance/route.ts`, `apps/web/vercel.json`.
  - **[DoD]:** Cron executa diariamente e remove registros com `created_at < now() - interval '24 months'`.

- [ ] **T08.04 — Checklist de Go-Live e Auditoria Final**
  - **Contexto:** Validar checklist de prontidão (Core Web Vitals, HTTPS, chaves de produção, ausência de logs sensíveis).
  - **[DoD]:** Todos os itens do relatório de prontidão aprovados.

- [ ] **T08.05 — Validação e Testes da Fase 8 via TestSprite MCP**
  - **Contexto:** Acionar o MCP TestSprite para homologar o ambiente pós-deploy: verificação de rotas em produção (`davidev.net.br`), execução do cron de manutenção, checagem de métricas e ausência de regressões em produção.
  - **Ferramentas:** TestSprite MCP (`testsprite_generate_frontend_test_plan`, `testsprite_generate_backend_test_plan`, `testsprite_generate_code_and_execute`).
  - **[DoD]:** Testes de produção executados pelo TestSprite validando estabilidade total do sistema no ar.


---

## Fase 9: Case Study Auditável

- [ ] **T09.01 — Página "Como foi construído" (`US-01`, Story 7)**
  - **Contexto:** Escrever e publicar o case study do desenvolvimento assistido por IA e Spec-Driven Development, linkando artefatos, diagramas e lições aprendidas.
  - **Arquivos:** `apps/web/app/[locale]/como-foi-construido/page.tsx`.
  - **[DoD]:** Estudo de caso publicado e legível nos dois idiomas, sem vazamento de chaves ou segredos.

- [ ] **T09.02 — Linkagem de Evidências e Documentação Interativa da API**
  - **Contexto:** Integrar links da documentação `/api/docs` e repositório público na página de engenharia.
  - **[DoD]:** Links funcionais acessíveis a avaliadores técnicos.

- [ ] **T09.03 — Validação e Testes da Fase 9 via TestSprite MCP**
  - **Contexto:** Acionar o MCP TestSprite para verificar a integridade da página de estudo de caso "Como foi construído", validação de links para a documentação técnica `/api/docs` e ausência de credenciais ou dados sensíveis em evidências públicas.
  - **Ferramentas:** TestSprite MCP (`testsprite_generate_frontend_test_plan`, `testsprite_generate_code_and_execute`).
  - **[DoD]:** Validação do TestSprite concluída com links íntegros e página de engenharia totalmente acessível e conforme.

