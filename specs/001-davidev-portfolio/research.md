# Technical Research & Architectural Decisions: DaviDev

**Feature ID:** `001-davidev-portfolio`  
**Status:** Consolidated  
**Context:** `docs/architecture.md`, `specs/001-davidev-portfolio/plan.md`  
**Constitution:** `.specify/memory/constitution.md`  

---

## 1. Resumo Executivo das Decisões Arquiteturais (ADRs)

Este documento consolida a pesquisa técnica, as alternativas avaliadas e os trade-offs assumidos nas decisões de arquitetura do DaviDev.

---

### ADR-001: Hospedagem Unificada na Vercel (Next.js + Fastify Serverless)

*   **Contexto:** O projeto anterior previa backend hospedado em contêiner de longa duração (Render) e frontend na Vercel. Isso introduzia dois provedores, custos potenciais adicionais e latência de rede entre domínios distintos (`api.davidev.net.br` e `davidev.net.br`), além de complexidade de CORS com cookies de autenticação (`SameSite=None`).
*   **Decisão:** Executar Next.js e o backend Fastify no **mesmo projeto e domínio na Vercel**, expondo a API Fastify através de uma rota catch-all (`apps/web/app/api/[...path]/route.ts`).
*   **Alternativas Avaliadas:**
    1.  *Render (Serviço Web Node.js):* Descartado por hibernar no plano gratuito (cold start de até 50 segundos) e introduzir separação de origens.
    2.  *Next.js Route Handlers puros sem Fastify:* Descartado para manter a documentação Swagger OpenAPI viva via `@fastify/swagger` e geração de client Orval, que funcionam como evidência técnica declarada no PRD.
*   **Consequências:**
    *   *Positivas:* Origem única simplifica cookies `SameSite=Strict`, elimina CORS para tráfego interno, unifica variáveis de ambiente e reduz custo a zero.
    *   *Desafios Assumidos:* Proibição absoluta de estado em memória no processo Node.js (nenhum cache ou contador em memória).

---

### ADR-002: Arquitetura Hexagonal (Ports & Adapters)

*   **Contexto:** O objetivo primário do portfólio é demonstrar maturidade de engenharia de software para quem avalia tecnicamente. A testabilidade das regras de negócio sem necessidade de banco de dados ou servidor HTTP é requisito obrigatório.
*   **Decisão:** Adotar Arquitetura Hexagonal com separação estrita de camadas em pacotes isolados:
    *   `packages/domain`: Modelo de domínio puro em TypeScript sem dependências externas.
    *   `packages/application`: Casos de uso e portas (interfaces).
    *   `packages/infrastructure`: Implementações concretas de portas (adaptadores de saída).
    *   `packages/http` e `apps/web`: Adaptadores de entrada.
*   **Alternativas Avaliadas:**
    1.  *Layered Architecture tradicional:* Descartada pois permite acoplamento direto entre serviços e banco de dados.
    2.  *Vertical Slice Architecture:* Descartada para este escopo pois fragmentaria o modelo de domínio que o projeto pretende exibir como unificado e coeso.
*   **Consequências:** Introduz maior quantidade de arquivos e indireção (interfaces, DTOs, mappers), plenamente justificado pelo ganho pedagógico e de evidência profissional.

---

### ADR-003: Dois Driving Adapters (In-Process RSC + Fastify REST)

*   **Contexto:** A área pública precisa de renderização ultrarrápida (Core Web Vitals LCP $< 2.5\text{s}$), enquanto o painel administrativo requer APIs interativas e autenticadas.
*   **Decisão:** Utilizar dois adaptadores primários conectados ao mesmo conjunto de casos de uso:
    1.  *In-process Adapter:* React Server Components invocam diretamente casos de uso como `ListPublishedPostsUseCase` durante a renderização no servidor.
    2.  *HTTP Adapter:* Rotas Fastify expõem `/api/v1/admin/*` e `/api/v1/contact` para o cliente web interativo.
*   **Trade-off Neutralizado:** O risco de divergência (ex: RSC esquecer de filtrar rascunhos) foi eliminado ao situar a regra `BR-006` dentro do caso de uso de domínio, e nunca no adapter.

---

### ADR-004: Conexão PostgreSQL Serverless via Neon HTTP Driver

