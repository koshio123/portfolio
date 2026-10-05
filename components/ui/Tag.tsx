import { kindLabel, type ProjectKind } from "@/content/projects";

const kindStyles: Record<ProjectKind, string> = {
  work: "bg-amber text-on-accent",
  personal: "bg-tag-personal-bg text-tag-personal-ink",
};

/** プロジェクトの種別タグ(業務・個人開発) */
export function KindTag({ kind }: { kind: ProjectKind }) {
  return (
    <span className={`self-start rounded-full px-3 py-0.5 text-xs ${kindStyles[kind]}`}>
      {kindLabel[kind]}
    </span>
  );
}

/** 技術スタックのチップ */
export function TechChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-line-strong px-2.5 py-1 font-mono text-xs">
      {children}
    </span>
  );
}
