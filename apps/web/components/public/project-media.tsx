import type { ReactNode } from 'react';
import { getImageProps } from 'next/image';
import { getProjectMedia, type MediaLocale, type ProjectMediaConfig } from '../../lib/project-media';

type Variant = 'card' | 'hero';

interface ProjectMediaProps {
  slug: string;
  locale: string;
  /** Etapas do fluxo do projeto, já traduzidas; alimentam os diagramas. */
  steps: string[];
  variant: Variant;
}

function toMediaLocale(locale: string): MediaLocale {
  return locale === 'en' ? 'en' : 'pt-BR';
}

/**
 * Mesma ideia do ProfilePhoto: next/image injeta um style inline que a CSP do site bloqueia,
 * então usamos getImageProps para manter o srcSet otimizado e descartar o style.
 */
function MediaImage({
  src,
  width,
  height,
  alt,
  sizes,
  className,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  sizes: string;
  className: string;
}) {
  const { style: _inlineStyle, ...imageProps } = getImageProps({
    src,
    width,
    height,
    alt,
    sizes,
    quality: 80,
    className,
  }).props;

  return <img {...imageProps} alt={alt} loading="lazy" />;
}

function BrowserFrame({
  media,
  alt,
  variant,
}: {
  media: Extract<ProjectMediaConfig, { kind: 'browser' }>;
  alt: string;
  variant: Variant;
}) {
  const isCard = variant === 'card';

  return (
    <div className={`flex flex-col overflow-hidden rounded-lg border border-rule bg-surface ${isCard ? 'h-full' : ''}`}>
      <div className="flex shrink-0 items-center gap-1.5 border-b border-rule bg-surface-sunken px-3 py-2">
        <span aria-hidden="true" className="size-2 rounded-full bg-rule" />
        <span aria-hidden="true" className="size-2 rounded-full bg-rule" />
        <span aria-hidden="true" className="size-2 rounded-full bg-rule" />
        <span className="ml-2 truncate rounded-[3px] bg-paper px-2 py-0.5 font-mono text-[10px] text-ink-3">
          {media.host}
        </span>
      </div>
      <MediaImage
        src={media.src}
        width={media.width}
        height={media.height}
        alt={isCard ? '' : alt}
        sizes={isCard ? '(min-width: 1024px) 320px, 90vw' : '(min-width: 1280px) 1180px, 100vw'}
        className={isCard ? 'min-h-0 w-full flex-1 object-cover object-top' : 'h-auto w-full'}
      />
    </div>
  );
}

