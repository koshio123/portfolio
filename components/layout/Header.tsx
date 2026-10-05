import Link from "next/link";
import { site } from "@/content/site";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/icons";
import { HeaderHeightVar } from "./HeaderHeightVar";
import { NavLinks } from "./NavLinks";

const iconButton =
  "inline-flex size-11 items-center justify-center rounded-md border border-line-strong text-ink hover:text-link";

/**
 * 全ページ共通のヘッダー。常に Night ゾーンで、画面上部に固定する。
 * モバイル:1段目に名前とアイコン、2段目にナビ。デスクトップ:1段。
 */
export function Header() {
  return (
    <header id="site-header" data-theme="night" className="sticky top-0 z-30 border-b border-line bg-bg text-ink">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 md:px-10 md:py-4">
        <Link href="/" className="font-mono text-lg font-medium text-ink no-underline hover:text-ink">
          {site.name}
        </Link>
        <nav
          aria-label="メイン"
          className="order-last flex w-full gap-x-5 text-sm md:order-none md:ml-auto md:w-auto md:gap-x-6"
        >
          <NavLinks />
        </nav>
        <div className="ml-auto flex gap-2 md:ml-0">
          <a href={site.links.github} aria-label="GitHub" className={iconButton}>
            <GitHubIcon />
          </a>
          <a href={site.links.linkedin} aria-label="LinkedIn" className={iconButton}>
            <LinkedInIcon />
          </a>
        </div>
      </div>
      <HeaderHeightVar />
    </header>
  );
}
