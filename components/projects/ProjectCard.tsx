import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";
import { KindTag } from "@/components/ui/Tag";
import { ArchitectureDiagram } from "./ArchitectureDiagram";

/** Projects 一覧のカード。large は業務プロジェクト用の図つき */
export function ProjectCard({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="flex flex-col overflow-hidden rounded-lg border border-line text-ink no-underline transition-colors hover:border-line-strong hover:text-ink"
    >
      {large && (
        <div className="relative flex h-48 items-center justify-center bg-surface px-4">
          {project.image ? (
            <Image src={project.image.src} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
          ) : (
            <ArchitectureDiagram nodes={project.diagram.nodes} compact />
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2.5 p-6">
        <KindTag kind={project.kind} />
        <h3 className="text-h3 font-bold">{project.title}</h3>
        <p className="text-sm leading-relaxed text-ink-muted">{project.summary}</p>
        {large && (
          <p className="mt-auto flex flex-wrap gap-3 pt-2 font-mono text-xs text-ink-muted">
            {project.stack.slice(0, 4).map((s) => (
              <span key={s}>{s}</span>
            ))}
          </p>
        )}
      </div>
    </Link>
  );
}
