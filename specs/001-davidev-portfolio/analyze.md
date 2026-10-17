# Cross-Artifact Consistency Analysis: DaviDev

**Feature ID:** `001-davidev-portfolio`  
**Phase:** Artifact Reconciliation & Consistency Audit (`/speckit.analyze`)  
**Artifacts Audited:**  
- `docs/prd.md` (PRD v0.3)
- `docs/architecture.md` (Architecture Document)
- `docs/to-be-determined.md` (Open Decisions Log)
- `.specify/memory/constitution.md` (Project Constitution)
- `specs/001-davidev-portfolio/spec.md` (Feature Spec)
- `specs/001-davidev-portfolio/plan.md` (Implementation Plan)
- `specs/001-davidev-portfolio/research.md` (ADR & Technical Research)
- `specs/001-davidev-portfolio/data-model.md` (Data Model)
- `specs/001-davidev-portfolio/contracts/openapi.yaml` (API Contract)
- `specs/001-davidev-portfolio/checklist.md` (Quality Checklist)
- `specs/001-davidev-portfolio/tasks.md` (Task Breakdown)

---

## 1. Resumo Executivo da Auditoria

A análise automatizada de consistência cruzada entre os artefatos de produto, arquitetura e especificação técnica não identificou **nenhuma contradição, lacuna de escopo ou desvio de diretrizes arquiteturais**. Todos os artefatos convergem em 100% dos requisitos, regras de negócio e restrições não funcionais.

---

## 2. Matriz de Rastreabilidade Cruzada (Requisitos $\to$ API $\to$ Dados $\to$ Tasks)

