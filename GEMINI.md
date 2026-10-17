# DaviDev — Regra de Projeto: Orquestração Obrigatória de Skills

> **Status:** Ativo / Mandatório  
> **Escopo:** Todo o repositório `davidev` (`C:\Users\davia\OneDrive\Documentos\Developement\Projects\portifolio`)  
> **Constituição Vinculada:** `.specify/memory/constitution.md`  

---

## 1. Princípio Fundamental de Execução

Ao desenvolver, refatorar, documentar ou auditar qualquer parte do projeto DaviDev, o agente de IA **DEVE OBRIGATORIAMENTE** consultar e seguir as diretrizes das **Skills Especializadas instaladas**. 

Nenhum código, componente, rota ou documentação deve ser gerado com base em suposições genéricas ("AI slop") quando houver uma skill dedicada para o domínio da tarefa.

---

## 2. Matriz de Ativação de Skills por Camada e Domínio

| Camada / Escopo do Projeto | Skills Obrigatórias | Gatilho / Momento de Aplicação | Regras e Padrões Essenciais a Aplicar |
| :--- | :--- | :--- | :--- |
| **Domínio & Aplicação**<br>`packages/domain`<br>`packages/application` | `typescript-advanced-types` | Criação de entidades, Value Objects, Domain Events, Enums, Use Cases e contratos de Portas. | • **Zero dependências externas** em `domain` (`DEP-1`).<br>• Tipagem nominal/branded types para IDs (UUIDv7), Slugs e Emails.<br>• Generics com constraints estritas nos casos de uso (`UseCase<TInput, TOutput>`).<br>• Discriminated unions para Result/Either e tratamento de erros.<br>• Proibição terminante de `any`, `unknown` não refinado ou `@ts-ignore`. |
| **Next.js & Serverless Host**<br>`apps/web/app`<br>`apps/web/lib`<br>Roteamento & APIs | `next-best-practices`<br>`vercel-react-best-practices` | Páginas bilíngues `[locale]`, Server Components (RSC), Client Components, layouts, metadata, proxy/middleware e rotas catch-all Fastify. | • **Next.js 15+ Async APIs**: Sempre usar `await params`, `await searchParams`, `await cookies()`, `await headers()`.<br>• **RSC Boundaries**: Manter Server Components por padrão; limitar `'use client'` às folhas da árvore interativa.<br>• **Eliminação de Waterfalls**: Usar `Promise.all()` em operações independentes; streaming com `Suspense`.<br>• **Otimização de Bundles**: Proibidos barrel files gigantes; importar módulos pontuais; dynamic imports para componentes pesados.<br>• **Meta Core Web Vitals**: LCP < 2.5s garantido via ISR in-process (sem saltos de rede HTTP para leituras públicas). |
| **Design de Interface & UI**<br>`apps/web/components`<br>`design/` | `frontend-design`<br>`shadcn`<br>`vercel-composition-patterns` | Criação e estilização de páginas públicas, blog, painel admin e componentes visuais. | • **Identidade Editorial Autêntica (`frontend-design`)**: Seguir estritamente o design system e tokens de `design/Tokens.dc.html` e `design/davidev-sistema-de-design.html`. Evitar layouts genéricos, fontes clichê ou gradientes artificiais.<br>• **shadcn/ui via pnpm (`shadcn`)**: Executar comandos via `pnpm dlx shadcn@latest`. Usar cores semânticas (`bg-background`, `text-muted-foreground`), nunca cores estáticas. Proibido `space-x-*`/`space-y-*` (usar `flex` com `gap-*`). Usar `size-*` para larguras/alturas iguais.<br>• **Padrões de Composição (`vercel-composition-patterns`)**: Compor interfaces complexas usando Compound Components (ex.: Admin Editor, filtros, cards); proibir proliferação de props booleanas (`isCompact`, `isCard`, etc.); aplicar padrões do React 19. |
| **Acessibilidade & UX**<br>Todos os componentes e páginas públicas/admin | `web-design-guidelines` | Implementação e revisão de qualquer interface gráfica, formulários, modais e transições de tema. | • **WCAG 2.1 AA Estrito**: Garantir contraste adequado em **ambos os temas (claro e escuro)**.<br>• **Prevenção de FOUC**: Script de prevenção de flash de tema sem hydration mismatch.<br>• **Semântica & A11y**: Diálogos e Drawers exigem `DialogTitle` (visível ou `sr-only`). Navegação completa por teclado, indicadores visuais de foco e validação de formulários com `aria-invalid` e `data-invalid`. |
| **Documentação & Engenharia**<br>`README.md`<br>`docs/`<br>`specs/` | `readme-generator` | Criação ou atualização do `README.md` raiz, READMEs de cada pacote e relatórios arquiteturais. | • **Princípio "O Produto é a Evidência"**: O README deve atuar como tutorial pedagógico sênior explicando a arquitetura Hexagonal, decisões técnicas, trade-offs e passo a passo de reprodução.<br>• Incluir diagramas Mermaid de fluxo e mapeamento de dependências. |
| **Extensões & Novas Ferramentas** | `find-skills`<br>`agy-customizations` | Necessidade de novas habilidades, ferramentas especializadas ou integração com MCP. | • Consultar o catálogo de skills antes de inventar scripts manuais para fluxos conhecidos. |
| **Dependências & Bibliotecas**<br>Todos os pacotes (`package.json`) | `context7` (MCP) | Instalação, atualização ou consulta técnica de qualquer biblioteca/dependência externa. | • Consultar `resolve-library-id` e `query-docs` antes de qualquer `pnpm add`.<br>• Garantir versões atuais, estáveis e compatíveis com Next.js 15+ / React 19.<br>• Prevenir conflitos de versão entre workspaces do monorepo.<br>• Respeitar `DEP-1` (zero dependências em `packages/domain`). |
| **Garantia de Qualidade & Fases**<br>`specs/**/tasks.md`<br>`task.md` | `TestSprite` (MCP) | Finalização de cada fase de desenvolvimento nas tasks. | • Acionar geração e execução de planos de teste (Frontend/Backend) via TestSprite.<br>• Nenhuma fase é marcada como concluída sem validação aprovada no TestSprite.<br>• Corrigir imediatamente regressões antes de avançar para a fase seguinte. |

