# Itens Pendentes — DaviDev

> Documento complementar ao `architecture.md`. Registra toda decisão marcada como pendente, adiada ou dependente de terceiros durante o processo de arquitetura de 23 etapas.
>
> **Classificação:** todo item é **Bloqueante** ou **Não-bloqueante**. Item sem classificação conta como bloqueante.
>
> Última atualização: 2026-09-09 — **Etapa 23, processo encerrado**
>
> **Situação na aprovação final:** nenhuma pendência bloqueante. Cinco itens não-bloqueantes em aberto, todos com responsável e prazo. Um item resolvido durante o processo.

---

## Decisões Pendentes

| # | Etapa | Descrição | Contexto | Responsável | Prazo / Marco bloqueado | Classificação | Status |
|---|---|---|---|---|---|---|---|
| P-001 | 1 — Contexto de Produto | Localização e visibilidade do repositório | O `architecture.md` referencia o repositório em "Links úteis", mas ele ainda não existe. O PRD trata o repositório público como parte da evidência do projeto (página "Como foi construído"), o que sugere GitHub público — mas isso precisa ser decidido explicitamente, inclusive quanto ao momento de torná-lo público | Davi | Antes da Fase 1 (Fundação) | Não-bloqueante | Aberto |
| P-002 | 3 — Requisitos Funcionais | Limite máximo de tags por post | O valor de 10 tags por post foi arbitrado pelo arquiteto, sem base empírica. É um limite de UX e de qualidade de folksonomia, não uma restrição técnica. Pode ser calibrado depois dos primeiros artigos reais | Davi | Antes da Fase 4 (Administração) | Não-bloqueante | Aberto |
| P-004 | 4 — Requisitos Não Funcionais | Janela real de *point-in-time recovery* do plano de banco contratado | O RPO de 24h foi confirmado, mas a janela de PITR oferecida pelo provedor varia por plano e muda com o tempo — não foi assumida como número neste documento. Precisa ser **verificada no plano efetivamente contratado** e, se for menor que o RPO, o export independente deixa de ser redundância e passa a ser o mecanismo primário | Davi | Antes da Fase 8 (Publicação) | **Não-bloqueante** *(reclassificado na Etapa 22)* | Aberto |
| P-005 | 7 — Integrações Externas | Condições reais dos planos contratados (Turnstile, Resend, Plausible, Vercel, Neon) | O documento não assume limites, cotas nem preços de nenhum provedor — números de plano mudam com o tempo e não devem ser inventados. Precisam ser verificados no momento da contratação e consolidados na Etapa 21 (Custo). Relevante especialmente para o Resend (cota de envio) e o Plausible (que é pago) | Davi | Etapa 21 — antes da Fase 8 | Não-bloqueante | Aberto |
| P-006 | 8 — Arquitetura | Versões exatas de linguagem, runtime e bibliotecas | O `architecture.md` nomeia as tecnologias mas deliberadamente **não fixa números de versão** — versões inventadas envelhecem mal e induzem erro. Devem ser pinadas na inicialização do projeto (Fase 1) e registradas na seção *Technology Stack*, incluindo a versão de Node.js do runtime. Critério: stack mainstream com LTS longo, pelo requisito de sobreviver a períodos longos sem manutenção | Davi | Fase 1 (Fundação) | **Não-bloqueante** *(reclassificado na Etapa 22)* | Aberto |

---

## Etapas Puladas (Adiadas)

Nenhuma até o momento.

---

## Resolvidos

| # | Etapa | Descrição | Decisão final | Resolvido em |
|---|---|---|---|---|
| P-003 | 3 → 11 | Política de retenção das mensagens de contato | **24 meses** a partir do recebimento, com expurgo automático pela rota de manutenção diária (Vercel Cron). Prazo declarado publicamente na Política de Privacidade (C-16). Base legal: consentimento ao submeter o formulário | Etapa 11 |
