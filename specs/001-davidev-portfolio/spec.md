# Feature Specification: DaviDev Portfolio, Blog & CMS

**Feature ID:** `001-davidev-portfolio`  
**Status:** Clarified & Approved (`/speckit.clarify`)  
**Context:** `docs/prd.md` (v0.3), `docs/architecture.md`, `design/canvas.json`  
**Constitution:** `.specify/memory/constitution.md`  

---

## 1. Visão Geral e Contexto de Produto

O **DaviDev** é um portfólio profissional full-stack com blog de engenharia integrado e painel administrativo (CMS) próprio, construído para demonstrar profundidade de software, maturidade de arquitetura e disciplina de desenvolvimento orientada a especificações para avaliadores técnicos (tech leads, hiring managers), recrutadores e clientes em potencial.

O produto é a própria evidência: não apenas apresenta trajetória, projetos e experiências, mas expõe publicamente o processo completo de engenharia assistida por IA (PRD $\to$ Arquitetura $\to$ Spec Kit $\to$ Tasks $\to$ Implementação com IA $\to$ Testes $\to$ Deploy).

---

## 2. Personas e Cenários de Uso

### 2.1 Personas
*   **Rafael (Persona Primária — Tech Lead / Evaluator):**
    *   *Objetivo:* Avaliar em 2 a 5 minutos a profundidade técnica real do autor (arquitetura, testes, segurança, decisões de design).
    *   *Fluxo Principal:* Acessa a Home $\to$ Navega para "Projetos" e detalhe técnico $\to$ Abre a página "Como foi construído" $\to$ Acessa a documentação interativa da API (`/api/docs`).
*   **Camila (Persona Secundária — Recrutadora Técnica):**
    *   *Objetivo:* Triagem rápida e confiável; encaminhar um link único que funcione perfeitamente no celular para o time de engenharia.
    *   *Fluxo Principal:* Escaneia a Home e o Sobre Mim $\to$ Verifica stack e experiências $\to$ Utiliza o formulário de Contato ou canais sociais.
*   **Marcos (Persona Secundária — Contratante de Projeto Freelance):**
    *   *Objetivo:* Verificar se o desenvolvedor já resolveu problemas reais de negócio com resultados mensuráveis.
    *   *Fluxo Principal:* Lê a descrição de negócio dos Projetos $\to$ Valida escopo e prazo $\to$ Entra em contato via formulário.
*   **Bruno (Persona Secundária — Desenvolvedor Leitor):**
    *   *Objetivo:* Resolver um problema técnico lendo artigos detalhados com tipografia técnica e código destacado.
    *   *Fluxo Principal:* Chega via busca orgânica direto no artigo $\to$ Lê o conteúdo $\to$ Filtra artigos por tag/categoria.
*   **Davi (Persona Operadora — Autor e Único Administrador):**
    *   *Objetivo:* Criar, editar, versionar e gerenciar posts e categorias com atrito mínimo e preview fidedigno.
    *   *Fluxo Principal:* Login com credenciais provisionadas $\to$ Criação de post em Markdown com Split View $\to$ Publicação imediata sem deploy.

---

## 3. Escopo Funcional e Limites

### 3.1 Dentro do Escopo
1.  **Vitrine Pública Bilíngue (`pt-BR` e `en`):**
    *   Home com resumo profissional e destaques;
    *   Sobre Mim com trajetória e foto;
    *   Habilidades com contexto de uso prático (sem porcentagens falsas);
    *   Conhecimentos (fundamentos e conceitos arquiteturais);
    *   Experiências profissionais estruturadas cronologicamente;
    *   Projetos (listagem e página de detalhe com problema de negócio e arquitetura técnica);
    *   Formulário de Contato com validação, Cloudflare Turnstile, persistência em PostgreSQL e notificação Resend;
    *   Página "Como foi construído" (estudo de caso auditável de engenharia assistida por IA);
    *   Página de Política de Privacidade (conformidade LGPD e GDPR).
2.  **Blog Técnico Público:**
    *   Listagem paginada com filtros dinâmicos por categoria e tags refletidos na URL;
    *   Página do artigo por slug com renderização Markdown sanitizada, realce de código sintático e data de publicação / atualização;
    *   Suporte a SEO (OpenGraph, Twitter Cards, Sitemap dinâmico, `hreflang` e canonical URLs);
    *   Redirecionamento automático HTTP 301 para slugs históricos alterados.