---

## 3. Diretriz Mandatória de Fidelidade aos Arquivos de Design (`design/`)

Ao desenvolver, refatorar ou estilizar qualquer interface do usuário no frontend (`apps/web`), o agente **DEVE OBRIGATORIAMENTE** inspecionar os arquivos de design localizados na pasta `design/` antes de escrever o código.

- **Fonte da Verdade Visual:** A pasta `design/` contém as especificações completas de alta fidelidade e tokens concebidos para o projeto.
- **Tokens & Sistema:** Seguir `design/Tokens.dc.html` e `design/davidev-sistema-de-design.html`. Proibido o uso de cores hexadecimais soltas ou arbitrárias (utilizar sempre variáveis semânticas do Tailwind).
- **Mapeamento de Páginas & Telas:**
  - **Layout Base, Header & Rodapé:** `design/Main.dc.html`, `design/MobileHome.dc.html`
  - **Páginas Institucionais:** `design/Sobre.dc.html`, `design/Habilidades.dc.html`, `design/Conhecimentos.dc.html`, `design/Experiencias.dc.html`, `design/Projetos.dc.html`, `design/ProjetoDetalhe.dc.html`, `design/Contato.dc.html`, `design/Privacidade.dc.html`, `design/ComoFoiConstruido.dc.html`
  - **Blog Editorial:** `design/Blog.dc.html`, `design/Artigo.dc.html`, `design/ArtigoDark.dc.html`, `design/MobileArtigo.dc.html`
  - **Painel CMS (Admin):** `design/AdminLogin.dc.html`, `design/AdminPosts.dc.html`, `design/AdminEditor.dc.html`, `design/AdminTaxonomia.dc.html`, `design/AdminMensagens.dc.html`, `design/AdminLixeira.dc.html`
  - **Estados & Microinterações:** `design/Estados.dc.html`
- **Proibição de "AI Slop":** É terminantemente vedada a criação de telas com layouts improvisados, gradientes artificiais ou estilizações genéricas que destoem das especificações da pasta `design/`.

---

## 4. Governança e Regras Obrigatórias de Ferramentas MCP