function PhoneFrame({
  media,
  alt,
  variant,
}: {
  media: Extract<ProjectMediaConfig, { kind: 'phone' }>;
  alt: string;
  variant: Variant;
}) {
  const isCard = variant === 'card';

  return (
    <div
      className={
        isCard
          ? 'flex h-full justify-center overflow-hidden rounded-lg border border-rule bg-surface-sunken pt-5'
          : 'flex justify-center rounded-lg border border-rule bg-surface-sunken px-5 py-10 md:py-14'
      }
    >
      <div
        className={`overflow-hidden border-[5px] border-ink bg-ink ${
          isCard ? 'h-fit w-[44%] rounded-[22px]' : 'h-fit w-[270px] rounded-[34px]'
        }`}
      >
        <MediaImage
          src={media.src}
          width={media.width}
          height={media.height}
          alt={isCard ? '' : alt}
          sizes={isCard ? '150px' : '270px'}
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}

/** Quebra o texto em linhas curtas, porque o SVG não quebra linha sozinho. */
function wrapLines(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let current = '';

  for (const word of text.split(' ')) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function SvgLabel({
  text,
  x,
  y,
  maxChars,
  className,
  lineHeight = 20,
}: {
  text: string;
  x: number;
  y: number;
  maxChars: number;
  className: string;
  lineHeight?: number;
}) {
  const lines = wrapLines(text, maxChars);
  // Centraliza o bloco de linhas verticalmente em torno de y.
  const firstY = y - ((lines.length - 1) * lineHeight) / 2;

  return (
    <text x={x} textAnchor="middle" dominantBaseline="central" className={className}>
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} y={firstY + index * lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

/** Colunas de um quadro Kanban: uma por etapa da OS, numeradas na ordem do fluxo. */
function BoardDiagram({ steps, label, hidden }: { steps: string[]; label: string; hidden: boolean }) {
  const laneWidth = 224;
  const laneHeight = 180;
  const gap = 24;
  const lastIndex = steps.length - 1;

  return (
    <svg
      viewBox="0 0 720 384"
      role={hidden ? undefined : 'img'}
      aria-label={hidden ? undefined : label}
      aria-hidden={hidden || undefined}
      className="h-full w-full"
    >
      {steps.map((step, index) => {
        const x = (index % 3) * (laneWidth + gap);
        const y = Math.floor(index / 3) * (laneHeight + gap);
        const isLast = index === lastIndex;

        return (
          <g key={step}>
            <rect
              x={x}
              y={y}
              width={laneWidth}
              height={laneHeight}
              rx={10}
              className={`fill-surface ${isLast ? 'stroke-success' : 'stroke-rule'}`}
              strokeWidth={isLast ? 2 : 1.5}
            />
            <circle cx={x + 28} cy={y + 32} r={13} className={isLast ? 'fill-success' : 'fill-accent'} />
            <text
              x={x + 28}
              y={y + 32}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-paper font-mono text-[13px] font-medium"
            >
              {index + 1}
            </text>
            <text x={x + 50} y={y + 32} dominantBaseline="central" className="fill-ink font-sans text-[15px] font-medium">
              {step}
            </text>
            {/* Cartões só ilustram o quadro; não representam ordens reais. */}
            <rect x={x + 16} y={y + 66} width={laneWidth - 32} height={42} rx={6} className="fill-surface-sunken" />
            <rect x={x + 28} y={y + 80} width={laneWidth - 90} height={6} rx={3} className="fill-rule" />
            <rect x={x + 28} y={y + 92} width={laneWidth - 130} height={6} rx={3} className="fill-rule" />
            {index % 2 === 0 && (
              <>
                <rect x={x + 16} y={y + 118} width={laneWidth - 32} height={42} rx={6} className="fill-surface-sunken" />
                <rect x={x + 28} y={y + 132} width={laneWidth - 100} height={6} rx={3} className="fill-rule" />
                <rect x={x + 28} y={y + 144} width={laneWidth - 150} height={6} rx={3} className="fill-rule" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Etapas em sequência que terminam em dois desfechos: associar ou reter. */
function PipelineDiagram({
  steps,
  matched,
  held,
  label,
  hidden,
}: {
  steps: string[];
  matched: string;
  held: string;
  label: string;
  hidden: boolean;
}) {
  const chain = steps.slice(0, -1);
  const finalStep = steps[steps.length - 1] ?? '';
  const boxWidth = 150;
  const boxHeight = 80;
  const gap = (720 - chain.length * boxWidth) / Math.max(chain.length - 1, 1);

  return (
    <svg
      viewBox="0 0 720 384"
      role={hidden ? undefined : 'img'}
      aria-label={hidden ? undefined : label}
      aria-hidden={hidden || undefined}
      className="h-full w-full"
    >
      <defs>
        <marker id="pipeline-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-ink-3" />
        </marker>
      </defs>

      {chain.map((step, index) => {
        const x = index * (boxWidth + gap);
        return (
          <g key={step}>
            <rect x={x} y={20} width={boxWidth} height={boxHeight} rx={10} className="fill-surface stroke-rule" strokeWidth={1.5} />
            <SvgLabel text={step} x={x + boxWidth / 2} y={20 + boxHeight / 2} maxChars={15} className="fill-ink font-sans text-[16px]" />
            {index < chain.length - 1 && (
              <path
                d={`M${x + boxWidth + 4} 60 H${x + boxWidth + gap - 4}`}
                className="stroke-ink-3"
                strokeWidth={1.5}
                fill="none"
                markerEnd="url(#pipeline-arrow)"
              />
            )}
          </g>
        );
      })}

      {/* Última caixa da cadeia desce até a etapa final. */}
      <path
        d={`M${720 - boxWidth / 2} 104 V135 H360 V164`}
        className="stroke-ink-3"
        strokeWidth={1.5}
        fill="none"
        markerEnd="url(#pipeline-arrow)"
      />

      <rect x={240} y={170} width={240} height={70} rx={10} className="fill-accent-soft stroke-accent" strokeWidth={2} />
      <SvgLabel text={finalStep} x={360} y={205} maxChars={24} className="fill-ink font-sans text-[17px] font-medium" />

      <path d="M360 240 V265 H210 V294" className="stroke-ink-3" strokeWidth={1.5} fill="none" markerEnd="url(#pipeline-arrow)" />
      <path d="M360 265 H510 V294" className="stroke-ink-3" strokeWidth={1.5} fill="none" markerEnd="url(#pipeline-arrow)" />

      <rect x={90} y={300} width={240} height={64} rx={10} className="fill-surface stroke-success" strokeWidth={2} />
      <SvgLabel text={matched} x={210} y={332} maxChars={22} className="fill-ink font-sans text-[16px]" />
      <rect x={390} y={300} width={240} height={64} rx={10} className="fill-surface stroke-rule" strokeWidth={2} />
      <SvgLabel text={held} x={510} y={332} maxChars={22} className="fill-ink font-sans text-[16px]" />
    </svg>
  );
}

/** Telas do painel administrativo, com a ressalva de que os dados são fictícios. */
export function ProjectGallery({ slug, locale }: { slug: string; locale: string }) {
  const gallery = getProjectMedia(slug)?.gallery;
  if (!gallery) return null;

  const lang = toMediaLocale(locale);

  return (
    <section aria-labelledby={`galeria-${slug}`} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id={`galeria-${slug}`} className="text-xl font-semibold text-ink">
          {gallery.title[lang]}
        </h2>
        <p className="max-w-[68ch] text-[15px] leading-[1.6] text-ink-3">{gallery.note[lang]}</p>
      </div>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
        {gallery.items.map((item) => {
          const { alt, caption } = item.texts[lang];

          return (
            <li key={item.src}>
              <figure className="flex flex-col gap-3">
                <div className="flex flex-col overflow-hidden rounded-lg border border-rule bg-surface">
                  <div className="flex shrink-0 items-center gap-1.5 border-b border-rule bg-surface-sunken px-3 py-2">
                    <span aria-hidden="true" className="size-2 rounded-full bg-rule" />
                    <span aria-hidden="true" className="size-2 rounded-full bg-rule" />
                    <span aria-hidden="true" className="size-2 rounded-full bg-rule" />
                    <span className="ml-2 truncate rounded-[3px] bg-paper px-2 py-0.5 font-mono text-[10px] text-ink-3">
                      {gallery.frameLabel[lang]}
                    </span>
                  </div>
                  <MediaImage
                    src={item.src}
                    width={item.width}
                    height={item.height}
                    alt={alt}
                    sizes="(min-width: 1280px) 580px, (min-width: 768px) 45vw, 100vw"
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="text-sm text-ink-3">{caption}</figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ProjectMedia({ slug, locale, steps, variant }: ProjectMediaProps) {
  const media = getProjectMedia(slug);
  if (!media) return null;

  const texts = media.texts[toMediaLocale(locale)];
  const isCard = variant === 'card';

  let content: ReactNode;
  if (media.kind === 'browser') {
    content = <BrowserFrame media={media} alt={texts.alt} variant={variant} />;
  } else if (media.kind === 'phone') {
    content = <PhoneFrame media={media} alt={texts.alt} variant={variant} />;
  } else {
    // Na lista o diagrama é decorativo; na página do projeto ele se descreve pelo aria-label.
    const diagram =
      media.kind === 'board' ? (
        <BoardDiagram steps={steps} label={texts.alt} hidden={isCard} />
      ) : (
        <PipelineDiagram
          steps={steps}
          matched={texts.matched ?? ''}
          held={texts.held ?? ''}
          label={texts.alt}
          hidden={isCard}
        />
      );

    content = (
      <div
        className={
          isCard
            ? 'h-full rounded-lg border border-rule bg-surface-sunken p-3'
            : 'rounded-lg border border-rule bg-surface-sunken p-5 md:p-10'
        }
      >
        <div className={isCard ? 'h-full' : 'mx-auto aspect-[720/384] max-w-[760px]'}>{diagram}</div>
      </div>
    );
  }

  return (
    <figure className={isCard ? 'aspect-[16/11] w-full' : 'flex flex-col gap-3'} aria-hidden={isCard || undefined}>
      {content}
      {!isCard && <figcaption className="text-sm text-ink-3">{texts.caption}</figcaption>}
    </figure>
  );
}