3.  **Painel Administrativo (CMS):**
    *   Autenticação JWT (Access Token em memória + Refresh Token em cookie HttpOnly com rotação no banco);
    *   CRUD completo de artigos com status (`rascunho`, `publicado`, `lixeira`);
    *   Editor Markdown avançado com modo Split View e preview com componente idêntico à página pública;
    *   Gestão de Categorias e Tags (nomes e slugs em `pt-BR` e `en`);
    *   Lixeira reversível com exclusão física permanente em cascata;
    *   Histórico e versionamento automático de conteúdo textual (`PostVersion`);
    *   Listagem de mensagens de contato com indicador de notificação.
4.  **Temas e Acessibilidade:**
    *   Alternância suave entre tema claro, escuro e preferência do sistema, sem FOUC;
    *   Conformidade WCAG 2.1 AA comprovada nos dois temas.

### 3.2 Fora de Escopo (Explicit Non-Goals)
*   RBAC ou múltiplos usuários administradores (sistema de administrador único).
*   Interfaces de visualização de diff e restauração de versões de posts (o modelo de dados suporta, mas as telas não entram nesta versão).
*   CMS dinâmico para Habilidades, Experiências e Projetos (são estáticos tipados nesta versão).
*   Comentários em artigos ou captura de newsletter.
*   Busca full-text complexa (filtros por categoria e tags atendem ao volume).
*   Upload rico de mídia/crop (armazenamento de imagem por URL externa ou upload direto de capa).

---

## 4. Requisitos Detalhados e Histórias de Usuário

### Épico 1: Área Pública (Vitrine Institucional)

#### US-01: Visualização da Home
*Como* avaliador técnico ou recrutador,  
*Quero* visualizar uma Home com posicionamento claro, projetos em destaque e artigos recentes,  
*Para que* eu possa entender a proposta de valor do profissional em menos de 30 segundos.
*   **Critérios de Aceite:**
    *   **AC-01.1:** Apresentar nome, papel sênior e síntese profissional em uma frase de alto impacto.
    *   **AC-01.2:** Exibir cards dos 2 projetos de maior relevância e dos 3 artigos mais recentes.
    *   **AC-01.3:** Fornecer links de navegação para todas as seções e seletor de idioma/tema no cabeçalho.
    *   **AC-01.4:** Renderizar sem quebra de layout entre 320px e 1920px.

#### US-02: Sobre Mim, Habilidades e Conhecimentos
*Como* avaliador técnico,  
*Quero* diferenciar competências operacionais de fundamentos conceituais,  
*Para que* eu confirme o nível de senioridade e a amplitude de repertório técnico.
*   **Critérios de Aceite:**
    *   **AC-02.1:** Sobre Mim apresenta foto profissional com `alt` descritivo e texto com trajetória concisa.
    *   **AC-02.2:** Habilidades lista tecnologias acompanhadas obrigatoriamente de **contexto de uso prático real** (ex: *"usado em produção no backend de alta concorrência"*).
    *   **AC-02.3:** Habilidades proíbe qualquer tipo de barra, nota ou percentual de proficiência.
    *   **AC-02.4:** Conhecimentos exibe arquiteturas (Hexagonal, Event-driven), metodologias e paradigmas em página dedicada.

#### US-03: Projetos e Detalhe Técnico de Engenharia
*Como* contratante ou avaliador,  
*Quero* navegar por cases de projetos vendo tanto o impacto de negócio quanto a arquitetura,  
*Para que* eu possa avaliar capacidade de entrega e profundidade técnica.
*   **Critérios de Aceite:**
    *   **AC-03.1:** Listagem exibe título, resumo executivo, stack de tecnologias e links quando públicos.
    *   **AC-03.2:** Página de detalhe estruturada em duas camadas: (1) Problema de negócio e resultado atingido (compreensível para gestores); (2) Desafios de engenharia, decisões de arquitetura e trade-offs técnicos.
    *   **AC-03.3:** Projetos sem repositório aberto indicam explicitamente a restrição de propriedade intelectual, sem links quebrados.