### 4.1. Gestão de Dependências e Bibliotecas via Context7 MCP
- **Gatilho:** Qualquer operação de adição, atualização, remoção ou resolução de dependências e bibliotecas no monorepo (`pnpm add`, edição de `package.json`, etc.).
- **Regra de Ouro:** Antes de instalar ou atualizar qualquer pacote ou biblioteca, o agente **DEVE OBRIGATORIAMENTE** consultar o **MCP Context7** (`resolve-library-id` e `query-docs`).
- **Diretrizes Estritas:**
  1. **Documentação e Compatibilidade Atualizada:** Verificar a documentação mais recente da biblioteca para evitar APIs obsoletas/deprecadas, breaking changes e incompatibilidades com Next.js 15+, React 19 e TypeScript 5+.
  2. **Prevenção de Conflitos no Monorepo:** Assegurar que dependências compartilhadas entre `apps/*` e `packages/*` usem versões consistentes e compatíveis, evitando conflitos de peer-dependencies ou duplicação no lockfile do pnpm.
  3. **Preservação Rígida de `packages/domain` (`DEP-1`):** Nenhuma biblioteca externa pode ser adicionada ao pacote de domínio, sob hipótese alguma.

### 4.2. Validação e Testes ao Fim de Cada Fase via TestSprite MCP
- **Gatilho:** Conclusão de todos os itens de uma fase definida nos arquivos de tasks (ex.: `specs/001-davidev-portfolio/tasks.md` ou `task.md` — Fase 1, Fase 2, Fase 3, etc.).
- **Regra de Ouro:** Ao atingir o final de cada fase das tasks, o agente **DEVE OBRIGATORIAMENTE** invocar o **MCP TestSprite** para planejar, gerar e executar os testes necessários.
- **Diretrizes Estritas:**
  1. **Cobertura Frontend e Backend:** Utilizar as ferramentas do TestSprite (`testsprite_generate_backend_test_plan`, `testsprite_generate_frontend_test_plan`, `testsprite_generate_code_and_execute`) para cobrir os fluxos criados na fase correspondente.
  2. **Phase Definition of Done (DoD):** Uma fase do projeto só é considerada 100% concluída quando, além dos testes locais e CI (`pnpm test`, `pnpm ci`), a validação automatizada do TestSprite tiver sido executada e aprovada com sucesso.
  3. **Resolução de Falhas:** Caso os testes do TestSprite apontem falhas ou regressões, elas devem ser corrigidas e retestadas antes de transitar para a fase seguinte.

---

## 5. Checklist de Execução Obrigatório para o Agente

Antes de iniciar qualquer tarefa e antes de finalizar o turno:

1. **Classificação do Escopo:** Identificar em qual camada do monorepo a tarefa atua.
2. **Leitura Prévia da Skill:** Se as regras detalhadas da skill aplicável não estiverem frescas no contexto, inspecionar o arquivo `SKILL.md` correspondente em `~/.gemini/config/skills/<skill-name>/SKILL.md`.
3. **Inspeção de Design (se envolver Frontend):** Abrir e analisar o arquivo correspondente em `design/*.dc.html` e os tokens de `design/Tokens.dc.html` antes de criar ou modificar telas do `apps/web`.
4. **Consulta ao Context7 MCP (se envolver bibliotecas):** Se houver instalação, atualização ou uso de dependências externas, consultar obrigatoriamente o Context7 para assegurar versão atualizada, documentação canônica e ausência de conflitos.
5. **Execução Conforme os Padrões:**
   - Se for código TypeScript de Domínio $\rightarrow$ aplicar tipagem defensiva da skill `typescript-advanced-types`.
   - Se for tela ou componente Next.js $\rightarrow$ aplicar `next-best-practices` e `vercel-react-best-practices`.
   - Se for componente visual $\rightarrow$ aplicar `frontend-design`, `shadcn` e `vercel-composition-patterns`.
   - Se for revisão ou entrega de UI $\rightarrow$ validar contra `web-design-guidelines`.
   - Se for documentação $\rightarrow$ estruturar com `readme-generator`.
6. **Validação com TestSprite MCP (ao fechar fases do `tasks.md`):** Se a tarefa concluir uma fase do plano de tarefas (`tasks.md`), acionar o TestSprite para gerar e executar a suíte de testes de validação da fase.
7. **Validação de Não-Violação:** Verificar se a solução não viola as 7 regras de dependência (`DEP-1` a `DEP-7`) e as cláusulas da Constituição (`.specify/memory/constitution.md`).
