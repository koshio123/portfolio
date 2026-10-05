import type { DiagramNode } from "@/content/projects";

type Props = {
  nodes: DiagramNode[];
  caption?: string;
  /** カード用の小さい表示 */
  compact?: boolean;
};

/**
 * 抽象化したアーキテクチャ図。箱を左から右へ並べ、主役だけ夜色の箱にする。
 * 狭い画面では折り返す。
 */
export function ArchitectureDiagram({ nodes, caption, compact = false }: Props) {
  const box = compact ? "px-2.5 py-2 text-xs" : "px-4 py-3 text-sm";
  const diagram = (
    <ol
      aria-label={caption ?? "構成図"}
      className={`flex flex-wrap items-center justify-center ${compact ? "gap-2" : "gap-3"}`}
    >
      {nodes.map((node, i) => (
        <li key={node.label} className="flex items-center gap-2">
          <span
            className={`rounded-sm leading-normal ${box} ${
              node.main
                ? "bg-night-box font-bold text-cyan"
                : "border border-line-strong bg-bg text-ink"
            }`}
          >
            {node.label}
          </span>
          {i < nodes.length - 1 && (
            <span aria-hidden className="text-ink-muted">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );

  if (compact) return diagram;

  return (
    <figure className="rounded-lg bg-surface px-6 py-10 md:px-8">
      {diagram}
      {caption && <figcaption className="mt-6 text-xs leading-relaxed text-ink-muted">{caption}</figcaption>}
    </figure>
  );
}