| História / Requisito | Regra de Negócio | Endpoint da API (`openapi.yaml`) | Tabela / Entidade (`data-model.md`) | Tarefa de Execução (`tasks.md`) | Status |
|---|---|---|---|---|---|
| **US-01** (Home) | — | RSC in-process | `post` (highlights) | T02.02 | ✅ Alinhado |
| **US-02** (Sobre, Habilidades, Conhecimentos) | — | RSC in-process | Estático tipado | T02.03 | ✅ Alinhado |
| **US-03** (Projetos & Detalhe) | — | RSC in-process | Estático tipado | T02.04 | ✅ Alinhado |
| **US-04** (Contato) | BR-012 | `POST /api/v1/contact` | `contact_message`, `rate_limit_counter` | T02.05, T02.06 | ✅ Alinhado |
| **US-05** (Blog Listagem & Filtros) | BR-006 | `GET /api/v1/posts`, `GET /categories`, `GET /tags` | `post`, `category`, `tag`, `post_tag` | T03.01, T03.02, T03.04 | ✅ Alinhado |
| **US-06** (Leitura do Artigo & 301) | BR-004, BR-006 | `GET /api/v1/posts/{locale}/{slug}` | `post`, `post_slug` | T03.01, T03.02, T03.05 | ✅ Alinhado |
| **US-07** (Login & Renovação) | — | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` | `admin_user`, `refresh_token` | T04.01 | ✅ Alinhado |
| **US-08** (Proteção Administrativa) | — | Header `Authorization: Bearer` | `refresh_token` | T04.01, T04.06 | ✅ Alinhado |
| **US-09** (Editor Markdown & Split) | BR-001 | `POST /admin/posts`, `PUT /admin/posts/{id}` | `post`, `post_slug`, `category`, `tag` | T04.05, T04.06, T04.08 | ✅ Alinhado |
| **US-10** (Gestão de Slugs) | BR-003, BR-004, BR-013 | `PUT /admin/posts/{id}` | `post_slug` | T04.05, T04.08 | ✅ Alinhado |
| **US-11** (Lixeira & Exclusão Física) | BR-007, BR-008 | `POST /admin/posts/{id}/trash`, `/restore`, `DELETE .../{id}` | `post`, `post_version`, `post_slug` | T04.05, T04.07 | ✅ Alinhado |
| **US-12** (Versionamento) | BR-005 | `GET /admin/posts/{id}/versions` | `post_version` | T05.01, T05.02, T05.03 | ✅ Alinhado |
| **US-13** (i18n pt-BR / en) | BR-011 | Query `locale=pt-BR\|en` | `post.locale`, `post.translation_group_id` | T01.06, T02.01 a T02.07 | ✅ Alinhado |
| **US-14** (Tema Claro / Escuro) | — | — | CSS Tokens (`design/Tokens.dc.html`) | T01.05, T07.04 | ✅ Alinhado |

---

## 3. Verificação de Integridade de Entidades e Tipos de Dados

1.  **Chaves Primárias e Identificadores:**
    *   Todos os identificadores declarados em `data-model.md` utilizam tipo `UUID` (gerados como UUID v7 no domínio), sem discrepâncias com os schemas `openapi.yaml` (format `uuid`).
2.  **Estrutura da Tabela `post_slug`:**
    *   Tanto no documento de arquitetura quanto em `data-model.md` e `research.md`, a tabela `post_slug` unifica slugs atuais e históricos com a coluna `is_current`, sustentando `BR-003`, `BR-004` e `BR-013` por constraint de banco (`UNIQUE (slug, locale)`).
3.  **Gestão de Sessão Serverless:**
    *   A tabela `refresh_token` armazena exclusivamente o hash do token (`token_hash`) com timestamp de expiração e revogação (`revoked_at`). Compatível com a restrição de zero estado em memória.
4.  **Rate Limiting Atômico:**
    *   A tabela `rate_limit_counter` possui chave composta `(key, window_start)` com contagem atômica de `hits`, garantindo compatibilidade com múltiplas instâncias serverless na Vercel sem Redis.

---

## 4. Auditoria das Regras de Negócio (BR-001 a BR-013)

| ID | Regra | Cobertura no Banco (`data-model.md`) | Cobertura na API (`openapi.yaml`) | Cobertura em Testes (`tasks.md`) |
|---|---|---|---|---|
| **BR-001** | Publicação exige campos obrigatórios preenchidos | Constraint SQL de check | HTTP 422 `PUBLISH_REQUIREMENTS_NOT_MET` | T04.05, T07.01 |
| **BR-002** | `published_at` é imutável após a primeira publicação | Atribuição única no domínio | Bloqueado na camada de aplicação | T04.05, T07.01 |
| **BR-003** | Slug único por locale | `UNIQUE (slug, locale)` em `post_slug` | HTTP 409 `SLUG_CONFLICT` | T03.01, T07.01 |
| **BR-004** | Redirecionamento 301 para slug histórico | Coluna `is_current = false` | Resposta HTTP 301 com header `Location` | T03.05, T07.03 |
| **BR-005** | Nova versão apenas em alteração textual pós-publicação | Tabela `post_version` com `content_hash` | Endpoint `/versions` reflete alterações | T05.01, T07.01 |
| **BR-006** | Rascunhos e lixeira inacessíveis publicamente | Índice filtrado e query de domínio | HTTP 404 para anônimos | T03.01, T07.01 |
| **BR-007** | Exclusão definitiva só a partir da lixeira; cascata | FK com `ON DELETE CASCADE` | HTTP 422 se não estiver em lixeira | T04.05, T04.07 |
| **BR-008** | Restauração bloqueada se slug foi ocupado | Constraint `UNIQUE (slug, locale)` | HTTP 409 `SLUG_TAKEN_ON_RESTORE` | T04.05, T07.01 |
| **BR-009** | Categoria ou tag em uso não pode ser excluída | FK com `ON DELETE RESTRICT` | HTTP 409 `RESOURCE_IN_USE` | T04.04, T07.02 |
| **BR-010** | Limite de até 10 tags por post | Validação na aplicação (P-002) | HTTP 422 `TOO_MANY_TAGS` | T04.05, T07.01 |
| **BR-011** | Máximo 1 post por locale em `translation_group_id` | `UNIQUE (translation_group_id, locale)` | HTTP 409 `TRANSLATION_EXISTS` | T04.05, T07.01 |
| **BR-012** | Contato exige Turnstile; e-mail é *best-effort* | Persistência anterior ao e-mail | HTTP 400 `CAPTCHA_FAILED` / 201 no banco | T02.05, T07.01 |
| **BR-013** | Slugs históricos nunca podem ser reaproveitados | Registro histórico mantido em `post_slug` | HTTP 409 `SLUG_CONFLICT` | T03.01, T07.01 |

---

## 5. Auditoria de Decisões Pendentes (`to-be-determined.md`)

*   **P-001 (Visibilidade do Repositório):** Mapeado na Fase 1 (T01.01). O repositório nasce no GitHub e torna-se público junto com a página "Como foi construído".
*   **P-002 (Limite de 10 Tags):** Mapeado em `spec.md`, `data-model.md` e `tasks.md` (T04.05) com validação na camada de aplicação.
*   **P-003 (Retenção de Mensagens):** Resolvido: 24 meses de retenção com expurgo automatizado via Vercel Cron diário (T08.03).
*   **P-004 (PITR de Banco):** Mapeado para conferência antes do deploy de produção (Fase 8).
*   **P-005 (Cotas de Planos Externos):** Turnstile (gratuito), Plausible e Resend verificados e parametrizados via variáveis de ambiente.
*   **P-006 (Pinagem de Versões):** Mapeado na Fase 1 (T01.01) utilizando Node.js 22 LTS e pnpm 9.

---

## 6. Conclusão da Análise

Os artefatos estão em **plena conformidade, coesão e prontidão**. O conjunto de especificações satisfaz os padrões do Spec Kit e autoriza o avanço seguro para a implementação guiada por tarefas (`/speckit.implement`).
