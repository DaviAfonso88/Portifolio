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
      colophonTitle: 'Colofão',
      colophonLine1: 'Next.js 15 · Fastify · PostgreSQL/Neon · Drizzle',
      colophonLine2: 'Arquitetura hexagonal · deploy na Vercel',
      contactTitle: 'Contato',
      emailLabel: 'contato@davidev.net.br',
      emailValue: 'contato@davidev.net.br',
      linkedinLabel: 'LinkedIn',
      linkedinUrl: 'https://linkedin.com/in/davi-dev',
      githubLabel: 'GitHub',
      githubUrl: 'https://github.com/davidev',
      privacyPolicy: 'Política de privacidade',
      sourceCode: 'Código-fonte deste site',
      sourceCodeUrl: 'https://github.com/davidev/portfolio',
      copyright: '© 2026 davidev.net.br',
    },
    home: {
      badge: 'Desenvolvedor full-stack · Brasil',
      headline: 'Construo sistemas — e mostro como foram construídos.',
      subheadline:
        'Arquitetura, backend e automação de coleta de dados em produção. Este site é, ele próprio, um estudo de caso: PRD, arquitetura, especificação e implementação assistida por IA — tudo público.',
      ctaProjects: 'Ver projetos',
      ctaHowBuilt: 'Como este site foi construído',
      stackTitle: 'Stack em uso',
      stackItems: ['TypeScript', 'Next.js', 'Fastify', 'C# / .NET', 'PostgreSQL', 'Hexagonal'],
      roleTitle: 'Atuação',
      roleValue: 'Backend & Arquitetura',
      locationTitle: 'Base',
      locationValue: 'Brasil · Remoto',
      availabilityTitle: 'Disponibilidade',
      availabilityValue: 'PJ / CLT / Consultoria',
      featuredSectionNumber: '01',
      featuredTitle: 'Em destaque',
      allProjectsLink: 'Todos os projetos →',
      recentWritingNumber: '02',
      recentWritingTitle: 'Escrito recentemente',
      allArticlesLink: 'Todos os artigos →',
      differentialNumber: '03 — O diferencial',
      differentialTitle: 'O processo também está aberto.',
      differentialBody:
        'PRD, documento de arquitetura com 5 ADRs, especificações e o registro das decisões que não deram certo. A página de case study mostra o caminho inteiro — não só o resultado.',
      differentialCta: 'Ler o case study',
    },
    about: {
      badge: 'Sobre mim',
      headline: 'Comecei consertando o que quebrava. Continuo por ali.',
      paragraphs: [
        'Minha trajetória em engenharia de software foi moldada pela resolução de problemas reais de confiabilidade e escala. O fascínio não estava na novidade da tecnologia pela novidade, mas em compreender como sistemas complexos falham sob pressão.',
        'Hoje atuo principalmente com backend, sistemas distribuídos e automação: plataformas que operam ininterruptamente sem supervisão manual constante. É uma disciplina de engenharia que perdoa pouco e ensina rápido a distância entre software que funciona localmente e sistemas resilientes em produção.',
        'Meu foco atual é projetar e implementar sistemas limpos, orientados a domínio (DDD) com fronteiras arquiteturais rígidas, banco de dados com integridade declarativa e pipelines de engenharia assistida por inteligência artificial.',
      ],
      focusTitle: 'Foco',
      focusValue: 'Backend, arquitetura e automação',
      baseTitle: 'Base',
      baseValue: 'Brasil · 100% Remoto',
      languagesTitle: 'Idiomas',
      languagesValue: 'Português (Nativo) · Inglês (Avançado)',
      photoPlaceholder: 'Foto Profissional',
      trajectoryTitle: 'Trajetória',
      milestones: [
        {
          year: '2021',
          description: 'Início na engenharia de dados e robôs de raspagem de alto volume.',
        },
        {
          year: '2023',
          description: 'Consolidação de arquiteturas orientadas a eventos e workers resilientes em .NET e Node.',
        },
        {
          year: '2026',
          description: 'Publicação do DaviDev com o processo completo de engenharia aberto.',
        },
      ],
    },
    skills: {
      badge: 'Habilidades',
      headline: 'O que eu uso, e onde usei.',
      intro:
        'Sem barras de proficiência e sem notas de 1 a 5 — elas não significam nada para quem lê. Cada item diz onde a tecnologia foi aplicada e para quê.',
      categories: [
        {
          number: '01',
          title: 'Backend e domínio',
          items: [
            {
              name: 'C# / .NET',
              description:
                'Workers de longa duração em produção — coleta contínua, integração com APIs de terceiros e reprocessamento tolerante a falha.',
            },
            {
              name: 'Node.js · TypeScript',
              description:
                'API REST do DaviDev sob arquitetura hexagonal, com contrato OpenAPI gerando o client do frontend.',
            },
            {
              name: 'Fastify',
              description:
                'Adapter HTTP isolado do domínio, com validação Zod e documentação OpenAPI gerada a partir dos schemas.',
            },
            {
              name: 'Arquitetura Hexagonal',
              description:
                'Separação rígida de Domínio, Aplicação e Infraestrutura garantindo zero dependência de framework no core.',
            },
          ],
        },
        {
          number: '02',
          title: 'Dados e persistência',
          items: [
            {
              name: 'PostgreSQL',
              description:
                'Modelagem relacional em que regra de negócio vira constraint — unicidade de slug e histórico de redirecionamento garantidos pelo banco.',
            },
            {
              name: 'MongoDB',
              description:
                'Acervo de dados em alto volume, com particionamento de catálogo e pipeline produtor/consumidor.',
            },
            {
              name: 'Drizzle ORM',
              description:
                'Migrations versionadas em política forward-only, com compatibilidade estrita entre deploys contínuos.',
            },
          ],
        },
        {
          number: '03',
          title: 'Frontend & Ferramentas',
          items: [
            {
              name: 'Next.js 15+ (App Router)',
              description:
                'Renderização incremental (ISR) com Server Components, streaming via Suspense e revalidação sob demanda.',
            },
            {
              name: 'Tailwind CSS & Tokens',
              description:
                'Design system editorial com suporte nativo a tema claro e escuro, contraste WCAG AA verificado.',
            },
            {
              name: 'Docker & CI/CD',
              description:
                'Contêineres de desenvolvimento, pipelines de lint, verificação de dependências com dependency-cruiser e testes automatizados.',
            },
          ],
        },
      ],
    },
    knowledge: {
      badge: 'Conhecimentos',
      headline: 'Os conceitos que sustentam as escolhas.',
      intro:
        'Habilidade é a ferramenta; conhecimento é saber quando ela não serve. Aqui estão os fundamentos que uso para decidir — e o custo que cada um cobra.',
      items: [
        {
          title: 'Arquitetura Hexagonal (Ports & Adapters)',
          tag: 'Aplico',
          description:
            'Domínio e casos de uso independentes de framework, HTTP e banco. O ganho real não é elegância estética: é conseguir testar regra de negócio sem subir infraestrutura.',
          costLabel: 'O custo',
          cost: 'Mais arquivos e mais indireção por funcionalidade. Em sistemas pequenos é over-engineering — e só se justifica quando a testabilidade e o ciclo de vida longo valem o preço.',
        },
        {
          title: 'Domain-Driven Design (DDD Tático)',
          tag: 'Aplico',
          description:
            'Agregados com fronteira explícita, linguagem ubíqua sem sinônimos ambíguos e regras de negócio numeradas — para que o código e a conversa usem as mesmas palavras.',
          costLabel: 'O custo',
          cost: 'Exige disciplina constante de nomenclatura. Sem isso, vira vocabulário decorativo sobre um CRUD anêmico.',
        },
        {
          title: 'Integridade no banco, não no código',
          tag: 'Aplico',
          description:
            'Quando uma regra de negócio pode ser expressa como constraint relacional, ela deve ser. Unicidade, integridade referencial em cascata e transições de estado garantidas pelo Postgres são impossíveis de violar por esquecimento.',
          costLabel: 'O custo',
          cost: 'Menor flexibilidade em migrações dinâmicas e mensagens de erro do driver que exigem tradução de banco para o usuário.',
        },
        {
          title: 'Engenharia assistida por IA orientada a especificação',
          tag: 'Aplico',
          description:
            'Especificação como fonte da verdade, MCP para contexto de ferramentas e validação estrita da implementação contra contratos pré-definidos — nunca geração de código no escuro.',
          costLabel: 'O custo',
          cost: 'Escrever a especificação e o PRD demanda tempo e rigor antes da primeira linha de código. Quem pula essa etapa ganha velocidade imediata mas perde direção arquitetural.',
        },
        {
          title: 'Resiliência em integrações externas',
          tag: 'Aplico',
          description:
            'Timeouts definidos, retentativas com backoff exponencial e decisão consciente entre falhar aberto ou fechado. Todo padrão adotado carrega parâmetro configurado, não só o nome.',
          costLabel: 'O custo',
          cost: 'Padrão aplicado sem gargalo real é complexidade desnecessária — circuit breaker em sistema de baixo volume só adiciona estado volátil para manter.',
        },
      ],
    },
    experiences: {
      badge: 'Experiências',
      headline: 'O que eu resolvi, não o que estava no contrato.',
      intro:
        'Cada posição descrita pelo problema que existia e pelo que mudou depois. Informações confidenciais de clientes e empregadores são preservadas.',
      positions: [
        {
          period: '2024 — Atual',
          company: 'Plataforma de Coleta & Inteligência de Mercado',
          role: 'Engenheiro de Backend & Automação Sênior',
          regime: 'PJ · Remoto',
          summary:
            'Plataforma de coleta e consolidação contínua de ofertas e catálogos, alimentando decisões comerciais que antes dependiam de pesquisa manual lenta e incompleta.',
          highlights: [
            'Projetei e mantive dezenas de workers de coleta contínua sobre fontes que sofrem mudanças estruturais frequentes sem aviso, com monitoramento ativo de integridade.',
            'Reduzi drasticamente o custo de tráfego com proxy residencial através de bloqueio de assets supérfluos e estratégia de coleta incremental por diferencial.',
            'Criei o esqueleto padronizado dos robôs de extração, reduzindo o tempo de onboarding de novas fontes de dados em mais de 50%.',
          ],
          technologies: ['C# / .NET', 'PuppeteerSharp', 'MongoDB', 'Docker', 'Azure DevOps'],
        },
        {
          period: '2022 — 2024',
          company: 'Sistemas Distribuídos & Consultoria de Software',
          role: 'Desenvolvedor Full-Stack Pleno',
          regime: 'CLT · Híbrido',
          summary:
            'Desenvolvimento de aplicações corporativas críticas, microsserviços e portais internos orientados a alta disponibilidade e processos de negócio complexos.',
          highlights: [
            'Implementei serviços RESTful com autenticação JWT e controle de permissões baseado em papéis (RBAC).',
            'Otimizei consultas SQL complexas e índices em PostgreSQL reduzindo o tempo de resposta em relatórios executivos.',
            'Estruturei pipelines de testes unitários e de integração aumentando a confiabilidade dos deploys semanais.',
          ],
          technologies: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'React', 'Tailwind CSS'],
        },
      ],
    },
    projects: {
      badge: 'Projetos',
      headline: 'Problema, decisão, resultado.',
      intro:
        'Cada projeto abre pelo problema de negócio e pelo desfecho — legível para quem contrata. O detalhe de arquitetura vem depois, para quem avalia tecnicamente.',
      items: [
        {
          slug: 'plataforma-de-robos-de-coleta',
          title: 'Plataforma de robôs de coleta de preços',
          status: 'Em produção',
          period: '2024 — atual',
          stack: ['C# / .NET', 'PuppeteerSharp', 'MongoDB', 'Docker'],
          problem:
            'O catálogo de ofertas de dezenas de fontes mudava diariamente, e a consolidação manual não acompanhava — decisões comerciais saíam com dado defasado.',
          result:
            'Coleta contínua e automatizada, com consumo de banda e proxy reduzidos em 60% e detecção preventiva de quebra de layout de fontes.',
          role: 'Arquitetura dos workers, padronização do esqueleto e otimização de custo de banda.',
          detailLink: 'Ver o detalhe técnico →',
          summary:
            'Trinta workers coletando ofertas de fontes dinâmicas, com custo de banda sob controle e detecção de quebra antes de o dado ficar incorreto.',
          engineeringChallenge:
            'O volume tornava inviável abrir um navegador completo para cada requisição. Fontes protegidas exigiam cookies e tokens dinâmicos, e proxies residenciais são tarifados por gigabyte.',
          decisions: [
            {
              title: 'Navegador apenas para resolver desafios anti-bot',
              desc: 'O headless browser resolve o desafio inicial e extrai a sessão válida; a extração massiva subsequente é realizada via HTTP direto.',
              tradeoff: 'Exige gerenciamento e renovação automática de estado de sessão.',
            },
            {
              title: 'Extração incremental por checksum',
              desc: 'Somente ofertas e registros cujo hash de conteúdo foi alterado acionam parsing aprofundado.',
              tradeoff: 'Requer persistência de snapshots para comparação rápida.',
            },
          ],
        },
        {
          slug: 'davidev-portfolio-produto',
          title: 'DaviDev — Portfólio como Produto de Software',
          status: 'Em produção',
          period: '2026',
          stack: ['Next.js 15', 'Fastify', 'PostgreSQL', 'Drizzle', 'Hexagonal'],
          problem:
            'Currículos estáticos em PDF não comprovam maturidade de código, qualidade de arquitetura ou rigor metodológico.',
          result:
            'Portfólio construído como software de produção: arquitetura hexagonal com separação em monorepo pnpm, blog editorial com ISR, CMS protegido e PRD público.',
          role: 'Engenheiro responsável por toda a especificação, arquitetura e implementação.',
          detailLink: 'Ver o detalhe técnico →',
          summary:
            'Blog, CMS, API RESTful documentada com Swagger e arquitetura hexagonal, com todo o processo de engenharia publicado.',
          engineeringChallenge:
            'Garantir latência LCP < 2.5s global e zero dependências externas no pacote de domínio (`DEP-1`), com sincronização in-process entre Next.js e Fastify.',
          decisions: [
            {
              title: 'Arquitetura Hexagonal estrita em Monorepo',
              desc: 'O domínio (`packages/domain`) não possui nenhuma dependência externa, garantindo portabilidade absoluta de regras de negócio.',
              tradeoff: 'Maior número de camadas e interfaces abstratas.',
            },
            {
              title: 'Host híbrido Serverless Fastify dentro do Next.js',
              desc: 'A mesma API Fastify com schemas Zod atende requisições HTTP e é consumida in-process por Server Components sem round-trip de rede.',
              tradeoff: 'Configuração personalizada de handlers e adapters de request.',
            },
          ],
        },
      ],
    },
    contact: {
      badge: 'Contato',
      headline: 'Vamos conversar.',
      intro:
        'Vaga, projeto ou dúvida sobre engenharia e arquitetura — respondo todos os contatos. Se preferir, utilize os canais diretos abaixo.',
      emailLabel: 'E-mail direto',
      emailValue: 'contato@davidev.net.br',
      linkedinLabel: 'LinkedIn',
      linkedinHandle: '/in/davi-dev',
      githubLabel: 'GitHub',
      githubHandle: '/davidev',
      privacyNotice:
        'Sua mensagem é armazenada com segurança por 24 meses exclusivamente para responder você. Nenhum IP rastreável é guardado.',
      form: {
        nameLabel: 'Nome',
        namePlaceholder: 'Seu nome completo',
        emailLabel: 'E-mail',
        emailPlaceholder: 'seu.email@empresa.com',
        subjectLabel: 'Assunto',
        subjectPlaceholder: 'Ex.: Proposta de projeto ou oportunidade de backend',
        messageLabel: 'Mensagem',
        messagePlaceholder: 'Descreva sua proposta, desafio técnico ou objetivo de contato...',
        charCount: 'caracteres',
        turnstileVerified: 'Verificação anti-spam concluída',
        turnstileVerifying: 'Validando verificação anti-spam...',
        turnstileRequired: 'Por favor, aguarde a validação anti-spam antes de enviar.',
        privacyAgreement: 'Ao enviar, você concorda com o tratamento de dados descrito na política de privacidade.',
        submitButton: 'Enviar mensagem',
        submittingButton: 'Enviando mensagem...',
        successMessage: 'Mensagem recebida com sucesso! Retornarei em breve no seu e-mail.',
        errorMessage: 'Não foi possível enviar a mensagem no momento. Tente novamente ou use o e-mail direto.',
        rateLimitError: 'Limite de mensagens atingido para este período (máximo 3 por hora). Tente novamente mais tarde.',
        errors: {
          nameRequired: 'Informe seu nome (até 120 caracteres).',
          emailInvalid: 'Informe um endereço de e-mail válido.',
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
        'Um portfólio tratado como produto de software: PRD antes da arquitetura, arquitetura antes do código, e o registro honesto das decisões — inclusive as que precisaram ser corrigidas no meio do caminho.',
      metrics: [
        { label: 'riscos registrados', count: 27 },
        { label: 'ADRs com alternativas descartadas', count: 5 },
        { label: 'regras de negócio numeradas', count: 13 },
        { label: 'contradições detectadas e corrigidas', count: 4 },
      ],
      flowNumber: '01',
      flowTitle: 'O fluxo',
      flowSteps: [
        {
          number: '01',
          title: 'Ideia',
          description: 'Documento de referência com escopo e stack',
        },
        {
          number: '02',
          title: 'PRD',
          description: 'Problema, personas, métricas e o que fica fora',
        },
        {
          number: '03',
          title: 'Arquitetura',
          description: '23 etapas, ADRs, schema e contratos',
        },
        {
          number: '04',
          title: 'Implementação',
          description: 'Assistida por IA, validada contra a especificação',
        },
        {
          number: '05',
          title: 'Deploy',
          description: 'Dez gates bloqueantes antes de produção',
        },
      ],
      flowNote:
        'A IA não escreveu este sistema sozinha, e não é isso que está sendo demonstrado. O que está sendo demonstrado é o fluxo: especificação como fonte de verdade, MCP para contexto de ferramentas, e validação da implementação contra o que foi decidido — com um humano respondendo por cada decisão.',
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
          title: 'Arquitetura hexagonal, com custo assumido',
          description:
            'Para um CMS de blog é over-engineering pelos critérios normais. A justificativa não é técnica — é que a testabilidade é parte do que está sendo demonstrado.',
          costLabel: 'Custo:',
          cost: 'mais arquivos e indireção por funcionalidade.',
        },
        {
          id: 'ADR-003',
          title: 'Dois adapters primários: HTTP e in-process',
          description:
            'A página pública chama o caso de uso direto, sem passar por HTTP. Isso mantém o site no ar mesmo se a API cair.',
          costLabel: 'Custo:',
          cost: 'dois caminhos até o dado — risco de divergência de regra.',
        },
        {
          id: 'ADR-005',
          title: 'Eventos de domínio in-process, sem broker',
          description:
            'Publicar dispara a revalidação da página. É o que permite publicar em minutos sem deploy, sem mensageria para operar.',
          costLabel: 'Custo:',
          cost: 'entrega best-effort, sem retentativa automática.',
        },
      ],
      mistakesNumber: '03',
      mistakesTitle: 'O que eu errei no caminho',
      mistakesIntro:
        'A parte mais útil de documentar decisões é descobrir que duas delas se contradizem. Quatro contradições apareceram só ao cruzar as etapas — e cada uma teria virado defeito em produção.',
      mistakes: [
        {
          title: 'Rollback instantâneo × migration sem volta',
          description:
            'Reverter o código não reverte o banco. O botão de rollback existiria, e apertá-lo derrubaria o sistema. Resolvido com a regra de que toda migration precisa ser compatível com a versão anterior.',
        },
        {
          title: '"Audit log" que dura três dias',
          description:
            'A retenção de log da plataforma é curta. Chamar aquilo de trilha de auditoria seria mentira confortável — foi renomeado para o que de fato é: visibilidade operacional recente.',
        },
        {
          title: 'Teste de integração em banco compartilhado',
          description:
            'Execuções paralelas de CI se atropelariam, gerando falha intermitente — que é pior que teste nenhum, porque ensina a ignorar vermelho.',
        },
        {
          title: 'Acessibilidade exigida, nunca verificada',
          description:
            'WCAG AA aparecia em três lugares do documento e não existia gate nenhum no pipeline. Um requisito sem verificação é uma intenção.',
        },
      ],
      openDocsTitle: 'Os documentos estão abertos',
      openDocsIntro:
        'PRD, documento de arquitetura completo, contratos OpenAPI e evidências do processo — sem maquiagem para a foto.',
      openDocsLinks: [
        { label: '→ Documentação Interativa da API (/api/docs)', href: '/api/docs', isExternal: false },
        { label: '→ Relatório de Prontidão e Auditoria de Go-Live', href: '/docs/go-live-readiness-report.md', isExternal: false },
        { label: '→ PRD Completo (docs/prd.md)', href: 'https://github.com/davidev/portfolio/blob/main/docs/prd.md', isExternal: true },
        { label: '→ Decisões de Arquitetura (docs/architecture.md)', href: 'https://github.com/davidev/portfolio/blob/main/docs/architecture.md', isExternal: true },
        { label: '→ Repositório no GitHub', href: 'https://github.com/davidev/portfolio', isExternal: true },
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
      colophonTitle: 'Colophon',
      colophonLine1: 'Next.js 15 · Fastify · PostgreSQL/Neon · Drizzle',
      colophonLine2: 'Hexagonal architecture · deployed on Vercel',
      contactTitle: 'Contact',
      emailLabel: 'contato@davidev.net.br',
      emailValue: 'contato@davidev.net.br',
      linkedinLabel: 'LinkedIn',
      linkedinUrl: 'https://linkedin.com/in/davi-dev',
      githubLabel: 'GitHub',
      githubUrl: 'https://github.com/davidev',
      privacyPolicy: 'Privacy Policy',
      sourceCode: 'Source code of this site',
      sourceCodeUrl: 'https://github.com/davidev/portfolio',
      copyright: '© 2026 davidev.net.br',
    },
    home: {
      badge: 'Full-stack developer · Brazil',
      headline: 'I build systems — and show how they were made.',
      subheadline:
        'Software architecture, backend, and data collection automation in production. This website itself is a case study: PRD, architecture, specification, and AI-assisted engineering — all fully open.',
      ctaProjects: 'View projects',
      ctaHowBuilt: 'How this site was built',
      stackTitle: 'Current stack',
      stackItems: ['TypeScript', 'Next.js', 'Fastify', 'C# / .NET', 'PostgreSQL', 'Hexagonal'],
      roleTitle: 'Focus',
      roleValue: 'Backend & Architecture',
      locationTitle: 'Location',
      locationValue: 'Brazil · Remote',
      availabilityTitle: 'Availability',
      availabilityValue: 'B2B / Contract / Consulting',
      featuredSectionNumber: '01',
      featuredTitle: 'Featured work',
      allProjectsLink: 'All projects →',
      recentWritingNumber: '02',
      recentWritingTitle: 'Recently written',
      allArticlesLink: 'All articles →',
      differentialNumber: '03 — The difference',
      differentialTitle: 'The engineering process is open too.',
      differentialBody:
        'PRD, architecture documents with 5 ADRs, specifications, and honest records of decisions that did not work out. The case study page shows the entire journey — not just the final result.',
      differentialCta: 'Read the case study',
    },
    about: {
      badge: 'About me',
      headline: 'Started by fixing what broke. Still doing that.',
      paragraphs: [
        'My journey in software engineering was formed around solving real-world reliability and scaling problems. The fascination was never about novelty for novelty’s sake, but about understanding how complex systems fail under load.',
        'Today I work primarily with backend, distributed systems, and automation: platforms that must run continuously without constant manual intervention. It is an engineering discipline that forgives little and quickly teaches the gap between code that works locally and systems that survive in production.',
        'My current focus is designing clean, domain-driven systems (DDD) with strict architectural boundaries, relational databases with declarative integrity, and AI-assisted engineering workflows.',
      ],
      focusTitle: 'Focus',
      focusValue: 'Backend, architecture, and automation',
      baseTitle: 'Base',
      baseValue: 'Brazil · 100% Remote',
      languagesTitle: 'Languages',
      languagesValue: 'Portuguese (Native) · English (Advanced)',
      photoPlaceholder: 'Professional Photo',
      trajectoryTitle: 'Timeline',
      milestones: [
        {
          year: '2021',
          description: 'Began work in data extraction and high-volume web automation pipelines.',
        },
        {
          year: '2023',
          description: 'Consolidated event-driven systems and resilient long-running workers in .NET and Node.',
        },
        {
          year: '2026',
          description: 'Published DaviDev with the full engineering process made transparent.',
        },
      ],
    },
    skills: {
      badge: 'Skills',
      headline: 'What I use, and where I used it.',
      intro:
        'No arbitrary percentage bars or 1-to-5 ratings — they mean nothing to the reader. Each skill specifies where the technology was applied and to solve what problem.',
      categories: [
        {
          number: '01',
          title: 'Backend & Domain',
          items: [
            {
              name: 'C# / .NET',
              description:
                'Long-running background workers in production — continuous extraction, third-party API integration, and fault-tolerant reprocessing.',
            },
            {
              name: 'Node.js · TypeScript',
              description:
                'DaviDev REST API built on hexagonal architecture, with OpenAPI contracts generating typed client code for the frontend.',
            },
            {
              name: 'Fastify',
              description:
                'HTTP adapter strictly separated from the domain, utilizing Zod validation schemas and autogenerated OpenAPI documentation.',
            },
            {
              name: 'Hexagonal Architecture',
              description:
                'Rigorous decoupling of Domain, Application, and Infrastructure ensuring zero framework dependency inside core business logic.',
            },
          ],
        },
        {
          number: '02',
          title: 'Data & Persistence',
          items: [
            {
              name: 'PostgreSQL',
              description:
                'Relational modeling where business rules become constraints — slug uniqueness and 301 redirection histories enforced by the database.',
            },
            {
              name: 'MongoDB',
              description:
                'High-volume catalog storage with database partitioning and producer/consumer pipeline processing.',
            },
            {
              name: 'Drizzle ORM',
              description:
                'Forward-only versioned migrations ensuring backward compatibility across rolling zero-downtime deployments.',
            },
          ],
        },
        {
          number: '03',
          title: 'Frontend & Tooling',
          items: [
            {
              name: 'Next.js 15+ (App Router)',
              description:
                'Incremental Static Regeneration (ISR) with React Server Components, Suspense streaming, and on-demand cache revalidation.',
            },
            {
              name: 'Tailwind CSS & Design Tokens',
              description:
                'Editorial design system with native light/dark theme support and verified WCAG AA color contrast.',
            },
            {
              name: 'Docker & CI/CD',
              description:
                'Containerized environments, linting pipelines, dependency boundary checks via dependency-cruiser, and automated testing.',
            },
          ],
        },
      ],
    },
    knowledge: {
      badge: 'Knowledge',
      headline: 'The concepts that guide my choices.',
      intro:
        'A skill is the tool; knowledge is knowing when not to use it. Here are the principles I use to make engineering trade-offs — and the price each one demands.',
      items: [
        {
          title: 'Hexagonal Architecture (Ports & Adapters)',
          tag: 'Applied',
          description:
            'Domain and use cases completely decoupled from frameworks, HTTP servers, and database drivers. The benefit is testability of pure business logic without spinning up external infrastructure.',
          costLabel: 'The Trade-off',
          cost: 'More files and indirection per feature. For small CRUD apps it is over-engineering — justified only when long-term maintainability and testability matter.',
        },
        {
          title: 'Tactical Domain-Driven Design (DDD)',
          tag: 'Applied',
          description:
            'Aggregates with explicit transactional boundaries, ubiquitous language without ambiguous synonyms, and numbered business rules ensuring code matches business terminology.',
          costLabel: 'The Trade-off',
          cost: 'Requires continuous naming discipline. Without rigor, it devolves into decorative vocabulary over an anemic model.',
        },
        {
          title: 'Data Integrity at Database Level',
          tag: 'Applied',
          description:
            'Whenever a business constraint can be represented as a database constraint, it must be. Uniqueness, cascade rules, and state validations enforced by Postgres cannot be bypassed by buggy application code.',
          costLabel: 'The Trade-off',
          cost: 'Less flexibility during schema refactoring and raw database error messages requiring translation layers for client feedback.',
        },
        {
          title: 'Specification-Driven AI Engineering',
          tag: 'Applied',
          description:
            'Rigorous specifications as source of truth, Model Context Protocol (MCP) for tool grounding, and systematic verification of implementation against predefined contracts — never generating unverified code.',
          costLabel: 'The Trade-off',
          cost: 'Authoring specifications and PRDs requires upfront time and rigor before writing code. Skipping this yields short-term speed at the cost of architectural drift.',
        },
        {
          title: 'Resilience in External Integrations',
          tag: 'Applied',
          description:
            'Strict timeouts, exponential backoff with jitter, and deliberate fail-open or fail-closed decisions. Every adopted pattern carries explicit configuration parameters.',
          costLabel: 'The Trade-off',
          cost: 'Complex patterns without actual production bottlenecks become accidental complexity — circuit breakers in low-throughput services only add volatile state.',
        },
      ],
    },
    experiences: {
      badge: 'Experience',
      headline: 'What I solved, not just what was contracted.',
      intro:
        'Each role described by the engineering problem that existed and the outcome achieved. Sensitive company and client data is protected.',
      positions: [
        {
          period: '2024 — Present',
          company: 'Market Intelligence & Data Collection Platform',
          role: 'Senior Backend & Automation Engineer',
          regime: 'Contract · Remote',
          summary:
            'Continuous extraction and consolidation platform for vehicle market offers, powering pricing decisions that previously relied on slow, incomplete manual research.',
          highlights: [
            'Architected and maintained dozens of long-running extraction workers resilient against frequent unannounced third-party DOM mutations.',
            'Reduced expensive residential proxy bandwidth costs by 60% through aggressive unnecessary asset blocking and diff-based incremental collection.',
            'Standardized the extraction worker framework, cutting onboarding time for new data sources by over 50%.',
          ],
          technologies: ['C# / .NET', 'PuppeteerSharp', 'MongoDB', 'Docker', 'Azure DevOps'],
        },
        {
          period: '2022 — 2024',
          company: 'Distributed Systems & Software Consultancy',
          role: 'Full-Stack Software Engineer',
          regime: 'Full-time · Hybrid',
          summary:
            'Engineered enterprise web applications, microservices, and internal administrative portals focused on high reliability and complex business operations.',
          highlights: [
            'Implemented RESTful APIs with JWT authentication and granular Role-Based Access Control (RBAC).',
            'Optimized relational schemas and queries in PostgreSQL, cutting executive report response times significantly.',
            'Built CI/CD testing pipelines ensuring high confidence during weekly deployments.',
          ],
          technologies: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'React', 'Tailwind CSS'],
        },
      ],
    },
    projects: {
      badge: 'Projects',
      headline: 'Problem, decision, outcome.',
      intro:
        'Every project starts with the business problem and the concrete outcome — clear for hiring managers. Deep technical architecture follows for engineering review.',
      items: [
        {
          slug: 'plataforma-de-robos-de-coleta',
          title: 'Price Extraction & Market Intelligence Platform',
          status: 'In production',
          period: '2024 — present',
          stack: ['C# / .NET', 'PuppeteerSharp', 'MongoDB', 'Docker'],
          problem:
            'Vehicle catalog data across dozens of sources changed daily, and manual research could not keep up — commercial pricing decisions were made with outdated information.',
          result:
            'Continuous automated extraction with bandwidth and proxy consumption reduced by 60%, featuring proactive detection of broken source layouts before data corruption.',
          role: 'Worker architecture, framework standardization, and bandwidth cost optimization.',
          detailLink: 'View technical details →',
          summary:
            'Thirty background workers scraping dynamic sources with controlled proxy costs and automated breakage alerts.',
          engineeringChallenge:
            'Full browser instances for every request were cost-prohibitive. Protected sources required dynamic session tokens, while residential proxies were billed by the gigabyte.',
          decisions: [
            {
              title: 'Headless browser solely for anti-bot challenges',
              desc: 'The browser solves initial challenges and extracts session cookies; mass data ingestion continues via lightweight HTTP requests.',
              tradeoff: 'Requires robust automatic session expiration and renewal handling.',
            },
            {
              title: 'Incremental collection via content checksums',
              desc: 'Only offers whose content hash changed trigger deep payload parsing and database writes.',
              tradeoff: 'Requires maintaining reliable snapshot states for comparison.',
            },
          ],
        },
        {
          slug: 'davidev-portfolio-produto',
          title: 'DaviDev — Portfolio as a Software Product',
          status: 'In production',
          period: '2026',
          stack: ['Next.js 15', 'Fastify', 'PostgreSQL', 'Drizzle', 'Hexagonal'],
          problem:
            'Static resume PDFs do not demonstrate true architectural discipline, code cleanliness, or engineering methodology.',
          result:
            'Built as a complete production application: hexagonal architecture monorepo, editorial blog with ISR, protected CMS, and fully transparent PRD/ADRs.',
          role: 'Sole engineer responsible for specification, architecture, and implementation.',
          detailLink: 'View technical details →',
          summary:
            'Editorial blog, CMS, documented REST API, and hexagonal monorepo with the complete engineering process open-sourced.',
          engineeringChallenge:
            'Enforce global LCP < 2.5s and zero external dependencies in @davidev/domain (DEP-1), with in-process serverless execution between Next.js and Fastify.',
          decisions: [
            {
              title: 'Strict Hexagonal Architecture in Monorepo',
              desc: 'The core domain package (@davidev/domain) contains zero external dependencies, guaranteeing absolute business rule portability.',
              tradeoff: 'Higher number of layers and abstraction interfaces.',
            },
            {
              title: 'In-process Serverless Fastify inside Next.js',
              desc: 'The same Fastify API with Zod validation handles HTTP endpoints and can be executed in-process by React Server Components without network overhead.',
              tradeoff: 'Custom request translation adapters required.',
            },
          ],
        },
      ],
    },
    contact: {
      badge: 'Contact',
      headline: 'Let’s talk.',
      intro:
        'Career opportunities, projects, or questions regarding engineering and architecture — I respond to all messages. Direct channels are also available below.',
      emailLabel: 'Direct email',
      emailValue: 'contato@davidev.net.br',
      linkedinLabel: 'LinkedIn',
      linkedinHandle: '/in/davi-dev',
      githubLabel: 'GitHub',
      githubHandle: '/davidev',
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
        turnstileVerified: 'Anti-spam verification complete',
        turnstileVerifying: 'Verifying anti-spam...',
        turnstileRequired: 'Please complete the anti-spam verification before sending.',
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
        'A portfolio treated as high-caliber software: PRD before architecture, architecture before code, and transparent documentation of decisions — including those that were revised along the way.',
      metrics: [
        { label: 'risks recorded and mitigated', count: 27 },
        { label: 'ADRs with evaluated trade-offs', count: 5 },
        { label: 'numbered & tested business rules', count: 13 },
        { label: 'contradictions detected and resolved', count: 4 },
      ],
      flowNumber: '01',
      flowTitle: 'The workflow',
      flowSteps: [
        {
          number: '01',
          title: 'Idea',
          description: 'Reference document with scope, constraints, and stack',
        },
        {
          number: '02',
          title: 'PRD',
          description: 'Problem, personas, primary metrics, and out-of-scope items',
        },
        {
          number: '03',
          title: 'Architecture',
          description: '23 implementation steps, ADRs, schema, and contracts',
        },
        {
          number: '04',
          title: 'Implementation',
          description: 'AI-assisted coding validated against the specifications',
        },
        {
          number: '05',
          title: 'Deployment',
          description: 'Ten blocking CI quality gates before production',
        },
      ],
      flowNote:
        'AI did not write this system alone, nor is that the claim. What is demonstrated here is the methodology: specification as the source of truth, MCP for tooling context, and rigorous verification of code against architecture decisions — with a senior engineer accountable for each choice.',
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
            'Over-engineering for a typical blog CMS. The justification is educational: extreme testability is part of what is being demonstrated.',
          costLabel: 'Trade-off:',
          cost: 'more files and layer indirection per feature.',
        },
        {
          id: 'ADR-003',
          title: 'Dual primary adapters: HTTP and in-process',
          description:
            'Public RSC pages call the use cases directly without HTTP loopback. This keeps the website responsive even during API spikes.',
          costLabel: 'Trade-off:',
          cost: 'two paths to data — risk of rule divergence.',
        },
        {
          id: 'ADR-005',
          title: 'In-process domain events without message broker',
          description:
            'Publishing triggers page revalidation directly. Allows publishing in seconds without infrastructure messaging overhead.',
          costLabel: 'Trade-off:',
          cost: 'best-effort delivery without automated retries.',
        },
      ],
      mistakesNumber: '03',
      mistakesTitle: 'What I got wrong along the way',
      mistakesIntro:
        'The most valuable part of documenting decisions is discovering when two of them contradict each other. Four critical contradictions emerged during phase review — each would have become an outage in production.',
      mistakes: [
        {
          title: 'Instant rollback × irreversible migrations',
          description:
            'Reverting code does not revert the database. An instant rollback button would crash the app. Resolved by mandating backward-compatible database migrations.',
        },
        {
          title: '"Audit log" lasting only 3 days',
          description:
            'Platform log retention is short. Calling it an audit trail was a comfortable lie — renamed to what it actually is: recent operational visibility.',
        },
        {
          title: 'Integration tests on shared database',
          description:
            'Parallel CI executions would collide, causing flaky tests — which is worse than no tests, because it teaches developers to ignore red builds.',
        },
        {
          title: 'Accessibility required, never enforced',
          description:
            'WCAG AA was mentioned three times in specs, but had zero pipeline gates. A requirement without automated verification is merely good intentions.',
        },
      ],
      openDocsTitle: 'Open documentation & evidence',
      openDocsIntro:
        'PRD, comprehensive architecture spec, OpenAPI contracts, and process evidence — presented as they were written, without cosmetic cleaning.',
      openDocsLinks: [
        { label: '→ Interactive API Documentation (/api/docs)', href: '/api/docs', isExternal: false },
        { label: '→ Go-Live Readiness & Audit Report', href: '/docs/go-live-readiness-report.md', isExternal: false },
        { label: '→ Complete PRD (docs/prd.md)', href: 'https://github.com/davidev/portfolio/blob/main/docs/prd.md', isExternal: true },
        { label: '→ Architecture Decisions (docs/architecture.md)', href: 'https://github.com/davidev/portfolio/blob/main/docs/architecture.md', isExternal: true },
        { label: '→ Repository on GitHub', href: 'https://github.com/davidev/portfolio', isExternal: true },
      ],
    },

  },
};

export function getDictionary(locale: string): Dictionary {
  return dictionaries[locale] || dictionaries['pt-BR'];
}
