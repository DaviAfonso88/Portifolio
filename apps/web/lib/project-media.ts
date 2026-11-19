export type MediaLocale = 'pt-BR' | 'en';

interface MediaTexts {
  /** Descrição para leitores de tela; nas listas a imagem é decorativa e usa só o título do projeto. */
  alt: string;
  caption: string;
  /** Rótulos extras do diagrama de pipeline. */
  matched?: string;
  held?: string;
}

/** Uma tela do painel administrativo, com texto nos dois idiomas. */
export interface GalleryItem {
  src: string;
  width: number;
  height: number;
  texts: Record<MediaLocale, { alt: string; caption: string }>;
}

/** Galeria de telas de um painel que exige login, montada com dados fictícios. */
export interface GalleryConfig {
  /** Texto exibido na barra da moldura, no lugar de um endereço, porque os dados não são reais. */
  frameLabel: Record<MediaLocale, string>;
  title: Record<MediaLocale, string>;
  note: Record<MediaLocale, string>;
  items: GalleryItem[];
}

interface BaseMedia {
  texts: Record<MediaLocale, MediaTexts>;
  gallery?: GalleryConfig;
}

const PANEL_DIR = '/images/projetos/paineis';
const SHOT = { width: 2880, height: 1800 } as const;

function shot(
  file: string,
  pt: { alt: string; caption: string },
  en: { alt: string; caption: string },
): GalleryItem {
  return { src: `${PANEL_DIR}/${file}`, ...SHOT, texts: { 'pt-BR': pt, en } };
}

const SALT_GALLERY: GalleryConfig = {
  frameLabel: { 'pt-BR': 'Painel administrativo · dados fictícios', en: 'Admin panel · sample data' },
  title: { 'pt-BR': 'Painel administrativo', en: 'Admin panel' },
  note: {
    'pt-BR':
      'Telas do painel, que exige login. Os dados são fictícios, criados só para estas imagens: nada vem de participantes reais.',
    en: 'Screens from the panel, which requires a login. The data is sample data created just for these images: nothing comes from real participants.',
  },
  items: [
    shot(
      'salt-01-visao-geral.png',
      { alt: 'Visão geral do painel administrativo do SaltWeb.', caption: 'Visão geral' },
      { alt: 'Overview of the SaltWeb admin panel.', caption: 'Overview' },
    ),
    shot(
      'salt-02-eventos.png',
      { alt: 'Lista de eventos no painel administrativo do SaltWeb.', caption: 'Eventos' },
      { alt: 'Event list in the SaltWeb admin panel.', caption: 'Events' },
    ),
    shot(
      'salt-03-inscricoes.png',
      { alt: 'Lista de inscrições de um evento no painel do SaltWeb.', caption: 'Inscrições' },
      { alt: 'List of registrations for an event in the SaltWeb panel.', caption: 'Registrations' },
    ),
    shot(
      'salt-04-participantes.png',
      { alt: 'Lista de participantes no painel do SaltWeb.', caption: 'Participantes' },
      { alt: 'Participant list in the SaltWeb panel.', caption: 'Participants' },
    ),
    shot(
      'salt-05-ficha-participante.png',
      {
        alt: 'Ficha de um participante no painel do SaltWeb, com a aba de saúde.',
        caption: 'Ficha do participante, com a ficha de saúde',
      },
      {
        alt: 'A participant record in the SaltWeb panel, on the health tab.',
        caption: 'Participant record, with the health form',
      },
    ),
    shot(
      'salt-06-mensagens.png',
      { alt: 'Caixa de mensagens recebidas pelo site, no painel do SaltWeb.', caption: 'Mensagens do site' },
      { alt: 'Inbox of messages received through the site, in the SaltWeb panel.', caption: 'Site messages' },
    ),
  ],
};

