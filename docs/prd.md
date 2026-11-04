# PRD — DaviDev: Portfólio Profissional com Blog e CMS

> **Documento de Requisitos de Produto (PRD)**
> Fonte de origem: `davidev_portfolio_referencia_prd_arquitetura.pdf` (Documento de Referência do Produto, set/2026).
> Este PRD consome aquele documento, resolve o que era ambíguo e explicita o que ainda não se sabe.
> Decisões de implementação (modelo definitivo de dados, contrato completo da API, deploy, CI/CD, observabilidade) ficam para o **Documento de Arquitetura**.

## Informações do Documento

**Autor:** Davi Chaves
**Revisores:** o autor é o único revisor — decisão registrada (Questão #19). Risco associado na Seção 9.
**Data:** 2026-09-09
**Status:** v0.2 — questões de produto resolvidas; questões de arquitetura seguem abertas para o Documento de Arquitetura

### Legenda de lacunas

- 🔶 **Premissa** — preenchido por inferência; plausível, porém não validado. É risco até ser confirmado.
- 🔵 **Questão em aberto** — ainda não se sabe; exige descoberta, decisão ou dado que não existe hoje.

### Change Log

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 2026-09-09 | Davi Chaves | Rascunho inicial derivado do Documento de Referência |
| 0.2 | 2026-09-09 | Davi Chaves | Resolvidas as questões 1, 6, 8, 11–19. Entram no escopo: i18n (pt-BR/en) e tema claro/escuro. Backend definido em Render. Exclusão passa a ser física com lixeira. Novas questões 20–24 abertas. |
| 0.3 | 2026-09-09 | Davi Chaves | Origem do conteúdo definida (LinkedIn + GitHub como matéria-prima, com transformação obrigatória). Novo risco e nova premissa a validar. Questão #25 aberta. Hospedagem do backend (#1) revista: **Fastify como função serverless na Vercel**, substituindo o Render — riscos de estado em memória e de pool de conexões passam a ser explícitos. |
| 0.4 | 2026-11-03 | Davi Chaves | Área pública simplificada para leitura de recrutadores: Habilidades e Conhecimentos (F3 e F4, Story 3) passam a ser a seção de tecnologias de Sobre, com redirecionamento das URLs antigas; a home deixa de listar artigos (o Blog segue no menu). Projetos refeitos com dados verificados nos repositórios. |
| 0.5 | 2026-11-03 | Davi Chaves | Nova página Como trabalho no menu, com o fluxo de criação de software do autor, o uso de agentes de IA e os estudos de arquitetura; a home passa a destacar esse método logo abaixo do topo. |

### Índice

1. [Resumo Executivo](#1-resumo-executivo)
2. [Declaração do Problema](#2-declaração-do-problema)
3. [Usuários-Alvo e Personas](#3-usuários-alvo-e-personas)
4. [Contexto Estratégico](#4-contexto-estratégico)
5. [Visão da Solução](#5-visão-da-solução)
6. [Métricas de Sucesso](#6-métricas-de-sucesso)
7. [Histórias de Usuário e Requisitos](#7-histórias-de-usuário-e-requisitos)
8. [Fora de Escopo](#8-fora-de-escopo)
9. [Dependências e Riscos](#9-dependências-e-riscos)
10. [Questões em Aberto](#10-questões-em-aberto)
11. [Autoavaliação do PRD](#autoavaliação-do-prd)

***

## 1. Resumo Executivo

Estamos construindo o **DaviDev** — um portfólio profissional full-stack com blog técnico próprio e painel administrativo (CMS) — para **quem avalia tecnicamente o desenvolvedor antes de uma contratação ou contrato** (tech leads, hiring managers, recrutadores técnicos e clientes potenciais), a fim de resolver o problema de que **currículo, LinkedIn e portfólios de template não comprovam profundidade de engenharia**: eles listam tecnologias, mas não demonstram arquitetura, disciplina de especificação, segurança nem processo de desenvolvimento. O resultado esperado é que o próprio produto sirva de prova — **o artefato e o processo que o gerou ficam públicos e auditáveis**, encurtando a etapa de "provar que sei fazer" nas conversas de oportunidade.

O diferencial não é o site — é a decisão deliberada de tratar um portfólio como produto de software: PRD, arquitetura, especificações, tasks, implementação assistida por IA (MCP e harnesses), testes e revisão, com uma página pública de *case study* documentando o caminho.

***

## 2. Declaração do Problema

### Quem tem o problema?

Duas frentes, com o mesmo pano de fundo:

1. **Quem avalia** — tech leads, hiring managers, recrutadores técnicos e clientes que precisam decidir, em minutos, se um desenvolvedor tem a senioridade que declara.
2. **O desenvolvedor (Davi)** — profissional com trabalho técnico real (arquitetura, backend, automação, IA aplicada) cujo material de apresentação atual não carrega essa profundidade.

### Qual é o problema?

O canal de apresentação disponível hoje é **declarativo, não demonstrativo**:

- Currículo e LinkedIn expressam senioridade como *lista de tecnologias*. Não distinguem quem usou uma stack de quem projetou com ela.
- Portfólios feitos a partir de templates provam design de terceiros, não capacidade de engenharia. Não há código de domínio, não há decisão arquitetural, não há segurança real.
- O conteúdo técnico produzido fica hospedado em plataformas de terceiros (LinkedIn, Medium, Dev.to), sem propriedade do canal, sem SEO próprio e sem vínculo com o restante do trabalho.
- **Não existe hoje um lugar onde o processo de engenharia seja visível.** Mostra-se o resultado; o método — que é o que separa sênior de pleno — permanece invisível.

### Por que isso dói?

- **Impacto para quem avalia:** precisa inferir competência a partir de sinais fracos (nome de empresa, tempo de casa, palavras-chave), o que aumenta o custo e o risco da avaliação e empurra a decisão para etapas caras de entrevista técnica.
- **Impacto para o desenvolvedor:** o trabalho de maior valor — decisões de arquitetura, trade-offs, disciplina de especificação, uso maduro de IA no ciclo de desenvolvimento — não chega ao avaliador. A conversa começa do zero em toda oportunidade, e o posicionamento fica sujeito à triagem por palavra-chave.

### Evidências

> 🔶 **Premissa (transversal a esta seção):** não houve processo formal de discovery — nenhuma entrevista, analytics ou pesquisa de mercado foi coletada. As evidências abaixo são observações do autor e conhecimento de domínio, não pesquisa validada. Ver validação proposta na [Autoavaliação](#autoavaliação-do-prd).

- **Observação de mercado:** 🔶 Premissa — a maioria dos portfólios de desenvolvedor é uma página estática de apresentação; poucos expõem backend real, autenticação, arquitetura documentada e um CMS próprio operando em produção.
- **Sinal de canal:** 🔶 Premissa — artigos técnicos publicados apenas em plataformas de terceiros não geram audiência própria nem se conectam ao portfólio.
- 🔵 **Questão em aberto:** quantas e quais oportunidades foram perdidas ou emperradas por falta de material demonstrativo? Sem esse dado, o dimensionamento do problema permanece qualitativo.
- 🔵 **Questão em aberto:** existe algum retorno direto de recrutador ou tech lead sobre o material atual (currículo/LinkedIn) que possa ser citado aqui como voz do usuário?

***

## 3. Usuários-Alvo e Personas

### Persona primária — Rafael, Tech Lead avaliador

- **Papel:** Tech Lead / Engineering Manager; participa da decisão de contratação e da triagem técnica.
- **Contexto:** avalia dezenas de candidatos por vaga; dedica de 2 a 5 minutos ao material de cada um antes de decidir se avança. 🔶 Premissa — janela de atenção estimada, não medida.
- **Objetivos:** identificar rapidamente profundidade real (arquitetura, testes, segurança, capacidade de decisão) com evidência verificável, não autodeclaração.
- **Dores:** portfólios genéricos e indistinguíveis; listas de tecnologias sem contexto; ausência de código ou raciocínio observável; gastar uma entrevista inteira para descobrir o que uma página bem-feita responderia.
- **Comportamento atual:** abre o LinkedIn, procura o GitHub, escaneia repositórios sem README, desiste e vai para a entrevista sem hipótese formada.

### Persona secundária — Camila, Recrutadora técnica

- **Papel:** Recrutadora / Talent Acquisition com foco em tecnologia.
- **Difere da primária:** faz a triagem *antes* do avaliador técnico, com menos profundidade e mais velocidade. Precisa de sinais legíveis rapidamente (stack, senioridade, tipo de projeto, contato) e de material que possa **encaminhar** ao time técnico.
- **Necessidade específica:** um link único, apresentável e navegável no celular, que sobreviva ao encaminhamento por e-mail ou mensagem.

### Persona secundária — Bruno, Desenvolvedor leitor

- **Papel:** desenvolvedor pesquisando um tema técnico (arquitetura hexagonal, Fastify, Drizzle, desenvolvimento assistido por IA).
- **Difere da primária:** não veio avaliar ninguém — veio resolver um problema. Chega por busca orgânica, direto num artigo do blog.
- **Necessidade específica:** leitura confortável de conteúdo técnico (código legível, tipografia, navegação por categoria e tag) e conteúdo confiável e atualizado.

### Persona secundária — Marcos, Contratante de projeto (freelance)

- **Papel:** fundador, gestor de produto ou responsável técnico em empresa pequena que precisa contratar um desenvolvedor para um projeto específico.
- **Difere da primária:** não avalia senioridade para compor um time — avalia **capacidade de entregar um resultado**. Quer saber o que o profissional já resolveu, em quanto tempo e com qual desfecho, mais do que qual padrão arquitetural foi usado.
- **Necessidade específica:** projetos apresentados com problema de negócio, resultado alcançado e escopo de atuação, não apenas com stack e arquitetura. Caminho de contato rápido e sem fricção.
- **Consequência de produto:** a página de Projetos precisa servir a dois olhares simultâneos — profundidade técnica para Rafael, desfecho de negócio para Marcos (ver Story 5).

### Persona operadora — Davi, Administrador do conteúdo

- **Papel:** autor e único administrador; opera o CMS.
- **Contexto:** publica nos intervalos do trabalho principal; o custo de publicação precisa ser baixo o suficiente para não virar barreira.
- **Objetivos:** escrever em Markdown, ver o resultado antes de publicar, corrigir um artigo já publicado sem medo e manter a organização por categoria e tag.
- **Dores:** fluxos de publicação que exigem deploy para corrigir uma vírgula; editores que renderizam diferente da página final; perder o conteúdo anterior ao editar.

### Jobs-to-be-done

| Persona | Job funcional | Job emocional | Job social |
|---|---|---|---|
| Rafael (Tech Lead) | Formar em minutos uma hipótese fundamentada sobre a senioridade técnica do candidato | Segurança de que não vai desperdiçar a agenda do time | Ser visto como alguém que traz bons candidatos para a mesa |
| Camila (Recrutadora) | Qualificar e encaminhar o candidato com um único link | Confiança de que não vai passar vergonha ao indicar | Reputação de trazer perfis de qualidade |
| Marcos (Contratante) | Decidir se este profissional resolve o problema que ele tem, no prazo que ele tem | Confiança de que não vai contratar retrabalho | Ser visto como quem escolheu bem o parceiro técnico |
| Bruno (Dev leitor) | Resolver um problema técnico concreto lendo o artigo | Sentir que o conteúdo é de quem fez, não de quem resumiu | Compartilhar um link que agrega valor à sua rede |
| Davi (Admin) | Publicar e corrigir conteúdo com atrito mínimo | Sentir que o produto é dele e que ele o domina | Ser reconhecido pelo método, não só pelo resultado |

> **Decisão (Questão #13, resolvida):** o público-alvo cobre **contratação CLT/PJ e trabalho freelance**, e inclui **oportunidades internacionais** (Questão #14). Por isso o conjunto de personas contempla tanto o avaliador técnico (Rafael) quanto o contratante de projeto (Marcos), e o produto precisa ser bilíngue (Épico 6).
>
> 🔶 **Premissa remanescente:** as personas continuam derivadas de inferência, não de entrevistas. Rafael segue como primária porque é o filtro mais exigente — material que o convence também serve a Camila e a Marcos, mas o inverso não é verdadeiro.

***

## 4. Contexto Estratégico

### Objetivos de negócio

- **Alinhamento estratégico:** o produto sustenta o posicionamento profissional do autor como desenvolvedor full-stack sênior com domínio de arquitetura e de engenharia assistida por IA. O objetivo não é receita direta, e sim **qualidade e velocidade das oportunidades** (entrevistas, propostas, convites).
- **Frentes de oportunidade (Questões #13 e #14, resolvidas):** contratação **CLT/PJ** e **freelance**, no mercado nacional **e internacional**. Isso amplia o produto em duas direções concretas: o conteúdo precisa falar de resultado de negócio além de arquitetura (persona Marcos), e a superfície pública precisa ser bilíngue pt-BR/en (Épico 6).
- **Impacto econômico:** indireto — melhor posicionamento tende a se converter em melhores oportunidades e maior poder de negociação. 🔵 **Questão em aberto:** existe uma meta concreta atrelada (transição de cargo, faixa salarial, volume de freelance) que permita medir retorno?
- **Objetivo secundário e deliberado:** o projeto é também um **laboratório**. Ele valida, num contexto real e público, um fluxo de trabalho (PRD → Arquitetura → Spec → Tasks → Implementação com IA → Testes → Review → Deploy) que tem valor próprio, independente do portfólio.

### Oportunidade de mercado

Não se aplica no formato TAM/SAM/SOM — o produto não é comercializado. O "mercado" relevante é o conjunto de oportunidades profissionais alcançáveis pelo autor. 🔶 Premissa: dimensionar isso não mudaria nenhuma decisão deste PRD, por isso a seção foi deliberadamente mantida vazia em vez de preenchida com números inventados.

### Cenário competitivo

- **Alternativas atuais:** LinkedIn, GitHub, currículo em PDF, portfólios de template (starters Next.js/Vercel, Linktree, Notion público), blogs em plataformas de terceiros (Medium, Dev.to, Hashnode).
- **Onde elas falham:** todas otimizam para *declaração* e *alcance*, não para *prova*. Nenhuma mostra decisão arquitetural, código de domínio, segurança implementada ou método de trabalho.
- **Nossa lacuna:** um portfólio custom exige manutenção e tem custo de oportunidade alto — é justamente por isso que ele funciona como sinal. 🔶 Premissa: o esforço de construção é sustentável em paralelo à rotina profissional; se não for, o projeto morre pela metade e produz o sinal oposto ao pretendido (ver Seção 9).

### Por que agora?

- O ecossistema de desenvolvimento assistido por IA (MCP, harnesses, spec-driven development) está em consolidação — **demonstrar domínio dele agora é diferenciação; em dois anos será tabela**.
- A stack escolhida (Next.js, Fastify, Drizzle, Neon, Vercel) está madura o bastante para não exigir gambiarra e moderna o bastante para comunicar atualidade.
- O conteúdo técnico já existe na prática do autor; falta o canal para publicá-lo.

***

## 5. Visão da Solução

### Descrição da solução

O DaviDev é um **produto full-stack orientado a conteúdo**, dividido em três superfícies:

**1. Área pública (vitrine).** Aplicação Next.js que apresenta trajetória, habilidades, conhecimentos, experiências e projetos, com página de contato. O nível de detalhe é calibrado para os dois modos de leitura das personas: escaneável em 2 minutos por Rafael e Camila, aprofundável por quem quiser descer ao detalhe técnico de um projeto.

**2. Blog técnico.** Listagem com filtros por categoria e tag, e leitura de artigo por slug, com Markdown renderizado, tipografia adequada a conteúdo técnico, realce de código e exibição das datas de publicação e de última atualização. O blog é o motor de descoberta orgânica (SEO) e o vetor da persona Bruno.

**3. Painel administrativo (CMS próprio).** Área protegida por autenticação JWT onde o administrador cria, edita, publica e remove artigos, com editor Markdown e preview fiel à renderização pública (modos Editor / Preview / Split), além de gestão de categorias e tags. Cada publicação relevante após a primeira gera um registro de versão.

Atravessando as três, uma quarta entrega: a página **"Como este projeto foi construído"** — *case study* público do processo de engenharia, transformando método em artefato visível.

No backend, uma **API REST em Fastify** organizada em **Arquitetura Hexagonal (Ports & Adapters)**: domínio e casos de uso independentes de HTTP, de framework e de banco; Fastify, Drizzle e PostgreSQL tratados como adapters de infraestrutura. Isso não é preciosismo — faz parte do produto: a testabilidade das regras de negócio sem banco e sem servidor HTTP é uma das evidências que o portfólio precisa apresentar.

### Funcionalidades-chave

| # | Funcionalidade | Atende |
|---|---|---|
| F1 | Home com apresentação, destaques e acesso às áreas principais | Rafael, Camila |
| F2 | Sobre mim (trajetória + foto) | Rafael, Camila |
| F3 | Habilidades técnicas | Rafael, Camila |
| F4 | Conhecimentos (conceitos, arquitetura, fundamentos) | Rafael |
| F5 | Experiências profissionais (responsabilidades e tecnologias) | Rafael, Camila |
| F6 | Projetos com detalhe técnico (case, desafios, arquitetura, links) | Rafael |
| F7 | Blog: listagem com filtros por categoria e tag | Bruno |
| F8 | Blog: leitura de artigo com Markdown renderizado e datas | Bruno, Rafael |
| F9 | Contato e links profissionais | Camila, clientes |
| F10 | Página "Como foi construído" (case study do processo com IA) | Rafael — é a evidência principal |
| F11 | Login administrativo com Access + Refresh Token | Davi |
| F12 | CRUD de posts (listar, criar, editar, excluir) | Davi |
| F13 | Editor com Markdown e preview fiel (Editor / Preview / Split) | Davi |
| F14 | Gestão de categorias e tags | Davi |
| F15 | Versionamento de artigos com identificação pública de atualização | Davi, Bruno |
| F16 | API REST documentada em OpenAPI/Swagger | Rafael — evidência técnica |
| F17 | Site público bilíngue (pt-BR / en) com seletor de idioma | Rafael, Camila, Marcos, Bruno — alcance internacional |
| F18 | Tema claro e escuro, com respeito à preferência do sistema | Todos |

### Ciclo de vida de um post

```
Rascunho → edição → preview → publicação → edição posterior → nova versão
```

### Informações mínimas do artigo

Título · Slug · Resumo · Conteúdo · Imagem de capa · Categoria · Tags · Status · Data de publicação · Data da última atualização · Versão atual.

### Fluxos de usuário e wireframes

**Decisão (Questão #12, resolvida):** não haverá Figma. O design será definido por um **artifact gerado no Claude Code**, apoiado pela skill `impeccable`, servindo como referência visual navegável antes da implementação em shadcn/ui.

Consequências assumidas:
- O artifact de design é **pré-requisito da Fase 2**, não subproduto dela — sem referência visual, a implementação de 9 páginas vira improviso.
- O artifact precisa cobrir os dois temas (claro e escuro) e os dois idiomas na estrutura, já que ambos entram nesta versão. O texto em português costuma ocupar cerca de 20% mais espaço que o equivalente em inglês — um layout desenhado só em um dos idiomas quebra ou fica ralo no outro.
- Por não haver ferramenta de design separada, o artifact passa a ser o registro da decisão visual. Vale mantê-lo publicado e versionado junto ao projeto.

***

## 6. Métricas de Sucesso

> 🔶 **Premissa transversal:** não há baseline para nenhuma métrica abaixo — o produto não existe e não há analytics no material atual. Todos os alvos são hipóteses iniciais e devem ser recalibrados após 30 dias de operação.
>
> **Decisão (Questão #11, resolvida): Plausible Analytics.** Consequências: (a) sem cookies de rastreamento, o site dispensa banner de consentimento — ganho real de UX e de conformidade, relevante agora que há público internacional/GDPR; (b) a métrica primária depende de **eventos e metas customizadas** no Plausible, além de pageviews — a instrumentação precisa entrar na Fase 8, não depois; (c) o Plausible não faz atribuição por sessão longa, então a leitura de "3 páginas incluindo Projetos" será aproximada por metas de página e origem de tráfego (UTM nos links de LinkedIn e currículo). 🔶 Premissa: essa aproximação é suficiente para decidir; se não for, a métrica primária precisa ser simplificada em vez de a ferramenta ser trocada.

### Métrica primária

- **Métrica:** taxa de aprofundamento qualificado — percentual de visitantes vindos de canal profissional (LinkedIn, currículo, assinatura de e-mail) que visualizam ao menos 3 páginas **incluindo** Projetos ou "Como foi construído".
- **Baseline:** inexistente (produto não existe). 🔶 Premissa.
- **Alvo:** 30% dos visitantes de canal profissional. 🔶 Premissa — alvo arbitrado, sem referência de mercado.
- **Prazo:** medir 30 dias após o lançamento (Fase 8).
- **Por que esta:** mede exatamente o problema da Seção 2. Se o avaliador chega e não desce até a evidência técnica, o produto falhou no seu propósito, ainda que o tráfego seja alto.

### Métricas secundárias

- **Cadência de publicação:** ao menos 1 artigo por mês nos 6 meses seguintes ao lançamento do blog. *(Teste real de que o CMS reduziu o atrito de publicação — a Fase 4 existe para isso.)*
- **Custo de publicação:** tempo entre "texto pronto" e "artigo no ar" menor ou igual a 10 minutos, sem deploy. 🔶 Premissa de alvo.
- **Descoberta orgânica:** tráfego de busca para o blog crescendo mês a mês a partir do 3º mês pós-lançamento.
- **Retorno qualitativo:** ao menos 3 menções espontâneas ao portfólio (ou à página "Como foi construído") em conversas profissionais nos 6 primeiros meses. *(Métrica estatisticamente pobre, mas é o sinal mais próximo do desfecho que importa.)*
- **Cobertura de testes de domínio e casos de uso:** 80% ou mais. *(Simultaneamente métrica de qualidade e evidência exibível.)*

### Métricas de guarda (não podem piorar)

- **Performance do site público:** Core Web Vitals em faixa "Good" (LCP abaixo de 2,5s). Um portfólio de engenheiro lento se autodesmente.
- **Acessibilidade:** sem violações críticas de WCAG AA nas páginas públicas.
- **Segurança:** zero exposição de rota administrativa ou de segredo em bundle público; zero credencial em texto puro no banco.
- **Escopo e ritmo:** o projeto não pode ficar mais de 60 dias sem avanço visível. 🔶 Premissa — abandono no meio do caminho é o pior desfecho possível, pior do que não ter começado, porque o repositório fica público.

***

## 7. Histórias de Usuário e Requisitos

### Hipótese do épico

> Acreditamos que **um portfólio construído como produto de software real — com blog próprio, CMS administrativo, API REST documentada e arquitetura hexagonal — somado a um case study público do processo de engenharia assistida por IA** fará com que avaliadores técnicos formem uma hipótese fundamentada de senioridade **antes** da primeira conversa, porque o material atual é declarativo e não demonstrativo. Saberemos que deu certo se a taxa de aprofundamento qualificado atingir 30% em 30 dias de operação e se houver menções espontâneas ao case study em conversas profissionais.

### Épico 1 — Área pública (vitrine)

**Story 1 — Home**
Como avaliador técnico, quero uma home que me diga em 30 segundos quem é o profissional e para onde ir, para decidir se vale meu tempo.

- [ ] A home apresenta nome, posicionamento profissional em uma frase e chamada para as áreas principais.
- [ ] Exibe destaques: projetos em evidência e artigos recentes do blog.
- [ ] Há acesso visível e direto a Projetos, Blog, "Como foi construído" e Contato.
- [ ] Renderiza corretamente de 320px a 1920px de largura.
- [ ] Metadados de SEO (title, description, Open Graph) presentes e específicos da página.

**Story 2 — Sobre mim**
Como recrutadora, quero conhecer a trajetória e ver a foto do profissional, para qualificar o perfil e encaminhá-lo ao time técnico.

- [ ] Exibe apresentação profissional em texto corrido e foto.
- [ ] Apresenta a trajetória de forma cronológica ou temática legível.
- [ ] Conteúdo acessível (contraste AA, imagem com texto alternativo).

**Story 3 — Habilidades e Conhecimentos**
Como avaliador técnico, quero distinguir tecnologias que o profissional pratica de conceitos que ele domina, para calibrar minha expectativa de senioridade.

- [ ] Página de Habilidades lista tecnologias e competências práticas, agrupadas por categoria.
- [ ] Página de Conhecimentos apresenta conceitos, arquitetura e fundamentos — separada de Habilidades.
- [ ] Cada item indica **contexto de uso** — onde e para quê a tecnologia foi aplicada. **Não há barras, notas ou percentuais de proficiência** (Questão #18, resolvida).
- [ ] O contexto de uso é uma frase curta e concreta ("usado em produção no worker de coleta X"), não um adjetivo genérico ("avançado").

**Story 4 — Experiências profissionais**
Como avaliador técnico, quero ver responsabilidades e tecnologias de cada experiência, para entender o que ele de fato fez.

- [ ] Cada experiência exibe empresa/contexto, período, responsabilidades e tecnologias.
- [ ] Ordenação cronológica decrescente.
- [ ] Informações sensíveis de empregadores não são expostas.

**Story 5 — Projetos e detalhe de projeto**
Como avaliador técnico, quero abrir um projeto e ver o problema, os desafios, as decisões de arquitetura e os links, para avaliar profundidade real.

- [ ] Listagem de projetos com título, resumo e tecnologias principais.
- [ ] Página de detalhe com contexto/problema, desafios enfrentados, tecnologias, decisões de arquitetura e links (repositório e/ou produção) quando existirem.
- [ ] Página de detalhe apresenta também o **problema de negócio e o resultado alcançado**, em linguagem acessível a quem não é desenvolvedor — a persona Marcos avalia desfecho, não padrão arquitetural (Questão #13).
- [ ] A leitura funciona nos dois níveis: o resumo de negócio vem primeiro e é compreensível isolado; o detalhe técnico vem em seguida, sem exigir a leitura do anterior.
- [ ] Projetos sem link público são identificados como tal, sem link quebrado.

**Story 6 — Contato**
Como recrutadora, quero um caminho direto de contato, para iniciar a conversa sem sair da página.

- [ ] Exibe canais profissionais (e-mail, LinkedIn, GitHub) com links funcionais.
- [ ] Formulário de contato com validação de campos e feedback de sucesso e de erro.
- [ ] **A mensagem é persistida no banco e enviada por e-mail** (Questão #16, resolvida). O banco é a fonte de verdade; o e-mail é a notificação.
- [ ] **Se a persistência falhar, a submissão falha** e o usuário é avisado. Se apenas o envio de e-mail falhar, a submissão é considerada bem-sucedida e a falha é registrada — nenhuma mensagem de contato pode ser perdida por indisponibilidade do provedor de e-mail.
- [ ] Formulário protegido por **captcha** (Questão #16, resolvida) e por rate limiting.
- [ ] O captcha não bloqueia navegação por teclado nem leitor de tela (a página é auditada em WCAG AA).
- [ ] 🔵 Questão em aberto (#22): provedor de captcha e de e-mail transacional — decisão da arquitetura. Recomendação: Cloudflare Turnstile (sem custo, sem enigma visual, menos hostil à acessibilidade que o reCAPTCHA).

**Story 7 — Página "Como foi construído"**
Como avaliador técnico, quero entender o processo de engenharia usado no próprio portfólio, para avaliar método e não só resultado.

- [ ] Apresenta o fluxo: Ideia → PRD → Arquitetura → Especificação → Tasks → Implementação assistida por IA → Testes → Validação → Code Review → Deploy.
- [ ] Explica o uso de IA, MCP e harnesses no ciclo, com exemplos concretos do próprio projeto.
- [ ] Registra decisões técnicas e aprendizados, incluindo o que deu errado.
- [ ] **Não expõe credenciais, segredos, prompts com dados privados nem informações de terceiros.**
- [ ] Referencia ou linka os artefatos reais — este PRD e o documento de arquitetura — quando publicáveis.

### Épico 2 — Blog público

**Story 8 — Listagem de artigos**
Como desenvolvedor leitor, quero navegar e filtrar os artigos, para encontrar o conteúdo que resolve meu problema.

- [ ] Lista os artigos **publicados**, ordenados por data de publicação decrescente.
- [ ] Cada item exibe título, resumo, imagem de capa, categoria e data.
- [ ] Filtros por categoria e por tag funcionam e são refletidos na URL (compartilhável).
- [ ] Artigos em rascunho **nunca** aparecem na listagem pública nem por acesso direto à URL.
- [ ] Há paginação ou carregamento incremental quando o volume exigir.

**Story 9 — Leitura de artigo**
Como desenvolvedor leitor, quero ler o artigo com formatação e código legíveis, para conseguir aplicar o conteúdo.

- [ ] Artigo acessível por `/blog/:slug`; slug inexistente retorna página 404 tratada.
- [ ] Markdown renderizado: títulos, listas, links, imagens, citações, tabelas e blocos de código com realce de sintaxe.
- [ ] O HTML gerado a partir do Markdown é **sanitizado** — nenhum script vindo do conteúdo é executado.
- [ ] Exibe data de publicação e **também** a data da última atualização quando esta for diferente.
- [ ] Exibe categoria e tags, com navegação para a listagem filtrada.
- [ ] Legível em mobile: largura de linha confortável, blocos de código com rolagem horizontal própria.

**Story 10 — SEO e compartilhamento**
Como desenvolvedor leitor, quero encontrar o artigo pela busca e vê-lo bem apresentado quando compartilhado, para chegar até ele e confiar nele.

- [ ] Cada artigo publicado tem title, meta description (a partir do resumo), URL canônica e Open Graph / Twitter Card com a imagem de capa.
- [ ] Sitemap e `robots.txt` gerados, cobrindo apenas conteúdo público.
- [ ] Rotas administrativas e conteúdo não publicado ficam fora da indexação.

### Épico 3 — Autenticação e segurança administrativa

**Story 11 — Login administrativo**
Como administrador, quero entrar com credenciais próprias, para gerenciar o conteúdo com segurança.

- [ ] `POST /api/v1/auth/login` valida usuário e senha e retorna Access Token e Refresh Token.
- [ ] A senha é comparada contra **hash seguro** armazenado no banco; senha em texto puro nunca é persistida nem registrada em log.
- [ ] Credenciais inválidas retornam erro genérico, sem revelar se o usuário existe.
- [ ] Tentativas de login são limitadas por rate limiting.
- [ ] A credencial inicial do administrador é provisionada a partir de **variável de ambiente**, com hash gerado no provisionamento.

**Story 12 — Sessão, renovação e logout**
Como administrador, quero manter a sessão sem reautenticar o tempo todo e encerrá-la quando quiser, para trabalhar com conforto e segurança.

- [ ] `POST /api/v1/auth/refresh` emite novo Access Token mediante Refresh Token válido.
- [ ] `POST /api/v1/auth/logout` invalida a sessão / Refresh Token corrente.
- [ ] A invalidação do Refresh Token é **persistida no banco** — não pode depender de estado em memória do processo, que não existe em deploy serverless (Seção 7, restrições).
- [ ] Access Token expirado em rota protegida retorna 401; Refresh Token inválido ou expirado retorna 401 e força novo login.
- [ ] 🔵 Questão em aberto (#4): tempos de expiração, estratégia de rotação e armazenamento do Refresh Token (cookie httpOnly vs. memória) — decisão da arquitetura.

**Story 13 — Proteção das rotas administrativas**
Como administrador, quero que nenhuma operação de gestão seja acessível sem autenticação, para que o conteúdo não seja adulterado.

- [ ] Toda rota de escrita (posts, categorias, tags) exige Access Token válido; sem token, retorna 401.
- [ ] As páginas do painel administrativo não são acessíveis sem sessão válida.
- [ ] CORS restringe as origens permitidas às do próprio produto.
- [ ] Rate limiting ativo na API pública e na administrativa, com **contador em store compartilhado** — contagem em memória é inválida em deploy serverless, onde cada invocação pode ocorrer em outra instância.
- [ ] O rate limiting é verificado com duas requisições simultâneas em instâncias distintas, não apenas em execução local — o teste ingênuo passa mesmo com a implementação errada.
- [ ] Nenhum segredo (chave JWT, string de conexão) chega ao bundle do frontend.

### Épico 4 — CMS: gestão de conteúdo

**Story 14 — Listar posts no painel**
Como administrador, quero ver todos os meus posts com status, para saber o que está no ar e o que está pendente.

- [ ] Lista os posts em rascunho e publicados, com título, status, categoria, data de publicação e data de atualização.
- [ ] Posts no estado `lixeira` **não** aparecem na listagem padrão; têm visão própria (Story 17).
- [ ] Filtro por status e busca por título.
- [ ] Ações de editar e de enviar para a lixeira acessíveis a partir da listagem.

**Story 15 — Criar post com editor e preview**
Como administrador, quero escrever em Markdown e ver como ficará antes de publicar, para publicar com confiança.

- [ ] Formulário com os campos mínimos: título, slug, resumo, conteúdo, imagem de capa, categoria, tags, status.
- [ ] Slug gerado automaticamente a partir do título, editável, e **único** — colisão é bloqueada com mensagem clara.
- [ ] Editor aceita Markdown, com experiência de edição adequada a conteúdo técnico.
- [ ] Preview disponível em modo **Editor / Preview / Split View**.
- [ ] **A renderização do preview usa o mesmo componente da página pública do artigo** — o que se vê é o que se publica.
- [ ] Validação de campos obrigatórios com Zod, mesmo contrato no cliente e no servidor; erros exibidos por campo.
- [ ] É possível salvar como rascunho sem publicar; rascunho não aparece no site público.

**Story 16 — Editar post, inclusive publicado**
Como administrador, quero corrigir e evoluir um artigo já publicado, para manter o conteúdo correto sem republicar do zero.

- [ ] Todos os campos são editáveis após a publicação.
- [ ] Ao salvar, a data de última atualização é registrada.
- [ ] A data de publicação original é preservada.
- [ ] Alterar o slug de um post publicado exige confirmação explícita.
- [ ] **O slug antigo passa a redirecionar (301) para o novo** (Questão #17, resolvida) — links já compartilhados e resultados de busca indexados não quebram.
- [ ] O histórico de slugs é persistido; um slug já usado por qualquer post não pode ser reaproveitado por outro.
- [ ] É possível despublicar um artigo (voltar a rascunho), retirando-o do site público.

**Story 17 — Enviar post para a lixeira e excluir definitivamente**
Como administrador, quero mover um artigo para a lixeira e, quando tiver certeza, apagá-lo de vez, para tirar do ar conteúdo que não deve mais existir sem perder nada por engano.

**Decisão (Questão #6, resolvida):** exclusão em **duas etapas**, sem soft delete persistente. A lixeira é um **estado do post** (`lixeira`), reversível; a exclusão definitiva **remove o registro fisicamente do banco**.

- [ ] "Excluir" na listagem move o post para o estado `lixeira` — ele sai do site público imediatamente (404 tratado) e deixa de aparecer na listagem padrão do painel.
- [ ] Existe uma visão de **Lixeira** no painel, listando os posts nesse estado.
- [ ] A partir da lixeira é possível **restaurar** o post ao estado anterior (rascunho ou publicado).
- [ ] A partir da lixeira é possível **excluir definitivamente**, com confirmação explícita que declara a irreversibilidade.
- [ ] A exclusão definitiva **apaga o registro do banco**, junto com suas versões (`PostVersion`) e seu histórico de slugs.
- [ ] Nenhuma consulta pública ou administrativa padrão precisa filtrar registros "excluídos" — depois da exclusão definitiva eles não existem.

> **Consequência assumida (⚠️ ler antes de implementar):** exclusão física é irreversível e leva junto o histórico de versões e os redirecionamentos de slug daquele post (Stories 16 e 19). Se o artigo estiver indexado, as URLs antigas passam a retornar 404 permanentemente, sem redirecionar. Isso é aceitável para conteúdo que realmente não deve existir; **para conteúdo que apenas saiu do ar, o caminho correto é despublicar (Story 16), não excluir.** A confirmação de exclusão definitiva deve deixar essa diferença explícita para o administrador.

**Story 18 — Categorias e tags**
Como administrador, quero gerenciar categorias e tags, para organizar o conteúdo e alimentar os filtros públicos.

- [ ] CRUD de categorias e de tags (listar, criar, editar, excluir).
- [ ] Um post tem uma categoria e zero ou mais tags.
- [ ] Excluir categoria ou tag em uso é impedido ou tratado explicitamente, sem deixar post órfão.
- [ ] Nomes duplicados são rejeitados.

### Épico 5 — Versionamento de artigos

**Story 19 — Registro de versões**
Como administrador, quero que cada alteração relevante após a publicação gere uma versão, para ter histórico do conteúdo.

- [ ] Ao publicar e a cada alteração relevante posterior, uma versão do conteúdo é persistida (entidade `PostVersion`).
- [ ] Cada versão guarda o conteúdo, o identificador da versão e a data.
- [ ] O post referencia sua versão atual.
- [ ] O modelo é preparado para, no futuro, comparar versões e restaurar uma anterior — **sem** que essas telas façam parte desta entrega (ver Seção 8).

**Decisão (Questão #8, resolvida): o que gera uma nova versão.**

- [ ] Gera nova versão qualquer alteração no **conteúdo textual do artigo**: o corpo (Markdown), o resumo/descrição e o título do assunto.
- [ ] **Não** geram nova versão as alterações apenas de metadados: categoria, tags, imagem de capa, slug, status ou data de publicação. Elas atualizam a data de última atualização, mas não versionam.
- [ ] Salvar sem alterar nenhum campo de conteúdo não cria versão duplicada — a comparação é sobre o valor, não sobre a ação de salvar.
- [ ] A regra vale apenas **após a primeira publicação**; edições de rascunho não versionam.

**Story 20 — Sinalização pública de atualização**
Como desenvolvedor leitor, quero saber quando o artigo foi atualizado pela última vez, para confiar na atualidade do conteúdo.

- [ ] Quando publicação e última atualização coincidem, apenas a data de publicação é exibida.
- [ ] Quando são diferentes, ambas são exibidas com rótulo claro ("Publicado em … · Atualizado em …").
- [ ] A data de atualização também é refletida nos metadados de SEO do artigo.

### Épico 6 — Internacionalização e tema

**Story 21 — Site bilíngue (pt-BR / en)**
Como avaliador ou contratante de fora do Brasil, quero ler o portfólio em inglês, para conseguir avaliar o profissional sem barreira de idioma.

**Decisão (Questão #14, resolvida):** i18n entra nesta versão, com **pt-BR (padrão) e en**.

- [ ] Toda a superfície pública está disponível em pt-BR e en: navegação, rótulos, estados vazios, mensagens de erro e o conteúdo do portfólio (Sobre, Habilidades, Conhecimentos, Experiências, Projetos, Contato, Como foi construído).
- [ ] O idioma é refletido na URL (prefixo de locale), tornando cada versão indexável e compartilhável de forma independente.
- [ ] Há seletor de idioma visível; a escolha do visitante persiste entre visitas.
- [ ] Na primeira visita, o idioma é sugerido pela preferência do navegador, com pt-BR como padrão — **sem redirecionamento forçado** que impeça o acesso à outra versão.
- [ ] Cada página emite `hreflang` para os dois locales e URL canônica por locale; o sitemap cobre ambos.
- [ ] **Artigos do blog têm idioma próprio.** Um artigo pode existir em um idioma, no outro, ou nos dois; quando existe nos dois, as versões se referenciam mutuamente para `hreflang`.
- [ ] A listagem do blog no locale ativo mostra os artigos daquele idioma. Quando um artigo existe apenas no outro idioma, ele é exibido com indicação explícita ("disponível apenas em português"), em vez de sumir silenciosamente.
- [ ] **O painel administrativo permanece apenas em pt-BR** — há um único administrador; traduzi-lo é custo sem retorno.
- [ ] Datas, e não apenas textos, são formatadas conforme o locale.
- [ ] Nenhum texto de interface fica embutido no código de forma não traduzível.

> 🔵 **Questão em aberto (#20):** a **obrigatoriedade de tradução dos artigos** não está decidida. Este PRD assume o modelo mais barato — *artigo por idioma, com fallback explícito, sem obrigação de traduzir todos*. A alternativa (todo artigo publicado nos dois idiomas) dobra o custo de conteúdo, que já é o gargalo mais provável do projeto (Seção 9). **Recomendação: manter o fallback.** O conteúdo do portfólio, esse sim, deve estar completo nos dois idiomas — é o que o avaliador internacional lê.

**Story 22 — Tema claro e escuro**
Como visitante, quero alternar entre tema claro e escuro, para ler com conforto no ambiente em que estou.

**Decisão (Questão #15, resolvida):** o tema escuro entra nesta versão.

- [ ] Alternância entre claro, escuro e "seguir o sistema"; a preferência persiste entre visitas.
- [ ] Sem alternância explícita, o tema segue `prefers-color-scheme`.
- [ ] **Não há flash de tema incorreto no carregamento** (nem claro piscando antes do escuro).
- [ ] Contraste em conformidade com WCAG AA nos **dois** temas — não apenas no claro.
- [ ] O realce de sintaxe dos blocos de código é legível nos dois temas.
- [ ] Imagens de capa e diagramas permanecem legíveis nos dois temas, ou recebem tratamento (fundo, borda) que os torne legíveis.

### Requisitos não funcionais

Direcionadores herdados do documento de referência, tratados como critérios de aceite transversais:

- **Tipagem:** TypeScript em todo o código, sem `any` implícito em domínio e casos de uso.
- **Separação de responsabilidades:** domínio e casos de uso sem dependência de Fastify, Drizzle ou HTTP; infraestrutura acessada por ports.
- **API documentada e validada:** OpenAPI/Swagger gerado; validação de entrada e saída com Zod; client do frontend gerado com Orval a partir do contrato.
- **Tratamento de erros:** formato de erro consistente em toda a API (código, mensagem, detalhes de validação), sem vazar stack trace nem detalhe de infraestrutura.
- **Segurança:** JWT com Access + Refresh Token; hash seguro de senha; CORS restrito; rate limiting; segredos apenas em variáveis de ambiente.
- **Experiência de leitura:** tipografia, espaçamento e realce de código adequados a artigo técnico longo.
- **Responsividade:** de 320px a telas largas.
- **SEO e acessibilidade:** metadados por página **e por locale**, sitemap com `hreflang`, HTML semântico, contraste AA nos dois temas e navegação por teclado nas páginas públicas.
- **Internacionalização:** nenhuma string de interface embutida no código; conteúdo do portfólio completo em pt-BR e en; layout que tolera variação de comprimento de texto entre idiomas.
- **Testabilidade:** casos de uso testáveis sem banco e sem servidor HTTP.
- **Manutenibilidade:** padrões de lint e formatação aplicados (`eslint-plugin-simple-import-sort`, `prettier-plugin-tailwindcss`, `eslint-config-prettier`).

### Restrições e casos de borda

**Restrições técnicas**

- Stack fechada por decisão de produto (§17 do documento de referência): Next.js + TypeScript + Tailwind + shadcn/ui; Node.js + Fastify; REST + OpenAPI; PostgreSQL/Neon + Drizzle; Zod; Orval; Arquitetura Hexagonal; JWT; Vercel; domínio `davidev.net.br`.
- **Decisão (Questão #1, resolvida): o backend Fastify roda como função serverless na Vercel**, no mesmo projeto do frontend Next.js. Um único provedor, uma única origem.
  - *Por que não Node "puro" nem Render:* a Vercel não hospeda **processo de longa duração**, e isso independe do framework — Fastify, Express ou `http.createServer` esbarram no mesmo limite. O que muda é o formato de deploy, não a biblioteca. Manter o Fastify preserva `@fastify/swagger`, que é pré-requisito da geração de client com Orval (requisito não funcional) e da decisão registrada no PDF §17.
  - **Origem única** — o CORS continua sendo configurado, mas deixa de ser um problema de arquitetura distribuída (Story 13).
  - **Cold start de função (~centenas de ms)**, não de serviço hibernando. A métrica de guarda de performance (Seção 6) deixa de estar sob risco estrutural.
  - **Consequência principal: não há estado em memória entre invocações.** Cada requisição pode cair em outra instância. Isso atinge diretamente:
    - **Rate limiting (Story 13)** — contador em memória não funciona; exige store compartilhado. 🔶 Premissa: no volume esperado de um portfólio, **o próprio PostgreSQL serve como store** — Redis só se justifica se houver abuso real. Não introduzir um terceiro provedor preventivamente.
    - **Invalidação de Refresh Token no logout (Story 12)** — precisa ser persistida no banco, não guardada em memória. Isso já era a implementação correta; o serverless apenas remove a alternativa preguiçosa.
  - **Acesso ao Neon exige o driver serverless/HTTP**, não pool de conexões TCP tradicional — funções serverless esgotam o limite de conexões do Postgres. Detalhe a fechar na arquitetura (Questão #21).
  - Variáveis de ambiente e segredos ficam num provedor só; a credencial inicial do admin (Story 11) é provisionada na Vercel.
- 🔵 **Questão em aberto (#5):** onde ficam as imagens de capa e a foto — repositório, Vercel Blob, S3/R2 ou serviço de imagem? Impacta a Story 15.

**Casos de borda**

- Post publicado sem imagem de capa — listagem e Open Graph precisam de fallback definido.
- Slug duplicado, ou slug alterado após indexação pelo buscador (link quebrado).
- Markdown malformado ou com HTML embutido malicioso — sanitização obrigatória (Story 9).
- Artigo muito longo — performance de renderização e de preview em tempo real.
- Categoria ou tag excluída enquanto há posts associados.
- Refresh Token expirado durante a edição de um post — não pode causar perda do texto em edição.
- Dois logins simultâneos do mesmo administrador (duas máquinas) — comportamento do refresh precisa estar definido.
- Blog sem nenhum artigo publicado (estado inicial) — o estado vazio precisa ser tratado com dignidade, não uma lista em branco.
- Visitante em `/en` acessando um artigo que só existe em pt-BR — precisa de tratamento explícito, não 404 (Story 21).
- Locale inexistente na URL (`/fr/...`) — redirecionar para o padrão, sem erro.
- Post excluído definitivamente cujo slug estava indexado — passa a 404 permanente, sem redirect (Story 17).
- Restaurar da lixeira um post cujo slug foi assumido por outro post nesse intervalo.
- Primeira requisição após inatividade prolongada (cold start da função + despertar do Neon) — a página não pode parecer quebrada enquanto o backend responde.
- Duas requisições concorrentes atendidas por instâncias serverless distintas — rate limiting e contadores precisam continuar corretos (Story 13).
- Pico de requisições simultâneas esgotando o limite de conexões do Postgres.

***

## 8. Fora de Escopo

### Não incluído nesta entrega

- **Múltiplos usuários, papéis e permissões** — há um único administrador. Modelar RBAC agora é complexidade sem demanda.
- **Telas de comparação (diff) e restauração de versões** — o *modelo de dados* deve suportar (Story 19), mas as telas não entram. Sem histórico acumulado, a interface não teria o que mostrar.
- **Gerenciamento via painel das demais informações do portfólio** (projetos, experiências, habilidades, conhecimentos) — nesta entrega esse conteúdo é estático e versionado em código. O CMS cobre apenas o blog, que é o conteúdo com cadência real de mudança.
- **Comentários nos artigos** — exigem moderação e antispam; a interação pode acontecer nos canais profissionais existentes.
- **Newsletter e captura de e-mail** — sem audiência ainda; construir o canal antes do público é otimização prematura.
- **Busca full-text no blog** — com poucos artigos, filtro por categoria e tag é suficiente.
- **Tradução obrigatória de todos os artigos do blog** — o portfólio é bilíngue (Story 21), mas cada artigo pode existir em um idioma só, com indicação explícita. Traduzir tudo dobra o custo de conteúdo, que já é o gargalo do projeto.
- **Idiomas além de pt-BR e en** — dois locales cobrem o alcance pretendido; um terceiro multiplica o custo sem demanda identificada.
- **Analytics de produto avançado** (funil, heatmap, gravação de sessão) — as métricas da Seção 6 serão medidas com Plausible, que é intencionalmente simples.
- **Upload rico de mídia no editor** (galeria, crop, otimização) — imagem de capa por URL ou upload simples nesta versão.
- **CI/CD, observabilidade, alertas e estratégia de deploy** — pertencem ao Documento de Arquitetura, não a este PRD.

### Consideração futura

- Restauração e comparação de versões (o modelo já nasce preparado).
- Migração de projetos, experiências e habilidades para o CMS, quando a frequência de mudança justificar — nesse momento o conteúdo bilíngue também passa a ser gerenciado pelo painel.
- Tradução sistemática dos artigos, caso a audiência internacional do blog se confirme nos dados do Plausible.
- Busca full-text e newsletter, condicionadas a audiência real.

***

## 9. Dependências e Riscos

### Dependências

- **Técnicas:** conta e projeto **Neon** (PostgreSQL) provisionados, com **driver serverless/HTTP**; conta na **Vercel** hospedando frontend e backend no mesmo projeto; runtime Node.js compatível.
- **Externas:** registro e configuração DNS do domínio **davidev.net.br**; conta **Plausible Analytics**; provedor de **e-mail transacional** e provedor de **captcha** (Story 6); provedor de armazenamento de imagens (Story 15).
- **De design:** o **artifact de design** (Claude Code / skill `impeccable`) é pré-requisito da Fase 2 e precisa contemplar os dois temas e a estrutura bilíngue.
- **De processo:** este PRD é insumo obrigatório do **Documento de Arquitetura**, que precisa fechar modelo de dados (agora incluindo locale de artigo, histórico de slug e estado de lixeira), contrato completo da API, política de tokens, armazenamento de imagens, sanitização de Markdown e estratégia de testes **antes** do início da Fase 1.
- **De conteúdo:** **a matéria-prima vem do LinkedIn (trajetória, experiências, habilidades) e do GitHub (projetos e detalhe técnico)** — decisão registrada. Isso reduz o risco de partir da folha em branco, mas **não elimina o trabalho de conteúdo**: ver a ressalva abaixo e o risco correspondente na Seção 9. Continuam necessários para o lançamento: a foto profissional, ao menos 3 artigos iniciais e a **versão em inglês do conteúdo do portfólio**.

> ⚠️ **Ressalva sobre a origem do conteúdo.** LinkedIn e GitHub são as fontes exatas que a Seção 2 identifica como insuficientes: o LinkedIn é declarativo (lista de tecnologias e cargos) e os repositórios raramente explicam o problema resolvido. **Copiar esse material verbatim reproduz o problema que o produto existe para resolver.** As fontes entram como *matéria-prima*, não como conteúdo final. O trabalho obrigatório de transformação é:
> - Habilidades → reescritas no formato **contexto de uso** (Story 3), não lista.
> - Experiências → responsabilidades reescritas como **o que foi resolvido**, não atribuições de cargo (Story 4).
> - Projetos → cada um ganha **problema de negócio e resultado**, que o README do GitHub normalmente não tem (Story 5).
> - Tudo → versão em inglês (Story 21).

### Riscos e mitigações

**Risco de viabilidade — abandono no meio do caminho.** O projeto é ambicioso para um único desenvolvedor em tempo parcial, e um repositório público inacabado produz o sinal oposto ao pretendido.
- *Mitigação:* seguir o roadmap por fases entregando valor navegável a cada uma; **publicar o domínio somente ao fim da Fase 2** (portfólio completo, ainda sem blog), de modo que exista um produto apresentável mesmo se as fases seguintes atrasarem. Gatilho: 60 dias sem avanço visível dispara reavaliação de escopo.

**Risco de valor — o avaliador não chega à evidência.** Rafael pode entrar, ver a home e sair sem abrir Projetos ou "Como foi construído", que é onde está a prova.
- *Mitigação:* dar a essas duas páginas presença de primeira classe na home e na navegação; medir pela métrica primária (Seção 6) e, se ficar abaixo de 30% em 30 dias, revisar a hierarquia da home antes de qualquer nova funcionalidade.

**Risco de correção — estado em memória em ambiente serverless.** *(Substitui o risco de hospedagem, resolvido na Questão #1.)* Com o Fastify rodando como função na Vercel, não há processo persistente entre requisições. Rate limiting (Story 13), invalidação de token (Story 12) e qualquer cache local em memória **funcionam em desenvolvimento e falham em produção sem erro visível** — o contador simplesmente zera, e a proteção some sem ninguém perceber.
- *Mitigação:* tratar isso como restrição de arquitetura declarada, não como detalhe de implementação — nenhum estado compartilhado em memória. Store no PostgreSQL enquanto o volume permitir (Seção 7). Critério de aceite explícito na Story 13 exigindo verificação **entre instâncias**, não em execução local. Este é o tipo de falha que passa por todos os testes e só aparece quando alguém abusa do formulário de contato.

**Risco de conexão — esgotamento do pool do Postgres.** Funções serverless abrem conexão por invocação; o Postgres tem limite baixo. Sob qualquer pico, as requisições passam a falhar por indisponibilidade de conexão, não por erro de código.
- *Mitigação:* usar o driver serverless/HTTP do Neon desde a Fase 1, não como otimização posterior (Questão #21). Trocar isso depois significa revisitar toda a camada de persistência.

**Risco residual de performance — cold start do Neon.** O banco em plano gratuito ainda hiberna, mesmo com o backend na Vercel.
- *Mitigação:* servir o blog público por ISR, de modo que a leitura de artigos não dependa do banco em tempo de requisição — a maior parte do tráfego público deixa de tocar o Neon. Resta o formulário de contato, cujo custo de um despertar ocasional é aceitável.

**Risco de custo de conteúdo — i18n dobra o gargalo já identificado.** O conteúdo do portfólio agora precisa existir em dois idiomas, e o gargalo do projeto nunca foi código: era texto.
- *Mitigação:* escrever primeiro em pt-BR e traduzir como etapa explícita da Fase 2, com o inglês como critério de saída da fase — não como "depois eu faço". Manter os artigos do blog fora da obrigação de tradução (Questão #20). Se o inglês não estiver pronto ao fim da Fase 2, lançar apenas em pt-BR e tratar o `en` como fase própria, em vez de atrasar o lançamento inteiro.

**Risco de qualidade — revisor único.** O autor é o único revisor deste PRD e do código (Questão #19). Não há quem discorde das premissas nem quem pegue o ponto cego.
- *Mitigação:* as conversas de validação da premissa #1 (autoavaliação) funcionam como revisão externa da parte de produto; para o código, usar revisão automatizada (`/code-review`, `security-review`) como substituto parcial e declarado — substituto parcial, não equivalente.

**Risco de escopo — o CMS cresce e engole o portfólio.** Versionamento, editor e preview são as partes tecnicamente mais sedutoras e podem consumir o tempo que deveria ir para o conteúdo.
- *Mitigação:* a Seção 8 é vinculante; diff e restore ficam fora; o editor entrega Markdown e preview, e para aí.

**Risco de segurança — área administrativa exposta.** Um portfólio de engenheiro com falha de autenticação é um autogol público.
- *Mitigação:* segurança tratada como fase própria do roadmap (Fase 6) com critérios de aceite explícitos (Épico 3); rodar a revisão de segurança sobre o diff antes do deploy da Fase 8; nenhum segredo fora de variável de ambiente.

**Risco de usabilidade — preview divergente da página pública.** Se o preview não refletir o artigo real, a confiança no editor cai e o CMS deixa de ser usado.
- *Mitigação:* critério de aceite explícito na Story 15 — mesmo componente de renderização nas duas superfícies. Não é detalhe de implementação, é requisito.

**Risco de conteúdo — o portfólio vira um espelho do LinkedIn.** A matéria-prima vem do LinkedIn e do GitHub (Seção 9, Dependências). O caminho de menor esforço é copiar e colar — e o resultado seria um portfólio bonito dizendo exatamente o que o LinkedIn já dizia, o que anula a tese da Seção 2 e desperdiça toda a engenharia.
- *Mitigação:* tratar a transformação do conteúdo como entregável explícito da Fase 2, com critério de saída verificável: **nenhuma habilidade sem contexto de uso, nenhum projeto sem problema e resultado.** Teste simples antes de publicar: se um parágrafo puder ser colado no LinkedIn sem parecer estranho, ele ainda não está pronto.

**Risco de conteúdo — o blog nasce vazio e continua vazio.** Um CMS impecável sem artigos é a pior evidência possível.
- *Mitigação:* 3 artigos escritos antes do lançamento (Fase 8) como critério de saída; o primeiro pode ser o próprio case study "Como foi construído".

**Risco de exposição — o case study vaza informação sensível.** A página descreve o processo real, incluindo prompts, decisões e ferramentas.
- *Mitigação:* critério de aceite na Story 7; revisão de conteúdo antes de cada publicação do case study, com atenção a credenciais, dados de empregadores e informação de terceiros.

***

## 10. Questões em Aberto

### Resolvidas na v0.2

| # | Questão | Decisão | Impacto no documento |
|---|---|---|---|
| 1 | Onde o backend Fastify será hospedado? | **Fastify como função serverless na Vercel**, mesmo projeto do frontend. Node "puro" não muda o problema — a Vercel não hospeda processo de longa duração, seja qual for o framework | Seção 7 (restrições), Stories 12 e 13, Seção 9 (riscos de estado em memória e de pool de conexões). Desbloqueia a Fase 1 |
| 6 | Política de exclusão e recuperação | **Lixeira como estado reversível + exclusão definitiva física do banco.** Sem soft delete persistente | Story 17 reescrita; Story 14 ajustada |
| 8 | O que caracteriza "alteração relevante" para versionar? | **Mudança no conteúdo textual** (corpo, resumo/descrição, título do assunto). Metadados não versionam | Story 19 |
| 11 | Ferramenta de analytics | **Plausible Analytics** | Seção 6 — dispensa banner de cookies; exige metas customizadas |
| 12 | Como o design será definido? | **Artifact gerado no Claude Code / skill `impeccable`** — sem Figma | Seção 5; vira pré-requisito da Fase 2 |
| 13 | Público-alvo | **Contratação CLT/PJ e freelance** | Nova persona (Marcos); Story 5 ganha desfecho de negócio |
| 14 | Atender oportunidades internacionais? | **Sim — i18n pt-BR / en entra nesta versão** | Novo Épico 6 / Story 21; sai do Fora de Escopo; novo risco de conteúdo |
| 15 | Modo escuro nesta versão? | **Sim** | Novo Épico 6 / Story 22 |
| 16 | Destino da mensagem de contato e captcha | **Banco e e-mail** (banco é a fonte de verdade); **captcha obrigatório** | Story 6 |
| 17 | Redirecionar slug antigo? | **Sim — redirect 301 e histórico de slugs** | Story 16; afeta o modelo de dados |
| 18 | Nível de proficiência nas Habilidades? | **Não — apenas contexto de uso** | Story 3 |
| 19 | Haverá revisor externo? | **Não — o autor é o único revisor** | Informações do Documento; novo risco na Seção 9 |

### Em aberto

| # | Questão | Origem | Responsável | Prazo | Status |
|---|---|---|---|---|---|
| 2 | Modelo definitivo do banco: entidades, cardinalidades, índices, constraints e migrações — agora incluindo **locale do artigo, histórico de slugs e estado de lixeira** | PDF §18 | Arquitetura | Antes da Fase 1 | Aberta |
| 3 | Contrato completo da API (schemas, códigos de erro, paginação, parâmetro de locale) | PDF §18 | Arquitetura | Antes da Fase 3 | Aberta |
| 4 | Política de expiração, rotação e armazenamento dos tokens. Origem única simplifica o cookie httpOnly; a invalidação precisa ser persistida no banco | PDF §18 / Story 12 | Arquitetura | Antes da Fase 6 | Aberta |
| 5 | Estratégia de armazenamento de imagens (capa e foto) | PDF §18 / Story 15 | Arquitetura | Antes da Fase 4 | Aberta |
| 7 | Estratégia de renderização e sanitização do Markdown (biblioteca, plugins, política) | PDF §18 / Story 9 | Arquitetura | Antes da Fase 3 | Aberta |
| 9 | Estratégia completa de testes (unidade, integração, e2e; metas de cobertura) | PDF §18 | Arquitetura | Antes da Fase 7 | Aberta |
| 10 | Detalhamento de deploy, CI/CD e operação — agora em **dois provedores** | PDF §18 | Arquitetura | Antes da Fase 8 | Aberta |
| 20 | Artigos do blog: traduzir todos, ou publicar por idioma com fallback explícito? *(Este PRD assume o fallback; recomendação: manter)* | Story 21 | Davi | Antes da Fase 3 | Aberta |
| 21 | Estratégia de acesso ao Neon a partir de funções serverless (driver HTTP vs. pooler) e uso de ISR no blog para não tocar o banco a cada leitura | Seção 7 / Seção 9 | Arquitetura | Antes da Fase 1 | Aberta — **alto impacto** |
| 22 | Provedores de captcha e de e-mail transacional *(recomendação: Cloudflare Turnstile)* | Story 6 | Arquitetura | Antes da Fase 2 | Aberta |
| 23 | Store do rate limiting: PostgreSQL ou Redis? *(Recomendação: PostgreSQL enquanto o volume permitir — não adicionar provedor preventivamente)* | Story 13 | Arquitetura | Antes da Fase 6 | Aberta |
| 24 | Existe meta concreta de retorno (cargo, faixa, volume de freelance) para medir o desfecho? | Seção 4 | Davi | — | Aberta |
| 25 | Projetos: carga manual única a partir do GitHub, ou **integração viva com a API do GitHub**? *(Recomendação: carga manual agora. A integração viva é boa evidência técnica, mas os repositórios não carregam o problema de negócio que a Story 5 exige — ela complementaria, não substituiria, o texto escrito à mão.)* | Seção 9 | Davi | Antes da Fase 2 | Aberta |

***

## Roadmap conceitual (referência de sequenciamento)

Herdado do documento de referência; mantido aqui como contexto de entrega, não como cronograma comprometido.

| Fase | Objetivo | Épicos / Stories |
|---|---|---|
| 1. Fundação | Estrutura do projeto, padrões, arquitetura e configuração base; **infraestrutura de i18n e de tema desde o início** | Pré-requisito de todos; base das S21–S22 |
| 2. Portfólio | Home, Sobre, Habilidades, Conhecimentos, Experiências, Projetos, Contato; **conteúdo em pt-BR e en; tema claro/escuro** | Épico 1 (S1–S6) + Épico 6 (S21–S22) |
| 3. Blog | API, banco, listagem e leitura de artigos, com locale por artigo | Épico 2 (S8–S10) |
| 4. Administração | Login, CRUD, editor, Markdown e preview | Épicos 3 e 4 (S11–S18) |
| 5. Versionamento | Histórico e identificação de versões | Épico 5 (S19–S20) |
| 6. Segurança | JWT, access/refresh, CORS, rate limiting | Épico 3 (endurecimento) |
| 7. Qualidade | Testes, validações e refinamento | Requisitos não funcionais |
| 8. Publicação | Deploy na Vercel e configuração do domínio | — |
| 9. Case study | Documentação pública do processo com IA | Story 7 |

> **Observação de sequenciamento (1):** a Story 7 ("Como foi construído") aparece na Fase 9, mas é a evidência central da hipótese do épico. Recomenda-se publicar uma versão inicial dela já na Fase 2 e evoluí-la a cada fase — o case study é subproduto do trabalho, não um relatório escrito no fim.
>
> **Observação de sequenciamento (2) — i18n e tema não são fase:** ambos entram na versão (Épico 6), mas **não podem ser uma fase posterior**. i18n retrofitado exige revisitar cada string e cada rota; tema escuro retrofitado exige revisitar cada cor. A infraestrutura dos dois vai para a **Fase 1**, e o conteúdo traduzido é **critério de saída da Fase 2**. É por isso que eles não aparecem como fase própria na tabela acima.

***

## Autoavaliação do PRD

### Seção mais forte

**Seção 7 — Histórias de Usuário e Requisitos.** O escopo funcional veio detalhado e já decidido no documento de referência; as histórias e critérios de aceite são derivação direta, não invenção. É a parte do PRD pronta para virar especificação e tasks.

### Seção mais fraca

**Seção 6 — Métricas de Sucesso.** Não existe baseline para nada, os alvos foram arbitrados e o desfecho pretendido (melhores oportunidades profissionais) é de atribuição difícil e amostra pequena. Em seguida, a **Seção 2**: o problema é plausível e reconhecível, mas sustentado por observação do autor, sem uma única entrevista ou dado. Este é um PRD honestamente derivado de um documento de decisões técnicas — a parte de produto é a que carece de validação.

### Principais premissas a validar

| # | Premissa | Seção | Risco se estiver errada | Validação proposta |
|---|---|---|---|---|
| 1 | Avaliadores técnicos consomem material demonstrativo de portfólio antes da entrevista | 2, 3 | O produto inteiro é construído para um comportamento que não acontece; nenhuma métrica se move | Conversar com 3–5 tech leads e recrutadores perguntando o que fizeram na última triagem, não o que fariam (estilo Mom Test) |
| 2 | Há demanda internacional real o bastante para justificar o custo de i18n | 3, 4, 8 | Dobra-se o custo de conteúdo — o gargalo já identificado — por um público que não aparece | Publicar em pt-BR e medir origem geográfica no Plausible por 60 dias antes de traduzir os artigos. O portfólio em `en` é barato; traduzir o blog não é |
| 3 | O esforço é sustentável em paralelo à rotina profissional | 4, 9 | Repositório público inacabado; sinal oposto ao pretendido | Time-box das Fases 1 e 2; se não houver algo publicável no domínio ao fim da Fase 2, reduzir o escopo do CMS |
| 4 | O CMS reduz o atrito de publicação a ponto de gerar cadência mensal | 6 | Constrói-se um CMS completo que fica ocioso; o blog nasce e morre vazio | Escrever 3 artigos **antes** da Fase 4, em Markdown puro — se os artigos não existirem, o gargalo é conteúdo, não ferramenta |
| 7 | LinkedIn e GitHub contêm material suficiente para virar conteúdo demonstrativo | 9 | O portfólio reproduz o LinkedIn com CSS melhor, e a tese da Seção 2 se anula sozinha | Pegar **um** projeto e escrever a página completa (problema, resultado, decisões) antes de construir qualquer tela. Se o material não sustentar uma página, não vai sustentar oito |
| 5 | O alvo de 30% de aprofundamento qualificado é realista | 6 | Meta mal calibrada leva a conclusão errada: esforço desperdiçado ou falso sucesso | Medir 30 dias sem meta, estabelecer o baseline real e só então fixar o alvo |
| 6 | O PostgreSQL basta como store de rate limiting no volume esperado | 7, 9 | A proteção contra abuso degrada ou onera o banco, e um terceiro provedor (Redis) entra no projeto tarde | Medir a latência do rate limit em Postgres na Fase 6 e definir o limiar de tráfego a partir do qual o Redis passa a se justificar |

### Próximo passo recomendado

Com as questões de produto resolvidas (v0.2), **este PRD está pronto para alimentar o Documento de Arquitetura**, que deve fechar as questões 2 a 5, 7, 9, 10, 21 e 22.

Duas prioridades para essa etapa, nesta ordem:

1. **Questão #21 — acesso ao Neon a partir de funções serverless.** Com o backend em deploy serverless, a camada de persistência precisa nascer com o driver correto: trocar isso depois significa revisitar todos os adapters. Junto vem a decisão de servir o blog por ISR, que tira a leitura pública do caminho do banco.
2. **Questão #2 — modelo de dados**, que a v0.2 tornou mais exigente: locale por artigo, histórico de slugs para redirect 301, estado de lixeira, exclusão física em cascata sobre `PostVersion` e, agora, persistência de Refresh Token e de contadores de rate limit.

Fora da arquitetura, um passo de produto que continua valendo: **conversar com 3–5 tech leads, recrutadores ou contratantes** para validar a premissa #1 — é a única lacuna que nenhuma decisão técnica resolve.

***

*Fim do PRD — DaviDev v0.2*
