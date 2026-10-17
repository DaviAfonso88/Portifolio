# Orquestração Obrigatória de Skills — DaviDev

Este arquivo espelha e reforça as diretrizes mandatórias de orquestração de skills do projeto.

Para detalhes completos, consulte o arquivo raiz de regras: [GEMINI.md](../../GEMINI.md).

## Resumo Operacional

Sempre que atuar no repositório:
- **Domínio/TypeScript (`packages/domain`, `packages/application`)**: Ativar `typescript-advanced-types` (branded types, generics, zero `any`, zero dependências externas).
- **Next.js & Serverless (`apps/web`)**: Ativar `next-best-practices` e `vercel-react-best-practices` (Next.js 15+ async APIs, RSC boundaries, zero waterfalls, LCP < 2.5s).
- **Interface & Componentes UI (`apps/web/components`, `apps/web/app`)**: Seguir **obrigatoriamente** os arquivos de design em `design/*.dc.html` (consulte [frontend-design-fidelity.md](./frontend-design-fidelity.md)); ativar `frontend-design`, `shadcn` e `vercel-composition-patterns` (tokens editoriais de `design/Tokens.dc.html`, shadcn via pnpm, compound components, proibido boolean props hell).
- **Acessibilidade & Qualidade de Tela**: Ativar `web-design-guidelines` (WCAG 2.1 AA em tema claro e escuro, navegação por teclado, sem FOUC).
- **Documentação**: Ativar `readme-generator` ("O Produto é a Evidência").
