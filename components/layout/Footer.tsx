import { site } from "@/content/site";

/** 全ページ共通のフッター。常に Night ゾーン */
export function Footer() {
  return (
    <footer data-theme="night" className="border-t border-line bg-bg py-10 text-ink-muted">
      <div className="container-page flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono font-medium text-ink">{site.name}</span>
        <span className="font-mono text-xs">© {new Date().getFullYear()} {site.name}</span>
      </div>
    </footer>
  );
}
