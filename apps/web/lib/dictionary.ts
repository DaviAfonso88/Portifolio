import type { PostLocale } from '@davidev/domain';

export interface NavItem {
  label: string;
  href: string;
}

export interface Dictionary {
  nav: {
    home: string;
    about: string;
    experiences: string;
    projects: string;
    blog: string;
    contact: string;
    howItWasBuilt: string;
    howIWork: string;
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
    headline: string;
    subheadline: string;
    ctaProjects: string;
    ctaContact: string;
    photoAlt: string;
    facts: { label: string; value: string }[];
    featuredTitle: string;
    allProjectsLink: string;
    aiTitleLines: string[];
    aiBody: string;
    aiCta: string;
    aiFlow: string[];
    contactTitle: string;
    contactBody: string;
  };
  about: {
    headline: string;
    paragraphs: string[];
    methodLink: string;
    baseTitle: string;
    baseValue: string;
    languagesTitle: string;
    languagesValue: string;
    photoAlt: string;
    trajectoryTitle: string;
    milestones: { year: string; description: string }[];
    stackTitle: string;
    stackGroups: { title: string; items: string }[];
  };
  experiences: {
    headline: string;
    positions: {
      period: string;
      company: string;
      role: string;
      regime: string;
      summary: string;
      highlights: string[];
      technologies: string[];
    }[];
    educationTitle: string;
    education: { period: string; title: string; institution: string }[];
  };
  projects: {
    headline: string;
    intro: string;
    labels: {
      viewDetails: string;
      role: string;
      stack: string;
      flow: string;
      problem: string;
      delivered: string;
      decisions: string;
      tradeoff: string;
      result: string;
      links: string;
      privateNote: string;
    };
    items: {
      slug: string;
      title: string;
      kind: string;
      status: string;
      isLive: boolean;
      isPrivate: boolean;
      period: string;
      summary: string;
      highlight: string;
      role: string;
      stack: string[];
      flow: string[];
      problem: string;
      delivered: string[];
      decisions: { title: string; desc: string; tradeoff: string }[];
      result: string;
      links: { label: string; href: string }[];
    }[];
  };
  contact: {
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
      turnstileError: string;
      turnstileUnavailable: string;
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
  howIWork: {
    metaTitle: string;
    metaDescription: string;
    headlineLines: string[];
    intro: string;
    flowTitle: string;
    flowIntro: string;
    layers: { name: string; question: string; description: string }[];
    authorityTitle: string;
    authorityChainLabel: string;
    authorityChain: string[];
    authorityBody: string;
    splitTitle: string;
    splitAiTitle: string;
    splitAiItems: string[];
    splitMeTitle: string;
    splitMeItems: string[];
    studyTitle: string;
    studyParagraphs: string[];
    studyLink: { label: string; href: string };
    appliedTitle: string;
    applied: { topic: string; where: string }[];
    appliedExtra: string;
    proofTitle: string;
    proof: { title: string; href: string; detail: string }[];
    teachingBody: string;
    ctaBuilt: string;
    ctaContact: string;
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
      experiences: 'Experiência',
      projects: 'Projetos',
      blog: 'Blog',
      contact: 'Contato',
      howItWasBuilt: 'Como foi construído',
      howIWork: 'Como trabalho',
      privacy: 'Privacidade',
    },
    header: {
      themeToggleAria: 'Alternar tema claro/escuro',
      menuToggleAria: 'Alternar menu de navegação',
    },
    footer: {
      colophonTitle: 'Davi Afonso',
      colophonLine1: 'Desenvolvedor Full Stack (.NET e React)',
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
      headline: 'Sou Davi Afonso, desenvolvedor full stack.',
      subheadline:
        'Crio sistemas web completos com .NET e React, do banco de dados à tela. Uso a IA para entregar mais e sigo estudando código e arquitetura para decidir melhor.',
      ctaProjects: 'Ver projetos',
      ctaContact: 'Falar comigo',
      photoAlt: 'Foto de Davi Afonso',
      facts: [
        { label: 'Hoje', value: 'Analista Desenvolvedor Júnior na Rumo Soluções' },
        { label: 'Estudando', value: 'Pós-graduação em Arquitetura de Software com IA' },
        { label: 'Stack', value: 'C#, .NET, React, Next.js, TypeScript, Node.js, PostgreSQL, Docker, Azure' },
        { label: 'Base', value: 'Lagoa Santa, MG. Remoto ou híbrido' },
        { label: 'Aberto a', value: 'CLT, PJ e projetos' },
      ],
      featuredTitle: 'Projetos em destaque',
      allProjectsLink: 'Ver todos os projetos',
      aiTitleLines: ['A IA potencializa o que eu sei.', 'Por isso sigo estudando.'],
      aiBody:
        'Antes de qualquer agente escrever código, defino o produto, a arquitetura e a especificação. Depois, só considero pronto o que passa nos testes e respeita essas decisões. Curso pós-graduação em Arquitetura de Software com IA e ensinei esse método na Rumo Soluções em treinamentos internos.',
      aiCta: 'Ver como trabalho',
      aiFlow: ['Produto', 'Arquitetura', 'Especificação', 'Agentes', 'Validação'],
      contactTitle: 'Tem uma vaga ou um projeto?',
      contactBody: 'Me conte o que você precisa. Respondo todas as mensagens.',
    },
    about: {
      headline: 'Sobre mim',
      paragraphs: [
        'Sou Bacharel em Sistemas de Informação pela UNA e trabalho como Analista Desenvolvedor Júnior na Rumo Soluções, onde construo e mantenho sistemas em .NET e React, APIs e robôs de coleta de dados.',
        'Acredito que a IA potencializa a minha carreira, mas ela só multiplica o que eu já sei. Por isso sigo estudando código e curso pós-graduação em Arquitetura de Software com IA no Full Stack Club: a IA escreve cada vez mais código, e quero ser quem define como o sistema é desenhado, testado e mantido.',
        'Fora da empresa, desenvolvo projetos para a comunidade, como o portal e o controle de estoque da Primeira Igreja Batista em Lagoa Santa e o site do Lar de Idosos Recanto Vida.',
      ],
      methodLink: 'Ver como trabalho com IA',
      baseTitle: 'Base',
      baseValue: 'Lagoa Santa, Minas Gerais',
      languagesTitle: 'Idiomas',
      languagesValue: 'Português (nativo) e inglês (intermediário)',
      photoAlt: 'Foto de Davi Afonso',
      trajectoryTitle: 'Trajetória',
      milestones: [
        { year: '2021', description: 'Início da graduação em Sistemas de Informação.' },
        { year: '2023', description: 'Primeiros projetos em C# e .NET.' },
        { year: '2024', description: 'Site da juventude da Primeira Igreja Batista em Lagoa Santa.' },
        { year: '2025', description: 'Conclusão do bacharelado na UNA, início do estágio em desenvolvimento web na Rumo Soluções, sistema de almoxarifado para a igreja e site do Lar de Idosos Recanto Vida.' },
        { year: '2026', description: 'Efetivado como Analista Desenvolvedor Júnior na Rumo Soluções, sistema de ordens de serviço da CRC Equipamentos e portal da igreja em produção, treinamentos de IA para a empresa e início da pós-graduação.' },
      ],
      stackTitle: 'Tecnologias e conhecimentos',
      stackGroups: [
        { title: 'Arquitetura', items: 'Clean Architecture, DDD, arquitetura hexagonal, monolito modular, ADRs, OpenAPI, APIs REST, JWT, permissões por perfil' },
        { title: 'Escalabilidade e desempenho', items: 'Escalabilidade vertical e horizontal, cache distribuído, load balancer, índices, paginação' },
        { title: 'IA', items: 'Spec-Driven Development (SDD) com Spec Kit, Harness Engineering, orquestração de agentes e subagentes, Claude Code, OpenAI Codex, OpenCode, Kiro, MCP, Context7, Serena, TestSprite, integração com OpenAI e Gemini' },
        { title: 'Backend', items: 'C#, .NET, ASP.NET Core, Entity Framework Core, Node.js, Fastify, PHP, Laravel' },
        { title: 'Frontend', items: 'React, Next.js, TypeScript, Tailwind CSS, TanStack Query, shadcn/ui' },
        { title: 'Bancos de dados', items: 'PostgreSQL, SQL Server, MongoDB, MySQL, Supabase' },
        { title: 'Infra e entrega', items: 'Docker, Azure, Azure DevOps, GitHub Actions, Nginx, VPS, Vercel' },
        { title: 'Testes', items: 'xUnit, Vitest, Pest, Playwright' },
        { title: 'Automação', items: 'Puppeteer, Azure Service Bus, SignalR' },
      ],
    },
    experiences: {
      headline: 'Experiência',
      positions: [
        {
          period: 'ago. 2026 — Atual',
          company: 'Rumo Soluções',
          role: 'Analista Desenvolvedor Júnior',
          regime: 'CLT · Híbrido · Lagoa Santa, MG',
          summary: 'Desenvolvimento e evolução de sistemas para clientes e produtos da empresa, atuando em aplicações web, APIs, automação de dados e inteligência artificial.',
          highlights: [
            'Implantação em produção do sistema de Ordem de Serviço da CRC Equipamentos, empresa de manutenção industrial, com arquivos no Azure Blob Storage.',
            'Evolução do sistema da CRC com marca d’água e rastreabilidade das fotos, evidência obrigatória por solução, relatório técnico em PDF, peças e técnico responsável no checklist e importação de peças por Excel.',
            'Redesenho, para o Datacar, do algoritmo que identifica o carro de cada oferta na tabela FIPE. Ele rodou em paralelo com o antigo para comparar resultados e está em produção desde outubro de 2026.',
            'Criação de telas de auditoria das decisões desse algoritmo e de um assistente de IA para desempatar os casos ambíguos.',
            'Redução de cerca de 3 s para menos de 1 s na abertura das principais telas da plataforma de preços do Datacar, com metade das requisições (mediana em ambiente local, com cache aquecido).',
            'Novas funcionalidades nessa plataforma, como filtros de veículo pelo catálogo FIPE, origem e data da última coleta das ofertas, agrupamento de ofertas e ambiente de homologação.',
            'Manutenção e evolução, desde o estágio, de 40 robôs e serviços de coleta de dados do Datacar e da plataforma que os agenda e monitora, com controle de execução, indicadores e logs.',
            'Uso de Spec-Driven Development (SDD) com Spec Kit e agentes de IA nos sistemas da CRC e do Datacar, e criação de 9 playbooks que orientam esses agentes na criação de robôs no padrão do time.',
          ],
          technologies: ['C#', '.NET', 'React', 'TypeScript', 'PostgreSQL', 'MongoDB', 'SQL Server', 'Docker', 'Azure', 'Azure DevOps', 'Spec Kit', 'Claude Code'],
        },
        {
          period: 'nov. 2025 — ago. 2026',
          company: 'Rumo Soluções',
          role: 'Estagiário de Desenvolvimento Web',
          regime: 'Estágio · Híbrido · Lagoa Santa, MG',
          summary: 'Desenvolvimento, manutenção e evolução de sistemas corporativos, automações e infraestrutura DevOps, atuando em projetos web, APIs, inteligência artificial e RPA.',
          highlights: [
            'Responsável pela manutenção e evolução do sistema da Genios Educacional, implementando melhorias de UX/UI, novos relatórios gerenciais e otimizações de desempenho.',
            'Desenvolvimento de consultas e filtros avançados em bancos de dados para extração e análise de informações estratégicas.',
            'Criação de pipelines CI/CD no Azure DevOps utilizando YAML para automatização de deploys e atualização de ambientes de homologação.',
            'Atuação na evolução da plataforma Datacar, desenvolvendo novas funcionalidades, dashboards, correção de bugs e manutenção de sistemas.',
            'Desenvolvimento, implantação e manutenção de robôs de automação (RPA) e APIs utilizadas pelos processos da empresa.',
            'Administração de servidores e ambientes Docker, incluindo deploy de aplicações, configuração de Nginx e suporte à infraestrutura.',
            'Desenvolvimento de soluções baseadas em Inteligência Artificial para geração automatizada de documentação técnica, wikis e padronização de processos de desenvolvimento.',
            'Participação em iniciativas internas de capacitação sobre IA e criação de workflows para acelerar o desenvolvimento de novos projetos.',
            'Desenvolvimento de sistema de Ordem de Serviço (OS) do zero, como único desenvolvedor, utilizando .NET, React, Docker e práticas modernas de engenharia de software.',
            'Criação de painel administrativo da PriceFleet para gerenciamento de conteúdo de landing pages e blogs.',
          ],
          technologies: ['.NET', 'C#', 'React', 'TypeScript', 'JavaScript', 'Entity Framework', 'SQL Server', 'MySQL', 'PostgreSQL', 'Docker', 'Nginx', 'Azure DevOps'],
        },
        {
          period: '2023 — Atual',
          company: 'Projetos independentes',
          role: 'Desenvolvedor Full Stack',
          regime: 'Remoto',
          summary: 'Sistemas para a comunidade e projetos próprios, do planejamento ao deploy.',
          highlights: [
            'Portal da Primeira Igreja Batista em Lagoa Santa, em produção no lugar do antigo site em WordPress.',
            'Controle de estoque do almoxarifado da igreja e site da juventude Salt, que está no ar.',
            'FIT.AI, app de treinos com assistente de IA, no ar e com código aberto.',
            'Site do Lar de Idosos Recanto Vida, no ar, com hospedagem, domínios e e-mails sob minha responsabilidade.',
          ],
          technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Laravel', 'PostgreSQL', 'MySQL', 'WordPress'],
        },
      ],
      educationTitle: 'Formação',
      education: [
        { period: 'Em andamento', title: 'Pós-graduação em Arquitetura de Software com IA', institution: 'Full Stack Club' },
        { period: '2025', title: 'Bacharelado em Sistemas de Informação', institution: 'UNA' },
      ],
    },
    projects: {
      headline: 'Projetos',
      intro:
        'Os sistemas feitos na Rumo Soluções não têm código público, então explico o problema e as decisões. A maioria dos projetos independentes tem link para o código.',
      labels: {
        viewDetails: 'Ver detalhes',
        role: 'Meu papel',
        stack: 'Tecnologias',
        flow: 'Como funciona',
        problem: 'O problema',
        delivered: 'O que entreguei',
        decisions: 'Decisões técnicas',
        tradeoff: 'Custo da escolha:',
        result: 'Resultado',
        links: 'Links',
        privateNote: 'Sistema feito na Rumo Soluções: o código e as telas não são públicos.',
      },
      items: [
        {
          slug: 'sistema-ordens-de-servico',
          title: 'Sistema de Ordens de Serviço',
          kind: 'Para a CRC Equipamentos',
          status: 'Em produção',
          isLive: true,
          isPrivate: true,
          period: '2026',
          summary:
            'Controla a manutenção de equipamentos industriais, da entrada na oficina até o relatório entregue ao cliente.',
          highlight:
            'Reúne em um só sistema o que estava em papel, Trello e planilhas, com histórico completo e relatório em PDF gerado automaticamente.',
          role: 'Único desenvolvedor, do início no estágio até a produção: especificação, backend, frontend e deploy.',
          stack: ['.NET 10', 'React 19', 'TypeScript', 'PostgreSQL', 'Docker', 'Azure DevOps', 'Spec Kit', 'Claude Code'],
          flow: ['Em análise', 'Aguardando orçamento', 'Aguardando peças', 'Em execução', 'Finalização', 'Entregue'],
          problem:
            'A CRC Equipamentos acompanhava cada ordem de serviço em papel, Trello e planilhas, e montava à mão o relatório entregue ao cliente. Para saber o andamento de uma OS, era preciso perguntar a alguém.',
          delivered: [
            'Fluxo único da OS, registrando quem fez o quê e quando em cada etapa.',
            'Checklist técnico com pontuação por peça, que calcula se o reparo compensa.',
            'Fotos de evidência com marcação direto do celular e relatório em PDF gerado pelo sistema.',
            'Quadro Kanban, painel operacional, permissões por perfil e importação de peças por Excel.',
            '358 testes automatizados e entrega contínua com Azure DevOps e Docker.',
          ],
          decisions: [
            {
              title: 'Checklist congelado na entrega',
              desc: 'Quando a OS é entregue, o checklist preenchido vira uma cópia imutável. Mudar o modelo depois não altera o histórico.',
              tradeoff: 'exige versionar os modelos de checklist.',
            },
            {
              title: 'Contrato único entre API e frontend',
              desc: 'Os tipos e as chamadas do React são gerados a partir do OpenAPI com Orval. Uma mudança na API aparece como erro de compilação, não como bug na tela.',
              tradeoff: 'um passo a mais de geração a cada mudança.',
            },
          ],
          result: 'Em produção na CRC Equipamentos, depois de três versões entregues e validadas em homologação.',
          links: [],
        },
        {
          slug: 'matching-fipe',
          title: 'Matching FIPE',
          kind: 'Para o Datacar',
          status: 'Em produção',
          isLive: true,
          isPrivate: true,
          period: '2026',
          summary:
            'Descobre o código FIPE de cada oferta de carro por assinatura, mesmo quando a descrição vem incompleta ou escrita de outro jeito.',
          highlight:
            'Algoritmo novo em produção desde outubro de 2026, guiado por uma regra simples: preço errado é pior do que preço ausente.',
          role: 'Principal desenvolvedor da API: desenho do algoritmo, testes, auditoria e virada para produção.',
          stack: ['.NET', 'C#', 'MongoDB', 'OpenAI', 'Docker', 'Azure DevOps', 'Spec Kit', 'Claude Code'],
          flow: ['Oferta recebida', 'Normalização do texto', 'Busca da família do carro', 'Eliminação de versões', 'Associação ou retenção'],
          problem:
            'Cada locadora descreve o mesmo carro de um jeito. Um código FIPE errado vira preço errado para quem consulta o Datacar, e o algoritmo antigo se baseava só em semelhança de texto.',
          delivered: [
            'Processo em etapas que elimina as versões impossíveis e só associa quando há confiança e não há empate.',
            'Ofertas duvidosas ficam retidas com o motivo registrado e podem ser reprocessadas depois.',
            'Assistente de IA para resolver empates, com limite diário de consultas.',
            'Tela de auditoria para conferir cada decisão do algoritmo.',
            'API coberta por 518 testes automatizados, de unidade e de integração.',
          ],
          decisions: [
            {
              title: 'Precisão acima de cobertura',
              desc: 'Na dúvida, o sistema não associa. O critério deixou de ser associar mais ofertas e passou a ser não errar.',
              tradeoff: 'algumas ofertas ficam sem preço até serem revisadas.',
            },
            {
              title: 'Modo sombra antes da virada',
              desc: 'O algoritmo novo rodou em paralelo com o antigo em produção, sem afetar o resultado, para comparar as decisões dos dois.',
              tradeoff: 'dois algoritmos para manter durante a transição.',
            },
            {
              title: 'IA só para o que sobra',
              desc: 'O modelo entra apenas nos empates que as regras não resolvem, e a decisão vira uma regra que pode ser auditada.',
              tradeoff: 'as regras criadas pela IA precisam de acompanhamento.',
            },
          ],
          result: 'Milhares de ofertas por dia passam pelo algoritmo novo, e cada decisão pode ser auditada.',
          links: [],
        },
        {
          slug: 'portal-pibls',
          title: 'Portal PIBLS',
          kind: 'Projeto independente',
          status: 'Em produção',
          isLive: true,
          isPrivate: false,
          period: '2026',
          summary:
            'Site e painel administrativo da Primeira Igreja Batista em Lagoa Santa, que substituíram o WordPress sem aumentar o custo de hospedagem.',
          highlight:
            'Mais de 1.600 testes automatizados em um sistema planejado para durar mais de 5 anos com uma pessoa só na operação.',
          role: 'Único desenvolvedor: arquitetura, backend, frontend e operação.',
          stack: ['Laravel 13', 'PHP 8.4', 'React 19', 'TypeScript', 'MySQL', 'Playwright', 'Spec Kit', 'Claude Code'],
          flow: [],
          problem:
            'A igreja precisava trocar o site em WordPress por um portal próprio, com painel para a equipe atualizar o conteúdo, sem gastar além da hospedagem compartilhada que já paga.',
          delivered: [
            'Site público pré-renderizado, com limite de 160 KB de JavaScript por página verificado a cada build.',
            'Painel com permissões por papel, eventos, ministérios, conteúdo e atendimento.',
            'Deploy por versões em hospedagem compartilhada, sem Node no servidor.',
            'Backup cifrado e manuais de operação para uma pessoa só manter o sistema.',
          ],
          decisions: [
            {
              title: 'Sem Node em produção',
              desc: 'A hospedagem compartilhada não roda Node. O React é pré-renderizado no CI e o servidor só entrega arquivos e a API em PHP.',
              tradeoff: 'os dados dinâmicos dependem de chamadas à API no navegador.',
            },
            {
              title: 'Operação enxuta registrada em ADR',
              desc: 'Mantive só os alertas que uma pessoa consegue acompanhar: cópia externa do backup, um monitor e dois checks.',
              tradeoff: 'menos visibilidade até o uso do portal crescer.',
            },
          ],
          result: 'No ar em pibls.com, no lugar do antigo site em WordPress e na mesma hospedagem compartilhada.',
          links: [
            { label: 'Abrir o site', href: 'https://pibls.com' },
            { label: 'Código no GitHub', href: 'https://github.com/DaviAfonso88/pibls' },
          ],
        },
        {
          slug: 'fit-ia',
          title: 'FIT.AI',
          kind: 'Projeto independente',
          status: 'No ar',
          isLive: true,
          isPrivate: false,
          period: '2026',
          summary:
            'App de treinos com um personal trainer de IA que conversa com o usuário, monta o plano da semana e acompanha a evolução.',
          highlight: 'Login com Google, chat com IA em tempo real e estatísticas de consistência, com código aberto.',
          role: 'Desenvolvedor full stack. Criado no bootcamp Treinos do Full Stack Club.',
          stack: ['Next.js 16', 'React 19', 'Fastify', 'Prisma', 'PostgreSQL', 'Gemini'],
          flow: ['Conversa com a IA', 'Leitura do perfil', 'Plano de 7 dias', 'Registro dos treinos', 'Estatísticas de evolução'],
          problem:
            'Montar um plano de treino adequado ao próprio objetivo e acompanhar a rotina costuma exigir um profissional ou várias ferramentas diferentes.',
          delivered: [
            'Chat com Gemini que consulta e grava dados chamando funções da API, em vez de só gerar texto.',
            'Plano semanal, sessões de treino com controle de tempo e estatísticas de sequência e consistência.',
            'Login com Google via Better-Auth e cliente da API gerado com Orval a partir do OpenAPI.',
          ],
          decisions: [
            {
              title: 'Chamada de funções em vez de texto livre',
              desc: 'A IA cria o plano chamando uma função da API, então o resultado vira dado estruturado no banco, não um texto para interpretar.',
              tradeoff: 'o prompt e as funções precisam evoluir junto com a API.',
            },
            {
              title: 'Arquitetura simples em camadas',
              desc: 'Rota, caso de uso e banco. Descartei a arquitetura hexagonal porque este projeto não precisava dela.',
              tradeoff: 'menos isolamento da infraestrutura se o projeto crescer.',
            },
          ],
          result: 'Aplicação completa no ar, com código aberto no GitHub.',
          links: [
            { label: 'Abrir o app', href: 'https://www.fitai.davidev.net.br' },
            { label: 'Código do app', href: 'https://github.com/DaviAfonso88/FIT.IA-Frontend' },
            { label: 'Código da API', href: 'https://github.com/DaviAfonso88/FIT.IA-API' },
          ],
        },
        {
          slug: 'davidev-portfolio-produto',
          title: 'DaviDev',
          kind: 'Projeto independente',
          status: 'No ar',
          isLive: true,
          isPrivate: false,
          period: '2026',
          summary: 'Este site: portfólio, blog e painel de conteúdo, construído como um produto de software de verdade.',
          highlight: 'Documentação aberta, testes automatizados e 10 verificações no CI a cada alteração.',
          role: 'Único desenvolvedor: especificação, arquitetura e implementação.',
          stack: ['Next.js 15', 'Fastify', 'PostgreSQL', 'Drizzle', 'Spec Kit', 'Arquitetura hexagonal'],
          flow: [],
          problem: 'Um currículo em PDF não mostra como alguém toma decisões técnicas nem a qualidade do que entrega.',
          delivered: [
            'Site em português e inglês, com tema claro e escuro.',
            'Blog e painel de conteúdo com histórico de versões.',
            'Arquitetura hexagonal em monorepo, com regras de dependência verificadas no CI.',
            'PRD, arquitetura e decisões publicados junto com o código.',
          ],
          decisions: [
            {
              title: 'Arquitetura hexagonal em um projeto pequeno',
              desc: 'As regras de negócio não dependem de nenhuma biblioteca externa e podem ser testadas sem banco de dados.',
              tradeoff: 'mais camadas e arquivos do que um site deste tamanho exigiria.',
            },
            {
              title: 'API Fastify dentro do Next.js',
              desc: 'A mesma API atende o painel por HTTP e é chamada direto pelas páginas no servidor, sem salto de rede.',
              tradeoff: 'configuração própria para integrar os dois.',
            },
          ],
          result: 'Site no ar, com todo o processo aberto para consulta.',
          links: [
            { label: 'Código no GitHub', href: 'https://github.com/DaviAfonso88/Portifolio' },
            { label: 'Como este site foi construído', href: '/pt-BR/como-foi-construido' },
          ],
        },
        {
          slug: 'almoxarifado',
          title: 'Almoxarifado PIBLS',
          kind: 'Projeto independente',
          status: 'Concluído',
          isLive: false,
          isPrivate: false,
          period: '2025',
          summary: 'Controle de estoque do almoxarifado da igreja, com alerta de estoque mínimo e relatórios.',
          highlight: 'Entradas e saídas, painel com gráficos e relatórios em PDF e CSV com os itens críticos em destaque.',
          role: 'Único desenvolvedor.',
          stack: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Supabase'],
          flow: [],
          problem: 'A igreja precisava saber o que tem no almoxarifado e o que está abaixo do estoque mínimo.',
          delivered: [
            'Cadastro de produtos e categorias, com busca e registro de entradas e saídas.',
            'Painel com os produtos abaixo do mínimo e gráfico comparativo.',
            'Exportação de relatórios em CSV e PDF.',
          ],
          decisions: [],
          result: 'Sistema entregue para a igreja, com frontend e banco de dados na nuvem.',
          links: [{ label: 'Código no GitHub', href: 'https://github.com/DaviAfonso88/Almoxarifado' }],
        },
        {
          slug: 'saltweb',
          title: 'SaltWeb',
          kind: 'Projeto independente',
          status: 'No ar',
          isLive: true,
          isPrivate: false,
          period: '2024 — 2026',
          summary: 'Site da juventude da Primeira Igreja Batista em Lagoa Santa, com eventos, devocionais e podcast.',
          highlight: 'Reescrito do zero em Next.js a partir de um site antigo em HTML, CSS e JavaScript.',
          role: 'Desenvolvedor e responsável pela interface.',
          stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vercel'],
          flow: [],
          problem: 'O site antigo era difícil de manter, e o formulário de contato precisava ficar mais confiável.',
          delivered: [
            'Páginas de eventos, podcast e devocionais com componentes reutilizáveis.',
            'Formulário de contato com rota própria no Next.js.',
            'Devocionais carregados de um arquivo externo, atualizados sem novo deploy.',
          ],
          decisions: [
            {
              title: 'Conteúdo separado da interface',
              desc: 'Eventos e podcasts ficam em arquivos de dados, e os devocionais vêm de um JSON no GitHub Pages.',
              tradeoff: 'sem painel, atualizar eventos ainda exige editar arquivos.',
            },
          ],
          result: 'Site oficial da juventude no ar.',
          links: [
            { label: 'Abrir o site', href: 'https://juventude-salt.vercel.app' },
            { label: 'Código no GitHub', href: 'https://github.com/DaviAfonso88/SaltWeb' },
          ],
        },
        {
          slug: 'recanto-vida',
          title: 'Site do Recanto Vida',
          kind: 'Projeto independente',
          status: 'No ar',
          isLive: true,
          isPrivate: false,
          period: '2025 — Atual',
          summary: 'Site do Lar de Idosos Recanto Vida, em Confins (MG), que apresenta o trabalho da instituição e convida a comunidade a contribuir e ser voluntária.',
          highlight: 'Criei o site, contratei a hospedagem e sigo responsável pela hospedagem, pelos domínios e pelos e-mails da instituição.',
          role: 'Responsável por todo o projeto: desenvolvimento do site, hospedagem, domínios e e-mails.',
          stack: ['WordPress', 'Elementor', 'HostGator'],
          flow: [],
          problem: 'O lar precisava de um site mais acessível e acolhedor, que mostrasse sua missão e aproximasse a instituição da comunidade.',
          delivered: [
            'Site com páginas de apresentação, serviços, contribuição e contato, com convite para voluntários.',
            'Seção de eventos e atividades da instituição.',
            'Contratação da hospedagem na HostGator e administração dos domínios e dos e-mails institucionais.',
          ],
          decisions: [],
          result: 'Site no ar, com domínio e e-mail próprios da instituição, e sigo cuidando da hospedagem.',
          links: [{ label: 'Abrir o site', href: 'https://orecantovida.com.br/' }],
        },
      ],
    },
    contact: {
      headline: 'Vamos conversar.',
      intro:
        'Tem uma vaga ou um projeto? Escreva por aqui ou use os canais diretos.',
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
        turnstileError: 'Não foi possível concluir a verificação anti spam. Recarregue a página e tente de novo.',
        turnstileUnavailable: 'Verificação anti spam indisponível neste ambiente',
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
    howIWork: {
      metaTitle: 'Como trabalho com IA e arquitetura de software',
      metaDescription:
        'Como uso agentes de IA dentro de um fluxo com PRD, arquitetura, especificação e validação, e por que sigo estudando código.',
      headlineLines: ['A IA potencializa o que eu sei.', 'Por isso sigo estudando.'],
      intro:
        'Acredito que a IA potencializa a minha carreira: com ela, entrego mais e assumo problemas maiores. Mas ela só multiplica o que eu já sei. Quem não entende o código não percebe quando a resposta está errada, então sigo estudando programação e arquitetura de software.',
      flowTitle: 'Meu fluxo: decidir antes de gerar código',
      flowIntro: 'Escrevo o produto e a arquitetura primeiro. Só depois os agentes entram, seguindo o que já foi decidido.',
      layers: [
        {
          name: 'Produto',
          question: 'O quê e por quê',
          description:
            'O PRD, documento de produto, define o problema, o público, as regras de negócio, o escopo e as métricas de sucesso.',
        },
        {
          name: 'Arquitetura',
          question: 'Qual a estrutura técnica',
          description:
            'O documento de arquitetura fecha a estrutura e as especificações técnicas antes de qualquer implementação.',
        },
        {
          name: 'Especificação',
          question: 'O que fazer, exatamente',
          description:
            'Sigo o Spec-Driven Development (SDD): o Spec Kit transforma o PRD e a arquitetura em especificação, plano e tarefas, com critérios de qualidade pelo caminho.',
        },
        {
          name: 'Agentes',
          question: 'Quem executa',
          description:
            'Agentes de IA implementam as tarefas dentro do harness que monto em cada projeto, a infraestrutura em volta do modelo: regras, ferramentas, permissões, memória, subagentes, skills e verificações automáticas.',
        },
        {
          name: 'Validação',
          question: 'Tudo ainda faz sentido',
          description:
            'Confiro se o código continua coerente com o PRD, a arquitetura, a especificação, o plano e as tarefas.',
        },
      ],
      authorityTitle: 'Qual decisão vale mais',
      authorityChainLabel: 'Ordem de autoridade, da maior para a menor',
      authorityChain: ['PRD', 'Arquitetura', 'Especificação', 'Plano', 'Tarefas', 'Código'],
      authorityBody:
        'Uma camada de baixo não contradiz uma decisão de cima sem revisão e aprovação explícitas. Se houver conflito, a decisão original é identificada e o conflito é explicado. Nada muda em silêncio.',
      splitTitle: 'O que fica com a IA e o que fica comigo',
      splitAiTitle: 'Com os agentes de IA',
      splitAiItems: [
        'Implementar as tarefas já especificadas.',
        'Consultar documentação atualizada, navegar pelo código e testar, com Context7, Serena, TestSprite e MCP.',
        'Repetir o trabalho até as verificações passarem.',
      ],
      splitMeTitle: 'Comigo',
      splitMeItems: [
        'Definir o problema, o escopo e a arquitetura.',
        'Montar o harness de cada projeto e orquestrar os agentes e subagentes.',
        'Revisar o que foi feito e responder pelo resultado.',
        'Só considerar pronto o que passa nos testes.',
      ],
      studyTitle: 'Sigo estudando código e arquitetura',
      studyParagraphs: [
        'Preciso entender o que está por baixo para revisar o que a IA entrega e saber quando ela erra. A IA não substitui meus estudos: são eles que me permitem usá-la bem.',
        'Curso pós-graduação em Arquitetura de Software com IA no Full Stack Club e continuo praticando em projetos de estudo, como o FIT.AI, criado no bootcamp Treinos.',
      ],
      studyLink: { label: 'Ver meus projetos no GitHub', href: 'https://github.com/DaviAfonso88?tab=repositories' },
      appliedTitle: 'O que já levei para projetos reais',
      applied: [
        { topic: 'Clean Architecture com DDD e Repository Pattern', where: 'Sistema de Ordens de Serviço' },
        { topic: 'Arquitetura hexagonal em monolito modular, com fronteiras verificadas por ferramenta', where: 'Este site' },
        { topic: 'Decisões registradas em ADRs, com as alternativas descartadas', where: 'Sistema de Ordens de Serviço e Portal PIBLS' },
        { topic: 'Contrato OpenAPI com cliente gerado por Orval', where: 'Sistema de Ordens de Serviço e FIT.AI' },
        { topic: 'Índices de banco de dados e paginação', where: 'Sistema de Ordens de Serviço, Matching FIPE e Portal PIBLS' },
      ],
      appliedExtra: 'Também tenho conhecimento em escalabilidade vertical e horizontal, cache distribuído e load balancer.',
      proofTitle: 'Onde esse método já rodou',
      proof: [
        {
          title: 'Sistema de Ordens de Serviço',
          href: '/projetos/sistema-ordens-de-servico',
          detail: 'Spec Kit desde o primeiro commit, com PRD e arquitetura documentados. Em produção, com 358 testes.',
        },
        {
          title: 'Matching FIPE',
          href: '/projetos/matching-fipe',
          detail: 'Spec Kit aplicado a um sistema que já existia. Em produção, com a API coberta por 518 testes.',
        },
        {
          title: 'Portal PIBLS',
          href: '/projetos/portal-pibls',
          detail: 'Em produção, com PRD, arquitetura, decisões registradas em ADRs e mais de 1.600 testes.',
        },
        {
          title: 'Este site',
          href: '/como-foi-construido',
          detail: 'PRD e arquitetura abertos para consulta, com o passo a passo publicado.',
        },
      ],
      teachingBody:
        'Também ensinei esse método na Rumo Soluções: preparei 2 treinamentos internos de IA (harness e MCP) e escrevi 9 playbooks que orientam agentes na criação de robôs no padrão do time.',
      ctaBuilt: 'Ver como este site foi construído',
      ctaContact: 'Falar comigo',
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
        { label: 'Relatório de Prontidão e Auditoria de Go Live', href: 'https://github.com/DaviAfonso88/Portifolio/blob/main/docs/go-live-readiness-report.md', isExternal: true },
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
      experiences: 'Experience',
      projects: 'Projects',
      blog: 'Blog',
      contact: 'Contact',
      howItWasBuilt: 'How it was built',
      howIWork: 'How I work',
      privacy: 'Privacy',
    },
    header: {
      themeToggleAria: 'Toggle light/dark theme',
      menuToggleAria: 'Toggle navigation menu',
    },
    footer: {
      colophonTitle: 'Davi Afonso',
      colophonLine1: 'Full Stack Developer (.NET and React)',
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
      headline: 'I’m Davi Afonso, a full stack developer.',
      subheadline:
        'I build complete web systems with .NET and React, from the database to the screen. I use AI to deliver more, and I keep studying code and architecture to make better decisions.',
      ctaProjects: 'View projects',
      ctaContact: 'Get in touch',
      photoAlt: 'Photo of Davi Afonso',
      facts: [
        { label: 'Now', value: 'Junior Developer Analyst at Rumo Soluções' },
        { label: 'Studying', value: 'Postgraduate course in Software Architecture with AI' },
        { label: 'Stack', value: 'C#, .NET, React, Next.js, TypeScript, Node.js, PostgreSQL, Docker, Azure' },
        { label: 'Based in', value: 'Lagoa Santa, Brazil. Remote or hybrid' },
        { label: 'Open to', value: 'Full-time, contract and project work' },
      ],
      featuredTitle: 'Featured projects',
      allProjectsLink: 'View all projects',
      aiTitleLines: ['AI amplifies what I know.', 'That’s why I keep studying.'],
      aiBody:
        'Before any agent writes code, I define the product, the architecture and the specification. Then only what passes the tests and respects those decisions counts as done. I’m taking a postgraduate course in Software Architecture with AI and taught this method at Rumo Soluções in internal training sessions.',
      aiCta: 'See how I work',
      aiFlow: ['Product', 'Architecture', 'Specification', 'Agents', 'Validation'],
      contactTitle: 'Have a role or a project in mind?',
      contactBody: 'Tell me what you need. I reply to every message.',
    },
    about: {
      headline: 'About me',
      paragraphs: [
        'I hold a Bachelor’s degree in Information Systems from UNA and work as a Junior Developer Analyst at Rumo Soluções, where I build and maintain .NET and React systems, APIs and data collection bots.',
        'I believe AI amplifies my career, but it only multiplies what I already know. That’s why I keep studying code and am taking a postgraduate course in Software Architecture with AI at Full Stack Club: AI writes more and more of the code, and I want to be the person who decides how a system is designed, tested and maintained.',
        'Outside the company, I build projects for my community, such as the website and the inventory system of Primeira Igreja Batista em Lagoa Santa, a local church, and the website of the Recanto Vida care home.',
      ],
      methodLink: 'See how I work with AI',
      baseTitle: 'Based in',
      baseValue: 'Lagoa Santa, Minas Gerais, Brazil',
      languagesTitle: 'Languages',
      languagesValue: 'Portuguese (native) and English (intermediate)',
      photoAlt: 'Photo of Davi Afonso',
      trajectoryTitle: 'Timeline',
      milestones: [
        { year: '2021', description: 'Started my degree in Information Systems.' },
        { year: '2023', description: 'First projects in C# and .NET.' },
        { year: '2024', description: 'Website for the youth group of Primeira Igreja Batista em Lagoa Santa.' },
        { year: '2025', description: 'Finished my degree at UNA, started a web development internship at Rumo Soluções, and built an inventory system for the church and the website of the Recanto Vida care home.' },
        { year: '2026', description: 'Promoted to Junior Developer Analyst at Rumo Soluções, the CRC Equipamentos work order system and the church website in production, AI training for the company, and the start of my postgraduate course.' },
      ],
      stackTitle: 'Technologies and skills',
      stackGroups: [
        { title: 'Architecture', items: 'Clean Architecture, DDD, hexagonal architecture, modular monolith, ADRs, OpenAPI, REST APIs, JWT, role-based access' },
        { title: 'Scalability and performance', items: 'Vertical and horizontal scaling, distributed caching, load balancing, indexes, pagination' },
        { title: 'AI', items: 'Spec-Driven Development (SDD) with Spec Kit, Harness Engineering, orchestration of agents and subagents, Claude Code, OpenAI Codex, OpenCode, Kiro, MCP, Context7, Serena, TestSprite, OpenAI and Gemini integration' },
        { title: 'Backend', items: 'C#, .NET, ASP.NET Core, Entity Framework Core, Node.js, Fastify' },
        { title: 'Frontend', items: 'React, Next.js, TypeScript, Tailwind CSS, TanStack Query, shadcn/ui' },
        { title: 'Databases', items: 'PostgreSQL, SQL Server, MongoDB, MySQL, Supabase' },
        { title: 'Infrastructure', items: 'Docker, Azure, Azure DevOps, GitHub Actions, Nginx, VPS, Vercel' },
        { title: 'Testing', items: 'xUnit, Vitest, Pest, Playwright, TestSprite' },
        { title: 'Automation', items: 'Puppeteer, Azure Service Bus, SignalR' },
      ],
    },
    experiences: {
      headline: 'Experience',
      positions: [
        {
          period: 'Aug 2026 — Present',
          company: 'Rumo Soluções',
          role: 'Junior Developer Analyst',
          regime: 'Full-time · Hybrid · Lagoa Santa, Brazil',
          summary: 'Building and evolving systems for the company’s clients and products, working on web applications, APIs, data automation and artificial intelligence.',
          highlights: [
            'Production rollout of the work order system for CRC Equipamentos, an industrial maintenance company, with files on Azure Blob Storage.',
            'Further development of the CRC system: photo watermarking and traceability, required evidence for each solution, technical PDF reports, parts and responsible technician in the checklist, and parts import from Excel.',
            'Redesign, for Datacar, of the algorithm that matches each car offer to its entry in FIPE, Brazil’s vehicle price table. It ran alongside the old one to compare results and has been in production since October 2026.',
            'Audit screens for that algorithm’s decisions and an AI assistant to break ties in ambiguous cases.',
            'Load time of the main screens of Datacar’s pricing platform cut from about 3 s to under 1 s, with half the requests (median in a local environment, warm cache).',
            'New features on that platform, including vehicle filters based on the FIPE catalog, offer source and last collection date, offer grouping and a staging environment.',
            'Maintenance and improvement, since my internship, of 40 Datacar data collection bots and services, plus the platform that schedules and monitors them, with run controls, indicators and logs.',
            'Spec-Driven Development (SDD) with Spec Kit and AI agents on the CRC and Datacar systems, plus 9 playbooks that guide those agents in building bots to the team’s standard.',
          ],
          technologies: ['C#', '.NET', 'React', 'TypeScript', 'PostgreSQL', 'MongoDB', 'SQL Server', 'Docker', 'Azure', 'Azure DevOps', 'Spec Kit', 'Claude Code'],
        },
        {
          period: 'Nov 2025 — Aug 2026',
          company: 'Rumo Soluções',
          role: 'Web Development Intern',
          regime: 'Internship · Hybrid · Lagoa Santa, Brazil',
          summary: 'Development, maintenance and evolution of corporate systems, automations and DevOps infrastructure, working on web projects, APIs, artificial intelligence and RPA.',
          highlights: [
            'Responsible for maintaining and evolving the Genios Educacional system, delivering UX/UI improvements, new management reports and performance optimizations.',
            'Development of advanced database queries and filters to extract and analyze strategic information.',
            'Creation of CI/CD pipelines in Azure DevOps using YAML to automate deployments and staging environment updates.',
            'Worked on the evolution of the Datacar platform, building new features and dashboards, fixing bugs and maintaining systems.',
            'Development, deployment and maintenance of automation bots (RPA) and APIs used in the company’s processes.',
            'Administration of servers and Docker environments, including application deployment, Nginx configuration and infrastructure support.',
            'Development of AI-based solutions for automated generation of technical documentation and wikis, and for standardizing development processes.',
            'Participation in internal AI training initiatives and creation of workflows to speed up the development of new projects.',
            'Development of a work order system from scratch, as the only developer, using .NET, React, Docker and modern software engineering practices.',
            'Creation of the PriceFleet admin panel to manage landing page and blog content.',
          ],
          technologies: ['.NET', 'C#', 'React', 'TypeScript', 'JavaScript', 'Entity Framework', 'SQL Server', 'MySQL', 'PostgreSQL', 'Docker', 'Nginx', 'Azure DevOps'],
        },
        {
          period: '2023 — Present',
          company: 'Independent projects',
          role: 'Full Stack Developer',
          regime: 'Remote',
          summary: 'Systems for my community and my own projects, from planning to deployment.',
          highlights: [
            'Website for Primeira Igreja Batista em Lagoa Santa, now in production, replacing the old WordPress site.',
            'Inventory system for the church storeroom and the live website of its youth group, Salt.',
            'FIT.AI, a workout app with an AI assistant, live and open source.',
            'Website for the Recanto Vida care home, live, with hosting, domains and email under my care.',
          ],
          technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Laravel', 'PostgreSQL', 'MySQL', 'WordPress'],
        },
      ],
      educationTitle: 'Education',
      education: [
        { period: 'In progress', title: 'Postgraduate course in Software Architecture with AI', institution: 'Full Stack Club' },
        { period: '2025', title: 'Bachelor’s degree in Information Systems', institution: 'UNA' },
      ],
    },
    projects: {
      headline: 'Projects',
      intro:
        'Systems built at Rumo Soluções have no public code, so I explain the problem and the decisions instead. Most independent projects link to their code.',
      labels: {
        viewDetails: 'View details',
        role: 'My role',
        stack: 'Technologies',
        flow: 'How it works',
        problem: 'The problem',
        delivered: 'What I delivered',
        decisions: 'Technical decisions',
        tradeoff: 'Trade-off:',
        result: 'Outcome',
        links: 'Links',
        privateNote: 'Built at Rumo Soluções: the code and screens are not public.',
      },
      items: [
        {
          slug: 'sistema-ordens-de-servico',
          title: 'Work Order System',
          kind: 'For CRC Equipamentos',
          status: 'In production',
          isLive: true,
          isPrivate: true,
          period: '2026',
          summary:
            'Manages the maintenance of industrial equipment, from arrival at the workshop to the report delivered to the customer.',
          highlight:
            'Brings together in one system what used to live in paper, Trello and spreadsheets, with a full history and an automatic PDF report.',
          role: 'Only developer, from the start as an intern through to production: specification, backend, frontend and deployment.',
          stack: ['.NET 10', 'React 19', 'TypeScript', 'PostgreSQL', 'Docker', 'Azure DevOps', 'Spec Kit', 'Claude Code'],
          flow: ['Under review', 'Awaiting quote', 'Awaiting parts', 'In progress', 'Final checks', 'Delivered'],
          problem:
            'CRC Equipamentos tracked each work order on paper, Trello and spreadsheets, and put together the customer report by hand. To find out where an order stood, someone had to ask around.',
          delivered: [
            'A single work order flow that records who did what, and when, at each stage.',
            'A technical checklist with per-part scoring that works out whether a repair is worth it.',
            'Evidence photos annotated straight from a phone, and a PDF report generated by the system.',
            'Kanban board, operations dashboard, role-based permissions and parts import from Excel.',
            '358 automated tests and continuous delivery with Azure DevOps and Docker.',
          ],
          decisions: [
            {
              title: 'Checklist frozen on delivery',
              desc: 'When a work order is delivered, its completed checklist becomes an immutable copy. Changing the template later does not alter the history.',
              tradeoff: 'checklist templates need versioning.',
            },
            {
              title: 'One contract between API and frontend',
              desc: 'React types and calls are generated from OpenAPI with Orval. An API change shows up as a compile error, not as a bug on screen.',
              tradeoff: 'one extra generation step for each change.',
            },
          ],
          result: 'In production at CRC Equipamentos, after three versions delivered and validated in acceptance testing.',
          links: [],
        },
        {
          slug: 'matching-fipe',
          title: 'FIPE Matching',
          kind: 'For Datacar',
          status: 'In production',
          isLive: true,
          isPrivate: true,
          period: '2026',
          summary:
            'Finds the FIPE code (Brazil’s vehicle price table) for each car subscription offer, even when the description is incomplete or worded differently.',
          highlight:
            'New algorithm in production since October 2026, guided by one simple rule: a wrong price is worse than a missing price.',
          role: 'Lead developer of the API: algorithm design, tests, auditing and the production rollout.',
          stack: ['.NET', 'C#', 'MongoDB', 'OpenAI', 'Docker', 'Azure DevOps', 'Spec Kit', 'Claude Code'],
          flow: ['Offer received', 'Text normalization', 'Car family lookup', 'Version elimination', 'Match or hold'],
          problem:
            'Each rental company describes the same car differently. A wrong FIPE code becomes a wrong price for people using Datacar, and the old algorithm relied only on text similarity.',
          delivered: [
            'A staged process that rules out impossible versions and only matches when it is confident and there is no tie.',
            'Doubtful offers are held with the reason recorded, and can be reprocessed later.',
            'An AI assistant to settle ties, with a daily query limit.',
            'An audit screen to review every decision the algorithm makes.',
            'An API covered by 518 automated unit and integration tests.',
          ],
          decisions: [
            {
              title: 'Precision over coverage',
              desc: 'When in doubt, the system does not match. The goal stopped being matching more offers and became not getting them wrong.',
              tradeoff: 'some offers have no price until they are reviewed.',
            },
            {
              title: 'Shadow mode before the switch',
              desc: 'The new algorithm ran alongside the old one in production, without affecting results, to compare the decisions of both.',
              tradeoff: 'two algorithms to maintain during the transition.',
            },
            {
              title: 'AI only for what is left',
              desc: 'The model only steps in on ties the rules cannot settle, and its decision becomes a rule that can be audited.',
              tradeoff: 'rules created by the AI need monitoring.',
            },
          ],
          result: 'Thousands of offers a day go through the new algorithm, and every decision can be audited.',
          links: [],
        },
        {
          slug: 'portal-pibls',
          title: 'PIBLS Website',
          kind: 'Independent project',
          status: 'In production',
          isLive: true,
          isPrivate: false,
          period: '2026',
          summary:
            'Website and admin panel for Primeira Igreja Batista em Lagoa Santa, which replaced the WordPress site without raising hosting costs.',
          highlight:
            'More than 1,600 automated tests in a system planned to last over 5 years with a single person running it.',
          role: 'Only developer: architecture, backend, frontend and operations.',
          stack: ['Laravel 13', 'PHP 8.4', 'React 19', 'TypeScript', 'MySQL', 'Playwright', 'Spec Kit', 'Claude Code'],
          flow: [],
          problem:
            'The church needed to replace its WordPress site with its own website, with a panel for the team to update content, without spending more than the shared hosting it already pays for.',
          delivered: [
            'A pre-rendered public site, with a 160 KB per-page JavaScript limit checked on every build.',
            'An admin panel with role-based permissions, events, ministries, content and visitor requests.',
            'Versioned deployments on shared hosting, with no Node on the server.',
            'Encrypted backups and operating guides so one person can keep the system running.',
          ],
          decisions: [
            {
              title: 'No Node in production',
              desc: 'Shared hosting does not run Node. React is pre-rendered in CI, and the server only delivers files and the PHP API.',
              tradeoff: 'dynamic data depends on API calls from the browser.',
            },
            {
              title: 'Lean operations, recorded in an ADR',
              desc: 'I kept only the alerts one person can actually follow: an off-site backup copy, one monitor and two checks.',
              tradeoff: 'less visibility until the website’s usage grows.',
            },
          ],
          result: 'Live at pibls.com, replacing the old WordPress site on the same shared hosting.',
          links: [
            { label: 'Open the site', href: 'https://pibls.com' },
            { label: 'Code on GitHub', href: 'https://github.com/DaviAfonso88/pibls' },
          ],
        },
        {
          slug: 'fit-ia',
          title: 'FIT.AI',
          kind: 'Independent project',
          status: 'Live',
          isLive: true,
          isPrivate: false,
          period: '2026',
          summary:
            'Workout app with an AI personal trainer that talks to the user, builds the week’s plan and tracks progress.',
          highlight: 'Google login, real-time AI chat and consistency stats, all open source.',
          role: 'Full stack developer. Created in Full Stack Club’s Treinos bootcamp.',
          stack: ['Next.js 16', 'React 19', 'Fastify', 'Prisma', 'PostgreSQL', 'Gemini'],
          flow: ['Chat with the AI', 'Profile lookup', '7-day plan', 'Workout logging', 'Progress stats'],
          problem:
            'Building a workout plan suited to your own goal and keeping up with the routine usually takes a professional or several different tools.',
          delivered: [
            'A Gemini chat that reads and saves data by calling API functions, instead of only generating text.',
            'Weekly plan, timed workout sessions, and streak and consistency stats.',
            'Google login through Better-Auth and an API client generated with Orval from OpenAPI.',
          ],
          decisions: [
            {
              title: 'Function calling instead of free text',
              desc: 'The AI creates the plan by calling an API function, so the result becomes structured data in the database, not text to interpret.',
              tradeoff: 'the prompt and functions must evolve along with the API.',
            },
            {
              title: 'Simple layered architecture',
              desc: 'Route, use case and database. I ruled out hexagonal architecture because this project did not need it.',
              tradeoff: 'less isolation from infrastructure if the project grows.',
            },
          ],
          result: 'Complete application live, with open source code on GitHub.',
          links: [
            { label: 'Open the app', href: 'https://www.fitai.davidev.net.br' },
            { label: 'App code', href: 'https://github.com/DaviAfonso88/FIT.IA-Frontend' },
            { label: 'API code', href: 'https://github.com/DaviAfonso88/FIT.IA-API' },
          ],
        },
        {
          slug: 'davidev-portfolio-produto',
          title: 'DaviDev',
          kind: 'Independent project',
          status: 'Live',
          isLive: true,
          isPrivate: false,
          period: '2026',
          summary: 'This website: portfolio, blog and content panel, built as a real software product.',
          highlight: 'Open documentation, automated tests and 10 CI checks on every change.',
          role: 'Only developer: specification, architecture and implementation.',
          stack: ['Next.js 15', 'Fastify', 'PostgreSQL', 'Drizzle', 'Spec Kit', 'Hexagonal architecture'],
          flow: [],
          problem: 'A PDF résumé does not show how someone makes technical decisions or the quality of their work.',
          delivered: [
            'A site in Portuguese and English, with light and dark themes.',
            'A blog and content panel with version history.',
            'Hexagonal architecture in a monorepo, with dependency rules checked in CI.',
            'PRD, architecture and decisions published alongside the code.',
          ],
          decisions: [
            {
              title: 'Hexagonal architecture on a small project',
              desc: 'Business rules depend on no external library and can be tested without a database.',
              tradeoff: 'more layers and files than a site this size would require.',
            },
            {
              title: 'Fastify API inside Next.js',
              desc: 'The same API serves the admin panel over HTTP and is called directly by pages on the server, with no network hop.',
              tradeoff: 'custom setup to integrate the two.',
            },
          ],
          result: 'Site live, with the whole process open to review.',
          links: [
            { label: 'Code on GitHub', href: 'https://github.com/DaviAfonso88/Portifolio' },
            { label: 'How this site was built', href: '/en/como-foi-construido' },
          ],
        },
        {
          slug: 'almoxarifado',
          title: 'PIBLS Inventory',
          kind: 'Independent project',
          status: 'Completed',
          isLive: false,
          isPrivate: false,
          period: '2025',
          summary: 'Inventory control for the church storeroom, with minimum stock alerts and reports.',
          highlight: 'Stock in and out, a dashboard with charts, and PDF and CSV reports highlighting critical items.',
          role: 'Only developer.',
          stack: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Supabase'],
          flow: [],
          problem: 'The church needed to know what was in its storeroom and what had fallen below minimum stock.',
          delivered: [
            'Product and category registration, with search and stock movement records.',
            'A dashboard with products below the minimum and a comparison chart.',
            'Report export to CSV and PDF.',
          ],
          decisions: [],
          result: 'System delivered to the church, with frontend and database in the cloud.',
          links: [{ label: 'Code on GitHub', href: 'https://github.com/DaviAfonso88/Almoxarifado' }],
        },
        {
          slug: 'saltweb',
          title: 'SaltWeb',
          kind: 'Independent project',
          status: 'Live',
          isLive: true,
          isPrivate: false,
          period: '2024 — 2026',
          summary: 'Website for the youth group of Primeira Igreja Batista em Lagoa Santa, with events, devotionals and a podcast.',
          highlight: 'Rewritten from scratch in Next.js from an old HTML, CSS and JavaScript site.',
          role: 'Developer and interface owner.',
          stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vercel'],
          flow: [],
          problem: 'The old site was hard to maintain, and the contact form needed to be more reliable.',
          delivered: [
            'Event, podcast and devotional pages with reusable components.',
            'A contact form with its own Next.js route.',
            'Devotionals loaded from an external file and updated without a new deployment.',
          ],
          decisions: [
            {
              title: 'Content separate from the interface',
              desc: 'Events and podcasts live in data files, and devotionals come from a JSON file on GitHub Pages.',
              tradeoff: 'with no admin panel, updating events still means editing files.',
            },
          ],
          result: 'Official youth group website live.',
          links: [
            { label: 'Open the site', href: 'https://juventude-salt.vercel.app' },
            { label: 'Code on GitHub', href: 'https://github.com/DaviAfonso88/SaltWeb' },
          ],
        },
        {
          slug: 'recanto-vida',
          title: 'Recanto Vida Website',
          kind: 'Independent project',
          status: 'Live',
          isLive: true,
          isPrivate: false,
          period: '2025 — Present',
          summary: 'Website for Lar de Idosos Recanto Vida, a care home in Confins, Brazil, presenting its work and inviting the community to contribute and volunteer.',
          highlight: 'I built the site, contracted the hosting, and remain responsible for the institution’s hosting, domains and email.',
          role: 'Owner of the whole project: site development, hosting, domains and email.',
          stack: ['WordPress', 'Elementor', 'HostGator'],
          flow: [],
          problem: 'The care home needed a more accessible and welcoming website that showed its mission and brought the institution closer to the community.',
          delivered: [
            'A site with pages for the home’s story, services, donations and contact, with a call for volunteers.',
            'A section for the institution’s events and activities.',
            'Hosting contracted with HostGator, plus management of the domains and institutional email.',
          ],
          decisions: [],
          result: 'Site live, with the institution’s own domain and email, and I still look after the hosting.',
          links: [{ label: 'Open the site', href: 'https://orecantovida.com.br/' }],
        },
      ],
    },
    contact: {
      headline: 'Let’s talk.',
      intro:
        'Have a role or a project in mind? Write here or use the direct channels.',
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
        turnstileError: 'The anti spam verification could not be completed. Reload the page and try again.',
        turnstileUnavailable: 'Anti spam verification unavailable in this environment',
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
    howIWork: {
      metaTitle: 'How I work with AI and software architecture',
      metaDescription:
        'How I use AI agents inside a flow with a PRD, architecture, specification and validation, and why I keep studying code.',
      headlineLines: ['AI amplifies what I know.', 'That’s why I keep studying.'],
      intro:
        'I believe AI amplifies my career: with it, I deliver more and take on bigger problems. But it only multiplies what I already know. Someone who doesn’t understand the code can’t tell when an answer is wrong, so I keep studying programming and software architecture.',
      flowTitle: 'My flow: decide before generating code',
      flowIntro: 'I write the product and the architecture first. Agents only come in after that, following what has already been decided.',
      layers: [
        {
          name: 'Product',
          question: 'What and why',
          description:
            'The PRD, the product document, defines the problem, the audience, the business rules, the scope and the success metrics.',
        },
        {
          name: 'Architecture',
          question: 'The technical structure',
          description:
            'The architecture document settles the structure and the technical specs before any implementation.',
        },
        {
          name: 'Specification',
          question: 'What to do, exactly',
          description:
            'I follow Spec-Driven Development (SDD): Spec Kit turns the PRD and the architecture into a specification, a plan and tasks, with quality gates along the way.',
        },
        {
          name: 'Agents',
          question: 'Who does the work',
          description:
            'AI agents implement the tasks inside the harness I build for each project, the infrastructure around the model: rules, tools, permissions, memory, subagents, skills and automated checks.',
        },
        {
          name: 'Validation',
          question: 'Does it all still fit',
          description:
            'I check that the code is still consistent with the PRD, the architecture, the specification, the plan and the tasks.',
        },
      ],
      authorityTitle: 'Which decision wins',
      authorityChainLabel: 'Order of authority, from highest to lowest',
      authorityChain: ['PRD', 'Architecture', 'Specification', 'Plan', 'Tasks', 'Code'],
      authorityBody:
        'A lower layer can’t contradict a decision from a higher one without explicit review and approval. If there is a conflict, the original decision is identified and the conflict is explained. Nothing changes silently.',
      splitTitle: 'What goes to AI and what stays with me',
      splitAiTitle: 'With AI agents',
      splitAiItems: [
        'Implementing tasks that are already specified.',
        'Looking up current documentation, navigating the code and testing, with Context7, Serena, TestSprite and MCP.',
        'Repeating the work until the checks pass.',
      ],
      splitMeTitle: 'With me',
      splitMeItems: [
        'Defining the problem, the scope and the architecture.',
        'Building the harness for each project and orchestrating the agents and subagents.',
        'Reviewing what was done and answering for the result.',
        'Only calling something done when it passes the tests.',
      ],
      studyTitle: 'I keep studying code and architecture',
      studyParagraphs: [
        'I need to understand what’s underneath to review what AI delivers and to know when it’s wrong. AI doesn’t replace my studies: they’re what let me use it well.',
        'I’m taking a postgraduate course in Software Architecture with AI at Full Stack Club and keep practicing in study projects, such as FIT.AI, created in the Treinos bootcamp.',
      ],
      studyLink: { label: 'See my projects on GitHub', href: 'https://github.com/DaviAfonso88?tab=repositories' },
      appliedTitle: 'What I’ve already taken into real projects',
      applied: [
        { topic: 'Clean Architecture with DDD and the Repository Pattern', where: 'Work Order System' },
        { topic: 'Hexagonal architecture in a modular monolith, with boundaries checked by tooling', where: 'This site' },
        { topic: 'Decisions recorded in ADRs, including the rejected alternatives', where: 'Work Order System and PIBLS Website' },
        { topic: 'OpenAPI contract with a client generated by Orval', where: 'Work Order System and FIT.AI' },
        { topic: 'Database indexes and pagination', where: 'Work Order System, FIPE Matching and PIBLS Website' },
      ],
      appliedExtra: 'I also have knowledge of vertical and horizontal scaling, distributed caching and load balancing.',
      proofTitle: 'Where this method has already run',
      proof: [
        {
          title: 'Work Order System',
          href: '/projetos/sistema-ordens-de-servico',
          detail: 'Spec Kit from the first commit, with a documented PRD and architecture. In production, with 358 tests.',
        },
        {
          title: 'FIPE Matching',
          href: '/projetos/matching-fipe',
          detail: 'Spec Kit applied to an existing system. In production, with the API covered by 518 tests.',
        },
        {
          title: 'PIBLS Website',
          href: '/projetos/portal-pibls',
          detail: 'In production, with a PRD, architecture, decisions recorded in ADRs and more than 1,600 tests.',
        },
        {
          title: 'This site',
          href: '/como-foi-construido',
          detail: 'PRD and architecture open for anyone to read, with the step-by-step published.',
        },
      ],
      teachingBody:
        'I also taught this method at Rumo Soluções: I prepared 2 internal AI training sessions (harnesses and MCP) and wrote 9 playbooks that guide agents in building bots to the team’s standard.',
      ctaBuilt: 'See how this site was built',
      ctaContact: 'Get in touch',
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
        { label: 'Go Live Readiness & Audit Report', href: 'https://github.com/DaviAfonso88/Portifolio/blob/main/docs/go-live-readiness-report.md', isExternal: true },
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
