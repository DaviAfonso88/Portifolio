# DaviDev — Constituição e Princípios Arquiteturais do Projeto

> **Status:** Ativo / Não-negociável  
> **Versão:** 1.0.0  
> **Última Atualização:** 2026-10-13  
> **Origem:** Derivado do `docs/architecture.md` e `docs/prd.md`

Este documento constitui a **lei máxima de engenharia** do projeto DaviDev (`davidev.net.br`). Toda especificação (`spec.md`), plano técnico (`plan.md`), contrato de API, modelo de dados e tarefa (`tasks.md`) gerados no fluxo Spec Kit **devem estrita e obrigatoriamente estar em conformidade** com os princípios aqui descritos. Nenhuma implementação poderá violar estas cláusulas.

---

## 1. Princípios Fundamentais do Projeto

### Cláusula 1.1 — O Produto é a Evidência
O DaviDev não é um site de template ou cartão de visita estático; é um produto full-stack com domínio próprio construído com disciplina de engenharia de software sênior. O processo (PRD, Arquitetura Hexagonal, Spec-Driven Development, tipagem rigorosa, cobertura de testes e testes de acessibilidade) e o artefato em si são públicos e auditáveis.

### Cláusula 1.2 — Simplicidade de Operação e Custo
- **Single-tenant / Administrador Único:** Não há RBAC, múltiplos usuários, níveis de permissão ou cerimônias de SaaS multi-tenant. Toda complexidade de multi-usuário é rejeitada por definição.
- **Hospedagem em Provedor Único:** Frontend Next.js e Backend Fastify residem no mesmo projeto e domínio na Vercel (Fastify executado como função serverless). Origem única resolve complexidades desnecessárias de CORS e cookies de sessão.
- **Persistência Serverless:** PostgreSQL gerenciado no Neon consumido exclusivamente via driver serverless/HTTP (`@neondatabase/serverless`), imune ao esgotamento de pool TCP em ambiente serverless.
- **Dispensa de Cookies de Rastreamento:** Uso exclusivo de Plausible Analytics (cookieless) e Cloudflare Turnstile. O site não exibe banner de cookies LGPD/GDPR intrusivo.

---

## 2. Padrões de Arquitetura e Monorepo

### Cláusula 2.1 — Monolito Modular sob Arquitetura Hexagonal
O repositório é gerenciado como monorepo `pnpm workspaces` com divisão estrita de responsabilidades:
- `packages/domain`: Entidades, Value Objects, Domain Events e regras de negócio puras em TypeScript. **Zero dependências externas**, zero menções a Fastify, Drizzle, React ou Next.js.
- `packages/application`: Casos de uso (Use Cases) e Portas (interfaces de repositórios, serviços externos e eventos). Depende apenas de `packages/domain`.
- `packages/infrastructure`: Adaptadores secundários concretos (Drizzle ORM com Neon HTTP, Cloudflare Turnstile, Resend, Argon2/Bcrypt, store de rate limiting).
- `packages/http`: Adaptador primário HTTP com Fastify, rotas REST, schemas de validação Zod e geração de documentação OpenAPI 3.0 via `@fastify/swagger`.
- `packages/api-client`: Cliente TypeScript tipado gerado automaticamente pelo Orval a partir do schema OpenAPI. **Edição manual é estritamente proibida**.
- `apps/web`: Aplicação Next.js (App Router), contendo a área pública bilíngue (`[locale]`), painel administrativo (`admin`), rota catch-all para a função Fastify (`api/[...path]`) e o `composition-root.ts`.

### Cláusula 2.2 — Regras de Dependência (Enforced by `dependency-cruiser`)
Violação de qualquer uma das regras abaixo quebrará o pipeline de CI:
- **DEP-1:** `domain` não importa nenhum outro pacote do monorepo nem qualquer biblioteca de framework.
- **DEP-2:** `application` importa exclusivamente `domain`.
- **DEP-3:** `infrastructure` e `http` podem importar `application` e `domain`.
- **DEP-4:** `apps/web` nunca importa `infrastructure` diretamente — apenas via `composition-root.ts`.
- **DEP-5:** Nenhum pacote importa `apps/web`.
- **DEP-6:** Nenhum adapter acessa banco de dados ou repositório sem passar por um caso de uso.
- **DEP-7:** `packages/api-client` é 100% gerado por `orval`; alterações manuais reprovam em verificação de git diff.

