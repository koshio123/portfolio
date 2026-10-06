import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";
import { KindTag } from "@/components/ui/Tag";

/** Projects 一覧のカード */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="flex flex-col overflow-hidden rounded-lg border border-line text-ink no-underline transition-colors hover:border-line-strong hover:text-ink"
    >
      {project.image && (
        <div className="relative h-48 bg-surface">
          <Image
            src={project.image.src}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2.5 p-6">
        <KindTag kind={project.kind} />
        <h3 className="text-h3 font-bold">{project.title}</h3>
        <p className="text-sm leading-relaxed text-ink-muted">
          {project.summary}
        </p>
        <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-2 font-mono text-xs text-ink-muted">
          {project.stack.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </p>
      </div>
    </Link>
  );
}