#### US-04: Envio de Mensagem de Contato
*Como* visitante interessado em contratar,  
*Quero* enviar uma mensagem diretamente através do formulário de contato,  
*Para que* eu inicie uma conversa de forma rápida e segura.
*   **Critérios de Aceite:**
    *   **AC-04.1:** Campos validados com Zod: Nome (2-120), E-mail válido (≤254), Assunto opcional (≤160), Mensagem (10-5000), Token de Captcha.
    *   **AC-04.2:** O envio exige token válido do Cloudflare Turnstile. Falha no captcha retorna erro claro sem submeter.
    *   **AC-04.3:** A mensagem é persistida na tabela `contact_message` antes de qualquer envio de e-mail.
    *   **AC-04.4:** Se a persistência no banco falhar, a requisição falha com status 500 informando o usuário.
    *   **AC-04.5:** O envio de notificação por e-mail via Resend é assíncrono (*best-effort*). Se o envio de e-mail falhar, o status retornado continua sendo sucesso (201) e o registro no banco permanece com `email_notified_at = null` para reprocessamento.
    *   **AC-04.6:** Rate limiting estrito de 3 submissões por hora por IP hasheado.

---

### Épico 2: Blog Técnico Público

#### US-05: Listagem e Filtros de Artigos
*Como* desenvolvedor leitor,  
*Quero* filtrar artigos publicados por categoria e tags com URLs compartilháveis,  
*Para que* eu encontre rapidamente tópicos de meu interesse.
*   **Critérios de Aceite:**
    *   **AC-05.1:** Listagem exibe apenas artigos com `status = 'publicado'` no locale ativo. Artigos em rascunho ou lixeira nunca são expostos.
    *   **AC-05.2:** Filtros por `?category=slug` e `?tag=slug` atualizam a listagem e mantêm histórico no navegador.
    *   **AC-05.3:** Artigos exibem título, resumo, capa (se houver), categoria, tags, data de publicação e data de atualização quando aplicável.
    *   **AC-05.4:** Se um artigo só existir no outro locale, ele é apresentado com indicação explicita (*"Disponível apenas em Inglês"*), permitindo a leitura.

#### US-06: Leitura de Artigo e SEO
*Como* leitor,  
*Quero* ler artigos com formatação Markdown impecável e realce de sintaxe de código,  
*Para que* a experiência de estudo seja confortável e acessível.
*   **Critérios de Aceite:**
    *   **AC-06.1:** Rota `/blog/:slug` renderiza Markdown sanitizado (tags HTML maliciosas ou scripts são neutralizados).
    *   **AC-06.2:** Blocos de código possuem realce de sintaxe legível em light e dark mode, com rolagem horizontal em telas pequenas.
    *   **AC-06.3:** Metadados OpenGraph, Twitter Card e JSON-LD de Article preenchidos dinamicamente.
    *   **AC-06.4:** Caso um slug histórico seja acessado, a aplicação responde com redirecionamento HTTP 301 para o slug atual (`BR-004`).

---

### Épico 3: Autenticação e Segurança Administrativa

#### US-07: Login e Ciclo de Vida de Sessão
*Como* administrador do sistema,  
*Quero* autenticar-me com credenciais seguras e manter minha sessão renovada,  
*Para que* eu opere o CMS sem interrupções indesejadas e com proteção máxima.
*   **Critérios de Aceite:**
    *   **AC-07.1:** `POST /api/v1/auth/login` valida credenciais contra hash no banco (`Argon2id` / `bcrypt`). Falha retorna mensagem genérica (*"Credenciais inválidas"*).
    *   **AC-07.2:** Sucesso retorna Access Token JWT de 15 minutos e grava cookie `httpOnly`, `Secure`, `SameSite=Strict` contendo Refresh Token de 7 dias.
    *   **AC-07.3:** `POST /api/v1/auth/refresh` rotaciona o refresh token: invalida o hash do token anterior (`revoked_at = now()`), persiste o novo hash e emite novo par.
    *   **AC-07.4:** `POST /api/v1/auth/logout` revoga o refresh token no banco e limpa o cookie do navegador.
    *   **AC-07.5:** Tentativas de login limitadas a 5 requisições por 15 minutos por IP hasheado.

#### US-08: Proteção de Rotas Administrativas
*Como* administrador,  
*Quero* garantia de que nenhuma rota de escrita ou painel administrativo seja acessível sem token,  
*Para que* nenhum invasor consiga publicar, alterar ou apagar conteúdo.
*   **Critérios de Aceite:**
    *   **AC-08.1:** Todas as rotas sob o prefixo `/api/v1/admin/*` exigem header `Authorization: Bearer <token>` válido; requisições sem token ou com token expirado retornam HTTP 401.
    *   **AC-08.2:** Tentativas de acesso a posts não publicados por requisições anônimas retornam HTTP 404 (nunca 403, para não revelar existência de rascunhos).

---

### Épico 4: Gestão Editorial (CMS)

