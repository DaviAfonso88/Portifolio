# Fidelidade Estrita aos Arquivos de Design (`design/`)

> **Status:** Ativo / Mandatório  
> **Escopo:** Todas as interfaces, telas, páginas e componentes visuais do frontend (`apps/web`)  
> **Fonte da Verdade:** Diretório `design/` na raiz do projeto  

---

## 1. Princípio Fundamental de Design Frontend

Ao construir, refatorar, estilizar ou auditar qualquer página ou componente no frontend (`apps/web`), o agente de IA **DEVE OBRIGATORIAMENTE** inspecionar e seguir os arquivos de design correspondentes localizados na pasta `design/`.

É **estritamente proibido** criar interfaces com layouts improvisados, componentes genéricos ou estética padrão de IA ("AI slop") desprovida da identidade visual do projeto. Toda a implementação visual deve ser um reflexo fiel das especificações concebidas na pasta `design/`.

---

## 2. Mapeamento de Arquivos de Design por Página e Componente

Antes de iniciar o desenvolvimento de qualquer tela, consulte o arquivo `.dc.html` correspondente:

| Tela / Componente no Frontend | Arquivo de Design Obrigatório | Aspectos Essenciais a Reproduzir |
| :--- | :--- | :--- |
| **Tokens & Design System Geral** | `design/Tokens.dc.html`<br>`design/davidev-sistema-de-design.html` | Cores semânticas (`hsl`), tipografia editorial, espaçamentos, raios de borda, sombras e regras de tema Claro/Escuro. |
| **Layout Base, Header & Footer** | `design/Main.dc.html` | Header responsivo, alternador de idioma (`pt-BR`/`en`), toggle de tema e rodapé técnico estilo colofão. |
| **Home (Desktop & Mobile)** | `design/Main.dc.html`<br>`design/MobileHome.dc.html` | Apresentação profissional, frase de impacto, cards de projetos em destaque e artigos recentes. |
| **Sobre Mim** | `design/Sobre.dc.html` | Foto de perfil, tipografia editorial da biografia e timeline pessoal/profissional. |
| **Habilidades** | `design/Habilidades.dc.html` | Habilidades com contexto prático real de aplicação (proibido barras percentuais arbitrárias). |
| **Conhecimentos** | `design/Conhecimentos.dc.html` | Fundamentos arquiteturais, engenharia de software e princípios de computação. |
| **Experiências** | `design/Experiencias.dc.html` | Linha do tempo cronológica com cargos, empresas, impactos e tecnologias utilizadas. |
| **Projetos (Catálogo)** | `design/Projetos.dc.html` | Grid de cards com filtros por tags, links para código e demo, e badges semânticas. |
| **Detalhe de Projeto** | `design/ProjetoDetalhe.dc.html` | Página de detalhe estruturada em duas camadas: Visão de Negócio e Desafios de Engenharia Técnica. |
| **Blog (Listagem)** | `design/Blog.dc.html` | Feed de artigos com filtros dinâmicos de categoria e tag, paginação e badge de artigos mono-idioma. |
| **Artigo do Blog (Leitura)** | `design/Artigo.dc.html`<br>`design/ArtigoDark.dc.html`<br>`design/MobileArtigo.dc.html` | Tipografia de leitura com `<ArticleRenderer />`, realce de código sintático claro/escuro, data de publicação/atualização e metadados. |
| **Contato** | `design/Contato.dc.html` | Formulário de contato acessível, feedback de erro/sucesso, widget Turnstile e canais de contato direto. |
| **Política de Privacidade** | `design/Privacidade.dc.html` | Termos de conformidade LGPD/GDPR, declaração de retenção de 24 meses e tipografia limpa. |
| **Como Foi Construído (Case Study)** | `design/ComoFoiConstruido.dc.html` | Página de engenharia detalhando desenvolvimento assistido por IA, Spec-Driven Development e links de evidência. |
| **CMS — Login** | `design/AdminLogin.dc.html` | Tela de autenticação administrativa minimalista, segura e com foco em acessibilidade. |
| **CMS — Listagem de Posts** | `design/AdminPosts.dc.html` | Tabela administrativa com status (`rascunho`/`publicado`), ações rápidas e busca. |
| **CMS — Editor de Posts** | `design/AdminEditor.dc.html` | Editor com Split View (Editor / Preview / Split View simultâneo), diálogo de slug e drawer de histórico de versões. |
| **CMS — Categorias & Tags** | `design/AdminTaxonomia.dc.html` | Listagem, criação e edição de taxonomias com campos bilíngues e bloqueio visual de exclusão de itens em uso. |
| **CMS — Mensagens de Contato** | `design/AdminMensagens.dc.html` | Tabela de consulta de mensagens recebidas, paginação e status de envio de e-mail. |
| **CMS — Lixeira** | `design/AdminLixeira.dc.html` | Área dedicada para restauração de posts ou exclusão definitiva com confirmação destrutiva. |
| **Estados & Microinterações** | `design/Estados.dc.html` | Estados interativos: hover, foco por teclado (`focus-visible`), disabled, loading skeletons, empty states e toasts. |

---

## 3. Diretrizes de Implementação Visual

1. **Tokens Semânticos Antes de Cores Arbitrárias:** Nunca utilize cores hexadecimais ou arbitrárias soltas no código (como `bg-[#1a1a1a]`). Utilize sempre as variáveis semânticas configuradas no Tailwind baseadas em `Tokens.dc.html` (ex.: `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`).
2. **Equilíbrio de Temas Claro e Escuro:** Qualquer tela deve ser implementada com suporte simultâneo e contraste estrito (WCAG 2.1 AA) em ambos os temas, espelhando os arquivos de referência `Artigo.dc.html` (claro) e `ArtigoDark.dc.html` (escuro).
3. **Responsividade Fiel:** Validar o comportamento responsivo desde viewports móveis (320px) até telas ultra-wide (1920px), tomando como base `MobileHome.dc.html` e `MobileArtigo.dc.html`.
4. **Composição shadcn/ui:** Ao usar componentes de `shadcn/ui`, adapte sua estilização e variantes para convergir exatamente com as proporções, raios e tipografia da pasta `design/`.
