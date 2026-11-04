import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Dictionary } from '../../lib/dictionary';

type Project = Dictionary['projects']['items'][number];

/** Keeps multi-word technologies such as "Claude Code" on one line when the list wraps. */
export function formatStack(stack: string[]): string {
  return stack.map((item) => item.replace(/ /g, '\u00A0')).join(' · ');
}

export function ProjectStatus({ status, isLive }: { status: string; isLive: boolean }) {
  return (
    <span
      className={
        isLive
          ? 'rounded-[3px] border border-success/30 bg-success/10 px-2 py-1 font-mono text-[11px] text-success'
          : 'rounded-[3px] border border-rule px-2 py-1 font-mono text-[11px] text-ink-2'
      }
    >
      {status}
    </span>
  );
}

interface ProjectRowProps {
  project: Project;
  href: string;
  detailsLabel: string;
  headingLevel: 'h2' | 'h3';
}

export function ProjectRow({ project, href, detailsLabel, headingLevel: Heading }: ProjectRowProps) {
  return (
    <article className="group relative grid grid-cols-1 md:grid-cols-[170px_1fr] gap-4 md:gap-10 py-9 border-t border-rule">
      <div className="flex flex-wrap md:flex-col items-center md:items-start gap-x-3 gap-y-2">
        <ProjectStatus status={project.status} isLive={project.isLive} />
        <span className="text-sm text-ink-3">{project.kind}</span>
        <span className="font-mono text-xs text-ink-3">{project.period}</span>
      </div>

      <div className="flex flex-col gap-3 max-w-[72ch]">
        <Heading className="font-serif text-[28px] md:text-[34px] leading-[1.15] text-ink font-normal">
          <Link
            href={href}
            className="transition-colors group-hover:text-accent after:absolute after:inset-0 after:content-['']"
          >
            {project.title}
          </Link>
        </Heading>
        <p className="text-base md:text-[17px] leading-[1.6] text-ink">{project.summary}</p>
        <p className="text-[15px] leading-[1.6] text-ink-2">{project.highlight}</p>
        <p className="font-mono text-xs leading-[1.7] text-ink-3">{formatStack(project.stack)}</p>
        <span aria-hidden="true" className="inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-accent">
          {detailsLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
