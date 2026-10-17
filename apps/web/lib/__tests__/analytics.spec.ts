import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  detectProfessionalSource,
  trackEvent,
  registerPageView,
} from '../analytics';

describe('Analytics & Qualified Deepening Tracking (T08.02)', () => {
  describe('detectProfessionalSource', () => {
    it('detects professional origin via utm_source', () => {
      const params = new URLSearchParams('utm_source=linkedin&utm_medium=social');
      const result = detectProfessionalSource('', params);
      expect(result.isProfessional).toBe(true);
      expect(result.source).toBe('linkedin');
    });

    it('detects professional origin via ref param (e.g. curriculo/resume)', () => {
      const params = new URLSearchParams('ref=curriculo_pdf');
      const result = detectProfessionalSource('', params);
      expect(result.isProfessional).toBe(true);
      expect(result.source).toBe('curriculo_pdf');
    });

    it('detects professional origin via document.referrer (e.g. LinkedIn)', () => {
      const result = detectProfessionalSource('https://www.linkedin.com/feed/', null);
      expect(result.isProfessional).toBe(true);
      expect(result.source).toBe('linkedin');
    });

    it('detects professional origin via GitHub or Recruiter email', () => {
      const resultGithub = detectProfessionalSource('https://github.com/davi', null);
      expect(resultGithub.isProfessional).toBe(true);
      expect(resultGithub.source).toBe('github');

      const paramsMail = new URLSearchParams('utm_source=email_recruiter');
      const resultMail = detectProfessionalSource('', paramsMail);
      expect(resultMail.isProfessional).toBe(true);
      expect(resultMail.source).toBe('email_recruiter');
    });

    it('returns false for generic search engines or direct navigation', () => {
      const resultGoogle = detectProfessionalSource('https://www.google.com/', null);
      expect(resultGoogle.isProfessional).toBe(false);
      expect(resultGoogle.source).toBe('direct_or_other');

      const resultDirect = detectProfessionalSource('', null);
      expect(resultDirect.isProfessional).toBe(false);
      expect(resultDirect.source).toBe('direct_or_other');
    });
  });

  describe('Browser Session & Event Tracking', () => {
    let mockStorage: Record<string, string> = {};

    beforeEach(() => {
      mockStorage = {};
      const sessionStorageMock = {
        getItem: vi.fn((key: string) => mockStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: vi.fn(() => {
          mockStorage = {};
        }),
        length: 0,
        key: vi.fn(() => null),
      };


      const plausibleMock = vi.fn();

      (global as any).window = {
        sessionStorage: sessionStorageMock,
        plausible: plausibleMock,
      };

      (global as any).document = {
        referrer: '',
      };
      (global as any).sessionStorage = sessionStorageMock;
    });

    afterEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      delete (global as any).sessionStorage;
      vi.restoreAllMocks();
    });


    it('dispatches Plausible event when window.plausible is defined', () => {
      trackEvent('CustomGoal', { foo: 'bar' });
      expect(window.plausible).toHaveBeenCalledWith('CustomGoal', {
        props: { foo: 'bar' },
      });
    });

    it('does not trigger qualified deepening if visitor is not from a professional source', () => {
      const params = new URLSearchParams('');
      registerPageView('/pt-BR', '', params);
      registerPageView('/pt-BR/blog', '', params);
      const res = registerPageView('/pt-BR/projetos', '', params);

      expect(res.isProfessional).toBe(false);
      expect(res.pageCount).toBe(3);
      expect(res.qualifiedDeepeningTriggered).toBe(false);
      expect(window.plausible).not.toHaveBeenCalled();
    });

    it('does not trigger qualified deepening if < 3 pages are visited', () => {
      const params = new URLSearchParams('utm_source=linkedin');
      const res1 = registerPageView('/pt-BR', 'https://linkedin.com', params);
      expect(res1.isProfessional).toBe(true);
      expect(res1.pageCount).toBe(1);
      expect(res1.qualifiedDeepeningTriggered).toBe(false);

      const res2 = registerPageView('/pt-BR/projetos', 'https://linkedin.com', params);
      expect(res2.pageCount).toBe(2);
      expect(res2.qualifiedDeepeningTriggered).toBe(false);
      expect(window.plausible).not.toHaveBeenCalled();
    });

    it('triggers Qualified Deepening goal when a professional visitor views >= 3 pages including /projetos', () => {
      const params = new URLSearchParams('utm_source=linkedin');

      registerPageView('/pt-BR', 'https://linkedin.com', params);
      registerPageView('/pt-BR/sobre', '', null);
      const res3 = registerPageView('/pt-BR/projetos', '', null);

      expect(res3.pageCount).toBe(3);
      expect(res3.isProfessional).toBe(true);
      expect(res3.qualifiedDeepeningTriggered).toBe(true);

      // Verify custom Plausible event dispatched
      expect(window.plausible).toHaveBeenCalledWith('Qualified Deepening', {
        props: {
          source: 'linkedin',
          pages_viewed: 3,
          trigger_page: '/pt-BR/projetos',
        },
      });

      expect(window.plausible).toHaveBeenCalledWith('Aprofundamento Qualificado', {
        props: {
          source: 'linkedin',
          paginas_visualizadas: 3,
          pagina_gatilho: '/pt-BR/projetos',
        },
      });
    });

    it('triggers Qualified Deepening goal when a professional visitor views >= 3 pages including /como-foi-construido', () => {
      const params = new URLSearchParams('ref=curriculo');

      registerPageView('/pt-BR', '', params);
      registerPageView('/pt-BR/habilidades', '', null);
      const res = registerPageView('/pt-BR/como-foi-construido', '', null);

      expect(res.pageCount).toBe(3);
      expect(res.qualifiedDeepeningTriggered).toBe(true);
      expect(window.plausible).toHaveBeenCalledWith('Qualified Deepening', expect.any(Object));
    });

    it('does not double trigger once deepening was already triggered in the same session', () => {
      const params = new URLSearchParams('utm_source=linkedin');

      registerPageView('/pt-BR', 'https://linkedin.com', params);
      registerPageView('/pt-BR/sobre', '', null);
      registerPageView('/pt-BR/projetos', '', null);

      const callsAfterFirstTrigger = (window.plausible as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(callsAfterFirstTrigger).toBe(2); // 'Qualified Deepening' + 'Aprofundamento Qualificado'

      // 4th page view
      registerPageView('/pt-BR/contato', '', null);
      expect((window.plausible as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterFirstTrigger);
    });
  });
});
