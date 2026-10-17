# Developer Quickstart: DaviDev

**Feature ID:** `001-davidev-portfolio`  
**Status:** Ready  
**Context:** `docs/architecture.md`, `specs/001-davidev-portfolio/plan.md`  
**Constitution:** `.specify/memory/constitution.md`  

---

## 1. Pré-requisitos de Ambiente

Para rodar e testar o projeto localmente, certifique-se de possuir instalado:
*   **Node.js:** Versão 22 LTS ou superior.
*   **Gerenciador de Pacotes:** `pnpm` v9.x ou superior (`corepack enable pnpm`).
*   **Banco de Dados:** Instância PostgreSQL 16+ ou projeto no [Neon](https://neon.tech).

---

## 2. Variáveis de Ambiente (`.env`)

Crie o arquivo `.env` na raiz do monorepo a partir do modelo abaixo:

```bash
# Banco de Dados (Neon PostgreSQL via HTTP)
DATABASE_URL="postgres://usuario:senha@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Segurança & Autenticação
JWT_SECRET="chave-secreta-aleatoria-de-ao-menos-32-caracteres"
JWT_EXPIRES_IN="900" # 15 minutos (em segundos)
REFRESH_TOKEN_EXPIRES_IN="604800" # 7 dias (em segundos)

# Provisionamento Inicial do Administrador (Seed)
ADMIN_EMAIL="davi@davidev.net.br"
ADMIN_PASSWORD="SenhaForteDeExemplo123!"

# Integrações Externas
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
RESEND_API_KEY="re_123456789_abcdefg"
CONTACT_NOTIFICATION_EMAIL="davi@davidev.net.br"

# Analytics (Plausible - Cookieless)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="davidev.net.br"
```

---

## 3. Passo a Passo de Inicialização

### Passo 3.1: Instalação de Dependências
```bash
pnpm install
```

### Passo 3.2: Migrações e Seed do Banco de Dados
Gera as migrações SQL com o Drizzle Kit, aplica-as no PostgreSQL e provisiona a conta do administrador:
```bash
# Executar as migrações forward-only
pnpm db:migrate

# Executar o seed do admin (gera hash Argon2id)
pnpm db:seed
```

### Passo 3.3: Gerar Código do Client da API (Orval)
Gera automaticamente os tipos TypeScript e hooks a partir da especificação OpenAPI:
```bash
pnpm api:generate
```

### Passo 3.4: Iniciar o Ambiente de Desenvolvimento
```bash
pnpm dev
```
A aplicação estará disponível em:
*   **Site Público Bilíngue:** [http://localhost:3000](http://localhost:3000)
*   **Painel Administrativo:** [http://localhost:3000/admin](http://localhost:3000/admin)
*   **Documentação OpenAPI / Swagger UI:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 4. Bateria de Verificação e Qualidade (CI Local)

Execute os comandos abaixo antes de submeter alterações para garantir conformidade com os 10 gates do projeto:

```bash
# 1. Lint e formatação (ESLint + Prettier)
pnpm lint

# 2. Checagem estrita de tipos TypeScript
pnpm typecheck

# 3. Validação das fronteiras arquiteturais (DEP-1 a DEP-7 via dependency-cruiser)
pnpm arch:check

# 4. Verificação de integridade do api-client gerado
pnpm api:contract:check

# 5. Testes unitários (cobertura >= 80% em domain e application)
pnpm test:unit

# 6. Testes de integração (repositórios Drizzle com Neon)
pnpm test:integration

# 7. Testes End-to-End (Playwright)
pnpm test:e2e

# 8. Auditoria de acessibilidade (axe-core em Light e Dark mode)
pnpm a11y:check

# 9. Compilação final de produção
pnpm build
```