#### US-09: Criação e Edição de Posts com Split View
*Como* administrador,  
*Quero* escrever em Markdown com visualização instantânea no mesmo componente do site público,  
*Para que* eu tenha certeza de como o artigo será visto pelos leitores antes de publicar.
*   **Critérios de Aceite:**
    *   **AC-09.1:** Editor suporta 3 modos de visualização: Apenas Editor, Apenas Preview, e Split View (lado a lado).
    *   **AC-09.2:** O componente de renderização do preview é rigorosamente o mesmo componente utilizado na rota `/blog/:slug`.
    *   **AC-09.3:** Slug é gerado automaticamente a partir do título com suporte a edição manual e validação regex (`^[a-z0-9]+(-[a-z0-9]+)*$`).
    *   **AC-09.4:** Salvar em rascunho permite campos incompletos; transição para publicado exige título, slug, resumo, conteúdo e categoria (`BR-001`).

#### US-10: Gestão de Slugs e Redirecionamentos
*Como* administrador,  
*Quero* poder corrigir o slug de um artigo publicado sem perder links externos já indexados,  
*Para que* a autoridade de SEO e os compartilhamentos não sejam destruídos.
*   **Critérios de Aceite:**
    *   **AC-10.1:** Alterar o slug de post publicado exige diálogo de confirmação explícito (`BR-004`).
    *   **AC-10.2:** O slug anterior é marcado como `is_current = false` na tabela `post_slug` com timestamp em `replaced_at`.
    *   **AC-10.3:** O novo slug é registrado com `is_current = true`. Tentativa de reutilizar qualquer slug previamente cadastrado é bloqueada (`BR-013`).

#### US-11: Lixeira e Exclusão Definitiva em Cascata
*Como* administrador,  
*Quero* descartar posts com segurança reversível e poder realizar exclusão física quando necessário,  
*Para que* eu não perca conteúdos acidentalmente nem mantenha lixo no banco.
*   **Critérios de Aceite:**
    *   **AC-11.1:** Ação de exclusão na listagem move o post para `status = 'lixeira'`, retirando-o da visão pública imediatamente.
    *   **AC-11.2:** Posts na lixeira podem ser restaurados ao status anterior (`rascunho` ou `publicado`), validando se o slug não foi ocupado (`BR-008`).
    *   **AC-11.3:** Exclusão definitiva física só é permitida a partir da lixeira (`BR-007`) e exige confirmação com aviso de irreversibilidade.
    *   **AC-11.4:** A exclusão física apaga o registro na tabela `post` com deleção em cascata (`CASCADE`) de `post_version`, `post_slug` e vínculos em `post_tag`.

---

### Épico 5: Versionamento Editorial

#### US-12: Histórico e Sinalização de Atualizações
*Como* leitor ou administrador,  
*Quero* saber quando um artigo recebeu atualizações materiais de conteúdo,  
*Para que* eu possa confiar na atualidade e precisão técnica das instruções.
*   **Critérios de Aceite:**
    *   **AC-12.1:** Apenas modificações no corpo textual (título, resumo ou conteúdo Markdown) após a primeira publicação geram nova `PostVersion` (`BR-005`).
    *   **AC-12.2:** Alteração de metadados (tags, categoria, imagem de capa, slug) atualiza `updated_at`, mas não cria nova versão.
    *   **AC-12.3:** Gravações com o mesmo hash SHA-256 de conteúdo não geram versões duplicadas.
    *   **AC-12.4:** A interface pública exibe *"Publicado em DD/MM/AAAA"* e, se houver alteração posterior, acrescenta *"· Atualizado em DD/MM/AAAA"*.

---

### Épico 6: Internacionalização e Temas

#### US-13: Experiência Bilíngue Completa
*Como* recrutador internacional,  
*Quero* navegar pelo portfólio em inglês com URLs e metadados dedicados,  
*Para que* eu avalie o profissional no meu idioma de trabalho.
*   **Critérios de Aceite:**
    *   **AC-13.1:** Superfície pública servida sob rotas `/pt-BR/...` e `/en/...`.
    *   **AC-13.2:** Seletor de idioma persistente em cookie/preferência sem redirecionamento forçado agressivo.
    *   **AC-13.3:** Tags `hreflang` e canonical URLs emitidas para ambas as versões.
    *   **AC-13.4:** Painel administrativo mantido exclusivamente em `pt-BR`.