*   **Contexto:** Funções serverless na Vercel escalam horizontalmente sob demanda. O uso de pools de conexão TCP tradicionais (`pg` pool ou `postgres.js`) esgota rapidamente o limite de conexões simultâneas do PostgreSQL em planos gratuitos, resultando em erros `500 connection limit exceeded`.
*   **Decisão:** Adotar o driver HTTP do Neon (`@neondatabase/serverless` combinado com `drizzle-orm/neon-http`). Cada query é enviada como requisição HTTP stateless segura via TLS.
*   **Alternativas Avaliadas:**
    1.  *TCP Pooler do Neon (PgBouncer):* Funcional, porém mantém conexão aberta durante o ciclo da função e exige gestão de timeouts.
    2.  *Supabase / Prisma Data Proxy:* Descartado para evitar intermediários e custos extras.
*   **Consequências:** Zero risco de esgotamento de conexões TCP em serverless; latência por query ligeiramente superior ao pool quente (~10-20ms a mais), compensada amplamente pelo cache ISR do Next.js na leitura pública.

---

### ADR-005: Rate Limiting com PostgreSQL Atômico em vez de Redis

*   **Contexto:** Em deploy serverless, contadores em memória RAM não funcionam entre requisições concorrentes. A abordagem padrão de mercado seria contratar um provedor Redis gerenciado (ex: Upstash).
*   **Decisão:** Armazenar o rate limiting em uma tabela dedicada no próprio PostgreSQL (`rate_limit_counter`) com algoritmo de janela fixa e upsert atômico:
    ```sql
    INSERT INTO rate_limit_counter (key, window_start, hits)
    VALUES ($1, $2, 1)
    ON CONFLICT (key, window_start)
    DO UPDATE SET hits = rate_limit_counter.hits + 1;
    ```
*   **Rationale:** O volume de tráfego de um portfólio profissional (mesmo sob picos moderados) não justifica a introdução e o custo de um terceiro provedor de infraestrutura (Redis).
*   **Privacidade LGPD:** A chave armazena o hash SHA-256 do IP do cliente (`login:<hash>` ou `contact:<hash>`), nunca o IP em texto puro.

---

### ADR-006: Tabela Unificada `post_slug` para Redirecionamentos 301

*   **Contexto:** O PRD exige que a alteração de slug de um post publicado mantenha o endereço antigo ativo via redirecionamento 301 (`BR-004`) e proíba qualquer post futuro de reutilizar um slug histórico (`BR-013`).
*   **Decisão:** Todos os slugs — o atual e todos os históricos — residem na mesma tabela `post_slug`, diferenciados pela coluna booleana `is_current`:
    *   `UNIQUE (slug, locale)` garante atomicamente as regras BR-003 e BR-013 direto no banco.
    *   Ao alterar um slug, o registro antigo recebe `is_current = false` e `replaced_at = now()`.
    *   A busca pública por `/blog/:slug` faz join com `post_slug`. Se `is_current = false`, a aplicação resolve o post e responde 301 para o slug atual daquele post.

---

### ADR-007: Pipeline de Renderização e Sanitização Markdown

*   **Contexto:** O conteúdo dos artigos é escrito em Markdown com blocos de código e tabelas. É imperativo prevenir ataques de Cross-Site Scripting (XSS) e garantir renderização idêntica entre o site público e o editor administrativo.
*   **Decisão:** Construir o pipeline com o ecossistema `unified`:
    *   `remark-parse` $\to$ `remark-gfm` (tabelas, listas de tarefas) $\to$ `remark-rehype` $\to$ `rehype-sanitize` (com schema rigoroso) $\to$ `rehype-highlight` (ou `shiki`) $\to$ `rehype-react`.
    *   O componente React `<ArticleRenderer markdown={content} />` é encapsulado e compartilhado identicamente entre `apps/web/app/[locale]/blog/[slug]/page.tsx` e `apps/web/app/admin/editor/components/preview.tsx`.

---

### ADR-008: Design System Editorial e Acessibilidade WCAG AA

*   **Contexto:** A identidade visual deve comunicar sobriedade técnica, distanciando-se tanto de templates genéricos quanto de designs poluídos estilo terminal hacker.
*   **Decisão:** Implementação dos tokens baseados em `design/Tokens.dc.html`:
    *   *Tipografia:* Display Serif (`Instrument Serif`) para títulos de alta hierarquia, Grotesque Sans (`Archivo`) para corpo de texto editorial longo e Monoespaçada (`JetBrains Mono`) para código, metadados e tags.
    *   *Acento Visual:* Terracota Técnico (`#A6482C` em light / `#E06D53` em dark).
    *   *Bordas:* Fios técnicos de 1px com raio sutil (2px-4px) em substituição a sombras difusas.
    *   *Contraste:* Todos os pares de cor atendem a razão de contraste mínima de 4.5:1 (WCAG AA) em ambos os temas, validado via `axe-core`.