### Cláusula 2.3 — Dois Driving Adapters
O núcleo de casos de uso da aplicação é exposto através de dois adaptadores de entrada:
1. **In-process (React Server Components):** A área pública e o blog realizam chamadas diretamente ao caso de uso em memória no servidor Next.js durante a compilação/revalidação ISR, sem salto de rede HTTP e imune a cold starts.
2. **HTTP/REST (Fastify):** O painel administrativo interativo e a submissão de mensagens de contato passam pelas rotas REST Fastify com validação de token JWT e proteção de rate limit.

---

## 3. Segurança e Gestão de Estado

### Cláusula 3.1 — Autenticação e Sessão
- Autenticação por par de tokens JWT:
  - **Access Token:** Validade de 15 minutos, armazenado exclusivamente na memória volátil da aplicação cliente (nunca em `localStorage` ou `sessionStorage`).
  - **Refresh Token:** Validade de 7 dias, transmitido e persistido como cookie `httpOnly`, `Secure`, `SameSite=Strict`, `Path=/api/v1/auth`.
- **Rotação de Refresh Token:** Todo refresh emite novo Refresh Token e revoga o anterior no banco de dados (`revoked_at`).
- **Logout Seguro:** O logout invalida explicitamente o hash do refresh token na tabela `refresh_token` do banco e limpa o cookie do cliente.

### Cláusula 3.2 — Ausência de Estado em Memória (Serverless Compliant)
Por rodar em ambiente serverless sem persistência de processo de longa duração:
- É expressamente proibido qualquer mecanismo de rate limiting, contagem ou blacklist de tokens mantido em memória RAM do processo Node.
- Rate limiting utiliza tabela atômica no PostgreSQL (`rate_limit_counter`) com algoritmo de janela fixa e hash de IP (nenhum IP em texto plano).
- Chaves secretas e variáveis de ambiente nunca vazam para o cliente público.

---

## 4. Banco de Dados e Integridade

### Cláusula 4.1 — Integridade Guiada por Banco
Regras de unicidade e integridade devem ser sustentadas pelo banco relacional PostgreSQL, e não apenas por código de aplicação:
- Todos os identificadores de entidades são **UUID v7** gerados no domínio.
- Slugs atuais e históricos residem na mesma tabela `post_slug` com flag `is_current`, sustentando unicidade por locale (`UNIQUE (slug, locale)`) e impedindo reuso de slugs históricos (BR-003, BR-013).
- Exclusão é realizada em duas etapas: estado reversível `status = lixeira` seguido de exclusão física definitiva com cascata em tabelas dependentes. Soft-delete persistente (`deleted_at`) é terminantemente proibido.
- Migrações são estritamente **forward-only** utilizando Drizzle Kit.

---

## 5. Qualidade, Acessibilidade e i18n

### Cláusula 5.1 — Metas de Qualidade e Testabilidade
- Cobertura de testes unitários e de casos de uso $\ge 80\%$, sem dependência de banco de dados ou servidor HTTP em execução.
- Testes E2E cobrindo os 7 caminhos críticos do sistema.
- Core Web Vitals com LCP $< 2,5\text{s}$ no blog público através de ISR.

### Cláusula 5.2 — Acessibilidade e Tema
- Conformidade estrita com WCAG 2.1 AA em **ambos os temas (claro e escuro)**, validada no CI via `axe-core`.
- Zero flash de tema incorreto no carregamento (FOUC prevent script).

### Cláusula 5.3 — Internacionalização (i18n)
- Toda a área pública possui suporte nativo a `pt-BR` (padrão) e `en`, com rotas prefixadas, metadados de SEO, OpenGraph e `hreflang` dedicados.
- Painel administrativo mantido exclusivamente em `pt-BR`.
- Artigos de blog possuem locale próprio e vinculação por `translation_group_id`. Fallback explícito quando um artigo existir em apenas um dos idiomas.

---

## 6. Portas de Verificação no CI (10 Gates Obrigatórios)

Nenhum pull request ou deploy é promovido se falhar em qualquer um dos 10 gates:
1. `pnpm lint` (ESLint com import-sort e Prettier)
2. `pnpm typecheck` (TypeScript rigoroso em todos os workspaces)
3. `pnpm arch:check` (dependency-cruiser validando DEP-1 a DEP-7)
4. `pnpm api:contract:check` (verificação de diff do `api-client` gerado)
5. `pnpm test:unit` (testes de domínio e casos de uso com coverage $\ge 80\%$)
6. `pnpm test:integration` (testes de repositório e adapters)
7. `pnpm test:e2e` (Playwright nos fluxos críticos)
8. `pnpm a11y:check` (auditoria axe-core em light e dark mode)
9. `pnpm build` (build do Next.js e compilação Fastify)
10. `pnpm audit` (auditoria de vulnerabilidades de dependências)
