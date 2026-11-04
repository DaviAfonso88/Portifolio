'use client';

import * as React from 'react';
import Script from 'next/script';

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

// Abaixo disso o tamanho "flexible" (mínimo de 300px) estouraria o cartão do formulário.
const FLEXIBLE_MIN_WIDTH = 300;

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileWidgetHandle {
  /** O token só vale uma vez: pede outro depois de cada envio. */
  reset(): void;
}

interface TurnstileWidgetProps {
  ref?: React.Ref<TurnstileWidgetHandle>;
  siteKey: string;
  locale: string;
  nonce?: string;
  onToken(token: string): void;
  onExpire(): void;
  onError(): void;
}

/**
 * Só aparece se a Cloudflare pedir interação; nos demais casos, o estado fica na faixa de
 * verificação do formulário, como em design/Contato.dc.html.
 */
export function TurnstileWidget({
  ref,
  siteKey,
  locale,
  nonce,
  onToken,
  onExpire,
  onError,
}: TurnstileWidgetProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const [isInteractive, setIsInteractive] = React.useState(false);

  const renderWidget = () => {
    const container = containerRef.current;
    if (!container || !window.turnstile || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(container, {
      sitekey: siteKey,
      language: locale.toLowerCase(),
      appearance: 'interaction-only',
      size: container.offsetWidth < FLEXIBLE_MIN_WIDTH ? 'compact' : 'flexible',
      'response-field': false,
      'before-interactive-callback': () => setIsInteractive(true),
      'after-interactive-callback': () => setIsInteractive(false),
      callback: onToken,
      'expired-callback': onExpire,
      'timeout-callback': onExpire,
      'error-callback': () => {
        onError();
        return true;
      },
      'unsupported-callback': onError,
    });
  };

  // O widget é criado uma vez por montagem. O script já pode estar carregado, se o visitante
  // voltou a esta página sem recarregar; se não estiver, onReady cria o widget depois.
  React.useEffect(() => {
    renderWidget();
    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  React.useImperativeHandle(ref, () => ({
    reset() {
      if (widgetIdRef.current) {
        window.turnstile?.reset(widgetIdRef.current);
      }
    },
  }));

  return (
    <>
      <Script
        src={TURNSTILE_SCRIPT_URL}
        strategy="afterInteractive"
        nonce={nonce}
        onReady={renderWidget}
        onError={onError}
      />
      <div ref={containerRef} className={isInteractive ? 'mt-3' : undefined} />
    </>
  );
}
