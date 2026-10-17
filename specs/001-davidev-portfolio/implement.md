# Implementation Playbook: DaviDev

**Feature ID:** `001-davidev-portfolio`  
**Phase:** Implementation Guidelines (`/speckit.implement`)  
**Context:** `specs/001-davidev-portfolio/plan.md`, `specs/001-davidev-portfolio/tasks.md`  
**Constitution:** `.specify/memory/constitution.md`  

Este documento estabelece o **guia operacional de implementação** para agentes de IA e desenvolvedores durante a execução das tarefas catalogadas no `tasks.md`.

---

## 1. Princípios de Execução

1.  **Disciplina de Tarefa Única:**
    *   Trabalhe em **uma tarefa por vez** (seguindo a ordem de dependências do `tasks.md`).
    *   Ao concluir uma tarefa, execute a suíte de verificação local correspondente e marque o checkbox `[x]` no `tasks.md`.
2.  **Desenvolvimento Guiado por Testes (TDD):**
    *   Para regras de negócio (`packages/domain`) e casos de uso (`packages/application`), escreva os testes unitários utilizando dublês de teste (in-memory repositories) antes ou em conjunto com a implementação.
    *   Nunca dependa de uma instância ativa de banco de dados ou servidor HTTP para validar lógica pura de negócio.
3.  **Respeito Irrestrito às Fronteiras Arquiteturais:**
    *   Nunca importe Fastify, Drizzle, React ou Next.js dentro de `packages/domain` ou `packages/application`.
    *   Execute `pnpm arch:check` frequentemente para garantir que `dependency-cruiser` aprove a árvore de dependências (DEP-1 a DEP-7).
4.  **Contrato da API Imutável Manualmente:**
    *   Nunca edite arquivos em `packages/api-client` diretamente. Toda alteração no contrato deve ser feita no Fastify/OpenAPI e propagada via `pnpm api:generate`.

---

## 2. Fluxo de Trabalho por Tarefa

Para cada tarefa `TXX.YY`:
1.  **Leitura do Contexto:** Revise os critérios de aceite e a seção correspondente em `spec.md` e `data-model.md`.
2.  **Implementação:**
    *   Crie/modifique os arquivos estritamente necessários.
    *   Mantenha nomes de classes, métodos e propriedades alinhados com o Glossário e Linguagem Ubíqua (`architecture.md`).
3.  **Validação Automatizada:**
    *   Execute o linter e o typechecker:
        ```bash
        pnpm lint && pnpm typecheck
        ```
    *   Execute os testes da funcionalidade:
        ```bash
        pnpm test:unit
        ```
    *   Valide as regras de dependência:
        ```bash
        pnpm arch:check
        ```
4.  **Conclusão e Registro:** Atualize o status da tarefa no `tasks.md` com evidência de aprovação.

---

## 3. Padrões de Código e Convenções

*   **Identificadores:** Entidades geram seus IDs no domínio utilizando UUID v7.
*   **Tratamento de Erros:** Erros de negócio devem lançar exceções customizadas de domínio/aplicação que são traduzidas pelo adapter Fastify no formato estruturado `ErrorResponse` (`code`, `message`, `details`, `traceId`).
*   **Renderização de Conteúdo:** O componente `<ArticleRenderer />` deve ser reutilizado sem bifurcação de código entre o site público e o preview do CMS.