const PIBLS_GALLERY: GalleryConfig = {
  frameLabel: { 'pt-BR': 'Painel da equipe · dados fictícios', en: 'Staff panel · sample data' },
  title: { 'pt-BR': 'Painel da equipe', en: 'Staff panel' },
  note: {
    'pt-BR':
      'Telas do painel, que exige login, vistas com o perfil Secretaria. Os dados são fictícios, gerados só para estas imagens: nenhum contato ou inscrito é real.',
    en: 'Screens from the panel, which requires a login, seen with the Secretary role. The data is sample data generated just for these images: no contact or registrant is real.',
  },
  items: [
    shot(
      'pibls-01-inicio.png',
      { alt: 'Tela inicial do painel da equipe da PIBLS, com resumo e atalhos.', caption: 'Início' },
      { alt: 'Home screen of the PIBLS staff panel, with a summary and shortcuts.', caption: 'Home' },
    ),
    shot(
      'pibls-02-contatos.png',
      { alt: 'Lista de contatos recebidos pelo site da PIBLS.', caption: 'Contatos' },
      { alt: 'List of contacts received through the PIBLS site.', caption: 'Contacts' },
    ),
    shot(
      'pibls-03-boletins.png',
      { alt: 'Lista de edições do boletim no painel da PIBLS.', caption: 'Boletins' },
      { alt: 'List of bulletin editions in the PIBLS panel.', caption: 'Bulletins' },
    ),
    shot(
      'pibls-04-eventos.png',
      { alt: 'Lista de eventos com situação e número de inscritos, no painel da PIBLS.', caption: 'Eventos' },
      { alt: 'Event list with status and number of registrants, in the PIBLS panel.', caption: 'Events' },
    ),
    shot(
      'pibls-06-evento-inscritos.png',
      { alt: 'Lista de inscritos de um evento, com exportação em CSV e PDF.', caption: 'Inscritos de um evento' },
      { alt: 'Registrant list for an event, with CSV and PDF export.', caption: 'Event registrants' },
    ),
    shot(
      'pibls-05-ministerios.png',
      { alt: 'Cadastro de ministérios e grupos no painel da PIBLS.', caption: 'Ministérios e grupos' },
      { alt: 'Ministries and groups management in the PIBLS panel.', caption: 'Ministries and groups' },
    ),
  ],
};

/** Print real de um site público, dentro de uma moldura de navegador. */
interface BrowserMedia extends BaseMedia {
  kind: 'browser';
  src: string;
  width: number;
  height: number;
  host: string;
}

/** Print real de um app pensado para celular, dentro de uma moldura de aparelho. */
interface PhoneMedia extends BaseMedia {
  kind: 'phone';
  src: string;
  width: number;
  height: number;
}

/** Ilustração do fluxo de um sistema privado, montada a partir das etapas já descritas no projeto. */
interface DiagramMedia extends BaseMedia {
  kind: 'board' | 'pipeline';
}

export type ProjectMediaConfig = BrowserMedia | PhoneMedia | DiagramMedia;

/**
 * Mídia de cada projeto, pelo slug. Projeto sem entrada aqui aparece só com texto.
 *
 * Os prints são de sites públicos que estão no ar, capturados em resolução 2x (3x no celular).
 * Os sistemas feitos na Rumo Soluções não têm tela pública, então usam um diagrama do fluxo, sem
 * dados reais nem números.
 */
