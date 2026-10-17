'use client';

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: {
        props?: Record<string, string | number | boolean>;
        callback?: () => void;
      }
    ) => void;
  }
}

export interface QualifiedDeepeningStatus {
  pageCount: number;
  isProfessional: boolean;
  qualifiedDeepeningTriggered: boolean;
  referrerSource: string;
}

const STORAGE_KEY_PAGE_COUNT = 'davidev_session_page_count';
const STORAGE_KEY_PROFESSIONAL = 'davidev_session_is_professional';
const STORAGE_KEY_REFERRER_SOURCE = 'davidev_session_referrer_source';
const STORAGE_KEY_DEEPENING_TRIGGERED = 'davidev_session_deepening_triggered';
const STORAGE_KEY_VISITED_PAGES = 'davidev_session_visited_pages';

const PROFESSIONAL_PATTERNS = [
  'linkedin',
  'curriculo',
  'resume',
  'cv',
  'github',
  'recruiter',
  'mail',
  'email',
];

/**
 * Dispatches a custom event to Plausible Analytics if available in the browser.
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
    try {
      window.plausible(eventName, { props });
    } catch (err) {
      console.warn('[Analytics] Failed to track Plausible event:', err);
    }
  }
}

/**
 * Evaluates whether an incoming referral or URL search params indicates a professional source.
 */
export function detectProfessionalSource(
  referrer: string = '',
  searchParams: URLSearchParams | null = null
): { isProfessional: boolean; source: string } {
  const refLower = referrer.toLowerCase();

  // Check URL params first (e.g. ?utm_source=linkedin or ?ref=curriculo)
  if (searchParams) {
    const utmSource = searchParams.get('utm_source')?.toLowerCase() || '';
    const utmMedium = searchParams.get('utm_medium')?.toLowerCase() || '';
    const refParam = searchParams.get('ref')?.toLowerCase() || '';

    for (const pat of PROFESSIONAL_PATTERNS) {
      if (utmSource.includes(pat) || utmMedium.includes(pat) || refParam.includes(pat)) {
        return { isProfessional: true, source: utmSource || refParam || pat };
      }
    }
  }

  // Check document.referrer
  for (const pat of PROFESSIONAL_PATTERNS) {
    if (refLower.includes(pat)) {
      return { isProfessional: true, source: pat };
    }
  }

  return { isProfessional: false, source: 'direct_or_other' };
}

/**
 * Tracks session navigation and triggers the primary PRD metric:
 * "Taxa de aprofundamento qualificado" (30% target) when:
 * 1. Visitor originates from a professional channel (LinkedIn, CV, e-mail).
 * 2. Visitor views at least 3 distinct pages during the session.
 * 3. Visit includes "Projetos" or "Como foi construído".
 */
export function registerPageView(
  pathname: string,
  referrer: string = '',
  searchParams: URLSearchParams | null = null
): QualifiedDeepeningStatus {
  if (typeof window === 'undefined') {
    return {
      pageCount: 1,
      isProfessional: false,
      qualifiedDeepeningTriggered: false,
      referrerSource: 'ssr',
    };
  }

  try {
    // 1. Resolve & persist professional referral source for the entire session
    let isProfessional = sessionStorage.getItem(STORAGE_KEY_PROFESSIONAL) === 'true';
    let referrerSource = sessionStorage.getItem(STORAGE_KEY_REFERRER_SOURCE) || '';

    if (!sessionStorage.getItem(STORAGE_KEY_PROFESSIONAL)) {
      const detection = detectProfessionalSource(
        referrer || document.referrer || '',
        searchParams
      );
      isProfessional = detection.isProfessional;
      referrerSource = detection.source;
      sessionStorage.setItem(STORAGE_KEY_PROFESSIONAL, String(isProfessional));
      sessionStorage.setItem(STORAGE_KEY_REFERRER_SOURCE, referrerSource);
    }

    // 2. Track unique pages visited in this session
    const visitedJson = sessionStorage.getItem(STORAGE_KEY_VISITED_PAGES) || '[]';
    let visited: string[] = [];
    try {
      visited = JSON.parse(visitedJson);
    } catch {
      visited = [];
    }

    if (!visited.includes(pathname)) {
      visited.push(pathname);
      sessionStorage.setItem(STORAGE_KEY_VISITED_PAGES, JSON.stringify(visited));
    }

    const pageCount = visited.length;
    sessionStorage.setItem(STORAGE_KEY_PAGE_COUNT, String(pageCount));

    // 3. Evaluate Qualified Deepening criteria
    let deepeningTriggered = sessionStorage.getItem(STORAGE_KEY_DEEPENING_TRIGGERED) === 'true';

    const hasIncludedKeySection = visited.some(
      (path) =>
        path.includes('/projetos') ||
        path.includes('/como-foi-construido') ||
        path.includes('/how-it-was-built')
    );

    if (
      !deepeningTriggered &&
      isProfessional &&
      pageCount >= 3 &&
      hasIncludedKeySection
    ) {
      deepeningTriggered = true;
      sessionStorage.setItem(STORAGE_KEY_DEEPENING_TRIGGERED, 'true');

      // Dispatch Custom Goal to Plausible Analytics (PRD Metric 1)
      trackEvent('Qualified Deepening', {
        source: referrerSource,
        pages_viewed: pageCount,
        trigger_page: pathname,
      });

      // Also track localized alias
      trackEvent('Aprofundamento Qualificado', {
        source: referrerSource,
        paginas_visualizadas: pageCount,
        pagina_gatilho: pathname,
      });
    }

    return {
      pageCount,
      isProfessional,
      qualifiedDeepeningTriggered: deepeningTriggered,
      referrerSource,
    };
  } catch {
    return {
      pageCount: 1,
      isProfessional: false,
      qualifiedDeepeningTriggered: false,
      referrerSource: 'error',
    };
  }
}
