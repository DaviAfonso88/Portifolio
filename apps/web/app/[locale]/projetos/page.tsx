import { getDictionary } from '../../../lib/dictionary';
import { ProjectRow } from '../../../components/public/project-row';

interface ProjetosPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProjetosPage({ params }: ProjetosPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <div className="px-5 md:px-20 py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="font-serif text-4xl md:text-[56px] leading-[1.1] tracking-[-0.02em] text-ink font-normal">
            {dict.projects.headline}
          </h1>
          <p className="max-w-[62ch] text-base md:text-[17px] leading-[1.65] text-ink-2">
            {dict.projects.intro}
          </p>
        </div>

        <div className="flex flex-col border-b border-rule">
          {dict.projects.items.map((project) => (
            <ProjectRow
              key={project.slug}
              project={project}
              href={`/${locale}/projetos/${project.slug}`}
              detailsLabel={dict.projects.labels.viewDetails}
              headingLevel="h2"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
