# Especificações do Projeto (Spec Kit SDD)

Este diretório contém a suíte completa de **Especificações Orientadas a Modelos (Spec-Driven Development — SDD)** do projeto **DaviDev**, gerada a partir da documentação existente (`docs/prd.md`, `docs/architecture.md`, `docs/to-be-determined.md` e `design/canvas.json`) utilizando a metodologia e ferramentas do **Spec Kit**.

---

## 🗺️ Mapa de Artefatos e Fluxo de Engenharia

```
PRD (docs/prd.md)                    ← O quê e por quê
 │
 ▼
Architecture Document (docs/architecture.md) ← Como (arquitetura, dados, APIs, infra)
 │
 ├── 📜 Constituição (.specify/memory/constitution.md)
 │
 │   ┌─ PRD como contexto em
 ▼   ▼
/speckit.specify ──► /speckit.clarify ──► specs/001-davidev-portfolio/spec.md
                                                │
 ┌──────────────────────────────────────────────┘
 │
 │   ┌─ Architecture Document como contexto em
 ▼   ▼
/speckit.plan
 ├── specs/001-davidev-portfolio/plan.md          (Plano técnico detalhado)
 ├── specs/001-davidev-portfolio/research.md      (Pesquisa técnica & ADRs)
 ├── specs/001-davidev-portfolio/data-model.md    (Modelo conceitual e DDL Drizzle)
 ├── specs/001-davidev-portfolio/contracts/       (Contrato OpenAPI 3.0 yaml)
 └── specs/001-davidev-portfolio/quickstart.md    (Guia de onboarding do desenvolvedor)
 │
 ▼
/speckit.checklist  ──► specs/001-davidev-portfolio/checklist.md  (Quality gate de requisitos)
 │
 ▼
/speckit.tasks      ──► specs/001-davidev-portfolio/tasks.md      (Plano de tarefas executáveis)
 │
 ▼
/speckit.analyze    ──► specs/001-davidev-portfolio/analyze.md    (Auditoria de consistência cruzada)
 │
 ▼
/speckit.implement  ──► specs/001-davidev-portfolio/implement.md  (Guia operacional de implementação)
 │
 ▼
/speckit.converge   ──► specs/001-davidev-portfolio/converge.md   (Relatório de convergência e DoD)
```

---

## 📂 Índice dos Artefatos

| Artefato | Descrição |
|---|---|
| [`.specify/memory/constitution.md`](../.specify/memory/constitution.md) | **Constituição:** Leis fundamentais e regras arquiteturais não-negociáveis. |
| [`specs/001-davidev-portfolio/spec.md`](./001-davidev-portfolio/spec.md) | **Especificação do Produto:** Personas, 22 histórias de usuário e regras de negócio. |
| [`specs/001-davidev-portfolio/plan.md`](./001-davidev-portfolio/plan.md) | **Plano Técnico:** Monolito modular hexagonal, driving adapters e roadmap em 9 fases. |
| [`specs/001-davidev-portfolio/research.md`](./001-davidev-portfolio/research.md) | **Pesquisa & ADRs:** Trade-offs, Neon HTTP, rate limiting atômico e tokens editoriais. |
| [`specs/001-davidev-portfolio/data-model.md`](./001-davidev-portfolio/data-model.md) | **Modelo de Dados:** Agregados DDD, schema físico Drizzle ORM, constraints e migrações. |
| [`specs/001-davidev-portfolio/contracts/openapi.yaml`](./001-davidev-portfolio/contracts/openapi.yaml) | **Contrato de API:** Especificação OpenAPI 3.0 completa de rotas públicas, auth e admin. |
| [`specs/001-davidev-portfolio/quickstart.md`](./001-davidev-portfolio/quickstart.md) | **Quickstart:** Instruções para setup local, migrações, execução e testes. |
| [`specs/001-davidev-portfolio/checklist.md`](./001-davidev-portfolio/checklist.md) | **Checklist:** Teste de unidade para requisitos e conformidade arquitetural. |
| [`specs/001-davidev-portfolio/tasks.md`](./001-davidev-portfolio/tasks.md) | **Lista de Tarefas:** Decomposição acionável ordenada pelas 9 fases do roadmap. |
| [`specs/001-davidev-portfolio/analyze.md`](./001-davidev-portfolio/analyze.md) | **Análise Cruzada:** Auditoria garantindo zero discrepâncias entre PRD, arquitetura e spec. |
| [`specs/001-davidev-portfolio/implement.md`](./001-davidev-portfolio/implement.md) | **Playbook:** Guia de implementação, ciclo TDD e validações no CI. |
| [`specs/001-davidev-portfolio/converge.md`](./001-davidev-portfolio/converge.md) | **Convergência:** Critérios de Definition of Done e protocolo de desvios. |
