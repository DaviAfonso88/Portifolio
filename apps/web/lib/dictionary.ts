import type { PostLocale } from '@davidev/domain';

export interface NavItem {
  label: string;
  href: string;
}

export interface Dictionary {
  nav: {
    home: string;
    about: string;
    skills: string;
    knowledge: string;
    experiences: string;
    projects: string;
    blog: string;
    contact: string;
    howItWasBuilt: string;
    privacy: string;
  };
  header: {
    themeToggleAria: string;
    menuToggleAria: string;
  };
  footer: {
    colophonTitle: string;
    colophonLine1: string;
    colophonLine2: string;
    colophonLine3?: string;
    contactTitle: string;
    emailLabel: string;
    emailValue: string;
    linkedinLabel: string;
    linkedinUrl: string;
    githubLabel: string;
    githubUrl: string;
    privacyPolicy: string;
    sourceCode: string;
    sourceCodeUrl: string;
    copyright: string;
  };
  home: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaProjects: string;
    ctaHowBuilt: string;
    stackTitle: string;
    stackItems: string[];
    roleTitle: string;
    roleValue: string;
    locationTitle: string;
    locationValue: string;
    availabilityTitle: string;
    availabilityValue: string;
    featuredSectionNumber: string;
    featuredTitle: string;
    allProjectsLink: string;
    recentWritingNumber: string;
    recentWritingTitle: string;
    allArticlesLink: string;
    differentialNumber: string;
    differentialTitle: string;
    differentialBody: string;
    differentialCta: string;
  };
  about: {
    badge: string;
    headline: string;
    paragraphs: string[];
    focusTitle: string;
    focusValue: string;
    baseTitle: string;
    baseValue: string;
    languagesTitle: string;
    languagesValue: string;
    photoPlaceholder: string;
    trajectoryTitle: string;
    milestones: { year: string; description: string }[];
  };
  skills: {
    badge: string;
    headline: string;
    intro: string;
    categories: {
      number: string;
      title: string;
      items: { name: string; description: string }[];
    }[];
  };
  knowledge: {
    badge: string;
    headline: string;
    intro: string;
    items: {
      title: string;
      tag: string;
      description: string;
      costLabel: string;
      cost: string;
    }[];
  };
  experiences: {
    badge: string;
    headline: string;
    intro: string;
    positions: {
      period: string;
      company: string;
      role: string;
      regime: string;
      summary: string;
      highlights: string[];
      technologies: string[];
    }[];
  };
  projects: {
    badge: string;
    headline: string;
    intro: string;
    items: {
      slug: string;
      title: string;
      status: string;
      period: string;
      stack: string[];
      problem: string;
      result: string;
      role: string;
      detailLink: string;
      summary: string;
      engineeringChallenge?: string;
      decisions?: { title: string; desc: string; tradeoff: string }[];
    }[];
  };
  contact: {
    badge: string;
    headline: string;
    intro: string;
    emailLabel: string;
    emailValue: string;
    linkedinLabel: string;
    linkedinHandle: string;
    githubLabel: string;
    githubHandle: string;
    privacyNotice: string;
    form: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      subjectLabel: string;
      subjectPlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
      charCount: string;
      turnstileVerified: string;
      turnstileVerifying: string;
      turnstileRequired: string;
      privacyAgreement: string;
      submitButton: string;
      submittingButton: string;
      successMessage: string;
      errorMessage: string;
      rateLimitError: string;
      errors: {
        nameRequired: string;
        emailInvalid: string;
        messageLength: string;
      };
    };
  };
  privacy: {
    badge: string;
    headline: string;
    lastUpdated: string;
    laws: string;
    summaryTitle: string;
    summaryText: string;
    sections: {
      id: string;
      title: string;
      content: string[];
    }[];
    table: {
      title: string;
      headers: [string, string];
      rows: [string, string][];
    };
  };
  howItWasBuilt: {
    badge: string;
    headline: string;
    intro: string;
    metrics: { label: string; count: number }[];
    flowNumber: string;
    flowTitle: string;
    flowSteps: { number: string; title: string; description: string }[];
    flowNote: string;
    adrsNumber: string;
    adrsTitle: string;
    adrs: { id: string; title: string; description: string; costLabel: string; cost: string }[];
    mistakesNumber: string;
    mistakesTitle: string;
    mistakesIntro: string;
    mistakes: { title: string; description: string }[];
    openDocsTitle: string;
    openDocsIntro: string;
    openDocsLinks: { label: string; href: string; isExternal?: boolean }[];
  };
}