#### US-14: Tema Claro e Escuro
*Como* leitor noturno,  
*Quero* alternar para o tema escuro sem falhas visuais ou textos ilegíveis,  
*Para que* a leitura de artigos longos não cause fadiga visual.
*   **Critérios de Aceite:**
    *   **AC-14.1:** Alternância entre Claro, Escuro e Sistema.
    *   **AC-14.2:** Script de pré-hidratação no `head` impede qualquer flash de tema incorreto (FOUC).
    *   **AC-14.3:** Taxa de contraste atende rigorosamente WCAG AA (mínimo 4.5:1 para texto normal, 3:1 para títulos grandes) em ambos os modos.

---

## 5. Regras de Negócio Consolidadas (Traceability Matrix)

| Regra ID | Resumo Prescritivo | Entidade / Escopo | Tratamento de Erro |
|---|---|---|---|
| **BR-001** | Publicação exige `title`, `slug`, `excerpt`, `content` e `category_id` preenchidos. | `Post` | HTTP 422 `PUBLISH_REQUIREMENTS_NOT_MET` |
| **BR-002** | `published_at` é registrado na primeira publicação e torna-se imutável. | `Post` | Imutabilidade no Domínio |
| **BR-003** | Slug deve ser único por `locale`. | `PostSlug` | HTTP 409 `SLUG_CONFLICT` |
| **BR-004** | Mudança de slug em post publicado mantém o anterior e emite HTTP 301. | `PostSlug` | Resposta de Redirecionamento 301 |
| **BR-005** | Criação de `PostVersion` ocorre apenas sob alteração textual real pós-publicação. | `PostVersion` | Verificação de `content_hash` |
| **BR-006** | Posts não publicados são estritamente invisíveis em rotas e listagens públicas. | `Post` | HTTP 404 `NOT_FOUND` |
| **BR-007** | Exclusão física definitiva só pode ser invocada para posts com status `lixeira`. | `Post` | HTTP 422 `INVALID_STATE_TRANSITION` |
| **BR-008** | Restauração da lixeira é impedida se o slug tiver sido assumido por outro post. | `Post` | HTTP 409 `SLUG_TAKEN_ON_RESTORE` |
| **BR-009** | Categoria ou tag vinculada a pelo menos um post não pode ser excluída. | `Category` / `Tag` | HTTP 409 `RESOURCE_IN_USE` |
| **BR-010** | Um post aceita no máximo 10 tags associadas. | `Post` | HTTP 422 `TOO_MANY_TAGS` |
| **BR-011** | Um grupo de tradução admite no máximo 1 post por locale. | `Post` | HTTP 409 `TRANSLATION_EXISTS` |
| **BR-012** | Envio de contato exige captcha Turnstile válido. Falha no e-mail não reverte persistência. | `ContactMessage` | HTTP 400 `CAPTCHA_FAILED` |
| **BR-013** | Slugs históricos nunca podem ser reutilizados por novos posts no mesmo locale. | `PostSlug` | HTTP 409 `SLUG_CONFLICT` |

---

## 6. Clarificações e Tratamento de Casos de Borda (`/speckit.clarify`)

1.  **Ambiente Serverless Concorrente:**
    *   *Problema:* Duas requisições simultâneas em instâncias Vercel distintas batendo no limite de rate limit.
    *   *Resolução:* A contagem é feita atomicamente no banco PostgreSQL na tabela `rate_limit_counter` via `INSERT ... ON CONFLICT DO UPDATE SET hits = hits + 1`, eliminando risco de contadores em memória.
2.  **Falha de Provedor de E-mail (Resend):**
    *   *Problema:* Queda do serviço Resend durante o envio de mensagem de contato.
    *   *Resolução:* A transação do banco é comitada primeiro. O envio de e-mail é disparado como evento secundário. Se o e-mail falhar, a mensagem permanece segura no banco e o usuário recebe feedback de sucesso (201). O painel administrativo exibe a mensagem como pendente de notificação (`email_notified_at IS NULL`).
3.  **Redirecionamentos em Cadeia de Slugs:**
    *   *Problema:* Se um slug mudar de `a` para `b` e depois de `b` para `c`, como evitar loops ou múltiplos hops?
    *   *Resolução:* A consulta de slug histórico busca o `post_id` associado ao slug requisitado e busca imediatamente o slug marcado com `is_current = true` para aquele `post_id`, retornando um 301 direto para o slug final (`c`).
4.  **Artigo sem Tradução:**
    *   *Problema:* O leitor está navegando em `/en` e clica em um artigo escrito somente em `pt-BR`.
    *   *Resolução:* Não exibe 404. O artigo é renderizado com um banner no topo informando com elegância que o texto está disponível no idioma original, respeitando a intenção de leitura da persona Bruno.