export const PROJECT_MEDIA: Record<string, ProjectMediaConfig> = {
  'sistema-ordens-de-servico': {
    kind: 'board',
    texts: {
      'pt-BR': {
        alt: 'Ilustração das seis etapas de uma ordem de serviço, de Em análise até Entregue, dispostas como colunas de um quadro Kanban.',
        caption: 'Ilustração do fluxo da ordem de serviço. As telas reais não são públicas.',
      },
      en: {
        alt: 'Illustration of the six stages of a work order, from In review to Delivered, laid out as columns of a Kanban board.',
        caption: 'Illustration of the work order flow. The real screens are not public.',
      },
    },
  },
  'matching-fipe': {
    kind: 'pipeline',
    texts: {
      'pt-BR': {
        alt: 'Ilustração das etapas do algoritmo, da oferta recebida até a associação ao código FIPE ou a retenção com o motivo registrado.',
        caption: 'Ilustração das etapas do algoritmo. As telas reais não são públicas.',
        matched: 'Associada ao código FIPE',
        held: 'Retida, com o motivo registrado',
      },
      en: {
        alt: 'Illustration of the algorithm steps, from the received offer to a FIPE code match or a hold with the reason recorded.',
        caption: 'Illustration of the algorithm steps. The real screens are not public.',
        matched: 'Matched to a FIPE code',
        held: 'Held, with the reason recorded',
      },
    },
  },
  'portal-pibls': {
    kind: 'browser',
    src: '/images/projetos/portal-pibls.jpg',
    width: 2880,
    height: 1800,
    host: 'pibls.com',
    gallery: PIBLS_GALLERY,
    texts: {
      'pt-BR': {
        alt: 'Página inicial do portal da PIBLS, com menu, chamada de boas-vindas, foto da igreja e avisos.',
        caption: 'Página inicial em pibls.com.',
      },
      en: {
        alt: 'Home page of the PIBLS portal, with menu, welcome message, a photo of the church and notices.',
        caption: 'Home page at pibls.com.',
      },
    },
  },
  'fit-ia': {
    kind: 'phone',
    src: '/images/projetos/fit-ia.jpg',
    width: 1170,
    height: 2532,
    texts: {
      'pt-BR': {
        alt: 'Tela de entrada do FIT.AI no celular, com o texto "Treinos sob medida, acompanhamento e consistência" e o botão Continuar com Google.',
        caption: 'Tela de entrada do app, em versão para celular. O restante exige login com Google.',
      },
      en: {
        alt: 'FIT.AI sign-in screen on a phone, with the text "Tailored workouts, tracking and consistency" and a Continue with Google button.',
        caption: 'The app’s sign-in screen on mobile. Everything else requires a Google login.',
      },
    },
  },
  'davidev-portfolio-produto': {
    kind: 'browser',
    src: '/images/projetos/davidev-portfolio-produto.jpg',
    width: 2880,
    height: 1800,
    host: 'portfolio.davidev.net.br',
    texts: {
      'pt-BR': {
        alt: 'Página inicial deste portfólio, com o título, a foto e os dados de Davi Afonso.',
        caption: 'A página inicial deste site.',
      },
      en: {
        alt: 'Home page of this portfolio, with the headline, photo and key facts.',
        caption: 'The home page of this site.',
      },
    },
  },
  saltweb: {
    kind: 'browser',
    src: '/images/projetos/saltweb.jpg',
    width: 2880,
    height: 1800,
    host: 'juventude-salt.vercel.app',
    gallery: SALT_GALLERY,
    texts: {
      'pt-BR': {
        alt: 'Página inicial do SaltWeb, com menu, chamada principal, foto da juventude e os encontros regulares.',
        caption: 'Página inicial do site público. O painel administrativo aparece mais abaixo, com dados fictícios.',
      },
      en: {
        alt: 'Home page of SaltWeb, with menu, main headline, a photo of the youth group and its regular meetings.',
        caption: 'Home page of the public site. The admin panel is shown further down, with sample data.',
      },
    },
  },
  'recanto-vida': {
    kind: 'browser',
    src: '/images/projetos/recanto-vida.jpg',
    width: 2880,
    height: 1800,
    host: 'orecantovida.com.br',
    texts: {
      'pt-BR': {
        alt: 'Página inicial do site do Recanto Vida, com menu, a chamada "Ajude a transformar a vida de idosos" e uma foto de moradora do lar.',
        caption: 'Página inicial em orecantovida.com.br.',
      },
      en: {
        alt: 'Home page of the Recanto Vida site, with menu, the headline "Help transform the lives of older adults" and a photo of a resident.',
        caption: 'Home page at orecantovida.com.br.',
      },
    },
  },
};

export function getProjectMedia(slug: string): ProjectMediaConfig | undefined {
  return PROJECT_MEDIA[slug];
}
