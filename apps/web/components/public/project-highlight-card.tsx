import Link from 'next/link';

interface ProjectHighlightCardProps {
  badge: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
}

export function ProjectHighlightCard({
  badge,
  title,
  description,
  tags,
  href,
}: ProjectHighlightCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3.5 rounded-[6px] border border-rule bg-surface p-[26px] transition-all hover:border-ink-2 hover:shadow-sm"
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
        {badge}
      </div>
      <h3 className="text-xl font-semibold leading-[1.35] text-ink group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-sm leading-[1.65] text-ink-2 line-clamp-3">
        {description}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
        {tags.map((tag, idx) => (
          <span key={tag} className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-ink-3">{tag}</span>
            {idx < tags.length - 1 && <span className="text-rule">·</span>}
          </span>
        ))}
      </div>
    </Link>
  );
}