const dictionaries: Record<string, Dictionary> = {
  'pt-BR': {
    nav: {
      home: 'Início',
      about: 'Sobre',
      skills: 'Habilidades',
      knowledge: 'Conhecimentos',
      experiences: 'Experiências',
      projects: 'Projetos',
      blog: 'Blog',
      contact: 'Contato',
      howItWasBuilt: 'Como foi construído',
      privacy: 'Privacidade',
    },
    header: {
      themeToggleAria: 'Alternar tema claro/escuro',
      menuToggleAria: 'Alternar menu de navegação',
    },
    footer: {
      colophonTitle: 'Davi Afonso',
      colophonLine1: 'Desenvolvedor Full Stack & Engenharia de IA',
      colophonLine2: 'Lagoa Santa, Minas Gerais · Remoto e Híbrido',
      contactTitle: 'Contato',
      emailLabel: 'daviafonso5894@gmail.com',
      emailValue: 'daviafonso5894@gmail.com',
      linkedinLabel: 'LinkedIn',
      linkedinUrl: 'https://www.linkedin.com/in/davi-afonso',
      githubLabel: 'GitHub',
      githubUrl: 'https://github.com/DaviAfonso88',
      privacyPolicy: 'Política de privacidade',
      sourceCode: 'Código-fonte deste site',
      sourceCodeUrl: 'https://github.com/DaviAfonso88/portifolio',
      copyright: '© 2026 Davi Afonso',
    },
    home: {
      badge: 'Desenvolvedor Full Stack & Engenharia de IA · Brasil',
      headline: 'Engenharia de software com rigor arquitetural e inteligência artificial de ponta a ponta.',
      subheadline:
        'Bacharel em Sistemas de Informação focado em C# / .NET, React, arquitetura limpa e Spec-Driven Development (SDD). Da concepção com Spec-Kit ao harness de execução com IA, construo sistemas robustos, auditáveis e de alto impacto corporativo.',
      ctaProjects: 'Ver projetos',
      ctaHowBuilt: 'Como este site foi construído',
      stackTitle: 'Stack principal',
      stackItems: ['Claude Code', 'IA & Spec-Kit', 'C# / .NET', 'Node.js', 'React', 'TypeScript', 'Next.js', 'PostgreSQL', 'Docker'],
      roleTitle: 'Atuação',
      roleValue: 'Full Stack (.NET, React) & AI Engineering',
      locationTitle: 'Base',
      locationValue: 'Lagoa Santa, MG · Remoto / Híbrido',
      availabilityTitle: 'Disponibilidade',
      availabilityValue: 'PJ / CLT / Projetos',
      featuredSectionNumber: '01',
      featuredTitle: 'Em destaque',
      allProjectsLink: 'Todos os projetos →',
      recentWritingNumber: '02',
      recentWritingTitle: 'Escrito recentemente',
      allArticlesLink: 'Todos os artigos →',
      differentialNumber: '03 — O diferencial',
      differentialTitle: 'O processo guiado por especificação e harness de IA.',
      differentialBody:
        'Especificações como fonte única da verdade (SDD), Model Context Protocol (MCP), agentes ancorados em regras duráveis e ADRs documentadas. Mostro o raciocínio completo e auditável por trás de cada linha.',
      differentialCta: 'Ver como foi construído',
    },
    about: {
      badge: 'Sobre mim',
      headline: 'Bacharel em Sistemas de Informação e pós graduando em Arquitetura de Software com IA no Full Stack Club.',
      paragraphs: [
        'Sou desenvolvedor Full Stack e Bacharel em Sistemas de Informação, atualmente cursando pós graduação em Arquitetura de Software com IA no Full Stack Club. Minha trajetória une a solidez do desenvolvimento backend corporativo em C#, ecossistema .NET (ASP.NET Core e Entity Framework) e Node.js (TypeScript e Fastify), com a construção de interfaces web modernas e reativas em React e Next.js.',
        'Como a inteligência artificial está escrevendo código com cada vez mais qualidade, direciono meu foco estratégico para a área de arquitetura de software, estruturando sistemas resilientes, contratos claros e domínios bem delimitados. Ao mesmo tempo, não deixo de estudar profundamente sobre código e utilizo inteligência artificial de forma contínua em todo o fluxo de trabalho, convicto de que ela potencializa minhas decisões e me torna um profissional muito melhor.',
        'Aplico inteligência artificial com rigor e método, adotando codificação agêntica (Claude Code, OpenAI Codex, OpenCode e Kiro), Spec Driven Development (SDD) e Harness Engineering. Meu objetivo é garantir que os modelos operem sob rédeas firmes de arquitetura, contratos de API e testes automatizados. Acredito no código como consequência direta de uma especificação bem consolidada, seja em arquitetura hexagonal e DDD, seja conectando ferramentas avançadas via Model Context Protocol (MCP).',
      ],
      focusTitle: 'Foco',
      focusValue: 'Arquitetura de Software, Full Stack (.NET, Next) e Engenharia com IA',
      baseTitle: 'Base',
      baseValue: 'Lagoa Santa, Minas Gerais · Brasil',
      languagesTitle: 'Idiomas',
      languagesValue: 'Português (Nativo) · Inglês (Intermediário)',
      photoPlaceholder: 'Davi Afonso',
      trajectoryTitle: 'Trajetória',
      milestones: [
        {
          year: '2021',
          description: 'Início da graduação em Sistemas de Informação.',
        },
        {
          year: '2023',
          description: 'Evolução para o ecossistema Web Full Stack com Node.js, TypeScript e React, desenvolvendo APIs REST e interfaces dinâmicas.',
        },
        {
          year: '2024',
          description: 'Desenvolvimento e entrega de projetos como SaltWeb e FIT.IA, combinando React, Tailwind CSS e serviços inteligentes com IA.',
        },
        {
          year: '2025',
          description: 'Atuação na Rumo Soluções, desenvolvimento de sistema OS do zero e liderança de workshops internos para todos os funcionários sobre IA, SDD e Harness Engineering.',
        },
        {
          year: '2026',
          description: 'Pós graduação em Arquitetura de Software com IA no Full Stack Club e lançamento do DaviDev com arquitetura hexagonal monorepo e engenharia guiada por especificações.',
        },
      ],
    },
    skills: {
      badge: 'Habilidades',
      headline: 'O que eu domino e onde aplico.',
      intro:
        'Minhas especializações em inteligência artificial e engenharia de contexto, acompanhada por arquitetura de software, backend, frontend e infraestrutura.',
      categories: [
        {
          number: '01',
          title: 'Inteligência Artificial & Engenharia de Contexto',
          items: [
            {
              name: 'Spec Driven Development (SDD) & Spec Kit',
              description:
                'Metodologia em que a especificação é a fonte única da verdade. Hierarquia de autoridade rigorosa (PRD, Architecture, Spec, Plan, Tasks, Code), padronização com comandos Spec Kit e separação clara entre produto e especificação executável.',
            },
            {
              name: 'Claude Code, Codex, OpenCode & Kiro',
              description:
                'Domínio prático de ferramentas líderes de codificação agêntica e ambientes CLI autônomos (Claude Code, OpenAI Codex, OpenCode e Kiro). Uso de agentes para refatoração semântica, execução automatizada de testes, integração com terminal e aplicação estrita de especificações.',
            },
            {
              name: 'Model Context Protocol (MCP)',
              description:
                'Orquestração da conexão universal da IA ligando agentes a ferramentas e dados em tempo real: Context7 (documentação atualizada), Serena (navegação e refatoração semântica LSP) e TestSprite (geração e execução de testes de qualidade).',
            },
            {
              name: 'Harness Engineering & Sandboxing',
              description:
                'Construção da infraestrutura ao redor dos LLMs: regras duráveis de governança (constitution.md), delimitação estrita de ferramentas e permissões de segurança, persistência de memória e loops de verificação contínua.',
            },
            {
              name: 'Orquestração de Agentes & Subagentes',
              description:
                'Coordenação de equipes de subagentes especializados (code reviewer com níveis de severidade, dotnet best practices, explore, planner) e automação de procedimentos corporativos através de skills dedicadas.',
            },
            {
              name: 'Engenharia de Prompts Estruturados & LLMs',
              description:
                'Modelos de linguagem avançados (Claude, GPT, Gemini) integrados com validação estrita de esquemas JSON e Zod, retentativas estruturadas e extração determinística.',
            },
          ],
        },
        {
          number: '02',
          title: 'Arquitetura de Software',
          items: [
            {
              name: 'Escalabilidade',
              description:
                'Estratégias de escalabilidade horizontal e vertical, isolamento de falhas, desacoplamento de serviços e tolerância a picos de tráfego sem degradação do sistema.',
            },
            {
              name: 'Cache Distribuído',
              description:
                'Camadas de cache com políticas de invalidação precisas, estratégias de cache aside e write through para redução drástica de latência e alívio do banco principal.',
            },
            {
              name: 'Load Balancer',
              description:
                'Distribuição inteligente de tráfego entre instâncias, balanceamento de carga, monitoramento contínuo de integridade e terminação segura para alta disponibilidade.',
            },
            {
              name: 'Índices',
              description:
                'Modelagem de índices compostos, B tree e parciais, otimização de planos de execução de consultas com explain analyze e eliminação de varreduras completas de tabelas.',
            },
            {
              name: 'Paginação',
              description:
                'Implementação de paginação por cursor e keyset pagination para grandes volumes de dados, eliminando gargalos de performance e leituras redundantes do offset tradicional.',
            },
            {
              name: 'Arquitetura Hexagonal & DDD',
              description:
                'Isolamento estrito do domínio e casos de uso, garantindo zero dependência de frameworks ou bancos no núcleo através de portas e adaptadores.',
            },
          ],
        },
        {
          number: '03',
          title: 'Backend & APIs',
          items: [
            {
              name: 'APIs REST',
              description:
                'Desenvolvimento de serviços RESTful orientados a recursos, com verbos HTTP padronizados, códigos de status precisos, idempotência e documentação OpenAPI.',
            },
            {
              name: 'JWT & Claims',
              description:
                'Emissão e validação de JSON Web Tokens com assinatura criptográfica, estruturação de Claims para autorização granular baseada em papéis e contexto.',
            },
            {
              name: 'Access Token & Refresh Token',
              description:
                'Arquitetura de autenticação com Access Token de ciclo de vida curto e Refresh Token com rotação automática para renovação segura de credenciais.',
            },
            {
              name: 'OAuth 2.0',
              description:
                'Implementação de fluxos de autorização para integração segura com provedores externos, concessão de escopos limitados e delegação de acesso.',
            },
            {
              name: 'Cookies',
              description:
                'Armazenamento seguro de credenciais com flags HttpOnly, Secure e SameSite, mitigando vulnerabilidades como roubo de tokens por XSS e ataques CSRF.',
            },
            {
              name: 'BCrypt',
              description:
                'Hashing unidirecional de senhas com salting automático e fator de custo ajustável, garantindo proteção contra ataques de dicionário e tabelas arco íris.',
            },
            {
              name: 'CORS',
              description:
                'Gerenciamento de políticas de Cross Origin Resource Sharing, restringindo origens permitidas, métodos autorizados e cabeçalhos expostos.',
            },
            {
              name: 'C# / .NET',
              description:
                'Desenvolvimento de APIs robustas e serviços com ASP.NET Core, Entity Framework Core e LINQ, aplicando padrões corporativos, injeção de dependência e MVC.',
            },
            {
              name: 'Node.js · TypeScript',
              description:
                'Construção de APIs REST escaláveis com tipagem estrita, contratos de schemas validados com Zod e separação clara de camadas.',
            },
            {
              name: 'Fastify & Express',
              description:
                'Desenvolvimento de servidores HTTP de alta performance com injeção de dependência e desacoplamento do núcleo de negócio.',
            },
          ],
        },
        {
          number: '04',
          title: 'Frontend & Interface',
          items: [
            {
              name: 'React & Next.js 15',
              description:
                'Desenvolvimento de aplicações modernas com App Router, React Server Components (RSC), hooks customizados e otimização de renderização.',
            },
            {
              name: 'Tailwind CSS & Design Tokens',
              description:
                'Criação de interfaces acessíveis, responsivas e semânticas com design tokens, suporte a tema claro ou escuro e padrões WCAG AA.',
            },
            {
              name: 'TypeScript Avançado',
              description:
                'Tipagem avançada em todo o ciclo da aplicação, generics com constraints e discriminated unions prevenindo falhas de contrato.',
            },
          ],
        },
        {
          number: '05',
          title: 'Banco de Dados & Infraestrutura',
          items: [
            {
              name: 'PostgreSQL & MySQL',
              description:
                'Modelagem relacional com integridade declarativa, foreign keys, constraints e migrations versionadas com Drizzle e EF Core.',
            },
            {
              name: 'Neon & Supabase',
              description:
                'Bancos de dados PostgreSQL serverless com branching instantâneo de ambientes, pooling de conexões de alta escala e serviços de backend gerenciados.',
            },
            {
              name: 'Upstash Redis',
              description:
                'Cache distribuído serverless e controle de taxa de requisições em borda com conexão via HTTP e REST de baixíssima latência.',
            },
            {
              name: 'Pipelines e Releases CI/CD',
              description:
                'Automação completa com GitHub Actions, execução de suítes de testes, auditoria estática de regras arquiteturais e deploy contínuo sem intervenção manual.',
            },
            {
              name: 'Docker',
              description:
                'Ambientes conteinerizados reprodutíveis para desenvolvimento e produção, garantindo paridade entre máquinas locais e servidores de nuvem.',
            },
            {
              name: 'MongoDB',
              description:
                'Persistência orientada a documentos para catálogos flexíveis e coleções não relacionais com índices otimizados e consultas agregadas.',
            },
          ],
        },
      ],
    },
    knowledge: {
      badge: 'Conhecimentos',
      headline: 'Os conceitos que sustentam as escolhas.',
      intro:
        'Habilidade é a ferramenta; conhecimento é saber quando ela não serve. Aqui estão os fundamentos de IA, especificação e arquitetura que uso para tomar decisões técnicas e o custo que cada uma cobra.',
      items: [
        {
          title: 'Spec Driven Development e Hierarquia de Autoridade',
          tag: 'Aplico',
          description:
            'O código deixa de ser o ponto de partida e passa a ser a consequência final da especificação. Respeito rigoroso à hierarquia de autoridade dos artefatos: PRD para intenção de produto, Architecture para estrutura, Specification para contratos, Plan para design técnico, Tasks para execução e Code como resultado verificável. Nenhuma linha é escrita sem validação prévia.',
          costLabel: 'O custo',
          cost: 'Demanda disciplina e tempo investido antes da implementação. Quem queima essa etapa ganha velocidade aparente no primeiro dia e passa meses pagando retrabalho e desalinhamento entre produto e engenharia.',
        },
        {
          title: 'Harness Engineering no Desenvolvimento com IA',
          tag: 'Aplico',
          description:
            'O modelo de linguagem é apenas o motor de raciocínio; o harness é toda a infraestrutura ao redor que o guia, controla e torna confiável. Engloba regras duráveis de governança, ferramentas seguras de execução, controle estrito de permissões, contexto direcionado, persistência de memória e loops automatizados de verificação contínua.',
          costLabel: 'O custo',
          cost: 'Manter a infraestrutura de harness calibrada conforme o sistema evolui exige manutenção constante de contexto e regras. Sem esse suporte, até o modelo mais avançado alucina e quebra invariantes de domínio.',
        },
        {
          title: 'Arquitetura Hexagonal (Ports e Adapters)',
          tag: 'Aplico',
          description:
            'Domínio e casos de uso independentes de framework, servidores HTTP e bancos de dados. O ganho real não é elegância estética: é conseguir testar regras de negócio puras em memória sem subir infraestrutura externa e proteger a longevidade do software contra obsolescência.',
          costLabel: 'O custo',
          cost: 'Mais arquivos e mais indireção por funcionalidade. Em sistemas simples pode representar complexidade desnecessária, sendo justificável quando a longevidade e a testabilidade são prioridades.',
        },
        {
          title: 'Cache Distribuído e Estratégias de Invalidação',
          tag: 'Aplico',
          description:
            'Implementação de camadas de cache distribuído com Upstash Redis e padrões como cache aside e write through para alívio do banco de dados e latência mínima. Decisões arquiteturais ponderadas entre consistência estrita e consistência eventual com políticas previsíveis de expiração (TTL).',
          costLabel: 'O custo',
          cost: 'Invalidação de cache é um dos problemas clássicos da computação. Exige controle rigoroso para evitar leitura de dados obsoletos e adiciona dependência de sincronização no ecossistema.',
        },
        {
          title: 'Autenticação Stateless e Defesa em Camadas',
          tag: 'Aplico',
          description:
            'Segurança de ponta a ponta com JSON Web Tokens de curta duração, claims tipadas para autorização fina e rotação automática de Refresh Tokens. Proteção contra ataques XSS e CSRF através de cookies HttpOnly e políticas refinadas de CORS e criptografia com BCrypt.',
          costLabel: 'O custo',
          cost: 'Tokens stateless não podem ser revogados instantaneamente sem um mecanismo auxiliar de blacklist ou versão de credencial, exigindo equilíbrio fino no tempo de vida dos tokens.',
        },
        {
          title: 'Integridade Relacional no Banco de Dados',
          tag: 'Aplico',
          description:
            'Quando uma regra de negócio pode ser garantida por uma constraint relacional, ela deve ser. Unicidade, integridade referencial em cascata e transições de estado garantidas pelo PostgreSQL ou Neon são impossíveis de violar por falhas de código ou geração automática incorreta.',
          costLabel: 'O custo',
          cost: 'Menor flexibilidade em migrações dinâmicas e mensagens de erro do driver que exigem camadas de tradução de banco para o usuário da aplicação.',
        },
      ],
    },
    experiences: {
      badge: 'Experiências',
      headline: 'O que eu resolvi, e onde atuei.',
      intro:
        'Trajetória profissional combinando liderança técnica em inteligência artificial, capacitação corporativa, engenharia Full Stack (.NET, React) e automação de processos.',
      positions: [
        {
          period: '2026 — Atual',
          company: 'Rumo Soluções',
          role: 'Analista Desenvolvedor Júnior',
          regime: 'CLT · Híbrido · Lagoa Santa, MG',
          summary:
            'Atuação no desenvolvimento de sistemas corporativos escaláveis, liderança em capacitação de Inteligência Artificial para equipes, automação de processos (RPA) e arquitetura de software orientada a especificações.',
          highlights: [
            'Ministração de treinamentos e workshops internos para todos os funcionários da empresa sobre Inteligência Artificial Aplicada, Spec-Driven Development (SDD), Spec-Kit e Harness Engineering, capacitando a equipe na transição de geração desordenada de código para fluxos estruturados e auditáveis.',
            'Concepção e desenvolvimento do sistema de Ordem de Serviço (OS / Projeto CRC) do zero utilizando .NET, React, Docker e práticas modernas de engenharia, estabelecendo um harness corporativo rigoroso com regras duráveis (snapshot congelado imutável, soft delete universal e fluxo linear de OS).',
            'Desenvolvimento de soluções potencializadas por IA para geração automatizada de documentação técnica, wikis no Azure DevOps e padronização dos processos de engenharia de software.',
            'Integração e orquestração de servidores Model Context Protocol (MCP) — incluindo Context7 para documentação em tempo real, Serena para navegação semântica via LSP e TestSprite para controle de qualidade automatizado.',
            'Adoção e capacitação da equipe em ferramentas avançadas de desenvolvimento agêntico (Claude Code, OpenAI Codex, OpenCode e Kiro) integradas a Spec-Kit para acelerar a entrega e garantir conformidade arquitetural.',
            'Desenvolvimento e sustentação de funcionalidades críticas para sistemas corporativos, com foco em disponibilidade, estabilidade e regras de negócio.',
            'Construção de rotinas de automação (RPA) e pipelines eficientes para integração de dados entre sistemas e serviços.',
          ],
          technologies: [
            'Claude Code',
            'Codex',
            'OpenCode',
            'Kiro',
            'Inteligência Artificial',
            'Spec-Driven Dev',
            'Spec-Kit',
            'Harness Engineering',
            'Model Context Protocol (MCP)',
            '.NET / C#',
            'React',
            'Docker',
            'TypeScript',
            'PostgreSQL',
            'RPA',
          ],
        },
        {
          period: '2025 — 2026',
          company: 'Rumo Soluções',
          role: 'Estagiário de Desenvolvimento Web',
          regime: 'Estágio · Híbrido · Lagoa Santa, MG',
          summary:
            'Apoio técnico no ciclo completo de desenvolvimento web, codificação de interfaces de usuário, manutenção de serviços backend, testes de integração e primeiras automações com IA.',
          highlights: [
            'Implementação e estilização de interfaces web modernas e responsivas alinhadas às diretrizes de design e padrões visuais da empresa.',
            'Correção de bugs, refatoração de código legado e apoio na elaboração de documentação técnica de endpoints e arquitetura.',
            'Integração contínua em equipe ágil, participando de code reviews, reuniões diárias e planejamento de sprints.',
          ],
          technologies: ['JavaScript', 'TypeScript', 'HTML5 & CSS3', 'React', 'Node.js', 'Git', 'SQL'],
        },
        {
          period: '2023 — Atual',
          company: 'Projetos Autônomos & Soluções Digitais',
          role: 'Desenvolvedor Full Stack',
          regime: 'Projetos · Remoto / Híbrido',
          summary:
            'Concepção, arquitetura e entrega de plataformas web completas para clientes e iniciativas comunitárias, integrando frontend reativo, backends resilientes e inteligência artificial aplicada.',
          highlights: [
            'Construí o projeto DaviDev em arquitetura hexagonal estrita, monorepo pnpm, Next.js 15 e API Fastify in-process, com todo o processo de Spec-Driven Development publicado abertamente.',
            'Desenvolvi a plataforma FIT.IA, integrando inteligência artificial generativa com backend em Express e frontend em React para montagem personalizada de rotinas de treino e nutrição.',
            'Arquitetei e lancei a plataforma SaltWeb para a juventude da PIB Lagoa Santa, proporcionando experiência rápida e engajamento comunitário.',
          ],
          technologies: ['React', 'Next.js 15', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'IA Generativa'],
        },
      ],
    },
    projects: {
      badge: 'Projetos',
      headline: 'Problema, decisão, resultado.',
      intro:
        'Cada projeto abre pelo problema de negócio e pelo desfecho, de forma legível para quem contrata. O detalhe de arquitetura vem depois, para quem avalia tecnicamente.',
      items: [
        {
          slug: 'davidev-portfolio-produto',
          title: 'DaviDev: Portfólio como Produto de Software',
          status: 'Em produção',
          period: '2026',
          stack: ['Next.js 15', 'Fastify', 'PostgreSQL', 'Drizzle', 'Hexagonal'],
          problem:
            'Currículos estáticos em PDF não comprovam maturidade de código, qualidade de arquitetura ou rigor metodológico em engenharia de software.',
          result:
            'Portfólio construído como software de produção: arquitetura hexagonal com separação em monorepo pnpm, blog editorial com ISR, CMS protegido e PRD público.',
          role: 'Engenheiro responsável por toda a especificação, arquitetura e implementação.',
          detailLink: 'Ver o detalhe técnico →',
          summary:
            'Blog editorial, CMS, API RESTful documentada com Swagger e arquitetura hexagonal, com todo o processo de engenharia publicado.',
          engineeringChallenge:
            'Garantir latência LCP menor que 2.5s global e zero dependências externas no pacote de domínio, com integração in process entre Next.js e Fastify.',
          decisions: [
            {
              title: 'Arquitetura Hexagonal estrita em Monorepo',
              desc: 'O domínio (@davidev/domain) não possui nenhuma dependência externa, garantindo portabilidade absoluta de regras de negócio.',
              tradeoff: 'Maior número de camadas e interfaces abstratas.',
            },
            {
              title: 'Host híbrido Serverless Fastify dentro do Next.js',
              desc: 'A mesma API Fastify com schemas Zod atende requisições HTTP e é consumida in process por Server Components sem round trip de rede.',
              tradeoff: 'Configuração personalizada de handlers e adapters de request.',
            },
          ],
        },
        {
          slug: 'saltweb',
          title: 'SaltWeb: Plataforma Web da Juventude',
          status: 'Concluído',
          period: '2024',
          stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
          problem:
            'A comunidade de jovens da PIB Lagoa Santa necessitava de uma plataforma digital centralizada para divulgação de eventos, engajamento e identidade visual contemporânea.',
          result:
            'Plataforma web rápida, responsiva e moderna entregue, facilitando o acesso a informações, encontros e integração dos membros.',
          role: 'Desenvolvedor Frontend e UI Designer da aplicação.',
          detailLink: 'Ver o detalhe técnico →',
          summary:
            'Aplicação web interativa para comunidade jovem desenvolvida com React, TypeScript e Tailwind CSS com design responsivo e focado em engajamento.',
          engineeringChallenge:
            'Criar uma experiência fluida com carregamento instantâneo no mobile e layout responsivo com visual editorial alinhado à linguagem dos jovens.',
          decisions: [
            {
              title: 'Tailwind CSS para consistência visual',
              desc: 'Uso de utilitários Tailwind para garantir harmonia tipográfica e layout adaptável a diferentes dispositivos móveis.',
              tradeoff: 'Classes utilitárias acumuladas que exigem organização modular de componentes.',
            },
            {
              title: 'Vite como ferramenta de build',
              desc: 'Adoção de Vite para builds ultrarrápidos e Hot Module Replacement (HMR) eficiente durante o ciclo de desenvolvimento.',
              tradeoff: 'Configuração manual de roteamento client side.',
            },
          ],
        },
        {
          slug: 'fit-ia',
          title: 'FIT.IA: Assistente Inteligente de Treino & Nutrição',
          status: 'Concluído',
          period: '2024',
          stack: ['Node.js', 'Express', 'React', 'IA Generativa', 'Tailwind CSS'],
          problem:
            'Praticantes de atividade física frequentemente enfrentam dificuldades para montar e adaptar planos de treino e nutrição alinhados aos seus objetivos específicos de forma acessível.',
          result:
            'Aplicação completa com geração automatizada de rotinas de treino e orientação nutricional personalizada com base no perfil físico e metas do usuário.',
          role: 'Desenvolvedor Full Stack (API backend em Node.js/Express e interface React).',
          detailLink: 'Ver o detalhe técnico →',
          summary:
            'Sistema integrado que utiliza inteligência artificial generativa para estruturar dietas e treinos personalizados através de uma interface intuitiva.',
          engineeringChallenge:
            'Estruturar prompts consistentes na API e tratar respostas não estruturadas de modelos de linguagem para garantir formatos previsíveis no frontend.',
          decisions: [
            {
              title: 'Sanitização e Validação de Schemas',
              desc: 'Validação rigorosa do payload de saída do modelo antes de repassar os dados ao frontend, prevenindo inconsistências no formato dos exercícios.',
              tradeoff: 'Retentativas adicionais de geração caso o formato venha fora do schema.',
            },
            {
              title: 'Separação clara entre API e UI',
              desc: 'Backend Express encapsula as chaves de API e a lógica de comunicação com o provedor de IA com total isolamento do cliente.',
              tradeoff: 'Necessidade de gerenciar latência de requisições de rede assíncronas.',
            },
          ],
        },
        {
          slug: 'sales-web-mvc',
          title: 'SalesWebMvc: Gestão de Vendas e Departamentos',
          status: 'Concluído',
          period: '2023',
          stack: ['C# / .NET', 'ASP.NET Core MVC', 'Entity Framework Core', 'MySQL'],
          problem:
            'Organizações necessitam de controle centralizado de registros de vendas, associação a vendedores e departamentos com relatórios sumarizados e filtros por período.',
          result:
            'Sistema corporativo em arquitetura MVC com operações CRUD completas, tratamento de exceções de integridade relacional e relatórios agrupados.',
          role: 'Desenvolvedor Backend / C#.',
          detailLink: 'Ver o detalhe técnico →',
          summary:
            'Aplicação web corporativa em ASP.NET Core MVC e Entity Framework Core para gerenciamento transacional de vendas com validações robustas.',
          engineeringChallenge:
            'Garantir consistência relacional e integridade referencial nas exclusões em cascata e consultas complexas com LINQ e agrupamentos.',
          decisions: [
            {
              title: 'Entity Framework Core Code First',
              desc: 'Modelagem de domínio primeiro em classes C# com mapeamento ORM e migrations automáticas no MySQL.',
              tradeoff: 'Dependência do ciclo de migrações do framework.',
            },
            {
              title: 'Camada de Serviços para Regras de Negócio',
              desc: 'Desacoplamento entre Controllers e DbContext através de serviços dedicados com injeção de dependência nativa.',
              tradeoff: 'Mais classes e injeções no construtor de controllers.',
            },
          ],
        },
        {
          slug: 'api-de-produtos',
          title: 'API REST de Catálogo e Produtos',
          status: 'Concluído',
          period: '2023',
          stack: ['Node.js', 'Express', 'MongoDB', 'Mongoose'],
          problem:
            'Necessidade de um serviço de catálogo flexível para gerenciamento de inventário de produtos com esquemas mutáveis e alta velocidade de leitura.',
          result:
            'API RESTful eficiente com endpoints completos para criação, listagem, atualização e busca por atributos, documentada e com validação de dados.',
          role: 'Desenvolvedor Backend.',
          detailLink: 'Ver o detalhe técnico →',
          summary:
            'API backend com Node.js e MongoDB para gerenciamento de catálogos com paginação, filtros e persistência baseada em documentos.',
          engineeringChallenge:
            'Estruturar modelos Mongoose com validações de campos obrigatórios e tratamento uniforme de respostas e erros HTTP.',
          decisions: [
            {
              title: 'MongoDB para flexibilidade de catálogo',
              desc: 'Permite que diferentes categorias de produtos possuam atributos específicos sem necessidade de esquemas rígidos e migrations complexas.',
              tradeoff: 'Sem integridade referencial relacional garantida a nível de banco.',
            },
            {
              title: 'Middleware de tratamento de erros global',
              desc: 'Centralização de tratamento de exceções do Express, retornando códigos de status HTTP semânticos (400, 404, 500).',
              tradeoff: 'Exige propagação cuidadosa de erros com next(err) em blocos assíncronos.',
            },
          ],
        },
      ],
    },
    contact: {
      badge: 'Contato',
      headline: 'Vamos conversar.',
      intro:
        'Vaga, projeto ou dúvida sobre engenharia e arquitetura, respondo todos os contatos. Se preferir, utilize os canais diretos abaixo.',
      emailLabel: 'Email direto',
      emailValue: 'daviafonso5894@gmail.com',
      linkedinLabel: 'LinkedIn',
      linkedinHandle: '/in/davi-afonso',
      githubLabel: 'GitHub',
      githubHandle: '/DaviAfonso88',
      privacyNotice:
        'Sua mensagem é armazenada com segurança por 24 meses exclusivamente para responder você. Nenhum IP rastreável é guardado.',
      form: {
        nameLabel: 'Nome',
        namePlaceholder: 'Seu nome completo',
        emailLabel: 'Email',
        emailPlaceholder: 'seu.email@empresa.com',
        subjectLabel: 'Assunto',
        subjectPlaceholder: 'Ex.: Proposta de projeto ou oportunidade de backend',
        messageLabel: 'Mensagem',
        messagePlaceholder: 'Descreva sua proposta, desafio técnico ou objetivo de contato...',
        charCount: 'caracteres',
        turnstileVerified: 'Verificação anti spam concluída',
        turnstileVerifying: 'Validando verificação anti spam...',
        turnstileRequired: 'Por favor, aguarde a validação anti spam antes de enviar.',
        privacyAgreement: 'Ao enviar, você concorda com o tratamento de dados descrito na política de privacidade.',
        submitButton: 'Enviar mensagem',
        submittingButton: 'Enviando mensagem...',
        successMessage: 'Mensagem recebida com sucesso! Retornarei em breve no seu email.',
        errorMessage: 'Não foi possível enviar a mensagem no momento. Tente novamente ou use o email direto.',
        rateLimitError: 'Limite de mensagens atingido para este período (máximo 3 por hora). Tente novamente mais tarde.',
        errors: {
          nameRequired: 'Informe seu nome (até 120 caracteres).',
          emailInvalid: 'Informe um endereço de email válido.',
          messageLength: 'A mensagem deve conter entre 10 e 5000 caracteres.',
        },
      },
    },
    privacy: {
      badge: 'Política de privacidade',
      headline: 'O que este site guarda sobre você',
      lastUpdated: 'Vigente desde 2026',
      laws: 'Conformidade LGPD (Lei 13.709/18) e GDPR',
      summaryTitle: 'Resumo',
      summaryText:
        'A única informação que este site armazena sobre você é o que for voluntariamente preenchido no formulário de contato. Não há cookies de rastreamento de terceiros, não há criação de perfil de navegação e seu endereço IP nunca é gravado de forma identificável.',
      table: {
        title: 'Retenção de Dados',
        headers: ['Dado Coletado', 'Período de Retenção'],
        rows: [
          ['Mensagem de contato (nome, e-mail, texto)', '24 meses (descarte irreversível)'],
          ['Hash derivado de IP (anti-abuso temporário)', 'Poucos minutos em memória'],
          ['Preferência de tema e idioma', 'Armazenamento local no seu navegador'],
        ],
      },
      sections: [
        {
          id: 'o-que-e-coletado',
          title: 'O que é coletado',
          content: [
            'Ao enviar o formulário de contato, são armazenados nome, e-mail, assunto (se preenchido) e o conteúdo da mensagem. Nada mais. A base legal é o seu consentimento explícito ao clicar em enviar, com a finalidade exclusiva de responder à sua solicitação.',
            'Para prevenir disparos abusivos e spam automatizado, o endereço IP de origem é processado em tempo de execução para contagem de taxa limite (rate limit) e descartado imediatamente. O endereço IP original nunca é persistido na base de dados.',
          ],
        },
        {
          id: 'por-quanto-tempo',
          title: 'Por quanto tempo',
          content: [
            'As mensagens enviadas pelo formulário são mantidas pelo prazo máximo de 24 meses para histórico de conversas profissionais e arquivamento ético. Após esse prazo, os registros são expurgados de forma definitiva.',
            'Você pode a qualquer momento solicitar a exclusão antecipada da sua mensagem através de contato direto por e-mail.',
          ],
        },
        {
          id: 'cookies-e-medicao',
          title: 'Cookies e medição',
          content: [
            'Este site não utiliza cookies analíticos invasivos, píxeis de redes sociais ou ferramentas de publicidade direcionada.',
            'O navegador pode armazenar apenas sua escolha de idioma (PT ou EN) e preferência de tema (claro ou escuro) utilizando recursos locais de armazenamento, sem qualquer transmissão a servidores de terceiros.',
          ],
        },
        {
          id: 'seus-direitos',
          title: 'Seus direitos',
          content: [
            'Nos termos da LGPD e do GDPR, você tem o direito de solicitar a confirmação da existência de tratamento dos seus dados, o acesso aos dados que enviou, a correção de dados incompletos ou a eliminação definitiva dos seus dados de contato a qualquer tempo.',
          ],
        },
      ],
    },
    howItWasBuilt: {
      badge: 'Case study',
      headline: 'Como este site foi construído',
      intro:
        'Um portfólio tratado como produto de software: PRD antes da arquitetura, arquitetura antes do código, e o registro honesto das decisões, inclusive as que precisaram ser corrigidas no meio do caminho.',
      metrics: [
        { label: 'riscos registrados', count: 27 },
        { label: 'ADRs com alternativas descartadas', count: 5 },
        { label: 'regras de negócio numeradas', count: 13 },
        { label: 'contradições detectadas e corrigidas', count: 4 },
      ],
      flowNumber: '01',
      flowTitle: 'O fluxo Spec Driven & Harness',
      flowSteps: [
        {
          number: '01',
          title: 'Ideia & Contexto',
          description: 'Documento de referência com escopo, intenção e objetivos',
        },
        {
          number: '02',
          title: 'PRD de Produto',
          description: 'Problema, personas, critérios de sucesso e o que fica fora via skill prd development',
        },
        {
          number: '03',
          title: 'Arquitetura e Contratos',
          description: 'Fonte de verdade técnica com ADRs, modelagem de dados e contratos via skill architecture design',
        },
        {
          number: '04',
          title: 'Spec Kit (.specify)',
          description: 'Especificação funcional (spec.md), plano técnico (plan.md) e lista de tarefas (tasks.md)',
        },
        {
          number: '05',
          title: 'Harness & Execução IA',
          description: 'Implementação guiada com MCPs (Context7, Serena, TestSprite) sob rédeas de regras duráveis',
        },
        {
          number: '06',
          title: 'Deploy & Verificação',
          description: 'Dez gates bloqueantes de CI, testes automatizados e homologação em produção',
        },
      ],
      flowNote:
        'A IA não escreveu este sistema sozinha e nem gerou código a partir de prompts soltos ("vibe coding"). O que está sendo demonstrado é a engenharia de harness: especificação como fonte única da verdade (SDD), autoridade hierárquica (PRD → Architecture → Spec → Plan → Tasks → Code), servidores MCP para contexto em tempo real e verificação contínua contra contratos definidos, com um engenheiro responsável por cada decisão técnica.',
      adrsNumber: '02',
      adrsTitle: 'Decisões que valeram um ADR',
      adrs: [
        {
          id: 'ADR-001',
          title: 'Monolito modular em deploy serverless',
          description:
            'Microserviços descartados: um desenvolvedor, sem SRE e sem plantão, não sustenta operação distribuída.',
          costLabel: 'Custo:',
          cost: 'sem isolamento de falha entre módulos.',
        },
        {
          id: 'ADR-002',
          title: 'Arquitetura hexagonal com custo assumido',
          description:
            'Para um CMS de blog é over engineering pelos critérios normais. A justificativa não é técnica: a testabilidade é parte do que está sendo demonstrado.',
          costLabel: 'Custo:',
          cost: 'mais arquivos e indireção por funcionalidade.',
        },
        {
          id: 'ADR-003',
          title: 'Dois adapters primários: HTTP e in-process',
          description:
            'A página pública chama o caso de uso direto, sem passar por HTTP. Isso mantém o site no ar mesmo se a API cair.',
          costLabel: 'Custo:',
          cost: 'dois caminhos até o dado com risco de divergência de regra.',
        },
        {
          id: 'ADR-004',
          title: 'Monorepo isolado com pnpm workspaces',
          description:
            'Separação física em pacotes desacoplados (domain, application, infrastructure, http). O domínio não possui nenhuma dependência externa (DEP-1).',
          costLabel: 'Custo:',
          cost: 'configuração e orquestração de scripts no monorepo.',
        },
        {
          id: 'ADR-005',
          title: 'Eventos de domínio in-process sem broker',
          description:
            'Publicar dispara a revalidação da página. É o que permite publicar em minutos sem deploy e sem mensageria para operar.',
          costLabel: 'Custo:',
          cost: 'entrega best effort sem retentativa automática.',
        },
      ],
      mistakesNumber: '03',
      mistakesTitle: 'O que eu errei no caminho',
      mistakesIntro:
        'A parte mais útil de documentar decisões é descobrir que duas delas se contradizem. Quatro contradições apareceram só ao cruzar as etapas, e cada uma teria virado defeito em produção.',
      mistakes: [
        {
          title: 'Rollback instantâneo versus migration sem volta',
          description:
            'Reverter o código não reverte o banco. O botão de rollback existiria, e apertá-lo derrubaria o sistema. Resolvido com a regra de que toda migration precisa ser compatível com a versão anterior.',
        },
        {
          title: 'Audit log que dura três dias',
          description:
            'A retenção de log da plataforma é curta. Chamar aquilo de trilha de auditoria seria mentira confortável. Foi renomeado para o que de fato é: visibilidade operacional recente.',
        },
        {
          title: 'Teste de integração em banco compartilhado',
          description:
            'Execuções paralelas de CI se atropelariam, gerando falha intermitente, que é pior que teste nenhum por ensinar a ignorar alertas vermelhos.',
        },
        {
          title: 'Acessibilidade exigida sem validação',
          description:
            'WCAG AA aparecia em três lugares do documento e não existia gate nenhum no pipeline. Um requisito sem verificação é uma intenção.',
        },
      ],
      openDocsTitle: 'Os documentos estão abertos',
      openDocsIntro:
        'PRD, documento de arquitetura completo, contratos OpenAPI e evidências do processo, sem maquiagem para a foto.',
      openDocsLinks: [
        { label: 'Documentação Interativa da API (/api/docs)', href: '/api/docs', isExternal: false },
        { label: 'Relatório de Prontidão e Auditoria de Go Live', href: '/docs/go-live-readiness-report.md', isExternal: false },
        { label: 'PRD Completo (docs/prd.md)', href: 'https://github.com/DaviAfonso88/portifolio/blob/main/docs/prd.md', isExternal: true },
        { label: 'Decisões de Arquitetura (docs/architecture.md)', href: 'https://github.com/DaviAfonso88/portifolio/blob/main/docs/architecture.md', isExternal: true },
        { label: 'Repositório no GitHub', href: 'https://github.com/DaviAfonso88/portifolio', isExternal: true },
      ],
    },

  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      skills: 'Skills',
      knowledge: 'Knowledge',
      experiences: 'Experience',
      projects: 'Projects',
      blog: 'Blog',
      contact: 'Contact',
      howItWasBuilt: 'How it was built',
      privacy: 'Privacy',
    },
    header: {
      themeToggleAria: 'Toggle light/dark theme',
      menuToggleAria: 'Toggle navigation menu',
    },
    footer: {
      colophonTitle: 'Davi Afonso',
      colophonLine1: 'Full Stack Developer & AI Engineering',
      colophonLine2: 'Lagoa Santa, Minas Gerais · Remote & Hybrid',
      contactTitle: 'Contact',
      emailLabel: 'daviafonso5894@gmail.com',
      emailValue: 'daviafonso5894@gmail.com',
      linkedinLabel: 'LinkedIn',
      linkedinUrl: 'https://www.linkedin.com/in/davi-afonso',
      githubLabel: 'GitHub',
      githubUrl: 'https://github.com/DaviAfonso88',
      privacyPolicy: 'Privacy Policy',
      sourceCode: 'Source code of this site',
      sourceCodeUrl: 'https://github.com/DaviAfonso88/portifolio',
      copyright: '© 2026 Davi Afonso',
    },
    home: {
      badge: 'Full Stack Developer & AI Engineering · Brazil',
      headline: 'Software engineering with architectural rigor and end-to-end artificial intelligence.',
      subheadline:
        'Information Systems graduate specializing in C# / .NET, React, clean architecture, and Spec-Driven Development (SDD). From Spec-Kit design to AI test harnessing, I build resilient, auditable enterprise systems.',
      ctaProjects: 'View projects',
      ctaHowBuilt: 'How this site was built',
      stackTitle: 'Core stack',
      stackItems: ['Claude Code', 'AI & Spec-Kit', 'C# / .NET', 'Node.js', 'React', 'TypeScript', 'Next.js', 'PostgreSQL', 'Docker'],
      roleTitle: 'Role',
      roleValue: 'Full Stack (.NET, React) & AI Engineering',
      locationTitle: 'Location',
      locationValue: 'Lagoa Santa, Brazil · Remote / Hybrid',
      availabilityTitle: 'Availability',
      availabilityValue: 'Contract / Full-time / Projects',
      featuredSectionNumber: '01',
      featuredTitle: 'Featured work',
      allProjectsLink: 'All projects →',
      recentWritingNumber: '02',
      recentWritingTitle: 'Recently written',
      allArticlesLink: 'All articles →',
      differentialNumber: '03 — The difference',
      differentialTitle: 'The specification-driven process and AI harness.',
      differentialBody:
        'Specifications as single source of truth (SDD), Model Context Protocol (MCP), agents grounded in durable rules, and documented ADRs. The complete and auditable engineering process behind every line.',
      differentialCta: 'See how it was built',
    },
    about: {
      badge: 'About me',
      headline: 'Bachelor in Information Systems and postgraduate student in Software Architecture with AI at Full Stack Club.',
      paragraphs: [
        'I am a Full Stack Software Developer with a Bachelor degree in Information Systems, currently pursuing postgraduate studies in Software Architecture with AI at Full Stack Club. My work bridges enterprise backend engineering with C#, the .NET ecosystem (ASP.NET Core and Entity Framework), and Node.js (TypeScript and Fastify), with modern and responsive frontend interfaces built with React and Next.js.',
        'As artificial intelligence models write increasingly high quality code, I strategically focus on software architecture, structuring resilient systems, clear contracts, and well bounded domains. At the same time, I never stop studying code deeply and consistently use artificial intelligence throughout my workflow, confident that it sharpens my decisions and makes me an even better professional.',
        'I apply artificial intelligence with engineering discipline and rigor, adopting agentic coding environments (Claude Code, OpenAI Codex, OpenCode, and Kiro), Spec Driven Development (SDD), and Harness Engineering. My goal is ensuring models operate under strict architectural guardrails, API contracts, and automated tests, whether applying hexagonal architecture and DDD or connecting tools via the Model Context Protocol (MCP).',
      ],
      focusTitle: 'Focus',
      focusValue: 'Software Architecture, Full Stack (.NET, Next), and AI Engineering',
      baseTitle: 'Base',
      baseValue: 'Lagoa Santa, Minas Gerais · Brazil',
      languagesTitle: 'Languages',
      languagesValue: 'Portuguese (Native) · English (Intermediate)',
      photoPlaceholder: 'Davi Afonso',
      trajectoryTitle: 'Timeline',
      milestones: [
        {
          year: '2021',
          description: 'Started Information Systems degree.',
        },
        {
          year: '2023',
          description: 'Expanded into Web Full Stack with Node.js, TypeScript, and React, building REST APIs and dynamic user interfaces.',
        },
        {
          year: '2024',
          description: 'Delivered production platforms like SaltWeb and FIT.IA, combining React, Tailwind CSS, and AI services.',
        },
        {
          year: '2025',
          description: 'Engineering at Rumo Soluções, OS system built from scratch, and led internal company workshops on AI, SDD, and Harness Engineering.',
        },
        {
          year: '2026',
          description: 'Postgraduate studies in Software Architecture with AI at Full Stack Club and launch of DaviDev with hexagonal monorepo architecture and specification driven engineering.',
        },
      ],
    },
    skills: {
      badge: 'Skills',
      headline: 'What I build with, and where I apply it.',
      intro:
        'My specializations in artificial intelligence and context engineering, backed by software architecture, backend, frontend, and infrastructure.',
      categories: [
        {
          number: '01',
          title: 'Artificial Intelligence & Context Engineering',
          items: [
            {
              name: 'Spec Driven Development (SDD) & Spec Kit',
              description:
                'Methodology where the specification serves as the single source of truth. Strict artifact authority hierarchy (PRD, Architecture, Spec, Plan, Tasks, Code), standardized Spec Kit workflows, and clear separation between product intent and executable spec.',
            },
            {
              name: 'Claude Code, Codex, OpenCode & Kiro',
              description:
                'Hands on mastery of leading agentic coding environments and autonomous CLI tools (Claude Code, OpenAI Codex, OpenCode, and Kiro). Leveraging terminal agents for semantic refactoring, automated test execution, shell integration, and rigorous specification adherence.',
            },
            {
              name: 'Model Context Protocol (MCP)',
              description:
                'Orchestration of the universal connection of AI linking agents to real time tools and data: Context7 (up to date official docs), Serena (symbol level semantic code navigation via LSP), and TestSprite (automated test generation and quality verification).',
            },
            {
              name: 'Harness Engineering & Sandboxing',
              description:
                'Building complete infrastructure around LLMs: durable governance rules (constitution.md), strict permission sandboxes, persistent memory, and automated verification feedback loops preventing hallucinations.',
            },
            {
              name: 'Agent & Subagent Orchestration',
              description:
                'Coordinating specialized subagent teams (code reviewer with severity levels, dotnet best practices, explore, planner) and automating enterprise development procedures via packaged skills.',
            },
            {
              name: 'Structured Prompt Engineering & LLMs',
              description:
                'Advanced foundation models (Claude, GPT, Gemini) integrated with strict JSON and Zod schema validation, structured retries, and deterministic outputs.',
            },
          ],
        },
        {
          number: '02',
          title: 'Software Architecture',
          items: [
            {
              name: 'Scalability',
              description:
                'Horizontal and vertical scaling strategies, fault isolation, service decoupling, and traffic spike tolerance without system degradation.',
            },
            {
              name: 'Distributed Cache',
              description:
                'Caching layers with precise invalidation policies, cache aside and write through patterns to drastically reduce latency and relieve the primary database.',
            },
            {
              name: 'Load Balancers',
              description:
                'Intelligent traffic distribution across instances, health check monitoring, and secure connection termination to ensure high availability.',
            },
            {
              name: 'Indexes',
              description:
                'Design of composite, B tree, and partial indexes, execution plan optimization with explain analyze, and elimination of expensive table scans.',
            },
            {
              name: 'Pagination',
              description:
                'Implementation of cursor based and keyset pagination for high volume datasets, eliminating traditional offset bottlenecks and redundant reads.',
            },
            {
              name: 'Hexagonal Architecture & DDD',
              description:
                'Strict isolation of core domain and use cases, ensuring zero framework or database dependencies in the business layer through ports and adapters.',
            },
          ],
        },
        {
          number: '03',
          title: 'Backend & APIs',
          items: [
            {
              name: 'REST APIs',
              description:
                'Resource oriented RESTful services utilizing standard HTTP verbs, precise status codes, idempotency, and OpenAPI specification compliance.',
            },
            {
              name: 'JWT & Claims',
              description:
                'Issuance and verification of signed JSON Web Tokens, structuring Claims for role and context based fine grained authorization.',
            },
            {
              name: 'Access Token & Refresh Token',
              description:
                'Authentication architecture using short lived Access Tokens and rotating Refresh Tokens for resilient and secure credential renewal.',
            },
            {
              name: 'OAuth 2.0',
              description:
                'Implementation of modern authorization flows with external providers, scoped permissions, and secure third party access delegation.',
            },
            {
              name: 'Cookies',
              description:
                'Secure credential storage utilizing HttpOnly, Secure, and SameSite flags to mitigate token theft through XSS and prevent CSRF exploits.',
            },
            {
              name: 'BCrypt',
              description:
                'One way password hashing with automatic salting and adaptable work factors, ensuring protection against dictionary and rainbow table attacks.',
            },
            {
              name: 'CORS',
              description:
                'Granular Cross Origin Resource Sharing policies, strictly controlling permitted origins, allowed HTTP methods, and exposed headers.',
            },
            {
              name: 'C# / .NET',
              description:
                'Robust API and service development with ASP.NET Core, Entity Framework Core, and LINQ, applying enterprise architecture, dependency injection, and MVC patterns.',
            },
            {
              name: 'Node.js · TypeScript',
              description:
                'Scalable REST API development with strict TypeScript typing, validated schemas with Zod, and clear layer boundaries.',
            },
            {
              name: 'Fastify & Express',
              description:
                'High performance HTTP server development with dependency injection and decoupling from core business logic.',
            },
          ],
        },
        {
          number: '04',
          title: 'Frontend & Interface',
          items: [
            {
              name: 'React & Next.js 15',
              description:
                'Modern web applications utilizing App Router, React Server Components (RSC), custom hooks, and rendering optimizations.',
            },
            {
              name: 'Tailwind CSS & Design Tokens',
              description:
                'Accessible, responsive, and semantic user interfaces with design tokens, native light or dark theme, and WCAG AA compliance.',
            },
            {
              name: 'Advanced TypeScript',
              description:
                'Advanced static typing, constrained generics, and discriminated unions preventing runtime contract mismatches across stack boundaries.',
            },
          ],
        },
        {
          number: '05',
          title: 'Databases & Infrastructure',
          items: [
            {
              name: 'PostgreSQL & MySQL',
              description:
                'Relational database design with declarative integrity, foreign keys, constraints, and versioned migrations via Drizzle and EF Core.',
            },
            {
              name: 'Neon & Supabase',
              description:
                'Serverless PostgreSQL databases with instant environment branching, high scale connection pooling, and managed backend services.',
            },
            {
              name: 'Upstash Redis',
              description:
                'Serverless distributed caching and edge rate limiting with ultra low latency HTTP and REST connectivity.',
            },
            {
              name: 'Pipelines and Releases CI/CD',
              description:
                'Full automation with GitHub Actions, test suite execution, static architectural boundary audits, and continuous deployments without manual steps.',
            },
            {
              name: 'Docker',
              description:
                'Reproducible containerized environments for development and production, ensuring parity between local machines and cloud servers.',
            },
            {
              name: 'MongoDB',
              description:
                'Document oriented persistence for flexible catalogs and non relational collections with optimized indexing and aggregation queries.',
            },
          ],
        },
      ],
    },
    knowledge: {
      badge: 'Knowledge',
      headline: 'The concepts that guide my choices.',
      intro:
        'A skill is the tool; knowledge is knowing when not to use it. Here are the core foundations of AI, specification, and architecture I use to make engineering decisions and the price each one demands.',
      items: [
        {
          title: 'Spec Driven Development and Authority Hierarchy',
          tag: 'Applied',
          description:
            'Code is not the starting point; it is the final consequence of specification. Strict respect for artifact authority: PRD for product intent, Architecture for structure, Specification for contracts, Plan for technical design, Tasks for execution, and Code as the verifiable result. No line is produced without verified contracts.',
          costLabel: 'The Tradeoff',
          cost: 'Requires discipline and upfront time before implementation. Skipping this yields short term speed on day one, followed by months of architectural debt and product misalignment.',
        },
        {
          title: 'Harness Engineering in the AI Era',
          tag: 'Applied',
          description:
            'The language model is only the reasoning engine; the harness is the complete surrounding infrastructure that guides, controls, and makes it reliable. It encompasses durable house rules, safe execution tools, strict permission guardrails, targeted context, persistent memory, and continuous automated verification loops.',
          costLabel: 'The Tradeoff',
          cost: 'Keeping the harness calibrated as the system grows requires continuous maintenance of rules and context. Without this infrastructure, even the most capable model hallucinates and violates domain invariants.',
        },
        {
          title: 'Hexagonal Architecture (Ports and Adapters)',
          tag: 'Applied',
          description:
            'Domain logic and use cases completely decoupled from frameworks, HTTP servers, and database drivers. The primary benefit is testability of pure business logic in memory without running external infrastructure, protecting software longevity against obsolescence.',
          costLabel: 'The Tradeoff',
          cost: 'More files and indirection per feature. For small CRUD applications it introduces unnecessary complexity, becoming justified when testability and long term maintenance are primary goals.',
        },
        {
          title: 'Distributed Caching and Invalidation Strategies',
          tag: 'Applied',
          description:
            'Deploying distributed caching layers with Upstash Redis, applying cache aside and write through patterns for database relief and ultra low latency. Balanced engineering decisions between strong and eventual consistency with predictable time to live (TTL) expiration policies.',
          costLabel: 'The Tradeoff',
          cost: 'Cache invalidation is a classic computing challenge. It requires careful governance to prevent reading stale data and introduces distributed state synchronization into the system.',
        },
        {
          title: 'Stateless Authentication and Defense in Depth',
          tag: 'Applied',
          description:
            'End to end security with short lived JSON Web Tokens, typed claims for fine grained authorization, and automatic rotation of Refresh Tokens. Mitigating XSS and CSRF vectors through HttpOnly cookies, CORS policies, and BCrypt password hashing.',
          costLabel: 'The Tradeoff',
          cost: 'Stateless tokens cannot be revoked instantly without an auxiliary blocklist or credential versioning mechanism, requiring careful balance in token expiration windows.',
        },
        {
          title: 'Relational Integrity at the Database Level',
          tag: 'Applied',
          description:
            'Whenever a business invariant can be enforced by a database constraint, it must be. Uniqueness, cascade deletion, and state transitions guaranteed by PostgreSQL or Neon cannot be bypassed by buggy code or incorrect automated changes.',
          costLabel: 'The Tradeoff',
          cost: 'Less flexibility during rapid migrations and raw database error messages requiring translation layers for user feedback.',
        },
      ],
    },
    experiences: {
      badge: 'Experience',
      headline: 'What I built, and where I delivered value.',
      intro:
        'Professional trajectory uniting technical leadership in artificial intelligence, corporate enablement, Full Stack engineering (.NET, React), and process automation.',
      positions: [
        {
          period: '2026 — Present',
          company: 'Rumo Soluções',
          role: 'Junior Developer Analyst',
          regime: 'Full-time · Hybrid · Lagoa Santa, Brazil',
          summary:
            'Engineering scalable enterprise systems, leading corporate Artificial Intelligence training initiatives, business process automation (RPA), and specification-driven software architecture.',
          highlights: [
            'Conducted company-wide internal training sessions and workshops for all employees on Applied AI, Spec-Driven Development (SDD), Spec-Kit, and Harness Engineering, empowering the team to transition from ad-hoc prompt generation to disciplined, auditable workflows.',
            'Architected and built the Work Order (OS / CRC Project) management system from scratch using .NET, React, and Docker, establishing a strict corporate harness with durable rules (immutable frozen snapshot, universal soft delete, and linear OS lifecycle).',
            'Engineered AI-powered solutions for automated technical documentation generation, Azure DevOps wikis, and development process standardization.',
            'Integrated and orchestrated Model Context Protocol (MCP) servers — including Context7 for real-time documentation, Serena for LSP semantic navigation, and TestSprite for automated quality control.',
            'Adopted and trained engineering staff on advanced agentic coding tools (Claude Code, OpenAI Codex, OpenCode, and Kiro) integrated with Spec-Kit to accelerate delivery and enforce software quality standards.',
            'Engineered and scaled critical enterprise features focused on high availability, stability, and business domain requirements.',
            'Built automated process workflows (RPA) and efficient data pipelines across distributed enterprise platforms.',
          ],
          technologies: [
            'Claude Code',
            'Codex',
            'OpenCode',
            'Kiro',
            'Artificial Intelligence',
            'Spec-Driven Dev',
            'Spec-Kit',
            'Harness Engineering',
            'Model Context Protocol (MCP)',
            '.NET / C#',
            'React',
            'Docker',
            'TypeScript',
            'PostgreSQL',
            'RPA',
          ],
        },
        {
          period: '2025 — 2026',
          company: 'Rumo Soluções',
          role: 'Web Development Intern',
          regime: 'Internship · Hybrid · Lagoa Santa, Brazil',
          summary:
            'Technical support across the full web development lifecycle, crafting user interfaces, maintaining backend services, integration testing, and early AI automations.',
          highlights: [
            'Built responsive, modern web interfaces matching corporate design guidelines, usability standards, and design tokens.',
            'Investigated and resolved bugs, refactored legacy components, and authored technical documentation for API endpoints and system architectures.',
            'Collaborated within an agile team participating in daily standups, sprint planning, and peer code reviews.',
          ],
          technologies: ['JavaScript', 'TypeScript', 'HTML5 & CSS3', 'React', 'Node.js', 'Git', 'SQL'],
        },
        {
          period: '2023 — Present',
          company: 'Independent Software Projects & Digital Solutions',
          role: 'Full Stack Software Developer',
          regime: 'Projects · Remote / Hybrid',
          summary:
            'End-to-end design, architecture, and delivery of web applications for clients and community organizations, uniting responsive frontends, resilient backends, and applied AI.',
          highlights: [
            'Built the DaviDev platform with strict hexagonal architecture, pnpm monorepo structure, Next.js 15, and in-process Fastify, with the entire Spec-Driven Development process open-sourced.',
            'Engineered the FIT.IA assistant, integrating generative AI with an Express backend and React frontend for customized fitness and nutrition plans.',
            'Architected and deployed the SaltWeb platform for PIB Lagoa Santa youth, delivering high performance and community engagement.',
          ],
          technologies: ['React', 'Next.js 15', 'TypeScript', 'Node.js', 'Hexagonal Architecture', 'Fastify', 'Generative AI', 'PostgreSQL', 'Docker'],
        },
      ],
    },
    projects: {
      badge: 'Projects',
      headline: 'Problem, decision, outcome.',
      intro:
        'Every project starts with the business problem and the concrete outcome, clear for hiring managers. Deep technical architecture follows for engineering review.',
      items: [
        {
          slug: 'davidev-portfolio-produto',
          title: 'DaviDev: Portfolio as a Software Product',
          status: 'In production',
          period: '2026',
          stack: ['Next.js 15', 'Fastify', 'PostgreSQL', 'Drizzle', 'Hexagonal'],
          problem:
            'Static resume PDFs fail to demonstrate code maturity, architectural quality, and true software engineering rigor.',
          result:
            'Engineered as a production software product: hexagonal architecture in a pnpm monorepo, editorial blog with ISR, protected CMS, and public PRD.',
          role: 'Sole engineer responsible for specification, architecture, and implementation.',
          detailLink: 'View technical details →',
          summary:
            'Editorial blog, CMS, documented REST API, and hexagonal monorepo with the complete engineering process open source.',
          engineeringChallenge:
            'Enforce global LCP under 2.5s and zero external dependencies in domain package, with in process serverless execution between Next.js and Fastify.',
          decisions: [
            {
              title: 'Strict Hexagonal Architecture in Monorepo',
              desc: 'The core domain package (@davidev/domain) contains zero external dependencies, guaranteeing absolute business rule portability.',
              tradeoff: 'Higher number of layers and abstraction interfaces.',
            },
            {
              title: 'In Process Serverless Fastify inside Next.js',
              desc: 'The same Fastify API with Zod validation handles HTTP endpoints and can be executed in process by React Server Components without network overhead.',
              tradeoff: 'Custom request translation adapters required.',
            },
          ],
        },
        {
          slug: 'saltweb',
          title: 'SaltWeb: Youth Community Web Platform',
          status: 'Completed',
          period: '2024',
          stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
          problem:
            'The youth ministry of PIB Lagoa Santa needed a centralized digital platform for event management, youth engagement, and contemporary visual identity.',
          result:
            'Fast, responsive, and modern web platform delivered, streamlining event announcements, member integration, and youth communications.',
          role: 'Frontend Developer and UI Designer.',
          detailLink: 'View technical details →',
          summary:
            'Interactive web application for youth community developed with React, TypeScript, and Tailwind CSS with responsive, engagement first design.',
          engineeringChallenge:
            'Create a seamless experience with instantaneous mobile loading and a responsive design aligned with modern youth culture.',
          decisions: [
            {
              title: 'Tailwind CSS for Visual Consistency',
              desc: 'Utilized Tailwind utility classes to ensure typographic harmony and adaptable mobile first layouts.',
              tradeoff: 'Utility class accumulation requiring modular component breakdown.',
            },
            {
              title: 'Vite as Fast Build Tool',
              desc: 'Adopted Vite for ultra fast bundling and efficient Hot Module Replacement (HMR) during development.',
              tradeoff: 'Manual client side routing configuration.',
            },
          ],
        },
        {
          slug: 'fit-ia',
          title: 'FIT.IA: AI Powered Workout & Nutrition Assistant',
          status: 'Completed',
          period: '2024',
          stack: ['Node.js', 'Express', 'React', 'Generative AI', 'Tailwind CSS'],
          problem:
            'Fitness enthusiasts often struggle to create and adapt workout and nutritional plans tailored to their specific fitness goals in an accessible manner.',
          result:
            'Complete application delivering automated, personalized workout routines and nutritional guidance based on individual profiles and goals.',
          role: 'Full Stack Developer (Node.js/Express backend API and React frontend interface).',
          detailLink: 'View technical details →',
          summary:
            'Integrated system leveraging generative AI to structure personalized diets and workout plans through an intuitive user interface.',
          engineeringChallenge:
            'Engineer consistent prompt structures and sanitize LLM outputs to guarantee predictable, typed data schemas for the frontend.',
          decisions: [
            {
              title: 'Schema Validation & Sanitization',
              desc: 'Strict validation of model output payloads before returning data to the client, preventing UI layout breaks from malformed responses.',
              tradeoff: 'Additional retry overhead if response violates expected schema.',
            },
            {
              title: 'Strict Client Server Decoupling',
              desc: 'Express backend encapsulates API keys and prompt engineering logic, isolated from client side visibility.',
              tradeoff: 'Need to manage asynchronous network latency states in the UI.',
            },
          ],
        },
        {
          slug: 'sales-web-mvc',
          title: 'SalesWebMvc: Sales & Department Management',
          status: 'Completed',
          period: '2023',
          stack: ['C# / .NET', 'ASP.NET Core MVC', 'Entity Framework Core', 'MySQL'],
          problem:
            'Organizations require centralized tracking of sales records, seller associations, and departmental groupings with date filtered analytical reporting.',
          result:
            'Corporate MVC application featuring complete CRUD operations, relational integrity exception handling, and grouped analytical reporting.',
          role: 'Backend / C# Developer.',
          detailLink: 'View technical details →',
          summary:
            'Enterprise web application in ASP.NET Core MVC and Entity Framework Core for transactional sales management with robust domain validation.',
          engineeringChallenge:
            'Ensure relational consistency, foreign key constraints during cascade deletions, and optimized LINQ grouping queries.',
          decisions: [
            {
              title: 'Entity Framework Core Code First',
              desc: 'Domain modeling in C# POCO classes with ORM mapping and automated migrations in MySQL.',
              tradeoff: 'Dependency on framework migration cycles.',
            },
            {
              title: 'Service Layer for Business Logic',
              desc: 'Decoupled Controllers from DbContext using dedicated service classes with native .NET dependency injection.',
              tradeoff: 'More boilerplate classes and constructor injections.',
            },
          ],
        },
        {
          slug: 'api-de-produtos',
          title: 'Product Catalog RESTful API',
          status: 'Completed',
          period: '2023',
          stack: ['Node.js', 'Express', 'MongoDB', 'Mongoose'],
          problem:
            'Need for a flexible catalog service to manage product inventory with dynamic attributes and high read performance.',
          result:
            'Efficient RESTful API providing full CRUD endpoints, attribute based filtering, input validation, and document persistence.',
          role: 'Backend Developer.',
          detailLink: 'View technical details →',
          summary:
            'Backend API with Node.js and MongoDB for product catalog management with pagination, filtering, and document based persistence.',
          engineeringChallenge:
            'Structure Mongoose schemas with required field validations and uniform HTTP error response handling.',
          decisions: [
            {
              title: 'MongoDB for Catalog Flexibility',
              desc: 'Allowed diverse product categories to have specific attributes without rigid SQL schema migrations.',
              tradeoff: 'No database enforced foreign key relational constraints.',
            },
            {
              title: 'Global Error Handling Middleware',
              desc: 'Centralized Express error handling returning semantic HTTP status codes and structured error messages.',
              tradeoff: 'Requires careful next(err) error forwarding across async functions.',
            },
          ],
        },
      ],
    },
    contact: {
      badge: 'Contact',
      headline: 'Let’s talk.',
      intro:
        'Career opportunities, projects, or questions regarding engineering and architecture, I respond to all messages. Direct channels are also available below.',
      emailLabel: 'Direct email',
      emailValue: 'daviafonso5894@gmail.com',
      linkedinLabel: 'LinkedIn',
      linkedinHandle: '/in/davi-afonso',
      githubLabel: 'GitHub',
      githubHandle: '/DaviAfonso88',
      privacyNotice:
        'Your message is stored securely for 24 months solely to respond to your inquiry. No identifiable IP addresses are recorded.',
      form: {
        nameLabel: 'Name',
        namePlaceholder: 'Your full name',
        emailLabel: 'Email',
        emailPlaceholder: 'your.email@company.com',
        subjectLabel: 'Subject',
        subjectPlaceholder: 'E.g., Project proposal or senior backend opportunity',
        messageLabel: 'Message',
        messagePlaceholder: 'Describe your proposal, technical challenge, or reason for reaching out...',
        charCount: 'characters',
        turnstileVerified: 'Anti spam verification complete',
        turnstileVerifying: 'Verifying anti spam...',
        turnstileRequired: 'Please complete the anti spam verification before sending.',
        privacyAgreement: 'By submitting, you agree to the data handling terms in our privacy policy.',
        submitButton: 'Send message',
        submittingButton: 'Sending message...',
        successMessage: 'Message received successfully! I will get back to you shortly.',
        errorMessage: 'Unable to send message at this time. Please try again or reach out via email.',
        rateLimitError: 'Rate limit reached for this period (maximum 3 messages per hour). Please try again later.',
        errors: {
          nameRequired: 'Please provide your name (up to 120 characters).',
          emailInvalid: 'Please provide a valid email address.',
          messageLength: 'Message must be between 10 and 5000 characters.',
        },
      },
    },
    privacy: {
      badge: 'Privacy Policy',
      headline: 'What this website stores about you',
      lastUpdated: 'Effective from 2026',
      laws: 'Compliance with LGPD and GDPR',
      summaryTitle: 'Summary',
      summaryText:
        'The only information this website retains about you is what you voluntarily submit via the contact form. There are no third-party tracking cookies, no user profiling, and your IP address is never stored in an identifiable form.',
      table: {
        title: 'Data Retention Periods',
        headers: ['Data Collected', 'Retention Duration'],
        rows: [
          ['Contact messages (name, email, text)', '24 months (permanent deletion)'],
          ['Derived IP hash (temporary rate limiting)', 'A few minutes in memory'],
          ['Theme & language preferences', 'Local storage in your browser'],
        ],
      },
      sections: [
        {
          id: 'o-que-e-coletado',
          title: 'What is collected',
          content: [
            'When submitting the contact form, we store your name, email, optional subject, and the message content. Nothing else. The legal basis is your explicit consent upon submission, used exclusively to respond to your communication.',
            'To prevent abuse and automated spam, source IP addresses are hashed in memory for short-lived rate-limiting counters and discarded immediately. Raw IP addresses are never persisted.',
          ],
        },
        {
          id: 'por-quanto-tempo',
          title: 'Retention period',
          content: [
            'Submitted contact messages are retained for a maximum of 24 months for professional record-keeping and auditability, after which they are permanently expunged.',
            'You may request deletion of your submitted messages at any time via direct email.',
          ],
        },
        {
          id: 'cookies-e-medicao',
          title: 'Cookies and analytics',
          content: [
            'This website does not use tracking cookies, social pixels, or targeted advertising trackers.',
            'Your browser may store only your theme preference (light/dark) and locale preference (PT/EN) using local browser storage without transmitting personal data to third parties.',
          ],
        },
        {
          id: 'seus-direitos',
          title: 'Your rights',
          content: [
            'Under LGPD and GDPR, you have the right to request confirmation of data processing, access your submitted data, request correction of incomplete data, or demand permanent erasure of your contact records at any time.',
          ],
        },
      ],
    },
    howItWasBuilt: {
      badge: 'Case study',
      headline: 'How this website was built',
      intro:
        'A portfolio treated as high caliber software: PRD before architecture, architecture before code, and transparent documentation of decisions, including those that were revised along the way.',
      metrics: [
        { label: 'risks recorded and mitigated', count: 27 },
        { label: 'ADRs with evaluated trade-offs', count: 5 },
        { label: 'numbered & tested business rules', count: 13 },
        { label: 'contradictions detected and resolved', count: 4 },
      ],
      flowNumber: '01',
      flowTitle: 'The Spec Driven & Harness Flow',
      flowSteps: [
        {
          number: '01',
          title: 'Idea & Framing',
          description: 'Reference document defining scope, intent, and objectives',
        },
        {
          number: '02',
          title: 'Product PRD',
          description: 'Problem framing, personas, success metrics, and out of scope boundaries via prd development skill',
        },
        {
          number: '03',
          title: 'Architecture & Contracts',
          description: 'Technical source of truth with ADRs, data models, and contracts via architecture design skill',
        },
        {
          number: '04',
          title: 'Spec Kit (.specify)',
          description: 'Functional specification (spec.md), technical plan (plan.md), and task breakdown (tasks.md)',
        },
        {
          number: '05',
          title: 'Harness & AI Execution',
          description: 'Guided implementation using MCPs (Context7, Serena, TestSprite) under durable governance rules',
        },
        {
          number: '06',
          title: 'Deploy & Verification',
          description: 'Ten blocking CI gates, automated test suites, and production verification',
        },
      ],
      flowNote:
        'AI did not write this system alone, nor was code generated from loose prompts ("vibe coding"). What is showcased is harness engineering: specification as single source of truth (SDD), hierarchical authority (PRD → Architecture → Spec → Plan → Tasks → Code), MCP servers for real time grounding, and automated test loops, with a human engineer accountable for every architectural decision.',
      adrsNumber: '02',
      adrsTitle: 'Decisions that warranted an ADR',
      adrs: [
        {
          id: 'ADR-001',
          title: 'Modular monolith in serverless deployment',
          description:
            'Microservices rejected: a single engineer without dedicated SRE or on-call cannot sustain distributed operations.',
          costLabel: 'Trade-off:',
          cost: 'no fault isolation between modules.',
        },
        {
          id: 'ADR-002',
          title: 'Hexagonal architecture with deliberate overhead',
          description:
            'Over engineering for a typical blog CMS. The justification is educational: extreme testability is part of what is being demonstrated.',
          costLabel: 'Trade-off:',
          cost: 'more files and layer indirection per feature.',
        },
        {
          id: 'ADR-003',
          title: 'Dual primary adapters: HTTP and in-process',
          description:
            'Public RSC pages call the use cases directly without HTTP loopback. This keeps the website responsive even during API spikes.',
          costLabel: 'Trade-off:',
          cost: 'two paths to data with risk of rule divergence.',
        },
        {
          id: 'ADR-004',
          title: 'Isolated monorepo with pnpm workspaces',
          description:
            'Physical boundary separation into decoupled packages (domain, application, infrastructure, http). Domain holds zero external dependencies (DEP-1).',
          costLabel: 'Trade-off:',
          cost: 'monorepo workspace tooling and orchestration overhead.',
        },
        {
          id: 'ADR-005',
          title: 'In-process domain events without message broker',
          description:
            'Publishing triggers page revalidation directly. Allows publishing in seconds without infrastructure messaging overhead.',
          costLabel: 'Trade-off:',
          cost: 'best effort delivery without automated retries.',
        },
      ],
      mistakesNumber: '03',
      mistakesTitle: 'What I got wrong along the way',
      mistakesIntro:
        'The most valuable part of documenting decisions is discovering when two of them contradict each other. Four critical contradictions emerged during phase review, each would have become an outage in production.',
      mistakes: [
        {
          title: 'Instant rollback versus irreversible migrations',
          description:
            'Reverting code does not revert the database. An instant rollback button would crash the app. Resolved by mandating backward compatible database migrations.',
        },
        {
          title: 'Audit log lasting only 3 days',
          description:
            'Platform log retention is short. Calling it an audit trail was a comfortable lie. Renamed to what it actually is: recent operational visibility.',
        },
        {
          title: 'Integration tests on shared database',
          description:
            'Parallel CI executions would collide, causing flaky tests, which is worse than no tests because it teaches developers to ignore red builds.',
        },
        {
          title: 'Accessibility required without verification',
          description:
            'WCAG AA was mentioned three times in specs, but had zero pipeline gates. A requirement without automated verification is merely good intentions.',
        },
      ],
      openDocsTitle: 'Open documentation & evidence',
      openDocsIntro:
        'PRD, comprehensive architecture spec, OpenAPI contracts, and process evidence, presented as they were written, without cosmetic cleaning.',
      openDocsLinks: [
        { label: 'Interactive API Documentation (/api/docs)', href: '/api/docs', isExternal: false },
        { label: 'Go Live Readiness & Audit Report', href: '/docs/go-live-readiness-report.md', isExternal: false },
        { label: 'Complete PRD (docs/prd.md)', href: 'https://github.com/DaviAfonso88/portifolio/blob/main/docs/prd.md', isExternal: true },
        { label: 'Architecture Decisions (docs/architecture.md)', href: 'https://github.com/DaviAfonso88/portifolio/blob/main/docs/architecture.md', isExternal: true },
        { label: 'Repository on GitHub', href: 'https://github.com/DaviAfonso88/portifolio', isExternal: true },
      ],
    },

  },
};

export function getDictionary(locale: string): Dictionary {
  return dictionaries[locale] || dictionaries['pt-BR'];
}
