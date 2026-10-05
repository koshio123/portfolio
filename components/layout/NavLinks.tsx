"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/content/site";

/** 現在のページを aria-current で示すナビ項目 */
export function NavLinks() {
  const pathname = usePathname();
  return navItems.map(({ href, label }) => {
    const current = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        aria-current={current ? "page" : undefined}
        className={`no-underline ${current ? "text-link" : "text-ink-muted hover:text-ink"}`}
      >
        {label}
      </Link>
    );
  });
}
